/**
 * Composes the timeclock admin page: settings overview, IP whitelist, and employee phone numbers.
 * Uses: ./TimeclockSettingsCard, ./IpWhitelistPanel, ./EmployeePhonesPanel, ./TimeclockSkeletons
 * Exports: TimeclockPage
 */
import { Suspense } from "react";
import { TimeclockSettingsCard } from "./TimeclockSettingsCard";
import { IpWhitelistPanel } from "./IpWhitelistPanel";
import { EmployeePhonesPanel } from "./EmployeePhonesPanel";
import { SettingsSkeleton, PanelSkeleton } from "./TimeclockSkeletons";

export function TimeclockPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<SettingsSkeleton />}>
        <TimeclockSettingsCard />
      </Suspense>
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<PanelSkeleton />}>
          <IpWhitelistPanel />
        </Suspense>
        <Suspense fallback={<PanelSkeleton />}>
          <EmployeePhonesPanel />
        </Suspense>
      </div>
    </div>
  );
}
