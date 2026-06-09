import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const apiKey = body.apiKey;

    // 1. VALIDATION
    if (!email || !password || !apiKey) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    // 2. FIND API KEY → CLIENT ID
    const apiKeySnap = await adminDb.collection("apiKeys").doc(apiKey).get();

    if (!apiKeySnap.exists) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 404 });
    }

    const clientId = apiKeySnap.data()?.clientId;

    if (!clientId) {
      return NextResponse.json({ message: "Client not linked to API key" }, { status: 400 });
    }

    // 3. GET CLIENT
    const clientRef = adminDb.collection("clients").doc(clientId);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const clientData = clientSnap.data();

    // 4. CREATE OR GET FIREBASE AUTH USER (SAFE VERSION)
    let user;

    try {
      user = await adminAuth.getUserByEmail(email);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        user = await adminAuth.createUser({
          email,
          password,
        });
      } else {
        throw err;
      }
    }

    // 5. ENSURE UID MATCHES CLIENT
    if (!user?.uid) {
      throw new Error("Failed to create or retrieve user");
    }

    // 6. LINK AUTH USER → CLIENT (SOURCE OF TRUTH)
    await clientRef.update({
      authUid: user.uid,
      role: clientData?.role || "client",
      linkedAt: new Date(),
    });

    // 7. VERIFY LINK (IMPORTANT DEBUG SAFETY)
    const verify = await clientRef.get();
    if (verify.data()?.authUid !== user.uid) {
      throw new Error("Auth linking failed");
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error: any) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Signup failed",
      },
      { status: 500 },
    );
  }
}
