import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Date.now();

await setDoc(doc(db, "challengeSeasons", "season-01"), {
  name: "Season 01",
  status: "registration",
  entryFeeUsd: 49,
  prizePoolUsd: 25000,
  maxParticipants: 200,
  registrationClosesAt: now + 1000 * 60 * 60 * 18,
  startsAt: now + 1000 * 60 * 60 * 24,
  endsAt: now + 1000 * 60 * 60 * 24 * 7,
});

console.log("Season 01 seeded");
