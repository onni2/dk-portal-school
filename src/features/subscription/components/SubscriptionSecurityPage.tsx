/**
 * Subscription security & privacy page.
 * Uses: @/shared/components/PageTemplate
 * Exports: SubscriptionSecurityPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function SubscriptionSecurityPage() {
  return (
    <PageTemplate
      title="Öryggi og persónuvernd"
      description="Stillingar tengdar öryggi og persónuvernd fyrir fyrirtækið."
    >
      <p className="text-[var(--color-text-secondary)]">Hér munu koma öryggisstillingar.</p>
    </PageTemplate>
  );
}
