import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

const WHITE = new THREE.Color(1, 1, 1);

export function gradY(geo, top, bottom) {
  const p = geo.attributes.position,
    cols = new Float32Array(p.count * 3),
    a = new THREE.Color(bottom),
    b = new THREE.Color(top),
    c = new THREE.Color();
  geo.computeBoundingBox();
  const y0 = geo.boundingBox.min.y,
    y1 = geo.boundingBox.max.y;
  for (let i = 0; i < p.count; i++) {
    c.copy(a).lerp(b, (p.getY(i) - y0) / Math.max(1e-6, y1 - y0));
    c.toArray(cols, i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return geo;
}

export function boxGeo(x0, x1, y0, y1, z0, z1) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}

// 평면 [x, z] 좌표 → Shape (z는 -y로)
export function toShape(pts, holes = []) {
  const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  holes.forEach((hp) =>
    s.holes.push(new THREE.Path(hp.map(([x, z]) => new THREE.Vector2(x, -z)))),
  );
  return s;
}

// ang: 벽 바깥 법선 방향 (0: +z, π/2: +x, π: -z, -π/2: -x)
export const onWall = (cx, cz, ang) => (u, y, w) => [
  cx + u * Math.cos(ang) + w * Math.sin(ang),
  y,
  cz - u * Math.sin(ang) + w * Math.cos(ang),
];

export function createKit(
  name,
  { wall, shade = [0.07, 0.09, 0.12, 0.16, 0.15], doubleSide = false } = {},
) {
  const group = new THREE.Group();
  group.name = name;
  const root = new THREE.Group();
  group.add(root);

  const [left, right, back, bottom, top] = shade;
  function tint(geo, hex) {
    const base = new THREE.Color(hex),
      n = geo.attributes.normal,
      cols = new Float32Array(n.count * 3),
      c = new THREE.Color();
    for (let i = 0; i < n.count; i++) {
      const nx = n.getX(i),
        ny = n.getY(i),
        nz = n.getZ(i);
      const f =
        1 -
        left * Math.max(0, -nx) -
        right * Math.max(0, nx) -
        back * Math.max(0, -nz) -
        bottom * Math.max(0, -ny);
      c.copy(base).multiplyScalar(f);
      if (ny > 0.5) c.lerp(WHITE, top * ny);
      c.toArray(cols, i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return geo;
  }

  const solidMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  const L = { major: [], minor: [], frame: [], mull: [], light: [] };
  const tmpV = new THREE.Vector3();
  function pushEdges(mesh, set, angle = 25) {
    mesh.updateMatrixWorld(true);
    const e = new THREE.EdgesGeometry(mesh.geometry, angle),
      p = e.attributes.position;
    for (let i = 0; i < p.count; i++) {
      tmpV.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
      L[set].push(tmpV.x, tmpV.y, tmpV.z);
    }
    e.dispose();
  }
  const seg = (set, a, b) => L[set].push(...a, ...b);

  // hex가 null이면 이미 색이 칠해진 geo
  function add(geo, hex, line = "major", { angle, mat = solidMat } = {}) {
    if (hex !== null) tint(geo, hex);
    const m = new THREE.Mesh(geo, mat);
    root.add(m);
    if (line) pushEdges(m, line, angle);
    return m;
  }

  function B(x0, x1, y0, y1, z0, z1, hex = wall, line = "major") {
    return add(boxGeo(x0, x1, y0, y1, z0, z1), hex, line);
  }

  function ext(outline, y0, h, hex, line = "major", holes = []) {
    const s = Array.isArray(outline) ? toShape(outline, holes) : outline;
    const g = new THREE.ExtrudeGeometry(s, {
      depth: h,
      bevelEnabled: false,
      curveSegments: 20,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y0, 0);
    return add(g, hex, line, { angle: 30 });
  }

  // 벽 위 (cx, cz)에서 u = 벽을 따라, w = 바깥쪽
  function boxOn(cx, cz, ang, u0, u1, y0, y1, w0, w1, hex, line, colorFn) {
    const g = boxGeo(u0, u1, y0, y1, w0, w1);
    if (colorFn) colorFn(g);
    g.rotateY(ang);
    g.translate(cx, 0, cz);
    return add(g, colorFn ? null : hex, line);
  }

  function finish({
    scale,
    castShadow,
    vent,
    lines,
    solidShadowsOnly = false,
  }) {
    const lineMats = Object.entries(lines).map(([set, [color, linewidth]]) => {
      const g = new LineSegmentsGeometry();
      g.setPositions(L[set]);
      const m = new LineMaterial({ color, linewidth });
      root.add(new LineSegments2(g, m));
      return m;
    });

    const bb = new THREE.Box3().setFromObject(root),
      c = bb.getCenter(new THREE.Vector3());
    root.position.set(-c.x, 0, -c.z);
    group.scale.setScalar(scale);
    root.traverse((o) => {
      if (o.isMesh && (!solidShadowsOnly || o.material === solidMat))
        o.castShadow = castShadow;
    });

    const [vx, vy, vz] = vent;
    return {
      group,
      vent: new THREE.Vector3(
        (vx - c.x) * scale,
        vy * scale,
        (vz - c.z) * scale,
      ),
      size: bb.getSize(new THREE.Vector3()).multiplyScalar(scale),
      setResolution(w, h) {
        lineMats.forEach((m) => m.resolution.set(w, h));
      },
      dispose() {
        group.traverse((o) => {
          o.geometry?.dispose();
          o.material?.dispose();
        });
      },
    };
  }

  return {
    root,
    solidMat,
    tint,
    pushEdges,
    seg,
    add,
    B,
    ext,
    boxOn,
    finish,
  };
}
