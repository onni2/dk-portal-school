/**
 * Email thread view for a selected ticket. Read-only, iMessage-style bubbles.
 * Customer messages on left, DK support on right.
 * Uses: @/shared/utils/cn, ../types/ticket.types
 * Exports: TicketThread
 */
import { cn } from "@/shared/utils/cn";
import type { Ticket, TicketStatus } from "../types/ticket.types";

interface Props {
  ticket: Ticket;
}

const STATUS_STYLES: Record<TicketStatus, { label: string; bg: string; text: string }> = {
  opið:  { label: "OPIÐ",  bg: "bg-blue-50",  text: "text-[#4743F7]"  },
  lokað: { label: "LOKAÐ", bg: "bg-green-50", text: "text-green-700" },
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("is-IS", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 *
 */
export function TicketThread({ ticket }: Props) {
  const status = STATUS_STYLES[ticket.status];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <div>
          <h2 className="text-[17px] font-semibold text-[var(--color-text)]">
            {ticket.title}
          </h2>
          <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
            Beiðni #{ticket.number} • Opnað{" "}
            {new Date(ticket.createdAt).toLocaleDateString("is-IS", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Status + close button */}
        <div className="flex items-center gap-2">
          <span className={cn("rounded-[3px] px-2 py-1 text-[10px] font-semibold", status.bg, status.text)}>
            {status.label}
          </span>
          {ticket.status === "opið" && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-[12px] text-green-700 transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Loka beiðni
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="nav-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
        {ticket.messages?.map((msg) => {
          const isSupport = msg.from === "support";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1",
                isSupport ? "items-end" : "items-start",
              )}
            >
              {/* Sender + time */}
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]",
                  isSupport && "flex-row-reverse",
                )}
              >
                <span className="font-medium text-[var(--color-text-secondary)]">
                  {msg.senderName}
                </span>
                <span>•</span>
                <span>{formatDateTime(msg.sentAt)}</span>
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[70%] px-4 py-3 text-[13px] leading-relaxed",
                  isSupport
                    ? "rounded-2xl rounded-tr-sm bg-[#4743F7] text-white"
                    : "rounded-2xl rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]",
                )}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}