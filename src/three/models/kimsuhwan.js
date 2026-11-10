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

  const tower = { x0: -13, x1: 13, z0: -37.5, z1: 9, h: 64.6 };
  const court = { x0: -36, x1: tower.x0, z0: -26, z1: -6 };
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
    if (y > 40)
      for (let z = -12.6; z > tower.z0 + 1; z -= 5.6)
        win("-x", tower.x0, z - 0.55, z + 0.55, y - 0.2, y + 1.6);
  }
  for (let y = 6; y < 62; y += 3) {
    ribbon("+x", tower.x1, -2, 7.6, y);
    if (y > 12) ribbon("+x", tower.x1, tower.z0 + 6.8, -2.8, y);
  }
  const wingH = 38.2;
  for (let y = 32.4; y < wingH - 1; y += 3)
    ribbon("+z", -2, -32.5, -14, y, 1.2);
  for (let y = 4.4; y < wingH - 1; y += 3) {
    ribbon("-x", tower.x0, court.z0 + 0.6, court.z1 - 0.6, y, 1.2);
    ribbon("+z", court.z0, court.x0 + 0.8, court.x1 - 0.8, y, 1.2);
    ribbon("-z", court.z1, court.x0 + 0.8, court.x1 - 0.8, y, 1.2);
    ribbon("+x", court.x0, court.z0 + 0.6, court.z1 - 0.6, y, 1.2);
  }
  {
    const outline = [
      [-44.5, tower.z0],
      [tower.x0, tower.z0],
      [tower.x0, court.z0],
      [court.x0, court.z0],
      [court.x0, court.z1],
      [tower.x0, court.z1],
      [tower.x0, -2],
      [-33, -2],
      [-33, 4],
      [-44.5, 4],
    ];
    const rim = 0.5;
    const inner = [
      [-44.5 + rim, tower.z0 + rim],
      [tower.x0 - rim, tower.z0 + rim],
      [tower.x0 - rim, court.z0 - rim],
      [court.x0 - rim, court.z0 - rim],
      [court.x0 - rim, court.z1 + rim],
      [tower.x0 - rim, court.z1 + rim],
      [tower.x0 - rim, -2 - rim],
      [-33 - rim, -2 - rim],
      [-33 - rim, 4 - rim],
      [-44.5 + rim, 4 - rim],
    ];
    ext(outline, 0, wingH, COL.wall);
    ext(outline, wingH, 0.6, COL.roof, "minor", [inner]);
  }
  for (let y = 6; y < wingH - 1; y += 3)
    ribbon("-x", -44.5, tower.z0 + 1, 2, y, 1.2);

  addBox(-40, -13, 0, 31, -3, 6);
  parapet(-40, -13, -3, 6, 31);
  win("+z", 6, -39.6, -32.4, 12, 25.8, { cols: 3, rows: 5, out: 0.3 });
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 6; c++) {
      const x = -31.2 + c * 2.25;
      const y = 12.4 + r * 3.1;
      win("+z", 6, x, x + 1.5, y, y + 1.9);
    }
  addBox(-44.5, -38, 0, 28, -1.5, 11);
  parapet(-44.5, -38, -1.5, 11, 28);
  for (let y = 4; y < 27; y += 3.6) {
    win("-x", -44.5, 8.6, 9.8, y, y + 1.9);
    win("-x", -44.5, 5.2, 6.4, y, y + 1.9);
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
  const podium = { x0: -44.5, x1: 13, z0: 11, z1: 15, h: 10.3 };
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
  addBox(-44.5, 9, 0, rearY, tower.z0 - 3, tower.z0);
  addBox(
    -44.7,
    9.2,
    rearY,
    rearY + 0.5,
    tower.z0 - 3.2,
    tower.z0,
    COL.roof,
    "minor",
  );
  {
    const x0 = 4;
    const x1 = tower.x1 + 0.6;
    const z0 = tower.z0 - 0.6;
    const z1 = tower.z0 + 6;
    const top = tower.h + 1.5;
    addBox(x0, x1, 0, top, z0, tower.z0 + 0.01);
    addBox(tower.x1 - 0.01, x1, 0, top, tower.z0, z1);
    addBox(x0 - 0.2, x1 + 0.2, top, top + 0.6, z0 - 0.2, z1, COL.roof, "minor");
    win("-z", z0, x0 + 0.6, x1 - 0.6, 50.2, tower.h - 0.2, {
      cols: 3,
      rows: 4,
      out: 0.25,
    });
    win("+x", x1, tower.z0 + 0.4, z1 - 0.6, 50.2, tower.h - 0.2, {
      cols: 2,
      rows: 4,
      out: 0.25,
    });
    for (let y = rearY + 3.6; y < 48; y += 4)
      win("-z", z0, x0 + 1.2, x1 - 1.2, y - 0.6, y + 0.6, { cols: 2 });
    win("+x", x1, tower.z0 + 2, tower.z0 + 4, rearY + 2, 47.4, {
      rows: 10,
      out: 0.2,
    });
  }
  {
    const z = tower.z0;
    win("-z", z, 1, 3, rearY + 7.9, 62.2, { rows: 11, out: 0.3 });
    for (let k = 0; k < 10; k++) {
      const y = 20 + k * 4;
      win("-z", z, -3.4, -0.2, y - 0.6, y + 0.6, { cols: 2 });
      win("-z", z, -8.2, -5, y - 0.6, y + 0.6, { cols: 2 });
      win("-z", z, -11.2, -10, y - 0.6, y + 0.6);
    }
    win("-z", z, -11.2, -10, 60.4, 61.6);
    [2, -2.2, -6.4].forEach((x) =>
      win("-z", z, x - 0.55, x + 0.55, rearY + 2.3, rearY + 6),
    );
    for (let y = rearY + 7.9; y < 64; y += 4)
      seg("minor", [-13, y, z - 0.02], [4, y, z - 0.02]);
  }
  {
    const z = tower.z0;
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
  }
  [20.6, 24.6, 28.6, 32.6, 36.4].forEach((y) =>
    [-36.2, -38.6].forEach((x) =>
      win("-z", tower.z0, x - 0.45, x + 0.45, y - 0.65, y + 0.65),
    ),
  );
  [-36.2, -38.6].forEach((x) =>
    win("-z", tower.z0, x - 0.5, x + 0.5, rearY + 2.5, rearY + 5.8),
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
    vent: [tower.x0 + 7, tower.h + 1.5, tower.z1 - 10],
    ventAngle: Math.PI / 2,
    lines: {
      major: [0x8f969d, 1.1],
      minor: [0xa4aab0, 0.85],
      mull: [0x9cc4e6, 0.8],
      light: [0xb9bec3, 0.7],
    },
  });
}
