type Props = {
  content: string;
};

export function ResearchArticle({ content }: Props) {
  return (
    <article className="rounded-[34px] border border-white/10 bg-[#080909] p-8">
      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-white/70">
        {content}
      </div>
    </article>
  );
}
