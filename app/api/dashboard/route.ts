import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/lib/security/apiAuth";

export async function GET(req: Request) {
  try {
    const client = await authenticateRequest(req);

    const snapshot = await adminDb
      .collection("transactions")
      .where("clientId", "==", client?.id)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
