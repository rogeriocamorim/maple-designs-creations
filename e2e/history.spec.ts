import { test, expect } from "@playwright/test";

test.describe("Quote History Page", () => {
  test("shows page heading", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByRole("heading", { name: "Quote History" })).toBeVisible();
  });

  test("shows empty state when no quotes saved", async ({ page }) => {
    await page.goto("/history");
    const hasQuotes = await page.locator("[class*='rounded-xl'][class*='border']").count();
    if (hasQuotes === 0) {
      await expect(page.getByText("No quotes saved yet")).toBeVisible();
      await expect(page.getByText("Go to Calculator")).toBeVisible();
    }
  });

  test("search input is visible", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByPlaceholder("Search by model name...")).toBeVisible();
  });

  test("full flow: save quote from calculator, view in history", async ({ page }) => {
    // First, create a quote from the calculator
    await page.goto("/calculator");

    await page.getByPlaceholder("Model Name").fill("E2E Test Widget");
    await page.getByLabel("Print Time — Hours").fill("1");
    await page.getByLabel("Print Time — Minutes").fill("30");

    // Handle the save alert
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole("button", { name: /Save/ }).first().click();

    // Wait for save alert to be handled
    await page.waitForTimeout(1000);

    // Navigate to history
    await page.goto("/history");

    // Should see the saved quote
    await expect(page.getByText("E2E Test Widget")).toBeVisible({ timeout: 10000 });

    // Quote count should show at least 1
    await expect(page.getByText(/\d+ saved quote/)).toBeVisible();
  });

  test("can search quotes in history", async ({ page }) => {
    await page.goto("/history");

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
    await page.goto("/history");

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
    await page.goto("/history");

    const quoteCard = page.locator("[class*='rounded-xl']", { hasText: "E2E Test Widget" }).first();
    const hasQuote = await quoteCard.isVisible().catch(() => false);

    if (hasQuote) {
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("E2E Test Widget");
        await dialog.accept();
      });

      // Click delete button (red trash icon)
      await quoteCard.locator("button[class*='danger'], button:has(svg)").last().click();

      await expect(page.getByText("E2E Test Widget")).not.toBeVisible({ timeout: 10000 });
    }
  });
});
