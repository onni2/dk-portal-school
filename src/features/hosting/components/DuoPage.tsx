import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { cn } from "@/shared/utils/cn";
import {
  deleteDuoPhone,
  enrollDuoPhone,
  resendDuoActivation,
  type DuoActivationResponse,
} from "../api/duo.api";
import { duoStatusQueryOptions, useDuoStatus } from "../api/duo.queries";
import { useMyHostingAccountOptional } from "../api/hosting.queries";
import type { DuoPhone } from "../types/duo.types";

/* ── Icons ──────────────────────────────────────────────────────────── */
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8l-1 4h10l-1-4z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.9h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.5a16 16 0 0 0 6.59 6.59l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */
function getErrMsg(err: unknown, fallback: string): string {
  return err != null && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

/* ── Device row ─────────────────────────────────────────────────────── */
function DeviceRow({
  phone,
  index,
  expanded,
  onToggle,
  onDelete,
  onResend,
  isResending,
  resendResult,
}: {
  phone: DuoPhone;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onResend: () => void;
  isResending: boolean;
  resendResult?: DuoActivationResponse;
}) {
  return (
    <>
      <tr className="border-t border-(--color-border-light) hover:bg-(--color-surface-hover)">
        <td className="px-2 py-2">
          <button onClick={onToggle} className="text-(--color-text-muted) hover:text-(--color-text)">
            <ChevronDownIcon className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
        </td>
        <td className="px-2 py-2 font-mono text-xs text-(--color-text-muted)">{index + 1}</td>
        <td className="px-2 py-2">
          <span className="inline-flex items-center gap-2 font-medium text-(--color-text)">
            <span className={cn("h-2 w-2 rounded-full", phone.activated ? "bg-(--color-success)" : "bg-(--color-warning)")} />
            {phone.name || phone.number}
          </span>
        </td>
        <td className="px-2 py-2 text-(--color-text-secondary)">{phone.model || phone.platform || "—"}</td>
        <td className="px-2 py-2 text-right">
          <button onClick={onDelete} className="text-(--color-error) hover:opacity-80">
            <XIcon className="h-4 w-4" />
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-(--color-surface-hover)">
          <td colSpan={5} className="px-3 py-3 text-xs text-(--color-text-secondary)">
            <p>
              Númer: <span className="font-mono">{phone.number}</span>
            </p>
            <p className="mt-1">
              Staða:{" "}
              <span className={cn("font-medium", phone.activated ? "text-(--color-success)" : "text-(--color-warning)")}>
                {phone.activated ? "Virkt" : "Í bið um virkjun"}
              </span>
            </p>
            {phone.last_seen && (
              <p className="mt-1">
                Síðast notað: {new Date(phone.last_seen).toLocaleDateString("is-IS")}
              </p>
            )}

            {!phone.activated && (
              <>
                <button
                  onClick={onResend}
                  disabled={isResending}
                  className="mt-3 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text) hover:bg-(--color-surface) disabled:opacity-60"
                >
                  {isResending ? "Sendi..." : "Senda virkjun aftur"}
                </button>

                {resendResult?.activation_barcode && (
                  <div className="mt-3 text-center">
                    <img
                      src={resendResult.activation_barcode}
                      alt="Duo activation QR code"
                      className="mx-auto h-36 w-36 rounded bg-white p-2 ring-1 ring-(--color-border)"
                    />
                    <p className="mt-1 text-xs text-(--color-text-muted)">
                      Skannaðu QR-kóðann í Duo Mobile til að virkja tækið.
                    </p>
                  </div>
                )}
              </>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export function DuoPage() {
  const { data: status, isLoading, isError, error } = useDuoStatus();
  const { data: account } = useMyHostingAccountOptional();
  const queryClient = useQueryClient();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState("");

  // Set after a successful enrollment. Cleared when user clicks "Lokið".
  const [enrollResult, setEnrollResult] = useState<DuoActivationResponse | null>(null);

  // Keyed by phone_id. Stores latest activation data after resending from the phone list.
  const [resendResults, setResendResults] = useState<Record<string, DuoActivationResponse>>({});

  const [toast, setToast] = useState("");
  const [enrollError, setEnrollError] = useState<string | null>(null);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: duoStatusQueryOptions.queryKey,
    });

  const enrollPhone = useMutation({
    mutationFn: () => enrollDuoPhone(phoneDraft),
    onSuccess: (data) => {
      setEnrollResult(data);
      setEnrollError(null);
      showToast("SMS sent");
      void invalidate();
    },
    onError: (err) => setEnrollError(getErrMsg(err, "Villa við að skrá símanúmer")),
  });

  const resendSms = useMutation({
    mutationFn: (id: string) => resendDuoActivation(id),
    onSuccess: (data, id) => {
      setResendResults((prev) => ({ ...prev, [id]: data }));
      showToast("Virkjun send aftur");
    },
    onError: (err) => showToast(getErrMsg(err, "Villa við SMS sendingu")),
  });

  const deletePhone = useMutation({
    mutationFn: (id: string) => deleteDuoPhone(id),
    onSuccess: () => {
      void invalidate();
      showToast("Tæki eytt");
    },
    onError: (err) => showToast(getErrMsg(err, "Villa við að eyða tæki")),
  });

  function finishActivation() {
    void invalidate();
    setEnrollResult(null);
    setPhoneDraft("");
    showToast("Virkjun hafin");
  }

  // When resending from the enrollment panel, prefer the latest resend result.
  const panelActivation = enrollResult
    ? (resendResults[enrollResult.phone_id] ?? enrollResult)
    : null;

  const hasPhone = (status?.phones.length ?? 0) > 0;

  const apiError = isError ? getErrMsg(error, "Tenging við Duo mistókst") : null;

  return (
    <PageTemplate
      title="Duo — fjölþátta auðkenning"
      description="Tengdu símann þinn og stjórnaðu Duo tækjum sem þú notar til að auðkenna þig."
    >
      {apiError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-(--color-text)">Tenging við Duo mistókst</p>
            <p className="mt-0.5 text-xs text-red-600">{apiError}</p>
            <p className="mt-1 text-xs text-(--color-text-secondary)">
              Gangið úr skugga um að þjónninn sé keyrandi og DUO_IKEY, DUO_SKEY og DUO_API_HOST séu stillt.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* User info */}
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
            <h2 className="mb-4 text-base font-semibold text-(--color-text)">Notandi</h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-9 animate-pulse rounded-lg bg-(--color-surface-hover)" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-(--color-text-secondary)">
                    <UserIcon className="h-3.5 w-3.5" /> DK User name
                  </label>
                  <input
                    readOnly
                    value={account?.username ?? status?.user?.username ?? "—"}
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-hover) px-3 py-2 text-sm font-mono text-(--color-text-secondary)"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-(--color-text-secondary)">
                    <BadgeIcon className="h-3.5 w-3.5" /> Display name
                  </label>
                  <input
                    readOnly
                    value={status?.user?.realname ?? account?.displayName ?? "—"}
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-hover) px-3 py-2 text-sm text-(--color-text-secondary)"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-(--color-text-secondary)">
                    <MailIcon className="h-3.5 w-3.5" /> Netfang
                  </label>
                  <input
                    readOnly
                    value={status?.user?.email ?? account?.email ?? "—"}
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-hover) px-3 py-2 text-sm text-(--color-text-secondary)"
                  />
                </div>

                <p className="text-xs text-(--color-text-muted)">
                  Duo notandi er stjórnaður í Duo Admin. Hér er aðeins hægt að tengja síma/tæki við núverandi Duo notanda.
                </p>
              </div>
            )}
          </div>

          {/* Phone enrollment */}
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
            <h2 className="mb-1 text-base font-semibold text-(--color-text)">Bæta við símanúmeri</h2>

            {isLoading ? (
              <div className="h-16 animate-pulse rounded-lg bg-(--color-surface-hover)" />
            ) : (
              <>
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-(--color-border) bg-(--color-warning-bg) p-3">
                  <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-(--color-warning)" />
                  <div>
                    <p className="text-sm font-semibold text-(--color-text)">Tengja síma við Duo</p>
                    <p className="mt-0.5 text-xs text-(--color-text-secondary)">
                      Sláðu inn símanúmer og ýttu á <span className="font-medium">Senda</span>. Duo sendir SMS með hlekk á Duo Mobile appið og hlekk til að tengja tækið við aðganginn.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-(--color-text-secondary)">
                      <PhoneIcon className="h-3.5 w-3.5" /> Símanúmer
                    </label>

                    <div className="flex gap-2">
                      <input
                        value={phoneDraft}
                        onChange={(e) => { setPhoneDraft(e.target.value); setEnrollError(null); }}
                        placeholder="t.d. +3546951234"
                        className={cn(
                          "flex-1 rounded-lg border bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-1 focus:ring-(--color-primary)",
                          enrollError ? "border-red-400 focus:border-red-400" : "border-(--color-border) focus:border-(--color-primary)"
                        )}
                      />

                      <button
                        onClick={() => enrollPhone.mutate()}
                        disabled={!phoneDraft.trim() || enrollPhone.isPending}
                        className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-60"
                      >
                        {enrollPhone.isPending ? "Sendi..." : "Senda"}
                      </button>
                    </div>

                    {enrollError && (
                      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {enrollError}
                      </div>
                    )}
                  </div>

                  {enrollResult && (
                    <div className="rounded-lg border border-(--color-border) bg-(--color-primary-light) p-3">
                      <p className="mb-3 text-xs text-(--color-text-secondary)">
                        Virkjunartengill var sendur á{" "}
                        <span className="font-mono font-medium text-(--color-text)">
                          {phoneDraft}
                        </span>
                        . Notandinn opnar hlekkinn í SMS-inu til að tengja tækið við Duo.
                      </p>

                      {panelActivation?.activation_barcode && (
                        <div className="mb-3 text-center">
                          <img
                            src={panelActivation.activation_barcode}
                            alt="Duo activation QR code"
                            className="mx-auto h-48 w-48 rounded bg-white p-2 ring-1 ring-(--color-border)"
                          />
                          <p className="mt-2 text-xs text-(--color-text-muted)">
                            Einnig er hægt að skanna QR-kóðann í Duo Mobile.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => resendSms.mutate(enrollResult.phone_id)}
                          disabled={resendSms.isPending}
                          className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-60"
                        >
                          {resendSms.isPending ? "Sendi..." : "Senda aftur"}
                        </button>

                        <button
                          onClick={finishActivation}
                          className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
                        >
                          Lokið
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-(--color-text)">Símar / tæki</h2>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((n) => (
                  <div key={n} className="h-10 animate-pulse rounded-lg bg-(--color-surface-hover)" />
                ))}
              </div>
            ) : !hasPhone ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-(--color-border) py-8 text-center">
                <PhoneIcon className="h-8 w-8 text-(--color-text-muted)" />
                <p className="text-sm text-(--color-text-secondary)">Engin Duo tæki skráð.</p>
                <p className="text-xs text-(--color-text-muted)">Bættu við símanúmeri til að stofna Duo tæki.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-(--color-border)">
                <table className="w-full text-sm">
                  <thead className="bg-(--color-surface-hover)">
                    <tr className="text-left text-xs uppercase tracking-wide text-(--color-text-muted)">
                      <th className="w-8 px-2 py-2" />
                      <th className="px-2 py-2">Nr.</th>
                      <th className="px-2 py-2">Nafn</th>
                      <th className="px-2 py-2">Gerð</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>

                  <tbody>
                    {status?.phones.map((phone, idx) => (
                      <DeviceRow
                        key={phone.phone_id}
                        phone={phone}
                        index={idx}
                        expanded={expanded === phone.phone_id}
                        onToggle={() =>
                          setExpanded(expanded === phone.phone_id ? null : phone.phone_id)
                        }
                        onDelete={() => deletePhone.mutate(phone.phone_id)}
                        onResend={() => resendSms.mutate(phone.phone_id)}
                        isResending={
                          resendSms.isPending && resendSms.variables === phone.phone_id
                        }
                        resendResult={resendResults[phone.phone_id]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {hasPhone && (
              <p className="mt-3 text-xs text-(--color-text-muted)">
                * Símar/tæki eru sótt beint úr Duo. Þau vistast ekki sérstaklega í ykkar gagnagrunni.
              </p>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-(--color-success) px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckIcon className="h-4 w-4" /> {toast}
        </div>
      )}
    </PageTemplate>
  );
}
