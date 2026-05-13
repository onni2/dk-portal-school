import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { usePosServiceLogs, usePosRestServiceLogs } from "../api/pos.queries";
import type { PosServiceType } from "../types/pos.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function formatLogDate(iso: string): string {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${dd}.${mm}.${yyyy} - ${hh}:${min}`;
}

interface PosLogPanelProps {
  serviceId: string;
  serviceType: PosServiceType;
  serviceDisplay: string;
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

function LogTable({
  logs,
  isLoading,
}: {
  logs: { id: string; description: string; executedBy: string; createdAt: string }[];
  isLoading: boolean;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[#5C667A]">
        Hleður...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[#5C667A]">
        Engar færslur í skrá.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const paginated = logs.slice((page - 1) * pageSize, page * pageSize);

  const paginationProps = {
    page,
    totalPages,
    pageSize,
    totalItems: logs.length,
    onPageChange: setPage,
    onPageSizeChange: (s: number) => { setPageSize(s); setPage(1); },
  };

  return (
    <div>
      <div className="border-b border-[var(--color-border)]">
        <PaginationControls {...paginationProps} />
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Stofndagur</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Lýsing</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Framkvæmt af</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log) => (
              <tr key={log.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
                <td className="whitespace-nowrap px-4 py-3 text-[#5C667A]">{formatLogDate(log.createdAt)}</td>
                <td className="px-4 py-3 text-[#0B0F1A]">{log.description}</td>
                <td className="px-4 py-3 text-[#5C667A]">{log.executedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <PaginationControls {...paginationProps} />
      </div>
    </div>
  );
}

function DkPosLogContent({ serviceId }: { serviceId: string }) {
  const { data: logs = [], isLoading } = usePosServiceLogs(serviceId);
  return <LogTable logs={logs} isLoading={isLoading} />;
}

function RestPosLogContent({ serviceId }: { serviceId: string }) {
  const { data: logs = [], isLoading } = usePosRestServiceLogs(serviceId);
  return <LogTable logs={logs} isLoading={isLoading} />;
}

export function PosLogPanel({ serviceId, serviceType, serviceDisplay }: PosLogPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      <div className="border-b border-[var(--color-border)] bg-[#F6F8FC] px-4 py-3">
        <h3 className="text-[13px] font-semibold text-[#0B0F1A]">{serviceDisplay} - Log</h3>
      </div>
      {serviceType === "dkpos" ? (
        <DkPosLogContent serviceId={serviceId} />
      ) : (
        <RestPosLogContent serviceId={serviceId} />
      )}
    </div>
  );
}