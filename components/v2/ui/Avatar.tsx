type Props = {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  tone?: "green" | "purple" | "neutral";
  className?: string;
};

export function Avatar({
  src,
  name,
  size = "md",
  shape = "rounded",
  tone = "green",
  className = "",
}: Props) {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-xl",
    lg: "h-24 w-24 text-4xl",
    xl: "h-32 w-32 text-5xl",
  };

  const shapes = {
    circle: "rounded-full",
    rounded: "rounded-[28px]",
  };

  const tones = {
    green: "border-[#b6ff00]/60 text-[#b6ff00]",
    purple: "border-[#b66dff]/60 text-[#d8b4ff]",
    neutral: "border-white/20 text-white",
  };

  return (
    <div
      className={`
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        border
        bg-black
        font-black
        ${tones[tone]}
        ${sizes[size]}
        ${shapes[shape]}
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </div>
  );
}
