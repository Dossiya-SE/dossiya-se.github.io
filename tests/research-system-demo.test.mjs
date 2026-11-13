// Contract test for the proposed single-file research system prototype.
// The functions are extracted from the HTML and exercised as source, not approved physics.
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html=fs.readFileSync('research-physical-system.html','utf8');
const match=html.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(match,'Inline scientific engine missing');
const pureModel=match[1].split('const $=sel')[0];
const engine=vm.runInNewContext(pureModel+'\n({ASSUMPTIONS,feederCurrentA,transformerHeatLossW,integrateScenario,summarizeScenario,shortestRepairRoute})',{});
const {ASSUMPTIONS,feederCurrentA,transformerHeatLossW,integrateScenario,summarizeScenario,shortestRepairRoute}=engine;
function near(a,b,tol=1e-6){assert.ok(Math.abs(a-b)<tol, a+' != '+b);}
test('3-phase current and energy units are consistent',()=>{
 near(feederCurrentA(360),530.2196349700645,1e-7);
 near(transformerHeatLossW(360),8390.587255310285,1e-5);
});
test('independent exponential solution matches RK4 for constant loading',()=>{
 const rows=integrateScenario({ambientC:42,managed:false});
 const equilibrium=42+transformerHeatLossW(360)/ASSUMPTIONS.heatTransferWK;
 for(const sample of rows.filter((r,i)=>i%240===0)){
   const analytical=equilibrium+(70-equilibrium)*Math.exp(-ASSUMPTIONS.heatTransferWK*3600/ASSUMPTIONS.thermalCapacitanceJK*sample.t);
   near(sample.temperatureC,analytical,1e-6);
 }
});
test('simple charging rule trades delivered energy for thermal margin, not an optimum',()=>{
 const full=summarizeScenario(integrateScenario({ambientC:42,managed:false}));
 const limited=summarizeScenario(integrateScenario({ambientC:42,managed:true}));
 assert.ok(full.maxTemperatureC>90);
 assert.ok(limited.maxTemperatureC<90);
 near(full.chargingEnergyKWh,1320,1e-5);
 near(limited.chargingEnergyKWh,844.8,1e-5);
});
test('repair-route closure changes travel but does not assert restoration',()=>{
 assert.equal(shortestRepairRoute().minutes,21);
 const blocked=shortestRepairRoute({closedEdgeId:'ns'});
 assert.equal(blocked.minutes,32);
 assert.equal(blocked.nodes.join('/'),'depot/south/site');
});
test('presentation distinguishes modelling from physical validation',()=>{
 for(const phrase of ['SYNTHETIC MODEL','not a viability kernel','Not a calibrated transformer','DC output not simulated','PCC / CONTEXT','Model time','θ ≤ 90°C']){
  assert.ok(html.includes(phrase), 'Missing evidence boundary: '+phrase);
 }
 for(const id of ['concept-mode','model-mode','road-blocked','temperature-chart','state-chart']){
  assert.ok(html.includes('id="'+id+'"'),'Missing control or SVG: '+id);
 }
});
