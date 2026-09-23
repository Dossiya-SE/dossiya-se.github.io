import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root=process.cwd(),registryPath=path.join(root,"mathematical-art/v5/animation_registry_v1.json");
if(!fs.existsSync(registryPath)) throw new Error("V5 animation registry missing");
const registry=JSON.parse(fs.readFileSync(registryPath,"utf8"));
if(registry.architecture_id!=="MATH-ART-V5") throw new Error("V5 architecture id mismatch");
if(registry.palette_contract!=="LIGHT-SKY-BLUE-ACCENT-V1") throw new Error("V5 palette contract mismatch");
if(registry.accessibility?.reduced_motion!==true||registry.accessibility?.essential_information_only_in_motion!==false) throw new Error("V5 accessibility invariant mismatch");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"math-art-v5-"));
try{
  const pyOut=path.join(tmp,"py");fs.mkdirSync(pyOut,{recursive:true});
  execFileSync("python3",[path.join(root,"scripts/generate-math-art-v5-animations.py"),"--out-dir",pyOut],{stdio:"inherit"});
  const f14Out=path.join(tmp,"F14.svg");execFileSync(process.execPath,[path.join(root,"scripts/generate-f14-v5-animation.mjs"),f14Out],{stdio:"inherit"});
  const generated={"F08-V5":path.join(pyOut,"F08-frenet-frame-motion-v5.svg"),"F11-V5":path.join(pyOut,"F11-geodesic-trace-motion-v5.svg"),"F13-V5":path.join(pyOut,"F13-heat-flow-motion-v5.svg"),"F14-V5":f14Out};
  const forbidden=["#ffd700","#ffc107","#ffb300","#e0a800","#d4af37","#c99700","#f4c430","#daa520","#b8860b","#f4c95d","#fbbf24","#facc15","#fde68a"];
  for(const item of registry.animations){
    const master=path.join(root,item.static_authority),derivative=path.join(root,item.derivative);
    if(!fs.existsSync(master)) throw new Error(item.id+" static authority missing");
    if(!fs.existsSync(derivative)) throw new Error(item.id+" derivative missing");
    const a=fs.readFileSync(derivative),b=fs.readFileSync(generated[item.id]);
    if(!a.equals(b)) throw new Error(item.id+" deterministic regeneration mismatch");
    const text=a.toString("utf8"),required=["<title","<desc",'role="img"','data-motion-variable="'+item.motion_variable+'"',"prefers-reduced-motion:reduce"];
    for(const token of required) if(!text.includes(token)) throw new Error(item.id+" missing token "+token);
    const low=text.toLowerCase();for(const c of forbidden) if(low.includes(c)) throw new Error(item.id+" forbidden warm/gold literal "+c);
    if(!text.includes("#87CEFA")) throw new Error(item.id+" exact Light Sky Blue accent missing");
    if(!item.boundary||!item.oracle) throw new Error(item.id+" manifest boundary/oracle missing");
    const sha=crypto.createHash("sha256").update(a).digest("hex");console.log("PASS "+item.id+" sha256="+sha+" bytes="+a.length);
  }
  const m=Object.fromEntries(registry.animations.map(x=>[x.id,x]));
  if(m["F08-V5"].motion_variable!=="s"||m["F11-V5"].motion_variable!=="s") throw new Error("F08/F11 must use s");
  if(m["F13-V5"].motion_variable!=="t_model"||m["F14-V5"].motion_variable!=="t_model") throw new Error("F13/F14 must use t_model");
  console.log("Mathematical Art V5 animation verification passed.");
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
