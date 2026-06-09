import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { uid, role } = body;

    await adminDb.collection("users").doc(uid).update({
      role,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
