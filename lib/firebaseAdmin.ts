import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error("FIREBASE_ADMIN_SERVICE_ACCOUNT is not configured");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
