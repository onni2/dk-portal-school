/**
 * Text input with an optional label above and an optional error message below.
 * Uses: @/shared/utils/cn
 * Exports: InputProps, Input
 */
import { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Text input with optional label and error text. Forwards the ref for form library compatibility. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId =
      id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-(--color-text-secondary)"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[var(--radius-md)] border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)",
            error &&
              "border-(--color-error) focus:border-(--color-error) focus:ring-(--color-error)",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-(--color-error)">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
