/**
 * Portal users page — admin only.
 * Lists all portal users and lets admins invite or remove them.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { UserTable } from "@/features/users/components/UserTable";
import { InviteUserModal } from "@/features/users/components/InviteUserModal";
import { useInvalidateUsers } from "@/features/users/api/users.queries";
import { Button } from "@/shared/components/Button";

export const Route = createFileRoute("/users/")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (user?.role !== "admin") throw redirect({ to: "/" });
  },
  component: UsersPage,
});

function UsersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const invalidateUsers = useInvalidateUsers();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text)">Notendur</h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Stjórnaðu notendum sem hafa aðgang að Mínar síður.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>Bjóða notanda</Button>
      </div>

      <UserTable />

      {showInvite && (
        <InviteUserModal
          onClose={() => setShowInvite(false)}
          onInvited={() => { void invalidateUsers(); }}
        />
      )}
    </>
  );
}
