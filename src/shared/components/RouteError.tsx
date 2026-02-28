/**
 * Error fallback shown when a route loader or component throws. Displays the error message with "Try again" and "Go home" buttons.
 * Uses: @/shared/components/Button
 * Exports: RouteError
 * Author: Haukur — example/scaffold, use as template
 */
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/shared/components/Button";

/**
 *
 */
export function RouteError({ error }: { error: unknown }) {
  const router = useRouter();
  const message =
    error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-6 py-8">
        <h1 className="text-lg font-semibold text-[var(--color-error)]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--color-error)]">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="danger" onClick={() => router.invalidate()}>
            Try again
          </Button>
          <Link to="/">
            <Button variant="ghost">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
