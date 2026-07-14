type Props = {
  managerName: string;
};

export function GalleryEmpty({ managerName }: Props) {
  return (
    <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.06),transparent_34%)]" />

      <div className="relative max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-white/10 bg-white/[0.035] text-2xl text-white/25">
          ◫
        </div>

        <h3 className="mt-6 text-2xl font-black tracking-[-0.04em] text-white">
          Gallery coming soon
        </h3>

        <p className="mt-3 text-sm leading-7 text-white/35">
          {managerName} has not published visual context yet. Trading desk,
          research process, events and professional milestones will appear here.
        </p>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#b6ff00]/55">
          Visual proof · Manager context
        </p>
      </div>
    </div>
  );
}
