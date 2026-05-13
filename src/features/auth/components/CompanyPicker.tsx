/**
 * Full-page company picker shown after login when a user belongs to more than one company.
 * Elevated users (super_admin/god) get a search box; regular users see a plain list.
 * Uses: @/shared/utils/cn, ../store/auth.store, @/features/company/api/company.api
 * Exports: CompanyPicker
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { switchCompany } from "@/features/company/api/company.api";
import { useDashboardLayout } from "@/features/dashboard/store/dashboard.store";
import { cn } from "@/shared/utils/cn";

const LAST_COMPANY_KEY = "dk-last-company";

/** Sorts companies by most-recently-visited order stored in localStorage. */
function getLastVisitedOrder<T extends { id: string }>(companies: T[]): T[] {
  try {
    const raw = localStorage.getItem(LAST_COMPANY_KEY);
    if (!raw) return companies;
    const order: string[] = JSON.parse(raw);
    const indexed = new Map(order.map((id, i) => [id, i]));
    return [...companies].sort((a, b) => {
      const ai = indexed.get(a.id) ?? Infinity;
      const bi = indexed.get(b.id) ?? Infinity;
      return ai - bi;
    });
  } catch {
    return companies;
  }
}

/** Full-page company selection screen. Switches auth tokens and invalidates all queries on selection. */
export function CompanyPicker() {
  const { companies, user, setToken, setActiveCompany } = useAuthStore();
  const isElevated = user?.role === "super_admin" || user?.role === "god";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const ordered = getLastVisitedOrder(companies);
  const filtered = isElevated
    ? ordered.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : ordered;

  const switchMutation = useMutation({
    mutationFn: (companyId: string) => switchCompany(companyId),
    onSuccess: async ({ token, companyDkToken, permissions }, companyId) => {
      setToken(token);
      if (companyDkToken) {
        localStorage.setItem("dk-company-token", companyDkToken);
      } else {
        localStorage.removeItem("dk-company-token");
      }
      setActiveCompany(companyId, permissions);
      useDashboardLayout.getState().loadForCompany(companyId);

      try {
        const prev: string[] = JSON.parse(localStorage.getItem(LAST_COMPANY_KEY) ?? "[]");
        const updated = [companyId, ...prev.filter((id) => id !== companyId)]; // keep most-recent at top
        localStorage.setItem(LAST_COMPANY_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }

      await qc.invalidateQueries();
      navigate({ to: "/" });
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--color-brand-navy) px-4">
      <div className="w-full max-w-md rounded-2xl bg-(--color-surface) p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-(--color-text)">Veldu fyrirtæki</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          Hvaða fyrirtæki viltu skoða?
        </p>

        {isElevated && (
          <div className="mt-4">
            <input
              autoFocus
              type="text"
              placeholder="Leita að fyrirtæki..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>
        )}

        {switchMutation.isError && (
          <p className="mt-3 text-sm text-(--color-error)">
            {(switchMutation.error as { message?: string })?.message ?? "Ekki tókst að velja fyrirtæki"}
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-2 max-h-96 overflow-y-auto">
          {filtered.map((company) => (
            <li key={company.id}>
              <button
                onClick={() => switchMutation.mutate(company.id)}
                disabled={switchMutation.isPending}
                className={cn(
                  "w-full rounded-[var(--radius-md)] border border-(--color-border) px-4 py-3 text-left text-sm font-medium text-(--color-text) transition-colors hover:bg-(--color-surface-hover) disabled:opacity-60",
                  switchMutation.isPending && switchMutation.variables === company.id && "cursor-wait",
                )}
              >
                <span className="block">{company.name}</span>
                <span className="block text-xs font-normal text-(--color-text-secondary)">
                  {company.role === "admin" ? "Stjórnandi" : "Notandi"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
