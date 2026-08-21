import fs from 'node:fs';
import path from 'node:path';
import { BASE } from '../assets/model.js';

const required = [
  'index.html',
  'assets/styles.css',
  'assets/model.js',
  'assets/app.js',
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
  'research.json'
]) {
  if (!html.includes(marker)) throw new Error(`Missing production metadata/dependency marker: ${marker}`);
}

if (/https?:\/\/cdn\.jsdelivr\.net\/npm\/mathjax@3\//.test(html)) {
  throw new Error('MathJax dependency must use an exact version, not rolling @3.');
}
if (/\bhttp:\/\//.test(html)) throw new Error('Insecure http:// URL found in index.html');

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
for (const marker of [".attr('tabindex', 0)", 'COMPILE_STATUS', 'LINK_STATUS', 'showD3Fallback']) {
  if (!app.includes(marker)) throw new Error(`Missing runtime hardening marker: ${marker}`);
}

const rigor = fs.readFileSync('RESEARCH_RIGOR.md', 'utf8');
for (const marker of ['Epistemic status', 'time measure', 'not a field-calibrated failure probability', 'Public/private boundary']) {
  if (!rigor.toLowerCase().includes(marker.toLowerCase())) throw new Error(`Missing rigor marker: ${marker}`);
}

const research = JSON.parse(fs.readFileSync('research.json', 'utf8'));
if (research.schemaVersion !== '1.0.0') throw new Error('Unexpected research.json schemaVersion.');
if (research.person?.name !== 'Dossiya Dakou') throw new Error('research.json person identity missing.');
if (research.models?.[0]?.epistemicStatus !== 'demonstrator') throw new Error('Model epistemic status must remain demonstrator.');

const robots = fs.readFileSync('robots.txt', 'utf8');
if (!robots.includes('Sitemap: https://dossiya-se.github.io/sitemap.xml')) throw new Error('robots.txt sitemap declaration missing.');

console.log('Static structure, metadata, mathematical invariants, and rigor verification passed.');
