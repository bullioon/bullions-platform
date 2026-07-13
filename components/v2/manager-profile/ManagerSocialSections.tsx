import type { Manager } from "@/types/v2/domain/manager";

type ManagerProps = {
  manager: Manager;
};

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-xl text-white/25">
          ◫
        </div>

        <h3 className="mt-5 text-xl font-black text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/35">
          {body}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
        {description}
      </p>
    </div>
  );
}

function categoryLabel(category?: string) {
  const labels: Record<string, string> = {
    desk: "Trading Desk",
    research: "Research",
    process: "Process",
    markets: "Markets",
    event: "Events",
    lifestyle: "Manager Life",
  };

  return category ? labels[category] || "Manager Context" : "Manager Context";
}

export function ManagerGallerySection({
  manager,
}: ManagerProps) {
  const gallery = manager.social?.gallery ?? [];
  const links = manager.social?.links;

  const socialLinks = [
    ["X", links?.x],
    ["Instagram", links?.instagram],
    ["LinkedIn", links?.linkedin],
    ["YouTube", links?.youtube],
    ["Discord", links?.discord],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080909] p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Manager Gallery"
          title={`Inside ${manager.identity.displayName}`}
          description="Trading environment, professional milestones, research process and the human context behind the manager."
        />

        {socialLinks.length ? (
          <div className="flex flex-wrap gap-2 pb-6">
            {socialLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45 transition hover:border-[#b6ff00]/30 hover:text-[#b6ff00]"
              >
                {label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {gallery.length ? (
        <div className="grid gap-3 md:grid-cols-[1.25fr_0.75fr_0.75fr]">
          {gallery.slice(0, 5).map((item, index) => (
            <article
              key={item.id}
              className={`group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] ${
                index === 0
                  ? "h-[360px] md:row-span-2"
                  : "h-[176px]"
              }`}
            >
              <img
                src={item.url}
                alt={item.title || categoryLabel(item.category)}
                className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
                  {categoryLabel(item.category)}
                </p>

                {item.title ? (
                  <p className="mt-2 text-lg font-black text-white">
                    {item.title}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Gallery coming soon"
          body="This manager has not uploaded photos yet. Trading desk, events, research process and professional moments will appear here."
        />
      )}
    </section>
  );
}

export function ManagerJournalSection({
  manager,
}: ManagerProps) {
  const journal = [...(manager.social?.journal ?? [])].sort(
    (a, b) => b.publishedAt - a.publishedAt
  );

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080909] p-6 sm:p-8">
      <SectionHeader
        eyebrow="Manager Journal"
        title="Updates from the manager."
        description="Execution notes, market observations and direct updates from the person managing the strategies."
      />

      {journal.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {journal.map((item) => (
            <article
              key={item.id}
              className="rounded-[26px] border border-white/10 bg-white/[0.025] p-6"
            >
              <p className="text-base leading-8 text-white/65">
                {item.body}
              </p>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                {new Date(item.publishedAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No journal updates yet"
          body="Market observations, execution notes and strategy updates published by this manager will appear here."
        />
      )}
    </section>
  );
}

export function ManagerResearchSection({
  manager,
}: ManagerProps) {
  const research = [...(manager.social?.research ?? [])].sort(
    (a, b) => b.publishedAt - a.publishedAt
  );

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080909] p-6 sm:p-8">
      <SectionHeader
        eyebrow="Research"
        title="Ideas behind the execution."
        description="Market reports, investment theses and strategy research published by this manager."
      />

      {research.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {research.map((item) => {
            const content = (
              <>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                  Research
                </p>

                <h3 className="mt-4 text-xl font-black text-white">
                  {item.title}
                </h3>

                {item.summary ? (
                  <p className="mt-3 text-sm leading-7 text-white/40">
                    {item.summary}
                  </p>
                ) : null}

                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-white/25">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </p>
              </>
            );

            return item.url ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[26px] border border-white/10 bg-white/[0.025] p-6 transition hover:border-[#b6ff00]/25 hover:bg-[#b6ff00]/[0.025]"
              >
                {content}
              </a>
            ) : (
              <article
                key={item.id}
                className="rounded-[26px] border border-white/10 bg-white/[0.025] p-6"
              >
                {content}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No research published yet"
          body="Reports, investment theses, PDFs and market outlooks published by this manager will appear here."
        />
      )}
    </section>
  );
}
