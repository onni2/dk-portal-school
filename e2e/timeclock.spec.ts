import { test, expect } from "@playwright/test";
import { seedAuth } from "./helpers";

const MOCK_SETTINGS = {
  Enabled: true,
  RoundFactor: 1,
  RoundUpDaytimeAlso: false,
  Text: 1,
  Project: 0,
  Phase: 2,
  Task: 1,
  Dim1: 0,
  Dim2: 0,
  Dim3: 0,
  SendToProjectTransaction: false,
};

test.describe("Timeclock page", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await page.route("**/TimeClock/settings", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SETTINGS),
      }),
    );
    await page.goto("/timeclock/");
    // Wait for all three panels to finish loading before each test
    await page.getByRole("heading", { name: "Stillingar" }).waitFor();
    await page.getByRole("heading", { name: "IP-tölur í hvítlista" }).waitFor();
    await page.getByRole("heading", { name: "Símanúmer starfsmanna" }).waitFor();
  });

  test("shows all three sections", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Stillingar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "IP-tölur í hvítlista" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Símanúmer starfsmanna" })).toBeVisible();
  });

  test("settings card shows Virkt when timeclock is enabled", async ({ page }) => {
    await expect(page.getByText("Virkt", { exact: true })).toBeVisible();
  });

  test("IP whitelist shows the Mock badge", async ({ page }) => {
    await expect(page.getByText("Mock").first()).toBeVisible();
  });

  test("can open the IP add form", async ({ page }) => {
    await page.getByText("+ Bæta við").first().click();
    await expect(page.getByPlaceholder("IP-tala, t.d. 192.168.1.10")).toBeVisible();
  });

  test("can cancel the IP add form without adding anything", async ({ page }) => {
    await page.getByText("+ Bæta við").first().click();
    await page.getByText("Hætta við").first().click();
    await expect(page.getByPlaceholder("IP-tala, t.d. 192.168.1.10")).not.toBeVisible();
  });

  test("can add a new IP address", async ({ page }) => {
    await page.getByText("+ Bæta við").first().click();
    await page.getByPlaceholder("IP-tala, t.d. 192.168.1.10").fill("10.10.10.10");
    await page.getByText("Vista").first().click();
    await expect(page.getByText("10.10.10.10")).toBeVisible();
  });

  test("cannot add an IP when the field is empty", async ({ page }) => {
    await page.getByText("+ Bæta við").first().click();
    await page.getByText("Vista").first().click();
    await expect(page.getByPlaceholder("IP-tala, t.d. 192.168.1.10")).toBeVisible();
  });

  test("can open the employee phones add form", async ({ page }) => {
    await page.getByText("+ Bæta við").last().click();
    await expect(page.getByPlaceholder("Símanúmer")).toBeVisible();
  });

  test("can add a new employee phone", async ({ page }) => {
    await page.getByText("+ Bæta við").last().click();
    await page.getByPlaceholder("Númer starfsmanns").fill("99");
    await page.getByPlaceholder("Símanúmer").fill("8887766");
    await page.getByText("Vista").last().click();
    await expect(page.getByText("8887766")).toBeVisible();
  });
});
