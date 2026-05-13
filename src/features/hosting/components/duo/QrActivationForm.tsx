/**
 * QR activation step inside the Duo device creation dialog — collects a device name and submits.
 * Uses: @/shared/components/Button
 * Exports: DuoQrActivationForm
 */
import { QrCode } from "lucide-react";
import { Button } from "@/shared/components/Button";

interface DuoQrActivationFormProps {
  deviceDescription: string;
  isPending: boolean;
  canSubmit: boolean;
  errorMessage?: string;
  onDeviceDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
}

/** Form step for QR activation — device description input, error display, and back/cancel/submit footer. */
export function DuoQrActivationForm({
  deviceDescription,
  isPending,
  canSubmit,
  errorMessage,
  onDeviceDescriptionChange,
  onSubmit,
  onBack,
  onCancel,
}: DuoQrActivationFormProps) {
  return (
    <>
      {/* Icon + title + subtitle */}
      <div className="mt-2 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50">
          <QrCode className="h-6 w-6 text-(--color-primary)" />
        </div>
        <div>
          <p className="font-semibold text-(--color-text)">Skanna QR kóða</p>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Settu inn nafn tækis til að búa til QR kóða.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">
            Nafn tækis
          </label>

          <input
            autoFocus
            value={deviceDescription}
            onChange={(e) => onDeviceDescriptionChange(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          />
        </div>

        {errorMessage && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-3 py-2 text-sm text-(--color-error)">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between gap-2 border-t border-(--color-border) pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
        >
          Til baka
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
          >
            Hætta við
          </button>

          <Button
            variant="primary"
            size="md"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            {isPending ? "Bý til QR..." : "Virkja"}
          </Button>
        </div>
      </div>
    </>
  );
}
