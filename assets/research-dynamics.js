// Dynamic Mathematics + Sustainability V1
// Native ES module. Decorative art is separated from mechanistic computation.
// Numerical mechanisms are deterministic reduced demonstrators, not calibrated predictions.

export const PT_LIMITS = Object.freeze({
  powerMin: 0.45,
  transportMin: 0.45,
  serviceMin: 0.60
});

export const PT_DEFAULTS = Object.freeze({
  hazard: 1.0,
  coupling: 0.80,
  control: 0.30,
  horizon: 18,
  dt: 0.05,
  power0: 0.96,
  transport0: 0.94
});

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

export function hazardPulse(time, scale = 1) {
  const primary = 0.88 * Math.exp(-((time - 4.8) / 1.8) ** 2);
  const tail = 0.34 * Math.exp(-((time - 9.5) / 3.8) ** 2);
  return scale * (primary + tail);
}

export function ptDerivative(time, state, params = {}) {
  const p = clamp(state[0]);
  const m = clamp(state[1]);
  const hazard = Number(params.hazard ?? PT_DEFAULTS.hazard);
  const coupling = Number(params.coupling ?? PT_DEFAULTS.coupling);
  const control = Number(params.control ?? PT_DEFAULTS.control);
  const h = hazardPulse(time, hazard);

  const dp =
    0.16 * (1 - p) +
    0.18 * control * (1 - p) -
    0.34 * h * p -
    0.14 * coupling * p * (1 - m);

  const dm =
    0.12 * (1 - m) +
    0.14 * control * (1 - m) -
    0.24 * h * m -
    0.18 * coupling * m * (1 - p);

  return [dp, dm];
}

export function rk4PTStep(time, state, dt, params = {}) {
  const add = (a, b, scale) => a.map((v, i) => v + scale * b[i]);
  const k1 = ptDerivative(time, state, params);
  const k2 = ptDerivative(time + dt / 2, add(state, k1, dt / 2), params);
  const k3 = ptDerivative(time + dt / 2, add(state, k2, dt / 2), params);
  const k4 = ptDerivative(time + dt, add(state, k3, dt), params);
  return state.map((v, i) =>
    clamp(v + dt * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6)
  );
}

export function signedViabilityMargin(power, transport, psi = 1) {
  const safePsi = Math.max(0.2, Number(psi) || 1);
  const dPower = power - PT_LIMITS.powerMin;
  const dTransport = safePsi * (transport - PT_LIMITS.transportMin);
  const dService =
    (power + transport - 2 * PT_LIMITS.serviceMin) /
    Math.sqrt(1 + 1 / (safePsi * safePsi));
  return Math.min(dPower, dTransport, dService);
}

export function metricViabilityMargin(power, transport, psi = 1) {
  return Math.max(0, signedViabilityMargin(power, transport, psi));
}

export function simulatePT(options = {}) {
  const params = { ...PT_DEFAULTS, ...options };
  const dt = Math.max(0.01, Number(params.dt));
  const horizon = Math.max(dt, Number(params.horizon));
  let state = [clamp(Number(params.power0)), clamp(Number(params.transport0))];
  const rows = [];

  for (let time = 0; time <= horizon + 1e-12; time += dt) {
    const power = state[0];
    const transport = state[1];
    const service = 0.5 * (power + transport);
    rows.push({
      time,
      power,
      transport,
      service,
      rho: metricViabilityMargin(power, transport, 1)
    });
    state = rk4PTStep(time, state, dt, params);
  }
  return rows;
}

export function summarizePT(rows) {
  if (!rows?.length) {
    return { nadir: 0, mean: 0, finalService: 0, minMargin: 0, viableFraction: 0 };
  }
  let nadir = Infinity;
  let sum = 0;
  let minMargin = Infinity;
  let viableCount = 0;
  for (const row of rows) {
    nadir = Math.min(nadir, row.service);
    sum += row.service;
    minMargin = Math.min(minMargin, row.rho);
    if (row.rho > 0) viableCount += 1;
  }
  return {
    nadir,
    mean: sum / rows.length,
    finalService: rows.at(-1).service,
    minMargin,
    viableFraction: viableCount / rows.length
  };
}

function css(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function prepareCanvas(canvas) {
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: rect.width, height: rect.height, ratio };
}

function drawArrow(ctx, x1, y1, x2, y2, color, width = 1.4, alpha = 1) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 6;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function initHeroMathField() {
  const canvas = document.querySelector('[data-hero-field]');
  if (!canvas) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = !('IntersectionObserver' in window);
  let frame = 0;
  let last = 0;
  let running = false;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active && !reduceMotion && !running) {
        running = true;
        frame = requestAnimationFrame(draw);
      } else if (!active && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        running = false;
      }
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  function draw(ms = 0) {
    if (!active && !reduceMotion) {
      running = false;
      return;
    }
    if (!reduceMotion && ms - last < 34) {
      frame = requestAnimationFrame(draw);
      return;
    }
    last = ms;
    const { ctx, width, height } = prepareCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    const sky = css('--accent-primary-graphic', 'rgb(45,143,214)');
    const green = css('--research-transport', 'rgb(22,130,58)');
    const violet = css('--research-math', 'rgb(109,40,217)');
    const time = reduceMotion ? 0 : ms * 0.00018;
    const step = Math.max(36, Math.min(54, width / 10));

    ctx.lineCap = 'round';
    for (let y = step * 0.65; y < height; y += step) {
      for (let x = step * 0.65; x < width; x += step) {
        const nx = (x / width) * 2 - 1;
        const ny = (y / height) * 2 - 1;
        const vx = -ny + 0.28 * Math.sin(2 * nx + time);
        const vy = nx + 0.22 * Math.cos(2 * ny - time);
        const mag = Math.hypot(vx, vy) || 1;
        const len = 9 + 7 * Math.min(1, mag);
        drawArrow(ctx, x, y, x + len * vx / mag, y + len * vy / mag, sky, 1, 0.76);
      }
    }

    const curves = [
      { color: sky, a: 3, b: 2, phase: 0 },
      { color: green, a: 2, b: 3, phase: Math.PI / 3 },
      { color: violet, a: 5, b: 4, phase: Math.PI / 5 }
    ];
    curves.forEach((curve, ci) => {
      ctx.save();
      ctx.strokeStyle = curve.color;
      ctx.globalAlpha = 0.72 - ci * 0.12;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i <= 240; i += 1) {
        const s = (i / 240) * Math.PI * 2;
        const x = width * (0.50 + 0.34 * Math.sin(curve.a * s + curve.phase + time));
        const y = height * (0.50 + 0.30 * Math.sin(curve.b * s + time * 0.7));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    });

    if (!reduceMotion && active) {
      running = true;
      frame = requestAnimationFrame(draw);
    } else {
      running = false;
    }
  }

  if (reduceMotion || active) draw(0);
  window.addEventListener('resize', () => {
    if (reduceMotion || active) draw(performance.now());
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      running = false;
    } else if (!reduceMotion && active && !running) {
      running = true;
      frame = requestAnimationFrame(draw);
    }
  });
}

const DERIVATION_STAGES = [
  ['\\mathcal R_{\\mathrm{phys}}', 'Define components, flows, capacities, hazards and measurable states before choosing mathematics.'],
  ['\\mathcal C', 'Specify source, receiver, direction, magnitude, delay, activation condition and evidence for each causal mechanism.'],
  ['(\\mathcal G,\\mathfrak I)', 'Encode physical topology and typed cross-system interfaces without collapsing different mechanisms into generic edges.'],
  ['F_{\\mathcal G}', 'Translate the graph and interface mechanisms into coupled dynamics with explicit state, control, hazard and parameters.'],
  ['\\mathcal V', 'Apply operational and sustainability constraints to identify admissible and viable state trajectories.'],
  ['\\rho_g \\rightarrow u^\\star', 'Measure proximity to critical boundaries only under a defined metric, then test interventions inside the stated validity domain.']
];

function initDerivationConsole() {
  const root = document.querySelector('[data-derivation-console]');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-derivation-index]')];
  const symbol = root.querySelector('[data-derivation-symbol]');
  const copy = root.querySelector('[data-derivation-copy]');
  const section = document.querySelector('#method');
  let activeIndex = -1;

  function setActive(index) {
    const i = Math.max(0, Math.min(DERIVATION_STAGES.length - 1, index));
    if (i === activeIndex) return;
    activeIndex = i;
    buttons.forEach((button, j) => {
      button.classList.toggle('is-active', j === i);
      button.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    });
    if (symbol) symbol.textContent = DERIVATION_STAGES[i][0];
    if (copy) copy.textContent = DERIVATION_STAGES[i][1];
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => setActive(Number(button.dataset.derivationIndex)));
  });
  setActive(0);

  let ticking = false;
  function updateFromScroll() {
    ticking = false;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const viewport = innerHeight || 1;
    const progress = clamp((viewport * 0.72 - rect.top) / (rect.height + viewport * 0.20), 0, 0.999999);
    setActive(Math.floor(progress * DERIVATION_STAGES.length));
  }
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFromScroll);
    }
  }, { passive: true });
  updateFromScroll();
}

function viabilityPolygon(width, height, pad) {
  const x = (p) => pad + p * (width - 2 * pad);
  const y = (m) => height - pad - m * (height - 2 * pad);
  return [
    [x(0.45), y(0.75)],
    [x(0.75), y(0.45)],
    [x(1.00), y(0.45)],
    [x(1.00), y(1.00)],
    [x(0.45), y(1.00)]
  ];
}

function drawPTMechanism(canvas, rows, progress = 1) {
  const { ctx, width, height } = prepareCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const ink = css('--ink', '#0d1117');
  const muted = css('--muted', '#68717d');
  const line = css('--line', '#d5d8dd');
  const power = css('--research-power', 'rgb(200,16,46)');
  const transport = css('--research-transport', 'rgb(22,130,58)');
  const sky = css('--research-accent-graphic', 'rgb(45,143,214)');
  const greenSoft = 'rgba(22,130,58,.08)';

  const split = Math.max(200, width * 0.34);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(split, 18);
  ctx.lineTo(split, height - 18);
  ctx.stroke();

  const final = rows[Math.min(rows.length - 1, Math.max(0, Math.floor((rows.length - 1) * progress)))];
  const leftCenter = split * 0.50;
  const pY = height * 0.32;
  const mY = height * 0.68;
  const nodeR = Math.max(10, Math.min(17, width / 55));

  ctx.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = muted;
  ctx.fillText('PHYSICAL / CAUSAL VIEW', 16, 24);
  ctx.fillStyle = power;
  ctx.fillText('POWER', 18, pY - 28);
  ctx.fillStyle = transport;
  ctx.fillText('TRANSPORT', 18, mY - 28);

  const pNodes = [leftCenter - 62, leftCenter, leftCenter + 62];
  const mNodes = [leftCenter - 62, leftCenter, leftCenter + 62];
  ctx.lineWidth = 2;
  ctx.strokeStyle = power;
  ctx.beginPath();
  ctx.moveTo(pNodes[0], pY);
  ctx.lineTo(pNodes[2], pY);
  ctx.stroke();
  ctx.strokeStyle = transport;
  ctx.beginPath();
  ctx.moveTo(mNodes[0], mY);
  ctx.lineTo(mNodes[2], mY);
  ctx.stroke();
  drawArrow(ctx, leftCenter, pY + nodeR, leftCenter, mY - nodeR, sky, 2.2, 0.95);
  drawArrow(ctx, leftCenter + 11, mY - nodeR, leftCenter + 11, pY + nodeR, sky, 2.2, 0.65);

  pNodes.forEach((x, i) => {
    ctx.globalAlpha = 0.35 + 0.65 * final.power;
    ctx.fillStyle = power;
    ctx.beginPath();
    ctx.arc(x, pY, nodeR * (i === 1 ? 1.08 : 0.82), 0, Math.PI * 2);
    ctx.fill();
  });
  mNodes.forEach((x, i) => {
    ctx.globalAlpha = 0.35 + 0.65 * final.transport;
    ctx.fillStyle = transport;
    ctx.beginPath();
    ctx.arc(x, mY, nodeR * (i === 1 ? 1.08 : 0.82), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = sky;
  ctx.fillText('INTERFACE c', leftCenter + 20, height * 0.50 - 4);
  ctx.fillStyle = muted;
  ctx.fillText('eta(t)', leftCenter - 14, pY - 44);

  const x0 = split + 42;
  const y0 = 30;
  const w = width - split - 62;
  const h = height - 62;
  const sx = (p) => x0 + p * w;
  const sy = (m) => y0 + (1 - m) * h;

  ctx.fillStyle = muted;
  ctx.fillText('STATE SPACE / ADMISSIBILITY', x0, 24);

  const polygon = viabilityPolygon(w, h, 0).map(([px, py]) => [x0 + px, y0 + py]);
  ctx.fillStyle = greenSoft;
  ctx.strokeStyle = transport;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  polygon.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx(0), sy(0));
  ctx.lineTo(sx(1), sy(0));
  ctx.moveTo(sx(0), sy(0));
  ctx.lineTo(sx(0), sy(1));
  ctx.stroke();

  ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = muted;
  ctx.fillText('power service p', sx(0.48), sy(0) + 22);
  ctx.save();
  ctx.translate(sx(0) - 27, sy(0.58));
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('mobility service m', 0, 0);
  ctx.restore();

  const count = Math.max(2, Math.floor(rows.length * progress));
  ctx.strokeStyle = sky;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  for (let i = 0; i < count; i += 1) {
    const row = rows[i];
    const x = sx(row.power);
    const y = sy(row.transport);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const current = rows[Math.min(count - 1, rows.length - 1)];
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(sx(current.power), sy(current.transport), 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = sky;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx(current.power), sy(current.transport), 10, 0, Math.PI * 2);
  ctx.stroke();
}

function initPTMechanism() {
  const canvas = document.querySelector('#ptMechanismCanvas');
  if (!canvas) return;
  const inputs = {
    hazard: document.querySelector('#ptHazard'),
    coupling: document.querySelector('#ptCoupling'),
    control: document.querySelector('#ptControl')
  };
  const outputs = {
    hazard: document.querySelector('#ptHazardValue'),
    coupling: document.querySelector('#ptCouplingValue'),
    control: document.querySelector('#ptControlValue'),
    nadir: document.querySelector('#ptNadir'),
    final: document.querySelector('#ptFinalService'),
    viable: document.querySelector('#ptViableTime'),
    margin: document.querySelector('#ptMargin')
  };
  const button = document.querySelector('#ptRecompute');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rows = [];
  let animation = 0;

  function read() {
    const params = {
      hazard: Number(inputs.hazard?.value ?? PT_DEFAULTS.hazard),
      coupling: Number(inputs.coupling?.value ?? PT_DEFAULTS.coupling),
      control: Number(inputs.control?.value ?? PT_DEFAULTS.control)
    };
    if (outputs.hazard) outputs.hazard.textContent = params.hazard.toFixed(2);
    if (outputs.coupling) outputs.coupling.textContent = params.coupling.toFixed(2);
    if (outputs.control) outputs.control.textContent = params.control.toFixed(2);
    return params;
  }

  function updateMetrics(summary) {
    if (outputs.nadir) outputs.nadir.textContent = summary.nadir.toFixed(3);
    if (outputs.final) outputs.final.textContent = summary.finalService.toFixed(3);
    if (outputs.viable) outputs.viable.textContent = (100 * summary.viableFraction).toFixed(1) + '%';
    if (outputs.margin) outputs.margin.textContent = summary.minMargin.toFixed(3);
  }

  function recompute(animate = true) {
    if (animation) cancelAnimationFrame(animation);
    rows = simulatePT(read());
    updateMetrics(summarizePT(rows));
    if (reduceMotion || !animate) {
      drawPTMechanism(canvas, rows, 1);
      return;
    }
    const start = performance.now();
    function frame(now) {
      const q = clamp((now - start) / 1050, 0, 1);
      const eased = 1 - (1 - q) ** 3;
      drawPTMechanism(canvas, rows, eased);
      if (q < 1) animation = requestAnimationFrame(frame);
    }
    animation = requestAnimationFrame(frame);
  }

  Object.values(inputs).forEach((input) => input?.addEventListener('input', () => recompute(false)));
  button?.addEventListener('click', () => recompute(true));
  addEventListener('resize', () => drawPTMechanism(canvas, rows, 1), { passive: true });
  recompute(false);
}

function drawMathCard(canvas, kind, time = 0) {
  const { ctx, width, height } = prepareCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const sky = css('--accent-primary-graphic', 'rgb(45,143,214)');
  const green = css('--research-transport', 'rgb(22,130,58)');
  const violet = css('--research-math', 'rgb(109,40,217)');
  const blue = css('--research-information', 'rgb(29,78,216)');
  const line = css('--line', '#d5d8dd');
  ctx.lineWidth = 1.25;

  if (kind === 'geometry') {
    ctx.strokeStyle = violet;
    for (let j = 0; j < 7; j += 1) {
      ctx.beginPath();
      for (let i = 0; i <= 100; i += 1) {
        const u = i / 100 * Math.PI * 2;
        const x = width * (0.50 + 0.39 * Math.cos(u));
        const y = height * (0.52 + 0.15 * Math.sin(u) + 0.035 * Math.sin(3 * u + time + j * .3) + (j - 3) * .035);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (kind === 'graph') {
    const pts = [[.16,.62],[.33,.28],[.50,.54],[.69,.24],[.84,.62],[.54,.82]];
    const edges = [[0,1],[1,2],[2,3],[3,4],[2,5],[0,2],[2,4]];
    edges.forEach(([a,b],i) => drawArrow(ctx, pts[a][0]*width,pts[a][1]*height,pts[b][0]*width,pts[b][1]*height,i%3===0?sky:line,1.2,.9));
    pts.forEach(([x,y],i) => { ctx.fillStyle = i===2?sky:blue; ctx.beginPath(); ctx.arc(x*width,y*height,4.2+(i===2?1.5:0),0,Math.PI*2); ctx.fill(); });
  } else if (kind === 'dynamics') {
    ctx.strokeStyle = green;
    ctx.beginPath();
    for (let i=0;i<180;i+=1){
      const s=i/179*7*Math.PI;
      const r=(.42-.0018*i)*Math.min(width,height);
      const x=width*.50+r*Math.cos(s+time)*.75;
      const y=height*.50+r*Math.sin(s+time)*.42;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  } else if (kind === 'analysis') {
    ctx.strokeStyle = line;
    ctx.beginPath(); ctx.moveTo(8,height*.68);ctx.lineTo(width-8,height*.68);ctx.stroke();
    ctx.strokeStyle = sky;
    ctx.beginPath();
    for(let i=0;i<=120;i+=1){
      const x=i/120*width;
      const q=(i/120*4-2);
      const y=height*(.60-.24*Math.tanh(q)+.055*Math.sin(3*q+time));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  } else if (kind === 'uncertainty') {
    const mid=height*.52;
    for(let band=3;band>=1;band-=1){
      ctx.fillStyle = 'rgba(45,143,214,' + (0.04 + band * .025) + ')';
      ctx.beginPath();
      for(let i=0;i<=80;i+=1){
        const x=i/80*width;
        const y=mid+Math.sin(i*.12+time)*7-band*(5+3*Math.sin(i*.07));
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      for(let i=80;i>=0;i-=1){
        const x=i/80*width;
        const y=mid+Math.sin(i*.12+time)*7+band*(5+3*Math.sin(i*.07));
        ctx.lineTo(x,y);
      }
      ctx.closePath();ctx.fill();
    }
    ctx.strokeStyle=blue;ctx.beginPath();
    for(let i=0;i<=80;i+=1){const x=i/80*width;const y=mid+Math.sin(i*.12+time)*7;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
  } else if (kind === 'optimization') {
    const poly=[[.18,.76],[.35,.34],[.67,.24],[.84,.54],[.72,.78]];
    ctx.fillStyle='rgba(22,130,58,.09)';ctx.strokeStyle=green;ctx.beginPath();
    poly.forEach(([x,y],i)=>i?ctx.lineTo(x*width,y*height):ctx.moveTo(x*width,y*height));ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=violet;
    for(let r=.12;r<=.36;r+=.08){ctx.beginPath();ctx.ellipse(width*.62,height*.48,width*r,height*r*.52,-.35,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle=sky;ctx.beginPath();ctx.arc(width*.56,height*.49,5,0,Math.PI*2);ctx.fill();
  }
}

function initMathCardArt() {
  const canvases = [...document.querySelectorAll('.math-card-art')];
  if (!canvases.length) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visible = new Set();
  let last = 0;

  canvases.forEach((canvas) => drawMathCard(canvas, canvas.dataset.mathArt, 0));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
    }, { threshold:0.02 });
    canvases.forEach((canvas) => observer.observe(canvas));
  } else {
    canvases.forEach((canvas) => visible.add(canvas));
  }

  function frame(ms = 0) {
    if (!reduceMotion && !document.hidden && ms - last > 80) {
      const time = ms * .00045;
      visible.forEach((canvas) => drawMathCard(canvas, canvas.dataset.mathArt, time));
      last = ms;
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  if (!reduceMotion) requestAnimationFrame(frame);
  addEventListener('resize', () => canvases.forEach((canvas) => drawMathCard(canvas, canvas.dataset.mathArt, 0)), { passive:true });
}

function drawViabilityGeometry(canvas, power, transport, psi) {
  const { ctx, width, height } = prepareCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const line = css('--line', '#d5d8dd');
  const muted = css('--muted', '#68717d');
  const sky = css('--research-accent-graphic', 'rgb(45,143,214)');
  const green = css('--research-transport', 'rgb(22,130,58)');
  const violet = css('--research-math', 'rgb(109,40,217)');
  const ink = css('--text', css('--ink', '#0d1117'));
  const pad = Math.max(44, Math.min(70, width * .08));
  const sx = (p) => pad + p * (width - 2 * pad);
  const sy = (m) => height - pad - m * (height - 2 * pad);

  const polygon = viabilityPolygon(width, height, pad);
  ctx.fillStyle='rgba(22,130,58,.08)';
  ctx.strokeStyle=green;
  ctx.lineWidth=1.6;
  ctx.beginPath();
  polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();ctx.fill();ctx.stroke();

  ctx.strokeStyle=line;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(sx(0),sy(0));ctx.lineTo(sx(1),sy(0));ctx.moveTo(sx(0),sy(0));ctx.lineTo(sx(0),sy(1));ctx.stroke();

  ctx.font='12px ui-sans-serif,system-ui,sans-serif';ctx.fillStyle=muted;
  ctx.fillText('p · power service',sx(.43),sy(0)+28);
  ctx.save();ctx.translate(sx(0)-30,sy(.62));ctx.rotate(-Math.PI/2);ctx.fillText('m · mobility service',0,0);ctx.restore();
  ctx.fillText('Ksvc',sx(.83),sy(.84));

  const metricRadius=.13;
  const rx=metricRadius*(width-2*pad);
  const ry=(metricRadius/psi)*(height-2*pad);
  ctx.save();
  ctx.strokeStyle=violet;
  ctx.setLineDash([6,5]);
  ctx.lineWidth=1.8;
  ctx.beginPath();ctx.ellipse(sx(power),sy(transport),Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);ctx.stroke();
  ctx.restore();

  const dPower = power - PT_LIMITS.powerMin;
  const dTransport = psi*(transport - PT_LIMITS.transportMin);
  const dService = (power+transport-2*PT_LIMITS.serviceMin)/Math.sqrt(1+1/(psi*psi));
  const choices=[['p',dPower],['m',dTransport],['s',dService]].sort((a,b)=>a[1]-b[1]);
  let tx=power,ty=transport;
  if(choices[0][0]==='p') tx=PT_LIMITS.powerMin;
  else if(choices[0][0]==='m') ty=PT_LIMITS.transportMin;
  else {
    const delta=(power+transport-1.2)/(1+1/(psi*psi));
    tx=power-delta;
    ty=transport-delta/(psi*psi);
  }
  drawArrow(ctx,sx(power),sy(transport),sx(tx),sy(ty),sky,2.2,.95);

  ctx.fillStyle=ink;ctx.beginPath();ctx.arc(sx(power),sy(transport),6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=sky;ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx(power),sy(transport),11,0,Math.PI*2);ctx.stroke();
}

function initViabilityGeometry() {
  const canvas=document.querySelector('#viabilityGeometryCanvas');
  if(!canvas)return;
  const pInput=document.querySelector('#geometryPower');
  const mInput=document.querySelector('#geometryTransport');
  const psiInput=document.querySelector('#geometryPsi');
  const pOut=document.querySelector('#geometryPowerValue');
  const mOut=document.querySelector('#geometryTransportValue');
  const psiOut=document.querySelector('#geometryPsiValue');
  const rhoE=document.querySelector('#geometryRhoE');
  const rhoG=document.querySelector('#geometryRhoG');
  const serviceOut=document.querySelector('#geometryService');
  const statusOut=document.querySelector('#geometryStatus');

  function values(){
    return {
      power:Number(pInput?.value??.78),
      transport:Number(mInput?.value??.72),
      psi:Number(psiInput?.value??1.35)
    };
  }
  function update(){
    const v=values();
    if(pOut)pOut.textContent=v.power.toFixed(2);
    if(mOut)mOut.textContent=v.transport.toFixed(2);
    if(psiOut)psiOut.textContent=v.psi.toFixed(2);
    const e=Math.max(0,signedViabilityMargin(v.power,v.transport,1));
    const g=Math.max(0,signedViabilityMargin(v.power,v.transport,v.psi));
    const service=.5*(v.power+v.transport);
    if(rhoE)rhoE.textContent=e.toFixed(3);
    if(rhoG)rhoG.textContent=g.toFixed(3);
    if(serviceOut)serviceOut.textContent=service.toFixed(3);
    if(statusOut){
      const inside=signedViabilityMargin(v.power,v.transport,v.psi)>0;
      statusOut.textContent=inside?'inside Ksvc':'outside Ksvc';
    }
    drawViabilityGeometry(canvas,v.power,v.transport,v.psi);
  }
  [pInput,mInput,psiInput].forEach(input=>input?.addEventListener('input',update));

  let dragging=false;
  function setFromPointer(event){
    const rect=canvas.getBoundingClientRect();
    const pad=Math.max(44,Math.min(70,rect.width*.08));
    const x=clamp((event.clientX-rect.left-pad)/(rect.width-2*pad));
    const y=clamp(1-(event.clientY-rect.top-pad)/(rect.height-2*pad));
    if(pInput)pInput.value=x.toFixed(2);
    if(mInput)mInput.value=y.toFixed(2);
    update();
  }
  canvas.addEventListener('pointerdown',(event)=>{dragging=true;canvas.setPointerCapture(event.pointerId);setFromPointer(event);});
  canvas.addEventListener('pointermove',(event)=>{if(dragging)setFromPointer(event);});
  canvas.addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;});
  addEventListener('resize',update,{passive:true});
  update();
}

function initReveal() {
  const elements=[...document.querySelectorAll('.problem-card,.focus-main,.focus-side,.research-scope-note,.math-card,.work-card,.mechanism-explorer,.geometry-visual,.geometry-controls')];
  elements.forEach(el=>el.setAttribute('data-reveal',''));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)){
    elements.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  elements.forEach(el=>observer.observe(el));
}

export function initResearchDynamics() {
  initHeroMathField();
  initDerivationConsole();
  initPTMechanism();
  initMathCardArt();
  initViabilityGeometry();
  initReveal();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResearchDynamics, { once:true });
  } else {
    initResearchDynamics();
  }
}
