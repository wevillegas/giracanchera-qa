// Levanta la API (:5000) y/o el frontend (:5173) apuntando a la base de test. Uso: node scripts/start.js api web
import { spawn } from 'node:child_process';
import { BACK_DIR, FRONT_DIR, backendEnv, frontendEnv } from './env.js';

const targets = {
  api: { cmd: 'npm start', cwd: BACK_DIR, env: backendEnv },
  web: { cmd: 'npm run dev -- --port 5173 --strictPort', cwd: FRONT_DIR, env: frontendEnv },
};

const names = process.argv.slice(2);
if (!names.length || names.some((n) => !targets[n])) {
  console.error('Uso: node scripts/start.js api|web [api|web]');
  process.exit(1);
}

for (const name of names) {
  const { cmd, cwd, env } = targets[name];
  const child = spawn(cmd, { cwd, env, shell: true, stdio: 'inherit' });
  child.on('exit', (code) => {
    console.error(`[${name}] terminó con código ${code}`);
    process.exit(code ?? 1); // si uno se cae, se corta todo: mejor que tests contra media app
  });
}
