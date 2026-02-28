/**
 * API functions for fetching all customers and creating a new customer.
 * Uses: @/shared/api/client, ../types/customers.types
 * Exports: fetchCustomers, createCustomer
 */
import { apiClient } from "@/shared/api/client";
import type { Customer, CreateCustomerInput } from "../types/customers.types";

/**
 *
 */
export async function fetchCustomers(): Promise<Customer[]> {
  return apiClient.get<Customer[]>("/Customer");
}

/**
 *
 */
export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  return apiClient.post<Customer>("/Customer", input);
}
