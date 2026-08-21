import fs from 'node:fs';
import path from 'node:path';

const required = [
  'index.html',
  'assets/styles.css',
  'assets/model.js',
  'assets/app.js',
  'RESEARCH_RIGOR.md'
];

for (const file of required) {
  if (!fs.existsSync(path.resolve(file))) throw new Error(`Missing required file: ${file}`);
}

const html = fs.readFileSync('index.html', 'utf8');
for (const id of ['mathAtlas','trajectoryChart','phasePortrait','inverseChart','uqChart','phaseCanvas']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing visualization mount: ${id}`);
}

const model = fs.readFileSync('assets/model.js', 'utf8');
for (const symbol of ['rk4Step','simulate','monteCarlo','estimateHazardScale']) {
  if (!model.includes(`function ${symbol}`)) throw new Error(`Missing mathematical function: ${symbol}`);
}

console.log('Static structure verification passed.');
