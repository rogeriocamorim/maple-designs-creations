import { test, expect } from "@playwright/test";

test.describe("Marketplaces CRUD", () => {
  test("shows page heading and Add Marketplace button", async ({ page }) => {
    await page.goto("/marketplaces");
    await expect(page.getByRole("heading", { name: "Marketplaces" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Marketplace" }).first()).toBeVisible();
  });

  test("shows empty state when no marketplaces exist", async ({ page }) => {
    await page.goto("/marketplaces");
    const hasCards = await page.locator("[class*='grid'] [class*='rounded-xl']").count();
    if (hasCards === 0) {
      await expect(page.getByText("No marketplaces yet")).toBeVisible();
    }
  });

  test("can open Add Marketplace dialog", async ({ page }) => {
    await page.goto("/marketplaces");
    await page.getByRole("button", { name: "Add Marketplace" }).first().click();

    await expect(page.getByLabel("Marketplace Name *")).toBeVisible();
  });

  test("can create a new marketplace", async ({ page }) => {
    await page.goto("/marketplaces");
    await page.getByRole("button", { name: "Add Marketplace" }).first().click();

    await page.getByLabel("Marketplace Name *").fill("E2E Etsy Test");

    // Select type if available
    const typeSelect = page.getByText("Select type...");
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
      await page.getByRole("option", { name: "Etsy" }).click();
    }

    // Submit
    await page.getByRole("button", { name: "Add Marketplace" }).last().click();

    // Should appear on page
    await expect(page.getByText("E2E Etsy Test")).toBeVisible({ timeout: 10000 });
  });

  test("can delete a marketplace", async ({ page }) => {
    await page.goto("/marketplaces");

    const card = page.locator("[class*='rounded-xl']", { hasText: "E2E Etsy Test" }).first();
    page.on("dialog", (dialog) => dialog.accept());
    await card.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("E2E Etsy Test")).not.toBeVisible({ timeout: 10000 });
  });
});
