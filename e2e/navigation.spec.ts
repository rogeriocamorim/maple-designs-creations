import { test, expect } from "@playwright/test";

test.describe("Navigation & Layout", () => {
  test("home page redirects to calculator", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/calculator/);
  });

  test("header displays app branding", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.locator("header")).toContainText("Maple Designs Creations");
  });

  test("all navigation links are visible", async ({ page }) => {
    await page.goto("/calculator");
    const nav = page.locator("nav");
    for (const label of [
      "Calculator",
      "Printers",
      "Filaments",
      "Supplies",
      "Marketplaces",
      "Quotes",
      "Settings",
    ]) {
      await expect(nav.getByText(label)).toBeVisible();
    }
  });

  test("clicking nav links navigates to correct pages", async ({ page }) => {
    await page.goto("/calculator");
    const nav = page.locator("nav");

    await nav.getByText("Printers").click();
    await expect(page).toHaveURL(/\/printers/);
    await expect(page.getByRole("heading", { name: "Printers" })).toBeVisible();

    await nav.getByText("Filaments").click();
    await expect(page).toHaveURL(/\/filaments/);
    await expect(page.getByRole("heading", { name: "Filaments" })).toBeVisible();

    await nav.getByText("Supplies").click();
    await expect(page).toHaveURL(/\/supplies/);
    await expect(page.getByRole("heading", { name: "Supplies" })).toBeVisible();

    await nav.getByText("Marketplaces").click();
    await expect(page).toHaveURL(/\/marketplaces/);
    await expect(page.getByRole("heading", { name: "Marketplaces" })).toBeVisible();

    await nav.getByText("Quotes").click();
    await expect(page).toHaveURL(/\/quotes/);
    await expect(page.getByRole("heading", { name: "Quotes" })).toBeVisible();

    await nav.getByText("Settings").click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("active nav item is highlighted", async ({ page }) => {
    await page.goto("/settings");
    const settingsLink = page.locator("nav a", { hasText: "Settings" });
    await expect(settingsLink).toHaveClass(/border-\[#e05a2b\]/);
  });
});
