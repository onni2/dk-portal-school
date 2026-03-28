/**
 * Subscription products page — lists DK products the company subscribes to.
 * Uses: @/shared/components/PageTemplate
 * Exports: SubscriptionProductsPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function SubscriptionProductsPage() {
  return (
    <PageTemplate
      title="Vörur dk"
      description="Yfirlit yfir DK vörur sem fyrirtækið er með í áskrift."
    >
      <p className="text-[var(--color-text-secondary)]">Hér mun koma listi yfir vörur.</p>
    </PageTemplate>
  );
}
