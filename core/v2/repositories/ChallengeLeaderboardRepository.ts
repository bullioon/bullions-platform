import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { ChallengeEntry } from "@/types/v2/domain/challenge";

const ENTRIES="challengeEntries";

export const ChallengeLeaderboardRepository={

async bySeason(seasonId:string){

const snapshot=await getDocs(
query(
collection(db,ENTRIES),
where("seasonId","==",seasonId)
)
);

return snapshot.docs.map(doc=>({

id:doc.id,

...doc.data()

})) as ChallengeEntry[];

}

}
