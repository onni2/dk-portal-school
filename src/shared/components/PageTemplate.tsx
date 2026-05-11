/**
 * Standard page wrapper with a title, optional description, optional action buttons, and the page content below.
 * Uses: nothing — standalone file
 * Exports: PageTemplate
 */
import type { ReactNode } from "react";

interface PageTemplateProps {
  title: string;
  description?: ReactNode;
  info?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 *
 */
export function PageTemplate({
  title,
  description,
  info,
  actions,
  children,
}: PageTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-(--color-text)">{title}</h1>
            {info && (
              <span className="group relative flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 cursor-default text-(--color-text-muted) transition-colors group-hover:text-(--color-text-secondary)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                </svg>
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs text-(--color-text-secondary) opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {info}
                </span>
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
