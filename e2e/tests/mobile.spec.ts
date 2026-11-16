import { test, expect, seed } from '../fixtures';

// Proyecto "mobile" (Pixel 7): la navbar colapsa en el menú hamburguesa
test('mobile: el mapa ocupa la pantalla y el login está en el menú', async ({ home, page }) => {
  await home.goto();
  const box = await home.map.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 1);

  await expect(page.getByRole('button', { name: 'Iniciar sesión' }).first()).toBeHidden(); // los botones de escritorio
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(home.loginModal.heading).toBeVisible();
});

test('mobile: la ficha de un estadio se lee sin scroll horizontal', async ({ stadiumPage, page }) => {
  await stadiumPage.goto(seed.monumental.id);
  await stadiumPage.expectLoaded(seed.monumental.id, seed.monumental.name);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
