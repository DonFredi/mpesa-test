import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateApiKey } from "@/lib/security/crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      businessName,
      email,
      phone,
      type,
      shortcode,
      accountNumber,

      consumerKey,
      consumerSecret,
      passkey,
      environment,
      plan,
    } = body;

    // ✅ Basic validation
    if (!businessName || !email || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 🔑 Generate API key
    const apiKey = generateApiKey();

    // 🔥 1. Create client
    const clientRef = await adminDb.collection("clients").add({
      businessName,
      email,
      phone,
      type,
      accountNumber: accountNumber || null,
      mpesa: {
        consumerKey,
        consumerSecret,
        passkey,
        shortcode,
        environment: environment || "production",
        callbackUrl: `${process.env.BASE_URL}/api/webhooks`,
      },
      plan: plan || {
        name: "starter",
        maxRequestsPerMonth: 1000,
      },

      usage: {
        transactionCount: 0,
        totalVolume: 0,
        totalFees: 0,
      },

      createdAt: new Date(),
    });

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return NextResponse.json({ message: "Missing M-Pesa credentials" }, { status: 400 });
    }

    // 🔥 2. Store API key mapping
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
