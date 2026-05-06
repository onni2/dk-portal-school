import { describe, it, expect } from "vitest";
import { groupLines, buildOverview, PACKAGE_ITEM_CODES } from "../overview.api";
import type { InvoiceLine, SubscriptionInvoice } from "../../types/overview.types";

function makeLine(ItemCode: string, TotalAmountWithTax = 1000): InvoiceLine {
  return { ItemCode, TotalAmountWithTax, SequenceNumber: 1, Quantity: 1, Text: null };
}

function makeInvoice(lines: InvoiceLine[], extra: Partial<SubscriptionInvoice> = {}): SubscriptionInvoice {
  return { Number: "INV-1", OrderNumber: "ORD-1", InvoiceDate: "2026-01-01", Origin: 3, Lines: lines, ...extra };
}

describe("PACKAGE_ITEM_CODES", () => {
  it("includes dk-pakki-1", () => {
    expect(PACKAGE_ITEM_CODES).toContain("dk-pakki-1");
  });

  it("includes dka-2000", () => {
    expect(PACKAGE_ITEM_CODES).toContain("dka-2000");
  });
});

describe("groupLines", () => {
  it("returns empty array for no lines", () => {
    expect(groupLines([])).toEqual([]);
  });

  it("groups fjárhagur lines by dkl-20 prefix", () => {
    const groups = groupLines([makeLine("DKL-2010"), makeLine("DKL-2011")]);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.title).toBe("Fjárhagur");
    expect(groups[0]!.lines).toHaveLength(2);
  });

  it("groups hýsing lines by v-dk- prefix", () => {
    const groups = groupLines([makeLine("v-dk-web")]);
    expect(groups[0]!.title).toBe("Hýsing");
  });

  it("calculates total per group", () => {
    const groups = groupLines([makeLine("DKL-2010", 500), makeLine("DKL-2011", 300)]);
    expect(groups[0]!.total).toBe(800);
  });

  it("puts unknown codes into Aðrar vörur", () => {
    const groups = groupLines([makeLine("xyz-unknown")]);
    expect(groups[0]!.title).toBe("Aðrar vörur");
  });

  it("each line appears in exactly one group", () => {
    const lines = [makeLine("DKL-2010"), makeLine("DKL-2110"), makeLine("v-dk-web"), makeLine("xyz-other")];
    const groups = groupLines(lines);
    const total = groups.reduce((sum, g) => sum + g.lines.length, 0);
    expect(total).toBe(lines.length);
  });

  it("does not include package lines — those are filtered before calling groupLines", () => {
    const groups = groupLines([makeLine("dk-pakki-1")]);
    expect(groups[0]!.title).toBe("Aðrar vörur");
  });
});

describe("buildOverview", () => {
  it("returns empty when no invoices", () => {
    const result = buildOverview([]);
    expect(result.packageLines).toEqual([]);
    expect(result.groups).toEqual([]);
  });

  it("separates package lines from group lines", () => {
    const inv = makeInvoice([makeLine("dk-pakki-1"), makeLine("DKL-2010")]);
    const result = buildOverview([inv]);
    expect(result.packageLines).toHaveLength(1);
    expect(result.packageLines[0]!.ItemCode).toBe("dk-pakki-1");
    expect(result.groups[0]!.title).toBe("Fjárhagur");
  });

  it("flattens lines from multiple invoices", () => {
    const inv1 = makeInvoice([makeLine("dk-pakki-1")], { Number: "INV-1", OrderNumber: "ORD-1" });
    const inv2 = makeInvoice([makeLine("DKL-2010")], { Number: "INV-2", OrderNumber: "ORD-2" });
    const result = buildOverview([inv1, inv2]);
    expect(result.packageLines).toHaveLength(1);
    expect(result.groups[0]!.lines).toHaveLength(1);
  });

  it("handles invoice with no lines", () => {
    const inv = makeInvoice([], { Lines: null });
    const result = buildOverview([inv]);
    expect(result.packageLines).toEqual([]);
    expect(result.groups).toEqual([]);
  });
});
