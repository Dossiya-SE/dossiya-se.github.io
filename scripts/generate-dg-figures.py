from __future__ import annotations
import argparse, math
from pathlib import Path
from html import escape

BG="#06111f"; PANEL="#0d1e31"; PANEL2="#122941"; TEXT="#edf5fb"; MUTED="#9fb6c8"
BLUE="#6cb6ff"; TEAL="#4ec9b0"; VIOLET="#c6a0f6"; GREEN="#8bd450"; GOLD="#f4c95d"; CORAL="#ff9f7a"; LINE="#31516a"

def project(p, cx, cy, s):
    x,y,z=p
    X = cx + s*(0.88*x - 0.48*y)
    Y = cy - s*(0.32*x + 0.56*y + 0.78*z)
    depth = 0.42*x + 0.75*y - 0.51*z
    return X,Y,depth

def path_from(points, close=False, **attrs):
    if not points: return ""
    d=f"M{points[0][0]:.2f},{points[0][1]:.2f} " + " ".join(f"L{x:.2f},{y:.2f}" for x,y in points[1:])
    if close: d += " Z"
    at=" ".join(f'{k.replace("_","-")}="{escape(str(v))}"' for k,v in attrs.items())
    return f'<path d="{d}" {at}/>'

def line(x1,y1,x2,y2,**attrs):
    at=" ".join(f'{k.replace("_","-")}="{escape(str(v))}"' for k,v in attrs.items())
    return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" {at}/>'

def text(x,y,content,size=30,fill=TEXT,weight=400,anchor="start",family="Inter,Arial,sans-serif", **attrs):
    at=" ".join(f'{k.replace("_","-")}="{escape(str(v))}"' for k,v in attrs.items())
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-family="{family}" font-weight="{weight}" text-anchor="{anchor}" {at}>{escape(content)}</text>'

def svg_start(fid,title,desc,w=2400,h=1500):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" role="img" data-figure-id="{fid}" viewBox="0 0 {w} {h}" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{BG}"/><stop offset="1" stop-color="#0a1b2c"/></linearGradient>
<filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="{TEAL}"/></marker>
</defs><rect width="{w}" height="{h}" fill="url(#bg)"/>'''

def svg_end(): return "</svg>\n"

def header(fid, kicker, title_str, subtitle):
    return f'''<g data-layout-box="120,80,2160,220">
{text(120,140,f"{fid} · {kicker}",28,TEAL,700,letter_spacing=5)}
{text(120,225,title_str,64,TEXT,800)}
{text(120,278,subtitle,27,MUTED)}
</g>'''

def helix(t,a=0.18):
    return (math.cos(t), math.sin(t), a*(t-4*math.pi))

def helix_frame(t,a=0.18):
    den=math.sqrt(1+a*a)
    T=(-math.sin(t)/den, math.cos(t)/den, a/den)
    N=(-math.cos(t),-math.sin(t),0.0)
    B=(a*math.sin(t)/den,-a*math.cos(t)/den,1/den)
    return T,N,B

def add3(p,v,scale): return tuple(p[i]+scale*v[i] for i in range(3))

def figure_F08():
    parts=[svg_start("F08","Curves and Frenet Frames V4","Computed helix with tangent, normal and binormal frames; curvature and torsion are analytic benchmarks."), header("F08","CURVES + FRENET FRAME","A curve becomes geometry through derivatives.","Computed helix γ(t) with T, N, B, curvature κ and torsion τ.")]
    parts.append('<g data-layout-box="120,340,1500,1030"><rect x="120" y="340" width="1500" height="1030" rx="36" fill="#0d1e31" fill-opacity=".72" stroke="#31516a"/>')
    pts=[]
    for i in range(700):
        t=8*math.pi*i/699
        X,Y,_=project(helix(t),830,860,210)
        pts.append((X,Y))
    parts.append(path_from(pts,fill="none",stroke=BLUE,stroke_width=7,stroke_linecap="round",stroke_linejoin="round"))
    for t in [2.3, 8.5, 15.5, 22.5]:
        p=helix(t); T,N,B=helix_frame(t)
        x,y,_=project(p,830,860,210)
        for vec,col,label,dy in [(T,TEAL,"T",0),(N,CORAL,"N",22),(B,GOLD,"B",-22)]:
            q=add3(p,vec,0.62)
            qx,qy,_=project(q,830,860,210)
            parts.append(line(x,y,qx,qy,stroke=col,stroke_width=5,marker_end="url(#arrow)"))
            parts.append(text(qx+10,qy+dy,label,24,col,700))
        parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="8" fill="{TEXT}"/>')
    parts.append(text(180,1322,"Vector arrows are computed from analytic Frenet-frame formulas; no hand-drawn frame directions.",24,MUTED))
    parts.append('</g>')
    a=0.18; k=1/(1+a*a); tau=a/(1+a*a)
    parts.append(f'<g data-layout-box="1680,340,600,1030"><rect x="1680" y="340" width="600" height="1030" rx="36" fill="{PANEL2}" stroke="{LINE}"/>')
    parts.append(text(1735,420,"[S/D] ANALYTIC BENCHMARK",25,BLUE,700,letter_spacing=3))
    parts.append(text(1735,500,"γ(t) = (cos t, sin t, a(t−4π))",28,TEXT,600,family="ui-monospace,Menlo,monospace"))
    parts.append(text(1735,570,f"a = {a:.2f}",28,MUTED))
    parts.append(text(1735,660,f"κ = 1/(1+a²) = {k:.6f}",28,TEAL,700,family="ui-monospace,Menlo,monospace"))
    parts.append(text(1735,725,f"τ = a/(1+a²) = {tau:.6f}",28,GOLD,700,family="ui-monospace,Menlo,monospace"))
    parts.append(text(1735,820,"Verified invariants",28,TEXT,700))
    parts.append(text(1735,880,"‖T‖ = ‖N‖ = ‖B‖ = 1",26,MUTED,family="ui-monospace,Menlo,monospace"))
    parts.append(text(1735,930,"T·N = T·B = N·B = 0",26,MUTED,family="ui-monospace,Menlo,monospace"))
    parts.append(text(1735,1035,"Rendering role",26,TEXT,700))
    parts.append(text(1735,1090,"curve = blue",25,BLUE)); parts.append(text(1735,1135,"tangent = teal",25,TEAL)); parts.append(text(1735,1180,"normal = coral",25,CORAL)); parts.append(text(1735,1225,"binormal = gold",25,GOLD))
    parts.append('</g>'); parts.append(svg_end()); return "".join(parts)

def sphere(theta,phi,R=1.0): return (R*math.sin(theta)*math.cos(phi), R*math.sin(theta)*math.sin(phi), R*math.cos(theta))

def sphere_basis(theta,phi):
    rt=(math.cos(theta)*math.cos(phi), math.cos(theta)*math.sin(phi), -math.sin(theta))
    rp=(-math.sin(theta)*math.sin(phi), math.sin(theta)*math.cos(phi), 0.0)
    return rt,rp

def sphere_grid(cx,cy,s, stroke=LINE, opacity=.65):
    out=[]
    for theta in [0.3,0.55,0.8,1.05,1.3,1.55,1.8,2.05,2.3,2.55,2.8]:
        pts=[project(sphere(theta,2*math.pi*j/180),cx,cy,s)[:2] for j in range(181)]
        out.append(path_from(pts,fill="none",stroke=stroke,stroke_width=2,opacity=opacity))
    for phi in [j*math.pi/8 for j in range(16)]:
        pts=[project(sphere(0.08+(math.pi-0.16)*i/130,phi),cx,cy,s)[:2] for i in range(131)]
        out.append(path_from(pts,fill="none",stroke=stroke,stroke_width=2,opacity=opacity))
    return "".join(out)

def figure_F09():
    th=1.1; ph=.7; E=1.0; F=0.0; G=math.sin(th)**2
    parts=[svg_start("F09","Parameterized Surface and Metric V4","Computed unit-sphere parameterization with coordinate curves, tangent basis and first fundamental form."), header("F09","PARAMETERIZED SURFACE + METRIC","Coordinates become geometry through the metric tensor.","Unit sphere r(θ,φ); coordinate curves and tangent basis are generated from the parameterization.")]
    parts.append(f'<g data-layout-box="120,340,1500,1030"><rect x="120" y="340" width="1500" height="1030" rx="36" fill="{PANEL}" fill-opacity=".72" stroke="{LINE}"/>')
    parts.append(sphere_grid(840,850,430))
    p=sphere(th,ph); rt,rp=sphere_basis(th,ph); px,py,_=project(p,840,850,430)
    for vec,col,label in [(rt,TEAL,"r_θ"),(rp,BLUE,"r_φ")]:
        q=add3(p,vec,.68); qx,qy,_=project(q,840,850,430)
        parts.append(line(px,py,qx,qy,stroke=col,stroke_width=7,marker_end="url(#arrow)")); parts.append(text(qx+16,qy-10,label,28,col,700))
    parts.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="11" fill="{TEXT}" filter="url(#glow)"/>')
    parts.append(text(180,1322,"Coordinate grid and tangent vectors are sampled from r(θ,φ); the visual is generated from the same equations tested below.",24,MUTED)); parts.append('</g>')
    parts.append(f'<g data-layout-box="1680,340,600,1030"><rect x="1680" y="340" width="600" height="1030" rx="36" fill="{PANEL2}" stroke="{LINE}"/>')
    parts.append(text(1735,420,"[S/D] FIRST FUNDAMENTAL FORM",25,BLUE,700,letter_spacing=3)); parts.append(text(1735,500,"r(θ,φ) = (sinθ cosφ,",27,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,545,"            sinθ sinφ, cosθ)",27,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,635,f"evaluation: θ={th:.2f}, φ={ph:.2f}",25,MUTED)); parts.append(text(1735,715,f"E = r_θ·r_θ = {E:.6f}",27,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,775,f"F = r_θ·r_φ = {F:.6f}",27,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,835,f"G = r_φ·r_φ = {G:.6f}",27,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,930,"g = [[E,F],[F,G]]",28,TEXT,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,1000,"det(g) = sin²θ > 0",28,GREEN,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,1105,"Boundary",26,TEXT,700)); parts.append(text(1735,1160,"This is source geometry,",24,MUTED)); parts.append(text(1735,1200,"not an infrastructure metric.",24,CORAL)); parts.append('</g>'); parts.append(svg_end()); return "".join(parts)

def torus(u,v,R=2.2,r=.8): return ((R+r*math.cos(v))*math.cos(u),(R+r*math.cos(v))*math.sin(u),r*math.sin(v))
def torus_K(v,R=2.2,r=.8): return math.cos(v)/(r*(R+r*math.cos(v)))

def mix_hex(a,b,t):
    ar=tuple(int(a[i:i+2],16) for i in (1,3,5)); br=tuple(int(b[i:i+2],16) for i in (1,3,5)); c=tuple(round(ar[i]*(1-t)+br[i]*t) for i in range(3)); return '#%02x%02x%02x'%c

def curv_color(k,kmax):
    z=max(-1,min(1,k/kmax))
    return mix_hex("#122941",CORAL,-z) if z<0 else mix_hex("#122941",TEAL,z)

def figure_F10():
    R=2.2; r=.8
    parts=[svg_start("F10","Gaussian Curvature Field V4","Computed Gaussian curvature on a torus; color encodes the analytic curvature value and changes sign across the torus."), header("F10","GAUSSIAN CURVATURE FIELD","Color must encode mathematics, not decoration.","Torus curvature K(v)=cos(v)/[r(R+r cos(v))]; positive outer region and negative inner region.")]
    parts.append(f'<g data-layout-box="120,340,1680,1030"><rect x="120" y="340" width="1680" height="1030" rx="36" fill="{PANEL}" fill-opacity=".72" stroke="{LINE}"/>')
    quads=[]; nu,nv=48,24; kmax=max(abs(torus_K(2*math.pi*j/nv,R,r)) for j in range(nv))
    for i in range(nu):
        u0=2*math.pi*i/nu; u1=2*math.pi*(i+1)/nu
        for j in range(nv):
            v0=2*math.pi*j/nv; v1=2*math.pi*(j+1)/nv
            pp=[torus(u0,v0,R,r),torus(u1,v0,R,r),torus(u1,v1,R,r),torus(u0,v1,R,r)]; pr=[project(p,930,870,235) for p in pp]; depth=sum(q[2] for q in pr)/4; k=torus_K((v0+v1)/2,R,r); quads.append((depth,[(q[0],q[1]) for q in pr],curv_color(k,kmax)))
    quads.sort(key=lambda q:q[0])
    for _,pts,col in quads: parts.append(path_from(pts,close=True,fill=col,stroke="#173047",stroke_width=1.2,opacity=.97))
    parts.append(text(180,1322,"Each polygon color is computed from Gaussian curvature at its parameter-cell midpoint.",24,MUTED)); parts.append('</g>')
    parts.append(f'<g data-layout-box="1860,340,420,1030"><rect x="1860" y="340" width="420" height="1030" rx="36" fill="{PANEL2}" stroke="{LINE}"/>'); parts.append(text(1905,420,"[S/D] CURVATURE",25,BLUE,700,letter_spacing=3)); parts.append(text(1905,500,"R = 2.2",27,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1905,550,"r = 0.8",27,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1905,640,"K(v) =",27,TEXT,700)); parts.append(text(1905,690,"cos v",27,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1905,735,"────────────",25,MUTED,family="ui-monospace,Menlo,monospace")); parts.append(text(1905,780,"r(R+r cos v)",25,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1905,890,"Legend",26,TEXT,700)); parts.append(f'<rect x="1905" y="930" width="70" height="28" rx="8" fill="{CORAL}"/>{text(1990,954,"K < 0",24,TEXT)}'); parts.append(f'<rect x="1905" y="985" width="70" height="28" rx="8" fill="#122941" stroke="{LINE}"/>{text(1990,1009,"K ≈ 0",24,TEXT)}'); parts.append(f'<rect x="1905" y="1040" width="70" height="28" rx="8" fill="{TEAL}"/>{text(1990,1064,"K > 0",24,TEXT)}'); parts.append(text(1905,1160,"Sign change is",24,MUTED)); parts.append(text(1905,1200,"mathematical structure.",24,GREEN)); parts.append('</g>'); parts.append(svg_end()); return "".join(parts)

def rk4_geodesic(theta0,phi0,thetad0,phid0,smax=8.0,h=.01):
    def f(y):
        th,ph,td,pd=y; st=math.sin(th); ct=math.cos(th); return (td,pd,st*ct*pd*pd,-2*(ct/st)*td*pd)
    y=[theta0,phi0,thetad0,phid0]; out=[tuple(y)]; n=round(smax/h)
    for _ in range(n):
        k1=f(y); y2=[y[i]+h*k1[i]/2 for i in range(4)]; k2=f(y2); y3=[y[i]+h*k2[i]/2 for i in range(4)]; k3=f(y3); y4=[y[i]+h*k3[i] for i in range(4)]; k4=f(y4); y=[y[i]+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6 for i in range(4)]; out.append(tuple(y))
    return out

def normalize_geodesic_velocity(theta,td,pd):
    speed=math.sqrt(td*td+(math.sin(theta)*pd)**2); return td/speed,pd/speed

def figure_F11():
    th0=1.15; ph0=.30; td,pd=normalize_geodesic_velocity(th0,.35,.72); sols=[]
    for shift,col in [(0,TEAL),(2.1,BLUE),(4.2,GOLD)]: sols.append((rk4_geodesic(th0,ph0+shift,td,pd,7.0,.0125),col))
    parts=[svg_start("F11","Computed Geodesics V4","Numerically integrated geodesics on the unit sphere using RK4, compared by tests to the exact great-circle benchmark."), header("F11","COMPUTED GEODESICS","A geodesic is integrated, not hand-drawn.","Unit-sphere geodesic equations solved by RK4; numerical paths are tested against exact great circles.")]
    parts.append(f'<g data-layout-box="120,340,1500,1030"><rect x="120" y="340" width="1500" height="1030" rx="36" fill="{PANEL}" fill-opacity=".72" stroke="{LINE}"/>'); parts.append(sphere_grid(835,840,430,opacity=.42))
    for sol,col in sols:
        pts=[project(sphere(th,ph),835,840,430)[:2] for th,ph,_,_ in sol]; parts.append(path_from(pts,fill="none",stroke=col,stroke_width=8,stroke_linecap="round",stroke_linejoin="round",filter="url(#glow)"))
    parts.append(text(180,1322,"Three numerical trajectories use identical intrinsic initial speed and rotated longitudes.",24,MUTED)); parts.append('</g>'); parts.append(f'<g data-layout-box="1680,340,600,1030"><rect x="1680" y="340" width="600" height="1030" rx="36" fill="{PANEL2}" stroke="{LINE}"/>'); parts.append(text(1735,420,"[S/C/V] GEODESIC ODE",25,BLUE,700,letter_spacing=3)); parts.append(text(1735,500,"θ¨ − sinθ cosθ φ˙² = 0",26,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,555,"φ¨ + 2 cotθ θ˙ φ˙ = 0",26,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,650,"Integrator",26,TEXT,700)); parts.append(text(1735,700,"RK4 · h = 0.0125",26,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,795,"Verification targets",26,TEXT,700)); parts.append(text(1735,845,"intrinsic speed ≈ 1",25,MUTED)); parts.append(text(1735,895,"sphere radius ≈ 1",25,MUTED)); parts.append(text(1735,945,"great-circle oracle",25,MUTED)); parts.append(text(1735,1040,"Boundary",26,TEXT,700)); parts.append(text(1735,1090,"Numerical agreement verifies",24,MUTED)); parts.append(text(1735,1130,"this implementation,",24,MUTED)); parts.append(text(1735,1170,"not an infrastructure path.",24,CORAL)); parts.append('</g>'); parts.append(svg_end()); return "".join(parts)

def figure_F12():
    parts=[svg_start("F12","Tangent Vector Field V4","Computed rotational tangent vector field X=(-y,x,0) on the unit sphere, with arrows generated from sampled tangent vectors."), header("F12","TANGENT VECTOR FIELD","A vector field must live in the correct tangent space.","Sphere field X(p)=k×p=(-y,x,0); every rendered arrow is tested for tangency X·p=0.")]
    parts.append(f'<g data-layout-box="120,340,1500,1030"><rect x="120" y="340" width="1500" height="1030" rx="36" fill="{PANEL}" fill-opacity=".72" stroke="{LINE}"/>'); parts.append(sphere_grid(835,840,430,opacity=.32))
    for theta in [0.45,0.75,1.05,1.35,1.65,1.95,2.25,2.55]:
        for phi in [j*math.pi/4 for j in range(8)]:
            p=sphere(theta,phi); x,y,z=p; v=(-y,x,0); norm=math.sqrt(v[0]**2+v[1]**2+v[2]**2)
            if norm<.15: continue
            vn=tuple(q/norm for q in v); q=add3(p,vn,.33); px,py,_=project(p,835,840,430); qx,qy,_=project(q,835,840,430); parts.append(line(px,py,qx,qy,stroke=TEAL,stroke_width=4,marker_end="url(#arrow)",opacity=.92))
    parts.append(text(180,1322,"Arrow direction and length are computed from a normalized tangent field; the grid is source geometry.",24,MUTED)); parts.append('</g>'); parts.append(f'<g data-layout-box="1680,340,600,1030"><rect x="1680" y="340" width="600" height="1030" rx="36" fill="{PANEL2}" stroke="{LINE}"/>'); parts.append(text(1735,420,"[S/D/V] FIELD",25,BLUE,700,letter_spacing=3)); parts.append(text(1735,500,"p = (x,y,z) ∈ S²",27,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,565,"k = (0,0,1)",27,TEXT,600,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,645,"X(p) = k × p",29,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,715,"= (−y, x, 0)",29,TEAL,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,825,"Tangency test",27,TEXT,700)); parts.append(text(1735,885,"X(p) · p = 0",31,GREEN,700,family="ui-monospace,Menlo,monospace")); parts.append(text(1735,980,"Interpretation",27,TEXT,700)); parts.append(text(1735,1035,"A legitimate tangent field",24,MUTED)); parts.append(text(1735,1075,"is not merely an arrow",24,MUTED)); parts.append(text(1735,1115,"drawn near a surface.",24,CORAL)); parts.append('</g>'); parts.append(svg_end()); return "".join(parts)

def heat_color(value):
    z=max(-1,min(1,value)); return mix_hex("#122941",BLUE,-z) if z<0 else mix_hex("#122941",GOLD,z)

def sphere_heat_mesh(cx,cy,s,t):
    quads=[]; nt,np=24,36
    for i in range(nt):
        th0=.05+(math.pi-.1)*i/nt; th1=.05+(math.pi-.1)*(i+1)/nt
        for j in range(np):
            ph0=2*math.pi*j/np; ph1=2*math.pi*(j+1)/np; pp=[sphere(th0,ph0),sphere(th1,ph0),sphere(th1,ph1),sphere(th0,ph1)]; pr=[project(p,cx,cy,s) for p in pp]; depth=sum(q[2] for q in pr)/4; thm=(th0+th1)/2; val=math.exp(-2*t)*math.cos(thm); quads.append((depth,[(q[0],q[1]) for q in pr],heat_color(val)))
    quads.sort(key=lambda q:q[0]); return "".join(path_from(pts,close=True,fill=col,stroke="#173047",stroke_width=.8) for _,pts,col in quads)

def figure_F13():
    times=[0.0,.6,1.2]; parts=[svg_start("F13","Laplace-Beltrami Heat Flow V4","Analytic heat-flow benchmark on the unit sphere using the Laplace-Beltrami eigenfunction cos(theta), rendered at three times."), header("F13","LAPLACE–BELTRAMI / HEAT FLOW","Intrinsic operators produce time-evolving geometry-aware fields.","Benchmark u(θ,t)=e^(−2t)cosθ on S², since Δ_S² cosθ = −2 cosθ.")]
    parts.append(f'<g data-layout-box="120,340,2160,820"><rect x="120" y="340" width="2160" height="820" rx="36" fill="{PANEL}" fill-opacity=".72" stroke="{LINE}"/>'); centers=[500,1200,1900]
    for cx,tv in zip(centers,times): parts.append(sphere_heat_mesh(cx,760,250,tv)); parts.append(text(cx,1090,f"t = {tv:.1f}",30,TEXT,700,anchor="middle")); parts.append(text(cx,1132,f"amplitude = e^(−2t) = {math.exp(-2*tv):.4f}",22,MUTED,anchor="middle",family="ui-monospace,Menlo,monospace"))
    parts.append('</g>'); parts.append(f'<g data-layout-box="120,1210,2160,170"><rect x="120" y="1210" width="2160" height="170" rx="32" fill="{PANEL2}" stroke="{LINE}"/>'); parts.append(text(180,1270,"[S/D/V] Analytic oracle",24,BLUE,700,letter_spacing=3)); parts.append(text(180,1325,"Δ_S² cosθ = −2 cosθ  ⇒  ∂ₜu = Δ_S²u  ⇒  u(θ,t)=e^(−2t)cosθ",29,TEXT,700,family="ui-monospace,Menlo,monospace")); parts.append(text(180,1363,"Color magnitude decays exactly with the known eigenvalue; this is an analytic benchmark, not a learned field.",23,MUTED)); parts.append('</g>'); parts.append(svg_end()); return "".join(parts)

FIGS={"F08":figure_F08,"F09":figure_F09,"F10":figure_F10,"F11":figure_F11,"F12":figure_F12,"F13":figure_F13}

def main():
    p=argparse.ArgumentParser(); p.add_argument("--out-dir",default="assets/math-art"); args=p.parse_args(); out=Path(args.out_dir); out.mkdir(parents=True,exist_ok=True)
    names={"F08":"F08-curves-frenet-frames-v4.svg","F09":"F09-parameterized-surface-metric-v4.svg","F10":"F10-gaussian-curvature-field-v4.svg","F11":"F11-computed-geodesics-v4.svg","F12":"F12-tangent-vector-field-v4.svg","F13":"F13-laplace-beltrami-heat-flow-v4.svg"}
    for fid,fn in FIGS.items():
        data=fn(); (out/names[fid]).write_text(data,encoding="utf-8"); print(fid,names[fid],len(data))
if __name__=="__main__": main()
