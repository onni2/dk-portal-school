/**
 * /askrift — redirects to /askrift/yfirlit
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/askrift/")({
  beforeLoad: () => {
    throw redirect({ to: "/askrift/yfirlit" });
  },
});
