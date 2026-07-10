import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const styles = {
    primary:
      "bg-[#b6ff00] text-black hover:scale-[1.02] hover:brightness-105",

    secondary:
      "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",

    ghost:
      "text-white/55 hover:text-white",
  };

  return (
    <button
      {...props}
      className={`
        inline-flex
        h-12
        items-center
        justify-center
        rounded-2xl
        px-6
        text-sm
        font-black
        uppercase
        tracking-[0.16em]
        transition
        duration-200
        ${styles[variant]}
        ${className}
      `}
    />
  );
}
