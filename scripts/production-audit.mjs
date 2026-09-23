const BASE_URL = new URL(process.env.BASE_URL || 'https://dossiya-se.github.io/');
const REQUIRE_METADATA = process.env.REQUIRE_METADATA === '1';
const MAX_ATTEMPTS = Number(process.env.AUDIT_ATTEMPTS || 6);
const RETRY_MS = Number(process.env.AUDIT_RETRY_MS || 5000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(pathname, attempt = 1) {
  const url = new URL(pathname, BASE_URL);
  url.searchParams.set('__audit', `${Date.now()}-${attempt}`);
  const response = await fetch(url, {
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      'user-agent': 'Dossiya-SE-production-audit/2.1',
      'cache-control': 'no-cache, no-store, max-age=0',
      pragma: 'no-cache'
    }
  });
  return { response, text: await response.text(), url: response.url };
}

async function fetchWithRetry(pathname, { required = true } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await fetchText(pathname, attempt);
      if (result.response.ok) return result;
      lastError = new Error(`${result.url} returned HTTP ${result.response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_MS * attempt);
  }
  if (required) throw lastError ?? new Error(`Unable to fetch ${pathname}`);
  console.warn(`WARN: ${lastError?.message ?? `Unable to fetch ${pathname}`}`);
  return null;
}

async function fetchUntilMarkers(pathname, markers, label) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await fetchText(pathname, attempt);
      if (!result.response.ok) {
        lastError = new Error(`${result.url} returned HTTP ${result.response.status}`);
      } else {
        const missing = markers.filter((marker) => !result.text.includes(marker));
        if (missing.length === 0) return result;
        lastError = new Error(`${label} deployment not propagated yet; missing marker: ${missing[0]}`);
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(`Waiting for ${label} deployment propagation (attempt ${attempt}/${MAX_ATTEMPTS})...`);
      await sleep(RETRY_MS * attempt);
    }
  }
  throw lastError ?? new Error(`Unable to verify deployed ${label}`);
}

function requireMarkers(text, markers, label) {
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`${label} missing marker: ${marker}`);
  }
}

function rejectMixedContent(text, label) {
  if (/\b(?:src|href)=["']http:\/\//i.test(text)) throw new Error(`${label} contains insecure http:// content.`);
}

const homeMarkers = [
  '<title>Dossiya Dakou · Physics-Grounded Mathematical Engineering</title>',
  'assets/portfolio-v2.css',
  'assets/portfolio-v2-hero.svg',
  'assets/portfolio-v2-method.svg',
  'Interdependent Power–Transportation Systems',
  'Current system boundary',
  'Power ↔ Transportation',
  'id="research"',
  'id="method"',
  'id="mathematics"',
  'id="work"',
  'id="profile"',
  'lab.html'
];
const home = await fetchUntilMarkers('/', homeMarkers, 'homepage');
rejectMixedContent(home.text, 'homepage');

const styles = await fetchUntilMarkers('/assets/portfolio-v2.css', [
  '--accent-sky:', '--blue:', '.hero-grid', '.work-grid',
  '--research-blue: rgb(37, 99, 235);',
  '--research-red: rgb(220, 38, 38);',
  '.research-scope-note',
  '.research-rgb-legend',
  '@media (prefers-color-scheme: dark)'
], 'portfolio-v2.css');

function rgbHueSaturationLightness(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}
function rejectGoldAmberRgb(textValue, label) {
  for (const match of textValue.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi)) {
    const { h, s, l } = rgbHueSaturationLightness(Number(match[1]), Number(match[2]), Number(match[3]));
    if (h >= 32 && h <= 72 && s >= 0.45 && l >= 0.18 && l <= 0.9) {
      throw new Error(`Deployed no-gold visual invariant violated in ${label}: ${match[0]}`);
    }
  }
}

for (const [label, textValue] of [
  ['portfolio-v2.css', styles.text]
]) {
  rejectGoldAmberRgb(textValue, label);
  for (const pattern of [
    /--gold\b/i,
    /#(?:9a6700|d5ad47|d2a63c|d29922|b45309|a16207|f4c95d|fbbf24|facc15|f59e0b|fde68a)\b/i
  ]) {
    if (pattern.test(textValue)) throw new Error(`Deployed no-gold visual invariant violated in ${label}: ${pattern}`);
  }
}

const hero = await fetchUntilMarkers('/assets/portfolio-v2-hero.svg', ['PHYSICAL REALITY', 'POWER', 'TRANSPORTATION', 'causal interfaces', 'MATHEMATICAL STRUCTURE', 'ENGINEERING DECISION'], 'hero SVG');

const method = await fetchUntilMarkers('/assets/portfolio-v2-method.svg', ['Physical reality', 'Causal mechanisms', 'Mathematical structure', 'Uncertainty + validation', 'Engineering decision'], 'method SVG');

const lab = await fetchUntilMarkers('/lab.html', [
  '<title>Dossiya Dakou · Computational Research Laboratory</title>',
  '<link rel="canonical" href="https://dossiya-se.github.io/lab.html" />',
  'Portfolio → Research → Laboratory',
  'Current research · primary physical boundary',
  'Generalized Power–Water–Transport–Solid-Waste resilience demonstrator',
  'id="phaseCanvas"','id="mathAtlas"','id="trajectoryChart"','id="phasePortrait"','id="inverseChart"','id="uqChart"','assets/app.js'
], 'research lab');
rejectMixedContent(lab.text, 'research lab');
const labOrder = ['id="research"','id="mathematics"','id="laboratory"','id="inverse"','id="uncertainty"','id="evidence"','id="trajectory"'];
for (let i = 1; i < labOrder.length; i += 1) {
  if (lab.text.indexOf(labOrder[i - 1]) >= lab.text.indexOf(labOrder[i])) {
    throw new Error(`Deployed Lab research-first narrative order violated: ${labOrder[i - 1]} must precede ${labOrder[i]}`);
  }
}
requireMarkers(lab.text, ['Secondary context'], 'research lab context boundary');

const labStyles = await fetchUntilMarkers('/assets/profile-v1.css', [
  '/* ---------- Research RGB system ---------- */',
  '--research-blue:rgb(96,165,250);',
  '--research-red:rgb(248,113,113);',
  '--research-cyan:rgb(34,211,238);',
  '--research-green:rgb(74,222,128);',
  '--research-violet:rgb(167,139,250);',
  '.research-scope-map',
  '.research-rgb-legend'
], 'lab research styles');

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

  const research = await fetchUntilMarkers('/research.json', ['"schemaVersion": "2.0.0"', '"title": "Interdependent Power–Transportation Systems"'], 'research metadata');
  const data = JSON.parse(research.text);
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

  const sitemap = await fetchUntilMarkers('/sitemap.xml', ['https://dossiya-se.github.io/', 'https://dossiya-se.github.io/lab.html'], 'sitemap');
}

async function checkExternal(url, label) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Dossiya-SE-production-audit/2.1' } });
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
