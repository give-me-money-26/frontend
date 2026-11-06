import * as THREE from "three";
import { createKit, gradY, onWall } from "./kit.js";

export function buildDasolHall({ scale = 1, castShadow = true } = {}) {
  const COL = {
    wall: 0xfdf3ea,
    roof: 0xfef8f2,
    inner: 0xf6e9df,
    lobby: 0xd9c3b3,
    step: 0xf7eee6,
    pier: 0xfbefe5,
  };
  const { root, seg, add, addBox, ext, boxOn, finish } = createKit("다솔관", {
    wall: COL.wall,
    // 중정 안쪽 벽이 보이도록 양면
    doubleSide: true,
  });

  // 원통은 모서리 선이 안 생겨서 부풀린 뒷면으로 실루엣을 그림
  const hullMat = new THREE.MeshBasicMaterial({
    color: 0x5f666d,
    side: THREE.BackSide,
  });
  hullMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace(
      "#include <begin_vertex>",
      "vec3 transformed = position + normal * 0.045;",
    );
  };
  function round(geo, hex, line) {
    add(geo, hex, line, { angle: 40 });
    root.add(new THREE.Mesh(geo, hullMat));
  }

  function win(
    cx,
    cz,
    ang,
    w,
    y0,
    y1,
    {
      cols = 2,
      top = 0x4a7fb1,
      bottom = 0x7fb0de,
      shade = true,
      out = 0.12,
    } = {},
  ) {
    boxOn(cx, cz, ang, -w / 2, w / 2, y0, y1, -0.05, out, 0, "frame", (g) =>
      gradY(g, top, bottom),
    );
    if (shade) {
      const sh = (y1 - y0) * 0.2;
      boxOn(
        cx,
        cz,
        ang,
        -w / 2 + 0.04,
        w / 2 - 0.04,
        y1 - sh,
        y1 - 0.03,
        out - 0.01,
        out + 0.015,
        0,
        null,
        (g) => gradY(g, 0x1f5283, 0x2c629a),
      );
    }
    const wallPoint = onWall(cx, cz, ang);
    for (let i = 1; i < cols; i++) {
      const u = -w / 2 + (w * i) / cols;
      seg("mull", wallPoint(u, y0, out + 0.03), wallPoint(u, y1, out + 0.03));
    }
  }
  function rowOnSeg(a, b, ang, us, ys, w, h, opt) {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    us.forEach((t) =>
      ys.forEach((y) =>
        win(a[0] + dx * t, a[1] + dz * t, ang, w, y - h / 2, y + h / 2, opt),
      ),
    );
  }

  const F = 3.2;
  const H = 7 * F;
  const LX = 44;
  const ZF = 19;
  const ZB = -19;
  const CH = 4;
  const ROWY = [0, 1, 2, 3, 4, 5, 6].map((i) => i * F + 1.75);
  const WH = 1.15;
  const CY = { x0: 11, x1: 33, z0: -9.5, z1: 8 };
  const outline = [
    [0, ZB],
    [LX, ZB],
    [LX, ZF],
    [CH, ZF],
    [0, ZF - CH],
  ];
  const court = [
    [CY.x0, CY.z0],
    [CY.x1, CY.z0],
    [CY.x1, CY.z1],
    [CY.x0, CY.z1],
  ];

  ext(outline, 0, H, COL.wall, "major", [court]);
  addBox(CY.x0, CY.x1, 0, 0.06, CY.z0, CY.z1, 0xe7ddd3, null);
  ext(
    [
      [-0.3, ZB - 0.3],
      [LX + 0.3, ZB - 0.3],
      [LX + 0.3, ZF + 0.3],
      [CH + 0.1, ZF + 0.3],
      [-0.3, ZF - CH + 0.1],
    ],
    H,
    0.95,
    COL.roof,
    "major",
    [
      [
        [0.5, ZB + 0.5],
        [LX - 0.5, ZB + 0.5],
        [LX - 0.5, ZF - 0.5],
        [CH + 0.3, ZF - 0.5],
        [0.5, ZF - CH - 0.2],
      ],
    ],
  );
  ext(
    [
      [CY.x0 - 0.6, CY.z0 - 0.6],
      [CY.x1 + 0.6, CY.z0 - 0.6],
      [CY.x1 + 0.6, CY.z1 + 0.6],
      [CY.x0 - 0.6, CY.z1 + 0.6],
    ],
    H,
    0.75,
    COL.roof,
    "major",
    [court],
  );
  [
    [CY.x0, CY.z0],
    [CY.x1, CY.z0],
    [CY.x1, CY.z1],
    [CY.x0, CY.z1],
  ].forEach(([x, z]) =>
    addBox(x - 1, x + 1, H + 0.75, H + 1.35, z - 1, z + 1, COL.roof, "minor"),
  );

  const ax = (px) => CH + ((px - 52) / 463) * (LX - CH);
  [
    [77, 119],
    [152, 194],
    [228, 270],
    [304, 346],
    [381, 423],
    [457, 499],
  ].forEach(([a, b]) =>
    ROWY.forEach((y) =>
      win((ax(a) + ax(b)) / 2, ZF, 0, ax(b) - ax(a), y - WH / 2, y + WH / 2),
    ),
  );
  const dz = (px) => ZB + ((px - 117) / 416) * (ZF - CH - ZB);
  [
    [138, 172],
    [187, 221],
    [235, 269],
    [284, 318],
    [333, 367],
    [381, 415],
    [430, 464],
    [479, 513],
  ].forEach(([a, b]) =>
    ROWY.forEach((y) =>
      win(
        0,
        (dz(a) + dz(b)) / 2,
        -Math.PI / 2,
        dz(b) - dz(a),
        y - WH / 2,
        y + WH / 2,
      ),
    ),
  );
  {
    const a = [0, ZF - CH];
    const b = [CH, ZF];
    const ang = -Math.PI / 4;
    rowOnSeg(a, b, ang, [0.3, 0.7], ROWY, 1.35, WH, { cols: 2 });
  }
  const cxp = (px) => LX - 4.5 - ((px - 155) / 515) * (LX - 4.5);
  [
    [165, 213],
    [237, 285],
    [309, 357],
    [384, 432],
    [459, 507],
    [534, 582],
    [609, 657],
  ].forEach(([a, b]) =>
    ROWY.forEach((y) =>
      win(
        (cxp(a) + cxp(b)) / 2,
        ZB,
        Math.PI,
        Math.abs(cxp(b) - cxp(a)),
        y - WH / 2,
        y + WH / 2,
      ),
    ),
  );
  const bz = (px) => ZF - ((px - 178) / 342) * (ZF + 6.9);
  [
    [185, 223],
    [242, 280],
    [299, 337],
    [357, 395],
    [414, 452],
    [471, 509],
  ].forEach(([a, b]) =>
    ROWY.forEach((y) =>
      win(
        LX,
        (bz(a) + bz(b)) / 2,
        Math.PI / 2,
        Math.abs(bz(b) - bz(a)),
        y - WH / 2,
        y + WH / 2,
      ),
    ),
  );
  ROWY.forEach((y) =>
    win(LX, ZB + 0.85, Math.PI / 2, 0.9, y - 0.6, y + 0.6, { cols: 1 }),
  );
  const cw = (a, b, ang, n) => {
    const us = [...Array(n)].map((_, i) => (i + 0.5) / n);
    rowOnSeg(a, b, ang, us, ROWY, 2.2, WH, { cols: 2 });
  };
  cw([CY.x0, CY.z0], [CY.x1, CY.z0], 0, 6);
  cw([CY.x0, CY.z1], [CY.x1, CY.z1], Math.PI, 6);
  cw([CY.x0, CY.z0], [CY.x0, CY.z1], Math.PI / 2, 4);
  cw([CY.x1, CY.z0], [CY.x1, CY.z1], -Math.PI / 2, 4);

  {
    const z0 = -10.3;
    const z1 = -6.9;
    const x1 = LX + 0.8;
    const top = 21.7;
    addBox(LX - 0.2, x1, 0, top, z0, z1);
    addBox(
      LX - 0.25,
      x1 + 0.15,
      top,
      top + 0.35,
      z0 - 0.1,
      z1 + 0.1,
      COL.roof,
      "minor",
    );
    [19.2, 16.2, 13.3].forEach((y) =>
      win(x1, (z0 + z1) / 2, Math.PI / 2, z1 - z0 - 0.3, y - 0.7, y + 0.7, {
        cols: 1,
        shade: false,
        top: 0x4a84c0,
        bottom: 0x6fa7dc,
      }),
    );
    [11.9, 8.2, 5.5].forEach((y) =>
      addBox(
        x1,
        x1 + 0.18,
        y - 0.15,
        y + 0.15,
        z0 - 0.12,
        z1 + 0.12,
        COL.roof,
        "minor",
      ),
    );
    const cz = (z0 + z1) / 2;
    const cyy = 10.0;
    const r = 0.95;
    {
      const g = new THREE.CircleGeometry(r, 32);
      g.rotateY(Math.PI / 2);
      g.translate(x1 + 0.06, cyy, cz);
      gradY(g, 0x5b92c8, 0x8cc0ea);
      add(g, null, null, {
        mat: new THREE.MeshBasicMaterial({ vertexColors: true }),
      });
    }
    for (let k = 0; k < 48; k++) {
      const a0 = (k / 48) * Math.PI * 2;
      const a1 = ((k + 1) / 48) * Math.PI * 2;
      seg(
        "frame",
        [x1 + 0.08, cyy + Math.sin(a0) * r, cz + Math.cos(a0) * r],
        [x1 + 0.08, cyy + Math.sin(a1) * r, cz + Math.cos(a1) * r],
      );
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      seg(
        "frame",
        [x1 + 0.08, cyy, cz],
        [x1 + 0.08, cyy + Math.sin(a) * r, cz + Math.cos(a) * r],
      );
    }
    win(x1, cz, Math.PI / 2, z1 - z0 - 0.2, 5.75, 7.95, {
      cols: 4,
      shade: false,
      top: 0x4a84c0,
      bottom: 0x7ab0e0,
    });
    seg("frame", [x1 + 0.16, 6.6, cz - 0.12], [x1 + 0.16, 7.0, cz - 0.12]);
    seg("frame", [x1 + 0.16, 6.6, cz + 0.12], [x1 + 0.16, 7.0, cz + 0.12]);
  }

  {
    const cx = LX + 3.0;
    const cz = -13.9;
    const r = 4.0;
    const h = H + 4.3;
    const g = new THREE.CylinderGeometry(r, r, h, 48, 1, false);
    g.translate(cx, h / 2, cz);
    round(g, COL.wall, "major");
    const rim = new THREE.Shape();
    rim.absarc(0, 0, r + 0.12, 0, Math.PI * 2);
    const hole = new THREE.Path();
    hole.absarc(0, 0, r - 0.45, 0, Math.PI * 2, true);
    rim.holes.push(hole);
    const rg = new THREE.ExtrudeGeometry(rim, {
      depth: 0.5,
      bevelEnabled: false,
      curveSegments: 48,
    });
    rg.rotateX(-Math.PI / 2);
    rg.translate(cx, h, cz);
    add(rg, COL.roof, "major", { angle: 30 });
    const lid = new THREE.CylinderGeometry(r - 0.45, r - 0.45, 0.1, 48);
    lid.translate(cx, h - 0.25, cz);
    round(lid, COL.inner, "minor");
    for (let y = 3.4; y < h - 0.5; y += 3.4) {
      for (let k = 0; k < 64; k++) {
        const a0 = (k / 64) * Math.PI * 2;
        const a1 = ((k + 1) / 64) * Math.PI * 2;
        seg(
          "minor",
          [cx + Math.cos(a0) * (r + 0.02), y, cz + Math.sin(a0) * (r + 0.02)],
          [cx + Math.cos(a1) * (r + 0.02), y, cz + Math.sin(a1) * (r + 0.02)],
        );
      }
    }
    [[h - 3.0], [4.6]].forEach(([y]) => {
      const rr = 0.62;
      const g2 = new THREE.CircleGeometry(rr, 28);
      g2.rotateY(Math.PI / 2);
      g2.translate(cx + r + 0.05, y, cz);
      gradY(g2, 0x4a84c0, 0x86bbe6);
      add(g2, null, null, {
        mat: new THREE.MeshBasicMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
        }),
      });
      for (let k = 0; k < 36; k++) {
        const a0 = (k / 36) * Math.PI * 2;
        const a1 = ((k + 1) / 36) * Math.PI * 2;
        seg(
          "frame",
          [cx + r + 0.07, y + Math.sin(a0) * rr, cz + Math.cos(a0) * rr],
          [cx + r + 0.07, y + Math.sin(a1) * rr, cz + Math.cos(a1) * rr],
        );
      }
    });
    [55, -50].forEach((deg) => {
      const a = THREE.MathUtils.degToRad(deg);
      const nx = Math.cos(a);
      const nz = Math.sin(a);
      const ang = Math.atan2(nx, nz);
      [1.4, 4.8, 8.2, 11.6, 15.0, 18.4].forEach((y) =>
        win(cx + nx * r, cz + nz * r, ang, 0.42, y, y + 1.6, {
          cols: 1,
          shade: false,
          top: 0x4a84c0,
          bottom: 0x7ab0e0,
          out: 0.08,
        }),
      );
    });
  }

  const WX = LX;
  const WZ = ZF;
  const WT = 18.0;
  const PI_ = 6.6;
  const wing = [
    [WX, WZ - 1],
    [WX + 14, WZ - 1],
    [WX + 14, WZ + 10],
    [WX + 1.8, WZ + 10],
    [WX, WZ + 8.2],
  ];
  ext(wing, PI_ + 0.5, WT - PI_ - 0.5, COL.wall);
  ext(
    wing.map(([x, z]) => [
      x + (x > WX + 7 ? 0.2 : -0.2),
      z + (z > WZ + 5 ? 0.2 : 0),
    ]),
    PI_,
    0.5,
    COL.roof,
    "minor",
  );
  ext(
    [
      [WX - 0.2, WZ - 1.2],
      [WX + 14.2, WZ - 1.2],
      [WX + 14.2, WZ + 10.2],
      [WX + 1.85, WZ + 10.2],
      [WX - 0.2, WZ + 8.3],
    ],
    WT,
    0.55,
    COL.roof,
  );
  const WY = [9.5, 12.5, 15.4];
  [WX + 5.6, WX + 11.0].forEach((x) =>
    WY.forEach((y) => win(x, WZ + 10, 0, 3.6, y - 0.6, y + 0.6)),
  );
  [WZ + 1.6, WZ + 7.0].forEach((z) =>
    WY.forEach((y) => win(WX + 14, z, Math.PI / 2, 3.6, y - 0.6, y + 0.6)),
  );
  WY.forEach((y) =>
    win(WX + 0.9, WZ + 9.1, -Math.PI / 4, 1.5, y - 0.6, y + 0.6, { cols: 1 }),
  );
  addBox(WX - 1.2, WX + 6.2, 0, H + 3.0, WZ - 1.4, WZ + 0.9);
  addBox(WX - 1.2, WX + 6.2, WT, H + 3.0, WZ + 0.9, WZ + 4.6);
  addBox(
    WX - 1.4,
    WX + 6.4,
    H + 3.0,
    H + 3.4,
    WZ - 1.6,
    WZ + 4.8,
    COL.roof,
    "minor",
  );
  const LF = 1.5;
  addBox(WX, WX + 14, 0, LF, WZ - 1, WZ + 8.6, COL.step, "minor");
  addBox(WX, WX + 1.2, LF, PI_, WZ - 1, WZ + 7.6, COL.wall, "minor");
  addBox(WX + 13.4, WX + 14, LF, PI_, WZ - 1, WZ + 8.0, COL.wall, "minor");
  const BZ = WZ + 1.2;
  const GA = [WX + 1.2, WZ + 7.0];
  const GB = [WX + 6.4, BZ + 0.4];
  addBox(WX + 6.4, WX + 13.4, LF, PI_, BZ - 0.35, BZ, COL.lobby, "minor");
  addBox(WX + 1.2, WX + 6.4, LF, PI_, WZ - 1, BZ - 0.35, COL.lobby, null);
  addBox(
    WX + 0.1,
    WX + 13.9,
    PI_ - 0.04,
    PI_,
    WZ - 1,
    WZ + 9.6,
    0xf1e6dd,
    null,
  );
  {
    const dx = GB[0] - GA[0];
    const dz = GB[1] - GA[1];
    const len = Math.hypot(dx, dz);
    const mx = (GA[0] + GB[0]) / 2;
    const mz = (GA[1] + GB[1]) / 2;
    const rot = -Math.atan2(dz, dx);
    const piece = (...args) => boxOn(mx, mz, rot, ...args);
    const y0 = LF;
    const y1 = PI_ - 0.3;
    const ty = y1 - 0.85;
    const h = len / 2;
    piece(-h, h, y0, y1, -0.04, 0.04, 0, null, (g) =>
      gradY(g, 0x3f7cbb, 0x84b8e3),
    );
    const bar = (u0, u1, a, b) =>
      piece(u0, u1, a, b, -0.09, 0.09, 0x3a5872, "frame");
    bar(-h, h, y1 - 0.12, y1);
    bar(-h, h, y0, y0 + 0.12);
    bar(-h, h, ty - 0.06, ty + 0.06);
    const n = 5;
    for (let i = 0; i <= n; i++) {
      const u = -h + (len * i) / n;
      bar(u - 0.07, u + 0.07, y0, y1);
    }
    const du = -h + (len * 2.5) / n;
    bar(du - 0.04, du + 0.04, y0, ty);
    [-1, 1].forEach((sg) =>
      piece(
        du + sg * 0.25 - 0.04,
        du + sg * 0.25 + 0.04,
        y0 + 0.9,
        y0 + 2.0,
        0.1,
        0.2,
        0x2b3d4d,
        null,
      ),
    );
    piece(-h - 0.05, h + 0.05, y1, PI_, -0.15, 0.15, COL.wall, "minor");
  }
  [
    [WX + 8.6, WZ + 4.6],
    [WX + 11.6, WZ + 4.6],
  ].forEach(([x, z]) => {
    const lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(x, PI_ - 0.06, z);
    root.add(lamp);
  });
  const CHK = LF + 0.6;
  const CL = [WX + 1.9, WZ + 8.6];
  const CR = [WX + 12.9, WZ + 8.6];
  addBox(
    CL[0] - 1.05,
    CL[0] + 1.05,
    0,
    CHK,
    CL[1] - 1.0,
    CL[1] + 1.6,
    COL.wall,
  );
  addBox(
    CR[0] - 1.05,
    CR[0] + 1.05,
    0,
    CHK,
    CR[1] - 1.0,
    CR[1] + 1.6,
    COL.wall,
  );
  [CL, CR].forEach(([x, z]) => {
    const g = new THREE.CylinderGeometry(0.65, 0.65, PI_ - CHK, 32);
    g.translate(x, (PI_ + CHK) / 2, z);
    round(g, COL.pier, "major");
  });
  for (let i = 0; i < 5; i++)
    addBox(
      CL[0] + 1.05,
      CR[0] - 1.05,
      0,
      LF - (i * LF) / 5,
      WZ + 8.6 + i * 0.55,
      WZ + 9.15 + i * 0.55,
      COL.step,
      "light",
    );

  [
    [3, 9, -16.5, -12, 1.8],
    [19, 22, -17.8, -15.8, 1.1],
    [7, 14, 9.5, 13, 1.5],
    [15, 22, 10, 13.5, 1.5],
    [36, 41, 14.5, 18.2, 1.4],
    [38, 41, -17.6, -15.5, 1.0],
  ].forEach(([x0, x1, z0, z1, h]) => {
    addBox(x0, x1, H + 0.95, H + 0.95 + h, z0, z1, COL.roof);
    addBox(
      x0 - 0.15,
      x1 + 0.15,
      H + 0.95 + h,
      H + 1.1 + h,
      z0 - 0.15,
      z1 + 0.15,
      COL.roof,
      "minor",
    );
  });
  addBox(CH - 0.5, CH + 2.0, H + 0.95, H + 2.6, ZF - 2.5, ZF + 0.2, COL.roof);

  return finish({
    scale,
    castShadow,
    vent: [27, H + 0.95, -12],
    lines: {
      major: [0x5f666d, 1],
      minor: [0x8e959b, 1],
      frame: [0x1f3f62, 1],
      mull: [0x3f6f9e, 1],
      light: [0xa3abb2, 1],
    },
  });
}
