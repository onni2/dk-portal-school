import { useState, useMemo } from "react";
import { Button } from "@/shared/components/Button";
import { useAuthTokenApiLogs } from "../api/dkplus.queries";
import type { AuthToken, AuthTokenApiLog } from "../types/dkplus.types";
import { cn } from "@/shared/utils/cn";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const METHOD_OPTIONS = ["", "GET", "POST", "PUT", "DELETE", "PATCH"] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function StatusBadge({ code }: { code: number }) {
  const color =
    code >= 500 ? "bg-red-100 text-red-700" :
    code >= 400 ? "bg-orange-100 text-orange-700" :
    code >= 300 ? "bg-yellow-100 text-yellow-700" :
    "bg-green-100 text-green-700";
  return (
    <span className={cn("inline-block rounded px-2 py-0.5 text-xs font-semibold", color)}>
      {code}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "POST"   ? "bg-blue-100 text-blue-700" :
    method === "PUT"    ? "bg-violet-100 text-violet-700" :
    method === "DELETE" ? "bg-red-100 text-red-700" :
    method === "PATCH"  ? "bg-amber-100 text-amber-700" :
    "bg-gray-100 text-gray-600";
  return (
    <span className={cn("inline-block rounded px-1.5 py-0.5 text-xs font-mono font-semibold", color)}>
      {method}
    </span>
  );
}

interface Filters {
  from: string;
  to: string;
  user: string;
  method: string;
  statusCode: string;
  uri: string;
}

const EMPTY_FILTERS: Filters = { from: "", to: "", user: "", method: "", statusCode: "", uri: "" };

function FilterPanel({
  filters,
  onChange,
  onApply,
  onClear,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const inputClass =
    "w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20";

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Frá</label>
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Til</label>
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Notandi</label>
          <input
            type="text"
            placeholder="Allir notendur"
            value={filters.user}
            onChange={(e) => onChange({ ...filters, user: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Aðferð</label>
          <select
            value={filters.method}
            onChange={(e) => onChange({ ...filters, method: e.target.value })}
            className={inputClass}
          >
            <option value="">Allar aðferðir</option>
            {METHOD_OPTIONS.filter(Boolean).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Stöðukóði</label>
          <input
            type="number"
            placeholder="T.d. 200"
            value={filters.statusCode}
            onChange={(e) => onChange({ ...filters, statusCode: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Uri</label>
          <input
            type="text"
            placeholder="Leita í URI"
            value={filters.uri}
            onChange={(e) => onChange({ ...filters, uri: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          Hreinsa síur
        </Button>
        <Button variant="primary" size="sm" onClick={onApply} className="flex-1">
          Sía
        </Button>
      </div>
    </div>
  );
}

function LogTable({
  logs,
  isLoading,
}: {
  logs: AuthTokenApiLog[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-(--color-text-secondary)">
        Hleður...
      </div>
    );
  }
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-(--color-text-secondary)">
        Engar færslur fundust.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--color-border) bg-(--color-surface)">
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">Stofndagur</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">Notandi</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">Aðferð</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">URI</th>
            <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-(--color-text)">Niðurhal</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">Staða</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">IP-tala</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">Agent</th>
            <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-(--color-text)">Tími (ms)</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-(--color-text)">Villa</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr
              key={log.id}
              className={cn(
                "border-b border-(--color-border)/50 transition-colors hover:bg-(--color-surface-hover)",
                i % 2 === 0 ? "bg-(--color-background)" : "bg-(--color-surface)",
              )}
            >
              <td className="whitespace-nowrap px-4 py-2.5 text-xs text-(--color-text-secondary)">
                {formatDate(log.createdAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-(--color-text)">{log.userName}</td>
              <td className="px-4 py-2.5">
                <MethodBadge method={log.method} />
              </td>
              <td className="max-w-xs px-4 py-2.5">
                <span
                  className="block truncate font-mono text-xs text-(--color-text)"
                  title={log.uri + (log.query ? `?${log.query}` : "")}
                >
                  {log.uri}
                  {log.query && <span className="text-(--color-text-muted)">?{log.query}</span>}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs text-(--color-text-secondary)">
                {log.bandwidthDownload.toLocaleString()}
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge code={log.statusCode} />
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-(--color-text-secondary)">
                {log.ipAddress}
              </td>
              <td className="max-w-[160px] px-4 py-2.5">
                <span className="block truncate text-xs text-(--color-text-muted)" title={log.userAgent}>
                  {log.userAgent}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs text-(--color-text-secondary)">
                {log.timeTaken}
              </td>
              <td className="px-4 py-2.5 text-xs text-red-600">
                {log.error ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AuthTokenApiLogsPageProps {
  token: AuthToken;
  onBack: () => void;
}

export function AuthTokenApiLogsPage({ token, onBack }: AuthTokenApiLogsPageProps) {
  const { data: allLogs = [], isLoading } = useAuthTokenApiLogs(token.id);

  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      if (activeFilters.from && new Date(log.createdAt) < new Date(activeFilters.from)) return false;
      if (activeFilters.to   && new Date(log.createdAt) > new Date(activeFilters.to))   return false;
      if (activeFilters.user   && !log.userName.toLowerCase().includes(activeFilters.user.toLowerCase())) return false;
      if (activeFilters.method && log.method !== activeFilters.method) return false;
      if (activeFilters.statusCode && log.statusCode !== Number(activeFilters.statusCode)) return false;
      if (activeFilters.uri && !log.uri.toLowerCase().includes(activeFilters.uri.toLowerCase())) return false;
      return true;
    });
  }, [allLogs, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function applyFilters() {
    setActiveFilters(draftFilters);
    setPage(1);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--color-text-secondary) transition-colors hover:text-(--color-text)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Til baka
        </button>
        <span className="text-(--color-text-muted)">/</span>
        <span className="text-sm font-medium text-(--color-text)">API Yfirlit</span>
        <span className="ml-auto font-mono text-xs text-(--color-text-muted)">{token.token}</span>
      </div>

      <FilterPanel
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      <div className="overflow-hidden rounded-xl border border-(--color-border)">
        <LogTable logs={paged} isLoading={isLoading} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--color-border) bg-(--color-surface) px-4 py-3 text-xs text-(--color-text-secondary)">
          <div className="flex items-center gap-2">
            <span>
              Síða {page} af {totalPages} ({filtered.length} færslur)
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
              className="w-12 rounded border border-(--color-border) bg-(--color-background) px-2 py-1 text-center text-xs text-(--color-text) outline-none focus:border-(--color-primary)"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Fjöldi á síðu:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                setPage(1);
              }}
              className="rounded border border-(--color-border) bg-(--color-background) px-2 py-1 text-xs text-(--color-text) outline-none focus:border-(--color-primary)"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
