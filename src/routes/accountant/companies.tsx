import { createFileRoute } from "@tanstack/react-router";
import { AccountantCompanies } from "@/features/accountant/components/AccountantCompanies";

export const Route = createFileRoute("/accountant/companies")({
  component: AccountantCompanies,
});