import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageTemplate } from "@/shared/components/PageTemplate";
import {
  useHostingAccounts,
  useInvalidateHostingAccounts,
} from "../../api/hosting.queries";
import {
  deleteHostingAccount,
  resetHostingPassword,
} from "../../api/hosting.api";
import { CreateHostingUserModal } from "../CreateHostingUserModal";
import { HostingAccountDetails } from "./HostingAccountDetails";
import { HostingAccountList } from "./HostingAccountList";

export function HostingManagementPage() {
  const { data: accounts = [] } = useHostingAccounts();
  const invalidateHostingAccounts = useInvalidateHostingAccounts();

  const [selectedId, setSelectedId] = useState<string | null>(
    accounts[0]?.id ?? null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [tempPasswordUsername, setTempPasswordUsername] = useState("");

  const selectedAccount = useMemo(
    () =>
      accounts.find((account) => account.id === selectedId) ??
      accounts[0] ??
      null,
    [accounts, selectedId],
  );

  const resetPasswordMutation = useMutation({
    mutationFn: resetHostingPassword,
    onSuccess: async (result) => {
      setTempPassword(result.tempPassword);
      setTempPasswordUsername(selectedAccount?.username ?? "");
      await invalidateHostingAccounts();
    },
  });

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

  function handleResetPassword() {
    if (!selectedAccount) return;
    resetPasswordMutation.mutate(selectedAccount.id);
  }

  function handleDeleteAccount() {
    if (!selectedAccount) return;

    const confirmed = confirm(
      `Ertu viss um að þú viljir eyða hýsingaraðganginum ${selectedAccount.username}?`,
    );

    if (!confirmed) return;

    deleteMutation.mutate(selectedAccount.id);
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
        {resetPasswordMutation.isError && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-4 py-3 text-sm text-(--color-error)">
            {(resetPasswordMutation.error as { message?: string })?.message ??
              "Tókst ekki að endursetja lykilorð."}
          </p>
        )}

        {deleteMutation.isError && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-4 py-3 text-sm text-(--color-error)">
            {(deleteMutation.error as { message?: string })?.message ??
              "Tókst ekki að eyða hýsingaraðgangi."}
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
              onResetPassword={handleResetPassword}
              onDeleteAccount={handleDeleteAccount}
              isResettingPassword={resetPasswordMutation.isPending}
              isDeleting={deleteMutation.isPending}
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

      {tempPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setTempPassword("")}
        >
          <div
            className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-(--color-text)">
              Lykilorð endursett
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Nýtt tímabundið lykilorð fyrir{" "}
              <span className="font-mono font-medium text-(--color-text)">
                {tempPasswordUsername}
              </span>
              :
            </p>

            <div className="mt-4 rounded-lg bg-(--color-surface-hover) px-4 py-3 font-mono text-base text-(--color-text)">
              {tempPassword}
            </div>

            <p className="mt-3 text-xs text-(--color-text-secondary)">
              Þetta lykilorð er aðeins sýnt einu sinni.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setTempPassword("")}
                className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
              >
                Loka
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}