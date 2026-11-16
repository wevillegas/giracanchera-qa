import { test, expect, seed } from '../fixtures';

test.describe('Login', () => {
  test('exitoso: saluda y muestra el menú del usuario', async ({ home, page }) => {
    await home.goto();
    await home.openLogin();
    await home.loginModal.login(seed.beto.email, seed.beto.password());
    await expect(home.loginModal.welcome(seed.beto.nombre)).toBeVisible();
    await home.loginModal.continue();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toHaveCount(0);
  });

  test('con contraseña incorrecta muestra el error y no inicia sesión', async ({ home }) => {
    await home.goto();
    await home.openLogin();
    await home.loginModal.login(seed.beto.email, 'incorrecta123');
    await expect(home.loginModal.error).toBeVisible();
    await expect(home.loginModal.heading).toBeVisible(); // el modal sigue abierto
  });

  test('sin sesión, registrar una visita pide iniciar sesión', async ({ home }) => {
    await home.goto();
    await home.addVisitButton.click();
    await expect(home.loginModal.heading).toBeVisible();
  });
});
