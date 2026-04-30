import { useState, Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/Button";
import { DkOneUserTable } from "./DkOneUserTable";
import { AddDkOneUserModal } from "./AddDkOneUserModal";

export function DkOnePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <PageTemplate
      title="dkOne"
      description="Yfirlit yfir notendur með dkOne aðgang."
      actions={
        <Button onClick={() => setShowModal(true)}>Bæta við notanda</Button>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DkOneUserTable />
      </Suspense>

      {showModal && <AddDkOneUserModal onClose={() => setShowModal(false)} />}
    </PageTemplate>
  );
}
