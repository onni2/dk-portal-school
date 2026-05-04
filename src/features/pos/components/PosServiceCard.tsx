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
        "cursor-pointer overflow-hidden rounded-xl border transition-colors",
        isSelected
          ? "border-(--color-primary)"
          : "border-(--color-border) hover:border-(--color-text-secondary)",
      )}
      onClick={() => onSelect(service.id)}
    >
      <div className="border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
        <h3 className="text-sm font-semibold text-(--color-text)">{service.id}</h3>
      </div>
      <div className="flex items-center justify-between bg-(--color-background) px-4 py-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-3 w-3 rounded-full",
              isRunning ? "bg-green-500" : "bg-red-500",
            )}
          />
          <span className="text-sm font-medium text-(--color-text)">
            {isRunning ? "Í gangi (Running)" : "Stoppað (Not Running)"}
          </span>
        </div>
        <Button
          className={cn(
            "rounded-full px-5 text-white transition-colors",
            isDisabled
              ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
              : "bg-green-600 hover:bg-green-700",
          )}
          size="md"
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
