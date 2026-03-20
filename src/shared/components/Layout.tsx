/**
 * App shell with a top header (logo, company selector, profile dropdown) and a sidebar nav. Renders the active page in the main content area.
 * Uses: @/shared/utils/cn, @/features/licence/hooks/useVisibleNavItems, @/features/licence/store/role.store, @/features/auth/store/auth.store, @/features/auth/api/auth.api, @/features/auth/components/ProfileDropdown
 * Exports: Layout
 * Author: Haukur — example/scaffold, use as template
 */
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { useVisibleNavItems } from "@/features/licence/hooks/useVisibleNavItems";
import { useRoleStore } from "@/features/licence/store/role.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { logout } from "@/features/auth/api/auth.api";
import { ProfileDropdown } from "@/features/auth/components/ProfileDropdown";

/**
 *
 */
export function Layout({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";
  const navItems = useVisibleNavItems();
  const { role, toggleRole } = useRoleStore();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<string[]>(() =>
    navItems
      .filter((item) => item.children?.some((child) => child.to === currentPath))
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
    <div className="flex h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--color-primary)]">dk</span>
            <span className="text-sm text-[var(--color-text-secondary)]">Mínar síður</span>
          </Link>

          <div className="ml-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)]">
            Fyrirtæki ehf. ▾
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-[var(--radius-lg)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </button>
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
            <nav className="nav-scroll flex flex-col gap-1 overflow-y-auto p-3">

            {navItems.map((item) => {
              const hasChildren = !!item.children?.length;
              const isActive = hasChildren
                ? item.children!.some((child) => currentPath === child.to)
                : item.to === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.to);
              const isOpen = openItems.includes(item.to);

              return (
                <div key={item.to}>
                  {/* Top-level item */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleItem(item.to)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]",
                        isActive
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
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
                        "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Sub-items */}
                  {hasChildren && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="mt-0.5 flex flex-col">
                      {item.children!.map((child) => {
                        const childActive = currentPath === child.to;
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={cn(
                              "flex items-center gap-2 rounded-lg py-2 pl-8 pr-3 text-[13px] transition-colors",
                              childActive
                                ? "font-medium text-[var(--color-primary)]"
                                : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
                            )}
                          >
                            <span className={cn("text-xs", childActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]")}>•</span>
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