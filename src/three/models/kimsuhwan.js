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
  const { seg, add, B, ext, finish } = createKit("김수환관", {
    wall: COL.wall,
    shade: [0.06, 0.1, 0.12, 0.2, 0.18],
  });

  function parapet(x0, x1, z0, z1, y, t = 0.5, h = 0.6) {
    B(x0, x1, y, y + h, z0, z0 + t, COL.roof, "minor");
    B(x0, x1, y, y + h, z1 - t, z1, COL.roof, "minor");
    B(x0, x0 + t, y, y + h, z0 + t, z1 - t, COL.roof, "minor");
    B(x1 - t, x1, y, y + h, z0 + t, z1 - t, COL.roof, "minor");
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
    const s = face[0] === "+" ? 1 : -1,
      p0 = Math.min(plane - 0.05 * s, plane + out * s),
      p1 = Math.max(plane - 0.05 * s, plane + out * s);
    if (face[1] === "z") {
      B(a0, a1, y0, y1, p0, p1, hex, "minor");
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
      B(p0, p1, y0, y1, a0, a1, hex, "minor");
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

  const T = { x0: -13, x1: 13, z0: -9, z1: 9, h: 64.6 };
  B(T.x0, T.x1, 0, T.h, T.z0, T.z1);
  B(T.x0 - 0.4, T.x1 + 0.4, T.h, T.h + 1.5, T.z0 - 0.4, T.z1 + 0.4, COL.roof);
  parapet(T.x0 - 0.4, T.x1 + 0.4, T.z0 - 0.4, T.z1 + 0.4, T.h + 1.5, 0.6, 0.5);
  B(1, 12.6, T.h + 1.5, T.h + 4.2, -8.4, 7, COL.roof);
  B(0.6, 13, T.h + 4.2, T.h + 4.8, -8.8, 7.4, COL.roof);
  const PANEL = { x1: -5.6, y0: 42.2, y1: 51.6 };
  for (let k = 0; k < 17; k++) {
    const y = 59.8 - 3 * k;
    const inPanel = y > PANEL.y0 - 1 && y < PANEL.y1 + 1;
    ribbon("+z", T.z1, inPanel ? PANEL.x1 + 0.8 : T.x0 + 2.2, T.x1 - 1.4, y);
  }
  win("+z", T.z1, T.x0 - 0.2, PANEL.x1, PANEL.y0, PANEL.y1, {
    cols: 3,
    rows: 3,
    out: 0.6,
  });
  B(T.x0 - 1, -7.4, 24.2, 28.2, 4, T.z1 + 0.7, COL.accent, "major");
  for (let y = 27; y < 62; y += 3) {
    win("-x", T.x0, 6, 7.1, y - 0.2, y + 1.6);
    win("-x", T.x0, -3.6, -2.5, y - 0.2, y + 1.6);
  }
  for (let y = 6; y < 62; y += 3) {
    ribbon("+x", T.x1, -2, 7.6, y);
    ribbon("-z", T.z0, T.x0 + 1.5, T.x1 - 1.5, y);
  }
  const GC = { x0: 11, x1: 22, z0: -9.5, z1: -4.5, h: T.h + 1.6 };
  B(GC.x0, GC.x1, 0, GC.h, GC.z0, GC.z1, COL.glass);
  B(
    GC.x0 - 0.2,
    GC.x1 + 0.2,
    GC.h,
    GC.h + 0.5,
    GC.z0 - 0.2,
    GC.z1 + 0.2,
    COL.roof,
    "minor",
  );
  for (let y = 3; y < GC.h; y += 3) {
    seg("mull", [T.x1, y, GC.z1 + 0.02], [GC.x1, y, GC.z1 + 0.02]);
    seg("mull", [GC.x1 + 0.02, y, GC.z0], [GC.x1 + 0.02, y, GC.z1]);
  }
  [15.5, 18.8].forEach((x) =>
    seg("mull", [x, 0, GC.z1 + 0.02], [x, GC.h, GC.z1 + 0.02]),
  );
  seg("mull", [GC.x1 + 0.02, 0, -7], [GC.x1 + 0.02, GC.h, -7]);

  B(-34, -13, 0, 34, -12, -2);
  parapet(-34, -13, -12, -2, 34);
  for (let y = 24.4; y < 33; y += 3) ribbon("+z", -2, -32.5, -14, y, 1.2);
  for (let y = 6; y < 33; y += 3) ribbon("-z", -12, -32, -14, y, 1.2);
  B(-41, -33, 0, 34, -12, 4);
  parapet(-41, -33, -12, 4, 34);
  for (let y = 6; y < 33; y += 3) ribbon("-x", -41, -10, 2, y, 1.2);

  B(-40, -17, 0, 31, -3, 6);
  parapet(-40, -17, -3, 6, 31);
  win("+z", 6, -39.6, -32.4, 12, 25.8, { cols: 3, rows: 5, out: 0.3 });
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 6; c++) {
      const x = -31.2 + c * 2.25,
        y = 12.4 + r * 3.1;
      win("+z", 6, x, x + 1.5, y, y + 1.9);
    }
  B(-17, -13, 0, 29.5, -3, 4.5);
  parapet(-17, -13, -3, 4.5, 29.5, 0.4, 0.5);
  B(-44.5, -38, 0, 28, -1.5, 9.4);
  parapet(-44.5, -38, -1.5, 9.4, 28);
  for (let y = 4; y < 27; y += 3.6) {
    win("-x", -44.5, 7.2, 8.4, y, y + 1.9);
    win("-x", -44.5, 1.2, 2.4, y, y + 1.9);
  }

  B(-38, -13, 0, 9.8, 6, 12);
  B(-37, -27, 9.8, 13.2, 7.5, 11.2, COL.glass, "minor");
  B(-37.3, -26.7, 13.2, 13.7, 7.2, 11.5, COL.roof, "minor");
  B(-24, -13.5, 9.8, 13.2, 7.5, 11.2, COL.glass, "minor");
  B(-24.3, -13.2, 13.2, 13.7, 7.2, 11.5, COL.roof, "minor");
  [
    [-37, -27],
    [-24, -13.5],
  ].forEach(([a, b]) => {
    for (let x = a + 1.6; x < b; x += 1.6)
      seg("mull", [x, 9.8, 11.22], [x, 13.2, 11.22]);
  });
  const P = { x0: -40, x1: 15.8, z0: 11, z1: 15, h: 10.3 };
  B(P.x0, P.x1, 0, P.h, P.z0, P.z1);
  parapet(P.x0, P.x1, P.z0, P.z1, P.h, 0.5, 0.6);
  win("+z", P.z1, -37.4, -35.8, 0.5, 5.4);
  win("+z", P.z1, 7.3, 8.8, 0.5, 7.6);
  [
    [-35.3, -30.4],
    [-29.8, -20.6],
    [-4, 3.4],
  ].forEach(([a, b]) => {
    win("+z", P.z1, a, b, 3.8, 5, { cols: Math.round((b - a) / 1.7) });
    win("+z", P.z1, a, b, 1.2, 2.4, { cols: Math.round((b - a) / 1.7) });
  });
  B(-20.2, -18.6, 0, 7.4, P.z1, P.z1 + 0.7);
  B(-6, -4.4, 0, 7.4, P.z1, P.z1 + 0.7);
  B(-20.2, -4.4, 5.6, 7.4, P.z1, P.z1 + 0.7);
  win("+z", P.z1 - 0.2, -18.6, -6, 0, 5.6, { cols: 6, rows: 2, out: 0.1 });

  B(13, 35, 10.1, 15.3, -3, 2, COL.glass);
  B(13, 35.2, 15.3, 16.7, -3.2, 2.2, COL.roof);
  for (let x = 14.3; x < 35; x += 1.3) {
    seg("mull", [x, 10.1, 2.02], [x, 15.3, 2.02]);
  }
  seg("mull", [13, 12.7, 2.02], [35, 12.7, 2.02]);
  B(24, 25.4, 0, 10.1, -0.7, 0.7);
  const ST = { x0: 26, x1: 34.4, zb: 8.2, zt: 1.4, h: 6.2, n: 14 };
  for (let i = 0; i < ST.n; i++) {
    const z1 = ST.zb - ((ST.zb - ST.zt) * i) / ST.n,
      z0 = ST.zb - ((ST.zb - ST.zt) * (i + 1)) / ST.n,
      y = (ST.h * (i + 1)) / ST.n;
    B(ST.x0, ST.x1, 0, y, z0, z1, COL.roof, "light");
  }
  B(ST.x0 - 0.5, ST.x1 + 0.5, 0, ST.h, ST.zt - 1.4, ST.zt, COL.roof);
  function stringer(x, w) {
    const len = Math.hypot(ST.zb - ST.zt, ST.h),
      g = new THREE.BoxGeometry(w, 1.1, len);
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
  B(34.5, 40.7, 0, 23.8, -12, 4.9);
  parapet(34.5, 40.7, -12, 4.9, 23.8, 0.4, 0.5);
  win("+z", 4.9, 35.6, 39.6, 0, 7.8, { cols: 2, rows: 2, out: 0.1 });
  win("-x", 34.5, -6, -1, 8, 19, { cols: 2, rows: 3 });
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
      ),
      pts = s.getSpacedPoints(80);
    pts.forEach((p) => seg("mull", [p.x, 7.1, -p.y], [p.x, 18.8, -p.y]));
    const ring = s.getPoints(40);
    ring.push(ring[0]);
    [11, 14.9].forEach((y) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i],
          b = ring[i + 1];
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
  const RP = { x0: 44.5, x1: 70, z0: -9.5, z1: 7.2 };
  B(RP.x0, RP.x1, 20.5, 21.1, RP.z0, RP.z1, COL.roof);
  B(39.5, 46, 20.5, 21.1, -11.6, -5, COL.roof);
  B(67, 74.6, 20.5, 21.1, -11.6, -5, COL.roof);
  for (let i = 1; i < 3; i++) {
    const x = RP.x0 + ((RP.x1 - RP.x0) * i) / 3;
    seg("minor", [x, 21.12, RP.z0], [x, 21.12, RP.z1]);
  }
  seg(
    "minor",
    [RP.x0, 21.12, (RP.z0 + RP.z1) / 2],
    [RP.x1, 21.12, (RP.z0 + RP.z1) / 2],
  );

  return finish({
    scale,
    castShadow,
    vent: [6.8, T.h + 4.8, -0.7],
    lines: {
      major: [0x8f969d, 1.1],
      minor: [0xa4aab0, 0.85],
      mull: [0x9cc4e6, 0.8],
      light: [0xb9bec3, 0.7],
    },
  });
}
