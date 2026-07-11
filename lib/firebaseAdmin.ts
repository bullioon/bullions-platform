import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function getAdminApp(): App {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const serviceAccountJson =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_ADMIN_SERVICE_ACCOUNT is not configured"
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
