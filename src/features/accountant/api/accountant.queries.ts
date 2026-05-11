/**
 * TanStack Query hooks for accountant pages.
 * Exports: useAccountantCompanies, useSubmissions, useTransactions, useDocuments
 */
import { useQuery } from "@tanstack/react-query";
import {
  getAccountantCompanies,
  getSubmissions,
  getTransactions,
  getDocuments,
} from "./accountant.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useAccountantCompanies() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-companies", userId],
    queryFn: getAccountantCompanies,
  });
}

export function useSubmissions() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-submissions", userId],
    queryFn: getSubmissions,
  });
}

export function useTransactions(companyId?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-transactions", userId, companyId ?? "all"],
    queryFn: () => getTransactions(companyId),
  });
}

export function useDocuments(companyId?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-documents", userId, companyId ?? "all"],
    queryFn: () => getDocuments(companyId),
  });
}