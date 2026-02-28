/**
 * API functions for fetching all employees or a single employee by number.
 * Uses: @/shared/api/client, ../types/employees.types
 * Exports: fetchEmployees, fetchEmployee
 */
import { apiClient } from "@/shared/api/client";
import type { Employee } from "../types/employees.types";

/**
 *
 */
export async function fetchEmployees(): Promise<Employee[]> {
  return apiClient.get<Employee[]>("/general/employee");
}

/**
 *
 */
export async function fetchEmployee(number: string): Promise<Employee> {
  return apiClient.get<Employee>(`/general/employee/${number}`);
}
