import fs from 'node:fs';
import path from 'node:path';
import { BASE } from '../assets/model.js';

const required = [
  'index.html',
  'lab.html',
  'assets/portfolio-v2.css',
  'assets/portfolio-v2-hero.svg',
  'assets/portfolio-v2-method.svg',
  'assets/styles.css',
  'assets/math-v3.css',
  'assets/profile-v1.css',
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

const home = fs.readFileSync('index.html', 'utf8');
for (const marker of [
  '<title>Dossiya Dakou · Physics-Grounded Mathematical Engineering</title>',
  'assets/portfolio-v2.css',
  'assets/portfolio-v2-hero.svg',
  'assets/portfolio-v2-method.svg',
  'id="research"',
  'id="method"',
  'id="mathematics"',
  'id="work"',
  'id="profile"',
  'Interdependent Power–Transportation Systems',
  'Physical reality',
  'Causal mechanisms',
  'Engineering decision',
  'lab.html',
  'mathjax@3.2.2',
  'research.json'
]) {
  if (!home.includes(marker)) throw new Error(`Homepage missing V2 marker: ${marker}`);
}
if (/\bhttp:\/\//.test(home)) throw new Error('Insecure http:// URL found in index.html');

const lab = fs.readFileSync('lab.html', 'utf8');
for (const marker of ['id="phaseCanvas"','id="mathAtlas"','id="trajectoryChart"','id="phasePortrait"','id="inverseChart"','id="uqChart"','assets/app.js']) {
  if (!lab.includes(marker)) throw new Error(`Preserved lab missing legacy demonstrator marker: ${marker}`);
}

for (const svgPath of ['assets/portfolio-v2-hero.svg','assets/portfolio-v2-method.svg']) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  for (const marker of ['<svg','<title','<desc','viewBox=','prefers-color-scheme:dark']) {
    if (!svg.includes(marker)) throw new Error(`${svgPath} missing accessible/adaptive SVG marker: ${marker}`);
  }
}

const heroSvg = fs.readFileSync('assets/portfolio-v2-hero.svg','utf8');
for (const marker of ['PHYSICAL REALITY','POWER','TRANSPORTATION','causal interfaces','MATHEMATICAL STRUCTURE','ENGINEERING DECISION']) {
  if (!heroSvg.includes(marker)) throw new Error(`Hero SVG missing semantic marker: ${marker}`);
}

const methodSvg = fs.readFileSync('assets/portfolio-v2-method.svg','utf8');
for (const marker of ['Physical reality','Causal mechanisms','Mathematical structure','Uncertainty + validation','Engineering decision']) {
  if (!methodSvg.includes(marker)) throw new Error(`Method SVG missing ordered research marker: ${marker}`);
}

const css = fs.readFileSync('assets/portfolio-v2.css','utf8');
for (const marker of ['--gold:', '--blue:', '.hero-grid', '.problem-grid', '.math-grid', '.work-grid', '@media (prefers-color-scheme: dark)', '@media (max-width: 680px)']) {
  if (!css.includes(marker)) throw new Error(`Portfolio V2 CSS missing token/layout marker: ${marker}`);
}

const model = fs.readFileSync('assets/model.js', 'utf8');
for (const symbol of ['rk4Step','simulate','durationAboveThreshold','monteCarlo','estimateHazardScale']) {
  if (!model.includes(`function ${symbol}`)) throw new Error(`Missing preserved mathematical function: ${symbol}`);
}
const weightSum = BASE.serviceWeights.reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1) > 1e-12) throw new Error(`Service weights do not sum to one: ${weightSum}`);
if (BASE.coupling.length !== 4 || BASE.coupling.some((row) => row.length !== 4)) throw new Error('Legacy lab coupling matrix must remain 4×4.');
BASE.coupling.forEach((row, i) => {
  if (Math.abs(row[i]) > 1e-15) throw new Error(`Coupling diagonal must be zero at index ${i}.`);
});

const rigor = fs.readFileSync('RESEARCH_RIGOR.md', 'utf8');
for (const marker of ['Epistemic status', 'not a field-calibrated failure probability', 'Public/private boundary']) {
  if (!rigor.toLowerCase().includes(marker.toLowerCase())) throw new Error(`Missing rigor marker: ${marker}`);
}

const research = JSON.parse(fs.readFileSync('research.json', 'utf8'));
if (research.schemaVersion !== '2.0.0') throw new Error('Unexpected research.json schemaVersion.');
if (research.person?.name !== 'Dossiya Dakou') throw new Error('research.json person identity missing.');
if (research.currentResearch?.title !== 'Interdependent Power–Transportation Systems') throw new Error('Current research title missing.');
if (!research.currentResearch?.physicalSystems?.includes('power') || !research.currentResearch?.physicalSystems?.includes('transportation')) {
  throw new Error('Current physical-system pair must remain power + transportation.');
}
if (research.legacyDemonstrator?.epistemicStatus !== 'demonstrator' || research.legacyDemonstrator?.calibrated !== false) {
  throw new Error('Preserved browser lab must remain explicitly uncalibrated demonstrator work.');
}
if (research.scientificIntegrity?.profileInvariant !== 'claim strength <= evidence strength') {
  throw new Error('Scientific-integrity invariant missing.');
}

const robots = fs.readFileSync('robots.txt', 'utf8');
if (!robots.includes('Sitemap: https://dossiya-se.github.io/sitemap.xml')) throw new Error('robots.txt sitemap declaration missing.');

console.log('PASS: professional homepage V2, preserved research lab, mathematical invariants, metadata, accessibility markers and scientific-integrity boundaries verified.');
