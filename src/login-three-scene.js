import * as THREE from "three";

const STARFIELD_THEME = {
  id: "starfield",
  name: "星野",
  colors: ["#9db4ff", "#e8efff", "#ffffff", "#ffd9a8"],
  background: "#030714",
  speed: 0.25,
  density: 0.5,
  size: 0.4,
  depth: 3,
  twinkle: 0.55,
  shooting: 0.3,
  angle: 28,
  mouse: 0.7,
};

const themes = [{ ...STARFIELD_THEME, colors: [...STARFIELD_THEME.colors] }];
const themeGroups = [{ id: "default", label: "默认", themes }];
const storageKey = "qianbian-login-background-theme";
let currentTheme = { ...themes[0], colors: [...themes[0].colors] };

try {
  // Clear old theme/tuning state so removed themes cannot affect startup.
  localStorage.removeItem(storageKey);
  localStorage.removeItem("qianbian-login-background-tuning-v3");
} catch {}

window.QianbianLoginThemes = themeGroups;
window.QianbianLoginBackground = {
  themes,
  get current() {
    return currentTheme.id;
  },
  get config() {
    return { ...currentTheme, colors: [...currentTheme.colors] };
  },
  setTheme(id) {
    if (id !== STARFIELD_THEME.id) return false;
    currentTheme = { ...STARFIELD_THEME, colors: [...STARFIELD_THEME.colors] };
    window.__qianbianLoginScene?.applyTheme(currentTheme);
    return true;
  },
};

const canvas = document.getElementById("login-three-canvas");

if (canvas) {
  const gate = canvas.closest(".login-gate");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
  } catch {
    canvas.hidden = true;
    canvas.dataset.sceneReady = "false";
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x030714, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uDensity: { value: currentTheme.density },
      uSpeed: { value: currentTheme.speed },
      uSize: { value: currentTheme.size },
      uDepth: { value: currentTheme.depth },
      uTwinkle: { value: currentTheme.twinkle },
      uShooting: { value: currentTheme.shooting },
      uAngle: { value: currentTheme.angle },
      uMouseStrength: { value: currentTheme.mouse },
      uBackground: { value: new THREE.Color(currentTheme.background) },
      uColor0: { value: new THREE.Color(currentTheme.colors[0]) },
      uColor1: { value: new THREE.Color(currentTheme.colors[1]) },
      uColor2: { value: new THREE.Color(currentTheme.colors[2]) },
      uColor3: { value: new THREE.Color(currentTheme.colors[3]) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      depthTest: false,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uDensity;
        uniform float uSpeed;
        uniform float uSize;
        uniform float uDepth;
        uniform float uTwinkle;
        uniform float uShooting;
        uniform float uAngle;
        uniform float uMouseStrength;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec3 uBackground;
        uniform vec3 uColor0;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;

        float hash21(vec2 p) {
          p = fract(p * vec2(127.1, 311.7));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }

        float valueNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash21(i);
          float b = hash21(i + vec2(1.0, 0.0));
          float c = hash21(i + vec2(0.0, 1.0));
          float d = hash21(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm3(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 3; i++) {
            value += valueNoise(p) * amplitude;
            p = p * 2.13 + vec2(7.3, 3.1);
            amplitude *= 0.55;
          }
          return value;
        }

        vec3 starColor(float index) {
          float i = mod(index, 4.0);
          if (i < 0.5) return uColor0;
          if (i < 1.5) return uColor1;
          if (i < 2.5) return uColor2;
          return uColor3;
        }

        vec4 starSheet(
          vec2 uv,
          vec2 drift,
          float scale,
          float seed,
          float density,
          float sizeScale,
          float brightness,
          float flare,
          float time
        ) {
          vec2 grid = (uv + drift) * scale;
          vec2 cell = floor(grid);
          vec2 local = fract(grid);
          vec3 light = vec3(0.0);
          float luminance = 0.0;

          for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
              vec2 offset = vec2(float(x), float(y));
              vec2 id = cell + offset;
              float presence = hash21(id + seed);
              if (presence > density) continue;

              vec2 position =
                offset + vec2(hash21(id + seed + 1.7), hash21(id + seed + 9.3));
              vec2 delta = local - position;
              float distanceToStar = length(delta);
              float magnitude = pow(hash21(id + seed + 4.2), 4.0);
              float radius = (0.05 + 0.30 * magnitude) * sizeScale;
              float core = exp(-dot(delta, delta) / max(radius * radius, 1e-5) * 4.0);
              float halo = exp(-distanceToStar / max(radius * 1.1, 1e-5)) *
                0.30 * (0.20 + magnitude);
              float window = smoothstep(1.0, 0.55, distanceToStar);
              float rate = 1.6 + 4.5 * hash21(id + seed + 3.1);
              float phase = hash21(id + seed + 7.7) * 6.2831;
              float amplitude = uTwinkle * (0.85 - 0.55 * magnitude);
              float twinkle = 1.0 - amplitude *
                (0.5 + 0.5 * sin(time * rate + phase)) *
                (0.72 + 0.28 * sin(time * rate * 2.33 + phase * 1.7));
              float intensity =
                (core + halo) * (0.22 + 1.15 * magnitude) * brightness * twinkle;

              float spikes = smoothstep(0.62, 0.92, magnitude) * flare;
              if (spikes > 0.001) {
                float horizontal =
                  exp(-abs(delta.y) * 42.0 / sizeScale) *
                  exp(-abs(delta.x) * 2.6);
                float vertical =
                  exp(-abs(delta.x) * 42.0 / sizeScale) *
                  exp(-abs(delta.y) * 4.6);
                intensity += (horizontal + vertical * 0.55) * spikes * 0.55 * twinkle;
              }

              intensity *= window;
              vec3 color = starColor(pow(hash21(id + seed + 6.6), 1.5) * 4.0);
              color = mix(color, vec3(1.0), core * 0.55);
              light += color * intensity;
              luminance += intensity;
            }
          }
          return vec4(light, luminance);
        }

        void main() {
          float aspect = uResolution.x / max(uResolution.y, 1.0);
          vec2 uv = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
          float time = uTime;
          float angle = radians(uAngle);
          vec2 direction = vec2(cos(angle), sin(angle));
          float normalizedSize = uSize / 0.4;

          vec2 mouseOffset = uMouse - vec2(0.5 * aspect, 0.5);
          float mouseDistance = length(mouseOffset);
          vec2 parallax = normalize(mouseOffset + vec2(1e-5)) *
            (1.0 - exp(-mouseDistance * 3.0)) * uMouseStrength;

          vec3 background =
            uBackground * (0.70 + 0.58 * (1.0 - vUv.y)) +
            uBackground * exp(-vUv.y * 3.0) * 0.75;

          vec2 rotated = mat2(direction.x, -direction.y, direction.y, direction.x) *
            (uv + parallax * 0.007);
          float bandDistance = rotated.y + 0.14 * sin(rotated.x * 1.7 + 1.3);
          float band = exp(-bandDistance * bandDistance * 14.0);
          vec2 noisePosition =
            rotated * 3.2 + vec2(time * uSpeed * 0.012, 0.0);
          float haze = fbm3(noisePosition + vec2(11.2, 7.4));
          float dust = valueNoise(noisePosition * 2.4 + vec2(3.7, 9.2));
          float nebula = band * smoothstep(0.26, 0.85, haze);
          nebula *= 1.0 - 0.62 * smoothstep(0.52, 0.88, dust) * band;
          vec3 nebulaColor = mix(uColor0, uColor1, smoothstep(0.2, 0.9, haze));
          vec3 light = nebulaColor * (nebula * 0.16 + band * 0.05);

          float density = 0.25 + 0.55 * uDensity;
          vec4 layer = starSheet(
            uv + parallax * 0.026,
            direction * time * uSpeed * 0.030,
            16.0,
            3.7,
            density * 0.42,
            normalizedSize * 0.8,
            0.85,
            0.0,
            time
          );
          light += layer.rgb;

          layer = starSheet(
            uv + parallax * 0.012,
            direction * time * uSpeed * 0.012,
            38.0,
            17.3,
            density * 0.65 * (0.7 + 0.6 * band),
            normalizedSize * 0.6,
            0.55,
            0.0,
            time
          );
          light += layer.rgb;

          if (uDepth > 2.5) {
            layer = starSheet(
              uv + parallax * 0.055,
              direction * time * uSpeed * 0.060,
              7.0,
              29.1,
              density * 0.33,
              normalizedSize * 1.5,
              1.25,
              1.0,
              time
            );
            light += layer.rgb;
          }

          if (uShooting > 0.01) {
            for (int k = 0; k < 2; k++) {
              float index = float(k);
              float cycle = mix(26.0, 7.0, uShooting) * (1.0 + index * 0.43);
              float phase = fract(time / cycle + index * 0.5);
              float eventId = floor(time / cycle + index * 0.5);
              float chance = hash21(vec2(eventId, index * 7.0 + 1.0));
              if (chance < 0.25) continue;
              float lifetime = 1.4 / cycle;
              if (phase > lifetime) continue;

              float progress = phase / lifetime;
              float meteorAngle =
                angle + 3.6 + 0.5 * hash21(vec2(eventId, index + 2.2));
              vec2 meteorDirection = vec2(cos(meteorAngle), sin(meteorAngle));
              vec2 start = vec2(
                (hash21(vec2(eventId, index + 3.3)) - 0.5) * aspect * 0.9,
                (hash21(vec2(eventId, index + 4.4)) - 0.1) * 0.45
              );
              float travel = 0.5 + 0.45 * hash21(vec2(eventId, index + 5.5));
              vec2 head = start + meteorDirection * travel * progress;
              vec2 relative = uv - head;
              float along = dot(relative, meteorDirection);
              float perpendicular =
                abs(dot(relative, vec2(-meteorDirection.y, meteorDirection.x)));
              float tailLength = mix(0.04, 0.30, min(progress * 2.5, 1.0)) *
                (0.6 + 0.6 * hash21(vec2(eventId, index + 6.6)));
              float tail = clamp(-along / tailLength, 0.0, 1.0);
              float sigma = mix(0.0028, 0.0006, tail) * (0.8 + 0.6 * chance);
              float envelope =
                pow(sin(progress * 3.14159), 0.75) * (0.55 + 0.7 * chance);
              float body =
                exp(-perpendicular * perpendicular / (2.0 * sigma * sigma)) *
                pow(1.0 - tail, 2.2) * step(along, 0.0);
              float core = exp(-dot(relative, relative) * 9000.0) * 1.6 +
                exp(-length(relative) * 40.0) * 0.35;
              float meteor = (body * 1.2 + core) * envelope;
              vec3 meteorColor = mix(vec3(1.0), uColor3, tail * 0.55);
              light += meteorColor * meteor;
            }
          }

          light = 1.0 - exp(-light * 1.5);
          vec3 color = background + light;
          vec2 vignette = uv * vec2(0.78, 1.05);
          color *= 1.0 - 0.28 * dot(vignette, vignette);
          float grain =
            hash21(gl_FragCoord.xy + vec2(fract(time * 0.7) * 101.0, fract(time * 1.3) * 61.0)) -
            0.5;
          color += grain * 0.008;
          gl_FragColor = vec4(max(color, 0.0), 1.0);
        }
      `,
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let frame = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const pixelWidth = Math.round(width * renderer.getPixelRatio());
      const pixelHeight = Math.round(height * renderer.getPixelRatio());
      if (canvas.width === pixelWidth && canvas.height === pixelHeight) return;
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    }

    function render(time = 0) {
      resize();
      uniforms.uTime.value = time * 0.001;
      uniforms.uMouse.value.x +=
        (mouseX - uniforms.uMouse.value.x) * 0.035;
      uniforms.uMouse.value.y +=
        (mouseY - uniforms.uMouse.value.y) * 0.035;
      renderer.render(scene, camera);
      frame = renderer.info.render.frame;
      canvas.dataset.sceneReady = "true";
      canvas.dataset.theme = currentTheme.id;
      canvas.dataset.renderFrame = String(frame);
    }

    function animationLoop(time) {
      if (reducedMotion.matches && frame > 0) return;
      render(time);
    }

    function syncAnimation() {
      if (gate?.hidden) {
        renderer.setAnimationLoop(null);
        return;
      }
      render(performance.now());
      if (reducedMotion.matches) {
        renderer.setAnimationLoop(null);
      } else {
        renderer.setAnimationLoop(animationLoop);
      }
    }

    function applyTheme(theme) {
      if (theme?.id !== STARFIELD_THEME.id) return false;
      currentTheme = { ...STARFIELD_THEME, colors: [...STARFIELD_THEME.colors] };
      uniforms.uDensity.value = currentTheme.density;
      uniforms.uSpeed.value = currentTheme.speed;
      uniforms.uSize.value = currentTheme.size;
      uniforms.uDepth.value = currentTheme.depth;
      uniforms.uTwinkle.value = currentTheme.twinkle;
      uniforms.uShooting.value = currentTheme.shooting;
      uniforms.uAngle.value = currentTheme.angle;
      uniforms.uMouseStrength.value = currentTheme.mouse;
      uniforms.uBackground.value.set(currentTheme.background);
      uniforms.uColor0.value.set(currentTheme.colors[0]);
      uniforms.uColor1.value.set(currentTheme.colors[1]);
      uniforms.uColor2.value.set(currentTheme.colors[2]);
      uniforms.uColor3.value.set(currentTheme.colors[3]);
      render(performance.now());
      return true;
    }

    window.__qianbianLoginScene = {
      applyTheme,
      stats() {
        return {
          renderCalls: renderer.info.render.calls,
          objectCount: scene.children.length,
          triangles: renderer.info.render.triangles,
          frame,
          pixelRatio: renderer.getPixelRatio(),
          width: canvas.width,
          height: canvas.height,
          theme: currentTheme.id,
        };
      },
      samplePixels() {
        render(performance.now());
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
          if (red + green + blue > 24) painted += 1;
        }
        return { painted, maxChannel, width, height };
      },
      signature() {
        return this.signatureAt(1234);
      },
      signatureAt(time) {
        render(time);
        const gl = renderer.getContext();
        const width = renderer.domElement.width;
        const height = renderer.domElement.height;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let hash = 2166136261;
        const columns = 24;
        const rows = 14;
        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const x = Math.min(
              width - 1,
              Math.floor(((column + 0.5) / columns) * width),
            );
            const y = Math.min(
              height - 1,
              Math.floor(((row + 0.5) / rows) * height),
            );
            const index = (y * width + x) * 4;
            const luminance = Math.floor(
              (pixels[index] * 0.2126 +
                pixels[index + 1] * 0.7152 +
                pixels[index + 2] * 0.0722) /
                16,
            );
            hash ^= luminance;
            hash = Math.imul(hash, 16777619);
          }
        }
        return hash >>> 0;
      },
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    resizeObserver.observe(canvas);

    gate?.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches) return;
      const rect = gate.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width;
      mouseY = (event.clientY - rect.top) / rect.height;
    });
    gate?.addEventListener("pointerleave", () => {
      mouseX = 0.5;
      mouseY = 0.5;
    });
    window.addEventListener("qianbian:auth-required", syncAnimation);

    if (gate) {
      new MutationObserver(syncAnimation).observe(gate, {
        attributes: true,
        attributeFilter: ["hidden"],
      });
    }

    applyTheme(currentTheme);
    syncAnimation();
  }
}
