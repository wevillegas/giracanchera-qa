// Configuración compartida de los scripts de QA. Lee .env (si existe; en CI vienen del entorno) y valida.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (existsSync('.env')) process.loadEnvFile('.env');

const required = ['TEST_DATABASE_URL', 'JWT_SECRET', 'QA_ADMIN_PASSWORD', 'QA_USER_PASSWORD', 'QA_USER2_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Faltan variables: ${missing.join(', ')} (ver .env.example)`);
  process.exit(1);
}

// Barrera contra accidentes: solo una base local cuyo nombre termine en _test (nunca Neon ni la de desarrollo)
export const DB_URL = process.env.TEST_DATABASE_URL;
const { hostname, pathname } = new URL(DB_URL);
if (!['localhost', '127.0.0.1'].includes(hostname) || !pathname.endsWith('_test')) {
  console.error(`TEST_DATABASE_URL debe apuntar a localhost y a una base *_test (es ${hostname}${pathname})`);
  process.exit(1);
}

export const BACK_DIR = resolve(process.env.BACK_DIR || '../giracanchera-back');
export const FRONT_DIR = resolve(process.env.FRONT_DIR || '../giracanchera-front');

// Entorno de la API de test. Se pasa explícito: dotenv no pisa variables ya definidas, así que el .env del
// backend (con Cloudinary, Sentry o cadenas de Neon reales) no se cuela en los tests.
export const backendEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '5000', // el proxy de Vite del frontend apunta a :5000
  DATABASE_URL: DB_URL,
  DATABASE_URL_UNPOOLED: DB_URL, // prisma.config.js la prefiere para migrar: que tampoco salga del .env del back
  FRONTEND_URL: 'http://localhost:5173',
  // Un proxy delante, como en producción: los tests mandan X-Forwarded-For propio por corrida y así no comparten
  // el contador del rate limit de login entre corridas seguidas
  TRUST_PROXY: '1',
  SENTRY_DSN: '',
  CLOUDINARY_CLOUD_NAME: 'qa-dummy',
  CLOUDINARY_API_KEY: 'qa-dummy',
  CLOUDINARY_API_SECRET: 'qa-dummy',
};

export const frontendEnv = { ...process.env, VITE_API_URL: '/api', VITE_SENTRY_DSN: '' };
