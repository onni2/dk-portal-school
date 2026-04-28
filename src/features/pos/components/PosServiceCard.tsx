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

  const isRunning = service.state === "running";

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
        <h3 className="text-sm font-semibold text-(--color-text)">{service.display}</h3>
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
          className="rounded-full bg-green-600 px-5 text-white hover:bg-green-700"
          size="md"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            mutate();
          }}
        >
          {isPending ? "..." : "Restart"}
        </Button>
      </div>
    </div>
  );
}
