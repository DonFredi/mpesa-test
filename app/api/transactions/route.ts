import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/security/apiAuth";
import { mpesaTransactionRouter } from "@/lib/mpesa/transaction";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { calculateFee } from "@/lib/billing/fee";

const allowedOrigins = ["http://localhost:3000", "https://your-production-domain.com"];

// Helper: build CORS headers per request
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";

  const finalOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": finalOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
}

// OPTIONS (preflight)
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

// POST
export async function POST(req: Request) {
  try {
    const corsHeaders = getCorsHeaders(req);

    let client;
    let isTestMode = false;

    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
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
          callbackUrl: `${process.env.BASE_URL}/api/webhook`,
        },
      };
    } else {
      client = await authenticateRequest(req);
    }

    if (!client?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    // Rate limit (skip in test mode)
    if (!isTestMode) {
      const allowed = checkRateLimit(client.id);
      if (!allowed) {
        return NextResponse.json({ message: "Too many requests" }, { status: 429, headers: corsHeaders });
      }

      const usage = client?.usage || {};
      if (usage.transactionCount && client.monthlyLimit && usage.transactionCount >= client.monthlyLimit) {
        return NextResponse.json({ message: "Monthly limit reached" }, { status: 429, headers: corsHeaders });
      }
    }

    const mpesa = client?.mpesa;

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      return NextResponse.json({ message: "Client M-Pesa credentials missing" }, { status: 500, headers: corsHeaders });
    }

    const body = await req.json();
    const { transactionType, amount } = body;

    if (!transactionType) {
      return NextResponse.json({ message: "Missing transactionType" }, { status: 400, headers: corsHeaders });
    }

    // PROCESS M-PESA REQUEST
    const response = await mpesaTransactionRouter(body, mpesa);

    console.log("Safaricom response:", response);

    if (!response?.CheckoutRequestID) {
      throw new Error("Missing checkoutRequestId from Safaricom.");
    }

    const checkoutId = response.CheckoutRequestID;
    const fee = calculateFee(amount || 0);

    // SAVE TRANSACTION
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
        clientId: client.id || "Unknown",
        isTest: isTestMode,
        createdAt: new Date(),
      });

    // UPDATE USAGE
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

    return NextResponse.json({ checkoutRequestId: checkoutId }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("M-Pesa transaction error:", error);
    console.error("FULL-ERROR:", error.response?.data);

    const corsHeaders = getCorsHeaders(req);

    return NextResponse.json(
      { message: error.message || "M-Pesa transaction failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
