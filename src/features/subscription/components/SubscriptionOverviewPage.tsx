/**
 * Subscription overview page — shows the company's current subscription summary.
 * Uses: @/shared/components/PageTemplate
 * Exports: SubscriptionOverviewPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function SubscriptionOverviewPage() {
  return (
    <PageTemplate
      title="Yfirlit áskriftar"
      description="Yfirlit yfir áskrift fyrirtækisins hjá DK Hugbúnaði."
    >
      <p className="text-[var(--color-text-secondary)]">Hér mun koma yfirlit yfir áskrift.</p>
    </PageTemplate>
  );
}
