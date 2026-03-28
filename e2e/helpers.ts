import type { Page } from "@playwright/test";

const MOCK_USER = {
  id: "1",
  email: "test@dk.is",
  name: "Test User",
  role: "admin",
  kennitala: "1",
};

const MOCK_TOKEN = "be5efec7-e6d2-4f5a-bd9b-077f937bcb8d";

const MOCK_LICENCE = {
  GeneralLedger: { Enabled: true },
  Customer: { Enabled: true },
  Project: { Enabled: true },
  Payroll: { Enabled: true },
};

/**
 * Seeds localStorage with a valid auth session so the app doesn't redirect to /login.
 * Also intercepts the licence API call that fires on every authenticated page load.
 */
export async function seedAuth(page: Page) {
  await page.addInitScript(({ user, token }) => {
    localStorage.setItem("dk-auth-user", JSON.stringify(user));
    localStorage.setItem("dk-auth-token", token);
  }, { user: MOCK_USER, token: MOCK_TOKEN });

  await page.route("**/company/licence", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_LICENCE),
    }),
  );
}
