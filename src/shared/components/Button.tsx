/**
 * Reusable button component with primary, secondary, ghost, and danger variants, plus small/medium/large size options.
 * Uses: @/shared/utils/cn
 * Exports: ButtonProps, Button
 */
import { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

const variantStyles = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  secondary:
    "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
  ghost:
    "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
  danger:
    "bg-[var(--color-error)] text-white hover:opacity-90",
} as const;

const sizeStyles = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

/**
 *
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-[var(--radius-md)] font-medium transition-colors disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
