"use client";

import { managerTemplate } from "@/core/v2/templates/managerTemplate";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";
import { managerSectionRegistry } from "@/components/v2/manager-profile/sections";

export function ManagerLayout({ profile }: { profile: ManagerProfile }) {
  return (
    <>
      {managerTemplate.map((id) => {
        const section = managerSectionRegistry[id];

        if (!section) return null;

        return (
          <div key={id} className={id === "hero" ? "" : "mt-8"}>
            {section.render(profile)}
          </div>
        );
      })}
    </>
  );
}
