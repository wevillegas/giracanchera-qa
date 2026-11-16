// Corre la suite de API con Newman contra la API de test (ya levantada con `npm run start:api`).
// Uso: node scripts/test-api.js [local|ci]. Vuelve a sembrar la base antes, para partir siempre del mismo estado.
import { execSync } from 'node:child_process';
import { promisify } from 'node:util';
import newman from 'newman';
import './env.js';

const envName = process.argv[2] || 'local';
const dir = 'api-tests';
const baseUrl = 'http://localhost:5000/api';

try {
  await fetch(`${baseUrl}/health`);
} catch {
  console.error(`La API no responde en ${baseUrl}. Levantala con: npm run start:api`);
  process.exit(1);
}

execSync('node scripts/db.js seed', { stdio: 'inherit' });

// Las contraseñas no están en los archivos de entorno: entran desde .env / GitHub Secrets
const envVar = [
  { key: 'anaPassword', value: process.env.QA_USER_PASSWORD },
  { key: 'betoPassword', value: process.env.QA_USER2_PASSWORD },
  { key: 'adminPassword', value: process.env.QA_ADMIN_PASSWORD },
];

const run = promisify(newman.run);
const runs = [
  { folder: 'Suite', name: 'api' },
  { folder: 'Data-driven', name: 'api-login-csv', iterationData: `${dir}/data/logins.csv` },
];

let failed = false;
for (const { folder, name, iterationData } of runs) {
  const summary = await run({
    collection: `${dir}/giracanchera.postman_collection.json`,
    environment: `${dir}/environments/${envName}.postman_environment.json`,
    envVar,
    folder,
    iterationData,
    reporters: ['cli', 'htmlextra', 'junit'],
    reporter: {
      htmlextra: { export: `reports/${name}.html`, title: `GiraCanchera API — ${folder}`, browserTitle: 'GiraCanchera API', skipSensitiveData: true },
      junit: { export: `reports/${name}-junit.xml` },
    },
  });
  failed ||= summary.run.failures.length > 0 || Boolean(summary.error);
}

console.log(`Reportes: reports/api.html y reports/api-login-csv.html`);
process.exit(failed ? 1 : 0);
