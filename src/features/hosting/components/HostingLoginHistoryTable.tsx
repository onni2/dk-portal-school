import { cn } from "@/shared/utils/cn";
import type { HostingLogEntry } from "../types/hosting.types";

interface HostingLoginHistoryTableProps {
  log: HostingLogEntry[];
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("is-IS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventMeta(type: HostingLogEntry["type"]) {
  if (type === "login") {
    return { label: "Innskráning", tone: "success" as const };
  }

  if (type === "logout") {
    return { label: "Útskráning", tone: "default" as const };
  }

  if (type === "failed") {
    return { label: "Misheppnuð innskráning", tone: "error" as const };
  }

  return { label: type, tone: "default" as const };
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function HostingLoginHistoryTable({ log }: HostingLoginHistoryTableProps) {
  return (
    <div className=" mt-2.5 rounded-xl border border-(--color-border) bg-(--color-surface)">
      <div className="flex items-center justify-between border-b border-(--color-border-light) px-5 py-4">
        <h2 className="text-base font-semibold text-(--color-text)">
          Innskráningarsaga
        </h2>

        <span className="text-xs text-(--color-text-muted)">
          Síðustu {log.length} atburðir
        </span>
      </div>

      {log.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-(--color-text-secondary)">
          Engin innskráningarsaga fannst.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-(--color-surface-hover)">
              <tr className="text-left text-xs uppercase tracking-wide text-(--color-text-muted)">
                <th className="px-4 py-2.5">Atburður</th>
                <th className="px-4 py-2.5">Tími</th>
                <th className="px-4 py-2.5">IP-tala</th>
                <th className="hidden px-4 py-2.5 sm:table-cell">Tæki</th>
                <th className="hidden px-4 py-2.5 lg:table-cell">
                  User agent
                </th>
              </tr>
            </thead>

            <tbody>
              {log.map((entry) => {
                const meta = getEventMeta(entry.type);

                return (
                  <tr
                    key={entry.id}
                    className="border-t border-(--color-border-light) hover:bg-(--color-surface-hover)"
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full",
                            meta.tone === "success" &&
                              "bg-(--color-success-bg) text-(--color-success)",
                            meta.tone === "default" &&
                              "bg-(--color-surface-hover) text-(--color-text-secondary)",
                            meta.tone === "error" &&
                              "bg-(--color-error-bg) text-(--color-error)",
                          )}
                        >
                          {meta.tone === "error" ? (
                            <XIcon className="h-3.5 w-3.5" />
                          ) : (
                            <CheckIcon className="h-3.5 w-3.5" />
                          )}
                        </span>

                        <span className="font-medium text-(--color-text)">
                          {meta.label}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-(--color-text-secondary)">
                      {fmtTime(entry.createdAt)}
                    </td>

                    <td className="px-4 py-2.5 font-mono text-xs text-(--color-text-secondary)">
                      {entry.ip ?? "—"}
                    </td>

                    <td className="hidden px-4 py-2.5 text-(--color-text-secondary) sm:table-cell">
                      {entry.device ?? "—"}
                    </td>

                    <td className="hidden px-4 py-2.5 text-(--color-text-secondary) lg:table-cell">
                      {entry.userAgent ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}