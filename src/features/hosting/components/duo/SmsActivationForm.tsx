/**
 * SMS activation step inside the Duo device creation dialog — collects phone number, device name, and platform (iOS/Android).
 * Uses: @/shared/components/Button, @/shared/utils/cn
 * Exports: DuoSmsActivationForm
 */
import { Apple, Bot, MessageSquare, X } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { cn } from "@/shared/utils/cn";

type Platform = "ios" | "android";

interface DuoSmsActivationFormProps {
  phoneNumber: string;
  platform: Platform;
  deviceDescription: string;
  isPending: boolean;
  canSubmit: boolean;
  errorMessage?: string;
  onPhoneNumberChange: (value: string) => void;
  onPlatformChange: (value: Platform) => void;
  onDeviceDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
}

/** Form step for SMS activation — phone number, device name, iOS/Android picker, error display, and back/cancel/submit footer. */
export function DuoSmsActivationForm({
  phoneNumber,
  platform,
  deviceDescription,
  isPending,
  canSubmit,
  errorMessage,
  onPhoneNumberChange,
  onPlatformChange,
  onDeviceDescriptionChange,
  onSubmit,
  onBack,
  onCancel,
}: DuoSmsActivationFormProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50">
            <MessageSquare className="h-6 w-6 text-(--color-primary)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--color-text)">Nýtt tæki</h2>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              Settu inn símanúmer, nafn tækis og tegund tækis.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="shrink-0 rounded-lg p-1 text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text) disabled:opacity-50"
          aria-label="Loka"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {/* Phone number */}
        <div>
          <label className="mb-0.5 block text-sm font-semibold text-(--color-text)">
            Símanúmer
          </label>
          <p className="mb-1.5 text-sm text-(--color-text-secondary)">
            Sláðu inn símanúmerið þitt með landskóða.
          </p>
          <div className="flex overflow-hidden rounded-lg border border-(--color-border) focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)">

            <input
              autoFocus
              type="tel"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              placeholder="+354xxxxxxx"
              aria-label="Símanúmer"
              className="min-w-0 flex-1 bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none"
            />
          </div>
        </div>

        {/* Device name */}
        <div>
          <label className="mb-0.5 block text-sm font-semibold text-(--color-text)">
            Nafn tækis
          </label>
          <p className="mb-1.5 text-sm text-(--color-text-secondary)">
            Gefðu tækinu lýsandi nafn.
          </p>
          <input
            value={deviceDescription}
            onChange={(e) => onDeviceDescriptionChange(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          />
        </div>

        {/* Device type */}
        <div>
          <label className="mb-0.5 block text-sm font-semibold text-(--color-text)">
            Tegund tækis
          </label>
          <p className="mb-1.5 text-sm text-(--color-text-secondary)">
            Veldu tegund tækis sem þú vilt tengja.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPlatformChange("ios")}
              aria-pressed={platform === "ios"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-all",
                platform === "ios"
                  ? "border-(--color-primary) bg-indigo-50 text-(--color-primary)"
                  : "border-(--color-border) text-(--color-text) hover:border-(--color-primary) hover:bg-(--color-surface-hover)",
              )}
            >
              <Apple className="h-4 w-4" />
              iOS
            </button>

            <button
              type="button"
              onClick={() => onPlatformChange("android")}
              aria-pressed={platform === "android"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-all",
                platform === "android"
                  ? "border-(--color-primary) bg-indigo-50 text-(--color-primary)"
                  : "border-(--color-border) text-(--color-text) hover:border-(--color-primary) hover:bg-(--color-surface-hover)",
              )}
            >
              <Bot className="h-4 w-4" />
              Android
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-lg border border-(--color-error) bg-(--color-error-bg) px-3 py-2 text-sm text-(--color-error)">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between gap-2 border-t border-(--color-border) pt-4">
        <Button
          variant="ghost"
          size="md"
          onClick={onBack}
          disabled={isPending}
        >
          Til baka
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={isPending}
          >
            Hætta við
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            {isPending ? "Sendi SMS..." : "Senda SMS"}
          </Button>
        </div>
      </div>
    </>
  );
}
