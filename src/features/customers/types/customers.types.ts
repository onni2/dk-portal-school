/**
 * TypeScript types for a customer record and the input shape for creating a new customer.
 * Uses: nothing — standalone file
 * Exports: Customer, CreateCustomerInput
 */
export interface Customer {
  Number: string;
  Name: string;
  SSNumber?: string;
  Address1?: string;
  City?: string;
  ZipCode?: string;
  CountryCode?: string;
  Phone?: string;
  PhoneMobile?: string;
  Email?: string;
  BalanceAmount?: number;
  Blocked?: boolean;
}

export interface CreateCustomerInput {
  Number: string;
  Name: string;
  SSNumber?: string;
  Address1?: string;
  City?: string;
  ZipCode?: string;
  Phone?: string;
  Email?: string;
}
