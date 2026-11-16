import { test as setup, expect, seed, ANA_STATE } from './fixtures';

// Un solo login por la UI para toda la corrida: la cookie de sesión queda en ANA_STATE y la reusan los tests
setup('sesión de Ana', async ({ home, page }) => {
  await home.goto();
  await home.openLogin();
  await home.loginModal.login(seed.ana.email, seed.ana.password());
  await expect(home.loginModal.welcome(seed.ana.nombre)).toBeVisible();
  await page.context().storageState({ path: ANA_STATE });
});
