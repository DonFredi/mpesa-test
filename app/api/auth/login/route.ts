import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ message: "Missing uid" }, { status: 400 });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const uid = decodedToken.uid;

    // Find client profile
    const snapshot = await adminDb.collection("clients").where("authUid", "==", uid).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const clientDoc = snapshot.docs[0];
    const client = clientDoc.data();

    return NextResponse.json({
      role: client.role ?? "client",
      clientId: clientDoc.id,
      //   onboardingCompleted: client.onboardingCompleted ?? false,
      businessName: client.businessName ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
