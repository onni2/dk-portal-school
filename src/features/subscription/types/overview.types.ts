export interface InvoiceLine {
  SequenceNumber: number;
  ItemCode: string | null;
  Text: string | null;
  Text2: string | null;
  Quantity: number;
  UnitPrice: number;
  UnitPriceWithTax: number;
  TotalAmount: number;
  TotalAmountWithTax: number;
}

export interface SubscriptionInvoice {
  Number: string;
  InvoiceDate: string | null;
  DueDate: string | null;
  TotalAmount: number;
  TotalAmountWithTax: number;
  CNumber: string | null;
  CName: string | null;
  Origin: number;
  OrderNumber: string | null;
  Reference: string | null;
  Text1: string | null;
  Lines: InvoiceLine[] | null;
}

export interface LineGroup {
  title: string;
  lines: InvoiceLine[];
  total: number;
}
