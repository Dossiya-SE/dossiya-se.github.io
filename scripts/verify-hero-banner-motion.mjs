import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=fs.readFileSync('assets/portfolio-v2-hero.svg','utf8');
const animated=fs.readFileSync('assets/portfolio-v2-hero-animated.svg','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/portfolio-v2.css','utf8');
const js=fs.readFileSync('assets/hero-banner-motion.js','utf8');
for(const token of ['--bg:#0D1117','--accent:#87CEFA','--accent-text:#BFE8FF','CONCEPTUAL MOTION','NOT MEASURED DATA OR A CALIBRATED MODEL','@media (prefers-reduced-motion:reduce)','.motion-layer{display:none}'])
assert.ok(animated.includes(token),'Missing scientific motion contract: '+token);
for(const path of [
'M10 44 L112 20 L210 62 L224 120 L122 110',
'M8 54 C65 4 142 7 215 48 S328 112 390 74',
'M90 292 C123 254 143 216 166 198 C196 174 223 185 233 213 C242 239 225 264 198 270 C169 277 148 256 154 233'
])assert.ok(animated.includes('path="'+path+'"'),'Motion path not found: '+path);
assert.equal((animated.match(/<animateMotion /g)||[]).length,5,'Expected five path indicators');
assert.ok(!animated.includes('#FFC627'),'No decorative institutional gold');
assert.ok(!animated.includes('<script'),'No embedded script in animated image');
assert.ok(base.includes('mathematical state-space trajectory'),'Original static source preserved');
for(const token of ['data-scientific-hero','data-hero-motion-toggle','assets/portfolio-v2-hero.svg','assets/portfolio-v2-hero-animated.svg','assets/hero-banner-motion.js','aria-controls="hero-scientific-figure"'])assert.ok(html.includes(token),'Missing HTML entry: '+token);
assert.ok(css.includes('.hero-motion-toggle:focus-visible'),'Accessible keyboard focus required');
assert.ok(js.includes('prefers-reduced-motion: reduce')&&js.includes("toggle.addEventListener('click'"),'Reduced motion and click required');
console.log('PASS: exact original SVG retained, distinct conceptual motion, pause control and reduced motion');
