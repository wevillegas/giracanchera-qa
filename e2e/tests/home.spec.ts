import { test, expect, seed } from '../fixtures';

test.describe('Home', () => {
  test('carga y el mapa se renderiza con los estadios', async ({ home, page }) => {
    await home.goto();
    await expect(page).toHaveTitle('GiraCanchera');
    await expect(home.map).toHaveClass(/maplibregl-map/);
    // Pines o grupos de estadios sobre el mapa (marcadores de MapLibre)
    await expect(home.map.locator('.maplibregl-marker').first()).toBeVisible();
  });

  test('buscar un estadio y ver su ficha', async ({ home, stadiumPage }) => {
    await home.goto();
    await home.openStadiumFromSearch('Monumental', seed.monumental.name);
    await stadiumPage.expectLoaded(seed.monumental.id, seed.monumental.name);
    await stadiumPage.openReviews();
    await expect(stadiumPage.review('Ambiente increíble')).toBeVisible(); // reseña del seed
  });

  test('link directo a la ficha de un estadio', async ({ stadiumPage }) => {
    await stadiumPage.goto(seed.monumental.id);
    await stadiumPage.expectLoaded(seed.monumental.id, seed.monumental.name);
  });

  test('buscar algo inexistente muestra "sin resultados"', async ({ home, page }) => {
    await home.goto();
    await home.search.fill('zzz estadio fantasma');
    await expect(page.getByText('Sin resultados para "zzz estadio fantasma"')).toBeVisible();
  });
});
