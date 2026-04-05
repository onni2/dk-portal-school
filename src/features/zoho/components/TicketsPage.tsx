/**
 * Zoho ticket system page — ticket list on the left, email thread on the right.
 * Read-only view of support tickets from Neon DB.
 * Uses: @/shared/utils/cn, ../api/tickets.queries, ./TicketList, ./TicketThread
 * Exports: TicketsPage
 */
import { useState } from "react";
import { useTickets, useTicket } from "../api/tickets.queries";
import { TicketList } from "./TicketList";
import { TicketThread } from "./TicketThread";

/**
 *
 */
export function TicketsPage() {
  const { data: tickets = [], isLoading } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = selectedId ?? tickets[0]?.id ?? null;
  const { data: selectedTicket, isLoading: isLoadingThread } = useTicket(activeId);

  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Left panel — ticket list */}
      <div className="flex w-96 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
          <h2 className="text-[15px] font-semibold text-[var(--color-text)]">Mínar Beiðnir</h2>
        </div>
        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          selectedId={activeId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Right panel — thread */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[var(--color-background)]">
        {isLoadingThread ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Hleður...</p>
          </div>
        ) : selectedTicket ? (
          <TicketThread ticket={selectedTicket} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Veldu beiðni til að skoða</p>
          </div>
        )}
      </div>
    </div>
  );
}