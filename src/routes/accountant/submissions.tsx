import { createFileRoute } from "@tanstack/react-router";
import { AccountantSubmissions } from "@/features/accountant/components/AccountantSubmissions";

export const Route = createFileRoute("/accountant/submissions")({
  component: AccountantSubmissions,
});