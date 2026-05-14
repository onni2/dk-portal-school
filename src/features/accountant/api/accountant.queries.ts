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

/** Hook for fetching the list of companies managed by the accountant. */
export function useAccountantCompanies() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-companies", userId],
    queryFn: getAccountantCompanies,
  });
}

/** Hook for fetching submission status records across accountant companies. */
export function useSubmissions() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-submissions", userId],
    queryFn: getSubmissions,
  });
}

/** Hook for fetching transactions, optionally filtered to a single company. */
export function useTransactions(companyId?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-transactions", userId, companyId ?? "all"],
    queryFn: () => getTransactions(companyId),
  });
}

/** Hook for fetching documents, optionally filtered to a single company. */
export function useDocuments(companyId?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["accountant-documents", userId, companyId ?? "all"],
    queryFn: () => getDocuments(companyId),
  });
}