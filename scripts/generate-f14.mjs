import fs from 'node:fs';
import path from 'node:path';
import { BASE, SECTORS, simulate, summarize } from '../assets/model.js';

const BG='#06111f', PANEL='#0d1e31', PANEL2='#122941', TEXT='#edf5fb', MUTED='#9fb6c8';
const BLUE='#6cb6ff', TEAL='#4ec9b0', VIOLET='#c6a0f6', GOLD='#f4c95d', CORAL='#ff9f7a', GREEN='#8bd450', LINE='#31516a';
const esc=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=28,fill=TEXT,weight=400,anchor='start',family='Inter,Arial,sans-serif')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="${family}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const pathFrom=(pts,stroke,width=5)=>`<path d="M${pts.map(([x,y])=>`${x.toFixed(2)},${y.toFixed(2)}`).join(' L')}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const sx=(t)=>180+(t/24)*(1390-180);
const sy=(v)=>1110-v*(1110-470);
const px=(v)=>1600+v*(2180-1600);
const py=(v)=>1090-v*(1090-480);

const params={horizon:24,hazardScale:1,couplingScale:1,recoveryScale:1,controlScale:0.30,serviceFloor:0.65};
const rows=simulate(params);
const summary=summarize(rows,params);
const seriesColors=[BLUE,TEAL,VIOLET,GOLD];
const parts=[];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" role="img" data-figure-id="F14" viewBox="0 0 2400 1500" aria-labelledby="title desc">
<title id="title">Infrastructure Viability Geometry V4</title>
<desc id="desc">Computed browser-model trajectories for power, water, transport and solid waste, with composite service and a power-water phase portrait containing the model viability threshold region.</desc>
<defs><linearGradient id="bg14" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${BG}"/><stop offset="1" stop-color="#0a1b2c"/></linearGradient></defs><rect width="2400" height="1500" fill="url(#bg14)"/>`);
parts.push(`<g data-layout-box="120,80,2160,220">${text(120,140,'F14 · INFRASTRUCTURE VIABILITY GEOMETRY',28,TEAL,700)}${text(120,225,'Computed state trajectories before geometric interpretation.',64,TEXT,800)}${text(120,278,'Existing P–W–T–SW browser model · illustrative parameters · verification is not field validation.',27,MUTED)}</g>`);
parts.push(`<g data-layout-box="120,340,1350,850"><rect x="120" y="340" width="1350" height="850" rx="36" fill="${PANEL}" fill-opacity=".72" stroke="${LINE}" stroke-width="2"/>${text(180,420,'[M/C/V] STATE + SERVICE TRAJECTORIES',25,BLUE,700)}`);
for(let k=0;k<=6;k++){ const y=470+k*(640/6); parts.push(`<line x1="180" y1="${y}" x2="1390" y2="${y}" stroke="${LINE}" stroke-width="1" opacity=".45"/>`); }
for(let k=0;k<=6;k++){ const x=180+k*(1210/6); parts.push(`<line x1="${x}" y1="470" x2="${x}" y2="1110" stroke="${LINE}" stroke-width="1" opacity=".35"/>`); }
for(let i=0;i<4;i++){ const pts=rows.map(d=>[sx(d.t),sy(d.x[i])]); parts.push(pathFrom(pts,seriesColors[i],4)); }
parts.push(pathFrom(rows.map(d=>[sx(d.t),sy(d.service)]),TEXT,7));
const floorY=sy(params.serviceFloor); parts.push(`<line x1="180" y1="${floorY}" x2="1390" y2="${floorY}" stroke="${CORAL}" stroke-width="3" stroke-dasharray="10 10"/>${text(1380,floorY-14,'service floor = 0.65',23,CORAL,700,'end')}`);
parts.push(text(785,1160,'Time (h)',24,MUTED,400,'middle'));
const legend=SECTORS.map((s,i)=>`${text(215+i*260,455,s,22,seriesColors[i],700)}`).join(''); parts.push(legend+text(1250,455,'Composite',22,TEXT,700));
parts.push(`</g>`);
parts.push(`<g data-layout-box="1530,340,750,850"><rect x="1530" y="340" width="750" height="850" rx="36" fill="${PANEL2}" stroke="${LINE}" stroke-width="2"/>${text(1590,420,'POWER–WATER PHASE PORTRAIT',25,TEAL,700)}`);
const vx=px(BASE.viabilityThresholds[0]), vy=py(BASE.viabilityThresholds[1]);
parts.push(`<rect x="${vx}" y="480" width="${2180-vx}" height="${vy-480}" fill="${TEAL}" fill-opacity=".10" stroke="${TEAL}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="8 8"/>`);
parts.push(pathFrom(rows.map(d=>[px(d.x[0]),py(d.x[1])]),BLUE,7));
const first=rows[0],last=rows.at(-1); parts.push(`<circle cx="${px(first.x[0])}" cy="${py(first.x[1])}" r="11" fill="${GREEN}"/><circle cx="${px(last.x[0])}" cy="${py(last.x[1])}" r="11" fill="${GOLD}"/>`);
parts.push(text(1890,1145,'Power state →',23,MUTED,400,'middle')); parts.push(text(1590,510,'viability threshold region',22,TEAL,700));
parts.push(text(1590,1035,`Nadir service = ${summary.nadir.toFixed(3)}`,25,TEXT,700)); parts.push(text(1590,1080,`Mean service = ${summary.avgService.toFixed(3)}`,25,TEXT,700)); parts.push(text(1590,1125,`Viable fraction = ${(100*summary.viableFraction).toFixed(1)}%`,25,TEXT,700));
parts.push(`</g>`);
parts.push(`<g data-layout-box="120,1240,2160,170"><rect x="120" y="1240" width="2160" height="170" rx="32" fill="#091827" stroke="${LINE}"/>${text(180,1300,'BOUNDARY',24,CORAL,700)}${text(180,1350,'The trajectories and thresholds are computed from the repository model. Parameters are illustrative; this figure is not a calibrated digital twin or empirical prediction.',25,TEXT,600)}${text(180,1390,'Trace: assets/model.js → simulate() → summarize() → this SVG → CI structural/render/regression tests.',23,MUTED)}</g>`);
parts.push('</svg>\n');

const output=process.argv[2] ?? 'assets/math-art/F14-infrastructure-viability-geometry-v4.svg';
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,parts.join(''),'utf8');
console.log(`F14 ${output} rows=${rows.length} nadir=${summary.nadir.toFixed(6)} viableFraction=${summary.viableFraction.toFixed(6)}`);
