/**
 * Zoho page — overview of support tickets sent to hjalp@dk.is via Zoho.
 * Uses: @/shared/components/PageTemplate
 * Exports: ZohoPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

/** Placeholder page for the Zoho tickets section. Full ticket view is in TicketsPage. */
export function ZohoPage() {
  return (
    <PageTemplate
      title="Zoho mál"
      description="Yfirlit yfir sendar beiðnir og mál hjá DK þjónustudeild."
      info="Hér sérð þú öll þjónustumál sem hafa verið send til dk þjónustudeildar. Hægt er að skoða svör og fylgjast með stöðu mála. Til að opna nýtt mál skaltu hafa samband við þjónustudeild dk."
    >
      <p className="text-(--color-text-secondary)">Hér mun koma yfirlit yfir Zoho mál sem hafa verið send á hjalp@dk.is.</p>
    </PageTemplate>
  );
}
