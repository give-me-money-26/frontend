import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { boxGeo } from "./kit.js";

// 원점: 루버 면 바닥 가운데, 바람은 +x로 나가고 몸통은 -x 쪽
export function buildVent({ scale = 1, castShadow = true } = {}) {
  const group = new THREE.Group();
  group.name = "배기구";
  const root = new THREE.Group();
  group.add(root);

  const COL = {
    body: 0x1f7b75,
    tile: 0x1b706a,
    inner: 0x14514e,
    slat: 0xe4e8ea,
  };
  function tint(geo, hex) {
    const base = new THREE.Color(hex);
    const n = geo.attributes.normal;
    const cols = new Float32Array(n.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < n.count; i++) {
      const nx = n.getX(i);
      const ny = n.getY(i);
      const nz = n.getZ(i);
      const factor =
        1 +
        0.12 * Math.max(0, ny) -
        0.18 * Math.max(0, -nz) -
        0.18 * Math.max(0, nz) -
        0.05 * Math.max(0, nx) -
        0.3 * Math.max(0, -ny);
      c.copy(base).multiplyScalar(factor);
      c.toArray(cols, i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return geo;
  }
  const solidMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const edges = { major: [], minor: [] };
  const tmpV = new THREE.Vector3();
  function pushEdges(mesh, set) {
    mesh.updateMatrixWorld(true);
    const e = new THREE.EdgesGeometry(mesh.geometry, 25);
    const p = e.attributes.position;
    for (let i = 0; i < p.count; i++) {
      tmpV.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
      edges[set].push(tmpV.x, tmpV.y, tmpV.z);
    }
    e.dispose();
  }
  function add(geo, hex, line = "major") {
    tint(geo, hex);
    const m = new THREE.Mesh(geo, solidMat);
    m.castShadow = castShadow;
    root.add(m);
    if (line) pushEdges(m, line);
    return m;
  }
  function addBox(x0, x1, y0, y1, z0, z1, hex = COL.body, line = "major") {
    return add(boxGeo(x0, x1, y0, y1, z0, z1), hex, line);
  }

  const W = 2.2;
  const H = 0.95;
  const D = 1.05;
  const FR = 0.012;
  const TOPB = 0.17;
  const BOTB = 0.15;
  const SIDE = 0.2;

  addBox(-D, 0, 0, H, -W / 2, W / 2);
  edges.minor.push(-D, H - 0.17, -W / 2 - 0.001, 0, H - 0.17, -W / 2 - 0.001);
  edges.minor.push(-D, H - 0.17, W / 2 + 0.001, 0, H - 0.17, W / 2 + 0.001);

  const zL = -W / 2;
  const zR = W / 2;
  const zi0 = zL + SIDE;
  const zi1 = zR - SIDE;
  const yB = BOTB;
  const yT = H - TOPB;
  const thirds = [0, 1, 2, 3].map((i) => zi0 + ((zi1 - zi0) * i) / 3);
  for (let i = 0; i < 3; i++) {
    addBox(
      0,
      FR,
      yT,
      H,
      thirds[i] + 0.004,
      thirds[i + 1] - 0.004,
      COL.tile,
      "minor",
    );
    addBox(
      0,
      FR,
      0,
      yB,
      thirds[i] + 0.004,
      thirds[i + 1] - 0.004,
      COL.tile,
      "minor",
    );
  }
  [
    [zL, zi0],
    [zi1, zR],
  ].forEach(([a, b]) => {
    const ys = [0, yB, yB + (yT - yB) * 0.45, yT, H];
    for (let j = 0; j < ys.length - 1; j++)
      addBox(
        0,
        FR,
        ys[j] + 0.004,
        ys[j + 1] - 0.004,
        a + 0.004,
        b - 0.004,
        COL.tile,
        "minor",
      );
  });

  const pad = 0.03;
  const gap = 0.045;
  const pw = (zi1 - zi0 - 2 * pad - 2 * gap) / 3;
  const py0 = yB + pad;
  const py1 = yT - pad;
  const slats = 7;
  const pitch = (py1 - py0) / slats;
  addBox(-0.06, 0.001, py0, py1, zi0 + pad, zi1 - pad, COL.inner, null);
  for (let p = 0; p < 3; p++) {
    const z0 = zi0 + pad + p * (pw + gap);
    const z1 = z0 + pw;
    if (p > 0) addBox(-0.06, FR, py0, py1, z0 - gap, z0, COL.tile, "minor");
    for (let k = 0; k < slats; k++) {
      const yc = py1 - pitch * (k + 0.5);
      const g = new THREE.BoxGeometry(0.11, 0.012, pw - 0.01);
      g.rotateZ(-0.38);
      g.translate(0.01, yc, (z0 + z1) / 2);
      add(g, COL.slat, "minor");
    }
  }

  const lineMats = [
    [edges.major, 0x0d3f3c, 1.1],
    [edges.minor, 0x174f4b, 0.8],
  ].map(([positions, color, linewidth]) => {
    const g = new LineSegmentsGeometry();
    g.setPositions(positions);
    const m = new LineMaterial({ color, linewidth });
    root.add(new LineSegments2(g, m));
    return m;
  });

  group.scale.setScalar(scale);
  return {
    group,
    outlet: new THREE.Vector3(0.06, (py0 + py1) / 2, 0).multiplyScalar(scale),
    outletSize: { w: (zi1 - zi0) * scale, h: (py1 - py0) * scale },
    size: new THREE.Vector3(D, H, W).multiplyScalar(scale),
    setResolution(w, h) {
      lineMats.forEach((m) => m.resolution.set(w, h));
    },
    dispose() {
      group.traverse((o) => o.geometry?.dispose());
      lineMats.forEach((m) => m.dispose());
      solidMat.dispose();
    },
  };
}

export function createWindParticles(
  vent,
  { count = 90, length = 6, thickness = 0.05 } = {},
) {
  // 파티클은 vent.group 안에 들어가므로 scale을 뺀 로컬 좌표
  const groupScale = vent.group.scale.x || 1;
  const origin = vent.outlet.clone().divideScalar(groupScale);
  const w = vent.outletSize.w / groupScale;
  const h = vent.outletSize.h / groupScale;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, "rgba(64,160,160,0)");
  gradient.addColorStop(0.25, "rgba(64,160,160,0.95)");
  gradient.addColorStop(0.7, "rgba(90,175,175,0.7)");
  gradient.addColorStop(1, "rgba(120,190,190,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(60, 2, 256, 7);
  ctx.lineTo(256, 9);
  ctx.quadraticCurveTo(60, 14, 0, 8);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  // 인스턴스 색의 r 값을 투명도로 사용
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <color_fragment>",
      "#ifdef USE_INSTANCING_COLOR\n diffuseColor.a *= vColor.r;\n#endif",
    );
  };
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const colors = new Float32Array(count * 3);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

  const particles = [];
  const spawn = (p, initial) => {
    p.y = origin.y + (Math.random() - 0.5) * h * 0.9;
    p.z = origin.z + (Math.random() - 0.5) * w * 0.85;
    p.x = initial ? origin.x + length * Math.random() ** 1.8 : origin.x;
    p.len = 0.35 + Math.random() * 0.75;
    p.v = 0.8 + Math.random() * 0.5;
    p.life = length * (0.35 + Math.random() * 0.65);
  };
  for (let i = 0; i < count; i++) {
    const p = {};
    spawn(p, true);
    particles.push(p);
  }
  const m4 = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const t = new THREE.Vector3();
  const euler = new THREE.Euler();
  function update(dt, camera, speed = 1) {
    const inv = new THREE.Matrix4().copy(vent.group.matrixWorld).invert();
    const cam = camera.position.clone().applyMatrix4(inv);
    particles.forEach((p, i) => {
      p.x += dt * p.v * speed;
      const d = p.x - origin.x;
      if (d > p.life) spawn(p, false);
      const k = Math.min(1, d / p.life);
      euler.set(Math.atan2(-(cam.y - p.y), cam.z - p.z), 0, 0);
      quat.setFromEuler(euler);
      const ln = p.len * (1 - 0.3 * k);
      t.set(
        p.x + ln / 2,
        p.y + Math.sin(d * 1.4 + i) * 0.02,
        p.z * (1 + d * 0.04),
      );
      s.set(ln, thickness, 1);
      m4.compose(t, quat, s);
      mesh.setMatrixAt(i, m4);
      const fade = 1 - k * k;
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = fade;
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
  }
  return {
    mesh,
    update,
    dispose() {
      geo.dispose();
      mat.dispose();
      tex.dispose();
    },
  };
}
