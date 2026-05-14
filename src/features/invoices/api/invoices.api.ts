/**
 * API functions for fetching customer transactions and opening an invoice PDF in a new tab.
 * Uses: @/shared/api/client, ../types/invoices.types
 * Exports: fetchCustomerTransactions, fetchInvoicePdf
 */
import { apiClient } from "@/shared/api/client";
import type { CustomerTransaction } from "../types/invoices.types";

/** Fetches the first 100 customer transactions for the active company. */
export async function fetchCustomerTransactions(): Promise<
  CustomerTransaction[]
> {
  return apiClient.get<CustomerTransaction[]>(
    "/customer/transaction/page/1/100",
  );
}

/** Downloads the PDF for the given invoice number and triggers a browser download. */
export async function fetchInvoicePdf(invoiceNumber: string): Promise<void> {
  const blob = await apiClient.getBlob(`/sales/invoice/${invoiceNumber}/pdf`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reikningur-${invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
