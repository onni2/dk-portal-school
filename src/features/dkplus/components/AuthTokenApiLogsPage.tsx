/**
 * Detail page for a single auth token showing a bar chart of API usage and a filterable log table.
 * Uses: @/shared/components/Button, @/features/auth/store/auth.store, ../api/dkplus.queries, @/shared/utils/cn
 * Exports: AuthTokenApiLogsPage
 */
import { useState, useMemo } from "react";
import { Button } from "@/shared/components/Button";
import { useAuthStore } from "@/features/auth/store/auth.store";
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

function bucketKey(d: Date, byWeek: boolean): string {
  if (byWeek) {
    const mon = new Date(d);
    mon.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return mon.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" });
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

type ChartPeriod = 1 | 3 | 6 | 12;

function UsageChart({ logs }: { logs: AuthTokenApiLog[] }) {
  const [period, setPeriod] = useState<ChartPeriod>(3);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { buckets, total, maxCount, avgPerDay, peakCount, groupByWeek } = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - period);

    const byWeek = period >= 6;
    const bucketMap = new Map<string, number>();

    const cursor = new Date(from);
    while (cursor <= now) {
      const key = bucketKey(cursor, byWeek);
      if (!bucketMap.has(key)) bucketMap.set(key, 0);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    let total = 0;
    for (const log of logs) {
      const d = new Date(log.createdAt);
      if (d < from || d > now) continue;
      total++;
      const key = bucketKey(d, byWeek);
      bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
    }

    const buckets = Array.from(bucketMap.entries()).map(([date, count]) => ({ date, count }));
    const maxCount = Math.max(...buckets.map((b) => b.count), 1);
    const nonZero = buckets.filter((b) => b.count > 0);
    const avgPerDay = nonZero.length > 0 ? Math.round(total / nonZero.length) : 0;

    return { buckets, total, maxCount, avgPerDay, peakCount: maxCount, groupByWeek: byWeek };
  }, [logs, period]);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-(--color-text)">Notkun</span>
          <span className="text-xs text-(--color-text-secondary)">
            {total.toLocaleString("is-IS")} köll
          </span>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-(--color-border)">
          {([1, 3, 6, 12] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPeriod(m)}
              className={cn(
                "border-r border-(--color-border) px-3 py-1 text-xs font-medium transition-colors last:border-r-0",
                period === m
                  ? "bg-(--color-primary) text-white"
                  : "bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-hover)",
              )}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Horizontal grid lines */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-28 flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-(--color-border)/40" />
          ))}
        </div>

        {/* Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="pointer-events-none absolute bottom-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-(--color-text) px-2.5 py-1.5 text-xs text-white shadow-md"
            style={{ left: `${((hoveredIdx + 0.5) / buckets.length) * 100}%` }}
          >
            <span className="font-medium">{buckets[hoveredIdx].count}</span>
            <span className="ml-1 opacity-75">
              {groupByWeek ? "þ/v" : "köll"} · {formatDateLabel(buckets[hoveredIdx].date)}
            </span>
          </div>
        )}

        {/* Bars */}
        <div className="flex h-28 items-end gap-px">
          {buckets.map(({ date, count }, idx) => (
            <div
              key={date}
              className="group relative flex h-full flex-1 cursor-default items-end"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {count > 0 ? (
                <div
                  className={cn(
                    "w-full rounded-t-[1px] transition-colors",
                    hoveredIdx === idx
                      ? "bg-(--color-primary)"
                      : "bg-(--color-primary)/50",
                  )}
                  style={{ height: `${Math.max(2, Math.round((count / maxCount) * 100))}%` }}
                />
              ) : (
                <div className="w-full rounded-t-[1px] bg-(--color-border)/30" style={{ height: "2px" }} />
              )}
            </div>
          ))}
        </div>

        {/* X-axis month labels */}
        <div className="relative mt-1 h-4">
          {buckets.map(({ date }, idx) => {
            const d = new Date(date + "T12:00:00Z");
            const isLabel = groupByWeek ? d.getUTCDate() <= 7 : d.getUTCDate() === 1;
            if (!isLabel) return null;
            return (
              <span
                key={date}
                className="absolute -translate-x-1/2 text-[10px] text-(--color-text-muted)"
                style={{ left: `${((idx + 0.5) / buckets.length) * 100}%` }}
              >
                {d.toLocaleString("is-IS", { month: "short" })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-3 grid grid-cols-3 gap-4 border-t border-(--color-border) pt-3">
        <div>
          <p className="text-xs text-(--color-text-muted)">Samtals</p>
          <p className="text-sm font-semibold text-(--color-text)">{total.toLocaleString("is-IS")}</p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Meðaltal / {groupByWeek ? "viku" : "dag"}</p>
          <p className="text-sm font-semibold text-(--color-text)">{avgPerDay}</p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Hæsta {groupByWeek ? "vika" : "dagur"}</p>
          <p className="text-sm font-semibold text-(--color-text)">{peakCount}</p>
        </div>
      </div>
    </div>
  );
}

interface Filters {
  from: string;
  to: string;
  user: string;
  method: string;
  statusCode: string;
}

function yesterdayRange(): { from: string; to: string } {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return { from: `${yyyy}-${mm}-${dd}T00:00`, to: `${yyyy}-${mm}-${dd}T23:59` };
}

function emptyFilters(userName: string): Filters {
  const { from, to } = yesterdayRange();
  return { from, to, user: userName, method: "", statusCode: "" };
}

function FilterPanel({
  filters,
  tokenValue,
  onChange,
  onApply,
  onClear,
}: {
  filters: Filters;
  tokenValue: string;
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
            readOnly
            value={filters.user}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-hover) px-3 py-2 text-sm text-(--color-text-secondary) outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">
            Aðferð <span className="font-normal text-(--color-text-muted)">(valkvætt)</span>
          </label>
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
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">
            Stöðukóði <span className="font-normal text-(--color-text-muted)">(valkvætt)</span>
          </label>
          <input
            type="number"
            placeholder="T.d. 200"
            value={filters.statusCode}
            onChange={(e) => onChange({ ...filters, statusCode: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Token</label>
          <input
            readOnly
            value={tokenValue}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-hover) px-3 py-2 font-mono text-sm text-(--color-text-secondary) outline-none"
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

function LogTable({ logs, isLoading }: { logs: AuthTokenApiLog[]; isLoading: boolean }) {
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
              <td className="max-w-40 px-4 py-2.5">
                <span className="block truncate text-xs text-(--color-text-muted)" title={log.userAgent}>
                  {log.userAgent}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs text-(--color-text-secondary)">
                {log.timeTaken}
              </td>
              <td className="px-4 py-2.5 text-xs text-red-600">{log.error ?? ""}</td>
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

/** Full-page view of a token's API logs with a usage chart, filter panel, log table, and pagination. */
export function AuthTokenApiLogsPage({ token, onBack }: AuthTokenApiLogsPageProps) {
  const { user } = useAuthStore();
  const { data: allLogs = [], isLoading } = useAuthTokenApiLogs(token.id);

  const [draftFilters, setDraftFilters] = useState<Filters>(() => emptyFilters(user?.name ?? ""));
  const [activeFilters, setActiveFilters] = useState<Filters>(() => emptyFilters(user?.name ?? ""));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      if (activeFilters.from && new Date(log.createdAt) < new Date(activeFilters.from)) return false;
      if (activeFilters.to   && new Date(log.createdAt) > new Date(activeFilters.to))   return false;
      if (activeFilters.user && !log.userName.toLowerCase().includes(activeFilters.user.toLowerCase())) return false;
      if (activeFilters.method && log.method !== activeFilters.method) return false;
      if (activeFilters.statusCode && log.statusCode !== Number(activeFilters.statusCode)) return false;
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
    const reset = emptyFilters(user?.name ?? "");
    setDraftFilters(reset);
    setActiveFilters(reset);
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

      <UsageChart logs={allLogs} />

      <FilterPanel
        filters={draftFilters}
        tokenValue={token.token}
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
