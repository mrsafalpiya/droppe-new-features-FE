import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge("bg-white p-4 drop-shadow", className)}>
      {children}
    </div>
  );
}
