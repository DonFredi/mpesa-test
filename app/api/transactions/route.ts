import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/security/apiAuth";
import { mpesaTransactionRouter } from "@/lib/mpesa/transaction";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  try {
    const client = await authenticateRequest(req);

    if (!client?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = client.id;
    const clientRef = adminDb.collection("clients").doc(clientId);

    // ✅ RATE LIMIT
    const allowed = checkRateLimit(clientId);
    if (!allowed) {
      return NextResponse.json({ message: "Too many requests. Slow down." }, { status: 429 });
    }

    // ✅ MONTHLY LIMIT (FIXED STRUCTURE)
    const usage = client?.usage || {};
    if (usage.transactionCount && client.monthlyLimit && usage.transactionCount >= client.monthlyLimit) {
      return NextResponse.json({ message: "Monthly transaction limit reached" }, { status: 429 });
    }

    // ✅ M-PESA CONFIG
    const mpesa = client?.mpesa;

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      throw new Error("Client M-Pesa credentials missing");
    }

    const body = await req.json();
    const { transactionType, amount } = body;

    if (!transactionType) {
      return NextResponse.json({ message: "Missing transactionType" }, { status: 400 });
    }

    // 🚀 PROCESS TRANSACTION
    const response = await mpesaTransactionRouter(body, mpesa);

    console.log("Safaricom response:", response);

    if (!response?.CheckoutRequestID) {
      throw new Error("Missing checkoutRequestId from Safaricom.");
    }

    const checkoutId = response.CheckoutRequestID;

    // ✅ SAVE TRANSACTION
    await adminDb
      .collection("transactions")
      .doc(checkoutId)
      .set({
        status: "pending",
        amount: amount || null,
        phone: body.phone || body.receiverPhone || null,
        transactionType,
        merchantRequestId: response.MerchantRequestID || null,
        clientId,
        createdAt: new Date(),
      });

    // ✅ UPDATE USAGE ONLY AFTER SUCCESS
    const currentMonth = new Date().toISOString().slice(0, 7);

    await clientRef.set(
      {
        usage: {
          month: currentMonth,
          transactionCount: FieldValue.increment(1),
          totalVolume: FieldValue.increment(amount || 0),
        },
      },
      { merge: true },
    );

    return NextResponse.json({
      checkoutRequestId: checkoutId,
    });
  } catch (error: any) {
    console.error("M-Pesa transaction error:", error);
    console.error("FULL-ERROR:", error.response?.data);

    return NextResponse.json({ message: error.message || "M-Pesa transaction failed" }, { status: 500 });
  }
}
