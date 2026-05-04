/**
 * Composes the timeclock admin page: company info, IP whitelist, and employee phone numbers.
 * Uses: ./TimeclockCompanyCard, ./IpWhitelistPanel, ./EmployeePhonesPanel, ./TimeclockSkeletons
 * Exports: TimeclockPage
 */
import { Suspense } from "react";
import { TimeclockCompanyCard } from "./TimeclockCompanyCard";
import { IpWhitelistPanel } from "./IpWhitelistPanel";
import { EmployeePhonesPanel } from "./EmployeePhonesPanel";
import { PanelSkeleton } from "./TimeclockSkeletons";

export function TimeclockPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PanelSkeleton />}>
        <TimeclockCompanyCard />
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
