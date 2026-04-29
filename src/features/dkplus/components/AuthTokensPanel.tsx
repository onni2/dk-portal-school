import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useAuthTokens, useCompanies, useCreateAuthToken, useDeleteAuthToken } from "../api/dkplus.queries";
import { AuthTokenLogsPanel } from "./AuthTokenLogsPanel";
import type { AuthToken } from "../types/dkplus.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function LogsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function TokenTable({
  tokens,
  selectedLogId,
  onCopy,
  onDelete,
  onToggleLogs,
  copiedId,
  deletingId,
}: {
  tokens: AuthToken[];
  selectedLogId: string | null;
  onCopy: (token: AuthToken) => void;
  onDelete: (id: string) => void;
  onToggleLogs: (token: AuthToken) => void;
  copiedId: string | null;
  deletingId: string | null;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-(--color-border)">
          <th className="px-4 py-3 text-left font-semibold text-(--color-text)">Lýsing</th>
          <th className="px-4 py-3 text-left font-semibold text-(--color-text)">Fyrirtæki</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {tokens.map((t, i) => (
          <tr
            key={t.id}
            className={i % 2 === 0 ? "bg-(--color-surface)" : "bg-(--color-background)"}
          >
            <td className="px-4 py-3 text-(--color-text)">{t.description}</td>
            <td className="px-4 py-3 text-(--color-text-secondary)">{t.companyName}</td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <button
                  title={copiedId === t.id ? "Afritað!" : "Afrita token"}
                  onClick={() => onCopy(t)}
                  className={`rounded p-1.5 transition-colors ${
                    copiedId === t.id
                      ? "text-(--color-primary)"
                      : "text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface-hover)"
                  }`}
                >
                  <CopyIcon />
                </button>
                <button
                  title="Eyða token"
                  onClick={() => onDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="rounded p-1.5 text-(--color-text-secondary) transition-colors hover:text-(--color-error) hover:bg-(--color-surface-hover) disabled:opacity-40"
                >
                  <TrashIcon />
                </button>
                <button
                  title="Skoða log"
                  onClick={() => onToggleLogs(t)}
                  className={`rounded p-1.5 transition-colors ${
                    selectedLogId === t.id
                      ? "text-(--color-primary) bg-(--color-surface-hover)"
                      : "text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface-hover)"
                  }`}
                >
                  <LogsIcon />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const { data: companies } = useCompanies();
  const createMutation = useCreateAuthToken();
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [descError, setDescError] = useState(false);

  async function handleCreate() {
    if (!description.trim()) {
      setDescError(true);
      return;
    }
    setDescError(false);
    await createMutation.mutateAsync({ description: description.trim(), companyId });
    setDescription("");
    onCreated();
  }

  return (
    <div className="flex items-end gap-2 border-t border-(--color-border) px-4 py-3">
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Lýsing"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) setDescError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
              descError
                ? "border-(--color-error) focus:ring-(--color-error)/30"
                : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20"
            } bg-(--color-surface) text-(--color-text) placeholder:text-(--color-text-muted)`}
          />
          {descError && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-error)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </div>
      </div>
      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20"
      >
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Button
        variant="primary"
        size="sm"
        onClick={handleCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? "Stofna..." : "✓ Stofna"}
      </Button>
    </div>
  );
}

export function AuthTokensPanel() {
  const { data: tokens } = useAuthTokens();
  const deleteMutation = useDeleteAuthToken();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(tokens.length / pageSize));
  const pagedTokens = tokens.slice((page - 1) * pageSize, page * pageSize);

  const selectedToken = tokens.find((t) => t.id === selectedLogId) ?? null;

  function handleCopy(token: AuthToken) {
    navigator.clipboard.writeText(token.token);
    setCopiedId(token.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedLogId === id) setSelectedLogId(null);
    } finally {
      setDeletingId(null);
    }
  }

  function handleToggleLogs(token: AuthToken) {
    setSelectedLogId((prev) => (prev === token.id ? null : token.id));
  }

  function handlePageSizeChange(size: (typeof PAGE_SIZE_OPTIONS)[number]) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <div className="grid grid-cols-5 items-start gap-6">
      <div className={selectedToken ? "col-span-2" : "col-span-5"}>
        <div className="overflow-hidden rounded-xl border border-(--color-border)">
          <div className="border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
            <h3 className="text-sm font-semibold text-(--color-text)">Auðkenningar tákn</h3>
          </div>

          {pagedTokens.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-(--color-text-secondary)">
              Engin auðkenningar tákn skráð.
            </div>
          ) : (
            <TokenTable
              tokens={pagedTokens}
              selectedLogId={selectedLogId}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onToggleLogs={handleToggleLogs}
              copiedId={copiedId}
              deletingId={deletingId}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--color-border) px-4 py-3 text-xs text-(--color-text-secondary)">
            <div className="flex items-center gap-2">
              <span>
                Síða {page} af {totalPages} ({tokens.length} færslur)
              </span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const v = Math.min(totalPages, Math.max(1, Number(e.target.value)));
                  setPage(v);
                }}
                className="w-12 rounded border border-(--color-border) bg-(--color-surface) px-2 py-1 text-center text-xs text-(--color-text) outline-none focus:border-(--color-primary)"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Fjöldi á síðu:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                className="rounded border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs text-(--color-text) outline-none focus:border-(--color-primary)"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <CreateForm onCreated={() => setPage(1)} />
        </div>
      </div>

      {selectedToken && (
        <div className="col-span-3">
          <AuthTokenLogsPanel
            tokenId={selectedToken.id}
            tokenDescription={selectedToken.description}
          />
        </div>
      )}
    </div>
  );
}
