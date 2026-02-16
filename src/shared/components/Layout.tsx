import { Link, useMatches } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  { label: "Yfirlit", to: "/" },
  { label: "Reikningar", to: "/reikningar" },
  { label: "Leyfi", to: "/leyfi" },
  { label: "Hýsing", to: "/hysing" },
  { label: "POS", to: "/pos" },
  { label: "dkOne/Plus", to: "/dkone" },
  { label: "Stimpilklukka", to: "/stimpilklukka" },
  { label: "Zoho mál", to: "/zoho" },
  { label: "Knowledge Base", to: "/knowledge-base" },
  { label: "Notendur", to: "/notendur" },
  { label: "Stillingar", to: "/stillingar" },
];

export function Layout({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";

  return (
    <div className="flex h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--color-primary)]">
              dk
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Mínar síður
            </span>
          </Link>

          {/* Company selector — placeholder, will be wired to real data */}
          <div className="ml-4 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)]">
            Fyrirtæki ehf. ▾
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-text-secondary)]">Notandi</span>
          <button className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            Útskrá
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-[var(--sidebar-width)] shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)]">
          <nav className="flex flex-col gap-1 p-3">
            <span className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Valmynd
            </span>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.to === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.to);

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
