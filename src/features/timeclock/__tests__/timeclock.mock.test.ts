import { describe, it, expect } from "vitest";
import { MOCK_IP_WHITELIST, MOCK_EMPLOYEE_PHONES } from "@/mocks/timeclock.mock";

describe("MOCK_IP_WHITELIST", () => {
  it("has at least one entry", () => {
    expect(MOCK_IP_WHITELIST.length).toBeGreaterThan(0);
  });

  it("every entry has an id, ip, and label", () => {
    MOCK_IP_WHITELIST.forEach((entry) => {
      expect(entry.id).toBeTruthy();
      expect(entry.ip).toBeTruthy();
      expect(typeof entry.label).toBe("string");
    });
  });

  it("all IPs are valid IPv4 format", () => {
    const ipv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    MOCK_IP_WHITELIST.forEach((entry) => {
      expect(entry.ip).toMatch(ipv4);
    });
  });
});

describe("MOCK_EMPLOYEE_PHONES", () => {
  it("has at least one entry", () => {
    expect(MOCK_EMPLOYEE_PHONES.length).toBeGreaterThan(0);
  });

  it("every entry has an id, kennitala, and phone", () => {
    MOCK_EMPLOYEE_PHONES.forEach((entry) => {
      expect(entry.id).toBeTruthy();
      expect(entry.kennitala).toBeTruthy();
      expect(entry.phone).toBeTruthy();
    });
  });

  it("all ids are unique", () => {
    const ids = MOCK_EMPLOYEE_PHONES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all kennitölu are 10 characters", () => {
    MOCK_EMPLOYEE_PHONES.forEach((entry) => {
      expect(entry.kennitala).toHaveLength(10);
    });
  });
});
