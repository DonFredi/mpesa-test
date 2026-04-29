import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  const snapShot = await adminDb.collection("clients").get();
  const batch = adminDb.batch();
  snapShot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      transactionCount: 0,
      lastReset: new Date(),
    });
  });
  await batch.commit();
  return NextResponse.json({ message: "Usage reset" });
}
