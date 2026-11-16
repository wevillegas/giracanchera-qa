import { expect, type Locator, type Page } from '@playwright/test';
import { LoginModal } from './LoginModal';

// La home es el mapa: navbar con buscador, mapa y botón flotante para registrar una visita
export class HomePage {
  readonly map: Locator;
  readonly mapCanvas: Locator;
  readonly search: Locator;
  readonly loginButton: Locator;
  readonly addVisitButton: Locator;
  readonly loginModal: LoginModal;

  constructor(private readonly page: Page) {
    this.map = page.getByTestId('map');
    this.mapCanvas = this.map.locator('canvas'); // el lienzo WebGL de MapLibre: no tiene rol accesible
    this.search = page.getByPlaceholder('Buscar estadios...');
    this.loginButton = page.getByRole('button', { name: 'Iniciar sesión' }).first();
    this.addVisitButton = page.getByRole('button', { name: 'Registrar visita' }).last();
    this.loginModal = new LoginModal(page);
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.mapCanvas).toBeVisible();
  }

  async openLogin() {
    await this.loginButton.click();
    await expect(this.loginModal.heading).toBeVisible();
  }

  // Como un usuario: busca el estadio (el mapa viaja hasta él), toca su pin y abre la ficha completa
  async openStadiumFromSearch(query: string, name: string) {
    await this.search.fill(query);
    await this.page.getByRole('button', { name: new RegExp(name) }).click();
    // El pin muestra el nombre en una etiqueta que no recibe clicks: se toca el pin que la contiene
    await this.map.getByText(name, { exact: true }).locator('..').click();
    await expect(this.page.getByRole('heading', { name, level: 2 })).toBeVisible();
    await this.page.getByRole('button', { name: 'Ver ficha completa' }).click();
  }
}
