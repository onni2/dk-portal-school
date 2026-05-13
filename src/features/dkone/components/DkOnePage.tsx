/**
 * dkOne user management page — table of dkOne users with invite and role management.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Button, ./DkOneUserTable, ./InviteDkOneModal
 * Exports: DkOnePage
 */
import { useState, Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/Button";
import { DkOneUserTable } from "./DkOneUserTable";
import { InviteDkOneModal } from "./InviteDkOneModal";

export function DkOnePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <PageTemplate
      title="dkOne"
      description="Notendur með aðgang að dkOne."
      info="dkOne er notendastjórnunarkerfi dk hugbúnaðar. Hér getur þú gefið starfsmönnum sem eru skráðir í dk kerfið aðgang að dkOne og stjórnað hlutverkum þeirra."
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
