/**
 * Users page — lists portal users. Clicking a row opens the UserPanel slide-over.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Button,
 *       ./UsersTable, ./InviteUserModal, ./UserPanel
 * Exports: UsersPage
 */
import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Button } from "@/shared/components/Button";
import { UsersTable } from "./UsersTable";
import { InviteUserModal } from "./InviteUserModal";
import { UserPanel } from "./UserPanel";
import type { PortalUser } from "../types/users.types";

export function UsersPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);

  return (
    <>
      <PageTemplate
        title="Notendur"
        description="Yfirlit yfir notendur Mínna síðna hjá fyrirtækinu."
        actions={<Button onClick={() => setIsInviteOpen(true)}>+ Bjóða notanda</Button>}
      >
        <UsersTable onSelectUser={setSelectedUser} />
      </PageTemplate>

      {isInviteOpen && (
        <InviteUserModal
          onClose={() => setIsInviteOpen(false)}
          onInvited={() => setIsInviteOpen(false)}
        />
      )}
      {selectedUser && (
        <UserPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}
