import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/Button";
import { useRestartPosService, useRestartPosRestService } from "../api/pos.queries";
import type { PosService, PosServiceType } from "../types/pos.types";

interface PosServiceCardProps {
  service: PosService;
  serviceType: PosServiceType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function PosServiceCard({ service, serviceType, isSelected, onSelect }: PosServiceCardProps) {
  const dkposRestart = useRestartPosService(service.id);
  const restRestart = useRestartPosRestService(service.id);
  const { mutate, isPending } = serviceType === "dkpos" ? dkposRestart : restRestart;

  const qc = useQueryClient();
  const prevState = useRef(service.state);
  useEffect(() => {
    if (prevState.current === "stopped" && service.state === "running") {
      qc.invalidateQueries({ queryKey: ["pos-service-logs", serviceType, service.id] });
    }
    prevState.current = service.state;
  }, [service.state, service.id, serviceType, qc]);

  const isRunning = service.state === "running";
  const isCoolingDown = !isRunning && !isPending;
  const isDisabled = isPending || isCoolingDown;

  return (
    <div
      className={cn(
        "cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md",
        isSelected
          ? "border-[#4743F7]"
          : "border-[#CFD3DB]",
      )}
      onClick={() => onSelect(service.id)}
    >
      {/* Header */}
      <div className={cn(
        "border-b border-[#CFD3DB] px-4 py-3",
        isSelected ? "bg-[#4743F7]/5" : "bg-[#F6F8FC]",
      )}>
        <h3 className="text-[13px] font-semibold text-[#0B0F1A]">{service.id}</h3>
      </div>

      {/* Status + button */}
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", isRunning ? "bg-green-500" : "bg-red-500")} />
          <span className={cn("text-[13px] font-medium", isRunning ? "text-green-700" : "text-red-600")}>
            {isRunning ? "Í gangi" : "Stoppað"}
          </span>
        </div>
        <Button
          className={cn(
            "rounded-full px-4 text-[12px] text-white transition-colors",
            isDisabled
              ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
              : "bg-green-600 hover:bg-green-700",
          )}
          size="sm"
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service.id);
            mutate();
          }}
        >
          {isPending ? "..." : isCoolingDown ? "Starting..." : "Restart"}
        </Button>
      </div>
    </div>
  );
}