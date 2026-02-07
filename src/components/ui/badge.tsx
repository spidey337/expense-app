import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Badge({
  children,
  color,
  selected,
  onClick,
  className,
}: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
        "min-h-[32px]",
        onClick && "cursor-pointer active:scale-95",
        selected
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
          : "",
        className
      )}
      style={{
        backgroundColor: color ? `${color}20` : undefined,
        color: color || undefined,
      }}
    >
      {children}
    </span>
  );
}
