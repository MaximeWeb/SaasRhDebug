import { test, expect } from '@playwright/test';
import path from 'path';

test('Un employé peut créer une nouvelle note de frais', async ({ page }) => {
  // 1. Aller à la page de login
  await page.goto('http://127.0.0.1:8080'); // adapte l’URL si besoin
 
  // 2. Se connecter en tant qu'employé
  await page.fill(`input[data-testid="employee-email-input"]`, 'employee@test.tld');
  await page.fill(`input[data-testid="employee-password-input"]`, 'employee');
  await page.click('button[data-testid="employee-login-button"]');

 // 3. Vérifier qu’on est redirigé vers la page Bills
await expect(page.locator('.content-title')).toHaveText('Mes notes de frais');
  

//   await expect(page.locator('.content-title')).toBeTruthy();
await expect(page.locator('[data-testid="btn-new-bill"]')).toBeVisible();

  // 4. Cliquer sur "Nouvelle note de frais"
  await page.click(`button[data-testid="btn-new-bill"]`);

  // 5. Remplir le formulaire
  await page.selectOption('select[data-testid="expense-type"]', 'Transports');
  await page.fill('input[data-testid="expense-name"]', 'Vol Paris-Brest');
  await page.fill('input[data-testid="datepicker"]', '2024-05-01');
  await page.fill('input[data-testid="amount"]', "100");
  await page.fill('input[data-testid="vat"]', "20");
  await page.fill('input[data-testid="pct"]', "20");
  await page.fill('textarea[data-testid="commentary"]', 'test E2E');

 
  // 6. Upload d’un fichier (test.jpg doit exister dans e2e/assets)
  const filePath = "src/e2e/assets/teest.jpg"
  await page.setInputFiles('input[data-testid="file"]', filePath);

  // 7. Soumettre le formulaire
  await page.click('#btn-send-bill');

  // 8. Vérifier qu'on est de retour sur la page Bills
  await expect(page.locator('.content-title')).toHaveText('Mes notes de frais');

  // 9. Vérifier que la note de frais est bien listée
  await expect(page.locator('tr:nth-child(3) td:nth-child(2)')).toContainText('Vol Paris-Brest');

});