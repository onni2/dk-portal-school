/**
 * Users page — lists portal users. Clicking a row opens the UserPanel slide-over.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Button,
 *       ./UsersTable, ./InviteUserModal, ./UserPanel, ../store/users.store
 * Exports: UsersPage
 */
import { Suspense } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Button } from "@/shared/components/Button";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { UsersTable } from "./UsersTable";
import { InviteUserModal } from "./InviteUserModal";
import { UserPanel } from "./UserPanel";
import { useUsersStore } from "../store/users.store";

export function UsersPage() {
  const { isInviteOpen, openInvite, selectedUser } = useUsersStore();

  return (
    <>
      <PageTemplate
        title="Notendur"
        description="Yfirlit yfir notendur Mínna síðna hjá fyrirtækinu."
        actions={<Button onClick={openInvite}>+ Bjóða notanda</Button>}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <UsersTable />
        </Suspense>
      </PageTemplate>

      {isInviteOpen && <InviteUserModal />}
      {selectedUser && <UserPanel />}
    </>
  );
}
