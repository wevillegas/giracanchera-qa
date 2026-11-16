import { execSync } from 'node:child_process';
import { assertTestApi } from '../scripts/env.js';

// Cada corrida parte del mismo estado: base de test recién sembrada (y la API tiene que ser la de test)
export default async function globalSetup() {
  execSync('node scripts/db.js seed', { stdio: 'inherit' });
  await assertTestApi();
}
