import fs from "node:fs";
import path from "node:path";
import { BASE, simulate, summarize } from "../assets/model.js";
const W=1200,H=675,BG="#06111f",PANEL="#0d1e31",PANEL2="#122941",TEXT="#edf5fb",MUTED="#9fb6c8",BLUE="#6cb6ff",TEAL="#4ec9b0",GREEN="#8bd450",SKY="#87CEFA",CORAL="#ff9f7a",LINE="#31516a";
const params={horizon:24,hazardScale:1,couplingScale:1,recoveryScale:1,controlScale:.30,serviceFloor:.65};
const rows=simulate(params),summary=summarize(rows,params),N=40;
const fw=Array.from({length:N/2},function(_,i){return i/(N/2-1);});
const fractions=fw.concat(fw.slice().reverse()).slice(0,N);
function esc(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function txt(x,y,s,size,fill,weight,anchor){return '<text x="'+x+'" y="'+y+'" fill="'+(fill||TEXT)+'" font-size="'+(size||18)+'" font-family="Inter,Arial,sans-serif" font-weight="'+(weight||400)+'" text-anchor="'+(anchor||"start")+'">'+esc(s)+'</text>';}
function pathFrom(pts,stroke,width,dash){return '<path d="M'+pts.map(function(q){return q[0].toFixed(2)+','+q[1].toFixed(2);}).join(' L')+'" fill="none" stroke="'+stroke+'" stroke-width="'+(width||3)+'" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';}
function frameCss(n,duration,staticIndex){
  const rules=['.motion-frame{opacity:0}.motion-frame{animation-duration:'+duration+'s;animation-timing-function:linear;animation-iteration-count:infinite}'],eps=.002;
  for(let i=0;i<n;i++){const a=100*i/n,b=100*(i+1)/n,name='mf'+i;let key;
    if(i===0) key='0%,'+(b-eps).toFixed(5)+'%{opacity:1}'+b.toFixed(5)+'%,100%{opacity:0}';
    else if(i===n-1) key='0%,'+(a-eps).toFixed(5)+'%{opacity:0}'+a.toFixed(5)+'%,99.998%{opacity:1}100%{opacity:0}';
    else key='0%,'+(a-eps).toFixed(5)+'%{opacity:0}'+a.toFixed(5)+'%,'+(b-eps).toFixed(5)+'%{opacity:1}'+b.toFixed(5)+'%,100%{opacity:0}';
    rules.push('.f'+i+'{animation-name:'+name+'}@keyframes '+name+'{'+key+'}');
  }
  rules.push('@media (prefers-reduced-motion:reduce){.motion-frame{animation:none!important;opacity:0!important}.f'+staticIndex+'{opacity:1!important}}');
  return '<style>'+rules.join('')+'</style>';
}
const sx=t=>75+(t/24)*650,sy=v=>510-v*330,px=v=>805+v*320,py=v=>510-v*330;
const trajectory=rows.map(d=>[sx(d.t),sy(d.service)]),phase=rows.map(d=>[px(d.x[0]),py(d.x[1])]);
const p=[];
p.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" data-figure-id="F14-V5" data-motion-variable="t_model" aria-labelledby="title desc">');
p.push('<title id="title">F14 V5 — infrastructure viability margin motion</title><desc id="desc">Generalized four-sector browser demonstrator animates computed service and Power-Water phase state through model time t_model. It is illustrative and not the current Power-Transportation research boundary or an empirical prediction.</desc>');
p.push(frameCss(N,10,8));
p.push('<rect width="'+W+'" height="'+H+'" fill="'+BG+'"/><rect x="28" y="28" width="1144" height="619" rx="24" fill="'+PANEL+'" stroke="'+LINE+'" stroke-width="2"/>');
p.push(txt(62,78,'F14 · VIABILITY MARGIN MOTION · V5',17,TEAL,700)+txt(62,112,'Computed generalized P–W–T–SW demonstrator',29,TEXT,800)+txt(62,142,'t_model = reduced-model time · illustrative parameters',15,SKY,700));
p.push(txt(820,82,'STATIC AUTHORITY',13,MUTED,700)+txt(820,105,'F14-infrastructure-viability-geometry-v4.svg',14,TEXT,600));
p.push('<rect x="62" y="185" width="690" height="365" rx="18" fill="'+PANEL2+'" stroke="'+LINE+'"/>'+txt(85,218,'COMPOSITE SERVICE',14,MUTED,700)+pathFrom(trajectory,TEXT,4));
const floorY=sy(params.serviceFloor);p.push('<line x1="75" y1="'+floorY+'" x2="725" y2="'+floorY+'" stroke="'+CORAL+'" stroke-width="2" stroke-dasharray="8 7"/>'+txt(710,floorY-8,'service floor 0.65',13,CORAL,700,'end'));
p.push('<rect x="782" y="185" width="356" height="365" rx="18" fill="'+PANEL2+'" stroke="'+LINE+'"/>'+txt(805,218,'POWER–WATER PHASE VIEW',14,MUTED,700));
const vx=px(BASE.viabilityThresholds[0]),vy=py(BASE.viabilityThresholds[1]);p.push('<rect x="'+vx+'" y="'+py(1)+'" width="'+(px(1)-vx)+'" height="'+(vy-py(1))+'" fill="'+TEAL+'" fill-opacity=".08" stroke="'+TEAL+'" stroke-dasharray="7 6"/>'+pathFrom(phase,BLUE,3));
for(let i=0;i<N;i++){const f=fractions[i],idx=Math.max(0,Math.min(rows.length-1,Math.round(f*(rows.length-1)))),row=rows[idx],margin=Math.min(...row.x.map(function(v,j){return v-BASE.viabilityThresholds[j];})),mc=margin>=0?GREEN:CORAL,mw=Math.min(240,Math.max(0,Math.abs(margin)*900));
  p.push('<g class="motion-frame f'+i+'"><circle cx="'+sx(row.t)+'" cy="'+sy(row.service)+'" r="7" fill="'+SKY+'" stroke="'+TEXT+'" stroke-width="2"/><circle cx="'+px(row.x[0])+'" cy="'+py(row.x[1])+'" r="8" fill="'+SKY+'" stroke="'+TEXT+'" stroke-width="2"/>');
  p.push(txt(84,590,'t_model = '+row.t.toFixed(2)+' h',17,SKY,700)+txt(310,590,'service = '+row.service.toFixed(3),17,TEXT,700)+txt(535,590,'margin = '+margin.toFixed(3),17,mc,700));
  p.push('<rect x="820" y="580" width="240" height="14" rx="7" fill="'+LINE+'" opacity=".45"/><rect x="820" y="580" width="'+mw.toFixed(2)+'" height="14" rx="7" fill="'+mc+'"/></g>');
}
p.push(txt(62,625,'Baseline nadir='+summary.nadir.toFixed(3)+' · viable fraction='+(100*summary.viableFraction).toFixed(1)+'%',13,MUTED)+txt(620,625,'Boundary: generalized demonstrator; not field-calibrated and not the current P↔T research boundary.',13,CORAL));
p.push('</svg>\n');
const output=process.argv[2]||'assets/math-art/v5/F14-viability-margin-motion-v5.svg';fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,p.join(''),'utf8');console.log('V5 F14 '+output+' rows='+rows.length+' frames='+N);
