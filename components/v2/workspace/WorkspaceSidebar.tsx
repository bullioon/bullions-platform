"use client";

type WorkspaceSection =
  | "overview"
  | "profile"
  | "research"
  | "products"
  | "performance"
  | "challenge"
  | "revenue"
  | "settings";

type Props = {
  active: WorkspaceSection;
  onChange: (section: WorkspaceSection) => void;
};

const items: { id: WorkspaceSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Public Profile" },
  { id: "research", label: "Research" },
  { id: "products", label: "Products" },
  { id: "performance", label: "Performance" },
  { id: "challenge", label: "Weekly Challenge" },
  { id: "revenue", label: "Revenue" },
  { id: "settings", label: "Settings" },
];

export function WorkspaceSidebar({ active, onChange }: Props) {
  return (
    <aside className="rounded-[28px] border border-white/10 bg-[#080909] p-4">
      <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
        Strategy Workspace
      </p>

      <div className="mt-3 grid gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={
              active === item.id
                ? "rounded-2xl bg-[#b6ff00] px-4 py-3 text-left text-sm font-black text-black"
                : "rounded-2xl px-4 py-3 text-left text-sm font-black text-white/45 transition hover:bg-white/[0.04] hover:text-white"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
