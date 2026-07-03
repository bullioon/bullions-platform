type StatRowProps = {
  label: string;
  value: string;
  tone?: "success" | "purple" | "warning" | "neutral";
};

export function StatRow({ label, value, tone = "neutral" }: StatRowProps) {
  const tones = {
    success: "text-[#b6ff00]",
    purple: "text-[#d8b4ff]",
    warning: "text-[#ffd23f]",
    neutral: "text-white",
  };

  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/8 py-3 last:border-b-0">
      <span className="text-sm text-white/35">{label}</span>
      <span className={`text-right text-sm font-black ${tones[tone]}`}>{value}</span>
    </div>
  );
}
