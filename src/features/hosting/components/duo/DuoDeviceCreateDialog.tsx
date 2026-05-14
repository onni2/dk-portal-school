/**
 * Dialog for adding a new Duo device to the logged-in user's hosting account.
 * Two-step: pick activation method (QR or SMS), then fill in the form.
 * Polls device status every 5 s after QR creation until it is activated.
 * Uses: @/shared/components/Button, @/shared/utils/cn, ../../api/duo.queries, ../../api/duo.api, ./QrActivationForm, ./SmsActivationForm
 * Exports: DuoDeviceCreateDialog
 */
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  MessageSquare,
  QrCode,
  Smartphone,
  X,
} from "lucide-react";
import {
  duoQueryKeys,
  useCreateDuoDevice,
  useDuoDeviceStatus,
} from "../../api/duo.queries";
import type { CreateDuoDeviceResponse } from "../../api/duo.api";
import { DuoQrActivationForm } from "./QrActivationForm";
import { DuoSmsActivationForm } from "./SmsActivationForm";
import { Button } from "@/shared/components/Button";
import { cn } from "@/shared/utils/cn";

interface DuoDeviceCreateDialogProps {
  onClose: () => void;
  onCreated?: () => void;
}

type Platform = "ios" | "android";
type ActivationMethod = "sms" | "qr";

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

function useActivationCountdown(expiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) {
    return {
      label: "0:00",
      expired: false,
    };
  }

  const secondsLeft = Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - now) / 1000),
  );

  return {
    label: formatCountdown(secondsLeft),
    expired: secondsLeft <= 0,
  };
}

/** Multi-step dialog for connecting a new Duo device — method picker → form → activation result with countdown timer. */
export function DuoDeviceCreateDialog({
  onClose,
  onCreated,
}: DuoDeviceCreateDialogProps) {
  const qc = useQueryClient();
  const createMutation = useCreateDuoDevice();

  const [activationMethod, setActivationMethod] =
    useState<ActivationMethod | null>(null);

  const [selectedMethodInPicker, setSelectedMethodInPicker] =
    useState<ActivationMethod>("qr");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [platform, setPlatform] = useState<Platform>("ios");
  const [deviceDescription, setDeviceDescription] = useState("");
  const [activationUrlCopied, setActivationUrlCopied] = useState(false);

  const [createdDevice, setCreatedDevice] =
    useState<CreateDuoDeviceResponse | null>(null);

  const shouldPollStatus =
    createdDevice?.activationMethod === "qr" &&
    createdDevice.status === "pending_activation";

  const { data: deviceStatus } = useDuoDeviceStatus(
    createdDevice?.deviceId ?? "",
    shouldPollStatus,
  );

  const isActivated = deviceStatus?.activated === true;

  const activationCountdown = useActivationCountdown(
    createdDevice?.activationExpiresAt,
  );

  useEffect(() => {
    if (!isActivated) return;

    void qc.invalidateQueries({
      queryKey: duoQueryKeys.devices,
    });

    onCreated?.();
  }, [isActivated, qc, onCreated]);

  const errorMessage = createMutation.isError
    ? ((createMutation.error as { message?: string })?.message ??
      "Tókst ekki að stofna Duo tæki.")
    : undefined;

  const canSubmitSms =
    phoneNumber.trim().length > 0 &&
    deviceDescription.trim().length > 0 &&
    !createMutation.isPending;

  const canSubmitQr =
    deviceDescription.trim().length > 0 && !createMutation.isPending;

  async function handleSubmitSms() {
    if (!canSubmitSms) return;

    const result = await createMutation.mutateAsync({
      phoneNumber: phoneNumber.trim(),
      platform,
      deviceDescription: deviceDescription.trim(),
      activationMethod: "sms",
    });

    setCreatedDevice(result);

    void qc.invalidateQueries({
      queryKey: duoQueryKeys.devices,
    });

    onCreated?.();
  }

  async function handleSubmitQr() {
    if (!canSubmitQr) return;

    const result = await createMutation.mutateAsync({
      deviceDescription: deviceDescription.trim(),
      activationMethod: "qr",
    });

    setCreatedDevice(result);
  }

  async function handleCopyActivationUrl() {
    if (!createdDevice?.activationUrl) return;

    await navigator.clipboard.writeText(createdDevice.activationUrl);
    setActivationUrlCopied(true);

    window.setTimeout(() => {
      setActivationUrlCopied(false);
    }, 1800);
  }

  function handleClose() {
    if (createMutation.isPending) return;
    onClose();
  }

  function handleProceed() {
    setActivationMethod(selectedMethodInPicker);
  }

  function handleBack() {
    setActivationMethod(null);
    setSelectedMethodInPicker("qr");
    setPhoneNumber("");
    setPlatform("ios");
    setDeviceDescription("");
    setActivationUrlCopied(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-(--color-border) bg-(--color-surface) p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {!createdDevice ? (
          <>
            {!activationMethod && (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                      <Smartphone className="h-8 w-8 text-(--color-primary)" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-(--color-text)">
                        Tengja nýtt tæki
                      </h2>
                      <p className="mt-1 text-sm text-(--color-text-secondary)">
                        Veldu hvernig þú vilt tengja Duo Mobile appið við aðganginn.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="shrink-0 rounded-lg p-1 text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)"
                    aria-label="Loka"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Option cards */}
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethodInPicker("qr")}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-all",
                      selectedMethodInPicker === "qr"
                        ? "border-(--color-primary) bg-indigo-50"
                        : "border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-surface-hover)",
                    )}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                      <QrCode className="h-7 w-7 text-(--color-primary)" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-(--color-text)">
                        Skanna QR kóða
                      </div>
                      <div className="mt-1 text-sm text-(--color-text-secondary)">
                        Notaðu QR kóða ef Duo Mobile appið er þegar uppsett í símanum.
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        selectedMethodInPicker === "qr"
                          ? "text-(--color-primary)"
                          : "text-(--color-text-secondary)",
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethodInPicker("sms")}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-all",
                      selectedMethodInPicker === "sms"
                        ? "border-(--color-primary) bg-indigo-50"
                        : "border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-surface-hover)",
                    )}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                      <MessageSquare className="h-7 w-7 text-(--color-primary)" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-(--color-text)">
                        Fá SMS hlekk
                      </div>
                      <div className="mt-1 text-sm text-(--color-text-secondary)">
                        Sendum SMS í símann þinn með hlekk til að sækja Duo Mobile appið og öðrum hlekk til að tengja aðganginn.
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        selectedMethodInPicker === "sms"
                          ? "text-(--color-primary)"
                          : "text-(--color-text-secondary)",
                      )}
                    />
                  </button>
                </div>

                {/* CTA area */}
                <div className="mt-6 space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleProceed}
                  >
                    Halda áfram
                  </Button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-(--color-border)" />
                    <span className="text-xs text-(--color-text-secondary)">
                      eða
                    </span>
                    <div className="h-px flex-1 bg-(--color-border)" />
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-sm font-semibold text-(--color-primary) hover:underline"
                    >
                      Hætta við
                    </button>
                  </div>
                </div>

           

              </>
            )}

            {activationMethod === "sms" && (
              <DuoSmsActivationForm
                phoneNumber={phoneNumber}
                platform={platform}
                deviceDescription={deviceDescription}
                isPending={createMutation.isPending}
                canSubmit={canSubmitSms}
                errorMessage={errorMessage}
                onPhoneNumberChange={setPhoneNumber}
                onPlatformChange={setPlatform}
                onDeviceDescriptionChange={setDeviceDescription}
                onSubmit={() => void handleSubmitSms()}
                onBack={handleBack}
                onCancel={handleClose}
              />
            )}

            {activationMethod === "qr" && (
              <DuoQrActivationForm
                deviceDescription={deviceDescription}
                isPending={createMutation.isPending}
                canSubmit={canSubmitQr}
                errorMessage={errorMessage}
                onDeviceDescriptionChange={setDeviceDescription}
                onSubmit={() => void handleSubmitQr()}
                onBack={handleBack}
                onCancel={handleClose}
              />
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-(--color-text)">
              Duo tæki stofnað
            </h2>

            {isActivated ? (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Duo tækið hefur verið virkjað.
              </div>
            ) : (
              <p className="mt-1 text-sm text-(--color-text-secondary)">
                Tækið er komið í bið eftir virkjun.
              </p>
            )}

            <div className="mt-5 text-sm">
              <span className="font-medium text-(--color-text)">Tæki:</span>{" "}
              <span className="text-(--color-text-secondary)">
                {createdDevice.deviceDescription}
              </span>
              {createdDevice.phoneNumber && (
                <p className="mt-1">
                  <span className="font-medium text-(--color-text)">Sími:</span>{" "}
                  <span className="text-(--color-text-secondary)">
                    {createdDevice.phoneNumber}
                  </span>
                </p>
              )}
            </div>

            {createdDevice.activationMethod === "sms" && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {createdDevice.smsSent
                  ? "SMS virkjun hefur verið send."
                  : "Tæki var stofnað, en SMS var ekki sent."}
              </div>
            )}

            {createdDevice.activationMethod === "qr" && !isActivated && (
              <div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-4 text-center">
                {createdDevice.activationBarcode ? (
                  <img
                    src={createdDevice.activationBarcode}
                    alt="Duo QR activation"
                    className="mx-auto h-48 w-48 rounded-lg bg-white p-2"
                  />
                ) : (
                  <p className="text-sm text-(--color-text-secondary)">
                    QR kóði fannst ekki í svari frá bakenda.
                  </p>
                )}

                {createdDevice.activationUrl && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => void handleCopyActivationUrl()}
                      className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
                    >
                      {activationUrlCopied
                        ? "Slóð afrituð"
                        : "Afrita virkjunarslóð"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {createdDevice.activationExpiresAt && !isActivated && (
              <div
                className={
                  activationCountdown.expired
                    ? "mt-4 rounded-lg border border-(--color-error) bg-(--color-error-bg) px-4 py-3 text-sm text-(--color-error)"
                    : "mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                }
              >
                {activationCountdown.expired ? (
                  "Virkjunarkóðinn er útrunninn. Lokaðu glugganum og búðu til nýjan kóða."
                ) : (
                  <>
                    Virkjunarkóðinn gildir í{" "}
                    <span className="font-semibold">
                      {activationCountdown.label}
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
              >
                Loka
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
