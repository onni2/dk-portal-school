/**
 * App shell with a top header (logo, company selector, profile dropdown) and a sidebar nav. Renders the active page in the main content area.
 * Uses: @/shared/utils/cn, @/features/licence/hooks/useVisibleNavItems, @/features/licence/store/role.store, @/features/auth/store/auth.store, @/features/auth/api/auth.api, @/features/auth/components/ProfileDropdown
 * Exports: Layout
 * Author: Haukur — example/scaffold, use as template
 */
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { useVisibleNavItems } from "@/features/licence/hooks/useVisibleNavItems";
import { useRoleStore } from "@/features/licence/store/role.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { logout } from "@/features/auth/api/auth.api";
import { ProfileDropdown } from "@/features/auth/components/ProfileDropdown";
import { CompanySelector } from "@/features/company/components/CompanySelector";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { subCompaniesQueryOptions } from "@/features/dkone/api/dkone.queries";

function findActiveChild(children: { to: string }[], path: string): string | null {
  const matches = children.filter((c) => path === c.to || path.startsWith(c.to + "/"));
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.to.length - a.to.length)[0].to;
}

/**
 *
 */
export function Layout({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";
  const rawNavItems = useVisibleNavItems();
  const hasDkOne = rawNavItems.some((item) => item.to === "/dkone");
  const { data: subCompanies } = useQuery({ ...subCompaniesQueryOptions, enabled: hasDkOne });
  const navItems = rawNavItems.map((item) =>
    item.to === "/dkone" && (subCompanies?.length ?? 0) > 0
      ? {
          ...item,
          children: [
            { label: "Notendur", to: "/dkone", access: item.access },
            { label: "Umsýslusvæði", to: "/dkone/umsyslusvaedi", access: item.access },
          ],
        }
      : item,
  );
  const { role, toggleRole } = useRoleStore();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<string[]>(() =>
    navItems
      .filter((item) => item.children && findActiveChild(item.children, currentPath) !== null)
      .map((item) => item.to),
    );
  const toggleItem = (to: string) =>
    setOpenItems((prev) =>
      prev.includes(to) ? prev.filter((t) => t !== to) : [...prev, to],
    );

  /**
   *
   */
  async function handleLogout() {
    await logout();
    clearAuth();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen flex-col bg-(--color-background) text-(--color-text)">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex w-[var(--sidebar-width)] shrink-0 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/src/assets/dk-logo.svg" alt="dk" className="h-8 w-auto" />
            <span className="text-sm text-[var(--color-text-secondary)]">Mínar síður</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center px-1">
          <CompanySelector />
        </div>

        <div className="flex items-center gap-3 px-6">
          <NotificationBell />
          {user && <ProfileDropdown user={user} onLogout={handleLogout} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-[var(--sidebar-width)] shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex flex-col overflow-hidden">
            <span className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Valmynd
            </span>
            <nav className="nav-scroll flex flex-col gap-1 overflow-y-auto px-3 pb-3 pt-1">

            {navItems.map((item) => {
              const hasChildren = !!item.children?.length;
                const isActive = hasChildren
                  ? findActiveChild(item.children!, currentPath) !== null
                  : item.to === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.to);
                const isOpen = openItems.includes(item.to);

                return (
                  <div key={item.to}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleItem(item.to)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]",
                          isActive
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-text)]",
                        )}
                      >
                        {item.label}
                        <svg
                          className={cn(
                            "h-3 w-3 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                          viewBox="0 0 10 6"
                          fill="none"
                        >
                          <path
                            d="M1 1l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[var(--color-primary)] text-white"
                            : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}

                    {/* Sub-items with animated dropdown and left border line */}
                    {hasChildren && (
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                        )}
                      >
                        <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-[var(--color-border)] pl-3">
                          {item.children!.map((child) => {
                            const childActive = findActiveChild(item.children!, currentPath) === child.to;
                            return (
                              <Link
                                key={child.to}
                                to={child.to}
                                className={cn(
                                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                  childActive
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="p-3">
            {import.meta.env.DEV && (
              <button
                onClick={toggleRole}
                className="mb-3 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                Hlutverk: {role === "cop" ? "COP (Admin)" : "Client"} ↔
              </button>
            )}

            {/* Help box */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
              <p className="text-[12px] font-medium text-[var(--color-text)]">Þarftu aðstoð?</p>
              <p className="text-[13px] font-bold text-[var(--color-text)]">
                Spjalla við{" "}
                <a href="/hjalpfus" className="text-[var(--color-primary)] hover:underline">
                  Hjálpfús!
                </a>
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}