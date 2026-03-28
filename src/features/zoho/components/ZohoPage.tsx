/**
 * Zoho page — overview of support tickets sent to hjalp@dk.is via Zoho.
 * Uses: @/shared/components/PageTemplate
 * Exports: ZohoPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function ZohoPage() {
  return (
    <PageTemplate
      title="Zoho mál"
      description="Yfirlit yfir sendar beiðnir og mál hjá DK þjónustudeild."
    >
      <p className="text-[var(--color-text-secondary)]">Hér mun koma yfirlit yfir Zoho mál sem hafa verið send á hjalp@dk.is.</p>
    </PageTemplate>
  );
}
