import * as THREE from "three";
import { createKit } from "./kit.js";

export function buildKimSuHwan({ scale = 1, castShadow = true } = {}) {
  const COL = {
    wall: 0xfef5ed,
    glass: 0xb6defa,
    glassDeep: 0x9fd0f4,
    accent: 0x6a96ca,
    roof: 0xfbf5ef,
  };
  const { seg, add, addBox, ext, finish } = createKit("김수환관", {
    wall: COL.wall,
    shade: [0.06, 0.1, 0.12, 0.2, 0.18],
  });

  function parapet(x0, x1, z0, z1, y, t = 0.5, h = 0.6) {
    addBox(x0, x1, y, y + h, z0, z0 + t, COL.roof, "minor");
    addBox(x0, x1, y, y + h, z1 - t, z1, COL.roof, "minor");
    addBox(x0, x0 + t, y, y + h, z0 + t, z1 - t, COL.roof, "minor");
    addBox(x1 - t, x1, y, y + h, z0 + t, z1 - t, COL.roof, "minor");
  }
  function win(
    face,
    plane,
    a0,
    a1,
    y0,
    y1,
    { cols = 1, rows = 1, hex = COL.glass, out = 0.18 } = {},
  ) {
    const s = face[0] === "+" ? 1 : -1;
    const p0 = Math.min(plane - 0.05 * s, plane + out * s);
    const p1 = Math.max(plane - 0.05 * s, plane + out * s);
    if (face[1] === "z") {
      addBox(a0, a1, y0, y1, p0, p1, hex, "minor");
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
      addBox(p0, p1, y0, y1, a0, a1, hex, "minor");
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
  const ribbon = (face, plane, a0, a1, yc, h = 1.1, pane = 1.6) =>
    win(face, plane, a0, a1, yc - h / 2, yc + h / 2, {
      cols: Math.max(1, Math.round((a1 - a0) / pane)),
    });

  const tower = { x0: -13, x1: 13, z0: -9, z1: 9, h: 64.6 };
  addBox(tower.x0, tower.x1, 0, tower.h, tower.z0, tower.z1);
  addBox(
    tower.x0 - 0.4,
    tower.x1 + 0.4,
    tower.h,
    tower.h + 1.5,
    tower.z0 - 0.4,
    tower.z1 + 0.4,
    COL.roof,
  );
  parapet(
    tower.x0 - 0.4,
    tower.x1 + 0.4,
    tower.z0 - 0.4,
    tower.z1 + 0.4,
    tower.h + 1.5,
    0.6,
    0.5,
  );
  addBox(1, 12.6, tower.h + 1.5, tower.h + 4.2, -8.4, 7, COL.roof);
  addBox(0.6, 13, tower.h + 4.2, tower.h + 4.8, -8.8, 7.4, COL.roof);
  const PANEL = { x1: -5.6, y0: 42.2, y1: 51.6 };
  for (let k = 0; k < 17; k++) {
    const y = 59.8 - 3 * k;
    const inPanel = y > PANEL.y0 - 1 && y < PANEL.y1 + 1;
    ribbon(
      "+z",
      tower.z1,
      inPanel ? PANEL.x1 + 0.8 : tower.x0 + 2.2,
      tower.x1 - 1.4,
      y,
    );
  }
  win("+z", tower.z1, tower.x0 - 0.2, PANEL.x1, PANEL.y0, PANEL.y1, {
    cols: 3,
    rows: 3,
    out: 0.6,
  });
  addBox(
    tower.x0 - 1,
    -7.4,
    24.2,
    28.2,
    4,
    tower.z1 + 0.7,
    COL.accent,
    "major",
  );
  for (let y = 27; y < 62; y += 3) {
    win("-x", tower.x0, 6, 7.1, y - 0.2, y + 1.6);
    win("-x", tower.x0, -3.6, -2.5, y - 0.2, y + 1.6);
  }
  for (let y = 6; y < 62; y += 3) {
    ribbon("+x", tower.x1, -2, 7.6, y);
  }
  const GC = { x0: 11, x1: 22, z0: -9.5, z1: -4.5, h: tower.h + 1.6 };
  const bridgeY = 10.3;
  const glassStep = 58.4;
  addBox(GC.x0, 18.9, bridgeY, GC.h, GC.z0, GC.z1, COL.glass);
  addBox(18.9, GC.x1, bridgeY, glassStep, GC.z0, GC.z1, COL.glass);
  addBox(
    GC.x0 - 0.2,
    19.1,
    GC.h,
    GC.h + 0.5,
    GC.z0 - 0.2,
    GC.z1 + 0.2,
    COL.roof,
    "minor",
  );
  addBox(
    18.9,
    GC.x1 + 0.2,
    glassStep,
    glassStep + 0.5,
    GC.z0 - 0.2,
    GC.z1 + 0.2,
    COL.roof,
    "minor",
  );
  for (let y = bridgeY + 3; y < GC.h; y += 3) {
    seg(
      "mull",
      [tower.x1, y, GC.z1 + 0.02],
      [y < glassStep ? GC.x1 : 18.9, y, GC.z1 + 0.02],
    );
    if (y < glassStep)
      seg("mull", [GC.x1 + 0.02, y, GC.z0], [GC.x1 + 0.02, y, GC.z1]);
  }
  seg("mull", [15.5, bridgeY, GC.z1 + 0.02], [15.5, GC.h, GC.z1 + 0.02]);
  seg("mull", [18.8, bridgeY, GC.z1 + 0.02], [18.8, glassStep, GC.z1 + 0.02]);
  seg("mull", [GC.x1 + 0.02, bridgeY, -7], [GC.x1 + 0.02, glassStep, -7]);

  const wingH = 38.2;
  for (let y = 24.4; y < wingH - 1; y += 3)
    ribbon("+z", -2, -32.5, -14, y, 1.2);
  {
    const outline = [
      [-41, -12],
      [-13, -12],
      [-13, -2],
      [-33, -2],
      [-33, 4],
      [-41, 4],
    ];
    const rim = 0.5;
    const inner = [
      [-41 + rim, -12 + rim],
      [-13 - rim, -12 + rim],
      [-13 - rim, -2 - rim],
      [-33 - rim, -2 - rim],
      [-33 - rim, 4 - rim],
      [-41 + rim, 4 - rim],
    ];
    ext(outline, 0, wingH, COL.wall);
    ext(outline, wingH, 0.6, COL.roof, "minor", [inner]);
  }
  for (let y = 6; y < wingH - 1; y += 3) ribbon("-x", -41, -10, 2, y, 1.2);

  addBox(-40, -17, 0, 31, -3, 6);
  parapet(-40, -17, -3, 6, 31);
  win("+z", 6, -39.6, -32.4, 12, 25.8, { cols: 3, rows: 5, out: 0.3 });
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 6; c++) {
      const x = -31.2 + c * 2.25;
      const y = 12.4 + r * 3.1;
      win("+z", 6, x, x + 1.5, y, y + 1.9);
    }
  addBox(-17, -13, 0, 29.5, -3, 4.5);
  parapet(-17, -13, -3, 4.5, 29.5, 0.4, 0.5);
  addBox(-44.5, -38, 0, 28, -1.5, 9.4);
  parapet(-44.5, -38, -1.5, 9.4, 28);
  for (let y = 4; y < 27; y += 3.6) {
    win("-x", -44.5, 7.2, 8.4, y, y + 1.9);
    win("-x", -44.5, 1.2, 2.4, y, y + 1.9);
  }

  {
    const floorY = 10.3;
    const topY = 13.2;
    const innerZ = 7.5;
    addBox(-38, -13, 0, floorY, 6, 11);
    addBox(-38, -13, floorY, topY, 6, innerZ);
    addBox(-27, -24, floorY, topY, innerZ, 11);
    addBox(-38, -37, floorY, topY, innerZ, 11);
    addBox(-13.5, -13, floorY, topY, innerZ, 11);
    win("+z", innerZ, -37, -27, floorY, topY - 0.3, { cols: 6, out: 0.06 });
    win("+z", innerZ, -24, -13.5, floorY, topY - 0.3, { cols: 6, out: 0.06 });
    addBox(
      -38.2,
      -12.8,
      topY,
      topY + 0.35,
      5.8,
      innerZ + 0.2,
      COL.roof,
      "minor",
    );
    addBox(
      -27.2,
      -23.8,
      topY,
      topY + 0.35,
      innerZ + 0.2,
      11.2,
      COL.roof,
      "minor",
    );
    addBox(
      -38.2,
      -36.8,
      topY,
      topY + 0.35,
      innerZ + 0.2,
      11.2,
      COL.roof,
      "minor",
    );
    addBox(
      -13.7,
      -12.8,
      topY,
      topY + 0.35,
      innerZ + 0.2,
      11.2,
      COL.roof,
      "minor",
    );
  }
  const podium = { x0: -40, x1: 15.8, z0: 11, z1: 15, h: 10.3 };
  addBox(podium.x0, podium.x1, 0, podium.h, podium.z0, podium.z1);
  parapet(podium.x0, podium.x1, podium.z0, podium.z1, podium.h, 0.5, 0.6);
  win("+z", podium.z1, -37.4, -35.8, 0.4, 7.5);
  win("+z", podium.z1, 7.3, 8.8, 0.4, 7.5);
  [
    [-35.3, -30.4],
    [-29.8, -20.8],
    [-3.9, 3.4],
  ].forEach(([a, b]) => {
    win("+z", podium.z1, a, b, 6, 7.5, { cols: Math.round((b - a) / 1.7) });
    win("+z", podium.z1, a, b, 2.4, 4, { cols: Math.round((b - a) / 1.7) });
  });
  {
    const x0 = -20.2;
    const x1 = -4.4;
    const zf = podium.z1 + 1.3;
    addBox(x0, x0 + 1.5, 0, 9.6, podium.z1, zf);
    addBox(x1 - 1.5, x1, 0, 9.6, podium.z1, zf);
    addBox(x0, x1, 7, 9.6, podium.z1, zf);
    addBox(
      x0 - 0.1,
      x1 + 0.1,
      9.6,
      9.9,
      podium.z1,
      zf + 0.1,
      COL.roof,
      "minor",
    );
    win("+z", podium.z1 + 0.1, x0 + 1.5, x1 - 1.5, 0, 7, {
      cols: 7,
      rows: 1,
      out: 0.08,
    });
    seg(
      "mull",
      [x0 + 1.5, 5.6, podium.z1 + 0.2],
      [x1 - 1.5, 5.6, podium.z1 + 0.2],
    );
    addBox(x0 + 0.5, x1 - 0.5, 0, 0.25, zf, zf + 1.4, COL.roof, "light");
  }

  addBox(13, 35, 10.1, 15.3, -3, 2, COL.glass);
  addBox(13, 35.2, 15.3, 16.7, -3.2, 2.2, COL.roof);
  for (let x = 14.3; x < 35; x += 1.3) {
    seg("mull", [x, 10.1, 2.02], [x, 15.3, 2.02]);
  }
  seg("mull", [13, 12.7, 2.02], [35, 12.7, 2.02]);
  addBox(24, 25.4, 0, 10.1, -0.7, 0.7);
  const ST = { x0: 26, x1: 34.4, zb: 8.2, zt: 1.4, h: 6.2, n: 14 };
  for (let i = 0; i < ST.n; i++) {
    const z1 = ST.zb - ((ST.zb - ST.zt) * i) / ST.n;
    const z0 = ST.zb - ((ST.zb - ST.zt) * (i + 1)) / ST.n;
    const y = (ST.h * (i + 1)) / ST.n;
    addBox(ST.x0, ST.x1, 0, y, z0, z1, COL.roof, "light");
  }
  addBox(ST.x0 - 0.5, ST.x1 + 0.5, 0, ST.h, ST.zt - 1.4, ST.zt, COL.roof);
  function stringer(x, w) {
    const len = Math.hypot(ST.zb - ST.zt, ST.h);
    const g = new THREE.BoxGeometry(w, 1.1, len);
    g.rotateX(Math.atan2(ST.h, ST.zb - ST.zt));
    g.translate(x, ST.h / 2 + 0.75, (ST.zb + ST.zt) / 2);
    add(g, COL.roof, "major");
  }
  stringer(ST.x0 - 0.25, 0.5);
  stringer(ST.x1 + 0.25, 0.5);
  stringer((ST.x0 + ST.x1) / 2, 0.3);

  function rrect(x0, x1, z0, z1, r) {
    const s = new THREE.Shape();
    s.moveTo(x1, -z0);
    s.lineTo(x0, -z0);
    s.lineTo(x0, -z1 + r);
    s.absarc(x0 + r, -z1 + r, r, Math.PI, 1.5 * Math.PI, false);
    s.lineTo(x1 - r, -z1);
    s.absarc(x1 - r, -z1 + r, r, 1.5 * Math.PI, 2 * Math.PI, false);
    s.lineTo(x1, -z0);
    return s;
  }
  const AX = { x0: 39, x1: 75, z0: -12, z1: 10.5, r: 4.6 };
  addBox(34.5, 40.7, 0, 19.2, -12, 4.9);
  parapet(34.5, 40.7, -12, 4.9, 19.2, 0.4, 0.5);
  win("-x", 34.5, -6, -1, 7.4, 16.6, { cols: 2, rows: 3 });
  ext(
    rrect(AX.x0 + 1.6, AX.x1 - 1.6, AX.z0, AX.z1 - 1.8, AX.r - 1.6),
    0,
    4.8,
    COL.glassDeep,
  );
  (() => {
    const s = rrect(AX.x0 + 1.6, AX.x1 - 1.6, AX.z0, AX.z1 - 1.75, AX.r - 1.55);
    s.getSpacedPoints(60).forEach((p) => {
      if (-p.y > AX.z0 + 0.5) seg("mull", [p.x, 0, -p.y], [p.x, 4.8, -p.y]);
    });
  })();
  [
    [40.6, 9.6],
    [43, 9.7],
    [51.7, 9.7],
    [64.7, 9.7],
    [72.9, 9.7],
    [74.2, -2],
    [74.2, -9],
  ].forEach(([x, z]) => {
    const g = new THREE.CylinderGeometry(0.6, 0.6, 4.8, 18);
    g.translate(x, 2.4, z);
    add(g, COL.roof, "major", { angle: 40 });
  });
  ext(
    rrect(AX.x0 - 0.6, AX.x1 + 0.6, AX.z0, AX.z1 + 0.6, AX.r + 0.6),
    4.8,
    2.3,
    COL.roof,
  );
  ext(rrect(AX.x0, AX.x1, AX.z0, AX.z1, AX.r), 7.1, 11.7, COL.glass);
  (() => {
    const s = rrect(
      AX.x0 - 0.03,
      AX.x1 + 0.03,
      AX.z0,
      AX.z1 + 0.03,
      AX.r + 0.03,
    );
    const pts = s.getSpacedPoints(80);
    pts.forEach((p) => seg("mull", [p.x, 7.1, -p.y], [p.x, 18.8, -p.y]));
    const ring = s.getPoints(40);
    ring.push(ring[0]);
    [11, 14.9].forEach((y) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        seg("mull", [a.x, y, -a.y], [b.x, y, -b.y]);
      }
    });
  })();
  ext(
    rrect(AX.x0 - 0.3, AX.x1 + 0.3, AX.z0, AX.z1 + 0.3, AX.r + 0.3),
    18.8,
    1.7,
    COL.roof,
  );
  {
    const X0 = 39.8;
    const X1 = 74.2;
    const Z0 = -11.4;
    const Z1 = 9.8;
    const r = 3.8;
    const leftX = 46;
    const leftZ = -4;
    const rightX = 69;
    const rightZ = -6.5;
    const plate = new THREE.Shape();
    plate.moveTo(leftX, -Z0);
    plate.lineTo(rightX, -Z0);
    plate.lineTo(rightX, -rightZ);
    plate.lineTo(X1, -rightZ);
    plate.lineTo(X1, -Z1 + r);
    plate.absarc(X1 - r, -Z1 + r, r, 0, -0.5 * Math.PI, true);
    plate.lineTo(X0 + r, -Z1);
    plate.absarc(X0 + r, -Z1 + r, r, -0.5 * Math.PI, -Math.PI, true);
    plate.lineTo(X0, -leftZ);
    plate.lineTo(leftX, -leftZ);
    plate.lineTo(leftX, -Z0);
    ext(plate, 20.5, 0.6, COL.roof);
    const y = 21.13;
    [1, 2].forEach((i) => {
      const x = X0 + ((X1 - X0) * i) / 3;
      seg("minor", [x, y, Z0], [x, y, Z1]);
      const z = Z0 + ((Z1 - Z0) * i) / 3;
      seg(
        "minor",
        [z < leftZ ? leftX : X0, y, z],
        [z < rightZ ? rightX : X1, y, z],
      );
    });
  }

  const rearY = 10.3;
  addBox(-41, 13, 0, rearY, -15.5, -9);
  addBox(-41, 13.3, rearY, rearY + 0.5, -15.8, -15.2, COL.roof, "minor");
  addBox(-41, -40.4, rearY, rearY + 0.5, -15.2, -12, COL.roof, "minor");
  addBox(12.7, 13.3, rearY, rearY + 0.5, -15.2, -9, COL.roof, "minor");
  {
    const z = GC.z0 - 0.3;
    addBox(GC.x0, GC.x1, bridgeY, glassStep, z, GC.z0 + 0.01);
    addBox(GC.x0, 18.9, glassStep, 54.5, z, GC.z0 + 0.01);
    win("-z", z, 10.7, 18.9, 54.5, 66, { cols: 4, rows: 3, out: 0.25 });
    addBox(9, 23.2, 34.2, 39.7, -11.1, z, COL.glass, "minor");
    addBox(8.8, 23.4, 39.7, 40.3, -11.3, z, COL.roof, "minor");
    addBox(8.8, 23.4, 33.7, 34.2, -11.3, z, COL.roof, "minor");
    for (let x = 10.8; x < 23; x += 1.8)
      seg("mull", [x, 34.2, -11.12], [x, 39.7, -11.12]);
    win("-z", z, 12.8, 18.9, rearY + 2.5, rearY + 5.8, { cols: 4 });
    for (let y = rearY + 7.7; y < glassStep; y += 4.08)
      seg(
        "minor",
        [GC.x0, y, z - 0.02],
        [y < 54.5 ? GC.x1 : 18.9, y, z - 0.02],
      );
  }
  {
    const z = tower.z0;
    win("-z", z, 6.1, 9.1, rearY + 7.9, 62.2, { rows: 11, out: 0.3 });
    for (let k = 0; k < 10; k++) {
      const y = 20 + k * 4;
      win("-z", z, 1.7, 5, y - 0.6, y + 0.6, { cols: 2 });
      win("-z", z, -3.1, 0.3, y - 0.6, y + 0.6, { cols: 2 });
      win("-z", z, -5.8, -4.6, y - 0.6, y + 0.6);
    }
    win("-z", z, -5.8, -4.6, 60.4, 61.6);
    [8.4, 3.6, -0.6].forEach((x) =>
      win("-z", z, x - 0.55, x + 0.55, rearY + 2.3, rearY + 6),
    );
    for (let y = rearY + 7.9; y < 64; y += 4)
      seg("minor", [-13, y, z - 0.02], [11, y, z - 0.02]);
  }
  {
    const z = -12;
    addBox(-13, -11.6, 0, wingH, z, tower.z0);
    const X0 = -11.7;
    const X1 = -31.1;
    const Y0 = rearY + 8.5;
    const Y1 = 37.4;
    const fz = z - 0.9;
    addBox(X1, X0, Y1, Y1 + 0.6, fz, z);
    addBox(X1, X0, Y0 - 0.6, Y0, fz, z);
    addBox(X0 - 0.5, X0, Y0, Y1, fz, z);
    addBox(X1, X1 + 0.5, Y0, Y1, fz, z);
    const cw = (X0 - X1) / 6;
    const ch = (Y1 - Y0) / 6;
    for (let i = 1; i < 6; i++) {
      const x = X1 + cw * i;
      addBox(x - 0.17, x + 0.17, Y0, Y1, fz, z, COL.wall, "minor");
      const y = Y0 + ch * i;
      addBox(X1, X0, y - 0.17, y + 0.17, fz, z, COL.wall, "minor");
    }
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 6; j++) {
        const x = X1 + cw * i;
        const y = Y0 + ch * j;
        win("-z", z, x + 0.45, x + cw - 0.45, y + ch * 0.42, y + ch - 0.4, {
          cols: 2,
          out: 0.08,
        });
      }
    addBox(-24.1, -17.4, rearY + 7.3, rearY + 7.9, z - 1.2, z);
    addBox(-24.1, -23.6, rearY, rearY + 7.3, z - 1.2, z);
    addBox(-17.9, -17.4, rearY, rearY + 7.3, z - 1.2, z);
    win("-z", z, -23.4, -18.9, rearY, rearY + 7, {
      cols: 2,
      rows: 2,
      out: 0.1,
    });
    win("-z", z, -16.5, -12.7, rearY + 2.5, rearY + 5.8, { cols: 3 });
    win("-z", z, -31, -27.7, rearY + 2.5, rearY + 5.8, { cols: 2 });
    seg("minor", [-16.8, rearY + 2.5, -9.1], [11, rearY + 2.5, -9.1]);
  }
  [20.6, 24.6, 28.6, 32.6, 36.4].forEach((y) =>
    [-36.2, -38.6].forEach((x) =>
      win("-z", -12, x - 0.45, x + 0.45, y - 0.65, y + 0.65),
    ),
  );
  [-36.2, -38.6].forEach((x) =>
    win("-z", -12, x - 0.5, x + 0.5, rearY + 2.5, rearY + 5.8),
  );
  {
    const zb = AX.z0 - 0.5;
    const split = 11.2;
    const x0 = AX.x0 - 0.6;
    const x1 = AX.x1 + 0.6;
    const highY = 23.4;
    const lowY = 21.5;
    addBox(x0, x1, 0, split, zb, AX.z0 + 0.02);
    addBox(54.6, x1, split, highY, zb, AX.z0 + 0.02);
    addBox(
      54.4,
      x1 + 0.2,
      highY,
      highY + 0.4,
      zb - 0.2,
      AX.z0 + 0.02,
      COL.roof,
      "minor",
    );
    win("-z", zb, 64, 65.6, 17.4, 18.6);
    addBox(40.6, 54.6, split, lowY, zb - 0.3, AX.z0 + 0.02);
    addBox(
      40.4,
      54.8,
      lowY,
      lowY + 0.4,
      zb - 0.5,
      AX.z0 + 0.02,
      COL.roof,
      "minor",
    );
    win("-z", zb - 0.3, 48.2, 52.9, split, 14.6, { cols: 2, out: 0.1 });
    win("-z", zb - 0.3, 42.1, 46.3, 13.4, 14.4, { cols: 3 });
    addBox(34.8, 40.6, 14.7, 16.8, -13.9, -12, 0x7b838b, "major");
    win("-z", -12, 35.8, 39.4, split, 14.5, { cols: 2, out: 0.1 });
    seg("minor", [40.6, split, -12.02], [34.5, split, -12.02]);
  }

  return finish({
    scale,
    castShadow,
    vent: [6.8, tower.h + 4.8, -0.7],
    lines: {
      major: [0x8f969d, 1.1],
      minor: [0xa4aab0, 0.85],
      mull: [0x9cc4e6, 0.8],
      light: [0xb9bec3, 0.7],
    },
  });
}
