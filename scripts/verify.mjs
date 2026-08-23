import fs from 'node:fs';
import path from 'node:path';
import { BASE } from '../assets/model.js';

const required = [
  'index.html',
  'assets/styles.css',
  'assets/math-v3.css',
  'assets/profile-v1.css',
  'assets/profile-trajectory-v1.svg',
  'assets/profile-mathematics-universe-v4.svg',
  'assets/model.js',
  'assets/app.js',
  'PORTFOLIO_VISUAL_SYSTEM_V2.md',
  'RESEARCH_RIGOR.md',
  'robots.txt',
  'sitemap.xml',
  '404.html',
  'research.json'
];

for (const file of required) {
  if (!fs.existsSync(path.resolve(file))) throw new Error(`Missing required file: ${file}`);
}

const html = fs.readFileSync('index.html', 'utf8');
for (const id of ['mathAtlas','trajectoryChart','phasePortrait','inverseChart','uqChart','phaseCanvas']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing visualization mount: ${id}`);
}

for (const marker of [
  '<link rel="canonical" href="https://dossiya-se.github.io/"',
  'property="og:title"',
  'type="application/ld+json"',
  'mathjax@3.2.2',
  'd3@7.9.0',
  'research.json',
  'assets/profile-v1.css',
  'assets/profile-trajectory-v1.svg',
  'assets/profile-mathematics-universe-v4.svg',
  'Engineering · mathematics · sustainable resilience',
  'MSE Sustainable Engineering',
  'MS Financial Engineering',
  'BSc Physical Science in Renewable Energy and Energy System',
  'This is a research programme, not an already validated universal theory.'
]) {
  if (!html.includes(marker)) throw new Error(`Missing production metadata/profile marker: ${marker}`);
}

if (/https?:\/\/cdn\.jsdelivr\.net\/npm\/mathjax@3\//.test(html)) {
  throw new Error('MathJax dependency must use an exact version, not rolling @3.');
}
if (/\bhttp:\/\//.test(html)) throw new Error('Insecure http:// URL found in index.html');

for (const svgPath of ['assets/profile-trajectory-v1.svg','assets/profile-mathematics-universe-v4.svg']) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  for (const marker of ['<svg','<title','<desc','viewBox=']) {
    if (!svg.includes(marker)) throw new Error(`${svgPath} missing accessible SVG marker: ${marker}`);
  }
}

const trajectory = fs.readFileSync('assets/profile-trajectory-v1.svg', 'utf8');
for (const marker of [
  '2016 → 2026',
  'Electrical engineering',
  'Energy systems',
  'Sustainable engineering',
  'Financial engineering',
  'Deeper mathematics',
  'claim strength ≤ evidence strength',
  'not an established universal theory'
]) {
  if (!trajectory.includes(marker)) throw new Error(`Profile trajectory missing governed marker: ${marker}`);
}

const model = fs.readFileSync('assets/model.js', 'utf8');
for (const symbol of ['rk4Step','simulate','durationAboveThreshold','monteCarlo','estimateHazardScale']) {
  if (!model.includes(`function ${symbol}`)) throw new Error(`Missing mathematical function: ${symbol}`);
}

const weightSum = BASE.serviceWeights.reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1) > 1e-12) throw new Error(`Service weights do not sum to one: ${weightSum}`);
if (BASE.coupling.length !== 4 || BASE.coupling.some((row) => row.length !== 4)) throw new Error('Coupling matrix must be 4×4.');
BASE.coupling.forEach((row, i) => {
  if (Math.abs(row[i]) > 1e-15) throw new Error(`Coupling diagonal must be zero at index ${i}.`);
});

const app = fs.readFileSync('assets/app.js', 'utf8');
for (const marker of [
  ".attr('tabindex',0)",
  'COMPILE_STATUS',
  'LINK_STATUS',
  'showD3Fallback',
  'atlasNodeById',
  'atlasNeighbours',
  'atlasLinkPath',
  'initScrollSpy',
  "setAtlasSelection('pde')"
]) {
  if (!app.includes(marker)) throw new Error(`Missing runtime/visual-system marker: ${marker}`);
}
if (app.includes('d3.forceSimulation')) {
  throw new Error('Mathematics atlas must remain deterministic; d3.forceSimulation is prohibited by Visual System V2.');
}

const profileCss = fs.readFileSync('assets/profile-v1.css','utf8');
for (const marker of [
  '--surface-elevated:',
  '--radius-lg:',
  '.atlas-node rect',
  '.atlas-link.is-related',
  '.atlas-formula',
  '.stack-table-wrap'
]) {
  if (!profileCss.includes(marker)) throw new Error(`Profile V2 CSS missing governed visual token: ${marker}`);
}

const visualContract = fs.readFileSync('PORTFOLIO_VISUAL_SYSTEM_V2.md','utf8');
for (const marker of [
  'Deterministic geometry replaces decorative randomness',
  'Visual refinement cannot strengthen claims',
  'BSc Physical Science in Renewable Energy and Energy System'
]) {
  if (!visualContract.includes(marker)) throw new Error(`Visual System V2 contract missing marker: ${marker}`);
}

const rigor = fs.readFileSync('RESEARCH_RIGOR.md', 'utf8');
for (const marker of ['Epistemic status', 'time measure', 'not a field-calibrated failure probability', 'Public/private boundary']) {
  if (!rigor.toLowerCase().includes(marker.toLowerCase())) throw new Error(`Missing rigor marker: ${marker}`);
}

const research = JSON.parse(fs.readFileSync('research.json', 'utf8'));
if (research.schemaVersion !== '1.0.0') throw new Error('Unexpected research.json schemaVersion.');
if (research.person?.name !== 'Dossiya Dakou') throw new Error('research.json person identity missing.');
if (research.person?.trajectoryStartYear !== 2016) throw new Error('research.json trajectory start year must remain 2016.');
if (research.models?.[0]?.epistemicStatus !== 'demonstrator') throw new Error('Model epistemic status must remain demonstrator.');
if (research.models?.[0]?.calibrated !== false) throw new Error('Browser demonstrator must remain explicitly uncalibrated.');
if (!research.educationPublicSafe?.some((item) => item.title === 'MSE Sustainable Engineering' && item.status === 'ongoing')) {
  throw new Error('Sustainable Engineering ongoing status missing from research.json.');
}
if (!research.educationPublicSafe?.some((item) => item.title === 'MS Financial Engineering' && item.status === 'ongoing')) {
  throw new Error('Financial Engineering ongoing status missing from research.json.');
}
if (!research.educationPublicSafe?.some((item) => item.title === 'BSc Physical Science in Renewable Energy and Energy System' && item.status === 'completed')) {
  throw new Error('Current public undergraduate title/status missing from research.json.');
}
if (!research.scientificIntegrity?.transferabilityBoundary?.includes('not an established universal theory')) {
  throw new Error('Cross-sector transferability research boundary missing from research.json.');
}

const robots = fs.readFileSync('robots.txt', 'utf8');
if (!robots.includes('Sitemap: https://dossiya-se.github.io/sitemap.xml')) throw new Error('robots.txt sitemap declaration missing.');

console.log('Static structure, profile governance, deterministic visual system, mathematical invariants, and rigor verification passed.');
