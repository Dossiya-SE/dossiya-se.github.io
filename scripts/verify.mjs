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
for (const marker of [
  '<title>Dossiya Dakou · Computational Research Laboratory</title>',
  '<link rel="canonical" href="https://dossiya-se.github.io/lab.html" />',
  'Portfolio → Research → Laboratory',
  'Current research · primary physical boundary',
  'Generalized Power–Water–Transport–Solid-Waste resilience demonstrator',
  'id="phaseCanvas"','id="mathAtlas"','id="trajectoryChart"','id="phasePortrait"','id="inverseChart"','id="uqChart"','assets/app.js'
]) {
  if (!lab.includes(marker)) throw new Error(`Preserved lab missing legacy demonstrator marker: ${marker}`);
}
const labOrder = ['id="research"','id="mathematics"','id="laboratory"','id="inverse"','id="uncertainty"','id="evidence"','id="trajectory"'];
for (let i = 1; i < labOrder.length; i += 1) {
  if (lab.indexOf(labOrder[i - 1]) >= lab.indexOf(labOrder[i])) {
    throw new Error(`Lab research-first narrative order violated: ${labOrder[i - 1]} must precede ${labOrder[i]}`);
  }
}
if (!lab.includes('Secondary context')) throw new Error('Lab secondary trajectory/education context boundary missing.');

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
for (const marker of [
  '--accent-violet:', '--blue:', '.hero-grid', '.problem-grid', '.math-grid', '.work-grid',
  '--research-blue: rgb(37, 99, 235);',
  '--research-red: rgb(220, 38, 38);',
  '--research-cyan: rgb(8, 145, 178);',
  '--research-green: rgb(5, 150, 105);',
  '--research-violet: rgb(124, 58, 237);',
  '.research-scope-note',
  '.research-rgb-legend',
  '@media (prefers-color-scheme: dark)',
  '@media (max-width: 680px)'
]) {
  if (!css.includes(marker)) throw new Error(`Portfolio V2 CSS missing token/layout marker: ${marker}`);
}
for (const forbidden of [
  '#research .eyebrow { color: var(--gold)',
  '#research .focus-label { color: var(--gold)',
  '#research .coupling { color: var(--gold)'
]) {
  if (css.includes(forbidden)) throw new Error(`Homepage research scope regressed to legacy accent: ${forbidden}`);
}

const labCss = fs.readFileSync('assets/profile-v1.css','utf8');
const labResearchStart = labCss.indexOf('/* ---------- Research RGB system ---------- */');
const labResearchEnd = labCss.indexOf('/* ---------- Interactive mathematics atlas ---------- */', labResearchStart);
if (labResearchStart < 0 || labResearchEnd < 0) throw new Error('Lab Research RGB scope markers missing.');
const labResearchCss = labCss.slice(labResearchStart, labResearchEnd);
for (const marker of [
  '--research-blue:rgb(96,165,250);',
  '--research-red:rgb(248,113,113);',
  '--research-cyan:rgb(34,211,238);',
  '--research-green:rgb(74,222,128);',
  '--research-violet:rgb(167,139,250);',
  '.research-scope-map',
  '.research-rgb-legend'
]) {
  if (!labResearchCss.includes(marker)) throw new Error(`Lab Research RGB CSS missing marker: ${marker}`);
}
if (/var\(--warn\)|var\(--gold\)|#f4c95d|#d5ad47|#d2a63c|#9a6700/i.test(labResearchCss)) {
  throw new Error('Lab research scope contains a legacy gold/warn accent.');
}

const noGoldVisualFiles = [
  'assets/portfolio-v2.css',
  'assets/portfolio-v2-hero.svg',
  'assets/portfolio-v2-method.svg',
  'assets/math-v3.css',
  'assets/profile-mathematics-universe-v3.svg',
  'assets/profile-mathematics-universe-v4.svg',
  'assets/readme/model-geometry.svg',
  'assets/styles.css'
];
const forbiddenVisualTokens = [
  /--gold\b/i,
  /\b(?:goldenrod|darkgoldenrod)\b/i,
  /#(?:9a6700|d5ad47|d2a63c|d29922|b45309|a16207|f4c95d|fbbf24|facc15|f59e0b|fde68a)\b/i
];
for (const file of noGoldVisualFiles) {
  const visual = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenVisualTokens) {
    if (pattern.test(visual)) throw new Error(`No-gold visual invariant violated in ${file}: ${pattern}`);
  }
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
