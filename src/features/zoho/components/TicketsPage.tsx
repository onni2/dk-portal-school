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
import { useAuthStore } from "@/features/auth/store/auth.store";

export function TicketsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);

  const { data: tickets = [], isLoading } = useTickets(departmentId);
  const user = useAuthStore((s) => s.user);

  const filteredTickets = tickets.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.number.includes(search) ||
    t.preview.toLowerCase().includes(search.toLowerCase()),
  );

  const activeId = selectedId;
  const { data: selectedTicket, isLoading: isLoadingThread } = useTicket(activeId);

  function handleDepartmentChange(id: string | undefined) {
    setDepartmentId(id);
    if (selectedId) {
      const stillVisible = tickets.some((t) => t.id === selectedId && (!id || t.department?.id === id));
      if (!stillVisible) setSelectedId(null);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden -m-8 p-4 bg-[var(--color-background)]">
      {/* Page title */}
      <div className="mb-4 px-2">
        <h1 className="text-[30px] font-bold text-[#0B0F1A]">Þjónustubeiðnir</h1>
        <p className="text-[15px] text-[#5C667A]">Leitaðu að leiðbeiningum, leiðsögn og svörum við algengum spruningum</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left panel — ticket list */}
        <div className="flex w-80 min-w-64 shrink-0 flex-col overflow-hidden rounded-xl border border-[#CFD3DB] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between border-b border-[#CFD3DB] px-4 py-3">
            <h2 className="text-[15px] font-semibold text-[#0B0F1A]">Mínar Beiðnir</h2>
            <input
              type="text"
              placeholder="Leita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[#CFD3DB] bg-[#F6F8FC] px-2 py-1 text-[12px] text-[#0B0F1A] outline-none placeholder:text-[#5C667A] focus:border-[#4743F7]"
            />
          </div>
          <TicketList
            tickets={filteredTickets}
            isLoading={isLoading}
            selectedId={activeId}
            onSelect={setSelectedId}
            onDepartmentChange={handleDepartmentChange}
          />
        </div>

        {/* Right panel — thread */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {isLoadingThread ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">Hleður...</p>
            </div>
          ) : selectedTicket ? (
            <TicketThread ticket={selectedTicket} currentUserName={user?.name ?? ""} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">Veldu beiðni til að skoða</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}