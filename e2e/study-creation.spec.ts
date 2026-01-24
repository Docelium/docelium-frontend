import { test, expect } from '@playwright/test';

test.describe('Study Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@docelium.local');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display studies list', async ({ page }) => {
    await page.goto('/studies');
    await expect(page.getByText('Protocoles')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nouveau protocole' })).toBeVisible();
  });

  test('should navigate to new study page', async ({ page }) => {
    await page.goto('/studies');
    await page.getByRole('link', { name: 'Nouveau protocole' }).click();
    await expect(page).toHaveURL(/\/studies\/new/);
    await expect(page.getByText('Nouveau protocole')).toBeVisible();
  });

  test('should create a new study with stepper', async ({ page }) => {
    await page.goto('/studies/new');

    // Step 1: Identification
    await page.getByLabel('Code du protocole').fill('TEST-2025-E2E');
    await page.getByLabel('Titre').fill('Test E2E Study');
    await page.getByLabel('Nom du promoteur').fill('Test Sponsor');
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Step 2: Organisation (optional, skip)
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Step 3: Identifiers (optional, skip)
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Step 4: Parameters
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Step 5: Dates (optional, create)
    await page.getByRole('button', { name: 'Creer le protocole' }).click();

    // Should redirect to study detail page
    await expect(page).toHaveURL(/\/studies\/[a-f0-9-]+$/);
    await expect(page.getByText('TEST-2025-E2E')).toBeVisible();
  });
});
