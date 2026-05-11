/**
 * Standard page wrapper with a title, optional description, optional action buttons, and the page content below.
 * Uses: nothing — standalone file
 * Exports: PageTemplate
 */
import type { ReactNode } from "react";

interface PageTemplateProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 *
 */
export function PageTemplate({
  title,
  description,
  actions,
  children,
}: PageTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text)">
            {title}
          </h1>
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
