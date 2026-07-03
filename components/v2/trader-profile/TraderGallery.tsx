export function TraderGallery() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
        Inside the desk
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_40%),#111]"
          />
        ))}
      </div>
    </section>
  );
}
