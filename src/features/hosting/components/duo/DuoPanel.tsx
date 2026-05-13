/**
 * Duo MFA panel for the logged-in user's MyHosting page — shows user details and device list with add/delete support.
 * Uses: ../../api/duo.queries, ./DuoDeviceCreateDialog, ./DuoDeviceList, ./DuoUserDetailsCard
 * Exports: DuoPanel
 */
import { useState } from "react";
import {
  useDeleteDuoDevice,
  useDuoDevices,
  useDuoUser,
  useUpdateDuoUser,
} from "../../api/duo.queries";
import { DuoDeviceCreateDialog } from "./DuoDeviceCreateDialog";
import { DuoDeviceList } from "./DuoDeviceList";
import { DuoUserDetailsCard } from "./DuoUserDetailsCard";

/** Renders the logged-in user's Duo user details and devices. Shows loading/empty states while data is unavailable. */
export function DuoPanel() {
  const { data: duoUser, isLoading: userLoading } = useDuoUser();
  const { data: devices = [], isLoading: devicesLoading } = useDuoDevices();
  const deleteMutation = useDeleteDuoDevice();
  const updateMutation = useUpdateDuoUser();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  async function handleDeleteDevice(deviceId: string) {
    // native confirm is fine here — this is a destructive action
    if (!confirm("Ertu viss um að þú viljir eyða þessu Duo tæki?")) return;

    await deleteMutation.mutateAsync(deviceId);
  }

  // both queries need to finish before we can show anything useful
  if (userLoading || devicesLoading) {
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="text-sm text-(--color-text-secondary)">
          Hleð Duo upplýsingum...
        </p>
      </div>
    );
  }

  // user might not have a Duo account yet — handle gracefully
  if (!duoUser) {
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="text-sm text-(--color-text-secondary)">
          Enginn Duo notandi fannst.
        </p>
      </div>
    );
  }

  return (
    <>
      <DuoUserDetailsCard duoUser={duoUser} updateMutation={updateMutation} />

      <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-(--color-text)">
            Tæki
          </h3>

          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="rounded-lg bg-(--color-primary) px-3 py-1.5 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            Nýtt tæki
          </button>
        </div>

        {/* show delete error inline instead of a toast — easier to see in context */}
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
        <DuoDeviceCreateDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </>
  );
}