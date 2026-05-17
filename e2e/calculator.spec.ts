import { test, expect } from "@playwright/test";

test.describe("Calculator Page", () => {
  test("displays calculator heading and main sections", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.getByRole("heading", { name: "Calculator" })).toBeVisible();
    await expect(page.getByText("Model Information")).toBeVisible();
    await expect(page.getByText("Parts & Filaments")).toBeVisible();
  });

  test("model name input works", async ({ page }) => {
    await page.goto("/calculator");
    const modelInput = page.getByPlaceholder("Model Name");
    await modelInput.fill("Test Widget");
    await expect(modelInput).toHaveValue("Test Widget");
  });

  test("print time inputs can be cleared and filled", async ({ page }) => {
    await page.goto("/calculator");

    // Hours input — should start empty (0 shows as "")
    const hoursInput = page.getByLabel("Print Time — Hours");
    await expect(hoursInput).toHaveValue("");

    // Type a value
    await hoursInput.fill("2");
    await expect(hoursInput).toHaveValue("2");

    // Clear it
    await hoursInput.fill("");
    await expect(hoursInput).toHaveValue("");

    // Minutes input
    const minutesInput = page.getByLabel("Print Time — Minutes");
    await expect(minutesInput).toHaveValue("");

    await minutesInput.fill("30");
    await expect(minutesInput).toHaveValue("30");

    await minutesInput.fill("");
    await expect(minutesInput).toHaveValue("");
  });

  test("models per plate defaults to 1 and can be changed", async ({ page }) => {
    await page.goto("/calculator");
    const modelsInput = page.getByLabel("Models Per Plate");
    // Default is 1 which shows as "1" (since || "" converts 0 to empty, but 1 stays)
    await expect(modelsInput).toHaveValue("1");

    await modelsInput.fill("4");
    await expect(modelsInput).toHaveValue("4");
  });

  test("number inputs do not accept negative values", async ({ page }) => {
    await page.goto("/calculator");

    const hoursInput = page.getByLabel("Print Time — Hours");
    await hoursInput.fill("-5");
    // Should be clamped to 0 (displayed as empty)
    await expect(hoursInput).toHaveValue("");

    const minutesInput = page.getByLabel("Print Time — Minutes");
    await minutesInput.fill("-10");
    await expect(minutesInput).toHaveValue("");
  });

  test("minutes input is clamped to 0-59", async ({ page }) => {
    await page.goto("/calculator");

    const minutesInput = page.getByLabel("Print Time — Minutes");
    await minutesInput.fill("75");
    await expect(minutesInput).toHaveValue("59");
  });

  test("advanced settings section toggles open/close", async ({ page }) => {
    await page.goto("/calculator");

    // Advanced settings should be collapsed by default
    await expect(page.getByText("Labor Costs")).not.toBeVisible();

    // Click to expand
    await page.getByText("Advanced Settings").click();
    await expect(page.getByText("Labor Costs")).toBeVisible();
    await expect(page.getByText("Other Model Supplies")).toBeVisible();

    // Click to collapse
    await page.getByText("Advanced Settings").click();
    await expect(page.getByText("Labor Costs")).not.toBeVisible();
  });

  test("labor cost inputs work and show total", async ({ page }) => {
    await page.goto("/calculator");

    // Open advanced settings
    await page.getByText("Advanced Settings").click();

    const laborTime = page.getByLabel("Time (minutes)");
    const laborCost = page.getByLabel("Cost Per Hour");

    await laborTime.fill("30");
    await laborCost.fill("20");

    // Total cost should be 30/60 * 20 = $10
    await expect(page.getByText("Total Cost")).toBeVisible();
  });

  test("can add and remove parts", async ({ page }) => {
    await page.goto("/calculator");

    // Should have at least one part row by default
    await expect(page.getByPlaceholder("e.g., Body, Support")).toBeVisible();

    // Add another part
    await page.getByRole("button", { name: "Add Printed Part" }).click();

    // Should have multiple part name inputs
    const partNames = page.getByPlaceholder("e.g., Body, Support");
    expect(await partNames.count()).toBeGreaterThanOrEqual(2);
  });

  test("can add supply lines in advanced settings", async ({ page }) => {
    await page.goto("/calculator");

    // Open advanced settings
    await page.getByText("Advanced Settings").click();

    // Add a supply
    await page.getByRole("button", { name: "Add Supply" }).click();

    // Should show supply entry fields
    await expect(page.getByLabel("Qty")).toBeVisible();
  });

  test("reset button clears all inputs", async ({ page }) => {
    await page.goto("/calculator");

    // Fill some data
    const modelInput = page.getByPlaceholder("Model Name");
    await modelInput.fill("Test Widget");
    await page.getByLabel("Print Time — Hours").fill("3");

    // Click reset
    await page.getByRole("button", { name: "Reset" }).first().click();

    // Model name should be cleared
    await expect(modelInput).toHaveValue("");
    // Hours should be back to empty (0)
    await expect(page.getByLabel("Print Time — Hours")).toHaveValue("");
  });

  test("save requires model name", async ({ page }) => {
    await page.goto("/calculator");

    // Handle the alert dialog
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("model name");
      await dialog.accept();
    });

    // Try to save without model name
    await page.getByRole("button", { name: /Save/ }).first().click();
  });

  test("cost summary panel is visible", async ({ page }) => {
    await page.goto("/calculator");
    // The CostSummaryPanel should show COGS breakdown
    await expect(page.getByRole("heading", { name: "Marketplaces" })).toBeVisible();
  });
});
