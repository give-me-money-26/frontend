import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  BUILDING_FIT_SIZE,
  BUILDING_MODELS,
  DEFAULT_BUILDING_ID,
} from "./buildings.js";
import { buildTurbine } from "./models/turbine.js";

// 서버 결과가 없을 때 쓰는 표시용 풍속 (m/s)
const DEFAULT_WIND_SPEED = 3;
const WIND_COUNT = 140;
const WIND_LENGTH = 12;

export function createSimulatorScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa8c9cf, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -40,
    right: 40,
    top: 40,
    bottom: -40,
    near: 1,
    far: 160,
  });
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.ShadowMaterial({ color: 0x5e9aa3, opacity: 0.22 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(120, 40, 0xb6d6dc, 0xc9e3e8);
  grid.position.y = 0.01;
  scene.add(grid);

  const vent = new THREE.Group();
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0x2f8a91,
    roughness: 0.45,
    metalness: 0.15,
  });
  const louverMat = new THREE.MeshStandardMaterial({ color: 0xd8eef0 });
  const ventBox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 1.9), ventMat);
  ventBox.position.set(-1.1, 0.75, 0);
  ventBox.castShadow = true;
  vent.add(ventBox);
  for (let i = 0; i < 4; i++) {
    const louver = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.07, 1.6),
      louverMat,
    );
    louver.position.set(0.03, 0.35 + i * 0.3, 0);
    vent.add(louver);
  }
  scene.add(vent);

  const turbine = buildTurbine({ scale: 0.26 });
  const turbineHolder = new THREE.Group();
  turbineHolder.add(turbine.group);
  turbineHolder.visible = false;
  scene.add(turbineHolder);

  const windPos = new Float32Array(WIND_COUNT * 6);
  const windGeo = new THREE.BufferGeometry();
  windGeo.setAttribute("position", new THREE.BufferAttribute(windPos, 3));
  const windMat = new THREE.LineBasicMaterial({
    color: 0x2aa3ae,
    transparent: true,
    opacity: 0.75,
  });
  const wind = new THREE.LineSegments(windGeo, windMat);
  wind.frustumCulled = false;
  scene.add(wind);
  const seeds = Array.from({ length: WIND_COUNT }, () => ({
    p: Math.random(),
    y: Math.random() * 1.6 - 0.4,
    z: (Math.random() - 0.5) * 2.4,
  }));

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 600);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.minDistance = 8;
  controls.maxDistance = 160;

  const state = {
    buildingId: null,
    mode: "view",
    distanceM: 2,
    angleDegrees: 0,
    windSpeedMS: DEFAULT_WIND_SPEED,
  };
  let building = null;
  // 배기구 위치. 바람은 여기서 +x로 흐르고 터빈은 -x(배기구)를 바라봄
  const V = new THREE.Vector3();
  const center = new THREE.Vector3();

  function setBuilding(buildingId) {
    const id = Object.hasOwn(BUILDING_MODELS, buildingId)
      ? buildingId
      : DEFAULT_BUILDING_ID;
    if (building && state.buildingId === id) return;
    if (building) {
      scene.remove(building.group);
      building.dispose();
    }
    building = BUILDING_MODELS[id]();
    const size = building.size;
    const k = BUILDING_FIT_SIZE / Math.max(size.x, size.z);
    building.group.scale.multiplyScalar(k);
    building.group.traverse((o) => {
      if (o.isMesh) o.receiveShadow = true;
    });
    scene.add(building.group);
    V.copy(building.vent).multiplyScalar(k);
    center.set(0, size.y * k * 0.3, 0);
    state.buildingId = id;

    vent.position.copy(V);
    const r = BUILDING_FIT_SIZE;
    sun.position.set(V.x - r * 0.7, r * 1.4, V.z + r * 0.9);
    sun.target.position.copy(V);
    resize();
    placeTurbine();
    resetCamera();
  }

  function placeTurbine() {
    turbineHolder.position.set(V.x + state.distanceM, V.y, V.z);
    turbineHolder.rotation.y = (-state.angleDegrees * Math.PI) / 180;
  }

  function resetCamera() {
    if (state.mode === "control") {
      controls.target.set(V.x + 3, V.y + 0.6, V.z);
      camera.position.set(V.x + 8, V.y + 9.5, V.z + 19);
    } else {
      const r = BUILDING_FIT_SIZE;
      controls.target.copy(center);
      camera.position.set(
        center.x - r * 0.78,
        center.y + r * 0.68,
        center.z + r * 1.05,
      );
    }
    controls.update();
  }

  function update(next) {
    const prevMode = state.mode;
    if (next.mode !== undefined) state.mode = next.mode;
    if (next.distanceM !== undefined) state.distanceM = Number(next.distanceM);
    if (next.angleDegrees !== undefined)
      state.angleDegrees = Number(next.angleDegrees);
    if (next.windSpeedMS !== undefined)
      state.windSpeedMS =
        Number(next.windSpeedMS) > 0
          ? Number(next.windSpeedMS)
          : DEFAULT_WIND_SPEED;
    if (next.buildingId !== undefined) setBuilding(next.buildingId);
    turbineHolder.visible = state.mode === "control";
    placeTurbine();
    if (prevMode !== state.mode) resetCamera();
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    building?.setResolution(w, h);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let t = 0;
  let prev = performance.now();
  let frame = 0;
  function loop(now) {
    frame = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const speed = state.windSpeedMS;
    if (!reduceMotion) {
      t += dt;
      if (turbineHolder.visible) turbine.rotor.rotation.x += dt * speed * 1.6;
    }
    seeds.forEach((s, i) => {
      const d = (t * speed * 1.4 + s.p * WIND_LENGTH) % WIND_LENGTH;
      const x = V.x + 0.2 + d;
      const y = V.y + 0.8 + s.y + Math.sin(d * 0.6 + i) * 0.12;
      const z = V.z + s.z * (1 + d * 0.06);
      const k = i * 6;
      windPos[k] = x;
      windPos[k + 1] = y;
      windPos[k + 2] = z;
      windPos[k + 3] = x - 0.5 - speed * 0.06;
      windPos[k + 4] = y;
      windPos[k + 5] = z;
    });
    windGeo.attributes.position.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
  }
  frame = requestAnimationFrame(loop);

  function dispose() {
    cancelAnimationFrame(frame);
    observer.disconnect();
    controls.dispose();
    building?.dispose();
    turbine.dispose();
    scene.traverse((o) => {
      if (o.isMesh || o.isLineSegments) {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m?.dispose());
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  resize();
  return { update, dispose };
}
