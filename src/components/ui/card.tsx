import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4",
        hoverable && "hover:bg-surface-light active:scale-[0.99] transition-all duration-150 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
