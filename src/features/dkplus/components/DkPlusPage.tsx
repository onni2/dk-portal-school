import { Suspense, useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AuthTokensPanel } from "./AuthTokensPanel";
import { AuthTokenApiLogsPage } from "./AuthTokenApiLogsPage";
import type { AuthToken } from "../types/dkplus.types";

const HELP_URL = "/knowledge-base?view=product&productId=%22691274000000951112%22";

function HelpButton() {
  return (
    <a
      href={HELP_URL}
      className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm font-medium text-(--color-text) transition-colors hover:bg-(--color-surface-hover)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      Hjálp
    </a>
  );
}

export function DkPlusPage() {
  const [logToken, setLogToken] = useState<AuthToken | null>(null);

  return (
    <PageTemplate
      title={logToken ? `${logToken.description} — Notkun` : "dk vefþjónustur"}
      description={logToken ? undefined : "Á þessari síðu er hægt að stofna auðkenningartákn til að tengja vefþjónustur við bókhaldskerfið þitt. Einnig er hægt að sjá notkun á auðkenningartáknunum."}
      actions={logToken ? undefined : <HelpButton />}
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
