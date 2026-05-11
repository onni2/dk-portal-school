import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardLayout, ALL_CARDS } from "../dashboard.store";

beforeEach(() => {
  localStorage.removeItem("dk-dashboard-cards");
  useDashboardLayout.setState({ cardIds: ["reikningar", "stimpilklukka"] });
});

describe("ALL_CARDS", () => {
  it("has no duplicate ids", () => {
    const ids = ALL_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every card has an id, title, description, and to", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
      expect(card.to).toBeTruthy();
    });
  });

  it("cards with a licenceModule reference a known LicenceResponse key", () => {
    const knownModules = ["dkPlus", "Hosting", "POS", "dkOne", "TimeClock"];
    ALL_CARDS.forEach((card) => {
      if (card.licenceModule) {
        expect(knownModules).toContain(card.licenceModule);
      }
    });
  });
});

describe("useDashboardLayout", () => {
  it("starts with the default card ids", () => {
    const { cardIds } = useDashboardLayout.getState();
    expect(cardIds).toEqual(["reikningar", "stimpilklukka"]);
  });

  it("addCard appends a new id", () => {
    useDashboardLayout.getState().addCard("hysing");
    expect(useDashboardLayout.getState().cardIds).toContain("hysing");
  });

  it("addCard does not remove existing cards", () => {
    useDashboardLayout.getState().addCard("hysing");
    const { cardIds } = useDashboardLayout.getState();
    expect(cardIds).toContain("reikningar");
    expect(cardIds).toContain("stimpilklukka");
  });

  it("removeCard removes the given id", () => {
    useDashboardLayout.getState().removeCard("reikningar");
    expect(useDashboardLayout.getState().cardIds).not.toContain("reikningar");
  });

  it("removeCard leaves other cards untouched", () => {
    useDashboardLayout.getState().removeCard("reikningar");
    expect(useDashboardLayout.getState().cardIds).toContain("stimpilklukka");
  });

  it("setCardIds replaces the full list", () => {
    useDashboardLayout.getState().setCardIds(["notendur", "hjalp"]);
    expect(useDashboardLayout.getState().cardIds).toEqual(["notendur", "hjalp"]);
  });

  it("persists to localStorage on addCard", () => {
    useDashboardLayout.getState().addCard("pos");
    const stored = JSON.parse(localStorage.getItem("dk-dashboard-cards")!) as string[];
    expect(stored).toContain("pos");
  });

  it("persists to localStorage on removeCard", () => {
    useDashboardLayout.getState().removeCard("reikningar");
    const stored = JSON.parse(localStorage.getItem("dk-dashboard-cards")!) as string[];
    expect(stored).not.toContain("reikningar");
  });
});
