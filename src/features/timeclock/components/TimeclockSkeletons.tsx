/**
 * Skeleton placeholders that match the shape of each timeclock card while data is loading.
 * Uses: @/shared/components/Card, @/shared/components/Skeleton
 * Exports: SettingsSkeleton, PanelSkeleton
 */
import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Skeleton";

/** Matches the shape of TimeclockSettingsCard */
export function SettingsSkeleton() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Matches the shape of IpWhitelistPanel and EmployeePhonesPanel */
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
          className="flex items-center justify-between border-t border-[var(--color-border)] py-3 first:border-t-0"
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
