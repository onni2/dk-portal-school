/**
 * Reusable button component with primary, secondary, ghost, and danger variants, plus small/medium/large size options.
 * Uses: @/shared/utils/cn
 * Exports: ButtonProps, Button
 */
import { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

const variantStyles = {
  primary:
    "bg-(--color-primary) text-white hover:bg-(--color-primary-hover) hover:shadow-md active:scale-[0.97] active:shadow-none",
  secondary:
    "border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white active:scale-[0.97]",
  ghost:
    "border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text) hover:border-(--color-text-secondary) active:scale-[0.97]",
  danger: "bg-(--color-error) text-white hover:opacity-90 hover:shadow-md active:scale-[0.97] active:shadow-none",
} as const;

const sizeStyles = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

/** Styled button. Forwards the ref so it can be composed inside dialogs and form libraries. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "cursor-pointer rounded-[var(--radius-md)] font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
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
