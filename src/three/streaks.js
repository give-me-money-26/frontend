import * as THREE from "three";

const [HEAD, BODY, TAIL] = ["64,160,160", "90,175,175", "120,190,190"];

function streakTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, `rgba(${HEAD},0)`);
  gradient.addColorStop(0.25, `rgba(${HEAD},0.95)`);
  gradient.addColorStop(0.7, `rgba(${BODY},0.7)`);
  gradient.addColorStop(1, `rgba(${TAIL},0)`);
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

export function createStreaks(count) {
  const tex = streakTexture();
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

// 건물 높이 격자. 각 칸은 바람 방향(+x)으로 몇 칸 앞까지의 최고 높이를 담아 미리 떠오르게 함
const CELL = 1;
const LOOK_AHEAD = 4;
const CLEARANCE = 0.5;

export function createAmbientWind(count, { length, thickness, scale }) {
  const streaks = createStreaks(count);
  const bounds = new THREE.Box3();
  const span = new THREE.Vector3();
  const particles = Array.from({ length: count }, () => ({}));
  let cols = 0;
  let rows = 0;
  let ceiling = new Float32Array(0);
  const inv = new THREE.Matrix4();
  const eye = new THREE.Vector3();

  const ceilingAt = (x, z) => {
    const c = THREE.MathUtils.clamp(
      Math.round((x - bounds.min.x) / CELL),
      0,
      cols - 1,
    );
    const r = THREE.MathUtils.clamp(
      Math.round((z - bounds.min.z) / CELL),
      0,
      rows - 1,
    );
    return ceiling[r * cols + c];
  };

  const spawn = (p, initial) => {
    p.start = bounds.min.x + Math.random() * span.x;
    p.base = bounds.min.y + Math.random() * span.y;
    p.z = bounds.min.z + Math.random() * span.z;
    p.len = (0.35 + Math.random() * 0.75) * scale;
    p.v = 0.8 + Math.random() * 0.5;
    p.life = length * (0.35 + Math.random() * 0.65) * scale;
    p.x = p.start + (initial ? p.life * Math.random() : 0);
    p.y = Math.max(p.base, ceilingAt(p.x, p.z));
  };

  function setBounds(box, heightAt) {
    bounds.copy(box);
    bounds.getSize(span);
    cols = Math.ceil(span.x / CELL) + 1;
    rows = Math.ceil(span.z / CELL) + 1;
    const height = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        height[r * cols + c] =
          heightAt(bounds.min.x + c * CELL, bounds.min.z + r * CELL) ?? 0;
    ceiling = height.map((_, i) => {
      const end = Math.min(i - (i % cols) + cols, i + LOOK_AHEAD + 1);
      const top = Math.max(...height.subarray(i, end));
      return top > 0 ? top + CLEARANCE : 0;
    });
    particles.forEach((p) => spawn(p, true));
  }

  function update(dt, camera, speed, amount) {
    inv.copy(streaks.mesh.matrixWorld).invert();
    eye.copy(camera.position).applyMatrix4(inv);
    const visible = Math.round(count * THREE.MathUtils.clamp(amount, 0, 1));
    for (let i = 0; i < visible; i++) {
      const p = particles[i];
      p.x += dt * p.v * speed * scale;
      const d = p.x - p.start;
      if (d > p.life) spawn(p, false);
      const target = Math.max(p.base, ceilingAt(p.x, p.z));
      p.y += (target - p.y) * Math.min(1, dt * 3);
      const k = Math.min(1, d / p.life);
      streaks.set(
        i,
        p.x,
        p.y + Math.sin(d * 1.4 + i) * 0.02 * scale,
        p.z,
        p.len * (1 - 0.3 * k),
        thickness * scale,
        Math.sin(Math.PI * k) * 0.55,
        eye,
      );
    }
    streaks.commit(visible);
  }

  return { mesh: streaks.mesh, setBounds, update, dispose: streaks.dispose };
}
