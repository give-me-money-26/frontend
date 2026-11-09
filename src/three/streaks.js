import * as THREE from "three";

function streakTexture([head, body, tail]) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, `rgba(${head},0)`);
  gradient.addColorStop(0.25, `rgba(${head},0.95)`);
  gradient.addColorStop(0.7, `rgba(${body},0.7)`);
  gradient.addColorStop(1, `rgba(${tail},0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(60, 2, 256, 7);
  ctx.lineTo(256, 9);
  ctx.quadraticCurveTo(60, 14, 0, 8);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStreaks(count, colors) {
  const tex = streakTexture(colors);
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  // 인스턴스 색의 r 값을 투명도로 사용
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <color_fragment>",
      "#ifdef USE_INSTANCING_COLOR\n diffuseColor.a *= vColor.r;\n#endif",
    );
  };
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const alpha = new Float32Array(count * 3);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(alpha, 3);

  const m4 = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const pos = new THREE.Vector3();
  const size = new THREE.Vector3(1, 1, 1);

  // 줄기 하나를 x축 방향으로 눕히고 카메라 쪽으로 돌려 세움
  function set(i, x, y, z, length, thickness, opacity, eye) {
    euler.set(Math.atan2(-(eye.y - y), eye.z - z), 0, 0);
    quat.setFromEuler(euler);
    pos.set(x + length / 2, y, z);
    size.set(length, thickness, 1);
    mesh.setMatrixAt(i, m4.compose(pos, quat, size));
    alpha[i * 3] = alpha[i * 3 + 1] = alpha[i * 3 + 2] = opacity;
  }

  function commit(visible) {
    mesh.count = visible;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
  }

  return {
    mesh,
    set,
    commit,
    dispose() {
      geo.dispose();
      mat.dispose();
      tex.dispose();
    },
  };
}

export function createAmbientWind(count) {
  const streaks = createStreaks(count, [
    "150,198,204",
    "170,208,214",
    "190,220,224",
  ]);
  const bounds = new THREE.Box3();
  const span = new THREE.Vector3();
  const particles = Array.from({ length: count }, () => ({}));

  const spawn = (p, anywhere) => {
    p.x = bounds.min.x + (anywhere ? Math.random() * span.x : 0);
    p.y = bounds.min.y + Math.random() * span.y;
    p.z = bounds.min.z + Math.random() * span.z;
    p.len = 2 + Math.random() * 4;
    p.v = 0.7 + Math.random() * 0.6;
  };

  function setBounds(box) {
    bounds.copy(box);
    bounds.getSize(span);
    particles.forEach((p) => spawn(p, true));
  }

  function update(dt, camera, speed, amount) {
    const visible = Math.round(count * THREE.MathUtils.clamp(amount, 0, 1));
    for (let i = 0; i < visible; i++) {
      const p = particles[i];
      p.x += dt * p.v * speed;
      if (p.x > bounds.max.x) spawn(p, false);
      const k = (p.x - bounds.min.x) / span.x;
      const opacity = Math.sin(Math.PI * k) * 0.55;
      streaks.set(i, p.x, p.y, p.z, p.len, 0.07, opacity, camera.position);
    }
    streaks.commit(visible);
  }

  return { mesh: streaks.mesh, setBounds, update, dispose: streaks.dispose };
}
