import * as THREE from "three";

const canvas = document.getElementById("login-three-canvas");

if (canvas) {
  const gate = canvas.closest(".login-gate");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const startedAt = performance.now();
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    canvas.hidden = true;
    canvas.dataset.sceneReady = "false";
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 0, 7.2);

    const root = new THREE.Group();
    root.scale.setScalar(0.33);
    scene.add(root);

    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a1025,
      roughness: 0.2,
      metalness: 0.74,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      iridescence: 1,
      iridescenceIOR: 1.34,
      iridescenceThicknessMinimum: 120,
      iridescenceThicknessMaximum: 680,
      emissive: 0x67193f,
      emissiveIntensity: 0.42,
    });
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.08, 0.23, 220, 36, 2, 3),
      knotMaterial,
    );
    knot.rotation.set(0.42, -0.36, 0.18);
    root.add(knot);

    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0xf1a8c0,
      transparent: true,
      opacity: 0.07,
      wireframe: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.72, 2),
      shellMaterial,
    );
    root.add(shell);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xf1b56f,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const rings = [
      new THREE.Mesh(
        new THREE.TorusGeometry(1.9, 0.006, 8, 180),
        ringMaterial.clone(),
      ),
      new THREE.Mesh(
        new THREE.TorusGeometry(1.62, 0.005, 8, 160),
        ringMaterial.clone(),
      ),
      new THREE.Mesh(
        new THREE.TorusGeometry(2.16, 0.004, 8, 200),
        ringMaterial.clone(),
      ),
    ];
    rings[0].rotation.set(1.1, 0.25, -0.2);
    rings[1].rotation.set(0.45, 1.05, 0.8);
    rings[2].rotation.set(1.35, -0.5, 0.3);
    rings[0].material.opacity = 0.2;
    rings[1].material.color.setHex(0xf07d9a);
    rings[1].material.opacity = 0.16;
    rings[2].material.color.setHex(0x7790ff);
    rings[2].material.opacity = 0.11;
    rings.forEach((ring) => root.add(ring));

    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.1 + Math.random() * 1.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[index * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index * 3 + 1] = radius * Math.cos(phi);
      particlePositions[index * 3 + 2] =
        radius * Math.sin(phi) * Math.sin(theta);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xf3c27d,
        size: 0.026,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const pinkLight = new THREE.PointLight(0xff5f95, 34, 14, 2);
    pinkLight.position.set(3.2, 1.6, 4);
    scene.add(pinkLight);
    const goldLight = new THREE.PointLight(0xffbb70, 24, 12, 2);
    goldLight.position.set(-3.5, -1.4, 3);
    scene.add(goldLight);
    const blueLight = new THREE.PointLight(0x718dff, 18, 10, 2);
    blueLight.position.set(0.5, 3.1, -3);
    scene.add(blueLight);

    let pointerX = 0;
    let pointerY = 0;
    let successAt = 0;
    let frame = 0;

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (
        canvas.width === Math.round(width * renderer.getPixelRatio()) &&
        canvas.height === Math.round(height * renderer.getPixelRatio())
      ) {
        return;
      }
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function renderFrame(time = 0) {
      resize();
      const seconds = time * 0.001;
      const intro = reducedMotion.matches
        ? 1
        : easeOutCubic(
            Math.min(1, (performance.now() - startedAt) / 1250),
          );
      const successProgress = successAt
        ? easeOutCubic(
            Math.min(1, (performance.now() - successAt) / 620),
          )
        : 0;
      const successScale = 1 - successProgress * 0.34;

      root.scale.setScalar((0.33 + intro * 0.67) * successScale);
      root.rotation.x +=
        (pointerY * 0.22 +
          Math.sin(seconds * 0.24) * 0.04 -
          root.rotation.x) *
        0.045;
      root.rotation.y +=
        (pointerX * 0.32 + seconds * 0.08 + 0.3 - root.rotation.y) * 0.045;
      root.rotation.z = Math.sin(seconds * 0.2) * 0.035;

      knot.rotation.x += reducedMotion.matches ? 0 : 0.0024;
      knot.rotation.y += reducedMotion.matches ? 0 : 0.0036;
      knot.scale.setScalar(1 + Math.sin(seconds * 1.15) * 0.025);

      shell.rotation.x -= reducedMotion.matches ? 0 : 0.0012;
      shell.rotation.y += reducedMotion.matches ? 0 : 0.0018;
      shellMaterial.opacity = 0.065 + (1 - intro) * 0.08;

      rings.forEach((ring, index) => {
        ring.rotation.z +=
          reducedMotion.matches
            ? 0
            : (index % 2 === 0 ? 1 : -1) * 0.0016;
        ring.rotation.x += reducedMotion.matches ? 0 : 0.0007;
      });
      particles.rotation.y += reducedMotion.matches ? 0 : 0.00055;
      particles.rotation.x = Math.sin(seconds * 0.13) * 0.08;

      pinkLight.position.x = Math.cos(seconds * 0.45) * 3.2;
      pinkLight.position.y = Math.sin(seconds * 0.38) * 1.8;
      goldLight.position.x = Math.cos(seconds * 0.32 + 2.2) * 3.3;
      goldLight.position.y = Math.sin(seconds * 0.42 + 1.1) * 1.4;

      knotMaterial.emissiveIntensity =
        0.42 + Math.sin(seconds * 0.85) * 0.08 + successProgress * 0.75;
      renderer.render(scene, camera);
      frame = renderer.info.render.frame;
      canvas.dataset.sceneReady = "true";
      canvas.dataset.renderFrame = String(frame);
    }

    function animationLoop(time) {
      if (reducedMotion.matches && frame > 0) return;
      renderFrame(time);
    }

    function syncAnimation() {
      if (gate?.hidden) {
        renderer.setAnimationLoop(null);
        return;
      }
      renderFrame(performance.now());
      if (!reducedMotion.matches) {
        renderer.setAnimationLoop(animationLoop);
      } else {
        renderer.setAnimationLoop(null);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      renderFrame(performance.now());
    });
    resizeObserver.observe(canvas);

    gate?.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches) return;
      const rect = gate.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    gate?.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
    });

    window.addEventListener("qianbian:login-success", () => {
      successAt = performance.now();
      syncAnimation();
    });
    window.addEventListener("qianbian:auth-required", () => {
      successAt = 0;
      root.scale.setScalar(1);
      syncAnimation();
    });
    window.addEventListener("qianbian:auth-success", () => {
      successAt = performance.now();
      syncAnimation();
    });

    if (gate) {
      new MutationObserver(syncAnimation).observe(gate, {
        attributes: true,
        attributeFilter: ["hidden"],
      });
    }

    window.__qianbianLoginScene = {
      stats() {
        return {
          renderCalls: renderer.info.render.calls,
          objectCount: root.children.length,
          triangles: renderer.info.render.triangles,
          points: renderer.info.render.points,
          frame,
          pixelRatio: renderer.getPixelRatio(),
          width: canvas.width,
          height: canvas.height,
        };
      },
      samplePixels() {
        renderFrame(performance.now());
        const gl = renderer.getContext();
        const width = renderer.domElement.width;
        const height = renderer.domElement.height;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(
          0,
          0,
          width,
          height,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels,
        );
        let painted = 0;
        let maxChannel = 0;
        for (let index = 0; index < pixels.length; index += 32) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          maxChannel = Math.max(maxChannel, red, green, blue, alpha);
          if (alpha > 8 && red + green + blue > 18) painted += 1;
        }
        return {
          painted,
          maxChannel,
          width,
          height,
        };
      },
    };

    syncAnimation();
  }
}
