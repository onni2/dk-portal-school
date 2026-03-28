/**
 * dkPlus page — overview of the company's dkPlus subscription.
 * Uses: @/shared/components/PageTemplate
 * Exports: DkPlusPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function DkPlusPage() {
  return (
    <PageTemplate
      title="dkPlus"
      description="Yfirlit yfir dkPlus lausnina."
    >
      <p className="text-[var(--color-text-secondary)]">Hér mun koma yfirlit yfir dkPlus.</p>
    </PageTemplate>
  );
}
