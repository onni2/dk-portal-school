import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { cn } from "@/shared/utils/cn";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-(--color-primary)" : "bg-(--color-border)",
      )}
    >
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", on ? "left-4.5" : "left-0.5")} />
    </button>
  );
}

export function SecurityPage() {
  const [mfaOn, setMfaOn] = useState(true);
  const [ipLock, setIpLock] = useState(false);
  const [backups, setBackups] = useState(true);

  return (
    <PageTemplate
      title="Öryggi og persónuvernd"
      description="Stjórnaðu öryggisstillingum fyrir hýsinguna."
    >
      {/* Status banner */}
      <div className="flex items-start gap-4 rounded-lg border border-(--color-border) bg-(--color-success-bg) p-5">
        <ShieldIcon className="h-8 w-8 shrink-0 text-(--color-success)" />
        <div>
          <p className="font-semibold text-(--color-text)">Öryggisástand: Mjög gott</p>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Allar lykilstillingar eru virkar. Ekkert krefst athygli þinnar í augnablikinu.
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-(--color-text)">Fjölþátta auðkenning</p>
              <p className="mt-0.5 text-xs text-(--color-text-secondary)">Krefjast auðkenningarkóða við innskráningu í hýsingu.</p>
            </div>
            <Toggle on={mfaOn} onClick={() => setMfaOn(!mfaOn)} />
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-(--color-border-light) pt-4">
            <div>
              <p className="font-medium text-(--color-text)">IP takmörkun</p>
              <p className="mt-0.5 text-xs text-(--color-text-secondary)">Aðeins tilteknar IP-tölur fá aðgang að hýsingunni.</p>
            </div>
            <Toggle on={ipLock} onClick={() => setIpLock(!ipLock)} />
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-(--color-border-light) pt-4">
            <div>
              <p className="font-medium text-(--color-text)">Dagleg afritun á skýi</p>
              <p className="mt-0.5 text-xs text-(--color-text-secondary)">Sjálfvirk afritun á hverri nóttu kl. 04:00.</p>
            </div>
            <Toggle on={backups} onClick={() => setBackups(!backups)} />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
