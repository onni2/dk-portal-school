/**
 * Company selector dropdown in the header. Shows the user's companies from the auth store.
 * Single company = plain text. Multiple companies = searchable dropdown.
 * Uses: @/shared/utils/cn, @/features/auth/store/auth.store, ../api/company.api
 * Exports: CompanySelector
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { switchCompany } from "../api/company.api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

/**
 *
 */
export function CompanySelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const companies = useAuthStore((s) => s.companies);
  const user = useAuthStore((s) => s.user);
  const setToken = useAuthStore((s) => s.setToken);
  const setActiveCompany = useAuthStore((s) => s.setActiveCompany);

  const activeCompany = companies.find((c) => c.id === user?.companyId)
    ?? companies[0]
    ?? null;

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

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleSwitch(companyId: string) {
    if (companyId === activeCompany?.id) { setOpen(false); return; }
    setSwitching(true);
    setSwitchError("");
    try {
      const { token, companyDkToken, permissions } = await switchCompany(companyId);
      setToken(token);
      if (companyDkToken) {
        localStorage.setItem("dk-company-token", companyDkToken);
      } else {
        localStorage.removeItem("dk-company-token");
      }
      setActiveCompany(companyId, permissions ?? undefined);
      setOpen(false);
      await queryClient.invalidateQueries();
      await router.invalidate();
    } catch (err) {
      setSwitchError((err as { message?: string })?.message ?? "Ekki tókst að skipta um fyrirtæki");
    } finally {
      setSwitching(false);
    }
  }

  // Single company — just show the name, no dropdown
  if (companies.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm font-medium text-[var(--color-text)]">
        {activeCompany?.name ?? "—"}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        {switching ? "Hleður..." : activeCompany?.name ?? "—"}
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
      <div
        className={cn(
          "absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg transition-all duration-200 ease-in-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        {/* Search */}
        <div className="border-b border-[var(--color-border)] p-2">
          <input
            autoFocus
            type="text"
            placeholder="Leita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-md)] bg-[var(--color-background)] px-3 py-1.5 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        {/* Error */}
        {switchError && (
          <p className="border-b border-[var(--color-border)] px-4 py-2 text-xs text-red-600">
            {switchError}
          </p>
        )}

        {/* List */}
        <div className="max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSwitch(company.id)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--color-surface-hover)]",
                  company.id === activeCompany?.id
                    ? "font-medium text-[var(--color-primary)]"
                    : "text-[var(--color-text)]",
                )}
              >
                {company.name}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--color-text-muted)]">Ekkert fannst</p>
          )}
        </div>
      </div>
    </div>
  );
}