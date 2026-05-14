/**
 * Standard page wrapper with a title, optional description, optional action buttons, and the page content below.
 * Uses: nothing — standalone file
 * Exports: PageTemplate
 */
import type { ReactNode } from "react";
import { InfoTooltip } from "./InfoTooltip";

interface PageTemplateProps {
  title: string;
  description?: ReactNode;
  info?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Standard page layout with a title, optional info icon, optional description, optional action slot, and page content. */
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
            {info && <InfoTooltip text={info} />}
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
