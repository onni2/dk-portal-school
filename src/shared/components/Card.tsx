/**
 * White surface card with a border, rounded corners, and configurable padding.
 * Uses: @/shared/utils/cn
 * Exports: CardProps, Card
 */
import { cn } from "@/shared/utils/cn";

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
} as const;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof paddingStyles;
}

/** Renders a surface card with configurable padding. Use `padding="none"` when the content manages its own spacing. */
export function Card({
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-sm)]",
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
