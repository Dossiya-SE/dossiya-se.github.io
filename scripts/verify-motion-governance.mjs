import fs from "node:fs";
import {
  WEBSITE_MOTION_SEMANTICS,
  PT_DEFAULTS,
  simulatePT
} from "../assets/research-dynamics.js";

const manifestPath = "docs/visual-system/WEBSITE_MOTION_MANIFEST_V1.json";
const statusPath = "docs/visual-system/MATHEMATICAL_ART_V5_MIGRATION_STATUS.md";
const cssPath = "assets/dynamics-v1.css";
const jsPath = "assets/research-dynamics.js";
const indexPath = "index.html";

for (const path of [manifestPath,statusPath,cssPath,jsPath,indexPath]) {
  if (!fs.existsSync(path)) throw new Error("Missing governed motion artifact: " + path);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const css = fs.readFileSync(cssPath,"utf8");
const js = fs.readFileSync(jsPath,"utf8");
const index = fs.readFileSync(indexPath,"utf8");

if (manifest.contract_id !== "WEBSITE-MOTION-GOVERNANCE-V1") throw new Error("motion contract id mismatch");
if (!manifest.inherits.includes("DOSS-MOTION-V1") || !manifest.inherits.includes("MATH-ART-V5")) {
  throw new Error("motion contract inheritance incomplete");
}

const expected = {
  hero_math_field:["tau_ui","presentation"],
  derivation_console:["tau_ui","structural_reveal"],
  pt_mechanism_model:["t_model","reduced_model"],
  pt_mechanism_reveal:["tau_ui","trajectory_reveal"],
  math_card_art:["tau_ui","presentation"]
};
for (const [id,[variable,klass]] of Object.entries(expected)) {
  const item = manifest.interactions[id];
  if (!item) throw new Error("missing motion interaction " + id);
  if (item.variable !== variable || item.class !== klass) throw new Error(id + " motion semantics mismatch");
  if (!item.static_authority) throw new Error(id + " missing static authority");
}

for (const [id,item] of Object.entries(manifest.interactions)) {
  if (item.variable === "tau_ui" && item.scientific_claim !== false) {
    throw new Error(id + " presentation motion must not create a scientific claim");
  }
  if (item.variable === "tau_ui" && item.reduced_motion !== true) {
    throw new Error(id + " presentation motion must support reduced motion");
  }
}

const model = manifest.interactions.pt_mechanism_model;
if (model.calibrated !== false || model.scientific_claim !== "illustrative_reduced_model_only") {
  throw new Error("PT reduced-model epistemic boundary mismatch");
}

if (!css.includes("@media (prefers-reduced-motion:reduce)")) throw new Error("CSS reduced-motion gate missing");
if (!js.includes("matchMedia('(prefers-reduced-motion: reduce)').matches")) throw new Error("runtime reduced-motion gate missing");
if (!js.includes("tau_ui controls only how much of the already-computed t_model trajectory is revealed")) {
  throw new Error("trajectory reveal/model-time distinction missing in runtime");
}
if (!js.includes("tau_ui is presentation time only")) throw new Error("hero presentation-time boundary missing");

for (const [name,item] of Object.entries(WEBSITE_MOTION_SEMANTICS)) {
  if (!item.variable || !item.staticAuthority) throw new Error("runtime motion semantics incomplete: " + name);
  if (item.variable === "tau_ui" && (item.physicalTime !== false || item.modelTime !== false)) {
    throw new Error("runtime presentation motion conflates time semantics: " + name);
  }
}
if (WEBSITE_MOTION_SEMANTICS.ptMechanism.variable !== "t_model" ||
    WEBSITE_MOTION_SEMANTICS.ptMechanism.modelTime !== true ||
    WEBSITE_MOTION_SEMANTICS.ptMechanism.calibrated !== false) {
  throw new Error("runtime PT model semantics mismatch");
}

const rows = simulatePT(PT_DEFAULTS);
if (!rows.length || rows.some((r) => !Number.isFinite(r.time))) throw new Error("PT model-time rows invalid");
for (let i=1;i<rows.length;i++) {
  if (!(rows[i].time > rows[i-1].time)) throw new Error("PT model time must be strictly increasing");
}

for (const token of [
  'data-hero-field',
  'data-derivation-console',
  'id="ptMechanismCanvas"',
  'id="pt-mechanism-title"',
  'id="mathematics"'
]) {
  if (!index.includes(token)) throw new Error("index missing governed motion/static token: " + token);
}
if (!index.includes("Parameters are not calibrated to a city, utility, transport operator or event.")) {
  throw new Error("PT model epistemic boundary missing from page");
}

for (const rel of ["assets/portfolio-v2-hero.svg","assets/portfolio-v2-method.svg"]) {
  if (!fs.existsSync(rel)) throw new Error("static visual authority missing: " + rel);
}

console.log("Website motion governance verification passed: tau_ui presentation motion is separated from t_model reduced-model time, static authority and reduced-motion invariants are present.");
