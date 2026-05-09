import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🔥 C2B VALIDATION:", body);

    // 🔥 LOG WEBHOOK
    await adminDb.collection("webhookLogs").add({
      type: "c2b-validation",
      rawBody: body,
      processed: true,
      createdAt: new Date(),
    });

    // Accept transaction
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    console.error("Validation error:", error);

    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Validation failed",
    });
  }
}
