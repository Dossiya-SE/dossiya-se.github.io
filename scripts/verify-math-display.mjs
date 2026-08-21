import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const index = read('index.html');
const svg = read('assets/profile-mathematics-universe-v3.svg');
const css = read('assets/math-v3.css');

const requiredIndexFragments = [
  'id="formula-atlas"',
  '[S] source-grounded',
  '[M] model',
  '[H] hypothesis',
  'profile-mathematics-universe-v3.svg',
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
  'viewBox="0 0 1600 940"',
  'Differential Geometry',
  'Inference + Uncertainty',
  'Viability + Recovery',
];

for (const fragment of requiredSvgFragments) {
  if (!svg.includes(fragment)) fail(`profile mathematics SVG missing: ${fragment}`);
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

if (!process.exitCode) {
  console.log('PASS: mathematical presentation V3 site artifacts are structurally complete.');
}
