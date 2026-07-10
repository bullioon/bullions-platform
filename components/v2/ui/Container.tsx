import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Container({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`mx-auto w-full max-w-[1600px] px-6 ${className}`}
    >
      {children}
    </div>
  );
}
