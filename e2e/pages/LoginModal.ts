import { expect, type Locator, type Page } from '@playwright/test';

export class LoginModal {
  readonly heading: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Iniciar sesión' });
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Contraseña');
    this.submit = page.getByRole('button', { name: 'Ingresar' });
    this.error = page.getByText(/credenciales/i);
  }

  async login(email: string, password: string) {
    await expect(this.heading).toBeVisible();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  welcome(name: string) {
    return this.page.getByRole('heading', { name: `¡Hola, ${name}!` });
  }

  async continue() {
    await this.page.getByRole('button', { name: 'Continuar' }).click();
  }
}
