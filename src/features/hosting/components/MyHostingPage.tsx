/**
 * MyHosting page — shows the logged-in user's own hosting account with Duo MFA management and login history.
 * Uses: @/features/auth/store/auth.store, ../api/hosting.queries, ../api/duo.queries, ./duo/DuoPanel,
 *       ./HostingAccountProfileCard, ./HostingLoginHistoryTable, ./HostingPasswordChangeDialog, ./HostingSignOutDialog, ./TabSwitcher
 * Exports: MyHostingPage
 */
import { useMemo, useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useMyHostingAccountOptional,
  useMyHostingLogOptional,
  useSignOutMyHosting,
} from "../api/hosting.queries";
import {
  useDuoDevicesOptional,
  useDuoUserOptional,
} from "../api/duo.queries";
import type { HostingLogEntry } from "../types/hosting.types";
import { DuoPanel } from "./duo/DuoPanel";
import { HostingAccountProfileCard } from "./HostingAccountProfileCard";
import { HostingLoginHistoryTable } from "./HostingLoginHistoryTable";
import { HostingPasswordChangeDialog } from "./HostingPasswordChangeDialog";
import { HostingSignOutDialog } from "./HostingSignOutDialog";
import { TabSwitcher } from "./TabSwitcher";

const hostingTabs = [
  { value: "duo", label: "Duo Auðkenning" },
  { value: "history", label: "Innskráningarsaga" },
] as const;

type Tab = (typeof hostingTabs)[number]["value"];

function isLoggedIn(log: HostingLogEntry[]) {
  const latest = log[0];
  return latest?.type === "login";
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/** Personal hosting page showing the logged-in user's account, password, sign-out, Duo setup, and login history. */
export function MyHostingPage() {
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const companyName = companies.find((c) => c.id === user?.companyId)?.name ?? "fyrirtækið";

  const {
    data: account,
    isError: accountIsError,
    isLoading: accountLoading,
  } = useMyHostingAccountOptional();

  const hasAccount = Boolean(account);

  const { data: log = [] } = useMyHostingLogOptional(hasAccount);
  const { data: duoUser } = useDuoUserOptional(hasAccount);
  const { data: duoDevices = [] } = useDuoDevicesOptional(hasAccount);

  const signOutMutation = useSignOutMyHosting();

  const [activeTab, setActiveTab] = useState<Tab>("duo");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [toast, setToast] = useState("");

  const displayName = duoUser?.displayName ?? account?.displayName ?? "Notandi";
  const username = account?.username ?? "—";

  const loggedIn = isLoggedIn(log);

  const activeDeviceCount = useMemo(
    () => duoDevices.filter((device) => device.status === "active").length,
    [duoDevices],
  );

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  async function handleSignOut() {
    await signOutMutation.mutateAsync();
    setShowSignOutConfirm(false);
    showToast("Þú hefur verið skráð(ur) út úr hýsingunni");
  }

  return (
    <PageTemplate
      title="Hýsingin mín"
      description="Hér getur þú stjórnað hýsingaraðgangi, lykilorði og Duo auðkenningu."
      info={`Þetta er persónulegur hýsingaraðgangur þinn hjá dk hugbúnaður fyrir ${companyName}. Hér getur þú breytt lykilorði og stillt Duo tvíþætta auðkenningu til að vernda aðganginn.`}
    >
      {accountLoading && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
          <p className="text-sm text-(--color-text-secondary)">
            Hleð hýsingarupplýsingum...
          </p>
        </div>
      )}

      {accountIsError && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            Enginn hýsingaraðgangur er tengdur þessum notanda. Hafðu samband við stjórnanda.
          </div>
        </div>
      )}

      {account && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
          <HostingAccountProfileCard
            username={username}
            displayName={displayName}
            hasMfa={account.hasMfa}
            activeDeviceCount={activeDeviceCount}
            loggedIn={loggedIn}
            onChangePassword={() => setShowPasswordModal(true)}
            onSignOut={() => setShowSignOutConfirm(true)}
            passwordDisabled={!account}
            signOutDisabled={!account || signOutMutation.isPending || !loggedIn}
            signOutLoading={signOutMutation.isPending}
          />

          <section className="flex min-w-0 flex-col">
            <TabSwitcher
              tabs={hostingTabs}
              active={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === "duo" ? (
              <DuoPanel />
            ) : (
              <HostingLoginHistoryTable log={log} />
            )}
          </section>
        </div>
      )}

      {showPasswordModal && (
        <HostingPasswordChangeDialog
          username={username}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => showToast("Lykilorð uppfært")}
        />
      )}

      {showSignOutConfirm && (
        <HostingSignOutDialog
          username={username}
          isLoading={signOutMutation.isPending}
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={() => void handleSignOut()}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-(--color-success) px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckIcon className="h-4 w-4" />
          {toast}
        </div>
      )}
    </PageTemplate>
  );
}