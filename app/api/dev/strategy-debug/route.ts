import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  const snap = await getDocs(collection(db, "managerStrategies"));

  return NextResponse.json({
    strategies: snap.docs.map((d) => {
      const data = d.data() as any;

      return {
        id: d.id,
        name: data.identity?.name,
        managerUid: data.manager?.uid,
        roi: data.performance?.roi,
        winRate: data.performance?.winRate,
      };
    }),
  });
}
