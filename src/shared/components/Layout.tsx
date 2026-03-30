/**
 * App shell with a top header (logo, company selector, profile dropdown) and a sidebar nav. Renders the active page in the main content area.
 * Uses: @/shared/utils/cn, @/features/licence/hooks/useVisibleNavItems, @/features/licence/store/role.store, @/features/auth/store/auth.store, @/features/auth/api/auth.api, @/features/auth/components/ProfileDropdown
 * Exports: Layout
 * Author: Haukur — example/scaffold, use as template
 */
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
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
    <div className="flex h-screen flex-col bg-(--color-background) text-(--color-text)">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <svg
              width="48"
              height="25"
              viewBox="0 0 280 147"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_6318_198)">
                <path
                  d="M246.073 46.1325L205.527 0H240.481L280.001 46.1325V46.3215L240.481 92.5485H205.527L246.073 46.3215"
                  fill="#5B57FF"
                />
                <path
                  d="M226.22 145.866L183.064 92.1704L223.516 46.227H188.377L151.839 88.8617L152.118 0H121.453L121.359 145.866V146.433H151.652L151.839 95.7627L191.08 145.866H226.22Z"
                  fill="#20265B"
                />
                <path
                  d="M104.953 0H74.2876V46.6051C68.0426 46.227 57.976 45.7543 48.4687 45.7543C21.0652 45.7543 0 68.537 0 95.6682C0 122.799 17.0573 147.095 45.7656 147.095C48.6551 147.095 52.3835 147.095 56.3915 147L74.2876 126.013V146.527C75.2197 146.527 75.9654 146.527 76.8043 146.527H104.581L104.953 0ZM52.7563 119.963C40.5459 119.963 31.9707 108.052 31.9707 95.5736C31.9707 83.0952 40.6391 73.4527 52.7563 73.0746C60.9587 72.791 68.7883 73.0746 74.2876 73.3582V119.963H52.7563Z"
                  fill="#20265B"
                />
              </g>
              <defs>
                <clipPath id="clip0_6318_198">
                  <rect width="280" height="147" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span className="text-sm text-(--color-text-secondary)">
              Mínar síður
            </span>
          </Link>

          {/* Company selector — placeholder, will be wired to real data */}
          <div className="ml-4 rounded-[var(--radius-md)] border border-(--color-border) px-3 py-1.5 text-sm text-(--color-text-secondary)">
            Fyrirtæki ehf. ▾
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bell icon — placeholder, no notifications yet */}
          <button className="rounded-[var(--radius-md)] p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)">
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

          {user && <ProfileDropdown user={user} onLogout={handleLogout} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-[var(--sidebar-width)] shrink-0 flex-col justify-between border-r border-(--color-border) bg-(--color-surface)">
          <nav className="flex flex-col gap-1 p-3">
            <span className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
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
                          ? "bg-(--color-primary) text-white"
                          : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
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
                      <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-(--color-border) pl-3">
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
                                  ? "bg-(--color-primary) text-white"
                                  : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
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
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-(--color-primary) text-white"
                      : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-(--color-border) p-4">
            {import.meta.env.DEV && (
              <button
                onClick={toggleRole}
                className="mb-3 w-full rounded-[var(--radius-md)] border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-surface-hover)"
              >
                Hlutverk: {role === "cop" ? "COP (Admin)" : "Client"} ↔
              </button>
            )}
            <p className="text-xs text-(--color-text-muted)">
              Þarftu hjálp?
            </p>
            <a
              href="/knowledge-base"
              className="text-xs font-medium text-(--color-primary) hover:underline"
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
