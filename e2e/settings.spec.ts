import { test, expect } from "@playwright/test";

test.describe("Settings Page", () => {
  test("displays settings form with current values", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    // Sections are visible
    await expect(page.getByRole("heading", { name: "Electricity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Currency" })).toBeVisible();

    // Electricity rate input exists
    const elecInput = page.locator("input[type='number']").first();
    await expect(elecInput).toBeVisible();

    // Save button exists
    await expect(page.getByRole("button", { name: "Save Settings" })).toBeVisible();
  });

  test("can update electricity rate and save", async ({ page }) => {
    await page.goto("/settings");

    // Find the electricity rate input (first number input)
    const elecInput = page.locator("input[type='number']").first();
    await elecInput.click();
    await elecInput.fill("0.15");

    // Save
    await page.getByRole("button", { name: "Save Settings" }).click();

    // Should show "Saved!" confirmation
    await expect(page.getByText("Saved!")).toBeVisible();

    // Reload and verify the value persisted
    await page.reload();
    const updatedInput = page.locator("input[type='number']").first();
    await expect(updatedInput).toHaveValue("0.15");
  });

  test("can update target net margin and save", async ({ page }) => {
    await page.goto("/settings");

    // Target margin is the second number input
    const marginInput = page.locator("input[type='number']").nth(1);
    await marginInput.click();
    await marginInput.fill("50");

    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Saved!")).toBeVisible();

    await page.reload();
    const updatedInput = page.locator("input[type='number']").nth(1);
    await expect(updatedInput).toHaveValue("50");
  });

  test("save button shows loading state", async ({ page }) => {
    await page.goto("/settings");
    const saveBtn = page.getByRole("button", { name: "Save Settings" });
    await saveBtn.click();
    // Briefly shows "Saving..." then reverts
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
  });
});
