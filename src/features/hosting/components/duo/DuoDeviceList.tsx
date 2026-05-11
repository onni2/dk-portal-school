import type { DuoDevice } from "../../types/duo.types";

interface DuoDeviceListProps {
  devices: DuoDevice[];
  isDeleting?: boolean;
  deletingDeviceId?: string;
  onDeleteDevice: (deviceId: string) => void;
}

function getStatusLabel(status: string) {
  if (status === "active") return "Virkt";
  if (status === "pending_activation") return "Bíður virkjunar";
  if (status === "removed") return "Fjarlægt";
  return status;
}

export function DuoDeviceList({
  devices,
  isDeleting,
  deletingDeviceId,
  onDeleteDevice,
}: DuoDeviceListProps) {
  if (devices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-(--color-border) px-4 py-8 text-center text-sm text-(--color-text-secondary)">
        Engin Duo tæki skráð.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-(--color-border)">
      <table className="w-full text-sm">
        <thead className="bg-(--color-surface-hover)">
          <tr className="text-left text-xs uppercase tracking-wide text-(--color-text-muted)">
            <th className="px-4 py-2.5">Tæki</th>
            <th className="px-4 py-2.5">Sími</th>
            <th className="px-4 py-2.5">Platform</th>
            <th className="px-4 py-2.5">Staða</th>
            <th className="px-4 py-2.5 text-right"></th>
          </tr>
        </thead>

        <tbody>
          {devices.map((device) => {
            const deletingThisDevice =
              isDeleting && deletingDeviceId === device.deviceId;

            return (
              <tr
                key={device.deviceId}
                className="border-t border-(--color-border-light)"
              >
                <td className="px-4 py-2.5 font-medium text-(--color-text)">
                  {device.description}
                </td>

                <td className="px-4 py-2.5 text-(--color-text-secondary)">
                  {device.phoneNumber ?? "—"}
                </td>

                <td className="px-4 py-2.5 text-(--color-text-secondary)">
                  {device.platform ?? "—"}
                </td>

                <td className="px-4 py-2.5 text-(--color-text-secondary)">
                  {getStatusLabel(device.status)}
                </td>

                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteDevice(device.deviceId)}
                    disabled={deletingThisDevice}
                    className="text-sm text-(--color-error) hover:underline disabled:opacity-50"
                  >
                    {deletingThisDevice ? "Eyði..." : "Eyða"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}