import { test, expect } from "@playwright/test";

test.describe("Printers CRUD", () => {
  test("shows empty state when no printers exist", async ({ page }) => {
    await page.goto("/printers");
    await expect(page.getByRole("heading", { name: "Printers" })).toBeVisible();
    // Either shows printer cards or the empty state
    const hasCards = await page.locator("[class*='grid'] [class*='rounded-xl']").count();
    if (hasCards === 0) {
      await expect(page.getByText("No printers yet")).toBeVisible();
    }
  });

  test("can open Add Printer dialog", async ({ page }) => {
    await page.goto("/printers");
    await page.getByRole("button", { name: "Add Printer" }).first().click();

    // Dialog should be visible
    await expect(page.getByText("Printer Identity")).toBeVisible();
    await expect(page.getByText("Cost Configuration")).toBeVisible();
    await expect(page.getByText("Estimated Operating Cost")).toBeVisible();
  });

  test("validates required fields on printer form", async ({ page }) => {
    await page.goto("/printers");
    await page.getByRole("button", { name: "Add Printer" }).first().click();

    // Try to submit with empty fields
    await page.getByRole("button", { name: "Add Printer" }).last().click();

    // Should show validation errors
    await expect(page.getByText("Name is required", { exact: true })).toBeVisible();
  });

  test("can create a new printer", async ({ page }) => {
    await page.goto("/printers");
    await page.getByRole("button", { name: "Add Printer" }).first().click();

    // Fill in required fields
    await page.getByLabel("Printer Name *").fill("E2E Test Printer");

    // Select brand using the Radix Select
    await page.getByText("Select brand...").first().click();
    await page.getByRole("option", { name: "Bambu Lab" }).click();

    await page.getByLabel("Model Name *").fill("X1C");

    // Fill cost fields
    await page.getByLabel("Power (Watts)").fill("200");

    // Submit
    await page.getByRole("button", { name: "Add Printer" }).last().click();

    // Dialog should close and printer should appear
    await expect(page.getByText("E2E Test Printer")).toBeVisible({ timeout: 10000 });
  });

  test("can edit a printer", async ({ page }) => {
    await page.goto("/printers");

    // Find the printer card and click edit
    const card = page.locator("[class*='rounded-xl']", { hasText: "E2E Test Printer" }).first();
    await card.getByRole("button").filter({ hasText: /edit/i }).or(
      card.locator("button[class*='text-\\[#6b7280\\]']").first()
    ).click();

    // Wait for dialog
    await expect(page.getByText("Printer Identity")).toBeVisible({ timeout: 5000 });

    // Update name
    const nameInput = page.getByLabel("Printer Name *");
    await nameInput.fill("E2E Printer Updated");

    // Save
    await page.getByRole("button", { name: /save|update/i }).click();

    // Should see updated name
    await expect(page.getByText("E2E Printer Updated")).toBeVisible({ timeout: 10000 });
  });

  test("can delete a printer", async ({ page }) => {
    await page.goto("/printers");

    // Find the printer card
    const card = page.locator("[class*='rounded-xl']", { hasText: "E2E Printer Updated" }).first();

    // Click delete button
    await card.getByRole("button", { name: "Delete" }).click();

    // Confirm in the modal dialog
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();

    // Printer should be gone
    await expect(page.getByText("E2E Printer Updated")).not.toBeVisible({ timeout: 10000 });
  });
});
