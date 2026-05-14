/**
 * /subscription — redirects to /subscription/yfirlit
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/subscription/")({
  beforeLoad: () => {
    throw redirect({ to: "/subscription/yfirlit" });
  },
});
