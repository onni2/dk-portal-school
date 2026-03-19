/**
 * Profile dropdown in the header. Shows the user's name, kennitala, a language toggle, and a logout button.
 * Uses: @/shared/utils/cn, ../types/auth.types
 * Exports: ProfileDropdown
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import type { User } from "../types/auth.types";

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

/**
 *
 */
export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"IS" | "EN">("IS");
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

  const initial = user.name.charAt(0).toUpperCase();
  const firstName = user.name.split(" ")[0];

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        {/* Person icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-[var(--color-primary)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
        {firstName}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "h-3 w-3 transition-transform text-[var(--color-text-muted)]",
            open && "rotate-180",
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="p-4">
            {/* Avatar + name + kennitala */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {user.name}
                </p>
                {user.kennitala && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {user.kennitala}
                  </p>
                )}
              </div>
            </div>

            {/* Language selector */}
            <div className="mb-4">
              <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
                Velja annað tungumál
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLang("IS")}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-3 py-1 text-sm font-medium transition-colors",
                    lang === "IS"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  IS
                </button>
                <button
                  onClick={() => setLang("EN")}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-3 py-1 text-sm font-medium transition-colors",
                    lang === "EN"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Útskrá
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
