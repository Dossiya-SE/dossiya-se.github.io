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
      const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Dossiya-SE-production-audit/2.0' } });
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
  if (/\b(?:src|href)=["']http:\/\//i.test(text)) throw new Error(`${label} contains insecure http:// content.`);
}

const home = await fetchWithRetry('/');
requireMarkers(home.text, [
  '<title>Dossiya Dakou · Physics-Grounded Mathematical Engineering</title>',
  'assets/portfolio-v2.css',
  'assets/portfolio-v2-hero.svg',
  'assets/portfolio-v2-method.svg',
  'Interdependent Power–Transportation Systems',
  'id="research"',
  'id="method"',
  'id="mathematics"',
  'id="work"',
  'id="profile"',
  'lab.html'
], 'homepage');
rejectMixedContent(home.text, 'homepage');

const styles = await fetchWithRetry('/assets/portfolio-v2.css');
requireMarkers(styles.text, ['--gold:', '--blue:', '.hero-grid', '.work-grid', '@media (prefers-color-scheme: dark)'], 'portfolio-v2.css');

const hero = await fetchWithRetry('/assets/portfolio-v2-hero.svg');
requireMarkers(hero.text, ['PHYSICAL REALITY', 'POWER', 'TRANSPORTATION', 'causal interfaces', 'MATHEMATICAL STRUCTURE', 'ENGINEERING DECISION'], 'hero SVG');

const method = await fetchWithRetry('/assets/portfolio-v2-method.svg');
requireMarkers(method.text, ['Physical reality', 'Causal mechanisms', 'Mathematical structure', 'Uncertainty + validation', 'Engineering decision'], 'method SVG');

const lab = await fetchWithRetry('/lab.html');
requireMarkers(lab.text, ['id="phaseCanvas"','id="mathAtlas"','id="trajectoryChart"','id="phasePortrait"','id="inverseChart"','id="uqChart"','assets/app.js'], 'research lab');
rejectMixedContent(lab.text, 'research lab');

const model = await fetchWithRetry('/assets/model.js');
requireMarkers(model.text, ['function rk4Step', 'function simulate', 'function monteCarlo', 'function estimateHazardScale'], 'model.js');

const rigor = await fetchWithRetry('/RESEARCH_RIGOR.md');
requireMarkers(rigor.text, ['Research rigor and mathematical status', 'not a field-calibrated failure probability'], 'RESEARCH_RIGOR.md');

if (REQUIRE_METADATA) {
  requireMarkers(home.text, [
    '<link rel="canonical" href="https://dossiya-se.github.io/"',
    'property="og:title"',
    'type="application/ld+json"',
    'mathjax@3.2.2',
    'research.json'
  ], 'homepage metadata');

  for (const forbidden of [
    'github.com/Dossiya-SE/MSE-thesis',
    'github.com/Dossiya-SE/infrastructure-interface-resilience-review',
    'github.com/Dossiya-SE/responsible-gold-access-network-rgan'
  ]) {
    if (home.text.includes(forbidden)) throw new Error(`Public homepage exposes private repository URL: ${forbidden}`);
  }

  const research = await fetchWithRetry('/research.json');
  const data = JSON.parse(research.text);
  if (data.schemaVersion !== '2.0.0') throw new Error('Unexpected research.json schema version.');
  if (data.currentResearch?.title !== 'Interdependent Power–Transportation Systems') throw new Error('Current research identity mismatch.');
  if (!data.currentResearch?.physicalSystems?.includes('power') || !data.currentResearch?.physicalSystems?.includes('transportation')) {
    throw new Error('Power + transportation focus missing from production metadata.');
  }
  if (data.legacyDemonstrator?.epistemicStatus !== 'demonstrator' || data.legacyDemonstrator?.calibrated !== false) {
    throw new Error('Legacy research lab must remain explicitly uncalibrated demonstrator work.');
  }
  if (data.scientificIntegrity?.profileInvariant !== 'claim strength <= evidence strength') {
    throw new Error('Scientific-integrity invariant missing from production metadata.');
  }

  const robots = await fetchWithRetry('/robots.txt');
  requireMarkers(robots.text, ['User-agent: *', 'Sitemap: https://dossiya-se.github.io/sitemap.xml'], 'robots.txt');

  const sitemap = await fetchWithRetry('/sitemap.xml');
  requireMarkers(sitemap.text, ['https://dossiya-se.github.io/', 'https://dossiya-se.github.io/lab.html'], 'sitemap.xml');
}

async function checkExternal(url, label) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Dossiya-SE-production-audit/2.0' } });
    if (!response.ok) console.warn(`WARN: ${label} returned HTTP ${response.status}`);
    else console.log(`External dependency reachable: ${label}`);
  } catch (error) {
    console.warn(`WARN: external dependency check failed for ${label}: ${error.message}`);
  }
}

await Promise.all([
  checkExternal('https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js', 'MathJax 3.2.2'),
  checkExternal('https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js', 'D3 7.9.0 for preserved lab')
]);

console.log(`Production audit passed for ${BASE_URL.href}${REQUIRE_METADATA ? ' with hardened metadata enforcement' : ''}.`);
