import { Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AuthTokensPanel } from "./AuthTokensPanel";

export function DkPlusPage() {
  return (
    <PageTemplate title="dkPlus" description="Yfirlit yfir dkPlus lausnina.">
      <Suspense fallback={<LoadingSpinner />}>
        <AuthTokensPanel />
      </Suspense>
    </PageTemplate>
  );
}
