/**
 * Profile dropdown in the header. Shows the user's name, kennitala, a language toggle, and a logout button.
 * Uses: @/shared/utils/cn, ../types/auth.types
 * Exports: ProfileDropdown
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useLangStore } from "@/shared/store/lang.store";
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
  const { lang, fontSize, setFontSize, highContrast, toggleHighContrast } = useLangStore();
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
          className="h-4 w-4 text-(--color-primary)"
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
            "h-3 w-3 transition-transform text-(--color-text-muted)",
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
        <div style={{ fontSize: "16px" }} className="absolute right-0 top-full z-50 mt-2 w-72 rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface) shadow-lg">
          <div className="p-4">
            {/* Avatar + name + kennitala */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-(--color-text)">
                  {user.name}
                </p>
                {user.kennitala && (
                  <p className="text-xs text-(--color-text-muted)">
                    {user.kennitala}
                  </p>
                )}
              </div>
            </div>

            {/* Accessibility */}
            <div className="mb-4">
              <p className="mb-2 text-xs text-(--color-text-secondary)">
                {lang === "EN" ? "Accessibility" : "Aðgengileiki"}
              </p>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-(--color-text-secondary)">{lang === "EN" ? "Text size" : "Stærð texta"}</span>
                <span className="text-xs font-medium text-(--color-primary)">{fontSize}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(100, fontSize - 10))}
                  disabled={fontSize <= 100}
                  className="icon-btn border border-(--color-border) text-(--color-text-secondary) font-bold disabled:opacity-30"
                >−</button>
                <input
                  type="range"
                  min={100}
                  max={150}
                  step={10}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 accent-[var(--color-primary)]"
                />
                <button
                  onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                  disabled={fontSize >= 150}
                  className="icon-btn border border-(--color-border) text-(--color-text-secondary) font-bold disabled:opacity-30"
                >+</button>
              </div>
              <button
                onClick={toggleHighContrast}
                className={cn(
                  "mt-2 flex w-full items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-sm font-medium transition-colors",
                  highContrast
                    ? "border-(--color-primary) bg-(--color-primary) text-white"
                    : "border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-surface-hover)",
                )}
              >
                <span>{lang === "EN" ? "High contrast" : "Hátt skerpa"}</span>
                <span className="text-xs">{highContrast ? (lang === "EN" ? "On" : "Virkt") : (lang === "EN" ? "Off" : "Óvirkt")}</span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full rounded-[var(--radius-md)] bg-(--color-primary) py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-primary-hover)"
            >
              {lang === "EN" ? "Log out" : "Útskrá"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
