import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DISTANCE_RANGE } from "../data/turbine.js";
import { WIND_RANGE } from "../data/wind.js";
import {
  BUILDING_FIT_SIZE,
  BUILDING_MODELS,
  DEFAULT_BUILDING_ID,
} from "./buildings.js";
import { buildTurbine } from "./models/turbine.js";
import { buildVent, createWindParticles } from "./models/vent.js";
import { createAmbientWind } from "./streaks.js";

const DEFAULT_WIND_SPEED = 3;
const VENT_SCALE = 1.4;
const TURBINE_SCALE = 0.15;
const MIN_GAP = 0.2;
const EDGE_MARGIN = 0.15;
const ROOF_STEP = 0.1;
const VIEW_DIR = new THREE.Vector3(-0.78, 0.68, 1.05).normalize();
const VIEW_FILL = 0.92;
const CONTROL_DIR = new THREE.Vector3(5, 8.9, 19).normalize();
const CONTROL_FILL = 0.7;
const CONTROL_LIFT = 0.25;
const AMBIENT_COUNT = 160;

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

  const ventModel = buildVent({ scale: VENT_SCALE });
  const vent = ventModel.group;
  scene.add(vent);
  const ventBox = new THREE.Box3().setFromObject(vent);
  const ventCenterX = (ventBox.min.x + ventBox.max.x) / 2;
  const windFx = createWindParticles(ventModel, {
    count: 70,
    length: 9,
    thickness: 0.09,
  });
  vent.add(windFx.mesh);
  const ambient = createAmbientWind(AMBIENT_COUNT);
  scene.add(ambient.mesh);

  const turbine = buildTurbine({ scale: TURBINE_SCALE });
  const turbineHolder = new THREE.Group();
  turbineHolder.add(turbine.group);
  turbineHolder.visible = false;
  scene.add(turbineHolder);
  const turbineBox = new THREE.Box3().setFromObject(turbine.group);
  // 거리는 배기구 앞면에서 날개 앞까지
  const turbineOffset = ventBox.max.x - turbineBox.min.x;
  const turbineDepth = turbineBox.max.x - turbineBox.min.x;

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
    hourStrength: 1,
  };
  let building = null;
  let roofMeshes = [];
  let maxGap = MIN_GAP;
  // 배기구 위치. 바람은 여기서 +x로 흐르고 터빈은 -x(배기구)를 바라봄
  const ventPos = new THREE.Vector3();
  const viewBox = new THREE.Box3();
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const probe = new THREE.Vector3();

  function roofHeightAt(x) {
    probe.set(x, ventPos.y + BUILDING_FIT_SIZE, ventPos.z);
    raycaster.set(probe, down);
    return raycaster.intersectObjects(roofMeshes, false)[0]?.point.y;
  }

  // 배기구 앞으로 같은 높이의 옥상이 이어지는 만큼만 터빈을 보냄
  function measureMaxGap() {
    const front = ventPos.x + ventBox.max.x;
    const limit = DISTANCE_RANGE[1] + turbineDepth + EDGE_MARGIN;
    let reach = 0;
    for (let s = 0; s <= limit; s += ROOF_STEP) {
      const y = roofHeightAt(front + s);
      if (y === undefined || Math.abs(y - ventPos.y) > ROOF_STEP / 2) break;
      reach = s;
    }
    return THREE.MathUtils.clamp(
      reach - turbineDepth - EDGE_MARGIN,
      MIN_GAP,
      DISTANCE_RANGE[1],
    );
  }

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
    roofMeshes = [];
    building.group.traverse((o) => {
      if (!o.isMesh) return;
      o.receiveShadow = true;
      if (!o.isLineSegments2) roofMeshes.push(o);
    });
    scene.add(building.group);
    building.group.updateMatrixWorld(true);
    ventPos.copy(building.vent).multiplyScalar(k);
    ventPos.y = roofHeightAt(ventPos.x + ventCenterX) ?? ventPos.y;
    maxGap = measureMaxGap();
    viewBox.setFromObject(building.group).expandByPoint(ventPos);
    const air = viewBox.clone().expandByScalar(BUILDING_FIT_SIZE * 0.3);
    air.min.y = 0.3;
    ambient.setBounds(air);
    state.buildingId = id;

    vent.position.copy(ventPos);
    const r = BUILDING_FIT_SIZE;
    sun.position.set(ventPos.x - r * 0.7, r * 1.4, ventPos.z + r * 0.9);
    sun.target.position.copy(ventPos);
    resize();
    placeTurbine();
    resetCamera();
  }

  function placeTurbine() {
    const gap = THREE.MathUtils.mapLinear(
      THREE.MathUtils.clamp(state.distanceM, ...DISTANCE_RANGE),
      ...DISTANCE_RANGE,
      MIN_GAP,
      maxGap,
    );
    const x = ventPos.x + turbineOffset + gap;
    turbineHolder.position.set(x, roofHeightAt(x) ?? ventPos.y, ventPos.z);
    turbineHolder.rotation.y = (-state.angleDegrees * Math.PI) / 180;
  }

  function resetCamera() {
    if (state.mode === "control") {
      const turbineAtMax = turbineBox
        .clone()
        .translate(
          new THREE.Vector3(
            ventPos.x + turbineOffset + maxGap,
            ventPos.y,
            ventPos.z,
          ),
        );
      fitCamera(
        ventBox.clone().translate(ventPos).union(turbineAtMax),
        CONTROL_DIR,
        CONTROL_FILL,
        CONTROL_LIFT,
      );
    } else {
      fitCamera(viewBox, VIEW_DIR, VIEW_FILL, 0);
    }
    controls.update();
  }

  // box가 화면의 fill 비율 안에 들어오도록 맞추고, lift만큼 화면 위로 올림
  function fitCamera(box, dir, fill, lift) {
    const right = new THREE.Vector3().crossVectors(camera.up, dir).normalize();
    const up = new THREE.Vector3().crossVectors(dir, right);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * fill;
    const tanH = tanV * camera.aspect;
    const center = box.getCenter(new THREE.Vector3());
    const corner = new THREE.Vector3();
    let distance = 0;
    for (let i = 0; i < 8; i++) {
      corner
        .set(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        )
        .sub(center);
      const depth = corner.dot(dir);
      distance = Math.max(
        distance,
        depth + Math.abs(corner.dot(right)) / tanH,
        depth + Math.abs(corner.dot(up)) / tanV,
      );
    }
    center.addScaledVector(up, -lift * distance * tanV);
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(dir, distance);
  }

  function update(next) {
    const prevMode = state.mode;
    if (next.mode !== undefined) state.mode = next.mode;
    if (next.distanceM !== undefined) state.distanceM = Number(next.distanceM);
    if (next.angleDegrees !== undefined)
      state.angleDegrees = Number(next.angleDegrees);
    if (next.windSpeedMS !== undefined)
      state.windSpeedMS = Math.max(0, Number(next.windSpeedMS) || 0);
    if (next.hourStrength !== undefined) state.hourStrength = next.hourStrength;
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
    ventModel.setResolution(w, h);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let prev = performance.now();
  let frame = 0;
  function loop(now) {
    frame = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const speed = state.windSpeedMS;
    if (!reduceMotion && turbineHolder.visible)
      turbine.rotor.rotation.x += dt * speed * 1.6;
    windFx.update(
      reduceMotion ? 0 : dt,
      camera,
      0.6 + speed * 0.35,
      speed / WIND_RANGE[1],
    );
    ambient.update(
      reduceMotion ? 0 : dt,
      camera,
      1.5 + speed * 0.9,
      (speed / WIND_RANGE[1]) * (0.3 + 0.7 * state.hourStrength),
    );
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
    windFx.dispose();
    ambient.dispose();
    ventModel.dispose();
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
  return { update, resetCamera, dispose };
}
