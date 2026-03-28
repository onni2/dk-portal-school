/**
 * App shell with a top header (logo, company selector, profile dropdown) and a sidebar nav. Renders the active page in the main content area.
 * Uses: @/shared/utils/cn, @/features/licence/hooks/useVisibleNavItems, @/features/licence/store/role.store, @/features/auth/store/auth.store, @/features/auth/api/auth.api, @/features/auth/components/ProfileDropdown
 * Exports: Layout
 * Author: Haukur — example/scaffold, use as template
 */
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import dkLogo from "@/assets/Logo_main.svg";
import { type ReactNode, useState } from "react";
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { role, toggleRole } = useRoleStore();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

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
            <img src={dkLogo} alt="DK Hugbúnaður" className="h-8 w-auto" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Mínar síður
            </span>
          </Link>

          {/* Company selector — placeholder, will be wired to real data */}
          <div className="ml-4 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)]">
            Fyrirtæki ehf. ▾
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bell icon — placeholder, no notifications yet */}
          <button className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]">
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

          {user && (
            <ProfileDropdown user={user} onLogout={handleLogout} />
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-[var(--sidebar-width)] shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)]">
          <nav className="flex flex-col gap-1 p-3">
            <span className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Valmynd
            </span>
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.to);

              if (item.children && item.children.length > 0) {
                const isOpen = openGroup === item.label;
                const hasActiveChild = item.children.some((child) =>
                  currentPath.startsWith(child.to),
                );

                return (
                  <div key={item.to}>
                    <button
                      onClick={() =>
                        setOpenGroup(isOpen ? null : item.label)
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium transition-colors",
                        hasActiveChild
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "text-xs transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      >
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-[var(--color-border)] pl-3">
                        {item.children.map((child) => {
                          const isChildActive = currentPath.startsWith(
                            child.to,
                          );
                          return (
                            <a
                              key={child.to}
                              href={child.to}
                              className={cn(
                                "rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors",
                                isChildActive
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
                              )}
                            >
                              {child.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-border)] p-4">
            {import.meta.env.DEV && (
              <button
                onClick={toggleRole}
                className="mb-3 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                Hlutverk: {role === "cop" ? "COP (Admin)" : "Client"} ↔
              </button>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">
              Þarftu hjálp?
            </p>
            <a
              href="/knowledge-base"
              className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Leiðbeiningar (Knowledge Base)
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
