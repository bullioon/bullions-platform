type Props = {
  name: string;
  subtitle: string;
  description: string;
  onNameChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function StepIdentity({
  name,
  subtitle,
  description,
  onNameChange,
  onSubtitleChange,
  onDescriptionChange,
}: Props) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
        Identity
      </p>

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-black text-white/60">Strategy Name</span>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ghost Alpha"
            className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#b66dff]/40"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-white/60">Subtitle</span>
          <input
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Institutional Momentum Strategy"
            className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#b66dff]/40"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-white/60">Description</span>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the strategy, execution style and investor profile."
            rows={5}
            className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm font-semibold leading-7 text-white outline-none placeholder:text-white/25 focus:border-[#b66dff]/40"
          />
        </label>
      </div>
    </section>
  );
}
