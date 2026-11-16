import { test, expect, seed, ANA_STATE } from '../fixtures';

test.use({ storageState: ANA_STATE });

test('con sesión, crear una reseña y verla en la ficha del estadio', async ({ home, visitForm, stadiumPage, page }, testInfo) => {
  // Texto único por intento: un reintento no se confunde con la reseña del intento anterior
  const review = `Reseña E2E ${testInfo.retry}-${Date.now()}`;

  await home.goto();
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toHaveCount(0); // la sesión vino del storageState
  await home.addVisitButton.click();
  await visitForm.chooseStadium('Perón', seed.cilindro.name);
  await visitForm.fill({ date: '2026-06-01', review });
  await visitForm.save();

  await stadiumPage.goto(seed.cilindro.id);
  await stadiumPage.expectLoaded(seed.cilindro.id, seed.cilindro.name);
  await stadiumPage.openReviews();
  // Aparece en "tu reseña" y en la lista: alcanza con la primera
  await expect(stadiumPage.review(review).first()).toBeVisible();
});
