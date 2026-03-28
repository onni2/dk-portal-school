/**
 * 404 page shown when a route does not exist. Has a "Go home" link.
 * Uses: @/shared/components/Button
 * Exports: NotFound
 * Author: Haukur — example/scaffold, use as template
 */
import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/Button";

/**
 *
 */
export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-[var(--color-text-muted)]">404</h1>
      <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
