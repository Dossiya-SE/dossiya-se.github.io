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
  'research.json',
  'ACCENT_CONTRACT_V1.md'
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
  '--accent-primary: rgb(135, 206, 250);',
  '--accent-primary-strong: rgb(0, 191, 255);',
  '--accent-primary-graphic: rgb(45, 143, 214);',
  '--accent-primary-text: rgb(40, 120, 205);',
  '--blue:', '.hero-grid', '.problem-grid', '.math-grid', '.work-grid',
  '--research-power: rgb(200, 16, 46);',
  '--research-transport: rgb(22, 130, 58);',
  '--research-information: rgb(29, 78, 216);',
  '--research-organization: rgb(192, 38, 211);',
  '--research-math: rgb(109, 40, 217);',
  '--research-accent: rgb(135, 206, 250);',
  '.research-key.power::before { background: var(--research-power); }',
  '.research-key.transport::before { background: var(--research-transport); }',
  '.research-key.information::before { background: var(--research-information); }',
  '.research-key.organization::before { background: var(--research-organization); }',
  '.research-key.geometry::before { background: var(--research-math); }',
  '.research-key.interface::before { background: var(--research-accent); }',
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
  '--research-power:rgb(255,123,130);',
  '--research-transport:rgb(86,211,100);',
  '--research-information:rgb(88,166,255);',
  '--research-organization:rgb(232,121,249);',
  '--research-math:rgb(163,113,247);',
  '--research-accent:rgb(135,206,250);',
  '--research-accent-strong:rgb(0,191,255);',
  '.research-key.interface::before { background:var(--research-accent); }',
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
  'assets/styles.css',
  'assets/profile-v1.css'
];
const forbiddenVisualTokens = [
  /--gold\b/i,
  /\b(?:gold|amber|ochre|yellow-gold|goldenrod|darkgoldenrod)\b/i,
  /#(?:9a6700|d5ad47|d2a63c|d29922|b45309|a16207|f4c95d|fbbf24|facc15|f59e0b|fde68a)\b/i
];
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
function rejectGoldAmberRgb(textValue, file) {
  for (const match of textValue.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi)) {
    const { h, s, l } = rgbHueSaturationLightness(Number(match[1]), Number(match[2]), Number(match[3]));
    if (h >= 32 && h <= 72 && s >= 0.45 && l >= 0.18 && l <= 0.9) {
      throw new Error(`No-gold visual invariant violated in ${file}: ${match[0]}`);
    }
  }
}

for (const file of noGoldVisualFiles) {
  const visual = fs.readFileSync(file, 'utf8');
  rejectGoldAmberRgb(visual, file);
  for (const pattern of forbiddenVisualTokens) {
    if (pattern.test(visual)) throw new Error(`No-gold visual invariant violated in ${file}: ${pattern}`);
  }
}

function relativeLuminance([r,g,b]) {
  const lin = (v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(a,b) {
  const la=relativeLuminance(a), lb=relativeLuminance(b);
  return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05);
}
if (contrastRatio([40,120,205],[255,255,255]) < 4.5) throw new Error('Light Sky Blue normal-text companion fails WCAG AA 4.5:1 on white.');
if (contrastRatio([45,143,214],[255,255,255]) < 3.0) throw new Error('Light Sky Blue graphic companion fails 3:1 meaningful-graphic contrast on white.');
if (contrastRatio([191,232,255],[13,17,23]) < 4.5) throw new Error('Light Sky Blue dark-text companion fails WCAG AA on dark background.');

for (const [svgPath,markers] of [
  ['assets/portfolio-v2-hero.svg',['--accent:#87CEFA','--accent-stroke:#2D8FD6','--accent-text:#2878CD','--accent-text:#BFE8FF']],
  ['assets/portfolio-v2-method.svg',['--accent:#87CEFA','--accent-stroke:#2D8FD6','--accent-text:#2878CD','--accent-text:#BFE8FF']]
]) {
  const textValue=fs.readFileSync(svgPath,'utf8');
  for (const marker of markers) if (!textValue.includes(marker)) throw new Error(`${svgPath} missing Light Sky Blue contract marker: ${marker}`);
}

const accentContract=fs.readFileSync('ACCENT_CONTRACT_V1.md','utf8');
for (const marker of ['LIGHT-SKY-BLUE-ACCENT-V1','RGB(135, 206, 250)','RGB(0, 191, 255)','#2D8FD6','#2878CD','#BFE8FF']) {
  if (!accentContract.includes(marker)) throw new Error(`Accent contract missing marker: ${marker}`);
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

console.log('PASS: homepage/lab semantics, LIGHT-SKY-BLUE-ACCENT-V1, no-gold invariant, contrast, mathematics and scientific-integrity boundaries verified.');
