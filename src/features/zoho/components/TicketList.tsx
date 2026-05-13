/**
 * Scrollable list of ticket cards in the left panel, with department filter.
 * Uses: @/shared/utils/cn, ../types/ticket.types, ../api/tickets.queries
 * Exports: TicketList
 */
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import type { Ticket, TicketStatus } from "../types/ticket.types";
import { useDepartments } from "../api/tickets.queries";

interface Props {
  tickets: Ticket[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDepartmentChange: (departmentId: string | undefined) => void;
}

// hardcoded colors here to match the Zoho/DK design — not using CSS vars intentionally
const STATUS_STYLES: Record<TicketStatus, { label: string; bg: string; text: string }> = {
  opið:  { label: "OPIÐ",  bg: "bg-[#E3F2FD]", text: "text-[#4743F7]" },
  lokað: { label: "LOKAÐ", bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("is-IS", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Scrollable list of ticket cards with a department filter dropdown at the top. */
export function TicketList({ tickets, isLoading, selectedId, onSelect, onDepartmentChange }: Props) {
  const [selectedDept, setSelectedDept] = useState<string>("");
  const { data: departments = [] } = useDepartments();

  function handleDeptChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedDept(val);
    onDepartmentChange(val === "" ? undefined : val); // empty string = no filter
  }

  return (
    <div className="flex h-full flex-col">
      {/* Department filter */}
      <div className="border-b border-[var(--color-border)] px-3 py-2.5">
        <select
          value={selectedDept}
          onChange={handleDeptChange}
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Allar deildir</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ticket list */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-sm text-[var(--color-text-secondary)]">Hleður...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-sm text-[var(--color-text-secondary)]">Engar beiðnir fundust</p>
        </div>
      ) : (
        <div className="nav-scroll flex flex-col gap-3 overflow-y-auto px-3 pt-3 pb-20"> {/* pb-20: breathing room so last card isn't clipped */}
          {tickets.map((ticket) => {
            const isSelected = ticket.id === selectedId;
            const status = STATUS_STYLES[ticket.status];

            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => onSelect(ticket.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors hover:bg-[#EAF3FF]",
                  isSelected
                    ? "border-[#4743F7] bg-[#EAF3FF]"
                    : "border-[#CFD3DB] bg-white",
                )}
              >
                {/* Top row — ticket number + status badge */}
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[14px] font-semibold tracking-tight text-[#4743F7]">
                    #{ticket.number}
                  </span>
                  <span className={cn("rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold", status.bg, status.text)}>
                    {status.label}
                  </span>
                </div>

                {/* Title */}
                <p className="mb-3 text-[13px] font-semibold leading-snug text-[#0B0F1A]">
                  {ticket.title}
                </p>

                {/* Department + date row */}
                <div className="flex items-center justify-between">
                  <span className="rounded-[3px] bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#5C667A]">
                    {ticket.department?.name ?? ""}
                  </span>
                  <p className="text-[10px] tracking-tight text-[#5C667A]">
                    Uppfært {formatDate(ticket.updatedAt)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}