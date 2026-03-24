/**
 * API functions for fetching customer transactions and opening an invoice PDF in a new tab.
 * Uses: @/shared/api/client, ../types/invoices.types
 * Exports: fetchCustomerTransactions, fetchInvoicePdf
 */
import { apiClient } from "@/shared/api/client";
import type { CustomerTransaction } from "../types/invoices.types";

/**
 *
 */
export async function fetchCustomerTransactions(): Promise<
  CustomerTransaction[]
> {
  return apiClient.get<CustomerTransaction[]>(
    "/customer/transaction/page/1/100",
  );
}

/**
 *
 */
export async function fetchInvoicePdf(invoiceNumber: string): Promise<void> {
  const blob = await apiClient.getBlob(`/sales/invoice/${invoiceNumber}/pdf`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reikningur-${invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
