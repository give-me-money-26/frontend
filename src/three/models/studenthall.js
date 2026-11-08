import * as THREE from "three";
import { createKit, gradY, onWall, toShape } from "./kit.js";

export function buildStudentHall({ scale = 1, castShadow = true } = {}) {
  const COL = {
    wall: 0xfdf2e8,
    roof: 0xfdf6f0,
    step: 0xf7eee6,
    pier: 0xfbefe5,
    cap: 0xfaf0e8,
  };
  const { root, seg, add, addBox, ext, boxOn, finish } = createKit("학생회관", {
    wall: COL.wall,
    doubleSide: true,
  });

  function win(
    cx,
    cz,
    ang,
    w,
    y0,
    y1,
    { cols = 2, rows = 1, top = 0x8ec6ee, bottom = 0xc6e5fa, sill = true } = {},
  ) {
    const glassOut = 0.04;
    const h = y1 - y0;
    const F0 = 0.2;
    boxOn(
      cx,
      cz,
      ang,
      -w / 2,
      w / 2,
      y0,
      y1,
      -0.05,
      glassOut,
      0,
      "frame",
      (g) => gradY(g, top, bottom),
    );
    boxOn(
      cx,
      cz,
      ang,
      -w / 2 - 0.14,
      w / 2 + 0.14,
      y1,
      y1 + 0.14,
      0,
      F0,
      COL.wall,
      "minor",
    );
    boxOn(cx, cz, ang, -w / 2 - 0.14, -w / 2, y0, y1, 0, F0, COL.wall, "minor");
    boxOn(cx, cz, ang, w / 2, w / 2 + 0.14, y0, y1, 0, F0, COL.wall, "minor");
    boxOn(
      cx,
      cz,
      ang,
      -w / 2,
      w / 2,
      y1 - 0.18,
      y1,
      glassOut,
      glassOut + 0.012,
      0,
      null,
      (g) => gradY(g, 0x4f87b6, 0x6fa4cf),
    );
    if (sill && y0 > 0.3)
      boxOn(
        cx,
        cz,
        ang,
        -w / 2 - 0.2,
        w / 2 + 0.2,
        y0 - 0.12,
        y0,
        0,
        F0 + 0.12,
        COL.cap,
        "minor",
      );
    const fc = 0x5b88ab;
    const t = 0.07;
    for (let i = 1; i < cols; i++) {
      const u = -w / 2 + (w * i) / cols;
      boxOn(
        cx,
        cz,
        ang,
        u - t / 2,
        u + t / 2,
        y0,
        y1,
        glassOut,
        glassOut + 0.05,
        fc,
        null,
      );
    }
    for (let j = 1; j < rows; j++) {
      const y = y0 + (h * j) / rows;
      boxOn(
        cx,
        cz,
        ang,
        -w / 2,
        w / 2,
        y - t / 2,
        y + t / 2,
        glassOut,
        glassOut + 0.05,
        fc,
        null,
      );
    }
    if (h > 1.8 && w > 1.5) {
      const wallPoint = onWall(cx, cz, ang);
      const d = glassOut + 0.02;
      const pw = Math.min(w, h) * 0.18;
      [
        [0.18, 1],
        [0.42, 0.55],
      ].forEach(([k, a]) => {
        const u0 = -w / 2 + w * k;
        const g = new THREE.BufferGeometry();
        const clamp = (value) =>
          Math.max(-w / 2 + 0.05, Math.min(w / 2 - 0.05, value));
        const pts = [
          [u0, 0.15],
          [u0 + pw * a, 0.15],
          [u0 + pw * a + h * 0.45 * 0.6, 0.85],
          [u0 + h * 0.45 * 0.6, 0.85],
        ].map(([u, ratio]) => wallPoint(clamp(u), y0 + h * ratio, d));
        g.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(
            [...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[3]],
            3,
          ),
        );
        const m = new THREE.Mesh(
          g,
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        root.add(m);
      });
    }
  }

  const H = 11.1;
  const PAR = 1.0;
  const TOP = H + PAR;
  const ribbonZ = (x0, x1, z, yc, h, face = 0, n) =>
    win((x0 + x1) / 2, z, face, x1 - x0, yc - h / 2, yc + h / 2, {
      cols: n ?? Math.round((x1 - x0) / 2.4),
    });
  // 가운데 동은 정면에서 약 20° 기울어 있음 (투시도 지붕선에서 역산)
  const DV = [0.344, 0.939];
  const AW = Math.atan2(-0.939, 0.344);
  const AE = Math.atan2(0.939, -0.344);
  const W0 = [-16.9, -21.6];
  const E0 = [-8.97, -31.4];
  const on = (pt, t) => [pt[0] + DV[0] * t, pt[1] + DV[1] * t];
  const winW = (t0, t1, y0, y1, o) => {
    const c = on(W0, (t0 + t1) / 2);
    win(c[0], c[1], AW, t1 - t0, y0, y1, o);
  };
  const winE = (t0, t1, y0, y1, o) => {
    const c = on(E0, (t0 + t1) / 2);
    win(c[0], c[1], AE, t1 - t0, y0, y1, o);
  };
  const boxW = (t0, t1, y0, y1, w0, w1, hex = COL.wall, line = "major") => {
    const c = on(W0, (t0 + t1) / 2);
    return boxOn(
      c[0],
      c[1],
      AW,
      -(t1 - t0) / 2,
      (t1 - t0) / 2,
      y0,
      y1,
      w0,
      w1,
      hex,
      line,
    );
  };

  const PLAN = [
    [-27.5, -35.5],
    [-13.5, -35.5],
    [-13.5, -31.4],
    [-11.0, -31.4],
    [-11.0, -29.4],
    [E0[0] + 0.73, E0[1] + 2.0],
    [-1.9, -12],
    [17.3, -12],
    [17.3, -11.3],
    [18.2, -11.3],
    [18.2, -1.3],
    [14.75, -1.3],
    [14.75, 0],
    [0, 0],
    [0, -2.5],
    [-9.9, -2.5],
    W0,
    [-25.8, -21.6],
    [-25.8, -18.7],
    [-27.5, -18.7],
  ];
  const offset = (pts, d) =>
    pts.map((p, i) => {
      const a = pts[(i - 1 + pts.length) % pts.length];
      const b = pts[(i + 1) % pts.length];
      const n1 = [p[1] - a[1], -(p[0] - a[0])];
      const n2 = [b[1] - p[1], -(b[0] - p[0])];
      const l1 = Math.hypot(...n1);
      const l2 = Math.hypot(...n2);
      const u1 = [n1[0] / l1, n1[1] / l1];
      const u2 = [n2[0] / l2, n2[1] / l2];
      const m = [u1[0] + u2[0], u1[1] + u2[1]];
      const dot = u1[0] * u2[0] + u1[1] * u2[1];
      const k = d / (1 + dot);
      return [p[0] + m[0] * k, p[1] + m[1] * k];
    });
  const area = PLAN.reduce((s, p, i) => {
    const next = PLAN[(i + 1) % PLAN.length];
    return s + p[0] * next[1] - next[0] * p[1];
  }, 0);
  const OUT = area > 0 ? -1 : 1;
  const Y0 = 6.4;
  const RX = -23.4;
  const RZ = -21.4;
  const BODY = PLAN.filter((p) => !(p[0] === -27.5 && p[1] === -35.5));
  BODY.unshift([RX, -35.5]);
  BODY.push([-27.5, RZ], [RX, RZ]);
  ext(BODY, 0, H, COL.wall);
  ext(offset(BODY, 0.1 * OUT), 0, 0.4, COL.cap, "minor", [
    offset(BODY, -0.2 * OUT),
  ]);
  {
    addBox(-27.5, RX, Y0, H, -35.5, RZ, COL.wall, null);
    const a = [-27.5, Y0, -35.5];
    const b = [-27.5, Y0, RZ];
    const c = [RX, Y0, RZ];
    const d = [RX, Y0, -35.5];
    seg("major", a, b);
    seg("major", b, c);
    seg("major", c, d);
    seg("major", d, a);
    seg("major", a, [-27.5, H, -35.5]);
    addBox(RX - 0.02, RX + 0.2, 0, Y0, -35.5, RZ, 0xd9c6b8, null);
  }
  const rimI = offset(PLAN, -0.62 * OUT);
  ext(offset(PLAN, 0.38 * OUT), H, PAR, COL.roof, "major", [rimI]);
  {
    const g = new THREE.ShapeGeometry(toShape(rimI));
    g.rotateX(-Math.PI / 2);
    g.translate(0, H + 0.02, 0);
    add(g, COL.roof, null);
  }
  ext(offset(PLAN, -0.04 * OUT), TOP, 0.04, COL.roof, "minor", [
    offset(PLAN, -0.56 * OUT),
  ]);
  addBox(-18.1, -16.75, 7.2, TOP + 0.45, -21.95, -20.6, COL.pier, "major");

  win(-27.5, -20.6, -Math.PI / 2, 1.5, 1.0, 10.6, {
    cols: 1,
    rows: 6,
    sill: false,
  });
  win(-27.5, -31.6, -Math.PI / 2, 2.4, 8.3, 9.9, { cols: 2 });
  win(-21.3, -21.6, 0, 7.6, 5.9, 10.0, { cols: 6, rows: 2 });
  addBox(-25.6, -17.0, 0, 4.4, -21.6, -16.0);
  addBox(-25.9, -16.7, 4.4, 5.6, -21.6, -15.7, COL.roof);
  win(-20.7, -16.0, 0, 7.0, 0.5, 3.9, { cols: 6, rows: 2 });
  addBox(-17.0, -15.5, 0, 3.0, -18.6, -15.8, COL.wall, "major");
  addBox(-15.5, -14.2, 0, 1.5, -18.6, -15.8, COL.wall, "major");
  const GB = 3.7;
  win(-15.7, -35.5, Math.PI, 2.2, 4.8, 6.8, { cols: 3 });
  win(-22.7, -35.5, Math.PI, 2.2, 4.8, 6.8, { cols: 3 });
  win(-15.4, -35.5, Math.PI, 0.6, 9.0, 9.7, { cols: 1, sill: false });
  win(-24.1, -35.5, Math.PI, 0.6, 9.0, 9.7, { cols: 1, sill: false });
  win(-19.05, -35.5, Math.PI, 3.6, GB, 7.0, {
    cols: 4,
    top: 0x86bfe9,
    bottom: 0xb8ddf6,
    sill: false,
  });
  addBox(-21.3, -16.8, 7.2, 7.55, -37.6, -35.5, COL.roof);
  [-1, 1].forEach((s) =>
    addBox(
      -19.05 + s * 0.28 - 0.04,
      -19.05 + s * 0.28 + 0.04,
      GB + 1.0,
      GB + 2.0,
      -35.72,
      -35.6,
      0x2b3d4d,
      null,
    ),
  );

  const DL = Math.hypot(-9.9 - W0[0], -2.5 - W0[1]);
  winW(0.8, DL - 1.0, 8.2, 9.6, { cols: 9 });
  winW(0.8, DL - 1.0, 5.1, 6.5, { cols: 9 });
  winW(1.8, DL - 3.0, 0.6, 3.1, { cols: 8, rows: 1 });
  boxW(DL - 3.2, DL + 0.3, 0, 4.8, 0, 1.5);
  winE(1.0, 4.8, 4.6, 6.6, { cols: 2 });
  {
    const c = on(E0, 7.6);
    boxOn(c[0], c[1], AE, -1.4, 1.4, GB, 6.5, -0.05, 0.08, 0x9a7f6a, "frame");
    boxOn(c[0], c[1], AE, -1.9, 1.9, 6.5, 6.9, 0, 1.4, COL.roof, "major");
  }
  [10.5, 12.2, 13.9, 15.6].forEach((t) =>
    winE(t - 0.45, t + 0.45, 5.2, 6.2, { cols: 1 }),
  );

  {
    const lowBlock = [
      [-22, -39.5],
      [-22, -35.5],
      [-13.5, -35.5],
      [-13.5, -31.4],
      E0,
      on(E0, 12),
      [on(E0, 12)[0] + 3.6, on(E0, 12)[1] - 1.3],
      [-9.5, -39.5],
    ];
    ext(lowBlock, 0, GB, COL.wall, "major");
    ext(offset(lowBlock, 0), GB, 0.22, COL.cap, "minor");
  }
  {
    const x0 = -9.9;
    const x1 = -5.0;
    const zb = -3.6;
    const zf = 0.4;
    const h = 13.7;
    addBox(x0, x1, 0, h - 0.6, zb, zf);
    addBox(x0 + 0.6, x1, h - 0.6, h, zb, zf);
    addBox(x0, x0 + 0.6, h - 0.6, h, zb, zf - 0.6);
    win(x0, (zb + zf) / 2, -Math.PI / 2, 1.0, 0.5, h - 1.6, {
      cols: 1,
      rows: 7,
      sill: false,
    });
  }
  addBox(-5.0, 0, 0, H + 0.25, -5, -0.6);
  win(-2.5, -0.6, 0, 3.6, 6.4, 9.6, { cols: 2, rows: 2 });
  addBox(-5.6, 0, 4.2, 6.0, -0.6, 2.6, COL.roof, "major");
  addBox(-5.7, 0.1, 6.0, 6.2, -0.6, 2.75, COL.cap, "minor");
  [
    [-5.3, -4.55],
    [-0.8, -0.05],
  ].forEach(([a, b]) => addBox(a, b, 0.45, 4.2, 1.85, 2.5, COL.pier, "major"));
  win(-2.5, -0.6, 0, 2.9, 0.45, 3.9, {
    cols: 2,
    rows: 2,
    top: 0x86bfe9,
    bottom: 0xb8ddf6,
    sill: false,
  });
  [-1, 1].forEach((s) =>
    addBox(
      -2.5 + s * 0.25 - 0.04,
      -2.5 + s * 0.25 + 0.04,
      1.5,
      2.5,
      -0.42,
      -0.34,
      0x2b3d4d,
      null,
    ),
  );
  addBox(-4.9, -0.1, 0, 0.45, -0.6, 2.9, COL.step, "light");
  addBox(-4.6, -0.4, 0, 0.22, 2.9, 3.6, COL.step, "light");
  [8.55, 5.2, 1.85].forEach((y) => ribbonZ(1.8, 14.3, 0, y, 1.45, 0, 10));
  addBox(14.75, 19.5, 0, 5.0, -1.0, 2.2);
  addBox(14.6, 19.7, 5.0, 5.4, -1.2, 2.4, COL.roof);
  {
    const bx = (v) => 18.2 - (v - 55) * 0.02803;
    const zb = -12;
    // 앞에서 볼 때 지붕 위로 튀어나오지 않게 파라펫보다 낮게
    [
      [55, 85],
      [155, 185],
      [450, 487],
      [737, 772],
    ].forEach(([a, b]) => addBox(bx(b), bx(a), 0, TOP - 0.45, zb - 0.8, zb));
    [
      [200, 260],
      [355, 437],
    ].forEach(([a, b]) =>
      [8.55, 5.2].forEach((y) => ribbonZ(bx(b), bx(a), zb, y, 0.7, Math.PI, 3)),
    );
    win((bx(270) + bx(345)) / 2, zb, Math.PI, bx(270) - bx(345), 0.35, 9.1, {
      cols: 2,
      rows: 5,
      sill: false,
    });
    [[505, 722]].forEach(([a, b]) =>
      [8.55, 5.2].forEach((y) => ribbonZ(bx(b), bx(a), zb, y, 0.7, Math.PI, 9)),
    );
    const ex0 = bx(170);
    const ex1 = bx(75);
    addBox(ex0, ex1, 0, 2.7, zb - 2.2, zb);
    win((bx(92) + bx(152)) / 2, zb - 2.2, Math.PI, bx(92) - bx(152), 2.7, 5.2, {
      cols: 3,
      top: 0x86bfe9,
      bottom: 0xb8ddf6,
      sill: false,
    });
    addBox(ex0, ex1, 2.7, 5.4, zb - 2.2, zb - 0.6);
    addBox(bx(173), bx(68), 6.3, 7.0, zb - 2.9, zb, COL.roof);
  }

  return finish({
    scale,
    castShadow,
    vent: [8, TOP, -6],
    lines: {
      major: [0x50575e, 1],
      minor: [0x8e959b, 1],
      frame: [0x1f3f62, 1],
      mull: [0x3f6f9e, 1],
      light: [0xa3abb2, 1],
    },
  });
}
