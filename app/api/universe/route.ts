import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

function stringValue(...values: unknown[]) {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function numberValue(
  ...values: unknown[]
): number | null {
  for (const value of values) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function booleanValue(...values: unknown[]) {
  return values.some((value) => value === true);
}

export async function GET() {
  try {
    const [strategiesSnapshot, managersSnapshot] =
      await Promise.all([
        getDocs(
          collection(db, "managerStrategies")
        ),
        getDocs(collection(db, "managers")),
      ]);

    const managers = new Map(
      managersSnapshot.docs.map((document) => {
        const data = document.data();

        return [
          document.id,
          {
            uid: stringValue(
              data.uid,
              document.id
            ),
            identity: data.identity || {},
            reputation: data.reputation || {},
            brand: data.brand || {},
          },
        ];
      })
    );

    const rows = strategiesSnapshot.docs
      .map((document) => {
        const strategy = document.data();

        const managerUid = stringValue(
          strategy.manager?.uid,
          strategy.managerUid
        );

        const manager =
          managers.get(managerUid) || null;

        const strategyIdentity =
          strategy.identity || {};

        const managerIdentity =
          manager?.identity || {};

        const performance =
          strategy.performance || {};

        const runtime =
          strategy.runtime || {};

        const universe =
          strategy.universe || {};

        const scores =
          strategy.scores || {};

        const status =
          strategy.status || {};

        const name = stringValue(
          strategyIdentity.name,
          strategy.name,
          managerIdentity.displayName,
          strategy.manager?.displayName,
          "Bullions Firm"
        );

        const username = stringValue(
          managerIdentity.username,
          strategy.manager?.username
        );

        const roi =
          numberValue(
            performance.roi,
            strategy.roi,
            runtime.roi
          ) ?? 0;

        const allocatorScore = numberValue(
          strategy.allocatorScore,
          scores.allocatorScore,
          runtime.allocatorScore,
          manager?.reputation?.allocatorScore
        );

        const avatarUrl = stringValue(
          strategyIdentity.avatarUrl,
          managerIdentity.avatarUrl
        );

        const bannerUrl = stringValue(
          strategyIdentity.bannerUrl,
          managerIdentity.bannerUrl,
          avatarUrl
        );

        const runtimeGrade = stringValue(
          strategy.runtimeGrade,
          universe.grade,
          runtime.grade,
          "Runtime active"
        );

        const verified = booleanValue(
          status.verified,
          strategy.verified,
          manager?.reputation?.verified,
          strategy.mt5Verified,
          runtime.mt5Verified
        );

        const visibility = stringValue(
          status.visibility,
          strategy.visibility,
          "public"
        ).toLowerCase();

        return {
          id: stringValue(
            strategy.id,
            document.id
          ),
          strategyId: stringValue(
            strategy.id,
            document.id
          ),
          managerUid,
          username,
          name,
          subtitle: stringValue(
            strategyIdentity.subtitle,
            managerIdentity.tagline,
            strategy.subtitle,
            "Verified trading firm"
          ),
          avatarUrl,
          bannerUrl,
          roi,
          allocatorScore,
          runtimeGrade,
          verified,
          mt5Verified: verified,
          visibility,
          href: managerUid
            ? `/m/${encodeURIComponent(
                managerUid
              )}`
            : `/s/${encodeURIComponent(
                stringValue(
                  strategy.id,
                  document.id
                )
              )}`,
        };
      })
      .filter((row) => {
        return (
          row.strategyId &&
          row.visibility !== "private"
        );
      })
      .sort((a, b) => {
        const preferredNames = [
          "axbullions",
          "bullions",
        ];

        const aPreferred =
          preferredNames.indexOf(
            a.name.toLowerCase()
          );

        const bPreferred =
          preferredNames.indexOf(
            b.name.toLowerCase()
          );

        if (
          aPreferred !== -1 ||
          bPreferred !== -1
        ) {
          if (aPreferred === -1) return 1;
          if (bPreferred === -1) return -1;

          return aPreferred - bPreferred;
        }

        return b.roi - a.roi;
      });

    return NextResponse.json(
      {
        ok: true,
        count: rows.length,
        rows,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[api/universe] failed",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        count: 0,
        rows: [],
        error: "Unable to load universe",
      },
      { status: 500 }
    );
  }
}
