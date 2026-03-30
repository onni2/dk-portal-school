/**
 * Notification bell in the header. Shows a dropdown with notifications — empty state for now, ready to be wired up later.
 * Uses: @/shared/utils/cn
 * Exports: NotificationBell
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";

/**
 *
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    /**
     *
     */
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "rounded-[var(--radius-lg)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
          open && "bg-[var(--color-surface-hover)] text-[var(--color-text)]",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
            "absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg transition-all duration-200 ease-in-out",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-text)]">Tilkynningar</p>
          </div>
          {/* Empty state — wire up notifications here later */}
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Engar tilkynningar</p>
          </div>
        </div>
    </div>
  );
}