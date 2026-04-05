/**
 * Scrollable list of ticket cards in the left panel.
 * Uses: @/shared/utils/cn, ../types/ticket.types
 * Exports: TicketList
 */
import { cn } from "@/shared/utils/cn";
import type { Ticket, TicketStatus } from "../types/ticket.types";

interface Props {
  tickets: Ticket[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_STYLES: Record<TicketStatus, { label: string; bg: string; text: string }> = {
  opið:  { label: "OPIÐ",  bg: "bg-blue-50",  text: "text-[#4743F7]"  },
  lokað: { label: "LOKAÐ", bg: "bg-green-50", text: "text-green-700" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("is-IS", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 *
 */
export function TicketList({ tickets, isLoading, selectedId, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-sm text-[var(--color-text-muted)]">Hleður...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-sm text-[var(--color-text-muted)]">Engar beiðnir fundust</p>
      </div>
    );
  }

  return (
    <div className="nav-scroll flex flex-col overflow-y-auto">
      {tickets.map((ticket) => {
        const isSelected = ticket.id === selectedId;
        const status = STATUS_STYLES[ticket.status];

        return (
          <button
            key={ticket.id}
            type="button"
            onClick={() => onSelect(ticket.id)}
            className={cn(
              "w-full border-b border-[var(--color-border)] px-4 py-4 text-left transition-colors hover:bg-[var(--color-surface-hover)]",
              isSelected && "border border-[#4743F7] bg-[#EAF3FF]",
            )}
          >
            {/* Top row — ticket number + status badge */}
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#4743F7]">
                #{ticket.number}
              </span>
              <span
                className={cn(
                  "rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold",
                  status.bg,
                  status.text,
                )}
              >
                {status.label}
              </span>
            </div>

            {/* Title */}
            <p className="mb-1 text-[13px] font-semibold leading-snug text-[var(--color-text)]">
              {ticket.title}
            </p>

            {/* Preview */}
            <p className="mb-2 truncate text-[12px] text-[var(--color-text-secondary)]">
              {ticket.preview}
            </p>

            {/* Date */}
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Uppfært {formatDate(ticket.updatedAt)}
            </p>
          </button>
        );
      })}
    </div>
  );
}