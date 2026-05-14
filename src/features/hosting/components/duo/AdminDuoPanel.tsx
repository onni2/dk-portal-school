/**
 * Admin Duo MFA panel for the Hosting Management page — shows Duo user details and device list for a specific hosting account.
 * Devices are only fetched after the user is confirmed to exist to avoid race conditions.
 * Uses: ../../api/duo.queries, ./AdminDuoDeviceCreateDialog, ./DuoDeviceList, ./DuoUserDetailsCard
 * Exports: AdminDuoPanel
 */
import { useState } from "react";
import {
  useAdminDuoUser,
  useAdminDuoDevices,
  useDeleteAdminDuoDevice,
  useUpdateAdminDuoUser,
} from "../../api/duo.queries";
import { AdminDuoDeviceCreateDialog } from "./AdminDuoDeviceCreateDialog";
import { DuoDeviceList } from "./DuoDeviceList";
import { DuoUserDetailsCard } from "./DuoUserDetailsCard";

interface AdminDuoPanelProps {
  accountId: string;
}

/** Renders Duo user details and devices for a given hosting account. Handles the case where Duo is not provisioned. */
export function AdminDuoPanel({ accountId }: AdminDuoPanelProps) {
  const { data: duoUser, isLoading: userLoading, isError, error } = useAdminDuoUser(accountId);
  // Only fetch devices after the user is confirmed to exist, preventing a race
  // condition where both queries fire simultaneously before the auto-sync row exists.
  const { data: devices = [], isLoading: devicesLoading } = useAdminDuoDevices(accountId, !!duoUser);
  const deleteMutation = useDeleteAdminDuoDevice(accountId);
  const updateMutation = useUpdateAdminDuoUser(accountId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const notProvisioned =
    isError &&
    (error as { data?: { notProvisioned?: boolean } })?.data?.notProvisioned === true;

  async function handleDeleteDevice(deviceId: string) {
    if (!confirm("Ertu viss um að þú viljir eyða þessu Duo tæki?")) return;
    await deleteMutation.mutateAsync(deviceId);
  }

  if (userLoading || devicesLoading) {
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="text-sm text-(--color-text-secondary)">
          Hleð Duo upplýsingum...
        </p>
      </div>
    );
  }

  if (notProvisioned) {
    return (
      <div className="mt-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="text-sm text-(--color-text-secondary)">
          Duo notandi er ekki til í Duo fyrir þennan hýsingaraðgang.
        </p>
      </div>
    );
  }

  if (!duoUser) {
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="text-sm text-(--color-text-secondary)">
          Enginn Duo notandi skráður á þennan hýsingaraðgang.
        </p>
      </div>
    );
  }

  return (
    <>
      <DuoUserDetailsCard duoUser={duoUser} updateMutation={updateMutation} />

      <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-(--color-text)">Tæki</h3>

          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="rounded-lg bg-(--color-primary) px-3 py-1.5 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            Nýtt tæki
          </button>
        </div>

        {deleteMutation.isError && (
          <p className="mb-3 rounded-lg border border-(--color-error) bg-(--color-error-bg) px-3 py-2 text-sm text-(--color-error)">
            {(deleteMutation.error as { message?: string })?.message ??
              "Tókst ekki að eyða tæki."}
          </p>
        )}

        <DuoDeviceList
          devices={devices}
          isDeleting={deleteMutation.isPending}
          deletingDeviceId={deleteMutation.variables}
          onDeleteDevice={(deviceId) => void handleDeleteDevice(deviceId)}
        />
      </div>

      {showCreateDialog && (
        <AdminDuoDeviceCreateDialog
          accountId={accountId}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </>
  );
}
