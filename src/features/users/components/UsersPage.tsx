import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Button } from "@/shared/components/Button";
import { UsersTable } from "./UsersTable";
import { InviteUserModal } from "./InviteUserModal";
import { UserPanel } from "./UserPanel";
import {
  useInvalidateUsers,
  useInvalidatePermissions,
} from "../api/users.queries";
import type { PortalUser } from "../types/users.types";

export function UsersPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);

  const invalidateUsers = useInvalidateUsers();
  const invalidatePermissions = useInvalidatePermissions();

  function handleInvited() {
    void invalidateUsers();
    void invalidatePermissions();
  }

  return (
    <>
      <PageTemplate
        title="Notendur"
        description="Stjórnun notenda og aðgangsheimilda fyrir Mínar síður."
        actions={
          <Button onClick={() => setIsInviteOpen(true)}>
            + Bjóða notanda
          </Button>
        }
      >
        <UsersTable onSelectUser={setSelectedUser} />
      </PageTemplate>

      {isInviteOpen && (
        <InviteUserModal
          onClose={() => setIsInviteOpen(false)}
          onInvited={handleInvited}
        />
      )}

      {selectedUser && (
        <UserPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}