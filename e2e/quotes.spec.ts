import { test, expect } from "@playwright/test";

test.describe("Quotes Page", () => {
  test("shows page heading", async ({ page }) => {
    await page.goto("/quotes");
    await expect(page.getByRole("heading", { name: "Quotes" })).toBeVisible();
  });

  test("shows empty state when no quotes saved", async ({ page }) => {
    await page.goto("/quotes");
    const hasQuotes = await page.locator("[class*='rounded-xl'][class*='border']").count();
    if (hasQuotes === 0) {
      await expect(page.getByText("No quotes saved yet")).toBeVisible();
      await expect(page.getByText("Go to Calculator")).toBeVisible();
    }
  });

  test("search input is visible", async ({ page }) => {
    await page.goto("/quotes");
    await expect(page.getByPlaceholder("Search by model name...")).toBeVisible();
  });

  test("full flow: save quote from calculator, view in quotes", async ({ page }) => {
    // First, create a quote from the calculator
    await page.goto("/calculator");

    await page.getByPlaceholder("Model Name").fill("E2E Test Widget");
    await page.getByLabel("Print Time — Hours").fill("1");
    await page.getByLabel("Print Time — Minutes").fill("30");

    await page.getByRole("button", { name: /Save/ }).first().click();

    // Should auto-navigate to quotes page
    await expect(page).toHaveURL(/\/quotes/, { timeout: 10000 });

    // Should see the saved quote
    await expect(page.getByText("E2E Test Widget")).toBeVisible({ timeout: 10000 });

    // Quote count should show at least 1
    await expect(page.getByText(/\d+ saved quote/)).toBeVisible();
  });

  test("can search quotes", async ({ page }) => {
    await page.goto("/quotes");

    const searchInput = page.getByPlaceholder("Search by model name...");
    await searchInput.fill("E2E Test Widget");

    // If quote exists, it should be visible
    const hasResult = await page.getByText("E2E Test Widget").isVisible().catch(() => false);
    if (hasResult) {
      await expect(page.getByText("E2E Test Widget")).toBeVisible();
    }

    // Search for nonexistent
    await searchInput.fill("nonexistent_model_xyz_123");
    await expect(page.getByText(/No quotes match/)).toBeVisible();
  });

  test("can expand quote details", async ({ page }) => {
    await page.goto("/quotes");

    // Only test if quotes exist
    const quoteCard = page.locator("[class*='rounded-xl']", { hasText: "COGS" }).first();
    const hasQuotes = await quoteCard.isVisible().catch(() => false);

    if (hasQuotes) {
      // Find and click the expand button (ChevronDown icon button)
      const expandBtn = quoteCard.locator("button").filter({ has: page.locator("svg") }).first();
      await expandBtn.click();

      // Should show breakdown details
      await expect(page.getByText("Filament").first()).toBeVisible();
    }
  });

  test("can delete a quote", async ({ page }) => {
    await page.goto("/quotes");

    const quoteCard = page.locator("[class*='rounded-xl']", { hasText: "E2E Test Widget" }).first();
    const hasQuote = await quoteCard.isVisible().catch(() => false);

    if (hasQuote) {
      // Click delete button (red trash icon)
      await quoteCard.locator("button[class*='danger'], button:has(svg)").last().click();

      // Confirm in the modal dialog
      const alertDialog = page.getByRole("alertdialog");
      await expect(alertDialog).toBeVisible();
      await expect(alertDialog.getByText("E2E Test Widget")).toBeVisible();
      await alertDialog.getByRole("button", { name: "Delete" }).click();

      await expect(page.getByText("E2E Test Widget")).not.toBeVisible({ timeout: 10000 });
    }
  });
});
