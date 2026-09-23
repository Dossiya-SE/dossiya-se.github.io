import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const registryPath = path.join(root, 'mathematical-art/figure_registry.json');
const tokensPath = path.join(root, 'mathematical-art/design_tokens.json');
const failures = [];
const passes = [];

function fail(id, message) { failures.push({ id, message }); }
function pass(id, message) { passes.push({ id, message }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function parseJson(rel) {
  try { return JSON.parse(read(rel)); }
  catch (error) { fail('JSON', `${rel}: ${error.message}`); return null; }
}
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function parseViewBox(svg) {
  const m = svg.match(/viewBox=["']\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*["']/i);
  return m ? m.slice(1).map(Number) : null;
}
function parseBoxes(svg) {
  return [...svg.matchAll(/data-layout-box=["']([^"']+)["']/g)].map((m, index) => {
    const parts = m[1].split(',').map(Number);
    return { index, x: parts[0], y: parts[1], w: parts[2], h: parts[3], raw: m[1] };
  });
}
function intersects(a, b, gap = 0) {
  return !(a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y);
}

if (!exists('mathematical-art/figure_registry.json')) fail('REGISTRY', 'figure registry is missing');
if (!exists('mathematical-art/design_tokens.json')) fail('TOKENS', 'design tokens are missing');

const registry = parseJson('mathematical-art/figure_registry.json');
const tokens = parseJson('mathematical-art/design_tokens.json');

if (registry && tokens) {
  const expectedIds = Array.from({ length: 14 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`);
  const ids = registry.figures?.map((f) => f.id) ?? [];
  if (ids.length !== 14) fail('REGISTRY_COUNT', `expected 14 figures, found ${ids.length}`);
  else pass('REGISTRY_COUNT', '14 governed figures registered');
  const unique = new Set(ids);
  if (unique.size !== ids.length) fail('REGISTRY_UNIQUE', 'duplicate figure IDs detected');
  else pass('REGISTRY_UNIQUE', 'figure IDs are unique');
  for (const id of expectedIds) if (!unique.has(id)) fail('REGISTRY_SEQUENCE', `missing ${id}`);

  const allowedStatuses = new Set(['SPECIFIED', 'DRAFT', 'CANDIDATE', 'RELEASED']);
  for (const fig of registry.figures ?? []) {
    if (!allowedStatuses.has(fig.status)) fail(`${fig.id}_STATUS`, `invalid status ${fig.status}`);
    if (!Array.isArray(fig.canvas) || fig.canvas.length !== 2 || fig.canvas.some((x) => !(Number.isFinite(x) && x > 0))) {
      fail(`${fig.id}_CANVAS`, 'invalid canonical canvas');
    }
    if (fig.status === 'SPECIFIED') continue;
    if (!fig.master || !fig.manifest) {
      fail(`${fig.id}_FILES`, 'candidate/released figure requires master and manifest');
      continue;
    }
    if (!exists(fig.master)) { fail(`${fig.id}_MASTER`, `missing ${fig.master}`); continue; }
    if (!exists(fig.manifest)) { fail(`${fig.id}_MANIFEST`, `missing ${fig.manifest}`); continue; }
    const svg = read(fig.master);
    const manifest = parseJson(fig.manifest);
    if (!manifest) continue;

    if (!/^\s*<svg\b/i.test(svg)) fail(`${fig.id}_SVG`, 'master is not an SVG document');
    if (!svg.includes(`data-figure-id="${fig.id}"`) && !svg.includes(`data-figure-id='${fig.id}'`)) fail(`${fig.id}_ID`, 'SVG lacks matching data-figure-id');
    if (!/<title(?:\s|>)/i.test(svg)) fail(`${fig.id}_TITLE`, 'SVG requires a <title>');
    if (!/<desc(?:\s|>)/i.test(svg)) fail(`${fig.id}_DESC`, 'SVG requires a <desc>');
    if (!/role=["']img["']/i.test(svg)) fail(`${fig.id}_A11Y`, 'SVG requires role="img"');
    if (/data:image\//i.test(svg) || /<image\b/i.test(svg)) fail(`${fig.id}_RASTER`, 'vector master may not embed raster images');
    if (/\b(TODO|TBD|PLACEHOLDER)\b/i.test(svg)) fail(`${fig.id}_PLACEHOLDER`, 'unresolved placeholder text');

    const vb = parseViewBox(svg);
    if (!vb) fail(`${fig.id}_VIEWBOX`, 'SVG has no parseable viewBox');
    else {
      const [, , w, h] = vb;
      if (w !== fig.canvas[0] || h !== fig.canvas[1]) fail(`${fig.id}_VIEWBOX`, `viewBox ${w}x${h} != registry ${fig.canvas[0]}x${fig.canvas[1]}`);
      else pass(`${fig.id}_VIEWBOX`, `${w}x${h}`);
      const boxes = parseBoxes(svg);
      if (boxes.length < 2) fail(`${fig.id}_LAYOUT_METADATA`, 'at least two data-layout-box regions required');
      for (const b of boxes) {
        if ([b.x,b.y,b.w,b.h].some((x) => !Number.isFinite(x)) || b.w <= 0 || b.h <= 0) fail(`${fig.id}_BOX_${b.index}`, `invalid bbox ${b.raw}`);
        if (b.x < 0 || b.y < 0 || b.x + b.w > w || b.y + b.h > h) fail(`${fig.id}_BOX_${b.index}`, `bbox outside viewBox: ${b.raw}`);
      }
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        if (intersects(boxes[i], boxes[j], 0)) fail(`${fig.id}_OVERLAP`, `layout boxes ${i} and ${j} overlap`);
      }
      if (!failures.some((f) => f.id.startsWith(`${fig.id}_BOX`) || f.id === `${fig.id}_OVERLAP`)) pass(`${fig.id}_LAYOUT`, `${boxes.length} bounded regions, zero overlaps`);
    }

    const requiredManifestKeys = ['figure_id','title','version','scientific_role','evidence_state','canvas','layout','verification','exports','provenance'];
    for (const key of requiredManifestKeys) if (!(key in manifest)) fail(`${fig.id}_MANIFEST_KEY`, `manifest missing ${key}`);
    if (manifest.figure_id !== fig.id) fail(`${fig.id}_MANIFEST_ID`, `manifest figure_id=${manifest.figure_id}`);
    if (manifest.canvas?.width !== fig.canvas[0] || manifest.canvas?.height !== fig.canvas[1]) fail(`${fig.id}_MANIFEST_CANVAS`, 'manifest canvas mismatch');
    if (manifest.exports?.svg !== fig.master) fail(`${fig.id}_EXPORT_PATH`, 'manifest SVG path differs from registry master');
    const gates = manifest.verification?.release_gates;
    const requiredGates = ['MATHEMATICS_PASS','NUMERICS_PASS','GEOMETRY_PASS','LAYOUT_PASS','TYPOGRAPHY_PASS','ACCESSIBILITY_PASS','RENDER_PASS','EXPORT_PASS','REGRESSION_PASS','INTEGRATION_PASS','PROVENANCE_PASS'];
    if (!gates) fail(`${fig.id}_GATES`, 'release_gates missing');
    else {
      for (const gate of requiredGates) if (typeof gates[gate] !== 'boolean') fail(`${fig.id}_GATE_${gate}`, 'gate must be boolean');
      if (fig.status === 'RELEASED' && requiredGates.some((gate) => gates[gate] !== true)) fail(`${fig.id}_RELEASE`, 'RELEASED figure has failing/unset gate');
    }
    const digest = sha256(svg);
    if (manifest.provenance?.sha256 && manifest.provenance.sha256 !== digest) fail(`${fig.id}_HASH`, 'manifest sha256 does not match SVG');
  }

  const evidence = tokens.evidenceOrder ?? [];
  if (JSON.stringify(evidence) !== JSON.stringify(['S','D','M','C','V','E','H','T'])) fail('TOKENS_EVIDENCE', 'evidence ordering changed or incomplete');
  else pass('TOKENS_EVIDENCE', 'S/D/M/C/V/E/H/T frozen');
  if (tokens.rules?.vectorMasterRequiredForDiagrams !== true) fail('TOKENS_VECTOR', 'vector-master rule must be true');
  else pass('TOKENS_VECTOR', 'vector-master rule active');
}

console.log(`Math-art V4 audit: ${passes.length} pass checks, ${failures.length} failures`);
for (const p of passes) console.log(`PASS ${p.id}: ${p.message}`);
for (const f of failures) console.error(`FAIL ${f.id}: ${f.message}`);
if (failures.length) process.exit(1);
