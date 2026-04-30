import { NextResponse } from "next/server";
import { verifyMpesaSignature } from "@/lib/security/webhooks";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { calculateFee } from "@/lib/billing/fee";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-mpesa-signature") || "";

    const secret = process.env.MPESA_WEBHOOK_SECRET!;

    // 🔒 Verify signature (only in production)
    if (process.env.NODE_ENV === "production") {
      if (!verifyMpesaSignature(rawBody, signature, secret)) {
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    console.log("🔥 WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID, CallbackMetadata } = callback;

    // 🔎 Extract metadata safely
    let meta: any = {};

    if (CallbackMetadata?.Item?.length) {
      meta = CallbackMetadata.Item.reduce((acc: any, item: any) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});
    }

    const txRef = adminDb.collection("transactions").doc(CheckoutRequestID);
    const txSnap = await txRef.get();
    const existingTx = txSnap.data();

    const amount = meta.Amount || existingTx?.amount || 0;
    const phone = meta.PhoneNumber || null;
    const receipt = meta.MpesaReceiptNumber || null;

    const status = ResultCode === 0 ? "success" : "failed";

    // 📌 Get existing transaction

    if (!txSnap.exists) {
      console.warn("⚠️ Transaction not found:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // 🛑 Idempotency check (avoid double processing)
    if (existingTx?.status === "success" || existingTx?.status === "failed") {
      console.log("⚠️ Duplicate webhook ignored:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    // 💰 Calculate 1% fee ONLY on success
    const fee = status === "success" ? calculateFee(amount) : 0;

    console.log("Updating transaction:", CheckoutRequestID, { status, amount, fee });

    // ✅ Update transaction
    await txRef.set(
      {
        status,
        resultDesc: ResultDesc,
        receipt,
        amount,
        phone,
        fee,
        netAmount: amount - fee,
        completedAt: status === "success" ? new Date() : null,
      },
      { merge: true },
    );

    // Update client usage (ONLY on success)
    if (status === "success" && existingTx?.clientId) {
      const clientRef = adminDb.collection("clients").doc(existingTx.clientId);

      await clientRef.set(
        {
          usage: {
            totalFees: FieldValue.increment(fee),
            totalVolume: FieldValue.increment(amount),
            successfulTransactions: FieldValue.increment(1),
          },
        },
        { merge: true },
      );
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Webhook failed" });
  }
}
