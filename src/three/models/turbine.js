import * as THREE from "three";

export function buildTurbine({ scale = 1, castShadow = true } = {}) {
  const group = new THREE.Group();
  group.name = "터빈";
  const body = new THREE.Group();
  group.add(body);
  const COLORS = {
    body: 0x48a49a,
    bodyDark: 0x358f86,
    hub: 0x338c83,
    blade: 0xcbf4ec,
    line: 0x15403b,
    bladeLine: 0x2a625b,
  };
  const MATS = {
    body: new THREE.MeshStandardMaterial({
      color: COLORS.body,
      roughness: 0.38,
      metalness: 0.08,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: COLORS.bodyDark,
      roughness: 0.42,
      metalness: 0.08,
    }),
    hub: new THREE.MeshStandardMaterial({
      color: COLORS.hub,
      roughness: 0.3,
      metalness: 0.1,
    }),
    blade: new THREE.MeshStandardMaterial({
      color: COLORS.blade,
      roughness: 0.5,
      metalness: 0,
      emissive: 0x8fcfc2,
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
    }),
  };
  const lineMat = new THREE.LineBasicMaterial({
    color: COLORS.line,
    transparent: true,
    opacity: 0.95,
  });
  const bladeLineMat = new THREE.LineBasicMaterial({
    color: COLORS.bladeLine,
    transparent: true,
    opacity: 0.95,
  });
  // 부풀린 뒷면으로 실루엣 외곽선을 그림
  const hullMat = (hex, w) => {
    const m = new THREE.MeshBasicMaterial({ color: hex, side: THREE.BackSide });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace(
        "#include <begin_vertex>",
        "vec3 transformed = position + normal * " + w.toFixed(3) + ";",
      );
    };
    return m;
  };
  const hullBody = hullMat(COLORS.line, 0.05);
  const hullBlade = hullMat(COLORS.bladeLine, 0.035);
  const geos = [];
  function mesh(geo, mat, parent = body, edge = 40, lm = lineMat) {
    geos.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = castShadow;
    m.receiveShadow = true;
    parent.add(m);
    const e = new THREE.EdgesGeometry(geo, edge);
    geos.push(e);
    m.add(new THREE.LineSegments(e, lm));
    m.add(new THREE.Mesh(geo, lm === bladeLineMat ? hullBlade : hullBody));
    return m;
  }
  const lathe = (pts, seg = 48) =>
    new THREE.LatheGeometry(
      pts.map(([r, y]) => new THREE.Vector2(r, y)),
      seg,
    );

  // 측면도 20px = 1
  const NC = { y: 10.1, r: 1.3, x0: -2.4, x1: 2.4 };

  mesh(
    lathe([
      [0, 0],
      [1.95, 0],
      [1.95, 0.62],
      [1.85, 0.72],
      [1.2, 0.78],
      [1.0, 0.9],
      [0, 0.9],
    ]),
    MATS.body,
  );
  mesh(
    lathe(
      [
        [0, 0.85],
        [0.92, 0.85],
        [0.92, 7.6],
        [0.98, 8.1],
        [1.1, 8.5],
        [1.22, 8.9],
        [1.2, 9.4],
        [0, 9.4],
      ],
      48,
    ),
    MATS.body,
  );
  const nac = new THREE.Group();
  nac.position.y = NC.y;
  // lathe의 +y가 월드 -x(로터 쪽)로 가도록 눕힘
  nac.rotation.z = Math.PI / 2;
  body.add(nac);
  mesh(
    lathe(
      [
        [0, -NC.x1 - 0.32],
        [0.55, -NC.x1 - 0.3],
        [1.0, -NC.x1 - 0.18],
        [1.22, -NC.x1 - 0.05],
        [NC.r, -NC.x1 + 0.1],
        [NC.r, -NC.x0 - 0.12],
        [1.4, -NC.x0 - 0.08],
        [1.4, -NC.x0],
        [0, -NC.x0],
      ],
      56,
    ),
    MATS.body,
    nac,
  );
  mesh(
    lathe(
      [
        [0, -NC.x0],
        [0.78, -NC.x0],
        [0.78, -NC.x0 + 0.16],
        [0.62, -NC.x0 + 0.2],
        [0, -NC.x0 + 0.2],
      ],
      40,
    ),
    MATS.dark,
    nac,
  );
  mesh(
    lathe(
      [
        [0, -NC.x0 + 0.15],
        [0.44, -NC.x0 + 0.15],
        [0.44, -NC.x0 + 1.0],
        [0, -NC.x0 + 1.0],
      ],
      32,
    ),
    MATS.body,
    nac,
  );

  const rotor = new THREE.Group();
  rotor.position.set(NC.x0 - 1.0, NC.y, 0);
  group.add(rotor);
  const hubGeo = new THREE.SphereGeometry(
    1.2,
    40,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  hubGeo.rotateZ(Math.PI / 2);
  mesh(hubGeo, MATS.hub, rotor, 60);
  mesh(
    lathe(
      [
        [0, 0],
        [1.2, 0],
        [1.2, 0.18],
        [0, 0.18],
      ],
      40,
    )
      .rotateZ(Math.PI / 2)
      .translate(0.18, 0, 0),
    MATS.hub,
    rotor,
    60,
  );
  const s = new THREE.Shape();
  const hw = 0.85;
  const root = 0.56;
  const tipR = 0.4;
  const rotorRadius = 6.7;
  const taper = 2.55;
  s.moveTo(-root, 0.5);
  s.lineTo(-root, 1.15);
  s.lineTo(-hw * 0.97, taper - 0.15);
  s.quadraticCurveTo(-hw, taper, -hw, taper + 0.25);
  s.lineTo(-hw, rotorRadius - tipR);
  s.quadraticCurveTo(-hw, rotorRadius, -hw + tipR, rotorRadius);
  s.lineTo(hw - tipR, rotorRadius);
  s.quadraticCurveTo(hw, rotorRadius, hw, rotorRadius - tipR);
  s.lineTo(hw, taper + 0.25);
  s.quadraticCurveTo(hw, taper, hw * 0.97, taper - 0.15);
  s.lineTo(root, 1.15);
  s.lineTo(root, 0.5);
  s.closePath();
  const bladeGeo = new THREE.ExtrudeGeometry(s, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 3,
    curveSegments: 12,
  });
  bladeGeo.translate(0, 0, -0.1);
  {
    const p = bladeGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = Math.min(
        1,
        Math.max(0, (p.getY(i) - 1.2) / (rotorRadius - 1.2)),
      );
      p.setZ(i, p.getZ(i) * (1 - 0.5 * t));
    }
    bladeGeo.computeVertexNormals();
  }
  bladeGeo.rotateY(-Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group();
    arm.rotation.x = (i * Math.PI * 2) / 3;
    rotor.add(arm);
    const b = mesh(bladeGeo, MATS.blade, arm, 55, bladeLineMat);
    b.position.x = 0.06;
  }

  group.scale.setScalar(scale);
  const size = new THREE.Box3()
    .setFromObject(group)
    .getSize(new THREE.Vector3());
  return {
    group,
    rotor,
    size,
    dispose() {
      geos.forEach((g) => g.dispose());
      Object.values(MATS).forEach((m) => m.dispose());
      lineMat.dispose();
      bladeLineMat.dispose();
      hullBody.dispose();
      hullBlade.dispose();
    },
  };
}
