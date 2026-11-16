import { expect, type Locator, type Page } from '@playwright/test';

// Ficha completa de un estadio (/estadio/<id>), con pestañas Resumen / Reseñas / ...
export class StadiumPage {
  readonly reviewsTab: Locator;

  constructor(private readonly page: Page) {
    this.reviewsTab = page.getByRole('tab', { name: /Reseñas/ });
  }

  async goto(id: string) {
    await this.page.goto(`/estadio/${id}`);
  }

  async expectLoaded(id: string, name: string) {
    await expect(this.page).toHaveURL(new RegExp(`/estadio/${id}$`));
    await expect(this.page.getByRole('heading', { name, level: 1 })).toBeVisible();
  }

  async openReviews() {
    await this.reviewsTab.click();
    await expect(this.reviewsTab).toHaveAttribute('aria-selected', 'true');
  }

  review(text: string) {
    return this.page.getByText(text);
  }
}
