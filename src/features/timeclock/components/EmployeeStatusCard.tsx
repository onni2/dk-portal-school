/**
 * Card for a single employee showing their name, email, last stamp time, current in/out status, and a stamp button.
 * Uses: @/shared/components/Badge, @/shared/components/Button, @/shared/components/Card, ../types/timeclock.types
 * Exports: EmployeeStatusCard
 */
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import type { TimeclockEmployee } from "../types/timeclock.types";

interface EmployeeStatusCardProps {
  employee: TimeclockEmployee;
  onStamp: (employeeNumber: string) => void;
  isStamping: boolean;
}

/**
 *
 */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("is-IS", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 *
 */
export function EmployeeStatusCard({
  employee,
  onStamp,
  isStamping,
}: EmployeeStatusCardProps) {
  const isClockedIn = employee.StampStatus === 1;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-[var(--color-text)]">
            {employee.Name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {employee.Email}
          </p>
        </div>
        <Badge variant={isClockedIn ? "success" : "default"}>
          {isClockedIn ? "Inni" : "Úti"}
        </Badge>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)]">
        Síðasta stimpilun: {formatTime(employee.LastStampTime)}
      </p>
      <Button
        variant={isClockedIn ? "danger" : "primary"}
        size="sm"
        onClick={() => onStamp(employee.Number)}
        disabled={isStamping}
      >
        {isStamping
          ? "Hleð..."
          : isClockedIn
            ? "Útstimpla"
            : "Innstimpla"}
      </Button>
    </Card>
  );
}
