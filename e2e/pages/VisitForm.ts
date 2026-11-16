import { expect, type Page } from '@playwright/test';

// Flujo "Registrar visita": elegir el estadio en el selector y completar el formulario de la reseña
export class VisitForm {
  constructor(private readonly page: Page) {}

  async chooseStadium(query: string, name: string) {
    await expect(this.page.getByRole('heading', { name: 'Elegí un estadio' })).toBeVisible();
    await this.page.getByPlaceholder('Buscar estadio o club...').fill(query);
    // La tarjeta del estadio: su nombre y, al lado, su propio botón "Registrar visita"
    const card = this.page.getByRole('button', { name, exact: true }).locator('xpath=..');
    await card.getByRole('button', { name: 'Registrar visita' }).click();
  }

  async fill({ date, review }: { date: string; review: string }) {
    await this.page.getByLabel('Fecha de la visita').fill(date);
    await this.page.getByPlaceholder(/Contá cómo fue el ambiente/).fill(review);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Guardar visita' }).click();
    await expect(this.page.getByRole('heading', { name: '¡Visita guardada!' })).toBeVisible();
  }
}
