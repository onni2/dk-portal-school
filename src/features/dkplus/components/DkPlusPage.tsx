import { Suspense, useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AuthTokensPanel } from "./AuthTokensPanel";
import { AuthTokenApiLogsPage } from "./AuthTokenApiLogsPage";
import type { AuthToken } from "../types/dkplus.types";

export function DkPlusPage() {
  const [logToken, setLogToken] = useState<AuthToken | null>(null);

  return (
    <PageTemplate
      title={logToken ? `${logToken.description} — API Yfirlit` : "dkPlus"}
      description={logToken ? undefined : "Yfirlit yfir dkPlus lausnina."}
    >
      <Suspense fallback={<LoadingSpinner />}>
        {logToken ? (
          <AuthTokenApiLogsPage token={logToken} onBack={() => setLogToken(null)} />
        ) : (
          <AuthTokensPanel onViewLogs={setLogToken} />
        )}
      </Suspense>
    </PageTemplate>
  );
}
