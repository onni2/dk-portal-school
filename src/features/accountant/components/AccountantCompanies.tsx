/**
 * Accountant view — list of assigned client companies.
 * Shows company name, role, and a button to switch into that company's context.
 * Uses: @/shared/utils/cn, @/features/auth/store/auth.store, @/features/company/api/company.api
 * Exports: BokariCompanies
 */
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { switchCompany } from "@/features/company/api/company.api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 *
 */
export function AccountantCompanies() {
  const companies = useAuthStore((s) => s.companies);
  const user = useAuthStore((s) => s.user);
  const setToken = useAuthStore((s) => s.setToken);
  const setActiveCompany = useAuthStore((s) => s.setActiveCompany);
  const queryClient = useQueryClient();
  const [switching, setSwitching] = useState<string | null>(null);

  async function handleSwitch(companyId: string) {
    setSwitching(companyId);
    try {
      const { token } = await switchCompany(companyId);
      setToken(token);
      setActiveCompany(companyId);
      queryClient.invalidateQueries();
    } catch (err) {
      console.error("Failed to switch company", err);
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Fyrirtæki mín</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Yfirlit yfir öll fyrirtæki sem þú ert tengd/ur við
        </p>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Engin fyrirtæki tengd við þinn aðgang.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => {
            const isActive = company.id === (user?.companyId ?? companies[0]?.id);
            const enabledPermissions = Object.entries(company.permissions)
              .filter(([, v]) => v)
              .map(([k]) => k);

            return (
              <div
                key={company.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-md",
                  isActive
                    ? "border-[var(--color-primary)]"
                    : "border-[var(--color-border)]",
                )}
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{company.name}</h3>
                    <span className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                      company.role === "admin"
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "bg-[var(--color-background)] text-[var(--color-text-secondary)]",
                    )}>
                      {company.role === "admin" ? "Stjórnandi" : "Staðall"}
                    </span>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary)]">
                      Virkt
                    </span>
                  )}
                </div>

                {/* Permissions */}
                {enabledPermissions.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {enabledPermissions.map((p) => (
                      <span
                        key={p}
                        className="rounded-[var(--radius-sm)] bg-[var(--color-background)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Switch button */}
                <button
                  type="button"
                  disabled={isActive || switching === company.id}
                  onClick={() => handleSwitch(company.id)}
                  className={cn(
                    "w-full rounded-[var(--radius-md)] py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "cursor-default bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
                  )}
                >
                  {switching === company.id ? "Hleður..." : isActive ? "Virkt fyrirtæki" : "Skipta yfir"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}