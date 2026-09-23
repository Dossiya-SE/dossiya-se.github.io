#!/usr/bin/env python3
"""Generate deterministic Mathematical Art V5 animated SVG derivatives for F08, F11 and F13."""
from __future__ import annotations
import argparse, importlib.util, math
from pathlib import Path
from html import escape

ROOT=Path(__file__).resolve().parents[1]
DG_PATH=ROOT/"scripts"/"generate-dg-figures.py"
spec=importlib.util.spec_from_file_location("dg_v4",DG_PATH)
if spec is None or spec.loader is None: raise RuntimeError("cannot load V4 geometry generator")
g=importlib.util.module_from_spec(spec); spec.loader.exec_module(g)

W,H=1200,675
BG="#06111f"; PANEL="#0d1e31"; PANEL2="#122941"; TEXT="#edf5fb"; MUTED="#9fb6c8"
BLUE="#6cb6ff"; TEAL="#4ec9b0"; GREEN="#8bd450"; SKY="#87CEFA"; CORAL="#ff9f7a"; LINE="#31516a"

def esc(s): return escape(str(s))
def txt(x,y,s,size=18,fill=TEXT,weight=400,anchor="start"):
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-family="Inter,Arial,sans-serif" font-weight="{weight}" text-anchor="{anchor}">{esc(s)}</text>'
def path(points,stroke,width=3,dash=None,opacity=1):
    if not points: return ""
    d="M"+" L".join(f"{x:.2f},{y:.2f}" for x,y in points)
    da=f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}"{da}/>'
def frame_css(n,duration,static_index=0):
    rules=[".motion-frame{opacity:0}",f".motion-frame{{animation-duration:{duration:.3f}s;animation-timing-function:linear;animation-iteration-count:infinite}}"]
    eps=.002
    for i in range(n):
        a=100*i/n; b=100*(i+1)/n; name=f"mf{i}"
        if i==0: key=f"0%,{b-eps:.5f}%{{opacity:1}}{b:.5f}%,100%{{opacity:0}}"
        elif i==n-1: key=f"0%,{a-eps:.5f}%{{opacity:0}}{a:.5f}%,99.998%{{opacity:1}}100%{{opacity:0}}"
        else: key=f"0%,{a-eps:.5f}%{{opacity:0}}{a:.5f}%,{b-eps:.5f}%{{opacity:1}}{b:.5f}%,100%{{opacity:0}}"
        rules.append(f".f{i}{{animation-name:{name}}}@keyframes {name}{{{key}}}")
    rules.append(f"@media (prefers-reduced-motion:reduce){{.motion-frame{{animation:none!important;opacity:0!important}}.f{static_index}{{opacity:1!important}}}}")
    return "<style>"+"".join(rules)+"</style>"
def shell(fid,title,desc,var,n,duration,static_index):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" data-figure-id="{fid}" data-motion-variable="{var}" aria-labelledby="title desc">',
            f'<title id="title">{esc(title)}</title>',f'<desc id="desc">{esc(desc)}</desc>',frame_css(n,duration,static_index),
            f'<rect width="{W}" height="{H}" fill="{BG}"/><rect x="28" y="28" width="{W-56}" height="{H-56}" rx="24" fill="{PANEL}" stroke="{LINE}" stroke-width="2"/>']
def triangular_values(count,lo,hi):
    half=count//2
    f=[lo+(hi-lo)*i/(half-1) for i in range(half)]
    return (f+list(reversed(f)))[:count]

def f08():
    n=48; values=triangular_values(n,0,8*math.pi)
    p=shell("F08-V5","F08 V5 — Frenet frame motion","Analytic Frenet frame moves along a fixed helix. s is a curve parameter, not physical time. V4 remains static authority.","s",n,9.6,12)
    p += [txt(62,78,"F08 · FRENET FRAME MOTION · V5",17,TEAL,700),txt(62,112,"Analytic T, N, B transported along γ(s)",30,TEXT,800),txt(62,142,"s = geometric curve parameter · not physical time",15,SKY,700),txt(840,82,"STATIC AUTHORITY",13,MUTED,700),txt(840,105,"F08-curves-frenet-frames-v4.svg",14,TEXT,600)]
    curve=[g.project(g.helix(8*math.pi*i/699),420,385,145)[:2] for i in range(700)]
    p += [path(curve,BLUE,5),txt(770,235,"γ(s) = (cos s, sin s, a(s−4π))",18,TEXT,600),txt(770,270,"a = 0.18",17,MUTED),txt(770,315,"T = teal",16,TEAL,700),txt(770,345,"N = coral",16,CORAL,700),txt(770,375,"B = Light Sky Blue",16,SKY,700),txt(770,430,"Invariant",15,MUTED,700),txt(770,460,"‖T‖=‖N‖=‖B‖=1",17,GREEN,700),txt(770,490,"T·N=T·B=N·B=0",17,GREEN,700)]
    for i,s in enumerate(values):
        q=g.helix(s); T,N,B=g.helix_frame(s); x,y,_=g.project(q,420,385,145)
        p.append(f'<g class="motion-frame f{i}"><circle cx="{x:.2f}" cy="{y:.2f}" r="7" fill="{TEXT}" stroke="{SKY}" stroke-width="2"/>')
        for vec,col,label in ((T,TEAL,"T"),(N,CORAL,"N"),(B,SKY,"B")):
            r=g.add3(q,vec,.72); rx,ry,_=g.project(r,420,385,145)
            p.append(f'<line x1="{x:.2f}" y1="{y:.2f}" x2="{rx:.2f}" y2="{ry:.2f}" stroke="{col}" stroke-width="4"/>{txt(rx+8,ry-6,label,15,col,700)}')
        p.append(txt(770,545,f"s = {s:.3f}",18,SKY,700)+"</g>")
    p += [txt(62,628,"Boundary: motion visualizes source/derived geometry only; it does not add empirical evidence.",14,MUTED),"</svg>\n"]
    return "".join(p)

def exact_points(th0,ph0,td,pd,svals):
    r0=g.sphere(th0,ph0); rt,rp=g.sphere_basis(th0,ph0)
    v0=tuple(td*rt[j]+pd*rp[j] for j in range(3))
    return [tuple(r0[j]*math.cos(s)+v0[j]*math.sin(s) for j in range(3)) for s in svals]

def f11():
    th0=1.15; ph0=.30; td,pd=g.normalize_geodesic_velocity(th0,.35,.72); h=.0125
    sol=g.rk4_geodesic(th0,ph0,td,pd,7.0,h); svals=[j*h for j in range(len(sol))]
    exact=exact_points(th0,ph0,td,pd,svals)
    exact_proj=[g.project(q,430,390,235)[:2] for q in exact]
    num=[g.project(g.sphere(th,ph),430,390,235)[:2] for th,ph,_,_ in sol]
    errs=[math.sqrt(sum((g.sphere(row[0],row[1])[j]-ex[j])**2 for j in range(3))) for row,ex in zip(sol,exact)]
    n=40; fr=triangular_values(n,.02,1)
    p=shell("F11-V5","F11 V5 — computed geodesic trace","RK4 geodesic is revealed against an exact great-circle oracle. s is an integration/geodesic parameter, not physical time.","s",n,8,10)
    p += [txt(62,78,"F11 · GEODESIC TRACE · V5",17,TEAL,700),txt(62,112,"Numerical RK4 trajectory against exact great circle",29,TEXT,800),txt(62,142,"s = geodesic/integration parameter · not physical time",15,SKY,700),txt(820,82,"STATIC AUTHORITY",13,MUTED,700),txt(820,105,"F11-computed-geodesics-v4.svg",14,TEXT,600)]
    for theta in [.45,.8,1.15,1.5,1.85,2.2,2.55]:
        p.append(path([g.project(g.sphere(theta,2*math.pi*j/120),430,390,235)[:2] for j in range(121)],LINE,1,opacity=.45))
    for phi in [j*math.pi/4 for j in range(8)]:
        p.append(path([g.project(g.sphere(.08+(math.pi-.16)*j/100,phi),430,390,235)[:2] for j in range(101)],LINE,1,opacity=.38))
    p += [path(exact_proj,SKY,2,"8 7",.75),txt(770,235,"Exact oracle",15,SKY,700),txt(770,265,"r(s)=r₀ cos s + v₀ sin s",17,TEXT,600),txt(770,315,"Numerical integrator",15,MUTED,700),txt(770,345,"RK4 · h = 0.0125",17,TEAL,700),txt(770,395,"Verification",15,MUTED,700),txt(770,425,f"max 3D error = {max(errs):.3e}",17,GREEN,700),txt(770,455,"sphere radius ≈ 1",17,GREEN,700),txt(770,485,"intrinsic speed ≈ 1",17,GREEN,700)]
    for i,f in enumerate(fr):
        idx=max(1,min(len(sol)-1,int(round(f*(len(sol)-1))))); prefix=num[:idx+1]; x,y=prefix[-1]
        p.append(f'<g class="motion-frame f{i}">{path(prefix,TEAL,5)}<circle cx="{x:.2f}" cy="{y:.2f}" r="7" fill="{TEXT}" stroke="{TEAL}" stroke-width="2"/>{txt(770,545,f"s = {idx*h:.3f}",18,SKY,700)}</g>')
    p += [txt(62,628,"Boundary: numerical agreement verifies this implementation; the path is not an infrastructure trajectory.",14,MUTED),"</svg>\n"]
    return "".join(p)

def f13():
    n=32; times=triangular_values(n,0,1.2); cx,cy,r=410,365,225
    p=shell("F13-V5","F13 V5 — Laplace–Beltrami heat flow","Analytic heat-flow benchmark u(theta,t)=exp(-2t)cos(theta). t_model is PDE/model time, not measured data.","t_model",n,8,8)
    p += ['<defs><clipPath id="sphereClip"><circle cx="410" cy="365" r="225"/></clipPath></defs>',txt(62,78,"F13 · LAPLACE–BELTRAMI HEAT FLOW · V5",17,TEAL,700),txt(62,112,"Analytic eigenfunction decay on S²",30,TEXT,800),txt(62,142,"t_model = PDE/model time · analytic benchmark",15,SKY,700),txt(815,82,"STATIC AUTHORITY",13,MUTED,700),txt(815,105,"F13-laplace-beltrami-heat-flow-v4.svg",14,TEXT,600),f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{PANEL2}" stroke="{LINE}" stroke-width="2"/>']
    bands=30
    for i,t in enumerate(times):
        p.append(f'<g class="motion-frame f{i}" clip-path="url(#sphereClip)">')
        for b in range(bands):
            y0=cy-r+2*r*b/bands; y1=cy-r+2*r*(b+1)/bands; z=(cy-(y0+y1)/2)/r
            col=g.heat_color(math.exp(-2*t)*max(-1,min(1,z)))
            p.append(f'<rect x="{cx-r}" y="{y0:.2f}" width="{2*r}" height="{y1-y0+.8:.2f}" fill="{col}"/>')
        p.append("</g>"+f'<g class="motion-frame f{i}">{txt(775,405,f"t_model = {t:.3f}",20,SKY,700)}{txt(775,440,f"amplitude e^(−2t) = {math.exp(-2*t):.5f}",18,TEAL,700)}</g>')
    for z in (-.75,-.5,-.25,0,.25,.5,.75):
        y=cy-r*z; half=r*math.sqrt(max(0,1-z*z))
        p.append(f'<line x1="{cx-half:.2f}" y1="{y:.2f}" x2="{cx+half:.2f}" y2="{y:.2f}" stroke="{LINE}" stroke-width="1" opacity=".45"/>')
    p += [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{TEXT}" stroke-width="2" opacity=".75"/>',txt(775,235,"Analytic oracle",15,MUTED,700),txt(775,270,"Δ_S² cosθ = −2 cosθ",19,TEXT,600),txt(775,305,"u(θ,t)=e^(−2t)cosθ",19,TEAL,700),txt(775,350,"Positive field → Light Sky Blue",15,SKY,700),txt(775,375,"Negative field → blue",15,BLUE,700),txt(775,505,"No learned field",15,CORAL,700),txt(775,535,"No empirical calibration",15,CORAL,700),txt(62,628,"Boundary: analytic PDE benchmark; animation does not imply measured thermal or infrastructure dynamics.",14,MUTED),"</svg>\n"]
    return "".join(p)

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--out-dir",default="assets/math-art/v5"); args=ap.parse_args()
    out=Path(args.out_dir); out.mkdir(parents=True,exist_ok=True)
    data={"F08-frenet-frame-motion-v5.svg":f08(),"F11-geodesic-trace-motion-v5.svg":f11(),"F13-heat-flow-motion-v5.svg":f13()}
    for name,s in data.items():
        (out/name).write_text(s,encoding="utf-8"); print("V5",name,"bytes="+str(len(s)))
if __name__=="__main__": main()
