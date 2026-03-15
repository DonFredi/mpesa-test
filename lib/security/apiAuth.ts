import { doc, getDoc } from "firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { decrypt } from "./encryption";

export async function authenticateRequest(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  console.log("HEADERS RECEIVED:", Object.fromEntries(req.headers.entries()));

  if (!apiKey) throw new Error("Missing API Key");

  const snap = await adminDb.collection("apiKeys").doc(apiKey).get();

  if (!snap.exists) throw new Error("Invalid API Key");

  const { clientId } = snap.data()!;

  const clientSnap = await adminDb.collection("client").doc(clientId).get();

  if (!clientSnap.exists) throw new Error("Client not found");

  return clientSnap.data();
}
