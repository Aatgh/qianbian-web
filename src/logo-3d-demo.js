import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ShapeUtils } from "three";
import shapeData from "../logo-3d/logo-shapes.json";

const canvas = document.getElementById("logo-3d-canvas");
const stage = document.querySelector(".logo-3d-stage");
const rotateButton = document.getElementById("toggle-rotation");
const resetButton = document.getElementById("reset-view");

if (!canvas || !stage) {
  throw new Error("Logo 3D stage not found");
}

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setClearColor(0x08090c, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08090c);
scene.fog = new THREE.Fog(0x08090c, 28, 54);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
camera.position.set(0, 0.45, 14.5);
camera.lookAt(0, 0.05, 0);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = environment;

const ambient = new THREE.HemisphereLight(0xf3dfea, 0x0a0d18, 0.68);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffe3ef, 1.85);
keyLight.position.set(6, 8, 9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -9;
keyLight.shadow.camera.right = 9;
keyLight.shadow.camera.top = 7;
keyLight.shadow.camera.bottom = -7;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const magentaRim = new THREE.PointLight(0xe04ca2, 22, 18, 2);
magentaRim.position.set(-5.5, -1, 5);
scene.add(magentaRim);

const coolRim = new THREE.PointLight(0x8eaeff, 11, 16, 2);
coolRim.position.set(5.5, 2.4, 4);
scene.add(coolRim);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.32 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.45;
floor.receiveShadow = true;
scene.add(floor);

const modelGroup = new THREE.Group();
modelGroup.position.y = 0.1;
modelGroup.rotation.set(-0.08, -0.22, 0.015);
scene.add(modelGroup);

const material = new THREE.MeshPhysicalMaterial({
  color: 0x9b246b,
  roughness: 0.34,
  metalness: 0.08,
  clearcoat: 0.75,
  clearcoatRoughness: 0.14,
  transmission: 0.04,
  thickness: 0.7,
  ior: 1.46,
  sheen: 0.38,
  sheenColor: new THREE.Color(0xff8bc6),
  sheenRoughness: 0.42,
  attenuationColor: new THREE.Color(0x9b246b),
  attenuationDistance: 2.4,
  envMapIntensity: 0.68,
});

function makeVectorPoints(points) {
  return points.map(([x, y]) => new THREE.Vector2(x, y));
}

let shapeCount = 0;
let meshCount = 0;

for (const definition of shapeData.shapes) {
  let outerPoints = makeVectorPoints(definition.outer);
  if (!ShapeUtils.isClockWise(outerPoints)) outerPoints.reverse();
  const shape = new THREE.Shape(outerPoints);

  for (const holeDefinition of definition.holes) {
    let holePoints = makeVectorPoints(holeDefinition);
    if (ShapeUtils.isClockWise(holePoints)) holePoints.reverse();
    shape.holes.push(new THREE.Path(holePoints));
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.05,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.11,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 5,
    curveSegments: 16,
  });
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  modelGroup.add(mesh);
  shapeCount += 1;
  meshCount += 1;
}

const bounds = new THREE.Box3().setFromObject(modelGroup);
const size = bounds.getSize(new THREE.Vector3());
modelGroup.position.x -= (bounds.min.x + bounds.max.x) / 2;
modelGroup.position.y -= (bounds.min.y + bounds.max.y) / 2;
modelGroup.position.y += 0.15;

let autoRotate = true;
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let targetRotationX = modelGroup.rotation.x;
let targetRotationY = modelGroup.rotation.y;
let zoomScale = 1;
let fitDistance = 14.5;
let cameraDistance = fitDistance;
let targetDistance = cameraDistance;
let previousFrame = performance.now();

function resize() {
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = width < 620 ? 42 : 34;
  camera.updateProjectionMatrix();
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov =
    2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const distanceForHeight = 2.45 / Math.tan(verticalFov / 2);
  const distanceForWidth = 4.55 / Math.tan(horizontalFov / 2);
  fitDistance = Math.max(distanceForHeight, distanceForWidth) * 1.12;
  targetDistance = fitDistance * zoomScale;
  if (cameraDistance === 14.5) cameraDistance = targetDistance;
}

function updateRotationButton() {
  rotateButton?.setAttribute("aria-pressed", String(autoRotate));
  rotateButton?.classList.toggle("is-active", autoRotate);
}

function toggleAutoRotate(force) {
  autoRotate =
    typeof force === "boolean" ? force : !autoRotate;
  updateRotationButton();
  return autoRotate;
}

function resetView() {
  targetRotationX = -0.08;
  targetRotationY = -0.22;
  zoomScale = 1;
  targetDistance = fitDistance;
  modelGroup.rotation.z = 0.015;
}

rotateButton?.addEventListener("click", () => toggleAutoRotate());
resetButton?.addEventListener("click", resetView);

canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  canvas.setPointerCapture?.(event.pointerId);
  canvas.classList.add("is-dragging");
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const deltaX = event.clientX - lastPointerX;
  const deltaY = event.clientY - lastPointerY;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  targetRotationY += deltaX * 0.008;
  targetRotationX += deltaY * 0.0055;
  targetRotationX = Math.max(-1.15, Math.min(1.15, targetRotationX));
});

function finishDrag(event) {
  if (!dragging) return;
  dragging = false;
  canvas.classList.remove("is-dragging");
  if (canvas.hasPointerCapture?.(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

canvas.addEventListener("pointerup", finishDrag);
canvas.addEventListener("pointercancel", finishDrag);
canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    zoomScale = Math.max(
      0.74,
      Math.min(1.34, zoomScale + event.deltaY * 0.0008),
    );
    targetDistance = fitDistance * zoomScale;
  },
  { passive: false },
);

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(stage);

function animate(now) {
  const delta = Math.min(0.05, (now - previousFrame) / 1000);
  previousFrame = now;

  if (autoRotate && !dragging) targetRotationY += delta * 0.34;
  modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.09;
  modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.09;
  modelGroup.position.y = 0.15 + Math.sin(now * 0.0012) * 0.05;
  cameraDistance += (targetDistance - cameraDistance) * 0.08;
  camera.position.z = cameraDistance;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
resize();
updateRotationButton();
stage.dataset.artifactReady = "true";

window.__qianbianLogo3D = {
  meshCount,
  shapeCount,
  get autoRotate() {
    return autoRotate;
  },
  reset: resetView,
  setAutoRotate: toggleAutoRotate,
  rotation() {
    return {
      x: modelGroup.rotation.x,
      y: modelGroup.rotation.y,
      z: modelGroup.rotation.z,
    };
  },
  screenBounds() {
    const box = new THREE.Box3().setFromObject(modelGroup);
    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const projected = corners.map((corner) => {
      const point = corner.clone().project(camera);
      return {
        x: (point.x * 0.5 + 0.5) * width,
        y: (-point.y * 0.5 + 0.5) * height,
      };
    });
    return {
      left: Math.min(...projected.map((point) => point.x)),
      right: Math.max(...projected.map((point) => point.x)),
      top: Math.min(...projected.map((point) => point.y)),
      bottom: Math.max(...projected.map((point) => point.y)),
    };
  },
  samplePixels() {
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let painted = 0;
    let maxChannel = 0;
    for (let index = 0; index < pixels.length; index += 64) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      maxChannel = Math.max(maxChannel, red, green, blue);
      if (red + green + blue > 36) painted += 1;
    }
    return { painted, maxChannel, width, height };
  },
};
