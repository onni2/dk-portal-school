/**
 * Shows the company name and their stimpilklukka site URL (placeholder until they build it).
 * Uses: @/shared/components/Card, ../api/timeclock.queries
 * Exports: TimeclockCompanyCard
 */
import { Card } from "@/shared/components/Card";
import { useTimeclockConfig } from "../api/timeclock.queries";

export function TimeclockCompanyCard() {
  const { data: config } = useTimeclockConfig();

  return (
    <Card>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-(--color-text-muted)">Fyrirtæki</p>
          <p className="text-base font-semibold text-(--color-text)">
            {config.companyName}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-(--color-text-muted)">Stimpilklukka vefur</p>
          {config.timeclockUrl ? (
            <a
              href={config.timeclockUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-(--color-primary) hover:underline"
            >
              {config.timeclockUrl}
            </a>
          ) : (
            <p className="text-sm text-(--color-text-muted)">Ekki stillt</p>
          )}
        </div>
      </div>
    </Card>
  );
}
