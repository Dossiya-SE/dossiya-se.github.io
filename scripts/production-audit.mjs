const BASE_URL = new URL(process.env.BASE_URL || 'https://dossiya-se.github.io/');
const REQUIRE_METADATA = process.env.REQUIRE_METADATA === '1';
const MAX_ATTEMPTS = Number(process.env.AUDIT_ATTEMPTS || 4);
const RETRY_MS = Number(process.env.AUDIT_RETRY_MS || 5000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(pathname, { required = true } = {}) {
  const url = new URL(pathname, BASE_URL);
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': 'Dossiya-SE-production-audit/1.1' }
      });
      if (response.ok) return { response, text: await response.text(), url: response.url };
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_MS * attempt);
  }

  if (required) throw lastError ?? new Error(`Unable to fetch ${url}`);
  console.warn(`WARN: ${lastError?.message ?? `Unable to fetch ${url}`}`);
  return null;
}

function requireMarkers(text, markers, label) {
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`${label} missing marker: ${marker}`);
  }
}

function rejectMixedContent(text, label) {
  if (/\b(?:src|href)=["']http:\/\//i.test(text)) {
    throw new Error(`${label} contains an insecure http:// asset or link.`);
  }
}

const home = await fetchWithRetry('/');
requireMarkers(home.text, [
  '<title>Dossiya Dakou · Mathematical Physics for Sustainable Infrastructure</title>',
  'id="phaseCanvas"',
  'id="mathAtlas"',
  'id="trajectoryChart"',
  'id="phasePortrait"',
  'id="inverseChart"',
  'id="uqChart"',
  'assets/app.js'
], 'homepage');
rejectMixedContent(home.text, 'homepage');

const styles = await fetchWithRetry('/assets/styles.css');
requireMarkers(styles.text, ['--accent:', '.atlas-node', '@media (max-width: 650px)'], 'styles.css');

const model = await fetchWithRetry('/assets/model.js');
requireMarkers(model.text, ['function rk4Step', 'function simulate', 'function monteCarlo', 'function estimateHazardScale'], 'model.js');

const app = await fetchWithRetry('/assets/app.js');
requireMarkers(app.text, ["from './model.js'", 'renderMathAtlas', 'runInverseProblem', 'initWebGL'], 'app.js');

const rigor = await fetchWithRetry('/RESEARCH_RIGOR.md');
requireMarkers(rigor.text, ['Research rigor and mathematical status', 'not a field-calibrated failure probability'], 'RESEARCH_RIGOR.md');

if (REQUIRE_METADATA) {
  requireMarkers(home.text, [
    '<link rel="canonical" href="https://dossiya-se.github.io/"',
    'property="og:title"',
    'type="application/ld+json"',
    'mathjax@3.2.2',
    'd3@7.9.0',
    'research.json'
  ], 'production homepage metadata');

  for (const forbidden of [
    'github.com/Dossiya-SE/MSE-thesis',
    'github.com/Dossiya-SE/infrastructure-interface-resilience-review',
    'github.com/Dossiya-SE/responsible-gold-access-network-rgan'
  ]) {
    if (home.text.includes(forbidden)) throw new Error(`Public homepage exposes private repository URL: ${forbidden}`);
  }

  const research = await fetchWithRetry('/research.json');
  const data = JSON.parse(research.text);
  if (data.schemaVersion !== '1.0.0') throw new Error('Unexpected research.json schema version.');
  if (data.models?.[0]?.epistemicStatus !== 'demonstrator') throw new Error('Production model status must remain demonstrator.');
  if (data.models?.[0]?.calibrated !== false) throw new Error('Production demonstrator must not be marked calibrated.');

  const robots = await fetchWithRetry('/robots.txt');
  requireMarkers(robots.text, ['User-agent: *', 'Sitemap: https://dossiya-se.github.io/sitemap.xml'], 'robots.txt');

  const sitemap = await fetchWithRetry('/sitemap.xml');
  requireMarkers(sitemap.text, ['https://dossiya-se.github.io/'], 'sitemap.xml');
}

async function checkExternal(url, label) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Dossiya-SE-production-audit/1.1' } });
    if (!response.ok) console.warn(`WARN: ${label} returned HTTP ${response.status}`);
    else console.log(`External dependency reachable: ${label}`);
  } catch (error) {
    console.warn(`WARN: external dependency check failed for ${label}: ${error.message}`);
  }
}

await Promise.all([
  checkExternal('https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js', 'D3 7.9.0'),
  checkExternal('https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js', 'MathJax 3.2.2')
]);

console.log(`Production audit passed for ${BASE_URL.href}${REQUIRE_METADATA ? ' with hardened metadata enforcement' : ''}.`);
