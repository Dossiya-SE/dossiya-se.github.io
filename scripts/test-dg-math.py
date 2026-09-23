from __future__ import annotations
import importlib.util
import math
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dggen', ROOT / 'scripts/generate-dg-figures.py')
g = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(g)

fail=[]; passed=[]
def chk(name, cond, detail=''):
    (passed if cond else fail).append((name,detail))
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def norm(a): return math.sqrt(dot(a,a))
def sub(a,b): return tuple(x-y for x,y in zip(a,b))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])

# F08 helix Frenet invariants + independent finite-difference curvature oracle.
a=.18
for t in [0,.3,2.3,8.7,19.2,24.0]:
    T,N,B=g.helix_frame(t,a)
    chk('F08 unit T',abs(norm(T)-1)<1e-12,f't={t}')
    chk('F08 unit N',abs(norm(N)-1)<1e-12,f't={t}')
    chk('F08 unit B',abs(norm(B)-1)<1e-12,f't={t}')
    chk('F08 orth T-N',abs(dot(T,N))<1e-12,f't={t}')
    chk('F08 orth T-B',abs(dot(T,B))<1e-12,f't={t}')
    chk('F08 orth N-B',abs(dot(N,B))<1e-12,f't={t}')
    chk('F08 orientation',norm(sub(cross(T,N),B))<1e-12,f't={t}')
for t in [1.1,4.5,12.2]:
    h=1e-5; p0=g.helix(t,a); pm=g.helix(t-h,a); pp=g.helix(t+h,a)
    v=tuple((pp[i]-pm[i])/(2*h) for i in range(3)); acc=tuple((pp[i]-2*p0[i]+pm[i])/(h*h) for i in range(3))
    k=norm(cross(v,acc))/(norm(v)**3); exact=1/(1+a*a)
    chk('F08 curvature oracle',abs(k-exact)<2e-6,f'{k} vs {exact}')

# F09 sphere metric from independent finite differences.
for th,ph in [(0.4,.2),(1.1,.7),(2.3,2.0)]:
    h=1e-6; rtp=g.sphere(th+h,ph); rtm=g.sphere(th-h,ph); rpp=g.sphere(th,ph+h); rpm=g.sphere(th,ph-h)
    rt=tuple((rtp[i]-rtm[i])/(2*h) for i in range(3)); rp=tuple((rpp[i]-rpm[i])/(2*h) for i in range(3))
    E=dot(rt,rt); F=dot(rt,rp); G=dot(rp,rp)
    chk('F09 E',abs(E-1)<2e-10,f'{th},{ph}: {E}')
    chk('F09 F',abs(F)<2e-10,f'{th},{ph}: {F}')
    chk('F09 G',abs(G-math.sin(th)**2)<2e-10,f'{th},{ph}: {G}')
    chk('F09 det positive',E*G-F*F>0,f'{th},{ph}')

# F10 torus Gaussian-curvature sign + principal-curvature product oracle.
R=2.2; r=.8
for v,sign in [(0,1),(math.pi/3,1),(math.pi/2,0),(2*math.pi/3,-1),(math.pi,-1)]:
    K=g.torus_K(v,R,r)
    chk('F10 sign', K>0 if sign>0 else K<0 if sign<0 else abs(K)<1e-15, f'v={v},K={K}')
    K2=(math.cos(v)/(R+r*math.cos(v)))*(1/r)
    chk('F10 principal product',abs(K-K2)<1e-15,f'v={v}')

# F11 numerical geodesic versus exact great-circle oracle.
th0=1.15; ph0=.30; td,pd=g.normalize_geodesic_velocity(th0,.35,.72)
sol=g.rk4_geodesic(th0,ph0,td,pd,7.0,.0125)
r0=g.sphere(th0,ph0); rt,rp=g.sphere_basis(th0,ph0); v0=tuple(td*rt[i]+pd*rp[i] for i in range(3))
chk('F11 initial speed',abs(norm(v0)-1)<1e-14,f'{norm(v0)}')
max_err=max_speed_err=max_radius_err=0.0; h=.0125
for idx,(th,ph,thd,phd) in enumerate(sol):
    s=idx*h; rcur=g.sphere(th,ph); rex=tuple(r0[i]*math.cos(s)+v0[i]*math.sin(s) for i in range(3))
    max_err=max(max_err,norm(sub(rcur,rex)))
    speed=math.sqrt(thd*thd+(math.sin(th)*phd)**2); max_speed_err=max(max_speed_err,abs(speed-1)); max_radius_err=max(max_radius_err,abs(norm(rcur)-1))
chk('F11 great-circle oracle',max_err<2e-8,f'max={max_err}')
chk('F11 speed conservation',max_speed_err<2e-9,f'max={max_speed_err}')
chk('F11 sphere constraint',max_radius_err<2e-15,f'max={max_radius_err}')

# F12 tangency X(p)·p=0.
max_tangent=0.0
for th in [0.2,.6,1.0,1.4,1.8,2.2,2.8]:
    for ph in [j*.37 for j in range(17)]:
        p=g.sphere(th,ph); x,y,z=p; X=(-y,x,0); max_tangent=max(max_tangent,abs(dot(p,X)))
chk('F12 tangency',max_tangent<2e-16,f'max={max_tangent}')

# F13 analytic heat equation residual with numerical theta/time derivatives.
def u(th,t): return math.exp(-2*t)*math.cos(th)
for th,t in [(.4,.1),(1.1,.6),(2.2,1.0)]:
    dh=1e-5; dt=1e-6; ut=(u(th,t+dt)-u(th,t-dt))/(2*dt)
    def utheta(q): return (u(q+dh,t)-u(q-dh,t))/(2*dh)
    lap=(math.sin(th+dh)*utheta(th+dh)-math.sin(th-dh)*utheta(th-dh))/(2*dh*math.sin(th))
    chk('F13 heat residual',abs(ut-lap)<3e-6,f'th={th},t={t},res={ut-lap}')

# Deterministic generated SVG sanity in a clean temp directory.
with tempfile.TemporaryDirectory() as tdout:
    out=Path(tdout)
    names={"F08":"F08-curves-frenet-frames-v4.svg","F09":"F09-parameterized-surface-metric-v4.svg","F10":"F10-gaussian-curvature-field-v4.svg","F11":"F11-computed-geodesics-v4.svg","F12":"F12-tangent-vector-field-v4.svg","F13":"F13-laplace-beltrami-heat-flow-v4.svg"}
    for fid,fn in g.FIGS.items():
        s=fn(); (out/names[fid]).write_text(s,encoding='utf-8')
    for p in sorted(out.glob('*.svg')):
        s=p.read_text()
        chk(f'{p.stem} title','<title' in s)
        chk(f'{p.stem} desc','<desc' in s)
        chk(f'{p.stem} vector-only','<image' not in s and 'data:image/' not in s)
        chk(f'{p.stem} viewBox','viewBox="0 0 2400 1500"' in s)

print(f'Differential-geometry audit: {len(passed)} passes, {len(fail)} failures')
print(f'F11 max great-circle error={max_err:.3e}; max speed drift={max_speed_err:.3e}; F12 max tangent dot={max_tangent:.3e}')
for n,d in fail: print('FAIL',n,d)
if fail: raise SystemExit(1)
