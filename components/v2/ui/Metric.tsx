type MetricProps = {
  label: string;
  value: string;
  tone?: "success" | "purple" | "warning" | "neutral";
  className?: string;
};

export function Metric({ label, value, tone = "neutral", className = "" }: MetricProps) {
  const tones = {
    success: "text-[#b6ff00]",
    purple: "text-[#d8b4ff]",
    warning: "text-[#ffd23f]",
    neutral: "text-white",
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>
      <p className={`mt-2 truncate text-2xl font-black ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}
