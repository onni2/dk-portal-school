// src/routes/notendur/index.tsx
/**
 * /notendur — Users page. Prefetches portal users before rendering.
 */
import { createFileRoute } from "@tanstack/react-router";
import { usersQueryOptions } from "@/features/users/api/users.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { UsersPage } from "@/features/users/components/UsersPage";

export const Route = createFileRoute("/notendur/")({
  loader: ({ context: { queryClient } }) => {
    const companyId = useAuthStore.getState().user?.companyId;

    if (!companyId) return null;

    return queryClient.ensureQueryData(usersQueryOptions(companyId));
  },
  component: UsersPage,
});