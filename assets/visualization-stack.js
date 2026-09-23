import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js";
import {
  INITIAL_RESEARCH_STATE,
  ResearchStateStore,
  metricConstraintMargins,
  clamp01
} from "./research-state.js";

const root = document.querySelector("[data-visualization-stack]");

if (root) {
  const store = new ResearchStateStore(INITIAL_RESEARCH_STATE);
  const d3 = window.d3;

  const power = document.getElementById("stackPower");
  const transport = document.getElementById("stackTransport");
  const psi = document.getElementById("stackPsi");
  const powerValue = document.getElementById("stackPowerValue");
  const transportValue = document.getElementById("stackTransportValue");
  const psiValue = document.getElementById("stackPsiValue");
  const marginValue = document.getElementById("stackMargin");
  const constraintValue = document.getElementById("stackConstraint");
  const serviceValue = document.getElementById("stackService");
  const classValue = document.getElementById("stackClass");
  const loadGeoGebra = document.getElementById("loadGeoGebra");
  const geogebraHost = document.getElementById("geogebraExact");

  const parseControl = (el) => Number.parseFloat(el.value);
  const syncFromControls = () => store.update({
    p: parseControl(power),
    m: parseControl(transport),
    psi: parseControl(psi)
  }, "controls");

  [power, transport, psi].forEach((control) => control && control.addEventListener("input", syncFromControls));

  function renderReadout(state) {
    const result = metricConstraintMargins(state);
    power.value = state.p.toFixed(2);
    transport.value = state.m.toFixed(2);
    psi.value = state.psi.toFixed(2);
    powerValue.textContent = state.p.toFixed(2);
    transportValue.textContent = state.m.toFixed(2);
    psiValue.textContent = state.psi.toFixed(2);
    marginValue.textContent = result.signedMetricMargin.toFixed(3);
    constraintValue.textContent = result.activeConstraint;
    serviceValue.textContent = result.service.toFixed(3);
    classValue.textContent = result.admissible ? "inside K_svc" : "outside K_svc";
    classValue.dataset.state = result.admissible ? "viable" : "outside";
  }

  function mountD3() {
    if (!d3) return () => {};
    const svg = d3.select("#stackStateSpace");
    const width = 620;
    const height = 420;
    const chartMargin = { top: 24, right: 24, bottom: 52, left: 60 };
    const x = d3.scaleLinear().domain([0.35, 1.0]).range([chartMargin.left, width - chartMargin.right]);
    const y = d3.scaleLinear().domain([0.35, 1.0]).range([height - chartMargin.bottom, chartMargin.top]);

    svg.attr("viewBox", "0 0 " + width + " " + height);
    svg.selectAll("*").remove();

    const plot = svg.append("g").attr("class", "stack-d3-plot");
    const region = [
      [0.45, 0.75],
      [0.45, 1.00],
      [1.00, 1.00],
      [1.00, 0.45],
      [0.75, 0.45]
    ];

    plot.append("path")
      .attr("class", "stack-admissible-region")
      .attr("d", d3.line().x((d) => x(d[0])).y((d) => y(d[1])).curve(d3.curveLinearClosed)(region));

    const boundaries = [
      [[0.45, 0.35], [0.45, 1.0], "p = 0.45"],
      [[0.35, 0.45], [1.0, 0.45], "m = 0.45"],
      [[0.45, 0.75], [0.75, 0.45], "p + m = 1.20"]
    ];

    for (const [a, b, label] of boundaries) {
      plot.append("line")
        .attr("class", "stack-boundary-line")
        .attr("x1", x(a[0])).attr("y1", y(a[1]))
        .attr("x2", x(b[0])).attr("y2", y(b[1]));
      plot.append("text")
        .attr("class", "stack-boundary-label")
        .attr("x", 0.5 * (x(a[0]) + x(b[0])) + 8)
        .attr("y", 0.5 * (y(a[1]) + y(b[1])) - 8)
        .text(label);
    }

    plot.append("g")
      .attr("transform", "translate(0," + (height - chartMargin.bottom) + ")")
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .attr("class", "stack-axis");

    plot.append("g")
      .attr("transform", "translate(" + chartMargin.left + ",0)")
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
      .attr("class", "stack-axis");

    plot.append("text").attr("class", "stack-axis-title").attr("x", width / 2).attr("y", height - 10).attr("text-anchor", "middle").text("power state p");
    plot.append("text").attr("class", "stack-axis-title").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", 16).attr("text-anchor", "middle").text("mobility state m");

    const metricBall = plot.append("ellipse").attr("class", "stack-metric-ball");
    const statePoint = plot.append("circle").attr("class", "stack-state-point").attr("r", 7);
    const stateLabel = plot.append("text").attr("class", "stack-state-label");

    statePoint.call(d3.drag().on("drag", (event) => {
      const p = clamp01(x.invert(event.x));
      const m = clamp01(y.invert(event.y));
      store.update({
        p: Math.min(1, Math.max(0.35, p)),
        m: Math.min(1, Math.max(0.35, m))
      }, "d3-drag");
    }));

    return (state) => {
      const radius = 0.065;
      metricBall
        .attr("cx", x(state.p))
        .attr("cy", y(state.m))
        .attr("rx", Math.abs(x(state.p + radius) - x(state.p)))
        .attr("ry", Math.abs(y(state.m + radius / state.psi) - y(state.m)));
      statePoint.attr("cx", x(state.p)).attr("cy", y(state.m));
      stateLabel
        .attr("x", x(state.p) + 12)
        .attr("y", y(state.m) - 12)
        .text("Y=(" + state.p.toFixed(2) + ", " + state.m.toFixed(2) + ")");
    };
  }

  function mountWebGL() {
    const canvas = document.getElementById("stackWebGL");
    const status = document.getElementById("stackWebGLStatus");
    if (!canvas) return () => {};

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (error) {
      status.textContent = "WebGL unavailable — SVG/D3 view remains authoritative.";
      canvas.hidden = true;
      return () => {};
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    let yaw = -0.55;
    let pitch = 0.72;
    const distance = 4.5;

    const geometry = new THREE.PlaneGeometry(2.4, 2.4, 96, 96);
    const uniforms = { uPsi: { value: INITIAL_RESEARCH_STATE.psi } };

    const vertexShader = [
      "uniform float uPsi;",
      "varying float vMargin;",
      "varying float vP;",
      "varying float vM;",
      "float signedMargin(float p, float m, float psi) {",
      "  float dPower = p - 0.45;",
      "  float dMobility = psi * (m - 0.45);",
      "  float dComposite = (p + m - 1.20) / sqrt(1.0 + 1.0 / (psi * psi));",
      "  return min(dPower, min(dMobility, dComposite));",
      "}",
      "void main() {",
      "  float p = position.x / 2.4 + 0.5;",
      "  float m = position.y / 2.4 + 0.5;",
      "  float margin = signedMargin(p, m, uPsi);",
      "  vMargin = margin;",
      "  vP = p;",
      "  vM = m;",
      "  vec3 transformed = vec3(position.x, position.y, 0.78 * margin);",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);",
      "}"
    ].join("\n");

    const fragmentShader = [
      "precision highp float;",
      "varying float vMargin;",
      "varying float vP;",
      "varying float vM;",
      "void main() {",
      "  vec3 graphite = vec3(0.055, 0.090, 0.130);",
      "  vec3 sky = vec3(0.529, 0.808, 0.980);",
      "  vec3 deepSky = vec3(0.000, 0.749, 1.000);",
      "  float admissible = smoothstep(-0.018, 0.055, vMargin);",
      "  vec3 color = mix(graphite, sky, admissible);",
      "  float gx = min(fract(vP * 10.0), 1.0 - fract(vP * 10.0));",
      "  float gy = min(fract(vM * 10.0), 1.0 - fract(vM * 10.0));",
      "  float grid = 1.0 - smoothstep(0.0, 0.022, min(gx, gy));",
      "  color = mix(color, deepSky, 0.18 * grid);",
      "  float boundary = 1.0 - smoothstep(0.0, 0.018, abs(vMargin));",
      "  color = mix(color, deepSky, 0.70 * boundary);",
      "  gl_FragColor = vec4(color, 0.96);",
      "}"
    ].join("\n");

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true
    });
    scene.add(new THREE.Mesh(geometry, material));

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 24, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(0,191,255)") })
    );
    scene.add(marker);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.4, 2.4)),
      new THREE.LineBasicMaterial({ color: new THREE.Color("rgb(135,206,250)"), transparent: true, opacity: 0.42 })
    );
    scene.add(frame);

    const updateCamera = () => {
      const horizontal = distance * Math.cos(pitch);
      camera.position.set(
        horizontal * Math.sin(yaw),
        -horizontal * Math.cos(yaw),
        distance * Math.sin(pitch)
      );
      camera.lookAt(0, 0, 0);
    };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      yaw += (event.clientX - lastX) * 0.008;
      pitch = Math.min(1.15, Math.max(0.28, pitch - (event.clientY - lastY) * 0.006));
      lastX = event.clientX;
      lastY = event.clientY;
      updateCamera();
      renderer.render(scene, camera);
    });
    canvas.addEventListener("pointerup", (event) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(300, rect.height || 390);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      updateCamera();
      renderer.render(scene, camera);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    status.textContent = "Drag to rotate · height = signed metric margin";

    return (state) => {
      uniforms.uPsi.value = state.psi;
      const result = metricConstraintMargins(state);
      marker.position.set(
        (state.p - 0.5) * 2.4,
        (state.m - 0.5) * 2.4,
        0.78 * result.signedMetricMargin
      );
      renderer.render(scene, camera);
    };
  }

  const renderD3 = mountD3();
  const renderWebGL = mountWebGL();

  let geogebraApi = null;
  let geogebraLoading = false;

  const ensureScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      if (window.GGBApplet) resolve();
      else existing.addEventListener("load", resolve, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  async function mountGeoGebra() {
    if (geogebraApi || geogebraLoading) return;
    geogebraLoading = true;
    loadGeoGebra.disabled = true;
    loadGeoGebra.textContent = "Loading GeoGebra…";
    geogebraHost.textContent = "Loading exact 2-D construction…";
    try {
      await ensureScript("https://www.geogebra.org/apps/deployggb.js");
      geogebraHost.textContent = "";
      const state = store.value;
      const applet = new window.GGBApplet({
        id: "viabilityGeoGebra",
        appName: "graphing",
        width: 800,
        height: 470,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        showResetIcon: true,
        enableShiftDragZoom: false,
        enableRightClick: false,
        appletOnLoad(api) {
          geogebraApi = api;
          api.setCoordSystem(0.35, 1.05, 0.35, 1.05);
          api.setGridVisible(1, true);
          api.setAxisLabels(1, "p", "m", "");
          api.evalCommand([
            "K=Polygon((0.45,0.75),(0.45,1),(1,1),(1,0.45),(0.75,0.45))",
            "pFloor: x=0.45",
            "mFloor: y=0.45",
            "service: x+y=1.20",
            "Y=(" + state.p + "," + state.m + ")"
          ].join("\n"));
          api.setColor("K", 135, 206, 250);
          api.setFilling("K", 0.12);
          api.setColor("pFloor", 135, 206, 250);
          api.setColor("mFloor", 135, 206, 250);
          api.setColor("service", 0, 191, 255);
          api.setColor("Y", 0, 191, 255);
          api.setLineThickness("service", 5);
          api.setPointSize("Y", 7);
          api.setLabelVisible("Y", true);
          api.registerObjectUpdateListener("Y", () => {
            const p = Math.min(1, Math.max(0.35, api.getXcoord("Y")));
            const m = Math.min(1, Math.max(0.35, api.getYcoord("Y")));
            store.update({ p, m }, "geogebra");
          });
          loadGeoGebra.textContent = "GeoGebra synchronized";
        }
      }, true);
      applet.inject("geogebraExact");
    } catch (error) {
      geogebraHost.textContent = "GeoGebra could not be loaded. The D3 and WebGL views remain fully functional.";
      loadGeoGebra.disabled = false;
      loadGeoGebra.textContent = "Retry GeoGebra";
      geogebraLoading = false;
    }
  }

  loadGeoGebra && loadGeoGebra.addEventListener("click", mountGeoGebra);

  store.subscribe((state, source) => {
    renderReadout(state);
    renderD3(state);
    renderWebGL(state);
    if (geogebraApi && source !== "geogebra") {
      geogebraApi.setCoords("Y", state.p, state.m);
    }
  });
}
