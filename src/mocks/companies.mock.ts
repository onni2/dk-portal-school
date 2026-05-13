/**
 * Mock company list used for multi-company selection during development.
 * Uses: ../features/company/types/company.types
 * Exports: MOCK_COMPANIES
 */
import type { Company } from "../features/company/types/company.types";

export const MOCK_COMPANIES: Company[] = [
  { id: "1", name: "Fyrirtæki ehf." },
  { id: "2", name: "DK Solutions" },
  { id: "3", name: "Íslandsbanki" },
  { id: "4", name: "Landsbankinn" },
  { id: "5", name: "Arion banki" },
];