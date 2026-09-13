import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const home = read('index.html');
const lab = read('lab.html');
const hero = read('assets/portfolio-v2-hero.svg');
const method = read('assets/portfolio-v2-method.svg');
const css = read('assets/portfolio-v2.css');

for (const fragment of [
  'Physics-grounded mathematical engineering',
  'Interdependent Power–Transportation Systems',
  '\\mathcal R_{\\mathrm{phys}}',
  '\\mathcal C',
  '\\mathfrak I',
  'F_{\\mathcal G}',
  '\\mathcal V',
  '\\rho_g',
  'u^\\star',
  '(\\mathcal M,g)',
  '\\dot Y=F(Y,u,\\eta)',
  'u^\\star=\\arg\\min J(u)'
]) {
  if (!home.includes(fragment)) fail(`Homepage missing mathematical/research fragment: ${fragment}`);
}

for (const fragment of [
  '<title', '<desc', 'viewBox=',
  'PHYSICAL REALITY', 'causal interfaces', 'MATHEMATICAL STRUCTURE', 'ENGINEERING DECISION',
  '@media(prefers-color-scheme:dark)'
]) {
  if (!hero.includes(fragment)) fail(`Hero visual missing semantic/display marker: ${fragment}`);
}

for (const fragment of [
  '<title', '<desc', 'viewBox=',
  'Physical reality', 'Causal mechanisms', 'Mathematical structure', 'Uncertainty + validation', 'Engineering decision',
  'Order matters'
]) {
  if (!method.includes(fragment)) fail(`Method visual missing semantic/display marker: ${fragment}`);
}

for (const fragment of [
  'font-family: "Iowan Old Style"',
  '--gold:', '--blue:',
  '.math-card .symbol',
  '@media (prefers-color-scheme: dark)',
  '@media (max-width: 680px)'
]) {
  if (!css.includes(fragment)) fail(`Portfolio V2 CSS missing mathematical typography/responsive marker: ${fragment}`);
}

// Deep mathematical and interactive material remains available, but no longer defines the homepage.
for (const fragment of [
  'id="formula-atlas"',
  'profile-mathematics-universe-v4.svg',
  'g_{\\alpha\\beta}',
  '\\Gamma^\\alpha_{\\beta\\gamma}',
  '\\mathcal V_R',
  'id="trajectoryChart"',
  'id="inverseChart"',
  'id="uqChart"'
]) {
  if (!lab.includes(fragment)) fail(`Preserved lab missing deep mathematical display: ${fragment}`);
}

if (!process.exitCode) {
  console.log('PASS: homepage mathematical hierarchy is restrained and semantically grounded; deep mathematical displays remain preserved in lab.html.');
}
