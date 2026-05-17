import { test, expect } from "@playwright/test";

test.describe("Filaments CRUD", () => {
  test("shows page heading and Add Filament button", async ({ page }) => {
    await page.goto("/filaments");
    await expect(page.getByRole("heading", { name: "Filaments" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Filament" }).first()).toBeVisible();
  });

  test("shows empty state when no filaments exist", async ({ page }) => {
    await page.goto("/filaments");
    const hasCards = await page.locator("[class*='grid'] [class*='rounded-xl']").count();
    if (hasCards === 0) {
      await expect(page.getByText("No filaments yet")).toBeVisible();
    }
  });

  test("can open Add Filament dialog", async ({ page }) => {
    await page.goto("/filaments");
    await page.getByRole("button", { name: "Add Filament" }).first().click();

    await expect(page.getByText("Brand *")).toBeVisible();
    await expect(page.getByText("Material *")).toBeVisible();
    await expect(page.getByLabel("Color Name *")).toBeVisible();
    await expect(page.getByText("Stock Tracking")).toBeVisible();
  });

  test("can create a new filament", async ({ page }) => {
    await page.goto("/filaments");
    await page.getByRole("button", { name: "Add Filament" }).first().click();

    // Select brand
    await page.getByText("Select brand...").first().click();
    await page.getByRole("option", { name: "Bambu Lab" }).click();

    // Select material
    await page.getByText("Select material...").click();
    await page.getByRole("option", { name: "PLA", exact: true }).click();

    // Fill color name
    await page.getByLabel("Color Name *").fill("E2E Black");

    // Fill cost
    await page.getByLabel("Cost per Spool *").fill("25.99");

    // Fill stock
    await page.getByLabel("Current Stock (g)").fill("800");

    // Submit
    await page.getByRole("button", { name: "Add Filament" }).last().click();

    // Should appear on page
    await expect(page.getByText("E2E Black")).toBeVisible({ timeout: 10000 });
  });

  test("Total Inventory panel is visible when filaments exist", async ({ page }) => {
    await page.goto("/filaments");
    const hasFilaments = await page.locator("[class*='grid'] [class*='rounded-xl']").count();
    if (hasFilaments > 0) {
      await expect(page.getByText("Total Inventory")).toBeVisible();
    }
  });

  test("search filter works", async ({ page }) => {
    await page.goto("/filaments");
    const searchInput = page.getByPlaceholder("Search filaments...");
    await searchInput.fill("E2E Black");
    await expect(page.getByText("E2E Black")).toBeVisible();

    await searchInput.fill("nonexistent-color-xyz");
    await expect(page.getByText(/No filaments match/)).toBeVisible();
  });

  test("can delete a filament", async ({ page }) => {
    await page.goto("/filaments");

    const card = page.locator("[class*='rounded-xl']", { hasText: "E2E Black" }).first();
    page.on("dialog", (dialog) => dialog.accept());
    await card.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("E2E Black")).not.toBeVisible({ timeout: 10000 });
  });
});
