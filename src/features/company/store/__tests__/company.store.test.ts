import { describe, it, expect, beforeEach } from "vitest";
import { useCompanyStore } from "../company.store";

const COMPANY_A = { id: "1", name: "Fyrirtæki ehf." };
const COMPANY_B = { id: "2", name: "DK Solutions" };

beforeEach(() => {
  useCompanyStore.setState({ selectedCompany: COMPANY_A });
});

describe("useCompanyStore", () => {
  it("starts with first company selected", () => {
    expect(useCompanyStore.getState().selectedCompany.id).toBe("1");
  });

  it("setSelectedCompany updates the selected company", () => {
    useCompanyStore.getState().setSelectedCompany(COMPANY_B);
    expect(useCompanyStore.getState().selectedCompany).toEqual(COMPANY_B);
  });

  it("setSelectedCompany replaces previous selection", () => {
    useCompanyStore.getState().setSelectedCompany(COMPANY_B);
    useCompanyStore.getState().setSelectedCompany(COMPANY_A);
    expect(useCompanyStore.getState().selectedCompany.id).toBe("1");
  });
});
