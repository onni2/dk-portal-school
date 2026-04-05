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
  currentUserName: string;
}

const STATUS_STYLES: Record<TicketStatus, { label: string; bg: string; text: string }> = {
  opið:  { label: "OPIÐ",  bg: "bg-[#E3F2FD]", text: "text-[#4743F7]"  },
  lokað: { label: "LOKAÐ", bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("is-IS", {
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
export function TicketThread({ ticket, currentUserName }: Props) {
  const status = STATUS_STYLES[ticket.status];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#CFD3DB]">
      {/* Header — rounded top */}
      <div className="flex items-center justify-between border-b border-[#CFD3DB] bg-white px-5 py-4">
        <div>
          <h2 className="text-[17px] font-semibold text-[#0B0F1A]">{ticket.title}</h2>
          <p className="mt-0.5 text-[13px] text-[#5C667A]">
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
          {ticket.status === "opið" && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-[5px] border border-[#CFD3DB] bg-[#F6F8FC] px-3 py-1.5 text-[12px] text-[#2E7D32] transition-colors hover:bg-[#E8F5E9]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Loka beiðni
            </button>
          )}
          {ticket.status === "lokað" && (
            <span className={cn("rounded-[3px] px-2 py-1 text-[10px] font-semibold", status.bg, status.text)}>
              {status.label}
            </span>
          )}
        </div>
      </div>

      {/* Messages area — grey background like Figma */}
      <div className="nav-scroll flex flex-1 flex-col gap-4 overflow-y-auto bg-[#F6F8FC] px-6 py-6">
        {ticket.messages?.map((msg) => {
          const isMe = msg.senderName === currentUserName;
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}
            >
              {/* Sender + time */}
              <div className={cn("flex items-center gap-1.5 text-[11px] text-[#5C667A]", isMe && "flex-row-reverse")}>
                <span className="font-medium">{msg.senderName}</span>
                <span>•</span>
                <span>{formatDateTime(msg.sentAt)}</span>
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[70%] px-4 py-3 text-[13px] leading-relaxed",
                  isMe
                    ? "rounded-2xl rounded-tr-sm bg-[#4743F7] text-white"
                    : "rounded-2xl rounded-tl-sm border border-[#CFD3DB] bg-white text-[#0B0F1A]",
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