import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const index = read('index.html');
const svg = read('assets/profile-mathematics-universe-v4.svg');
const trajectory = read('assets/profile-trajectory-v1.svg');
const css = read('assets/math-v3.css');
const profileCss = read('assets/profile-v1.css');

const requiredIndexFragments = [
  'id="formula-atlas"',
  'id="trajectory"',
  '[S] source-grounded',
  '[M] model',
  '[H] hypothesis',
  'profile-mathematics-universe-v4.svg',
  'profile-trajectory-v1.svg',
  'math-v3.css',
  'profile-v1.css',
  'source theorem',
  'formally defined research manifold',
  'g_{\\alpha\\beta}',
  '\\Gamma^\\alpha_{\\beta\\gamma}',
  '\\mathcal V_R',
];

for (const fragment of requiredIndexFragments) {
  if (!index.includes(fragment)) fail(`index.html missing mathematical-display fragment: ${fragment}`);
}

const requiredSvgFragments = [
  '<title id="title">',
  '<desc id="desc">',
  'viewBox="0 0 1600 900"',
  'MATHEMATICS AS A RESEARCH OPERATING SYSTEM',
  'Differential Geometry',
  'Inference + Uncertainty',
  'Viability + Recovery',
];
for (const fragment of requiredSvgFragments) {
  if (!svg.includes(fragment)) fail(`profile mathematics V4 SVG missing: ${fragment}`);
}

const requiredTrajectoryFragments = [
  '<title id="title">',
  '<desc id="desc">',
  'viewBox="0 0 1600 760"',
  '2016 → 2026',
  'Financial engineering',
  'Deeper mathematics',
  'not an established universal theory',
];
for (const fragment of requiredTrajectoryFragments) {
  if (!trajectory.includes(fragment)) fail(`profile trajectory SVG missing: ${fragment}`);
}

const requiredCssFragments = [
  '.formula-grid',
  '.formula-card',
  '.formula-evidence-legend',
  '.geometry-transfer-note',
  '@media (max-width: 980px)',
];
for (const fragment of requiredCssFragments) {
  if (!css.includes(fragment)) fail(`math-v3.css missing: ${fragment}`);
}

for (const fragment of ['--brand-green-500:', '.trajectory-frame', '.research-program-grid', '.education-grid']) {
  if (!profileCss.includes(fragment)) fail(`profile-v1.css missing: ${fragment}`);
}

if (!process.exitCode) {
  console.log('PASS: adaptive V4 mathematical presentation and profile-trajectory artifacts are structurally complete.');
}
