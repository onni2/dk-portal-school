import { Suspense, useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AuthTokensPanel } from "./AuthTokensPanel";
import { AuthTokenApiLogsPage } from "./AuthTokenApiLogsPage";
import { CreateAuthTokenModal } from "./CreateAuthTokenModal";
import type { AuthToken } from "../types/dkplus.types";

export function DkPlusPage() {
  const [logToken, setLogToken] = useState<AuthToken | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <PageTemplate
        title={logToken ? `${logToken.description} — Notkun` : "dk vefþjónustur"}
        info={
          logToken
            ? undefined
            : "Á þessari síðu er hægt að stofna auðkenningartákn til að tengja vefþjónustur við bókhaldskerfið þitt. Einnig er hægt að sjá notkun á auðkenningartáknunum með því að ýta á 'Sjá notkun' hnappinn."
        }
        actions={
          logToken ? undefined : (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
            >
              Stofna tákn
            </button>
          )
        }
      >
        <Suspense fallback={<LoadingSpinner />}>
          {logToken ? (
            <AuthTokenApiLogsPage token={logToken} onBack={() => setLogToken(null)} />
          ) : (
            <AuthTokensPanel onViewLogs={setLogToken} />
          )}
        </Suspense>
      </PageTemplate>

      {showCreateModal && (
        <CreateAuthTokenModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}
