// Scoped visual contract: audit only actively linked v2 portfolio surfaces.
// Mathematical content and scientific semantic strokes are out of scope.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const css=fs.readFileSync('assets/portfolio-v2.css','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.match(css,/--bg:\s*#FFFFFF;/);
assert.match(css,/--surface:\s*#FFFFFF;/);
assert.match(css,/--surface-2:\s*#FFFFFF;/);
assert.match(css,/--shadow:\s*none;/);
assert.doesNotMatch(css,/linear-gradient\(|radial-gradient\(|prefers-color-scheme:\s*dark/);
assert.match(html,/<meta name="color-scheme" content="light"/);
for(const name of ['hero','method']){
  const svg=fs.readFileSync(`assets/portfolio-v2-${name}.svg`,'utf8');
  assert.match(svg,/--bg:#FFFFFF/);
  assert.match(svg,/--soft:#FFFFFF/);
  assert.doesNotMatch(svg,/prefers-color-scheme:dark|radialGradient|linearGradient/);
  assert.match(svg,/<title\b/);
  assert.match(svg,/<desc\b/);
}
console.log('PASS: portfolio-v2 white scientific canvas, SVG and accessibility metadata');
