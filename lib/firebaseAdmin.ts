import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountShape = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function loadServiceAccount(): ServiceAccountShape {
  const base64 =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;

  if (base64) {
    const decoded = Buffer.from(
      base64,
      "base64"
    ).toString("utf8");

    return JSON.parse(decoded);
  }

  const json =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (!json) {
    throw new Error(
      "Firebase Admin credentials are not configured"
    );
  }

  return JSON.parse(json);
}

export function getAdminApp(): App {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const serviceAccount = loadServiceAccount();

  if (
    !serviceAccount.project_id ||
    !serviceAccount.client_email ||
    !serviceAccount.private_key
  ) {
    throw new Error(
      "Firebase Admin credentials are incomplete"
    );
  }

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey:
        serviceAccount.private_key.replace(
          /\\n/g,
          "\n"
        ),
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
