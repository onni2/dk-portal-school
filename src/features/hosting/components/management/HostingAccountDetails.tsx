/**
 * Right-column detail panel for a selected hosting account on the Hosting Management page.
 * Tabs between Duo MFA and the hosting account info (status, linked portal user, password reset, delete, sign-out).
 * Uses: ../../api/hosting.queries, ../../types/hosting.types, ../duo/AdminDuoPanel, ../HostingLoginHistoryTable, ../TabSwitcher
 * Exports: HostingAccountDetails
 */
import { useState } from "react";
import type { HostingAccount } from "../../types/hosting.types";
import { AdminDuoPanel } from "../duo/AdminDuoPanel";
import { TabSwitcher } from "../TabSwitcher";
import { HostingPanel } from "./HostingPanel";

interface HostingAccountDetailsProps {
  account: HostingAccount | null;
  onResetPassword?: () => void;
  onDeleteAccount?: () => void;
  onSignOut: () => void;
  onManagePortalUserLink?: () => void;
  isResettingPassword?: boolean;
  isDeleting?: boolean;
  isSigningOut?: boolean;
}

const hostingDetailsTabs = [
  { value: "duo", label: "Duo Auðkenning" },
  { value: "hosting", label: "Hýsingaraðgangur" },
] as const;

type Tab = (typeof hostingDetailsTabs)[number]["value"];

interface PanelProps extends HostingAccountDetailsProps {
  account: HostingAccount;
}

function HostingAccountDetailsPanel({
  account,
  onResetPassword,
  onDeleteAccount,
  onSignOut,
  onManagePortalUserLink,
  isResettingPassword,
  isDeleting,
  isSigningOut,
}: PanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("duo");

  return (
    <div className="flex flex-col">
      <section className="flex min-w-0 flex-col">
        <TabSwitcher
          tabs={hostingDetailsTabs}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "duo" && <AdminDuoPanel accountId={account.id} />}

        {activeTab === "hosting" && (
          <HostingPanel
            account={account}
            onResetPassword={onResetPassword}
            onDeleteAccount={onDeleteAccount}
            onSignOut={onSignOut}
            onManagePortalUserLink={onManagePortalUserLink}
            isResettingPassword={isResettingPassword}
            isDeleting={isDeleting}
            isSigningOut={isSigningOut}
          />
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
  onManagePortalUserLink,
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
      onManagePortalUserLink={onManagePortalUserLink}
      isResettingPassword={isResettingPassword}
      isDeleting={isDeleting}
      isSigningOut={isSigningOut}
    />
  );
}