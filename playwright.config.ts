import { defineConfig, devices } from '@playwright/test';
import { randomInt } from 'node:crypto';
import './scripts/env.js'; // carga y valida .env (en CI, las variables vienen de GitHub Secrets)

const CI = Boolean(process.env.CI);

// Una IP propia por corrida ante el rate limit de login, igual que en Newman (la API de test confía en un proxy).
// Se define en el proceso principal y los workers la heredan.
process.env.QA_CLIENT_IP ||= `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`;

export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.ts',
  outputDir: 'test-results',
  forbidOnly: CI, // un test.only olvidado no puede pasar en CI
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: CI
    ? [['github'], ['list'], ['html', { open: 'never', outputFolder: 'reports/e2e' }], ['junit', { outputFile: 'reports/e2e-junit.xml' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'reports/e2e' }]],

  use: {
    baseURL: 'http://localhost:5173',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    // Sin animaciones del mapa (la app respeta prefers-reduced-motion): menos esperas y menos tests intermitentes
    contextOptions: { reducedMotion: 'reduce' },
    extraHTTPHeaders: { 'X-Forwarded-For': process.env.QA_CLIENT_IP },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'], testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, dependencies: ['setup'], testMatch: /mobile\.spec\.ts/ },
  ],

  // Levanta API y frontend contra la base de test si no están corriendo; si ya están (en CI la API la levanta el
  // workflow para Newman), los reusa. global-setup corta la corrida si la API de :5000 no usa la base de test.
  webServer: [
    { command: 'node scripts/start.js api', url: 'http://localhost:5000/api/health', reuseExistingServer: true, timeout: 60_000 },
    { command: 'node scripts/start.js web', url: 'http://localhost:5173', reuseExistingServer: true, timeout: 60_000 },
  ],
});
