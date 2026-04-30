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
