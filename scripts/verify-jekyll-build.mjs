import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('_site');

const required = [
  'index.html',
  'lab.html',
  'research/index.html',
  'thesis/index.html',
  'publications/index.html',
  'research/stages/01-structure/index.html',
  'research/stages/02-causality/index.html',
  'research/stages/03-dynamics/index.html',
  'research/stages/04-observation/index.html',
  'research/stages/05-viability/index.html',
  'research/stages/06-sustainability/index.html',
  'research/stages/07-transformation/index.html',
  'research/models/pt-hybrid-v2/index.html',
  'research/experiments/exp-004-viability-boundary/index.html',
  'research/figures/fig-viability-004/index.html',
  'assets/css/research-publication.css',
  'assets/data/dependencies.json'
];

for (const relative of required) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) throw new Error(`Missing generated Jekyll artifact: ${relative}`);
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const marker of [
  '<title>Dossiya Dakou · Physics-Grounded Mathematical Engineering</title>',
  'assets/portfolio-v2.css',
  'Interdependent Power–Transportation Systems',
  'lab.html'
]) {
  if (!home.includes(marker)) throw new Error(`Generated homepage missing preserved marker: ${marker}`);
}

const lab = fs.readFileSync(path.join(root, 'lab.html'), 'utf8');
for (const marker of [
  '<title>Dossiya Dakou · Computational Research Laboratory</title>',
  'Portfolio → Research → Laboratory',
  'id="viability-geometry"',
  'assets/app.js'
]) {
  if (!lab.includes(marker)) throw new Error(`Generated lab missing preserved marker: ${marker}`);
}

const research = fs.readFileSync(path.join(root, 'research/index.html'), 'utf8');
for (const marker of [
  'Seven-stage framework',
  'Python computes',
  'Jekyll organizes',
  'TypeScript visualizes',
  'Stage 1',
  'Stage 7'
]) {
  if (!research.includes(marker)) throw new Error(`Generated research architecture missing marker: ${marker}`);
}

const css = fs.readFileSync(path.join(root, 'assets/css/research-publication.css'), 'utf8');
for (const marker of [
  '--accent: rgb(135, 206, 250);',
  '--accent-strong: rgb(0, 191, 255);'
]) {
  if (!css.includes(marker)) throw new Error(`Research publication CSS missing governed accent: ${marker}`);
}
if (/\b(?:gold|amber|goldenrod|darkgoldenrod)\b/i.test(css)) {
  throw new Error('Research publication CSS violates the no-gold invariant.');
}

if (fs.existsSync(path.join(root, '.nojekyll'))) {
  throw new Error('Jekyll build artifact unexpectedly contains .nojekyll.');
}

const dependencies = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/dependencies.json'), 'utf8'));
if (dependencies.schema_version !== '0.1.0' || !Array.isArray(dependencies.dependencies)) {
  throw new Error('Runtime dependency registry schema boundary is invalid.');
}

console.log('PASS: Jekyll build preserves legacy routes, generates research collections, preserves RGB/no-gold invariants, and keeps runtime data boundaries explicit.');
