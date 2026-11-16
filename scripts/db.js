// Base de test: `reset` aplica las migraciones del backend y la deja vacía; `seed` la vacía y carga datos fijos.
// Los ids son fijos (UUID predecibles) para que los tests puedan referirse a ellos sin buscarlos.
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BACK_DIR, DB_URL, backendEnv } from './env.js';

const mode = process.argv[2];
if (!['reset', 'seed'].includes(mode)) {
  console.error('Uso: node scripts/db.js reset|seed');
  process.exit(1);
}

if (mode === 'reset') {
  execSync('npx prisma migrate deploy', { cwd: BACK_DIR, env: backendEnv, stdio: 'inherit' });
}

// El cliente de Prisma del backend: así el seed usa exactamente el mismo esquema que la app
process.env.DATABASE_URL = DB_URL;
const { default: prisma } = await import(pathToFileURL(join(BACK_DIR, 'src/config/prisma.js')).href);
const bcrypt = createRequire(join(BACK_DIR, 'package.json'))('bcryptjs');

const id = (group, n) => `${group}0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const CLUB = { river: id(1, 1), boca: id(1, 2), racing: id(1, 3) };
const STADIUM = { monumental: id(2, 1), bombonera: id(2, 2), cilindro: id(2, 3), kempes: id(2, 4) };
const USER = { admin: id(3, 1), ana: id(3, 2), beto: id(3, 3) };

async function truncateAll() {
  const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (!tables.length) return;
  await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
}

async function seed() {
  const hash = (password) => bcrypt.hash(password, 10);

  await prisma.club.createMany({
    data: [
      { id: CLUB.river, name: 'River Plate', location: 'Buenos Aires' },
      { id: CLUB.boca, name: 'Boca Juniors', location: 'Buenos Aires' },
      { id: CLUB.racing, name: 'Racing Club', location: 'Avellaneda' },
    ],
  });

  // Uno por uno: createMany no garantiza el orden de `seq`, y la app ordena por esa columna
  const stadiums = [
    { id: STADIUM.monumental, name: 'Estadio Monumental', nickname: 'El Monumental', capacity: 85018, city: 'Buenos Aires', country: 'Argentina', lat: -34.5453, lng: -58.4498, mainClubId: CLUB.river, openedYear: 1938 },
    { id: STADIUM.bombonera, name: 'Estadio Alberto J. Armando', nickname: 'La Bombonera', capacity: 54000, city: 'Buenos Aires', country: 'Argentina', lat: -34.6356, lng: -58.3647, mainClubId: CLUB.boca, openedYear: 1940 },
    { id: STADIUM.cilindro, name: 'Estadio Presidente Perón', nickname: 'El Cilindro', capacity: 51389, city: 'Avellaneda', province: 'Buenos Aires', country: 'Argentina', lat: -34.6676, lng: -58.3684, mainClubId: CLUB.racing, openedYear: 1950 },
    { id: STADIUM.kempes, name: 'Estadio Mario Alberto Kempes', capacity: 57000, city: 'Córdoba', province: 'Córdoba', country: 'Argentina', lat: -31.3689, lng: -64.2459, ownerType: 'province', openedYear: 1978 },
  ];
  for (const data of stadiums) await prisma.stadium.create({ data });

  const users = [
    { id: USER.admin, nombre: 'QA Admin', username: 'qa_admin', email: 'qa.admin@giracanchera.test', password: await hash(process.env.QA_ADMIN_PASSWORD), rol: 'admin' },
    { id: USER.ana, nombre: 'Ana QA', username: 'qa_ana', email: 'qa.ana@giracanchera.test', password: await hash(process.env.QA_USER_PASSWORD), clubHinchaId: CLUB.river },
    { id: USER.beto, nombre: 'Beto QA', username: 'qa_beto', email: 'qa.beto@giracanchera.test', password: await hash(process.env.QA_USER2_PASSWORD), clubHinchaId: CLUB.boca },
  ];
  for (const data of users) await prisma.user.create({ data });

  const visits = [
    { id: id(4, 1), userId: USER.ana, stadiumId: STADIUM.monumental, visitDate: new Date('2026-03-15T20:00:00Z'), rating: 9, reviewText: 'Ambiente increíble, se ve bien desde cualquier tribuna.' },
    { id: id(4, 2), userId: USER.beto, stadiumId: STADIUM.bombonera, visitDate: new Date('2026-04-02T21:30:00Z'), rating: 10, reviewText: 'La Bombonera late de verdad.' },
    { id: id(4, 3), userId: USER.ana, stadiumId: STADIUM.bombonera, visitDate: new Date('2026-05-10T19:00:00Z'), rating: 7, reviewText: 'Muy lindo, aunque la salida fue lenta.' },
  ];
  for (const data of visits) await prisma.visit.create({ data });

  await prisma.follow.create({ data: { followerId: USER.ana, followedId: USER.beto } });
  await prisma.wishlist.create({ data: { userId: USER.beto, stadiumId: STADIUM.kempes } });

  console.log(`Seed listo: ${stadiums.length} estadios, ${users.length} usuarios (qa_admin, qa_ana, qa_beto), ${visits.length} reseñas`);
}

try {
  await truncateAll();
  if (mode === 'seed') await seed();
  else console.log('Base de test migrada y vacía');
} finally {
  await prisma.$disconnect();
}
