type AvatarProps = {
  name: string;
  size?: "md" | "lg" | "xl";
  tone?: "purple" | "success" | "neutral";
};

export function Avatar({ name, size = "lg", tone = "purple" }: AvatarProps) {
  const sizes = {
    md: "h-14 w-14 text-xl",
    lg: "h-24 w-24 text-4xl",
    xl: "h-32 w-32 text-5xl",
  };

  const tones = {
    purple: "border-[#b66dff]/40 bg-[#b66dff]/10 text-[#d8b4ff]",
    success: "border-[#b6ff00]/35 bg-[#b6ff00]/10 text-[#b6ff00]",
    neutral: "border-white/10 bg-white/[0.035] text-white/70",
  };

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full border-2 font-black ${sizes[size]} ${tones[tone]}`}>
      {name.slice(0, 1)}
    </div>
  );
}
