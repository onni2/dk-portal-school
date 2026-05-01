import { useState, Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/Button";
import { DkOneUserTable } from "./DkOneUserTable";
import { InviteDkOneModal } from "./InviteDkOneModal";

const DKONE_INFO = `dkOne er notendastjórnunarkerfi DK hugbúnaðar. Hér getur þú gefið starfsmönnum sem eru skráðir í DK kerfið aðgang að dkOne og stjórnað hlutverkum þeirra. Notendur fá stöðuna „Boðið" þegar þeir eru skráðir og hægt er að virkja þá þegar þeir hafa staðfest aðgang.`;

function InfoTooltip() {
  return (
    <span className="relative inline-flex group ml-1.5 align-middle">
      <span className="flex h-4 w-4 cursor-default items-center justify-center rounded-full border border-(--color-text-muted) text-[10px] font-semibold leading-none text-(--color-text-muted) select-none">
        i
      </span>
      <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border border-(--color-border) bg-(--color-surface) p-3 text-xs text-(--color-text-secondary) shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {DKONE_INFO}
      </span>
    </span>
  );
}

export function DkOnePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <PageTemplate
      title="dkOne"
      description={<>Notendur með aðgang að dkOne.<InfoTooltip /></>}
      actions={
        <Button onClick={() => setShowModal(true)}>Bjóða inn dk notendum</Button>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DkOneUserTable />
      </Suspense>

      {showModal && <InviteDkOneModal onClose={() => setShowModal(false)} />}
    </PageTemplate>
  );
}
