/**
 * Generic data table component with accountant-style design and optional pagination.
 *
 * Accepts typed column definitions and a row array.
 *
 * Handles:
 * - table rendering with accountant style
 * - empty state
 * - loading state
 * - responsive column hiding
 * - optional top+bottom pagination with page size selector
 * - row click handling
 *
 * Uses: @/shared/utils/cn
 * Exports: Column, TableProps, Table, usePagination
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

// ── Pagination ────────────────────────────────────────────────────────────────

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginate: <T>(data: T[]) => T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/** Hook to manage pagination state. Pass the filtered data array to get paginated slice. */
export function usePagination(initialPageSize = 10): PaginationState {
  const [page, setPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  function setPage(p: number) {
    setPageRaw(p);
  }

  function setPageSize(s: number) {
    setPageSizeRaw(s);
    setPageRaw(1);
  }

  function paginate<T>(data: T[]): T[] {
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const clampedPage = Math.min(page, totalPages);
    return data.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  }

  // totalPages and totalItems are computed lazily — pass data.length from outside
  return { page, pageSize, totalPages: 1, totalItems: 0, paginate, setPage, setPageSize };
}

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationControls({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }: PaginationControlsProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-[13px] text-[#5C667A]">
        <span>Sýna</span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span>á síðu</span>
        <span className="ml-2">{start}–{end} af {totalItems}</span>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">
          «
        </button>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">
          ‹
        </button>
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 text-[#5C667A]">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPageChange(p as number)}
              className={cn(
                "rounded-lg border px-3 py-1 text-[13px]",
                page === p
                  ? "border-[#4743F7] bg-[#4743F7] text-white"
                  : "border-[var(--color-border)] bg-white text-[#5C667A] hover:bg-[#F6F8FC]",
              )}>
              {p}
            </button>
          )
        )}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">
          ›
        </button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">
          »
        </button>
      </div>
    </div>
  );
}

// ── Column & Table ─────────────────────────────────────────────────────────────

export interface Column<T> {
  /** Text shown in the table header. */
  header: string;
  /** Function that renders the cell content for each row. */
  accessor: (row: T) => ReactNode;
  /** Optional responsive hiding. md = hidden until medium, lg = hidden until large. */
  hideBelow?: "md" | "lg";
  /** Classes applied to body cells: <td> */
  className?: string;
  /** Classes applied to header cells: <th> */
  headerClassName?: string;
  /** Align text right (for amounts etc.) */
  alignRight?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T, index: number) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  noBorder?: boolean;
  /** Pass pagination state to enable top+bottom pagination controls */
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

const hiddenClasses = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const;

export function Table<T>({
  columns,
  data,
  keyFn,
  emptyMessage = "Engar niðurstöður.",
  isLoading = false,
  onRowClick,
  pagination,
  noBorder = false,
}: TableProps<T>) {
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize)) : 1;

  const paginationControlProps = pagination ? {
    page: pagination.page,
    totalPages,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    onPageChange: pagination.onPageChange,
    onPageSizeChange: pagination.onPageSizeChange,
  } : null;

  return (
    <div className={cn("bg-white", !noBorder && "rounded-xl border border-[var(--color-border)]")}>
      {/* Top pagination */}
      {paginationControlProps && (
        <div className="border-b border-[var(--color-border)]">
          <PaginationControls {...paginationControlProps} />
        </div>
      )}

      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]",
                  col.hideBelow && hiddenClasses[col.hideBelow],
                  col.alignRight && "text-right",
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[#5C667A]">
                Hleður...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[#5C667A]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyFn(row, index)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC] transition-colors",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className={cn(
                      "px-4 py-3 text-[#5C667A]",
                      col.hideBelow && hiddenClasses[col.hideBelow],
                      col.alignRight && "text-right",
                      col.className,
                    )}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Bottom pagination */}
      {paginationControlProps && (
        <div className="border-t border-[var(--color-border)]">
          <PaginationControls {...paginationControlProps} />
        </div>
      )}
    </div>
  );
}