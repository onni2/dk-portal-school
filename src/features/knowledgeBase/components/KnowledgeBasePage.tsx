/**
 * Knowledge base page — guides and instructions for DK products, sourced from Zoho.
 * Uses: @/shared/components/PageTemplate
 * Exports: KnowledgeBasePage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function KnowledgeBasePage() {
  return (
    <PageTemplate
      title="Hjálparmiðstöð"
      description="Leiðbeiningar og myndbönd um notkun á vörum DK Hugbúnaðar."
    >
      <p className="text-(--color-text-secondary)">Hér munu koma leiðbeiningar og hjálparefni.</p>
    </PageTemplate>
  );
}
