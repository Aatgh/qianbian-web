import * as THREE from "three";

const canvas = document.getElementById("login-three-canvas");

if (canvas) {
  const gate = canvas.closest(".login-gate");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const startedAt = performance.now();
  const logoPurple = new THREE.Color(0xa62466);
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
    renderer.toneMappingExposure = 1.32;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 90);
    camera.position.set(0, 0, 7.4);

    const world = new THREE.Group();
    world.scale.setScalar(0.28);
    scene.add(world);

    const planetGroup = new THREE.Group();
    world.add(planetGroup);

    const planetMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8d8f4,
      roughness: 0.34,
      metalness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      emissive: logoPurple,
      emissiveIntensity: 0.12,
    });
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 96, 64),
      planetMaterial,
    );
    planetGroup.add(planet);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uWhite: { value: new THREE.Color(0xffffff) },
        uPurple: { value: logoPurple.clone() },
      },
      vertexShader: `
        varying vec3 vNormalView;
        void main() {
          vNormalView = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormalView;
        uniform vec3 uWhite;
        uniform vec3 uPurple;
        void main() {
          float rim = pow(1.0 - abs(vNormalView.z), 2.45);
          vec3 glow = mix(uWhite, uPurple, smoothstep(0.08, 0.95, rim));
          gl_FragColor = vec4(glow, rim * 0.82);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.34, 96, 64),
      atmosphereMaterial,
    );
    planetGroup.add(atmosphere);

    const innerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.16, 64, 48),
      new THREE.MeshBasicMaterial({
        color: 0xe7b6ff,
        transparent: true,
        opacity: 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    planetGroup.add(innerGlow);

    const markMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfffbff,
      metalness: 0.24,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      emissive: 0xc45cff,
      emissiveIntensity: 0.92,
    });
    const markGroup = new THREE.Group();
    markGroup.position.z = 1.52;
    markGroup.scale.setScalar(1.03);
    world.add(markGroup);

    const leftLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.43, 0.058, 16, 100),
      markMaterial,
    );
    leftLoop.position.x = -0.46;
    leftLoop.rotation.y = -0.08;
    leftLoop.rotation.z = 0.06;
    markGroup.add(leftLoop);

    const rightLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.43, 0.058, 16, 100),
      markMaterial,
    );
    rightLoop.position.x = 0.46;
    rightLoop.rotation.y = 0.08;
    rightLoop.rotation.z = -0.06;
    markGroup.add(rightLoop);

    const connector = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.052, 0.72, 8, 18),
      markMaterial,
    );
    connector.rotation.z = -0.67;
    connector.position.z = 0.06;
    connector.scale.y = 0.92;
    markGroup.add(connector);

    const markHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.93, 0.006, 8, 160),
      new THREE.MeshBasicMaterial({
        color: 0xf5d6ff,
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    markHalo.scale.x = 1.55;
    markHalo.scale.y = 0.74;
    markHalo.position.z = 0.02;
    markGroup.add(markHalo);

    const gravityRings = [
      new THREE.Mesh(
        new THREE.TorusGeometry(1.52, 0.007, 8, 160),
        new THREE.MeshBasicMaterial({
          color: 0xf6e6ff,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
      new THREE.Mesh(
        new THREE.TorusGeometry(1.78, 0.004, 8, 180),
        new THREE.MeshBasicMaterial({
          color: logoPurple,
          transparent: true,
          opacity: 0.36,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    ];
    gravityRings[0].rotation.set(1.13, 0.18, -0.24);
    gravityRings[1].rotation.set(0.58, 1.02, 0.56);
    gravityRings.forEach((ring) => world.add(ring));

    const dustCount = 250;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    for (let index = 0; index < dustCount; index += 1) {
      const radius = 1.42 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dustPositions[index * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      dustPositions[index * 3 + 1] = radius * Math.cos(phi) * 0.72;
      dustPositions[index * 3 + 2] =
        radius * Math.sin(phi) * Math.sin(theta);
      const color = Math.random() > 0.46
        ? new THREE.Color(0xffffff)
        : logoPurple.clone().lerp(new THREE.Color(0xffb7ef), 0.58);
      dustColors[index * 3] = color.r;
      dustColors[index * 3 + 1] = color.g;
      dustColors[index * 3 + 2] = color.b;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3),
    );
    dustGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(dustColors, 3),
    );
    const gravityDust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        size: 0.028,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    world.add(gravityDust);

    const starCount = 900;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSpeeds = new Float32Array(starCount);
    for (let index = 0; index < starCount; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * 22;
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * 14;
      starPositions[index * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
      starSpeeds[index] = 0.0008 + Math.random() * 0.0022;
      const color = Math.random() > 0.26
        ? new THREE.Color(0xffffff)
        : logoPurple.clone().lerp(new THREE.Color(0xffd7ff), 0.72);
      starColors[index * 3] = color.r;
      starColors[index * 3 + 1] = color.g;
      starColors[index * 3 + 2] = color.b;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    starGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(starColors, 3),
    );
    const starField = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        size: 0.027,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(starField);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const whiteLight = new THREE.PointLight(0xffffff, 24, 16, 2);
    whiteLight.position.set(2.8, 2.4, 4.2);
    scene.add(whiteLight);
    const purpleLight = new THREE.PointLight(0xc34dff, 24, 15, 2);
    purpleLight.position.set(-3.2, -1.2, 3.1);
    scene.add(purpleLight);
    const rimLight = new THREE.PointLight(0xffd7ff, 20, 14, 2);
    rimLight.position.set(0.2, 3.2, -3);
    scene.add(rimLight);

    let pointerX = 0;
    let pointerY = 0;
    let successAt = 0;
    let frame = 0;
    let previousTime = 0;

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

    function driftStars(delta) {
      const positions = starGeometry.attributes.position.array;
      for (let index = 0; index < starCount; index += 1) {
        positions[index * 3 + 1] -=
          starSpeeds[index] * delta * 60;
        positions[index * 3] +=
          starSpeeds[index] * delta * 8;
        if (positions[index * 3 + 1] < -7) {
          positions[index * 3 + 1] = 7;
          positions[index * 3] = (Math.random() - 0.5) * 22;
        }
        if (positions[index * 3] > 11) {
          positions[index * 3] = -11;
        }
      }
      starGeometry.attributes.position.needsUpdate = true;
      starField.rotation.z += delta * 0.008;
    }

    function renderFrame(time = 0) {
      resize();
      const seconds = time * 0.001;
      const delta = previousTime
        ? Math.min(0.05, (time - previousTime) * 0.001)
        : 0.016;
      previousTime = time;

      const intro = reducedMotion.matches
        ? 1
        : easeOutCubic(
            Math.min(1, (performance.now() - startedAt) / 1400),
          );
      const successProgress = successAt
        ? easeOutCubic(
            Math.min(1, (performance.now() - successAt) / 620),
          )
        : 0;
      const successScale = 1 - successProgress * 0.34;

      world.scale.setScalar((0.28 + intro * 0.72) * successScale);
      world.rotation.x +=
        (pointerY * 0.18 +
          Math.sin(seconds * 0.22) * 0.035 -
          world.rotation.x) *
        0.045;
      world.rotation.y +=
        (pointerX * 0.28 + 0.18 - world.rotation.y) * 0.045;
      world.rotation.z = Math.sin(seconds * 0.18) * 0.025;

      planetGroup.rotation.y += reducedMotion.matches ? 0 : 0.0013;
      planetGroup.rotation.x =
        Math.sin(seconds * 0.34) * 0.045;
      planetMaterial.emissiveIntensity =
        0.12 + Math.sin(seconds * 0.82) * 0.03;
      innerGlow.material.opacity =
        0.032 + Math.sin(seconds * 1.1) * 0.008;

      markGroup.rotation.x =
        -pointerY * 0.08 + Math.sin(seconds * 0.5) * 0.035;
      markGroup.rotation.y =
        pointerX * 0.12 + Math.sin(seconds * 0.42) * 0.06;
      markGroup.rotation.z = Math.sin(seconds * 0.28) * 0.045;
      markMaterial.emissiveIntensity =
        0.92 + successProgress * 0.45 + Math.sin(seconds * 1.4) * 0.08;
      markHalo.rotation.z += reducedMotion.matches ? 0 : 0.0015;

      gravityRings.forEach((ring, index) => {
        ring.rotation.z +=
          reducedMotion.matches
            ? 0
            : (index === 0 ? 0.0011 : -0.0008);
      });
      gravityDust.rotation.y += reducedMotion.matches ? 0 : 0.0012;
      gravityDust.rotation.x = Math.sin(seconds * 0.2) * 0.16;

      if (!reducedMotion.matches) driftStars(delta);

      whiteLight.position.x = Math.cos(seconds * 0.38) * 3.1;
      whiteLight.position.y = Math.sin(seconds * 0.44) * 2.2;
      purpleLight.position.x = Math.cos(seconds * 0.31 + 2.4) * 3.3;
      purpleLight.position.y = Math.sin(seconds * 0.36 + 1.2) * 2.1;

      renderer.render(scene, camera);
      frame = renderer.info.render.frame;
      canvas.dataset.sceneReady = "true";
      canvas.dataset.sceneStyle = "gravity-planet";
      canvas.dataset.renderFrame = String(frame);
      gate?.classList.add("login-three-active");
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
      world.scale.setScalar(1);
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
          objectCount: world.children.length + starField.children.length,
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
