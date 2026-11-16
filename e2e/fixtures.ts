import { test as base } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { StadiumPage } from './pages/StadiumPage';
import { VisitForm } from './pages/VisitForm';

// Datos fijos del seed (scripts/db.js)
export const seed = {
  ana: { email: 'qa.ana@giracanchera.test', nombre: 'Ana QA', password: () => process.env.QA_USER_PASSWORD! },
  beto: { email: 'qa.beto@giracanchera.test', nombre: 'Beto QA', password: () => process.env.QA_USER2_PASSWORD! },
  monumental: { id: '20000000-0000-4000-8000-000000000001', name: 'Estadio Monumental' },
  cilindro: { id: '20000000-0000-4000-8000-000000000003', name: 'Estadio Presidente Perón' },
};

export const ANA_STATE = 'e2e/.auth/ana.json';

// PNG transparente de 1x1 para los mosaicos del mapa
const EMPTY_TILE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

type Fixtures = { home: HomePage; stadiumPage: StadiumPage; visitForm: VisitForm; offlineExternals: void };

export const test = base.extend<Fixtures>({
  // Automático en todos los tests: nada sale a internet. Los mosaicos satelitales (ArcGIS) se responden con un PNG
  // vacío y el resto (fuentes, Sentry) se corta. Los tests no dependen de servicios externos ni de su velocidad.
  offlineExternals: [async ({ context }, use) => {
    await context.route(/^https?:\/\/(?!localhost[:/])/, (route) =>
      route.request().url().includes('arcgisonline.com')
        ? route.fulfill({ contentType: 'image/png', body: EMPTY_TILE })
        : route.abort());
    await use();
  }, { auto: true }],
  home: async ({ page }, use) => use(new HomePage(page)),
  stadiumPage: async ({ page }, use) => use(new StadiumPage(page)),
  visitForm: async ({ page }, use) => use(new VisitForm(page)),
});

export { expect } from '@playwright/test';
