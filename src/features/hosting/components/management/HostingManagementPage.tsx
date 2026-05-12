import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageTemplate } from "@/shared/components/PageTemplate";
import {
  useChangeHostingAccountPassword,
  useHostingAccounts,
  useInvalidateHostingAccounts,
  useSignOutHostingAccount,
} from "../../api/hosting.queries";
import { deleteHostingAccount } from "../../api/hosting.api";
import { CreateHostingUserModal } from "../CreateHostingUserModal";
import { HostingPasswordChangeDialog } from "../HostingPasswordChangeDialog";
import { HostingSignOutDialog } from "../HostingSignOutDialog";
import { HostingAccountDetails } from "./HostingAccountDetails";
import { HostingAccountList } from "./HostingAccountList";
import { HostingPortalUserLinkDialog } from "./HostingPortalUserLinkDialog";

export function HostingManagementPage() {
  const { data: accounts = [] } = useHostingAccounts();
  const invalidateHostingAccounts = useInvalidateHostingAccounts();

  const [selectedId, setSelectedId] = useState<string | null>(
    accounts[0]?.id ?? null,
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPortalUserLinkDialog, setShowPortalUserLinkDialog] =
    useState(false);

  const selectedAccount = useMemo(
    () =>
      accounts.find((account) => account.id === selectedId) ??
      accounts[0] ??
      null,
    [accounts, selectedId],
  );

  const passwordMutation = useChangeHostingAccountPassword();
  const signOutMutation = useSignOutHostingAccount();

  const deleteMutation = useMutation({
    mutationFn: deleteHostingAccount,
    onSuccess: async () => {
      setSelectedId(null);
      await invalidateHostingAccounts();
    },
  });

  async function handleCreated() {
    await invalidateHostingAccounts();
  }

  function handleChangePassword() {
    if (!selectedAccount) return;
    setShowPasswordModal(true);
  }

  function handleManagePortalUserLink() {
    if (!selectedAccount) return;
    setShowPortalUserLinkDialog(true);
  }

  function handleDeleteAccount() {
    if (!selectedAccount) return;

    const confirmed = confirm(
      `Ertu viss um að þú viljir eyða hýsingaraðganginum ${selectedAccount.username}?`,
    );

    if (!confirmed) return;

    deleteMutation.mutate(selectedAccount.id);
  }

  async function handleSignOut() {
    if (!selectedAccount) return;

    await signOutMutation.mutateAsync(selectedAccount.id);
    setShowSignOutConfirm(false);
  }

  async function handleChangeHostingPassword(password: string) {
    if (!selectedAccount) {
      throw new Error("Enginn hýsingaraðgangur valinn.");
    }

    await passwordMutation.mutateAsync({
      id: selectedAccount.id,
      password,
    });
  }

  async function handlePortalUserLinkDialogClose() {
    setShowPortalUserLinkDialog(false);
    await invalidateHostingAccounts();
  }

  return (
    <PageTemplate
      title="Hýsingarstjórnun"
      description="Sjáðu yfirlit yfir hýsingarnotendur fyrirtækisins og stjórnaðu aðgangi þeirra, lykilorðum og Duo fjölþátta auðkenningu."
      actions={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
        >
          Stofna hýsingaraðgang
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        {passwordMutation.isError && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-4 py-3 text-sm text-(--color-error)">
            {(passwordMutation.error as { message?: string })?.message ??
              "Tókst ekki að breyta lykilorði."}
          </p>
        )}

        {deleteMutation.isError && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-4 py-3 text-sm text-(--color-error)">
            {(deleteMutation.error as { message?: string })?.message ??
              "Tókst ekki að eyða hýsingaraðgangi."}
          </p>
        )}

        {signOutMutation.isError && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-4 py-3 text-sm text-(--color-error)">
            {(signOutMutation.error as { message?: string })?.message ??
              "Tókst ekki að skrá út úr hýsingunni."}
          </p>
        )}

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-12 text-center">
            <p className="text-sm font-medium text-(--color-text)">
              Engir hýsingaraðgangar fundust.
            </p>

            <p className="mt-1 text-sm text-(--color-text-secondary)">
              Stofnaðu fyrsta hýsingaraðganginn fyrir þetta fyrirtæki.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_1fr]">
            <HostingAccountList
              accounts={accounts}
              selectedAccountId={selectedAccount?.id ?? null}
              onSelectAccount={setSelectedId}
            />

            <HostingAccountDetails
              account={selectedAccount}
              onResetPassword={handleChangePassword}
              onDeleteAccount={handleDeleteAccount}
              onSignOut={() => setShowSignOutConfirm(true)}
              onManagePortalUserLink={handleManagePortalUserLink}
              isResettingPassword={passwordMutation.isPending}
              isDeleting={deleteMutation.isPending}
              isSigningOut={signOutMutation.isPending}
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateHostingUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => void handleCreated()}
        />
      )}

      {showPasswordModal && selectedAccount && (
        <HostingPasswordChangeDialog
          username={selectedAccount.username}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowPasswordModal(false)}
          onSubmitPassword={handleChangeHostingPassword}
        />
      )}

      {showPortalUserLinkDialog && selectedAccount && (
        <HostingPortalUserLinkDialog
          account={selectedAccount}
          onClose={() => void handlePortalUserLinkDialogClose()}
        />
      )}

      {showSignOutConfirm && selectedAccount && (
        <HostingSignOutDialog
          username={selectedAccount.username}
          isLoading={signOutMutation.isPending}
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={() => void handleSignOut()}
        />
      )}
    </PageTemplate>
  );
}