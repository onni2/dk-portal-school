/**
 * Sub-companies page — shows sub-companies registered under the active company in dkOne.
 * Uses: @/shared/components/PageTemplate, @/shared/components/LoadingSpinner, ./SubCompaniesTab
 * Exports: SubCompaniesPage
 */
import { Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { SubCompaniesTab } from "./SubCompaniesTab";

/** Read-only list of sub-companies under the active company. */
export function SubCompaniesPage() {
  return (
    <PageTemplate
      title="Umsýslusvæði"
      description="Fyrirtæki sem eru skráð undir þitt fyrirtæki."
      info="Hér sérðu öll undirfyrirtæki sem eru tengd við þitt fyrirtæki. Þú getur bætt við fyrirtækjum sem þegar eru til í kerfinu eða fjarlægt tengingu við þau. Hægt er að leita og raða listanum eftir nafni eða auðkenni."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <SubCompaniesTab />
      </Suspense>
    </PageTemplate>
  );
}
