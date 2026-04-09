import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateApiKey } from "@/lib/security/crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { businessName, email, phone, type, shortcode, accountNumber, plan } = body;

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
      shortcode,
      accountNumber: accountNumber || null,
      plan: plan || {
        name: "starter",
        maxRequestsPerMonth: 1000,
      },
      createdAt: new Date(),
    });

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
