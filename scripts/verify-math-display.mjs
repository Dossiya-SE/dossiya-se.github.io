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
const app = read('assets/app.js');
const visualContract = read('PORTFOLIO_VISUAL_SYSTEM_V2.md');

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
  'BSc Physical Science in Renewable Energy and Energy System'
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
  '[S]',
  '[H]',
  'research transfer requires definition + test',
  '@media (prefers-color-scheme:dark)'
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
  'not an established universal theory'
];
for (const fragment of requiredTrajectoryFragments) {
  if (!trajectory.includes(fragment)) fail(`profile trajectory SVG missing: ${fragment}`);
}

const requiredCssFragments = [
  '.formula-grid',
  '.formula-card',
  '.formula-evidence-legend',
  '.geometry-transfer-note',
  '@media (max-width: 980px)'
];
for (const fragment of requiredCssFragments) {
  if (!css.includes(fragment)) fail(`math-v3.css missing: ${fragment}`);
}

for (const fragment of [
  '--brand-green-500:',
  '--surface-elevated:',
  '.trajectory-frame',
  '.research-program-grid',
  '.education-grid',
  '.atlas-node rect',
  '.atlas-link.is-related',
  '.atlas-formula'
]) {
  if (!profileCss.includes(fragment)) fail(`profile-v1.css missing: ${fragment}`);
}

for (const fragment of [
  'atlasNodeById',
  'atlasNeighbours',
  'atlasLinkPath',
  'setAtlasSelection',
  'initScrollSpy'
]) {
  if (!app.includes(fragment)) fail(`app.js missing deterministic-atlas fragment: ${fragment}`);
}
if (app.includes('d3.forceSimulation')) fail('app.js contains prohibited force-directed atlas layout.');

for (const fragment of [
  'Deterministic geometry replaces decorative randomness',
  'Mathematical art must carry semantics',
  'Visual refinement cannot strengthen claims'
]) {
  if (!visualContract.includes(fragment)) fail(`Visual System V2 contract missing: ${fragment}`);
}

if (!process.exitCode) {
  console.log('PASS: adaptive mathematical presentation, deterministic atlas, and Portfolio Visual System V2 are structurally complete.');
}
