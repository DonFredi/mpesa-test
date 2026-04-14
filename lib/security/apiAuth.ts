import { doc, getDoc } from "firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { decrypt } from "./encryption";

export async function authenticateRequest(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    console.log("⚠️ Test mode request (no API key)");

    return {
      mpesa: {
        consumerKey: process.env.MPESA_CONSUMER_KEY,
        consumerSecret: process.env.MPESA_CONSUMER_SECRET,
        shortcode: "174379",
        passkey: process.env.MPESA_PASSKEY,
      },
      environment: "sandbox",
    };
  }

  const snap = await adminDb.collection("apiKeys").doc(apiKey).get();

  if (!snap.exists) throw new Error("Invalid API Key");

  const { clientId } = snap.data()!;

  const clientSnap = await adminDb.collection("clients").doc(clientId).get();

  if (!clientSnap.exists) throw new Error("Client not found");

  return clientSnap.data();
}
