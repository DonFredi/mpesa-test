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

    //  Verify signature (production only)
    if (process.env.NODE_ENV === "production") {
      if (!verifyMpesaSignature(rawBody, signature, secret)) {
        console.warn("Invalid webhook signature");
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    console.log(" WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      console.warn("Missing stkCallback");
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID, CallbackMetadata } = callback;

    // Extract metadata safely
    let meta: Record<string, any> = {};

    if (Array.isArray(CallbackMetadata?.Item)) {
      for (const item of CallbackMetadata.Item) {
        if (item?.Name) {
          meta[item.Name] = item.Value ?? null;
        }
      }
    }

    const txRef = adminDb.collection("transactions").doc(CheckoutRequestID);
    const txSnap = await txRef.get();

    if (!txSnap.exists) {
      console.warn("Transaction not found:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const existingTx = txSnap.data();

    // Idempotency (prevent double processing)
    if (["success", "failed"].includes(existingTx?.status)) {
      console.log("Duplicate webhook ignored:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    //  Normalize values
    const amount = typeof meta.Amount === "number" ? meta.Amount : existingTx?.amount || 0;

    const phone = meta.PhoneNumber || existingTx?.phone || null;
    const receipt = meta.MpesaReceiptNumber || null;

    const status = ResultCode === 0 ? "success" : "failed";

    //  Fee calculation (ONLY on success)
    const fee = status === "success" ? calculateFee(amount) : 0;
    const netAmount = amount - fee;

    console.log(" Processing transaction:", {
      CheckoutRequestID,
      status,
      amount,
      fee,
      clientId: existingTx?.clientId,
    });

    // Update transaction
    await txRef.set(
      {
        status,
        resultDesc: ResultDesc,
        receipt,
        amount,
        phone,
        fee,
        netAmount,
        completedAt: status === "success" ? new Date() : null,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    // Update client usage ONLY if success
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
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Webhook failed" });
  }
}
