// Historical filename retained because package.json invokes this entrypoint.
// This verifies the active dark-canvas publication contract, not white styling.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const css = fs.readFileSync('assets/portfolio-v2.css','utf8');
const html = fs.readFileSync('index.html','utf8');
const dyn = fs.readFileSync('assets/dynamics-v1.css','utf8');
for (const marker of ['--bg: #05070B;', '--surface: #0D1117;', '--surface-2: #111827;', '--ink: #F5F7FA;', '--muted: #AAB7C4;', '--accent-primary: rgb(135, 206, 250);', '--accent-primary-strong: rgb(0, 191, 255);']) assert.ok(css.includes(marker), 'Missing dark design token: '+marker);
assert.match(html, /<meta name="color-scheme" content="dark"/);
for (const marker of ['id="about"','id="evidence"','id="skills"','class="mobile-nav"','<summary aria-label="Open navigation menu">','8,592','0.2165°C','National University of Singapore','ASU SURI','WorldQuant University','Lycée Technique de Natitingou']) assert.ok(html.includes(marker),'Missing evidence or mobile feature: '+marker);
assert.ok(!html.includes('DOSSİYA'), 'Navigation name contains Turkish dotted capital I');
assert.doesNotMatch(html, /<a[^>]*>[^<]*<\\n/,'Homepage navigation contains a literal escaped newline');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'),'Reduced-motion contract missing');
assert.ok(dyn.includes('mix-blend-mode:screen'),'Dynamic hero must be legible on dark background');
for(const name of ['hero','method']) {
 const svg=fs.readFileSync('assets/portfolio-v2-'+name+'.svg','utf8');
 for(const marker of ['--bg:#0D1117','--soft:#111827','--accent-text:#BFE8FF','<title','<desc']) assert.ok(svg.includes(marker),'SVG '+name+' missing dark or accessibility marker: '+marker);
 assert.ok(!svg.includes('--bg:#FFFFFF'),'White SVG canvas still active');
}
function luminance(h){const c=h.match(/[0-9A-Fa-f]{2}/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [name,fg,bg] of [['main text','F5F7FA','05070B'],['secondary text','AAB7C4','0D1117'],['sky blue text','BFE8FF','0D1117'],['research power text','FF7B72','111827'],['research transportation text','56D364','111827']])assert.ok(contrast(fg,bg)>=4.5,name+' fails WCAG AA');
console.log('PASS: dark homepage, evidence, mobile navigation, reduced motion and contrast tests');
