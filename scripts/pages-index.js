// Portada del sitio de reportes en GitHub Pages: estado de la última corrida de main y links a cada reporte.
// La arma el workflow (pasos de Pages) con las variables que le pasa; imprime el HTML por stdout.
const { API_OUTCOME = '', E2E_OUTCOME = '', RUN_URL = '#', SHA = '' } = process.env;

const label = { success: 'pasó', failure: 'falló', skipped: 'no corrió', cancelled: 'cancelado' };
const status = (outcome) => `<span class="status ${outcome || 'skipped'}">${label[outcome] || 'no corrió'}</span>`;
const when = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'long', timeStyle: 'short' });

console.log(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GiraCanchera QA</title>
<style>
  :root { --bg: #ffffff; --fg: #1f2328; --muted: #59636e; --line: #d1d9e0; --ok: #1a7f37; --bad: #d1242f; --off: #59636e; --link: #0969da; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0d1117; --fg: #e6edf3; --muted: #9198a1; --line: #3d444d; --ok: #3fb950; --bad: #f85149; --off: #9198a1; --link: #4493f8; } }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 680px; margin: 0 auto; padding: 48px 16px; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  p { color: var(--muted); margin: 0 0 32px; }
  a { color: var(--link); }
  .card { display: block; border: 1px solid var(--line); border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; text-decoration: none; color: inherit; }
  .card:hover { border-color: var(--link); }
  .card strong { display: flex; justify-content: space-between; gap: 12px; font-size: 17px; }
  .card span.desc { color: var(--muted); font-size: 14px; }
  .status { font-size: 13px; font-weight: 600; }
  .success { color: var(--ok); } .failure { color: var(--bad); } .skipped, .cancelled { color: var(--off); }
  footer { margin-top: 32px; font-size: 14px; color: var(--muted); }
</style>
</head>
<body>
<main>
  <h1>GiraCanchera QA</h1>
  <p>Reportes de la última corrida del pipeline en <code>main</code> · ${when}</p>

  <a class="card" href="e2e/index.html">
    <strong>Tests E2E · Playwright ${status(E2E_OUTCOME)}</strong>
    <span class="desc">Mapa, búsqueda, login, reseñas y vista mobile en Chromium y Pixel 7</span>
  </a>
  <a class="card" href="api/index.html">
    <strong>Tests de API · Newman ${status(API_OUTCOME)}</strong>
    <span class="desc">54 requests: auth, estadios, reseñas, usuarios y permisos por rol</span>
  </a>
  <a class="card" href="api/login-csv.html">
    <strong>Login data-driven · Newman ${status(API_OUTCOME)}</strong>
    <span class="desc">7 casos desde un CSV, cada uno con su status esperado</span>
  </a>

  <footer>
    Commit <a href="https://github.com/wevillegas/giracanchera-qa/commit/${SHA}"><code>${SHA.slice(0, 7)}</code></a> ·
    <a href="${RUN_URL}">corrida en GitHub Actions</a> ·
    <a href="https://github.com/wevillegas/giracanchera-qa">repositorio</a>
  </footer>
</main>
</body>
</html>`);
