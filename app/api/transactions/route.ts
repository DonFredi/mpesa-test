import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/security/apiAuth";
import { mpesaTransactionRouter } from "@/lib/mpesa/transaction";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { calculateFee } from "@/lib/billing/fee";

export async function POST(req: Request) {
  try {
    let client;
    let isTestMode = false;

    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      //TEST MODE
      isTestMode = true;

      console.log("Test mode request (no API key)");

      client = {
        id: "test-mode",
        mpesa: {
          consumerKey: process.env.MPESA_SANDBOX_CONSUMER_KEY!,
          consumerSecret: process.env.MPESA_SANDBOX_CONSUMER_SECRET!,
          shortcode: 174379,
          passkey: process.env.MPESA_SANDBOX_PASSKEY!,
          environment: "sandbox",
          callbackUrl: `${process.env.BASE_URL}/api/webhooks`,
        },
      };
    } else {
      // CLIENT MODE
      client = await authenticateRequest(req);
    }

    if (!client?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = client.id;
    const clientRef = adminDb.collection("clients").doc(clientId);
    if (!isTestMode) {
      // rate limit
      const allowed = checkRateLimit(client.id);
      if (!allowed) {
        return NextResponse.json({ message: "Too many requests" }, { status: 429 });
      }

      // monthly limit
      const usage = client?.usage || {};
      if (usage.transactionCount && client.monthlyLimit && usage.transactionCount >= client.monthlyLimit) {
        return NextResponse.json({ message: "Monthly limit reached" }, { status: 429 });
      }
    }
    // M-PESA CONFIG
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
    const fee = calculateFee(amount || 0);
    //  SAVE TRANSACTION
    await adminDb
      .collection("transactions")
      .doc(checkoutId)
      .set({
        status: "pending",
        amount: amount || null,
        fee,
        phone: body.phone || body.receiverPhone || null,
        transactionType,
        merchantRequestId: response.MerchantRequestID || null,
        clientId: isTestMode ? null : client.id,
        isTest: isTestMode,
        createdAt: new Date(),
      });

    // UPDATE USAGE ONLY AFTER SUCCESS

    if (!isTestMode) {
      const currentMonth = new Date().toISOString().slice(0, 7);

      await adminDb
        .collection("clients")
        .doc(client.id)
        .set(
          {
            usage: {
              month: currentMonth,
              transactionCount: FieldValue.increment(1),
              totalVolume: FieldValue.increment(amount || 0),
            },
          },
          { merge: true },
        );
    }

    return NextResponse.json({
      checkoutRequestId: checkoutId,
    });
  } catch (error: any) {
    console.error("M-Pesa transaction error:", error);
    console.error("FULL-ERROR:", error.response?.data);

    return NextResponse.json({ message: error.message || "M-Pesa transaction failed" }, { status: 500 });
  }
}
