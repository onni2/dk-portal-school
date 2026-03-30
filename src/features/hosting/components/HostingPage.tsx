/**
 * Hosting page — overview of the company's hosting with DK.
 * Uses: @/shared/components/PageTemplate
 * Exports: HostingPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function HostingPage() {
  return (
    <PageTemplate
      title="Hýsing"
      description="Yfirlit yfir hýsingarþjónustu fyrirtækisins hjá DK Hugbúnaði."
    >
      <p className="text-(--color-text-secondary)">Hér mun koma yfirlit yfir hýsingu og fjölþátta auðkenningu.</p>
    </PageTemplate>
  );
}
