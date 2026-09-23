import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTRACT = path.join(ROOT, 'ACCENT_CONTRACT_V1.md');
const PRIMARY_CSS = path.join(ROOT, 'assets', 'portfolio-v2.css');

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.mjs', '.json', '.svg', '.md', '.py', '.yml', '.yaml']);
const ROOT_SURFACES = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'lab.html'),
  path.join(ROOT, 'research.json'),
  path.join(ROOT, 'assets'),
  path.join(ROOT, 'mathematical-art'),
  path.join(ROOT, 'scripts', 'generate-dg-figures.py'),
  path.join(ROOT, 'scripts', 'generate-f14.mjs')
];

const FORBIDDEN_EXACT = new Set([
  '#ffd700', '#ffc107', '#ffb300', '#e0a800', '#d4af37', '#c99700',
  '#f4c430', '#daa520', '#b8860b', '#ffc94a', '#f59e0b', '#eab308',
  '#9a6700', '#d5ad47', '#d2a63c', '#d29922', '#b45309', '#a16207',
  '#f4c95d', '#fbbf24', '#facc15', '#fde68a'
]);

const HEX_RE = /(?<![0-9A-Za-z])#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})(?![0-9A-Fa-f])/g;
const RGB_RE = /rgba?\(\s*(\d{1,3})\s*(?:,|\s)\s*(\d{1,3})\s*(?:,|\s)\s*(\d{1,3})/gi;
const SEMANTIC_RE = /--(?:gold|amber|ochre|yellow-gold|warm-accent|warning-gold|accent-gold)\b|\b(?:accent[_-]?gold|warning[_-]?gold|warm[_-]?accent)\b|(?:fill|stroke)\s*=\s*["'](?:gold|goldenrod|darkgoldenrod|amber|ochre)["']/i;

function require(condition, message) {
  if (!condition) throw new Error(message);
}

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
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

function warmFamily(r, g, b) {
  const value = hsl(r, g, b);
  return value.h >= 32 && value.h <= 72 && value.s >= 0.45 && value.l >= 0.18 && value.l <= 0.90;
}

function expandHex(value) {
  let v = value.toLowerCase();
  if (v.length === 3) v = [...v].map((ch) => ch + ch).join('');
  return '#' + v;
}

function walk(target, out = []) {
  if (!fs.existsSync(target)) return out;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (TEXT_EXTENSIONS.has(path.extname(target).toLowerCase())) out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) walk(child, out);
    else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(child);
  }
  return out;
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const issues = [];

  const semantic = text.match(SEMANTIC_RE);
  if (semantic) issues.push('legacy semantic token ' + JSON.stringify(semantic[0]));

  for (const match of text.matchAll(HEX_RE)) {
    const literal = expandHex(match[1]);
    if (FORBIDDEN_EXACT.has(literal)) {
      issues.push('forbidden literal ' + literal);
      continue;
    }
    const r = parseInt(literal.slice(1, 3), 16);
    const g = parseInt(literal.slice(3, 5), 16);
    const b = parseInt(literal.slice(5, 7), 16);
    if (warmFamily(r, g, b)) issues.push('warm hue literal ' + literal + ' -> RGB(' + r + ',' + g + ',' + b + ')');
  }

  for (const match of text.matchAll(RGB_RE)) {
    const r = Number(match[1]), g = Number(match[2]), b = Number(match[3]);
    if ([r, g, b].some((v) => v > 255)) continue;
    if (warmFamily(r, g, b)) issues.push('warm RGB literal RGB(' + r + ',' + g + ',' + b + ')');
  }

  return [...new Set(issues)].sort();
}

const contract = fs.readFileSync(CONTRACT, 'utf8');
for (const marker of [
  'LIGHT-SKY-BLUE-ACCENT-V1',
  'RGB(135, 206, 250)',
  'RGB(0, 191, 255)',
  '#2D8FD6',
  '#2878CD',
  '#BFE8FF'
]) require(contract.includes(marker), 'Accent contract missing marker: ' + marker);

const css = fs.readFileSync(PRIMARY_CSS, 'utf8');
for (const marker of [
  '--accent-primary: rgb(135, 206, 250);',
  '--accent-primary-strong: rgb(0, 191, 255);',
  '--accent-primary-graphic: rgb(45, 143, 214);',
  '--accent-primary-text: rgb(40, 120, 205);',
  '--accent-primary-soft: rgb(135 206 250 / 0.18);',
  '--accent-primary-glow: rgb(0 191 255 / 0.28);',
  '--accent-primary-border: rgb(135 206 250 / 0.55);'
]) require(css.includes(marker), 'Primary CSS missing accent marker: ' + marker);

const files = [...new Set(ROOT_SURFACES.flatMap((surface) => walk(surface)))].sort();
const failures = [];
for (const file of files) {
  for (const issue of scanFile(file)) {
    failures.push(path.relative(ROOT, file) + ': ' + issue);
  }
}

if (failures.length) {
  throw new Error(
    'LIGHT-SKY-BLUE-ACCENT-V1 violations:\n  - ' + failures.join('\n  - ')
  );
}

console.log(
  'ACCENT CONTRACT VALIDATION: PASS — ' + files.length +
  ' governed website/runtime surfaces scanned; Light Sky Blue / Deep Sky Blue is canonical and no gold-family hue or semantic token is present.'
);
