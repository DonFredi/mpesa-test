import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateApiKey } from "@/lib/security/crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { businessName, email, phone, type, shortcode, accountNumber, consumerKey, consumerSecret, passkey } = body;

    // VALIDATION FIRST
    if (!businessName || !email || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return NextResponse.json({ message: "Missing M-Pesa credentials" }, { status: 400 });
    }

    //  API KEY
    const apiKey = generateApiKey();

    //  SAFE MPESA OBJECT
    const mpesaConfig = {
      consumerKey,
      consumerSecret,
      passkey,
      shortcode,
      //   environment: environment || "sandbox",
      //   callbackUrl: `${process.env.BASE_URL}/api/webhooks`,
    };

    // CREATE CLIENT
    const clientRef = await adminDb.collection("clients").add({
      businessName,
      email,
      phone,
      type,
      accountNumber: accountNumber || null,

      mpesa: mpesaConfig,

      usage: {
        transactionCount: 0,
        totalVolume: 0,
        totalFees: 0,
      },

      createdAt: new Date(),
    });

    //  API KEY MAP
    await adminDb.collection("apiKeys").doc(apiKey).set({
      clientId: clientRef.id,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Client created successfully",
      apiKey,
    });
  } catch (error) {
    console.error("Onboarding error:", error);

    return NextResponse.json({ message: "Failed to onboard client" }, { status: 500 });
  }
}
