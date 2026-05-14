/**
 * Re-exports the mock company list under the canonical COMPANIES name used by the company store.
 * Uses: ../types/company.types, @/mocks/companies.mock
 * Exports: COMPANIES
 */
import type { Company } from "../types/company.types";
import { MOCK_COMPANIES } from "@/mocks/companies.mock";

export const COMPANIES: Company[] = MOCK_COMPANIES;