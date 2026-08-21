import {
  SECTORS,
  BASE,
  simulate,
  summarize,
  monteCarlo,
  mulberry32,
  normal01,
  interpolateService,
  estimateHazardScale
} from './model.js';

const d3 = window.d3;
const SVG_NS = 'http://www.w3.org/2000/svg';

const $ = (selector) => document.querySelector(selector);
const fmt = (x, digits = 3) => Number(x).toFixed(digits);
const pct = (x, digits = 1) => `${(100 * x).toFixed(digits)}%`;

const state = {
  params: {
    horizon: 24,
    hazardScale: 1,
    couplingScale: 1,
    recoveryScale: 1,
    controlScale: 0.30,
    serviceFloor: 0.65
  },
  rows: [],
  summary: null,
  mc: null
};

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function readControls() {
  state.params.hazardScale = Number($('#hazardScale').value);
  state.params.couplingScale = Number($('#couplingScale').value);
  state.params.controlScale = Number($('#controlScale').value);
  state.params.horizon = Number($('#horizon').value);
  setText('hazardValue', fmt(state.params.hazardScale, 2));
  setText('couplingValue', fmt(state.params.couplingScale, 2));
  setText('controlValue', fmt(state.params.controlScale, 2));
  setText('horizonValue', `${state.params.horizon} h`);
}

function runSimulation() {
  readControls();
  state.rows = simulate(state.params);
  state.summary = summarize(state.rows, state.params);
  renderMetrics();
  if (!d3) return;
  renderTrajectory();
  renderPhasePortrait();
}

function renderMetrics() {
  setText('metricNadir', fmt(state.summary.nadir, 3));
  setText('metricResilience', fmt(state.summary.resilienceIndex, 3));
  setText('metricViability', `${fmt(state.summary.viableDuration, 2)} h · ${pct(state.summary.viableFraction)}`);
  setText('metricViolation', `${fmt(state.summary.serviceViolationDuration, 2)} h · ${pct(state.summary.serviceViolationFraction)}`);
}

function clearSvg(selector) {
  d3.select(selector).selectAll('*').remove();
}

function renderTrajectory() {
  const svg = d3.select('#trajectoryChart');
  clearSvg('#trajectoryChart');
  const width = 900;
  const height = 390;
  const m = { top: 26, right: 28, bottom: 46, left: 56 };
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const x = d3.scaleLinear().domain([0, state.params.horizon]).range([m.left, width - m.right]);
  const y = d3.scaleLinear().domain([0, 1]).range([height - m.bottom, m.top]);

  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height - m.bottom})`)
    .call(d3.axisBottom(x).ticks(8).tickSize(-(height - m.top - m.bottom)).tickFormat(''));
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${m.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(width - m.left - m.right)).tickFormat(''));

  svg.append('g').attr('transform', `translate(0,${height - m.bottom})`).call(d3.axisBottom(x));
  svg.append('g').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y));

  svg.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height - 8).attr('text-anchor', 'middle').text('Time (h)');
  svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', 18).attr('text-anchor', 'middle').text('Normalized service state');

  const line = d3.line().x((d) => x(d.t)).y((d) => y(d.value)).curve(d3.curveMonotoneX);
  const series = SECTORS.map((name, i) => ({ name, values: state.rows.map((d) => ({ t: d.t, value: d.x[i] })) }));
  series.push({ name: 'Composite service', values: state.rows.map((d) => ({ t: d.t, value: d.service })) });

  series.forEach((s, i) => {
    svg.append('path')
      .datum(s.values)
      .attr('class', `series-path series-${i}`)
      .attr('d', line);
  });

  svg.append('line')
    .attr('class', 'threshold-line')
    .attr('x1', m.left)
    .attr('x2', width - m.right)
    .attr('y1', y(state.params.serviceFloor))
    .attr('y2', y(state.params.serviceFloor));
  svg.append('text')
    .attr('class', 'threshold-label')
    .attr('x', width - m.right - 4)
    .attr('y', y(state.params.serviceFloor) - 7)
    .attr('text-anchor', 'end')
    .text(`service floor = ${state.params.serviceFloor}`);

  const legend = svg.append('g').attr('transform', `translate(${m.left + 8},${m.top + 4})`);
  series.forEach((s, i) => {
    const item = legend.append('g').attr('transform', `translate(${i * 142},0)`);
    item.append('line').attr('class', `series-path series-${i}`).attr('x1', 0).attr('x2', 22).attr('y1', 0).attr('y2', 0);
    item.append('text').attr('x', 28).attr('y', 4).attr('class', 'legend-label').text(s.name);
  });
}

function renderPhasePortrait() {
  const svg = d3.select('#phasePortrait');
  clearSvg('#phasePortrait');
  const width = 480;
  const height = 390;
  const m = { top: 28, right: 24, bottom: 48, left: 58 };
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  const x = d3.scaleLinear().domain([0, 1]).range([m.left, width - m.right]);
  const y = d3.scaleLinear().domain([0, 1]).range([height - m.bottom, m.top]);
  svg.append('g').attr('transform', `translate(0,${height - m.bottom})`).call(d3.axisBottom(x).ticks(5));
  svg.append('g').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5));
  svg.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height - 8).attr('text-anchor', 'middle').text('Power state');
  svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', 18).attr('text-anchor', 'middle').text('Water state');

  svg.append('rect')
    .attr('class', 'viability-region')
    .attr('x', x(BASE.viabilityThresholds[0]))
    .attr('y', y(1))
    .attr('width', x(1) - x(BASE.viabilityThresholds[0]))
    .attr('height', y(BASE.viabilityThresholds[1]) - y(1));

  const line = d3.line().x((d) => x(d.x[0])).y((d) => y(d.x[1])).curve(d3.curveCatmullRom.alpha(0.4));
  svg.append('path').datum(state.rows).attr('class', 'phase-path').attr('d', line);
  const first = state.rows[0];
  const last = state.rows.at(-1);
  svg.append('circle').attr('class', 'phase-start').attr('cx', x(first.x[0])).attr('cy', y(first.x[1])).attr('r', 5);
  svg.append('circle').attr('class', 'phase-end').attr('cx', x(last.x[0])).attr('cy', y(last.x[1])).attr('r', 5);
  svg.append('text').attr('class', 'chart-note').attr('x', x(BASE.viabilityThresholds[0]) + 8).attr('y', y(0.95)).text('projected viability region');
}

const mathFamilies = [
  { id: 'foundations', name: 'Foundations', group: 'pure', topics: ['Logic', 'Set theory', 'Category theory', 'Proof theory'] },
  { id: 'algebra', name: 'Algebra', group: 'pure', topics: ['Linear algebra', 'Abstract algebra', 'Tensor algebra', 'Operator algebras'] },
  { id: 'analysis', name: 'Analysis', group: 'pure', topics: ['Real analysis', 'Functional analysis', 'Harmonic analysis', 'Convex analysis'] },
  { id: 'geometry', name: 'Geometry & topology', group: 'pure', topics: ['Differential geometry', 'Topology', 'Geometric measure theory', 'Persistent homology'] },
  { id: 'probability', name: 'Probability & stochastic processes', group: 'applied', topics: ['Markov processes', 'SDEs', 'Extreme values', 'Rare events'] },
  { id: 'discrete', name: 'Discrete mathematics', group: 'applied', topics: ['Graph theory', 'Combinatorics', 'Spectral graph theory', 'Percolation'] },
  { id: 'pde', name: 'Differential equations', group: 'applied', topics: ['ODEs', 'PDEs', 'Hybrid systems', 'Conservation laws'] },
  { id: 'inverse', name: 'Inverse problems & inference', group: 'applied', topics: ['Identifiability', 'Bayesian inversion', 'Filtering', 'Data assimilation'] },
  { id: 'optimization', name: 'Optimization & control', group: 'applied', topics: ['Convex optimization', 'Optimal control', 'MPC', 'Viability & reachability'] },
  { id: 'numerics', name: 'Numerical mathematics', group: 'computational', topics: ['Finite elements', 'Finite volumes', 'Spectral methods', 'Structure preservation'] },
  { id: 'uq', name: 'Uncertainty quantification', group: 'computational', topics: ['Monte Carlo', 'Polynomial chaos', 'Sensitivity', 'Reliability'] },
  { id: 'networks', name: 'Network science', group: 'computational', topics: ['Multilayer networks', 'Temporal networks', 'Cascades', 'Interdependencies'] },
  { id: 'sciml', name: 'Scientific machine learning', group: 'frontier', topics: ['PINNs', 'Neural operators', 'Operator learning', 'Physics-guided learning'] },
  { id: 'decision', name: 'Decision mathematics', group: 'applied', topics: ['Multi-objective methods', 'Robust decisions', 'Game theory', 'Equity constraints'] },
  { id: 'finance', name: 'Mathematical finance', group: 'applied', topics: ['Stochastic calculus', 'Risk measures', 'Term structures', 'Real options'] }
];

const mathLinks = [
  ['foundations', 'algebra'], ['foundations', 'analysis'], ['algebra', 'numerics'], ['analysis', 'pde'],
  ['geometry', 'pde'], ['probability', 'uq'], ['probability', 'inverse'], ['discrete', 'networks'],
  ['pde', 'numerics'], ['pde', 'optimization'], ['inverse', 'uq'], ['inverse', 'sciml'],
  ['optimization', 'decision'], ['optimization', 'finance'], ['numerics', 'sciml'], ['uq', 'decision'],
  ['networks', 'optimization'], ['networks', 'uq'], ['sciml', 'inverse'], ['finance', 'probability']
].map(([source, target]) => ({ source, target }));

function activateAtlasNode(event, d) {
  setText('atlasTitle', d.name);
  const list = $('#atlasTopics');
  list.innerHTML = '';
  d.topics.forEach((topic) => {
    const li = document.createElement('li');
    li.textContent = topic;
    list.append(li);
  });
  document.querySelectorAll('.atlas-node').forEach((n) => n.classList.remove('is-active'));
  d3.select(event.currentTarget).classed('is-active', true);
}

function renderMathAtlas() {
  const svg = d3.select('#mathAtlas');
  clearSvg('#mathAtlas');
  const width = 980;
  const height = 620;
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const nodes = mathFamilies.map((d) => ({ ...d }));
  const links = mathLinks.map((d) => ({ ...d }));
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(115).strength(0.35))
    .force('charge', d3.forceManyBody().strength(-420))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(64));

  const link = svg.append('g').attr('class', 'atlas-links').selectAll('line').data(links).join('line');
  const node = svg.append('g').attr('class', 'atlas-nodes').selectAll('g').data(nodes).join('g')
    .attr('class', (d) => `atlas-node atlas-${d.group}`)
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr('aria-label', (d) => `${d.name}. Select to inspect related topics.`);
  node.append('circle').attr('r', 42);
  node.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').each(function wrap(d) {
    const words = d.name.split(/\s+/);
    const el = d3.select(this);
    if (words.length <= 2) return el.text(d.name);
    el.text(null);
    const half = Math.ceil(words.length / 2);
    el.append('tspan').attr('x', 0).attr('dy', '-0.25em').text(words.slice(0, half).join(' '));
    el.append('tspan').attr('x', 0).attr('dy', '1.15em').text(words.slice(half).join(' '));
  });

  node.on('click', activateAtlasNode)
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateAtlasNode(event, d);
      }
    })
    .on('focus', (event, d) => activateAtlasNode(event, d));

  simulation.on('tick', () => {
    nodes.forEach((d) => {
      d.x = Math.max(54, Math.min(width - 54, d.x));
      d.y = Math.max(54, Math.min(height - 54, d.y));
    });
    link.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y);
    node.attr('transform', (d) => `translate(${d.x},${d.y})`);
  });
}

function runUQ() {
  readControls();
  const button = $('#runUq');
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Running 400 scenarios…';
  setTimeout(() => {
    try {
      state.mc = monteCarlo(state.params, 400, 20260821);
      setText('uqFailure', pct(state.mc.pFailure));
      setText('uqQ05', fmt(state.mc.q05, 3));
      setText('uqMedian', fmt(state.mc.q50, 3));
      setText('uqQ95', fmt(state.mc.q95, 3));
      if (d3) renderHistogram(state.mc.outputs.map((d) => d.nadir));
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = 'Run uncertainty experiment';
    }
  }, 30);
}

function renderHistogram(values) {
  const svg = d3.select('#uqChart');
  clearSvg('#uqChart');
  const width = 780;
  const height = 330;
  const m = { top: 24, right: 20, bottom: 44, left: 52 };
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  const extent = d3.extent(values);
  if (extent[0] === extent[1]) {
    extent[0] = Math.max(0, extent[0] - 0.01);
    extent[1] = Math.min(1, extent[1] + 0.01);
  }
  const x = d3.scaleLinear().domain(extent).nice().range([m.left, width - m.right]);
  const bins = d3.bin().domain(x.domain()).thresholds(24)(values);
  const y = d3.scaleLinear().domain([0, d3.max(bins, (d) => d.length) || 1]).nice().range([height - m.bottom, m.top]);
  svg.append('g').attr('transform', `translate(0,${height - m.bottom})`).call(d3.axisBottom(x));
  svg.append('g').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5));
  svg.append('g').selectAll('rect').data(bins).join('rect')
    .attr('class', 'hist-bar')
    .attr('x', (d) => x(d.x0) + 1)
    .attr('width', (d) => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr('y', (d) => y(d.length))
    .attr('height', (d) => y(0) - y(d.length));
  svg.append('line').attr('class', 'threshold-line').attr('x1', x(state.params.serviceFloor)).attr('x2', x(state.params.serviceFloor)).attr('y1', m.top).attr('y2', height - m.bottom);
  svg.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height - 7).attr('text-anchor', 'middle').text('Minimum composite service');
  svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', 16).attr('text-anchor', 'middle').text('Scenario count');
}

function runInverseProblem() {
  readControls();
  const truth = 1.28;
  const truthRows = simulate({ ...state.params, hazardScale: truth });
  const rng = mulberry32(314159);
  const times = [2.5, 4, 5.5, 7, 9, 12, 16, 21].filter((t) => t <= state.params.horizon);
  const observations = times.map((t) => ({ t, y: Math.max(0, Math.min(1, interpolateService(truthRows, t) + 0.006 * normal01(rng))) }));
  if (!observations.length) return;
  const result = estimateHazardScale(observations, state.params);
  setText('inverseTruth', fmt(truth, 2));
  setText('inverseEstimate', fmt(result.best.alpha, 2));
  setText('inverseSSE', result.best.sse.toExponential(2));
  setText('observationCount', observations.length);
  if (d3) renderInverseChart(result.curve, result.best.alpha);
}

function renderInverseChart(curve, bestAlpha) {
  const svg = d3.select('#inverseChart');
  clearSvg('#inverseChart');
  const width = 820;
  const height = 330;
  const m = { top: 24, right: 24, bottom: 46, left: 62 };
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  const x = d3.scaleLinear().domain(d3.extent(curve, (d) => d.alpha)).range([m.left, width - m.right]);
  const minSse = Math.max(1e-12, d3.min(curve, (d) => d.sse));
  const maxSse = Math.max(minSse * 1.000001, d3.max(curve, (d) => d.sse));
  const y = d3.scaleLog().domain([minSse, maxSse]).nice().range([height - m.bottom, m.top]);
  const line = d3.line().x((d) => x(d.alpha)).y((d) => y(Math.max(minSse, d.sse))).curve(d3.curveMonotoneX);
  svg.append('g').attr('transform', `translate(0,${height - m.bottom})`).call(d3.axisBottom(x));
  svg.append('g').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5, '~g'));
  svg.append('path').datum(curve).attr('class', 'inverse-path').attr('d', line);
  svg.append('line').attr('class', 'best-line').attr('x1', x(bestAlpha)).attr('x2', x(bestAlpha)).attr('y1', m.top).attr('y2', height - m.bottom);
  svg.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height - 7).attr('text-anchor', 'middle').text('Hazard multiplier α');
  svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', 18).attr('text-anchor', 'middle').text('Sum of squared residuals');
}

function setWebGLFallback(canvas, message) {
  canvas.classList.add('webgl-fallback');
  canvas.setAttribute('aria-label', `Static mathematical background. ${message}`);
  canvas.style.background = 'radial-gradient(circle at 70% 45%, rgba(78,201,176,.18), rgba(7,17,31,.98) 62%)';
}

function initWebGL() {
  const canvas = $('#phaseCanvas');
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
  if (!gl) {
    setWebGLFallback(canvas, 'WebGL is unavailable in this browser.');
    return;
  }
  const vertex = `
    attribute vec2 p;
    void main(){gl_Position=vec4(p,0.0,1.0);}
  `;
  const fragment = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    float field(vec2 z){
      float r=length(z);
      float a=atan(z.y,z.x);
      float wells=0.52*exp(-4.0*length(z-vec2(-0.42,0.20)))+0.48*exp(-5.0*length(z-vec2(0.36,-0.28)));
      float wave=0.16*sin(7.0*r-0.55*time)+0.11*cos(4.0*a+0.22*time);
      return 0.62-r+wells+wave;
    }
    void main(){
      vec2 uv=(2.0*gl_FragCoord.xy-resolution.xy)/min(resolution.x,resolution.y);
      float f=field(uv);
      float contour=1.0-smoothstep(0.0,0.035,abs(fract(f*9.0)-0.5));
      float viable=smoothstep(-0.03,0.15,f);
      vec3 dark=vec3(0.018,0.035,0.060);
      vec3 mid=vec3(0.055,0.205,0.285);
      vec3 light=vec3(0.20,0.72,0.66);
      vec3 color=mix(dark,mid,viable);
      color=mix(color,light,0.18*contour);
      gl_FragColor=vec4(color,0.92);
    }
  `;

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error';
      gl.deleteShader(shader);
      throw new Error(info);
    }
    return shader;
  };

  try {
    const vertexShader = compile(gl.VERTEX_SHADER, vertex);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Unknown WebGL link error');
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const resLoc = gl.getUniformLocation(program, 'resolution');
    const timeLoc = gl.getUniformLocation(program, 'time');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * ratio));
      const h = Math.max(1, Math.floor(rect.height * ratio));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    function draw(ms) {
      resize();
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, reduceMotion ? 0 : ms * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  } catch (error) {
    console.error('WebGL initialization failed:', error);
    setWebGLFallback(canvas, 'WebGL shader initialization failed.');
  }
}

function showD3Fallback() {
  const ids = ['mathAtlas', 'trajectoryChart', 'phasePortrait', 'inverseChart', 'uqChart'];
  ids.forEach((id) => {
    const svg = document.getElementById(id);
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 700 120');
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', '20');
    text.setAttribute('y', '62');
    text.setAttribute('fill', 'currentColor');
    text.textContent = 'Interactive visualization unavailable: D3 dependency did not load.';
    svg.replaceChildren(text);
  });
}

function bindControls() {
  ['hazardScale', 'couplingScale', 'controlScale', 'horizon'].forEach((id) => {
    document.getElementById(id).addEventListener('input', readControls);
  });
  $('#runSimulation').addEventListener('click', runSimulation);
  $('#runUq').addEventListener('click', runUQ);
  $('#runInverse').addEventListener('click', runInverseProblem);
}

function init() {
  bindControls();
  readControls();
  if ($('#runInverse')) $('#runInverse').textContent = 'Run seeded inverse experiment';
  runSimulation();
  runInverseProblem();
  if (d3) renderMathAtlas();
  else showD3Fallback();
  initWebGL();
  setText('buildStamp', 'Research build · production-audited 21 Aug 2026');
}

init();
