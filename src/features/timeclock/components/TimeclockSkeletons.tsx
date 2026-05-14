/**
 * Skeleton placeholders that match the shape of each timeclock card while data is loading.
 * Uses: @/shared/components/Card, @/shared/components/Skeleton
 * Exports: PanelSkeleton
 */
import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Skeleton";

/** Matches the shape of IpWhitelistPanel, EmployeePhonesPanel, and TimeclockCompanyCard */
export function PanelSkeleton() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-20 rounded-[var(--radius-md)]" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-t border-(--color-border) py-3 first:border-t-0"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-7 w-16 rounded-[var(--radius-md)]" />
        </div>
      ))}
    </Card>
  );
}
