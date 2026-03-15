import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function getClientConfig(clientId: string) {
  if (!clientId) throw new Error("Client ID required");

  const ref = doc(db, "client", clientId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Client not found");
  }

  const data = snap.data();

  if (!data.active) {
    throw new Error("Client inactive");
  }

  if (!data.mpesa) {
    throw new Error("MPesa configuration missing");
  }

  return {
    id: snap.id,
    ...data.mpesa,
  };
}
