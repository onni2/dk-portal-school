import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useAuthTokens, useDeleteAuthToken } from "../api/dkplus.queries";
import type { AuthToken } from "../types/dkplus.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function maskToken(token: string): string {
  const parts = token.split("-");
  return parts
    .map((part, i) =>
      i === parts.length - 1
        ? "•".repeat(Math.max(0, part.length - 4)) + part.slice(-4)
        : "•".repeat(part.length),
    )
    .join("-");
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function LogsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
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
          {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>á síðu</span>
        <span className="ml-2">{start}–{end} af {totalItems}</span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">«</button>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">‹</button>
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 text-[#5C667A]">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPageChange(p as number)}
              className={cn("rounded-lg border px-3 py-1 text-[13px]",
                page === p ? "border-[#4743F7] bg-[#4743F7] text-white" : "border-[var(--color-border)] bg-white text-[#5C667A] hover:bg-[#F6F8FC]")}>
              {p}
            </button>
          )
        )}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">›</button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">»</button>
      </div>
    </div>
  );
}

interface TokenTableProps {
  tokens: AuthToken[];
  onCopy: (token: AuthToken) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onViewLogs: (token: AuthToken) => void;
  copiedId: string | null;
  deletingId: string | null;
  confirmingDeleteId: string | null;
}

function TokenTable({ tokens, onCopy, onRequestDelete, onConfirmDelete, onCancelDelete, onViewLogs, copiedId, deletingId, confirmingDeleteId }: TokenTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Lýsing</th>
          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Fyrirtæki</th>
          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Tákn</th>
          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Aðgerðir</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((t) => (
          <tr key={t.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
            <td className="px-4 py-3 font-medium text-[#0B0F1A]">{t.description}</td>
            <td className="px-4 py-3 text-[#5C667A]">{t.companyName}</td>
            <td className="px-4 py-3 font-mono text-xs text-[#5C667A] tracking-wide">
              {maskToken(t.token)}
            </td>
            <td className="px-4 py-3">
              {confirmingDeleteId === t.id ? (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-[#5C667A]">Eyða varanlega?</span>
                  <button
                    onClick={() => onConfirmDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingId === t.id ? "Eyði..." : "Já, eyða"}
                  </button>
                  <button
                    onClick={onCancelDelete}
                    disabled={deletingId === t.id}
                    className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[#5C667A] hover:bg-[#F6F8FC] transition-colors disabled:opacity-50"
                  >
                    Hætta við
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-1">
                  <button
                    title={copiedId === t.id ? "Afritað!" : "Afrita tákn"}
                    onClick={() => onCopy(t)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors",
                      copiedId === t.id
                        ? "text-[#4743F7]"
                        : "text-[#5C667A] hover:text-[#4743F7] hover:bg-[#EEF2FF]",
                    )}
                  >
                    <CopyIcon />
                    {copiedId === t.id ? "Afritað!" : "Afrita"}
                  </button>
                  <button
                    title="Eyða tákni"
                    onClick={() => onRequestDelete(t.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[#5C667A] hover:text-red-600 hover:bg-[#F6F8FC] transition-colors"
                  >
                    <TrashIcon />
                    Eyða
                  </button>
                  <button
                    onClick={() => onViewLogs(t)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[#5C667A] hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <LogsIcon />
                    Sjá notkun
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface AuthTokensPanelProps {
  onViewLogs: (token: AuthToken) => void;
}

export function AuthTokensPanel({ onViewLogs }: AuthTokensPanelProps) {
  const { data: tokens } = useAuthTokens();
  const deleteMutation = useDeleteAuthToken();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  const totalPages = Math.max(1, Math.ceil(tokens.length / pageSize));
  const pagedTokens = tokens.slice((page - 1) * pageSize, page * pageSize);

  const paginationProps = {
    page,
    totalPages,
    pageSize,
    totalItems: tokens.length,
    onPageChange: setPage,
    onPageSizeChange: (s: number) => { setPageSize(s); setPage(1); },
  };

  function handleCopy(token: AuthToken) {
    navigator.clipboard.writeText(token.token);
    setCopiedId(token.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleConfirmDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      setConfirmingDeleteId(null);
    } catch {
      showError("Villa kom upp við eyðingu á tákni.");
      setConfirmingDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[#F6F8FC] px-4 py-3">
        <h3 className="text-[13px] font-semibold text-[#0B0F1A]">Auðkenningartákn</h3>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-[#0B0F1A]">Engin auðkenningartákn skráð</p>
          <p className="max-w-sm text-sm text-[#5C667A]">
            Notaðu hnappinn „Stofna tákn" til að búa til fyrsta táknið og tengja kerfi við DK vefþjónustur.
          </p>
        </div>
      ) : (
        <>
          {/* Top pagination */}
          <div className="border-b border-[var(--color-border)]">
            <PaginationControls {...paginationProps} />
          </div>

          <TokenTable
            tokens={pagedTokens}
            onCopy={handleCopy}
            onRequestDelete={(id) => setConfirmingDeleteId(id)}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={() => setConfirmingDeleteId(null)}
            onViewLogs={onViewLogs}
            copiedId={copiedId}
            deletingId={deletingId}
            confirmingDeleteId={confirmingDeleteId}
          />

          {/* Bottom pagination */}
          <div className="border-t border-[var(--color-border)]">
            <PaginationControls {...paginationProps} />
          </div>
        </>
      )}
    </div>
  );
}