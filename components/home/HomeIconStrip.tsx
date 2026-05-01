export function HomeIconStrip() {
  const icons = [
    { icon: "💀", label: "Risk radar" },
    { icon: "◎", label: "Copy engine" },
    { icon: "✹", label: "Verified traders" },
    { icon: "◒", label: "Funding path" },
  ];

  return (
    <section className="mx-auto mt-10 flex w-full max-w-[760px] justify-center gap-5">
      {icons.map((item) => (
        <div
          key={item.label}
          className="group grid h-[78px] w-[78px] place-items-center rounded-[24px] border border-white/[0.08] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#b6ff00]/25 hover:bg-[#b6ff00]/10"
        >
          <span className="text-3xl transition group-hover:scale-110">
            {item.icon}
          </span>
        </div>
      ))}
    </section>
  );
}
