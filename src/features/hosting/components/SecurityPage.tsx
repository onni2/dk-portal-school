/**
 * Security & privacy page for hosting.
 * Uses: @/shared/components/PageTemplate
 * Exports: SecurityPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function SecurityPage() {
  return (
    <PageTemplate
      title="Öryggi og persónuvernd"
      description="Á þessari síðu finnur þú yfirlit sem útskýrir hvernig dk Hugbúnaður ehf. uppfyllum kröfur ISO 27001, 27017 og 27018. Þar er lögð áhersla á gagnsæi, ábyrgð og örugga meðferð persónuupplýsinga."
    >
      <p className="text-(--color-text-secondary)">.</p>
    </PageTemplate>
  );
}
