import * as THREE from "three";
import { createKit } from "./kit.js";

export function buildNicholsHall({ scale = 1, castShadow = true } = {}) {
  const COL = {
    wall: 0xfdf2e8,
    glass: 0xa8d6f6,
    roof: 0xfef7f0,
  };
  const { root, solidMat, tint, pushEdges, seg, add, B, ext, finish } =
    createKit("니콜스관", {
      wall: COL.wall,
      shade: [0.06, 0.08, 0.12, 0.2, 0.18],
    });

  function win(
    face,
    plane,
    a0,
    a1,
    y0,
    y1,
    { cols = 1, rows = 1, hex = COL.glass, out = 0.15 } = {},
  ) {
    const s = face[0] === "+" ? 1 : -1,
      p0 = Math.min(plane - 0.05 * s, plane + out * s),
      p1 = Math.max(plane - 0.05 * s, plane + out * s);
    if (face[1] === "z") {
      B(a0, a1, y0, y1, p0, p1, hex, "frame");
      const z = plane + (out + 0.02) * s;
      for (let i = 1; i < cols; i++) {
        const x = a0 + ((a1 - a0) * i) / cols;
        seg("mull", [x, y0, z], [x, y1, z]);
      }
      for (let j = 1; j < rows; j++) {
        const y = y0 + ((y1 - y0) * j) / rows;
        seg("mull", [a0, y, z], [a1, y, z]);
      }
    } else {
      B(p0, p1, y0, y1, a0, a1, hex, "frame");
      const x = plane + (out + 0.02) * s;
      for (let i = 1; i < cols; i++) {
        const z = a0 + ((a1 - a0) * i) / cols;
        seg("mull", [x, y0, z], [x, y1, z]);
      }
      for (let j = 1; j < rows; j++) {
        const y = y0 + ((y1 - y0) * j) / rows;
        seg("mull", [x, y, a0], [x, y, a1]);
      }
    }
  }

  const W = 64,
    D = 13,
    F = 3.2,
    H = 4 * F,
    zf = D / 2,
    zb = -D / 2,
    CH = 3;
  // 정면도: 건물 1087px = 64m, 4층 210px = 12.8m
  const fx = (px) => ((px - 48) / 1087) * W;
  const fy = (py) => ((313 - py) / 210) * H;
  const bx = (px) => ((px - 20) / 645) * W;
  const by = (py) => ((207 - py) / 152) * H;

  ext(
    [
      [0, zf],
      [W, zf],
      [W, zb + CH],
      [W - CH, zb],
      [0, zb],
    ],
    0,
    H,
    COL.wall,
  );
  ext(
    [
      [-0.35, zf + 0.35],
      [W + 0.35, zf + 0.35],
      [W + 0.35, zb + CH - 0.15],
      [W - CH + 0.15, zb - 0.35],
      [-0.35, zb - 0.35],
    ],
    H,
    0.9,
    COL.roof,
  );
  ext(
    [
      [0.25, zf - 0.25],
      [W - 0.25, zf - 0.25],
      [W - 0.25, zb + CH],
      [W - CH, zb + 0.25],
      [0.25, zb + 0.25],
    ],
    H + 0.9,
    0.08,
    COL.roof,
    "minor",
  );

  const FRONT = [
    [84, 174],
    [231, 320],
    [378, 469],
    [525, 616],
    [673, 763],
    [819, 907],
    [1063, 1118],
  ];
  const ROWS = [134, 176, 219, 264];
  FRONT.forEach(([a, b], ci) =>
    ROWS.forEach((r, ri) => {
      if (ri === 3 && ci === 1) return;
      const x0 = fx(a),
        x1 = fx(b),
        y = fy(r);
      const half = x1 - x0 > 3 ? 2 : 1;
      for (let h = 0; h < half; h++) {
        const a0 = x0 + ((x1 - x0) * h) / half + (h ? 0.12 : 0),
          a1 = x0 + ((x1 - x0) * (h + 1)) / half - (h < half - 1 ? 0.12 : 0);
        win("+z", zf, a0, a1, y - 0.62, y + 0.62, { cols: 2 });
      }
    }),
  );

  function gradGlass(geo, w, h) {
    const p = geo.attributes.position,
      cols = new Float32Array(p.count * 3),
      a = new THREE.Color(0x6fb0e6),
      b = new THREE.Color(0xd3ecfd),
      c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / w + 0.5,
        v = p.getY(i) / h + 0.5;
      const t = Math.min(
        1,
        Math.max(
          0,
          0.15 + 0.75 * (1 - Math.abs(u - 0.58) * 1.7) * (0.55 + 0.45 * v),
        ),
      );
      c.copy(a).lerp(b, t);
      c.toArray(cols, i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return geo;
  }
  const FRAME = 0x56708c,
    HANDLE = 0x3f5266;
  function door(
    face,
    plane,
    cx,
    w,
    y0,
    h,
    { panels = 4, pair = null, transom = 0.17 } = {},
  ) {
    const g = new THREE.Group();
    g.position.set(
      face[1] === "z" ? cx : plane,
      y0,
      face[1] === "z" ? plane : cx,
    );
    g.rotation.y = {
      "+z": 0,
      "-z": Math.PI,
      "+x": Math.PI / 2,
      "-x": -Math.PI / 2,
    }[face];
    root.add(g);
    g.updateMatrixWorld(true);
    const box = (bw, bh, bd, x, y, z, hex, line = null) => {
      const geo = new THREE.BoxGeometry(bw, bh, bd);
      geo.translate(x, y, z);
      tint(geo, hex);
      const m = new THREE.Mesh(geo, solidMat);
      g.add(m);
      if (line) pushEdges(m, line);
      return m;
    };
    const gl = new THREE.PlaneGeometry(w, h, 16, 8);
    gradGlass(gl, w, h);
    gl.translate(0, h / 2, 0.05);
    g.add(
      new THREE.Mesh(gl, new THREE.MeshBasicMaterial({ vertexColors: true })),
    );
    const t = 0.13,
      d = 0.16,
      z = 0.1;
    box(w + t, t, d, 0, h, z, FRAME);
    box(w + t, t * 0.8, d, 0, 0, z, FRAME);
    box(t, h, d, -w / 2, h / 2, z, FRAME);
    box(t, h, d, w / 2, h / 2, z, FRAME);
    const ty = h * (1 - transom);
    box(w, t * 0.8, d, 0, ty, z, FRAME);
    const pw = w / panels;
    pair = pair ?? [Math.floor(panels / 2) - 1, Math.floor(panels / 2)];
    for (let i = 1; i < panels; i++) {
      const x = -w / 2 + i * pw;
      const meet = i === pair[1];
      if (meet) {
        box(t * 0.55, ty, d + 0.02, x - 0.07, ty / 2, z + 0.01, FRAME);
        box(t * 0.55, ty, d + 0.02, x + 0.07, ty / 2, z + 0.01, FRAME);
        box(t * 0.6, h - ty, d, x, ty + (h - ty) / 2, z, FRAME);
      } else box(t * 0.75, h, d, x, h / 2, z, FRAME);
    }
    pair.forEach((k) => {
      const x0 = -w / 2 + k * pw,
        x1 = x0 + pw;
      box(
        pw - 0.05,
        t * 0.7,
        d + 0.03,
        (x0 + x1) / 2,
        t * 0.35,
        z + 0.02,
        FRAME,
      );
    });
    const mx = -w / 2 + pair[1] * pw;
    [-1, 1].forEach((s) => {
      box(0.07, 0.95, 0.08, mx + s * 0.32, ty * 0.5, z + 0.2, HANDLE);
      box(0.07, 0.05, 0.14, mx + s * 0.32, ty * 0.5 + 0.42, z + 0.13, HANDLE);
      box(0.07, 0.05, 0.14, mx + s * 0.32, ty * 0.5 - 0.42, z + 0.13, HANDLE);
    });
    return g;
  }

  function entrance(x0, x1) {
    const dz = 3.2,
      top = fy(230),
      slab = 1.0,
      pl = 0.7;
    B(x0 - 0.25, x1 + 0.25, top - slab, top, zf, zf + dz, COL.roof);
    B(x0, x0 + 1.0, 0, top - slab, zf, zf + 1.3);
    B(x1 - 1.0, x1, 0, top - slab, zf, zf + 1.3);
    B(
      x0 + 1.0,
      x1 - 1.0,
      top - slab - 0.35,
      top - slab,
      zf,
      zf + 0.25,
      COL.wall,
      "minor",
    );
    door("+z", zf, (x0 + x1) / 2, x1 - x0 - 2.0, pl, top - slab - 0.35 - pl, {
      panels: 6,
    });
    const mid = (x0 + x1) / 2 - 0.3;
    B(x0 + 1.0, x1 - 1.0, 0, pl, zf, zf + 1.5, COL.roof, "minor");
    for (let i = 0; i < 4; i++)
      B(
        mid,
        x1 - 0.25,
        0,
        pl - i * 0.175,
        zf + 1.5 + i * 0.55,
        zf + 2.05 + i * 0.55,
        COL.roof,
        "light",
      );
    B(x1 - 0.25, x1 + 1.0, 0, 0.95, zf + 1.3, zf + 3.8, COL.roof);
    const rl = 4.6,
      ang = Math.atan2(pl, rl),
      g = new THREE.BoxGeometry(mid - (x0 + 0.3), 0.25, Math.hypot(rl, pl));
    g.rotateX(ang);
    g.translate((x0 + 0.3 + mid) / 2, 0.35, zf + 1.5 + rl / 2);
    add(g, COL.roof, "minor");
    [x0 + 0.35, mid - 0.08].forEach((x) => {
      seg("frame", [x, 1.75, zf + 1.4], [x, 1.05, zf + 1.5 + rl]);
      seg("frame", [x, 1.45, zf + 1.4], [x, 0.75, zf + 1.5 + rl]);
      for (let k = 0; k <= 4; k++) {
        const z = zf + 1.45 + (k * rl) / 4,
          y = pl - (pl * k) / 4;
        seg("frame", [x, y, z], [x, y + 1.05, z]);
      }
    });
  }
  entrance(fx(180), fx(337));
  entrance(fx(911), fx(1065));

  for (let f = 0; f < 4; f++) {
    const y = f * F + 1.1;
    win("-x", 0, -1.3, 1.3, y, y + 1.5, { cols: 2 });
    win("+x", W, -2.2, 0.4, y, y + 1.5, { cols: 2 });
  }

  const WG = { x0: 48.5, x1: 59.5, z0: zb - 22, z1: zb + 0.5 };
  B(WG.x0, WG.x1, 0, H, WG.z0, WG.z1);
  B(WG.x0 - 0.35, WG.x1 + 0.35, H, H + 0.9, WG.z0 - 0.35, zb, COL.roof);
  B(
    WG.x0 + 0.25,
    WG.x1 - 0.25,
    H + 0.9,
    H + 0.98,
    WG.z0 - 0.1,
    zb - 0.2,
    COL.roof,
    "minor",
  );
  for (let f = 0; f < 4; f++) {
    const y = f * F + 1.1;
    for (let z = WG.z0 + 2; z < zb - 1.5; z += 3.6) {
      win("-x", WG.x0, z, z + 1.3, y, y + 1.6, { cols: 1, rows: 2 });
      win("+x", WG.x1, z, z + 1.3, y, y + 1.6, { cols: 1, rows: 2 });
    }
  }
  const ww = (WG.x1 - WG.x0) / 3;
  for (let i = 0; i <= 3; i++) {
    const x = WG.x0 + i * ww;
    B(
      x - 0.35,
      x + 0.35,
      0,
      H + 0.9,
      WG.z0 - 0.45,
      WG.z0 + 0.1,
      COL.wall,
      "minor",
    );
  }
  for (let i = 0; i < 3; i++)
    for (let f = 0; f < 4; f++) {
      const x0 = WG.x0 + i * ww + 0.75,
        y = f * F + 1.0;
      win("-z", WG.z0, x0, x0 + ww - 1.5, y, y + 1.25, { cols: 3 });
    }

  const PIL = [
    [20, 38],
    [101, 118],
    [180, 197],
    [260, 277],
    [397, 414],
    [478, 495],
    [561, 578],
    [641, 658],
  ];
  PIL.forEach(([a, b]) => {
    const x0 = bx(a),
      x1 = bx(b);
    if (x1 > WG.x0 - 0.5 && x0 < WG.x1 + 0.5) return;
    B(x0, x1, 0, H + 0.9, zb - 0.55, zb + 0.1, COL.wall, "minor");
    B(
      x0 - 0.12,
      x1 + 0.12,
      H + 0.9,
      H + 1.25,
      zb - 0.67,
      zb + 0.1,
      COL.roof,
      "minor",
    );
  });
  const BWIN = [
    [44, 97],
    [123, 177],
    [203, 257],
    [282, 335],
    [345, 393],
    [420, 475],
    [500, 555],
    [583, 637],
  ];
  const BROWS = [78, 104, 130, 175];
  BWIN.forEach(([a, b], ci) =>
    BROWS.forEach((r, ri) => {
      const x0 = bx(a),
        x1 = bx(b);
      if (x1 > WG.x0 - 0.5 && x0 < WG.x1 + 0.5) return;
      if (ri === 3 && ci === 5) return;
      const y = by(r);
      win("-z", zb, x0, x1, y - 0.6, y + 0.6, { cols: 3 });
    }),
  );
  (() => {
    const x0 = bx(408),
      x1 = bx(490),
      top = by(153);
    B(x0, x1, top - 0.7, top, zb - 2.6, zb, COL.roof);
    door("-z", zb, (x0 + x1) / 2, x1 - x0 - 1.6, 0.6, top - 1.05, {
      panels: 4,
    });
    for (let i = 0; i < 3; i++)
      B(
        x0 + 0.3,
        x1 - 0.3,
        0,
        0.6 - i * 0.2,
        zb - 1.2 - i * 0.5,
        zb - 0.7 - i * 0.5,
        COL.roof,
        "light",
      );
    B(x0 - 0.6, x0 + 0.2, 0, 0.8, zb - 2.4, zb, COL.roof, "minor");
    B(x1 - 0.2, x1 + 0.6, 0, 0.8, zb - 2.4, zb, COL.roof, "minor");
  })();

  return finish({
    scale,
    castShadow,
    vent: [42, H + 0.98, -1.5],
    lines: {
      major: [0x8f969d, 1.1],
      minor: [0xa4aab0, 0.85],
      frame: [0x4f6a86, 1.0],
      mull: [0x8fbbe0, 0.8],
      light: [0xb9bec3, 0.7],
    },
  });
}
