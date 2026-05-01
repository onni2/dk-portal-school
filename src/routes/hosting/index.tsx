/**
 * /hosting — redirects to /hosting/myHosting
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hosting/")({
  beforeLoad: () => {
    throw redirect({ to: "/hosting/myHosting" });
  },
});
