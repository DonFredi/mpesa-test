import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/security/apiAuth";
import { mpesaTransactionRouter } from "@/lib/mpesa/transaction";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const client = await authenticateRequest(req);
    const mpesa = client?.mpesa;

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      throw new Error("Client M-Pesa credentials missing");
    }

    const body = await req.json();
    const { transactionType } = body;

    if (!transactionType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const response = await mpesaTransactionRouter(body, mpesa);
    console.log("Safaricom response:", response);
    if (response?.CheckoutRequestID) {
      await adminDb
        .collection("transactions")
        .doc(response.CheckoutRequestID)
        .set({
          status: "pending",
          amount: body.amount || null,
          phone: body.phone || body.receiverPhone || null,
          transactionType,
          merchantRequestId: response.MerchantRequestID || null,
          createdAt: new Date(),
        });
    } else {
      console.error("Missing CheckoutRequestID in Safaricom response");
      throw new Error("Missing checkoutRequestId from Safaricom.");
    }

    return NextResponse.json({
      checkoutRequestId: response.CheckoutRequestID,
    });
  } catch (error: any) {
    console.error("M-Pesa transaction error:", error);
    console.error("FULL-ERROR:", error.response?.data);
    return NextResponse.json({ message: error.message || "M-Pesa transaction failed" }, { status: 500 });
  }
}
