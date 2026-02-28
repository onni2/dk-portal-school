/**
 * Small pill component for displaying a status or label in one of several colour variants (default, success, warning, error, info).
 * Uses: @/shared/utils/cn
 * Exports: BadgeProps, Badge
 */
import { cn } from "@/shared/utils/cn";

const variantStyles = {
  default: "bg-[var(--color-background)] text-[var(--color-text-secondary)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
  info: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

/**
 *
 */
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
