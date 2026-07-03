import {
  addDoc,
  collection,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  RevenueBreakdown,
  WithdrawalEvent,
} from "@/types/v2/domain/revenue";

const COLLECTION="revenueHistory";

export const RevenueRepository={

async record(

withdrawal:WithdrawalEvent,

breakdown:RevenueBreakdown

){

await addDoc(

collection(db,COLLECTION),

{

...withdrawal,

...breakdown,

createdAt:Date.now(),

}

);

}

}
