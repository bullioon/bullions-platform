type Props = {
  title: string;
  summary: string;
  market: string;
  author: string;
  published: string;
};

export function ResearchHero({
  title,
  summary,
  market,
  author,
  published,
}: Props) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080909] p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d8b4ff]">
        {market}
      </p>

      <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-white">
        {title}
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">
        {summary}
      </p>

      <div className="mt-8 flex gap-6 text-sm text-white/35">
        <span>{author}</span>
        <span>{published}</span>
      </div>
    </section>
  );
}
