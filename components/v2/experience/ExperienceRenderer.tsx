"use client";

import { ReactNode } from "react";

export interface ExperienceRegistryItem<T> {
  id: string;
  enabled?: boolean;
  visible?: (data: T) => boolean;
  render: (data: T) => ReactNode;
}

type Props<T> = {
  template: string[];
  registry: Record<string, ExperienceRegistryItem<T>>;
  data: T;
};

export function ExperienceRenderer<T>({
  template,
  registry,
  data,
}: Props<T>) {
  return (
    <>
      {template.map((id) => {
        const item = registry[id];

        if (!item) return null;

        if (item.enabled === false) return null;

        if (item.visible && !item.visible(data)) return null;

        return (
          <div key={id} className={id === "hero" ? "" : "mt-8"}>
            {item.render(data)}
          </div>
        );
      })}
    </>
  );
}
