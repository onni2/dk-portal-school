/**
 * Umsýslusvæði page — shows sub-companies registered under the active company in dkOne.
 * Uses: @/shared/components/PageTemplate, @/shared/components/LoadingSpinner, ./UmsyslusvaeðiTab
 * Exports: UmsyslusvaeðiPage
 */
import { Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { UmsyslusvaeðiTab } from "./UmsyslusvaeðiTab";

/** Read-only list of sub-companies under the active company. */
export function UmsyslusvaeðiPage() {
  return (
    <PageTemplate
      title="Umsýslusvæði"
      description="Fyrirtæki sem eru skráð undir þitt fyrirtæki."
      info="Hér sérðu öll undirfyrirtæki sem eru tengd við þitt fyrirtæki. Þú getur bætt við fyrirtækjum sem þegar eru til í kerfinu eða fjarlægt tengingu við þau. Hægt er að leita og raða listanum eftir nafni eða auðkenni."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <UmsyslusvaeðiTab />
      </Suspense>
    </PageTemplate>
  );
}
