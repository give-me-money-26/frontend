import * as THREE from "three";
import { boxGeo, createKit, gradY } from "./kit.js";

export function buildMariaHall({ scale = 1, castShadow = true } = {}) {
  const COL = {
    wall: 0xfdf1e9,
    roof: 0xfef7f1,
    pier: 0xfbece2,
    inner: 0xf3e5db,
    step: 0xf6ece4,
  };
  const { root, seg, add, addBox, finish } = createKit("마리아관", {
    wall: COL.wall,
  });
  const glassMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });

  function win(
    face,
    plane,
    a0,
    a1,
    y0,
    y1,
    {
      cols = 1,
      rows = 1,
      top = 0x5f95b2,
      bottom = 0x78abc4,
      out = 0.12,
      line = "frame",
      shade = true,
    } = {},
  ) {
    const s = face[0] === "+" ? 1 : -1;
    const p0 = Math.min(plane - 0.05 * s, plane + out * s);
    const p1 = Math.max(plane - 0.05 * s, plane + out * s);
    const g =
      face[1] === "z"
        ? boxGeo(a0, a1, y0, y1, p0, p1)
        : boxGeo(p0, p1, y0, y1, a0, a1);
    gradY(g, top, bottom);
    add(g, null, line);
    if (shade) {
      const sh = (y1 - y0) * 0.22;
      const q0 = plane + (out - 0.01) * s;
      const q1 = plane + (out + 0.015) * s;
      const g2 =
        face[1] === "z"
          ? boxGeo(
              a0 + 0.04,
              a1 - 0.04,
              y1 - sh,
              y1 - 0.03,
              Math.min(q0, q1),
              Math.max(q0, q1),
            )
          : boxGeo(
              Math.min(q0, q1),
              Math.max(q0, q1),
              y1 - sh,
              y1 - 0.03,
              a0 + 0.04,
              a1 - 0.04,
            );
      gradY(g2, 0x1f5675, 0x2f6a8a);
      add(g2, null, null);
    }
    const d = plane + (out + 0.03) * s;
    for (let i = 1; i < cols; i++) {
      const a = a0 + ((a1 - a0) * i) / cols;
      face[1] === "z"
        ? seg("mull", [a, y0, d], [a, y1, d])
        : seg("mull", [d, y0, a], [d, y1, a]);
    }
    for (let j = 1; j < rows; j++) {
      const y = y0 + ((y1 - y0) * j) / rows;
      face[1] === "z"
        ? seg("mull", [a0, y, d], [a1, y, d])
        : seg("mull", [d, y, a0], [d, y, a1]);
    }
  }

  // 정면도 1px = 0.075m
  const px = (v) => (v - 37) * 0.075;
  const py = (v) => (275 - v) * 0.075;
  const D = 13;
  const zf = D / 2;
  const zb = -D / 2;
  const XL = px(490);
  const XT = px(580);
  const XR = px(913);
  const TOP = py(82);
  const CORN = py(75);
  const UNDER = py(190);
  const ROWS = [112, 156, 200, 243].map(py);
  const WH = 1.32;

  addBox(0, XL, 0, TOP, zb, zf);
  addBox(XT, XR, UNDER, TOP, zb, zf);
  addBox(-0.25, XR + 0.25, TOP, CORN, zb - 0.25, zf + 0.25, COL.roof);
  addBox(
    0.15,
    XR - 0.15,
    CORN,
    CORN + 0.07,
    zb + 0.15,
    zf - 0.15,
    COL.roof,
    "minor",
  );
  [
    [0, zb],
    [0, zf],
    [XR, zb],
    [XR, zf],
  ].forEach(([x, z]) => {
    const sx = x ? -1 : 1;
    const sz = z > 0 ? -1 : 1;
    addBox(
      Math.min(x, x + sx * 1.0),
      Math.max(x, x + sx * 1.0),
      CORN,
      CORN + 0.55,
      Math.min(z, z + sz * 0.75),
      Math.max(z, z + sz * 0.75),
      COL.roof,
      "minor",
    );
  });

  const LCOL = [
    [57, 93],
    [110, 146],
    [164, 199],
    [217, 252],
    [270, 306],
    [324, 360],
    [380, 415],
    [433, 469],
  ];
  const RCOL = [
    [590, 626],
    [645, 681],
    [700, 736],
    [754, 790],
    [808, 844],
    [862, 898],
  ];
  [
    ["+z", zf],
    ["-z", zb],
  ].forEach(([face, plane]) => {
    LCOL.forEach(([a, b]) =>
      ROWS.forEach((y) =>
        win(face, plane, px(a), px(b), y - WH / 2, y + WH / 2),
      ),
    );
    RCOL.forEach(([a, b]) =>
      ROWS.slice(0, 2).forEach((y) =>
        win(face, plane, px(a), px(b), y - WH / 2, y + WH / 2),
      ),
    );
  });

  ROWS.forEach((y) => {
    win("-x", 0, -3.8, -1.3, y - WH / 2, y + WH / 2);
    win("-x", 0, 1.3, 3.8, y - WH / 2, y + WH / 2);
  });
  addBox(XR, XR + 0.12, UNDER - 0.05, UNDER + 0.55, zb, zf, COL.roof, "minor");
  addBox(XR, XR + 0.08, 10.9, 11.05, zb, zf, COL.roof, "minor");

  const TW = {
    x0: XL,
    x1: XT,
    zf: zf + 2.0,
    zi: zf + 0.4,
    h: py(55),
    cap: py(45),
  };
  const fr = px(505) - px(490);
  const gy0 = py(265);
  const gy1 = py(71);
  const TZ0 = zf - 4;
  addBox(TW.x0, TW.x1, 0, TOP, zb, TW.zi);
  addBox(TW.x0, TW.x1, TOP, TW.h, TZ0, TW.zi);
  addBox(TW.x0, TW.x0 + fr, 0, TW.h, TW.zi, TW.zf);
  addBox(TW.x1 - fr, TW.x1, 0, TW.h, TW.zi, TW.zf);
  addBox(TW.x0 + fr, TW.x1 - fr, gy1, TW.h, TW.zi, TW.zf);
  addBox(TW.x0 + fr, TW.x1 - fr, 0, gy0, TW.zi, TW.zf);
  addBox(
    TW.x0 - 0.22,
    TW.x1 + 0.22,
    TW.h,
    TW.cap,
    TZ0 - 0.22,
    TW.zf + 0.22,
    COL.roof,
  );
  addBox(
    TW.x0 + 0.25,
    TW.x1 - 0.25,
    TW.cap,
    TW.cap + 0.06,
    TZ0 + 0.1,
    TW.zf - 0.1,
    COL.roof,
    "minor",
  );
  addBox(
    TW.x0 - 0.12,
    TW.x1 + 0.12,
    0,
    py(268),
    zf,
    TW.zf + 0.14,
    COL.roof,
    "minor",
  );
  const IX0 = TW.x0 + fr;
  const IX1 = TW.x1 - fr;
  const IZ = TW.zi + 0.1;
  addBox(IX0, IX1, gy0, gy1, TW.zi, IZ, 0x6f9fb8, "minor");
  const FL = [224, 180, 136, 94].map((v) => py(v));
  const LD = [245, 204, 160, 116].map((v) => py(v));
  const sz0 = IZ + 0.15;
  const sz1 = TW.zf - 0.45;
  const stw = (sz1 - sz0) / 2;
  const stair = (xa, ya, xb, yb, za, zb2) => {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const xs = xa + ((xb - xa) * i) / n;
      const xe = xa + ((xb - xa) * (i + 1)) / n;
      const y = ya + ((yb - ya) * (i + 1)) / n;
      addBox(
        Math.min(xs, xe),
        Math.max(xs, xe),
        y - 0.18,
        y,
        za,
        zb2,
        0xe9eef1,
        "light",
      );
    }
    const len = Math.hypot(xb - xa, yb - ya);
    const g = new THREE.BoxGeometry(len, 0.22, zb2 - za);
    g.rotateZ(Math.atan2(yb - ya, xb - xa));
    g.translate((xa + xb) / 2, (ya + yb) / 2 - 0.25, (za + zb2) / 2);
    add(g, 0xdfe6ea, "light");
  };
  const rail = (xa, ya, xb, yb, z) => {
    seg("frame", [xa, ya + 1.0, z], [xb, yb + 1.0, z]);
    seg("frame", [xa, ya + 0.15, z], [xb, yb + 0.15, z]);
    for (let t = 0; t <= 10; t++) {
      const x = xa + ((xb - xa) * t) / 10;
      const y = ya + ((yb - ya) * t) / 10;
      seg("mull", [x, y + 0.15, z], [x, y + 1.0, z]);
    }
  };
  const yFloors = [gy0, ...FL.slice(0, 3)];
  const landW = 1.25;
  yFloors.forEach((yf, k) => {
    const yl = LD[k] ?? yf + 1.65;
    const yn = FL[k] ?? yf + 3.3;
    addBox(IX0, IX1, yf - 0.2, yf, IZ, TW.zf - 0.3, 0xdfe6ea, "light");
    addBox(IX0, IX0 + landW, yl - 0.2, yl, IZ, TW.zf - 0.3, 0xdfe6ea, "light");
    stair(IX1, yf, IX0 + landW, yl, sz0 + stw, sz1);
    rail(IX1 - 0.1, yf, IX0 + landW, yl, sz1 + 0.05);
    stair(IX0 + landW, yl, IX1, yn, sz0, sz0 + stw);
  });
  addBox(IX0, IX1, FL[3] - 0.2, FL[3], IZ, TW.zf - 0.3, 0xdfe6ea, "light");
  {
    const g = boxGeo(IX0, IX1, gy0, gy1, TW.zf - 0.1, TW.zf - 0.04);
    gradY(g, 0x4f8aa8, 0x9ac6d8);
    add(g, null, null, { mat: glassMat });
    const bar = (x0, x1, y0, y1, d = 0.14) =>
      addBox(x0, x1, y0, y1, TW.zf - 0.12, TW.zf - 0.12 + d, 0x2e6582, null);
    const cw = (IX1 - IX0) / 3;
    bar(IX0, IX0 + 0.14, gy0, gy1);
    bar(IX1 - 0.14, IX1, gy0, gy1);
    for (let i = 1; i < 3; i++) {
      const x = IX0 + cw * i;
      bar(x - 0.07, x + 0.07, gy0, gy1);
    }
    bar(IX0, IX1, gy0, gy0 + 0.14);
    bar(IX0, IX1, gy1 - 0.14, gy1);
    FL.forEach((y) => bar(IX0, IX1, y - 0.09, y + 0.09, 0.16));
    LD.forEach((y) => bar(IX0, IX1, y - 0.05, y + 0.05, 0.12));
    // 유리 테두리 선만 쓰고 상자는 숨김
    addBox(IX0, IX1, gy0, gy1, TW.zf - 0.13, TW.zf - 0.02, 0, "frame").visible =
      false;
  }
  const SB = { x0: XT, x1: px(648), y0: py(240) };
  addBox(SB.x0, SB.x1, SB.y0, UNDER, zb, zf);
  addBox(
    SB.x0 - 0.05,
    SB.x1 + 0.18,
    UNDER - 0.28,
    UNDER,
    zb - 0.1,
    zf + 0.15,
    COL.roof,
    "minor",
  );
  win("+z", zf, px(590), px(632), py(222), py(205));
  win("-z", zb, px(590), px(632), py(222), py(205));
  addBox(px(578), px(583), 0, SB.y0, zf - 0.6, zf, COL.pier, "minor");
  addBox(
    SB.x1,
    XR,
    UNDER - 0.35,
    UNDER,
    zb - 0.05,
    zf + 0.05,
    COL.roof,
    "minor",
  );
  const pier = (xa, xb, z0, z1) =>
    addBox(xa, xb, 0, UNDER - 0.35, z0, z1, COL.pier);
  addBox(px(628), px(648), 0, SB.y0, zf - 0.85, zf, COL.pier);
  const ZR = [
    [zf - 0.85, zf],
    [zf - 3.07, zf - 2.15],
    [zb, zb + 0.8],
  ];
  [
    [738, 765],
    [878, 907],
  ].forEach(([a, b]) => ZR.forEach(([z0, z1]) => pier(px(a), px(b), z0, z1)));
  const FX = SB.x1;
  win("+x", FX, zf - 2.15, zf - 0.85, 4.3, UNDER - 0.4, {
    cols: 2,
    rows: 3,
    shade: false,
    top: 0x6ea5c6,
    bottom: 0x8dbdd8,
  });
  addBox(FX, FX + 0.08, 3.8, 4.3, zf - 2.15, zf - 0.85, 0x777f86, "minor");
  win("+x", FX, -1.2, 1.2, 4.75, 5.3, { cols: 3, shade: false });
  addBox(FX, FX + 0.8, SB.y0, SB.y0 + 1.15, zb + 0.8, zf - 3.07, COL.roof);
  {
    const lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.26, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(
      FX + 0.55,
      SB.y0 - 0.01,
      (zf - 3.07 + zb + 0.8) / 2 - 0.4,
    );
    root.add(lamp);
    const r = new THREE.Mesh(
      new THREE.RingGeometry(0.26, 0.31, 20),
      new THREE.MeshBasicMaterial({ color: 0x8a9299, side: THREE.DoubleSide }),
    );
    r.rotation.x = Math.PI / 2;
    r.position.copy(lamp.position);
    root.add(r);
  }
  const SX = FX - 1.0;
  const dz0 = zf - 8.98;
  const dz1 = zf - 5.65;
  const sz_0 = zb + 2.0;
  const sz_1 = zf - 3.9;
  const ytop = 2.45;
  addBox(XT, SX, 0, SB.y0, zb + 0.8, zf - 2.15, COL.inner, "minor");
  addBox(SX, FX, 0, SB.y0, zf - 3.07, zf - 2.85, COL.wall, "minor");
  addBox(SX, FX, 0, SB.y0, zb + 0.8, zb + 1.02, COL.wall, "minor");
  addBox(SX, SX + 0.35, 0, SB.y0, sz_1, sz_1 + 0.45, COL.pier, "minor");
  addBox(SX, SX + 0.35, 0, SB.y0, sz_0 - 0.45, sz_0, COL.pier, "minor");
  {
    const g = boxGeo(SX, SX + 0.1, 0.5, ytop, sz_0, sz_1);
    gradY(g, 0x6ea5c6, 0x9ccbe2);
    add(g, null, "frame");
    const fb = (z0, z1, y0, y1) =>
      addBox(SX + 0.08, SX + 0.2, y0, y1, z0, z1, 0x3d5568, null);
    fb(sz_0, sz_1, ytop - 0.07, ytop + 0.05);
    fb(sz_0, sz_1, 0.45, 0.55);
    fb(sz_0, sz_1, 1.15, 1.25);
    [
      sz_0,
      sz_0 + (dz0 - sz_0) / 2,
      dz0,
      dz0 + (dz1 - dz0) / 4,
      dz0 + (dz1 - dz0) / 2,
      dz0 + ((dz1 - dz0) * 3) / 4,
      dz1,
      dz1 + (sz_1 - dz1) / 2,
      sz_1,
    ].forEach((z) => fb(z - 0.05, z + 0.05, 0.45, ytop));
    addBox(
      SX + 0.1,
      SX + 0.3,
      ytop + 0.05,
      ytop + 0.38,
      dz0 - 0.1,
      dz1 + 0.1,
      0x5f666c,
      "minor",
    );
    const mz = (dz0 + dz1) / 2;
    [-1, 1].forEach((s) =>
      addBox(
        SX + 0.18,
        SX + 0.28,
        1.35,
        2.15,
        mz + s * 0.22 - 0.04,
        mz + s * 0.22 + 0.04,
        0x2f3e4b,
        null,
      ),
    );
  }
  for (let i = 0; i < 3; i++)
    addBox(
      SX,
      FX + 1.6 - i * 0.55,
      0,
      0.18 * (i + 1),
      zf - 2.2,
      zb + 1.05,
      COL.step,
      "light",
    );
  [zf - 2.3, zb + 1.2].forEach((z) => {
    seg("frame", [SX + 0.2, 1.5, z], [FX + 1.5, 1.15, z]);
    seg("frame", [SX + 0.2, 1.0, z], [FX + 1.5, 0.6, z]);
    for (let t = 0; t <= 4; t++) {
      const x = SX + 0.2 + ((FX + 1.3 - SX) * t) / 4;
      seg("frame", [x, 0.54 - (0.36 * t) / 4, z], [x, 1.5 - (0.35 * t) / 4, z]);
    }
  });
  addBox(SB.x1, XR, UNDER - 0.36, UNDER - 0.34, zb, zf, COL.inner, null);

  return finish({
    scale,
    castShadow,
    vent: [px(250), CORN + 0.07, -1],
    lines: {
      major: [0x6d747b, 1.15],
      minor: [0x9aa1a7, 0.85],
      frame: [0x24435a, 1.0],
      mull: [0x4f7d9c, 0.75],
      light: [0xaab2b9, 0.7],
    },
    solidShadowsOnly: true,
  });
}
