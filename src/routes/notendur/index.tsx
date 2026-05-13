/**
 * /notendur — portal users page; prefetches the user list before rendering.
 */
import { createFileRoute } from "@tanstack/react-router";
import { usersQueryOptions } from "@/features/users/api/users.queries";
import { UsersPage } from "@/features/users/components/UsersPage";

export const Route = createFileRoute("/notendur/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(usersQueryOptions),
  component: UsersPage,
});
