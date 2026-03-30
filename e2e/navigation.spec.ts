import { test, expect } from "@playwright/test";
import { seedAuth } from "./helpers";

test.describe("Navigation — authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test("home page loads without redirecting to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL("/login");
  });

  test("navigating to /timeclock shows the page title", async ({ page }) => {
    await page.route("**/TimeClock/settings", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      }),
    );
    await page.goto("/timeclock/");
    await expect(page.getByRole("heading", { name: "Stimpilklukka" })).toBeVisible();
  });

  test("navigating to /projects shows the projects page", async ({ page }) => {
    await page.goto("/projects/");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });

  test("navigating to an unknown route shows a not-found page", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByText(/not found|fannst ekki|404/i)).toBeVisible();
  });
});

test.describe("Navigation — unauthenticated", () => {
  test("visiting a protected route redirects to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});
