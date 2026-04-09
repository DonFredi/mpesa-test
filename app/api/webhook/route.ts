import { NextResponse } from "next/server";
import { verifyMpesaSignature } from "@/lib/security/webhooks";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-mpesa-signature") || "";

    const secret = process.env.MPESA_WEBHOOK_SECRET!;

    if (process.env.NODE_ENV === "production") {
      if (!verifyMpesaSignature(rawBody, signature, secret)) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    console.log("MPESA CALLBACK FULL BODY:");
    console.log(JSON.stringify(body, null, 2));
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID, CallbackMetadata } = callback;

    let meta: any = {};

    if (CallbackMetadata?.Item?.length) {
      meta = CallbackMetadata.Item.reduce((acc: any, item: any) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});
    }

    await adminDb
      .collection("transactions")
      .doc(CheckoutRequestID)
      .set(
        {
          status: ResultCode === 0 ? "success" : "failed",
          resultDesc: ResultDesc,
          receipt: meta.MpesaReceiptNumber || null,
          amount: meta.Amount || null,
          phone:meta.phoneNumber || null,
          
        //   merchantRequestId: MerchantRequestID,
          completedAt: ResultCode === 0 ? new Date() : null,
        },
        { merge: true },
      );
    console.log("Writing tx", CheckoutRequestID);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Webhook failed" });
  }
}
