/**
 * TypeScript type for a customer transaction entry as returned by the invoices API.
 * Uses: nothing — standalone file
 * Exports: CustomerTransaction
 */
export interface CustomerTransaction {
  ID: number;
  HeadId: number;
  Sequence: number;
  InvoiceNumber: string;
  Customer: string;
  CreatedBy: string;
  Text: string;
  JournalDate: string;
  DueDate: string;
  SettledCurrencyAmount: number;
  SettledAmount: number;
  SettledStatus: number;
  Settled: boolean;
  InputAmount: number;
  CurrencyAmount: number;
  Amount: number;
  Currency: string;
  Exchange: number;
  Code: number;
  Voucher: string;
  Origin: number;
  ClaimStatus: number;
  RecordType: number;
  JournalType: number;
  SettleId: number;
  ObjectDate: string;
  Created: string;
  Modified: string;
}
