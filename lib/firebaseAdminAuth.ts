import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebaseAdmin";

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
