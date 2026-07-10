import { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: Props) {
  return (
    <section className="rounded-[36px] border border-white/10 bg-[#080909] p-10">

      {eyebrow && (
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/55">
          {subtitle}
        </p>
      )}

      <div className="mt-8">
        {children}
      </div>

    </section>
  );
}
