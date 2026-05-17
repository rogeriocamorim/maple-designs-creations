import { test, expect } from "@playwright/test";

test.describe("Supplies CRUD", () => {
  test("shows page heading and Add Supply button", async ({ page }) => {
    await page.goto("/supplies");
    await expect(page.getByRole("heading", { name: "Supplies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Supply" }).first()).toBeVisible();
  });

  test("shows empty state when no supplies exist", async ({ page }) => {
    await page.goto("/supplies");
    const hasCards = await page.locator("[class*='grid'] [class*='rounded-xl']").count();
    if (hasCards === 0) {
      await expect(page.getByText("No supplies yet")).toBeVisible();
    }
  });

  test("can open Add Supply dialog", async ({ page }) => {
    await page.goto("/supplies");
    await page.getByRole("button", { name: "Add Supply" }).first().click();
    await expect(page.getByLabel("Supply Name *")).toBeVisible();
    await expect(page.getByLabel("Quantity Purchased *")).toBeVisible();
    await expect(page.getByLabel("Total Price *")).toBeVisible();
    await expect(page.getByText("Price per Unit")).toBeVisible();
  });

  test("shows computed unit cost in dialog", async ({ page }) => {
    await page.goto("/supplies");
    await page.getByRole("button", { name: "Add Supply" }).first().click();

    await page.getByLabel("Quantity Purchased *").fill("10");
    await page.getByLabel("Total Price *").fill("25");

    // Should show price per unit calculation
    await expect(page.getByText("Price per Unit")).toBeVisible();
    // The computed value should be 25/10 = 2.50
    await expect(page.getByText(/2\.50/)).toBeVisible();
  });

  test("can create a new supply", async ({ page }) => {
    await page.goto("/supplies");
    await page.getByRole("button", { name: "Add Supply" }).first().click();

    await page.getByLabel("Supply Name *").fill("E2E Test Box");
    await page.getByLabel("Quantity Purchased *").fill("50");
    await page.getByLabel("Total Price *").fill("100");
    await page.getByLabel("Current Stock").fill("25");

    // Submit
    await page.getByRole("button", { name: "Add Supply" }).last().click();

    // Should appear on page
    await expect(page.getByText("E2E Test Box")).toBeVisible({ timeout: 10000 });
  });

  test("supply card shows unit cost and stock info", async ({ page }) => {
    await page.goto("/supplies");

    const card = page.locator("[class*='rounded-xl']", { hasText: "E2E Test Box" }).first();
    await expect(card).toBeVisible();
    // Unit cost = 100/50 = $2.00
    await expect(card.getByText(/2\.00/)).toBeVisible();
    // Stock info
    await expect(card.getByText(/25/)).toBeVisible();
  });

  test("search filter works", async ({ page }) => {
    await page.goto("/supplies");
    const searchInput = page.getByPlaceholder("Search supplies...");
    await searchInput.fill("E2E Test Box");
    await expect(page.getByText("E2E Test Box")).toBeVisible();

    await searchInput.fill("nonexistent");
    await expect(page.getByText(/No supplies match/)).toBeVisible();
  });

  test("can delete a supply", async ({ page }) => {
    await page.goto("/supplies");

    const card = page.locator("[class*='rounded-xl']", { hasText: "E2E Test Box" }).first();
    page.on("dialog", (dialog) => dialog.accept());
    await card.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("E2E Test Box")).not.toBeVisible({ timeout: 10000 });
  });
});
