import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/security/apiAuth";
import { mpesaTransactionRouter } from "@/lib/mpesa/transaction";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  try {
    const client = await authenticateRequest(req);
    const clientId = client?.id;

    const clientRef = adminDb.collection("clients").doc(clientId);

    // 🔥 1. CHECK MONTHLY LIMIT
    if (client?.transactionCount && client.monthlyLimit && client.transactionCount >= client.monthlyLimit) {
      return NextResponse.json({ message: "Monthly transaction limit reached" }, { status: 429 });
    }

    // ✅ Rate limit check
    const allowed = checkRateLimit(client?.id);

    if (!allowed) {
      return NextResponse.json({ message: "Too many requests. Slow down." }, { status: 429 });
    }

    // 🔥 3. PROCESS REQUEST
    const mpesa = client?.mpesa;

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      throw new Error("Client M-Pesa credentials missing");
    }

    const body = await req.json();
    const { transactionType } = body;
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"

    await clientRef.set(
      {
        usage: {
          month: currentMonth,
          transactionCount: FieldValue.increment(1),
          totalVolume: FieldValue.increment(body.amount || 0),
        },
      },
      { merge: true },
    );

    if (!transactionType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const response = await mpesaTransactionRouter(body, mpesa);

    console.log("Safaricom response:", response);

    if (!response?.CheckoutRequestID) {
      throw new Error("Missing checkoutRequestId from Safaricom.");
    }

    // 🔥 4. SAVE TRANSACTION
    await adminDb
      .collection("transactions")
      .doc(response.CheckoutRequestID)
      .set({
        status: "pending",
        amount: body.amount || null,
        phone: body.phone || body.receiverPhone || null,
        transactionType,
        merchantRequestId: response.MerchantRequestID || null,
        clientId: client?.id,
        createdAt: new Date(),
      });

    // 🔥 5. INCREMENT USAGE (ONLY AFTER SUCCESS)
    await clientRef.update({
      transactionCount: FieldValue.increment(1),
    });

    return NextResponse.json({
      checkoutRequestId: response.CheckoutRequestID,
    });
  } catch (error: any) {
    console.error("M-Pesa transaction error:", error);
    console.error("FULL-ERROR:", error.response?.data);

    return NextResponse.json({ message: error.message || "M-Pesa transaction failed" }, { status: 500 });
  }
}
