import fs from "node:fs";

const required = [
  "lab.html",
  "assets/visualization-stack.css",
  "assets/visualization-stack.js",
  "assets/research-state.js",
  "src/visualization/research-state.ts",
  "tests/visualization-state.test.mjs",
  "scripts/manim/viability_geometry_scene.py",
  "MATHEMATICAL_VISUALIZATION_STACK_V1.md"
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error("Missing visualization-stack artifact: " + file);
}

const lab = fs.readFileSync("lab.html", "utf8");
const js = fs.readFileSync("assets/visualization-stack.js", "utf8");
const css = fs.readFileSync("assets/visualization-stack.css", "utf8");
const ts = fs.readFileSync("src/visualization/research-state.ts", "utf8");
const manim = fs.readFileSync("scripts/manim/viability_geometry_scene.py", "utf8");

const labTokens = [
  'id="visualization-stack"',
  'id="stackStateSpace"',
  'id="stackWebGL"',
  'id="loadGeoGebra"',
  'assets/visualization-stack.css',
  'assets/visualization-stack.js'
];
for (const token of labTokens) {
  if (!lab.includes(token)) throw new Error("lab.html missing token: " + token);
}

const runtimeTokens = [
  "three@0.183.2",
  "THREE.ShaderMaterial",
  "signedMargin",
  "window.GGBApplet",
  "registerObjectUpdateListener",
  "ResearchStateStore"
];
for (const token of runtimeTokens) {
  if (!js.includes(token)) throw new Error("visualization runtime missing token: " + token);
}

if (!ts.includes("interface ResearchVisualizationState")) throw new Error("TypeScript state contract missing");
if (!ts.includes("metricConstraintMargins")) throw new Error("TypeScript metric invariant missing");
if (!manim.includes("ViabilityGeometryScene")) throw new Error("Manim scene missing");

const combined = [js, css, ts, manim].join("\n").toLowerCase();
const forbiddenWarmTokens = ["#d4af37", "#ffd700", "rgb(212, 175, 55)", "rgb(255, 215, 0)"];
for (const token of forbiddenWarmTokens) {
  if (combined.includes(token)) throw new Error("Forbidden warm accent token in visualization stack: " + token);
}

if (!combined.includes("rgb(135, 206, 250)") && !combined.includes("135, 206, 250")) {
  throw new Error("Light Sky Blue RGB contract missing");
}
if (!combined.includes("rgb(0, 191, 255)") && !combined.includes("0, 191, 255")) {
  throw new Error("Deep Sky Blue RGB contract missing");
}

console.log("Visualization stack verification passed.");
