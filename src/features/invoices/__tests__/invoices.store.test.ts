import { describe, it, expect, beforeEach } from "vitest";
import { useInvoiceFilters } from "../store/invoices.store";

beforeEach(() => {
  useInvoiceFilters.setState({
    dateFrom: "",
    dateTo: "",
    activePeriod: null,
    search: "",
    selectedInvoiceNumber: null,
  });
});

describe("useInvoiceFilters", () => {
  it("starts with empty filters", () => {
    const s = useInvoiceFilters.getState();
    expect(s.dateFrom).toBe("");
    expect(s.dateTo).toBe("");
    expect(s.activePeriod).toBeNull();
    expect(s.search).toBe("");
    expect(s.selectedInvoiceNumber).toBeNull();
  });

  it("setDateFrom updates dateFrom", () => {
    useInvoiceFilters.getState().setDateFrom("2026-01-01");
    expect(useInvoiceFilters.getState().dateFrom).toBe("2026-01-01");
  });

  it("setDateTo updates dateTo", () => {
    useInvoiceFilters.getState().setDateTo("2026-12-31");
    expect(useInvoiceFilters.getState().dateTo).toBe("2026-12-31");
  });

  it("setActivePeriod updates activePeriod", () => {
    useInvoiceFilters.getState().setActivePeriod("month");
    expect(useInvoiceFilters.getState().activePeriod).toBe("month");
  });

  it("setActivePeriod can be cleared to null", () => {
    useInvoiceFilters.getState().setActivePeriod("thisYear");
    useInvoiceFilters.getState().setActivePeriod(null);
    expect(useInvoiceFilters.getState().activePeriod).toBeNull();
  });

  it("setSearch updates search", () => {
    useInvoiceFilters.getState().setSearch("reikningur");
    expect(useInvoiceFilters.getState().search).toBe("reikningur");
  });

  it("setSelectedInvoiceNumber updates selectedInvoiceNumber", () => {
    useInvoiceFilters.getState().setSelectedInvoiceNumber("INV-001");
    expect(useInvoiceFilters.getState().selectedInvoiceNumber).toBe("INV-001");
  });

  it("setSelectedInvoiceNumber can be cleared to null", () => {
    useInvoiceFilters.getState().setSelectedInvoiceNumber("INV-001");
    useInvoiceFilters.getState().setSelectedInvoiceNumber(null);
    expect(useInvoiceFilters.getState().selectedInvoiceNumber).toBeNull();
  });

  it("setting one field does not affect others", () => {
    useInvoiceFilters.getState().setSearch("test");
    const s = useInvoiceFilters.getState();
    expect(s.dateFrom).toBe("");
    expect(s.activePeriod).toBeNull();
    expect(s.selectedInvoiceNumber).toBeNull();
  });
});
