import { Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { UmsyslusvaeðiTab } from "./UmsyslusvaeðiTab";

export function UmsyslusvaeðiPage() {
  return (
    <PageTemplate
      title="Umsýslusvæði"
      description="Fyrirtæki sem eru skráð undir þitt fyrirtæki."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <UmsyslusvaeðiTab />
      </Suspense>
    </PageTemplate>
  );
}
