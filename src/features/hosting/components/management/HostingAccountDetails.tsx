/**
 * Right-column detail panel for a selected hosting account on the Hosting Management page.
 * Tabs between Duo MFA and the hosting account info (status, linked portal user, password reset, delete, sign-out).
 * Uses: ../../api/hosting.queries, ../../types/hosting.types, ../duo/AdminDuoPanel, ../HostingLoginHistoryTable, ../TabSwitcher
 * Exports: HostingAccountDetails
 */
import { useState } from "react";
import { useHostingAccountLog } from "../../api/hosting.queries";
import type { HostingAccount } from "../../types/hosting.types";
import { AdminDuoPanel } from "../duo/AdminDuoPanel";
import { HostingLoginHistoryTable } from "../HostingLoginHistoryTable";
import { TabSwitcher } from "../TabSwitcher";

interface HostingAccountDetailsProps {
  account: HostingAccount | null;
  onResetPassword?: () => void;
  onDeleteAccount?: () => void;
  onSignOut?: () => void;
  isResettingPassword?: boolean;
  isDeleting?: boolean;
  isSigningOut?: boolean;
}

const adminDetailsTabs = [
  { value: "duo", label: "Duo Auðkenning" },
  { value: "hosting", label: "Hýsingaraðgangur" },
] as const;

type Tab = (typeof adminDetailsTabs)[number]["value"];

function getStatusLabel(status: string | null) {
  if (!status) return "Óþekkt";
  if (status === "active") return "Virkur";
  if (status === "disabled") return "Óvirkur";
  if (status === "deleted") return "Eytt";
  if (status === "logged_in") return "Innskráður";
  if (status === "logged_out") return "Útskráður";
  return status;
}

interface PanelProps extends HostingAccountDetailsProps {
  account: HostingAccount;
}

function HostingAccountDetailsPanel({
  account,
  onResetPassword,
  onDeleteAccount,
  onSignOut,
  isResettingPassword,
  isDeleting,
  isSigningOut,
}: PanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("duo");
  const { data: log = [] } = useHostingAccountLog(account.id);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex min-w-0 flex-col">
        <TabSwitcher
          tabs={adminDetailsTabs}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "duo" && <AdminDuoPanel accountId={account.id} />}

        {activeTab === "hosting" && (
          <div className="flex flex-col gap-4">
            <div className="mt-2.5  rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
              <div className="flex gap-6">
                <div className="flex min-w-0 flex-1 flex-col gap- text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                      Hýsingarnotandi
                    </p>
                    <p className="mt-1 font-mono text-(--color-text)">
                      {account.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                      Staða
                    </p>
                    <p className="mt-1 text-(--color-text)">
                      {getStatusLabel(account.status)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                      MFA
                    </p>
                    <p className="mt-1 text-(--color-text)">
                      {account.hasMfa ? "Virkt" : "Óvirkt"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                      Tengdur mínum síðum notanda
                    </p>
                    {account.linkedPortalUser ? (
                      <p className="mt-1 text-(--color-text)">
                        {account.linkedPortalUser.name}
                      </p>
                    ) : (
                      <p className="mt-1 text-(--color-text-secondary)">
                        Enginn tengdur
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={onResetPassword}
                    disabled={!onResetPassword || isResettingPassword}
                    className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
                  >
                    {isResettingPassword ? "Endurset..." : "Endursetja lykilorð"}
                  </button>

                  <button
                    type="button"
                    onClick={onDeleteAccount}
                    disabled={!onDeleteAccount || isDeleting}
                    className="rounded-lg border border-(--color-error) px-4 py-2 text-sm font-medium text-(--color-error) hover:bg-(--color-error-bg) disabled:opacity-50"
                  >
                    {isDeleting ? "Eyði..." : "Eyða aðgangi"}
                  </button>

                  {account.status === "logged_in" && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      disabled={!onSignOut || isSigningOut}
                      className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
                    >
                      {isSigningOut ? "Skrá út..." : "Skrá út"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <HostingLoginHistoryTable log={log} />    
          </div>
        )}
      </section>
    </div>
  );
}

/** Renders an empty-state placeholder when no account is selected; otherwise mounts the detail panel. */
export function HostingAccountDetails({
  account,
  onResetPassword,
  onDeleteAccount,
  onSignOut,
  isResettingPassword,
  isDeleting,
  isSigningOut,
}: HostingAccountDetailsProps) {
  if (!account) {
    return (
      <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-center">
        <p className="text-sm font-medium text-(--color-text)">
          Veldu hýsingaraðgang
        </p>

        <p className="mt-1 text-sm text-(--color-text-secondary)">
          Veldu aðgang úr listanum til að sjá nánari upplýsingar.
        </p>
      </div>
    );
  }

  return (
    <HostingAccountDetailsPanel
      key={account.id}
      account={account}
      onResetPassword={onResetPassword}
      onDeleteAccount={onDeleteAccount}
      onSignOut={onSignOut}
      isResettingPassword={isResettingPassword}
      isDeleting={isDeleting}
      isSigningOut={isSigningOut}
    />
  );
}
