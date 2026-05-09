import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { calculateFee } from "@/lib/billing/fee";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("C2B CONFIRMATION:", body);

    /*
      Example payload:
      {
        TransID,
        TransAmount,
        MSISDN,
        BillRefNumber,
        BusinessShortCode
      }
    */

    const amount = Number(body.TransAmount || 0);

    const fee = calculateFee(amount);

    // FIND CLIENT USING SHORTCODE
    const clientSnap = await adminDb
      .collection("clients")
      .where("shortcode", "==", body.BusinessShortCode)
      .limit(1)
      .get();

    const clientDoc = clientSnap.docs[0];

    const clientId = clientDoc?.id || null;

    //  SAVE TRANSACTION
    await adminDb
      .collection("transactions")
      .doc(body.TransID)
      .set({
        clientId,

        transactionType: "c2b",

        status: "success",

        amount,

        fee,

        netAmount: amount - fee,

        phone: body.MSISDN,

        receipt: body.TransID,

        accountReference: body.BillRefNumber || null,

        shortcode: body.BusinessShortCode,

        createdAt: new Date(),
        completedAt: new Date(),
      });

    // UPDATE CLIENT USAGE
    if (clientId) {
      await adminDb
        .collection("clients")
        .doc(clientId)
        .set(
          {
            usage: {
              successfulTransactions: FieldValue.increment(1),

              totalVolume: FieldValue.increment(amount),

              totalFees: FieldValue.increment(fee),
            },
          },
          { merge: true },
        );
    }

    //  LOG WEBHOOK
    await adminDb.collection("webhookLogs").add({
      type: "c2b-confirmation",

      rawBody: body,

      transactionId: body.TransID,

      clientId,

      processed: true,

      createdAt: new Date(),
    });

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    console.error("C2B confirmation error:", error);

    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Failed",
    });
  }
}
