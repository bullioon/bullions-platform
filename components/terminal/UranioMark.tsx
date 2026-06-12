export function UranioMark() {
  return (
    <div className="relative h-20 w-20 shrink-0">
      <div className="absolute inset-0 rounded-full bg-[#b6ff00]/10 blur-2xl" />

      {/* núcleo */}
      <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_35px_rgba(182,255,0,0.85)]" />

      {/* órbita 1 */}
      <div className="absolute inset-1 animate-spin rounded-full border border-[#b6ff00]/20">
        <span className="absolute left-1/2 top-[-5px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#b6ff00]" />
      </div>

      {/* órbita 2 */}
      <div className="absolute inset-4 animate-[spin_8s_linear_infinite_reverse] rounded-full border border-dashed border-[#b6ff00]/25">
        <span className="absolute right-[-4px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/80" />
      </div>

      {/* órbita 3 */}
      <div className="absolute inset-7 animate-[spin_4s_linear_infinite] rounded-full border border-[#b6ff00]/15">
        <span className="absolute bottom-[-4px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#b6ff00]/90" />
      </div>
    </div>
  );
}
