import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// 🔥 DO NOT SHARE WITH CLIENT SDK
const adminApp =
  getApps().find((app) => app.name === "admin-app") ||
  initializeApp(
    {
      credential: cert(serviceAccount as any),
    },
    "admin-app",
  );

// exports
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
