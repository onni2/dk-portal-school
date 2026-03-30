/**
 * POS page — overview of the company's POS system.
 * Uses: @/shared/components/PageTemplate
 * Exports: PosPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function PosPage() {
  return (
    <PageTemplate
      title="POS"
      description="Yfirlit yfir kassakerfi fyrirtækisins."
    >
      <p className="text-(--color-text-secondary)">Hér mun koma yfirlit yfir POS kerfið.</p>
    </PageTemplate>
  );
}
