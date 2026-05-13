/**
 * Generic data table component. Accepts typed column definitions and a row array, and handles empty state, responsive column hiding, and an optional footer.
 * Uses: @/shared/utils/cn
 * Exports: Column, TableProps, Table
 */
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  hideBelow?: "md" | "lg";
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T) => string | number;
  footer?: ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

const hiddenClasses = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const;

/** Renders a bordered data table. Shows a text-only empty state when `data` is empty. */
export function Table<T>({
  columns,
  data,
  keyFn,
  footer,
  emptyMessage = "Engar niðurstöður.",
  onRowClick,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface) px-4 py-8 text-center text-sm text-(--color-text-muted)">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface)">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-(--color-border) bg-(--color-background)">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-3 py-2.5 text-sm font-semibold text-(--color-text)",
                  col.hideBelow && hiddenClasses[col.hideBelow],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyFn(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-(--color-border-light) transition-colors last:border-b-0 hover:bg-(--color-surface-hover)",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col, i) => (
                <td
                  key={i}
                  className={cn(
                    "px-3 py-2.5 text-xs",
                    col.hideBelow && hiddenClasses[col.hideBelow],
                    col.className,
                  )}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {footer && (
        <div className="border-t border-(--color-border) px-4 py-3 text-xs text-(--color-text-muted)">
          {footer}
        </div>
      )}
    </div>
  );
}
