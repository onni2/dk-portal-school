/**
 * Centered spinning circle used as the Suspense fallback while data is loading.
 * Uses: @/shared/utils/cn
 * Exports: LoadingSpinner
 * Author: Haukur — example/scaffold, use as template
 */
import { cn } from "@/shared/utils/cn";

/**
 *
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
    </div>
  );
}
