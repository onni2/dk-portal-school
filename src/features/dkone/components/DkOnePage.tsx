/**
 * dkOne page — overview of the company's dkOne subscription.
 * Uses: @/shared/components/PageTemplate
 * Exports: DkOnePage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function DkOnePage() {
  return (
    <PageTemplate
      title="dkOne"
      description="Yfirlit yfir dkOne lausnina."
    >
      <p className="text-(--color-text-secondary)">Hér mun koma yfirlit yfir dkOne.</p>
    </PageTemplate>
  );
}
