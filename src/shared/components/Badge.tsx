/**
 * Small pill component for displaying a status or label in one of several colour variants (default, success, warning, error, info).
 * Uses: @/shared/utils/cn
 * Exports: BadgeProps, Badge
 */
import { cn } from "@/shared/utils/cn";

const variantStyles = {
  default: "bg-(--color-background) text-(--color-text-secondary)",
  success: "bg-(--color-success-bg) text-(--color-success)",
  warning: "bg-(--color-warning-bg) text-(--color-warning)",
  error: "bg-(--color-error-bg) text-(--color-error)",
  info: "bg-(--color-primary-light) text-(--color-primary)",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

/** Renders a small pill with the chosen colour variant. Defaults to "default" (neutral). */
export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
