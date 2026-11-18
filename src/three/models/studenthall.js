import * as THREE from "three";
import { createKit, gradY, onWall, toShape } from "./kit.js";

export function buildStudentHall({ scale = 1, castShadow = true } = {}) {
  const COL = {
    wall: 0xfdf2e8,
    roof: 0xfdf6f0,
    step: 0xf7eee6,
    pier: 0xfbefe5,
    cap: 0xfaf0e8,
    roofInner: 0xf5e9df,
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
    const F0 = 0.08;
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
        -w / 2 - 0.14,
        w / 2 + 0.14,
        y0 - 0.1,
        y0,
        0,
        F0 + 0.04,
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

  const H = 8.3;
  const PAR = 0.75;
  const TOP = H + PAR;
  const FLOOR = H / 3;
  const ROWS = [1.65, 4.3, 6.95];
  const ROW_H = 1.15;
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
  const capped = (x0, x1, z0, z1, top) => {
    addBox(x0, x1, 0, top, z0, z1);
    addBox(
      x0 - 0.15,
      x1 + 0.15,
      top,
      top + 0.35,
      z0 - 0.15,
      z1 + 0.15,
      COL.cap,
    );
  };

  // 입면2 px → m
  const fx = (px) => -9.9 + (px - 100) * 0.04645;
  const pierWestX1 = fx(170);
  const entranceX1 = fx(340);
  const blockX0 = fx(350);
  const pierEastX0 = fx(640);
  const annexX0 = fx(645);
  const annexX1 = fx(730);

  const leftBackZ = -29.5;
  const wingEastX = (z) => E0[0] + (DV[0] * (z - E0[1])) / DV[1];
  const PLAN = [
    [-27.5, leftBackZ],
    [wingEastX(leftBackZ), leftBackZ],
    [-1.9, -12],
    [17.3, -12],
    [17.3, -11.3],
    [18.2, -11.3],
    [18.2, -1.3],
    [annexX0, -1.3],
    [annexX0, 0],
    [blockX0, 0],
    [blockX0, -0.3],
    [entranceX1, -0.3],
    [entranceX1, -2.5],
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

  ext(PLAN, 0, TOP, COL.wall);
  ext(offset(PLAN, 0.1 * OUT), 0, 0.35, COL.cap, "minor", [
    offset(PLAN, -0.2 * OUT),
  ]);
  {
    const g = new THREE.ShapeGeometry(toShape(offset(PLAN, -0.6 * OUT)));
    g.rotateX(-Math.PI / 2);
    g.translate(0, TOP + 0.03, 0);
    add(g, COL.roofInner, "minor");
  }

  addBox(-27.8, -27.5, 0, H, leftBackZ, leftBackZ + 0.7, COL.pier);
  addBox(-27.8, -27.5, 0, H, -19.4, -18.7, COL.pier);
  addBox(-27.9, -27.5, H, TOP, leftBackZ, -18.7, COL.cap);

  win(-21.75, -21.6, 0, 6.3, 3.95, 7.4, { cols: 6, rows: 3 });
  const terraceFront = -19.0;
  const terraceY1 = 3.75;
  const wingX = (z) => W0[0] + (DV[0] * (z - W0[1])) / DV[1];
  ext(
    [
      [-25.8, -21.6],
      W0,
      [wingX(terraceFront), terraceFront],
      [-25.8, terraceFront],
    ],
    0,
    terraceY1,
    COL.wall,
  );
  ext(
    [
      [-25.95, -21.6],
      W0,
      [wingX(terraceFront + 0.55), terraceFront + 0.55],
      [-25.95, terraceFront + 0.55],
    ],
    terraceY1,
    0.22,
    COL.cap,
    "minor",
  );
  addBox(
    -25.8,
    wingX(terraceFront + 0.4),
    terraceY1 - 0.75,
    terraceY1,
    terraceFront,
    terraceFront + 0.4,
  );
  addBox(-25.8, -24.4, 0, terraceY1 - 0.75, terraceFront, terraceFront + 0.4);
  win(-20.3, terraceFront, 0, 8.2, 0.4, terraceY1 - 0.75, {
    cols: 4,
    sill: false,
  });
  capped(-18.4, -16.6, -22.0, -20.6, TOP + 0.45);
  win(-17.5, -22.0, 0, 1.1, terraceY1, 5.7, { cols: 1, sill: false });
  addBox(-18.7, -16.3, 5.75, 6.1, -23.0, -22.0, COL.roof);
  const wingLength = Math.hypot(-9.9 - W0[0], -2.5 - W0[1]);
  const stairTop = (terraceFront - W0[1]) / DV[1] + 0.05;
  const stairSteps = 6;
  const stairRun = 0.5;
  const landingLength = 1.4;
  const landingY = terraceY1 / 2;
  const flightStart = stairTop + landingLength;
  const stairBottom = flightStart + stairSteps * stairRun;
  const innerOut = 1.45;
  const outerOut = 2.9;
  const balconyEnd = wingLength - 0.5;
  {
    boxW(stairTop, flightStart, 0, landingY, 0, outerOut, COL.step, "light");
    for (let i = 0; i < stairSteps; i++) {
      const u0 = flightStart + i * stairRun;
      const u1 = u0 + stairRun;
      const upTop = landingY + ((terraceY1 - landingY) * (i + 1)) / stairSteps;
      const downTop = (landingY * (stairSteps - i)) / (stairSteps + 1);
      boxW(u0, u1, 0, upTop, 0.05, innerOut, COL.step, "light");
      boxW(u0, u1, 0, downTop, innerOut, outerOut, COL.step, "light");
    }
    const sideTop = 0.15;
    const profile = [
      [stairTop, 0],
      [stairTop, landingY + sideTop],
    ];
    for (let i = 0; i < stairSteps; i++) {
      const top = (landingY * (stairSteps - i)) / (stairSteps + 1) + sideTop;
      profile.push(
        [flightStart + i * stairRun, top],
        [flightStart + (i + 1) * stairRun, top],
      );
    }
    profile.push([stairBottom, 0]);
    const side = new THREE.ExtrudeGeometry(
      new THREE.Shape(profile.map(([u, y]) => new THREE.Vector2(u, y))),
      { depth: 0.3, bevelEnabled: false },
    );
    side.translate(0, 0, outerOut);
    side.rotateY(AW);
    side.translate(W0[0], 0, W0[1]);
    add(side, COL.wall, "major", { angle: 30 });
    boxW(stairBottom, balconyEnd, terraceY1 - 0.9, terraceY1, 0, 1.6, COL.cap);
    boxW(stairBottom, balconyEnd, terraceY1, terraceY1 + 0.45, 1.35, 1.6);
  }

  // 뒤쪽은 언덕이라 왼쪽 동 1·2층이 땅속, 3층에 출입구
  const floor3 = FLOOR * 2;
  win(-15.7, leftBackZ, Math.PI, 2.2, floor3 + 0.6, floor3 + 1.9, { cols: 3 });
  win(-22.4, leftBackZ, Math.PI, 2.2, floor3 + 0.6, floor3 + 1.9, { cols: 3 });
  win(-13.6, leftBackZ, Math.PI, 0.5, floor3 + 2.05, floor3 + 2.4, {
    cols: 1,
    sill: false,
  });
  win(-24.5, leftBackZ, Math.PI, 0.5, floor3 + 2.05, floor3 + 2.4, {
    cols: 1,
    sill: false,
  });
  win(-19.05, leftBackZ, Math.PI, 3.6, floor3, floor3 + 2.0, {
    cols: 4,
    top: 0x86bfe9,
    bottom: 0xb8ddf6,
    sill: false,
  });
  addBox(
    -21.3,
    -16.8,
    floor3 + 2.05,
    floor3 + 2.3,
    leftBackZ - 1.9,
    leftBackZ,
    COL.roof,
  );
  [-1, 1].forEach((s) =>
    addBox(
      -19.05 + s * 0.28 - 0.04,
      -19.05 + s * 0.28 + 0.04,
      floor3 + 0.6,
      floor3 + 1.4,
      leftBackZ - 0.22,
      leftBackZ - 0.1,
      0x2b3d4d,
      null,
    ),
  );

  winW(0.8, wingLength - 1.0, 6.15, 7.15, { cols: 9 });
  winW(0.8, wingLength - 1.0, 4.35, 5.25, { cols: 9 });
  winW(stairBottom + 0.5, wingLength - 3.4, 0.35, 2.45, { cols: 7, rows: 1 });
  boxW(balconyEnd, wingLength + 0.3, 3.5, 3.85, 0, 1.0, COL.cap);

  winE(6.6, 8.4, FLOOR + 0.6, FLOOR + 1.9, { cols: 2 });
  {
    const c = on(E0, 10.6);
    boxOn(
      c[0],
      c[1],
      AE,
      -1.3,
      1.3,
      FLOOR,
      FLOOR + 2.1,
      -0.05,
      0.08,
      0x9a7f6a,
      "frame",
    );
    boxOn(
      c[0],
      c[1],
      AE,
      -1.8,
      1.8,
      FLOOR + 2.15,
      FLOOR + 2.45,
      0,
      1.3,
      COL.roof,
      "major",
    );
  }
  [13.3, 14.8, 16.3, 17.8].forEach((t) =>
    winE(t - 0.45, t + 0.45, 3.9, 4.7, { cols: 1 }),
  );
  {
    const wingCorner = [wingEastX(leftBackZ), leftBackZ];
    const wingOut = [0.939 * 0.02, -0.344 * 0.02];
    [FLOOR, FLOOR * 2].forEach((y) => {
      seg(
        "minor",
        [-27.5, y, leftBackZ - 0.02],
        [wingCorner[0], y, leftBackZ - 0.02],
      );
      seg(
        "minor",
        [wingCorner[0] + wingOut[0], y, wingCorner[1] + wingOut[1]],
        [-1.9 + wingOut[0], y, -12 + wingOut[1]],
      );
      seg("minor", [-1.9, y, -12.02], [17.3, y, -12.02]);
      seg("minor", [18.22, y, -11.3], [18.22, y, -3.2]);
    });
  }

  {
    const x0 = -9.9;
    const x1 = pierWestX1;
    const zb = -3.6;
    const zf = 0.4;
    const h = TOP + 1.25;
    capped(x0, x1, zb, zf, h);
    win(x0, (zb + zf) / 2, -Math.PI / 2, 0.9, 0.5, h - 1.2, {
      cols: 1,
      rows: 7,
      sill: false,
    });
    addBox(x0 + 0.3, x0 + 0.5, 0.5, h - 0.9, zf, zf + 0.3, COL.pier, "minor");
    addBox(x0 + 1.9, x0 + 2.1, 0.5, h - 0.9, zf, zf + 0.3, COL.pier, "minor");
    addBox(
      x0 + 0.3,
      x0 + 2.1,
      h - 1.1,
      h - 0.9,
      zf,
      zf + 0.3,
      COL.pier,
      "minor",
    );
    win(x0 + 1.55, zf + 0.02, 0, 0.6, 0.6, h - 1.15, {
      cols: 1,
      rows: 7,
      sill: false,
    });
  }
  addBox(-9.9 - 1.9, -9.9, 0, 3.5, -1.6, 0.2);
  addBox(-9.9 - 2.1, -9.7, 3.5, 3.85, -1.8, 0.4, COL.cap);
  addBox(pierWestX1, entranceX1, 0, TOP + 0.75, -5, -0.6);
  addBox(
    pierWestX1 - 0.12,
    entranceX1 + 0.12,
    TOP + 0.75,
    TOP + 1.05,
    -5.12,
    -0.48,
    COL.roof,
    "minor",
  );
  {
    const cx = (fx(222) + fx(305)) / 2;
    const doorW = fx(305) - fx(222);
    win(cx, -0.6, 0, fx(307) - fx(220), 5.2, 7.55, { cols: 2, rows: 2 });
    addBox(fx(193), fx(333), 4.45, 5.05, -0.6, 2.75, COL.cap, "minor");
    addBox(fx(200), fx(326), 3.65, 4.45, -0.6, 2.6, COL.roof, "major");
    [
      [fx(205), fx(220)],
      [fx(305), fx(322)],
    ].forEach(([a, b]) =>
      addBox(a, b, 0.45, 3.65, 1.85, 2.45, COL.pier, "major"),
    );
    win(cx, -0.6, 0, doorW, 0.45, 3.45, {
      cols: 4,
      top: 0x86bfe9,
      bottom: 0xb8ddf6,
      sill: false,
    });
    addBox(
      cx - doorW / 2,
      cx + doorW / 2,
      2.7,
      2.8,
      -0.6,
      -0.42,
      0x3a5872,
      null,
    );
    [-1, 1].forEach((s) =>
      addBox(
        cx + s * 0.25 - 0.04,
        cx + s * 0.25 + 0.04,
        1.2,
        2.1,
        -0.42,
        -0.34,
        0x2b3d4d,
        null,
      ),
    );
    addBox(fx(195), fx(332), 0, 0.45, -0.6, 2.9, COL.step, "light");
    addBox(fx(200), fx(327), 0, 0.22, 2.9, 3.5, COL.step, "light");
  }
  ROWS.forEach((y) => ribbonZ(fx(368), fx(630), 0, y, ROW_H, 0, 8));
  capped(pierEastX0, 18.2, -3.2, -0.4, TOP + 1.25);
  addBox(annexX0, annexX1, 0, 5.1, -1.0, 2.2);
  addBox(annexX0 - 0.15, annexX1 + 0.15, 5.1, 5.45, -1.15, 2.35, COL.roof);

  // 입면3 px → m (뒤에서 본 그림이라 x가 반대)
  {
    const bx = (v) => 18.2 - (v - 55) * 0.02803;
    const zb = -12;
    [
      [55, 85],
      [155, 185],
      [450, 487],
      [737, 772],
    ].forEach(([a, b]) => {
      addBox(bx(b), bx(a), 0, TOP, zb - 0.8, zb);
    });
    [
      [200, 250],
      [365, 437],
    ].forEach(([a, b]) =>
      [6.7, 3.85].forEach((y) =>
        ribbonZ(bx(b), bx(a), zb, y, 0.62, Math.PI, 3),
      ),
    );
    win((bx(270) + bx(345)) / 2, zb, Math.PI, bx(270) - bx(345), 0.3, 7.3, {
      cols: 2,
      rows: 5,
      sill: false,
    });
    [[505, 722]].forEach(([a, b]) =>
      [6.7, 3.85].forEach((y) =>
        ribbonZ(bx(b), bx(a), zb, y, 0.62, Math.PI, 9),
      ),
    );
    const entranceEast = bx(75);
    const entranceWest = bx(170);
    addBox(entranceWest, entranceEast, 0, 4.85, zb - 2.0, zb);
    win((bx(92) + bx(152)) / 2, zb - 2.0, Math.PI, bx(92) - bx(152), 2.1, 4.2, {
      cols: 3,
      top: 0x86bfe9,
      bottom: 0xb8ddf6,
      sill: false,
    });
    addBox(bx(173), bx(68), 4.85, 5.6, zb - 2.7, zb, COL.roof);
  }

  return finish({
    scale,
    castShadow,
    vent: [8, TOP, -6],
    lines: {
      major: [0x868d93, 1],
      minor: [0xb6bcc1, 1],
      frame: [0x6a87a3, 1],
      mull: [0x8fb0cc, 1],
      light: [0xc8cdd1, 1],
    },
  });
}
