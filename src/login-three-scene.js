import * as THREE from "three";

const sourceGroups = [
  {
    id: "aidesigner",
    label: "AIDesigner",
    themes: [
      ["fluted-glass", "玻璃棱镜", 7, "#071018", "#77d9ff", "#f0c7ff", 0.2],
      ["riso-dither", "复古网点", 5, "#11131c", "#ff666b", "#6d79ff", 0.12],
      ["noise-shimmer", "薄膜微光", 3, "#12111c", "#6e4bff", "#ffb7d5", 0.46],
      ["dot-grid-wave", "点阵波", 5, "#06121b", "#2ed2d0", "#b4f3ff", 0.7],
      ["fluid-smoke", "流体烟雾", 2, "#090d18", "#5b45a5", "#e16b9f", 0.3],
      ["light-rays", "体积光束", 6, "#070b12", "#ffe2a6", "#a68cff", 0.58],
      ["holo-foil", "全息箔", 7, "#0b0e17", "#7be4ff", "#ff9dd6", 0.52],
      ["halftone", "半调印刷", 5, "#17151a", "#e5c77d", "#d24276", 0.38],
      ["caustics", "水下焦散", 4, "#03131d", "#67e4ff", "#b58aff", 0.25],
      ["aurora-flow", "极光流", 1, "#050d17", "#4effc5", "#a767ff", 0.3],
      ["silk-waves", "丝绸波浪", 2, "#0b0c17", "#ca87ff", "#f2b994", 0.55],
      ["liquid-metal", "液态金属", 7, "#11131a", "#a8d8ff", "#f2c8ff", 0.72],
      ["heatmap", "热力场", 3, "#120914", "#ff4f6e", "#ffd285", 0.28],
      ["liquid-glass", "液态玻璃", 7, "#07131b", "#8fdfff", "#d0b5ff", 0.4],
      ["mesh-gradient", "网格渐变", 3, "#0d1022", "#656cff", "#ff91ba", 0.5],
      ["starfield", "星野", 0, "#030813", "#ffffff", "#b95cff", 0.16],
      ["bokeh-dust", "散景尘埃", 0, "#080916", "#f9d9ff", "#9b7bff", 0.88],
      ["glow-orbs", "光晕", 3, "#0c0714", "#ff6cab", "#7a71ff", 0.62],
      ["ascii-plasma", "ASCII 等离子", 5, "#06110d", "#62ffb4", "#d8ff74", 0.9],
      ["pixel-grid", "像素网格", 8, "#07101d", "#51b5ff", "#da8cff", 0.65],
      ["topo-lines", "等高线", 8, "#0f1118", "#e7d2a3", "#8fb6ff", 0.34],
    ],
  },
  {
    id: "vividsites",
    label: "Vividsites Shader backgrounds",
    themes: [
      ["vivid-aurora", "极光", 1, "#041019", "#5df1cf", "#b477ff", 0.65],
      ["vivid-caustics", "焦散", 4, "#031018", "#7cecff", "#b8a0ff", 0.72],
      ["cloud-sea", "云海", 2, "#07111e", "#a8c8ff", "#e9b8d8", 0.55],
      ["grain-gradient", "颗粒渐变", 3, "#15121b", "#d58bff", "#ffb58b", 0.82],
      ["ink-fluid", "墨流", 2, "#050a12", "#3e8dff", "#d270ff", 0.44],
      ["liquid-chrome", "液态铬", 7, "#0d1117", "#d9ecff", "#9b8cff", 0.86],
      ["rain-glass", "雨玻璃", 6, "#07111b", "#a6dcff", "#d2a6ff", 0.9],
      ["warp-starfield", "曲速星场", 0, "#020510", "#ffffff", "#8f6bff", 1.35],
      ["audio-sphere", "音频星球", 0, "#050817", "#b8c8ff", "#ff8dde", 0.78],
      ["chrome-logo", "铬金属标志", 7, "#0a0d13", "#eef6ff", "#8e8dff", 0.76],
      ["click-ripple", "点击涟漪", 4, "#031018", "#7aeeff", "#c6a6ff", 0.84],
      ["curved-gallery", "曲面画廊", 7, "#0d1018", "#ffd5b7", "#9fc9ff", 0.52],
      ["data-globe", "数据地球", 8, "#03101a", "#6ee7ff", "#8d9dff", 0.86],
      ["depth-photo", "景深照片", 3, "#11141b", "#f3e9da", "#90a8ff", 0.68],
      ["dissolve-transition", "溶解转场", 2, "#080a10", "#f4f5ff", "#8b7dff", 0.94],
      ["exploded-view", "爆炸视图", 8, "#08101d", "#79c5ff", "#e4b0ff", 0.46],
      ["extruded-text", "立体文字", 8, "#0f1118", "#ffffff", "#9f8aff", 0.73],
      ["galaxy", "星系", 0, "#020511", "#fff3df", "#b470ff", 0.58],
      ["holo-card", "全息卡片", 7, "#0a1018", "#80f4ff", "#ff9cd8", 0.69],
      ["iridescent-blob", "虹彩流体", 2, "#0b0c18", "#9b8dff", "#ffd6a1", 0.82],
      ["keycap", "键帽阵列", 8, "#0b1018", "#aebfff", "#f2c8ff", 0.37],
      ["rgb-glitch", "RGB 故障", 5, "#05070d", "#ff466e", "#48e6ff", 0.99],
      ["text-particles", "文字粒子", 0, "#040713", "#ffffff", "#a277ff", 1.12],
    ],
  },
].map((group) => ({
  ...group,
  themes: group.themes.map(
    ([id, name, mode, colorA, colorB, colorC, variant]) => ({
      id,
      name,
      mode,
      colors: [colorA, colorB, colorC],
      variant,
      speed: 0.72 + (mode % 4) * 0.11,
      density: 0.52 + (variant % 0.5),
      size: 0.72 + variant * 0.38,
      depth: 0.8 + variant,
      twinkle: 0.45 + variant * 0.32,
    }),
  ),
}));

const categoryByTheme = {
  starfield: "星场",
  "bokeh-dust": "星场",
  "warp-starfield": "星场",
  galaxy: "星场",
  "audio-sphere": "星场",
  "text-particles": "星场",
  "aurora-flow": "极光云气",
  "vivid-aurora": "极光云气",
  "fluid-smoke": "极光云气",
  "silk-waves": "极光云气",
  "cloud-sea": "极光云气",
  "ink-fluid": "极光云气",
  "dissolve-transition": "极光云气",
  "noise-shimmer": "光影渐变",
  "mesh-gradient": "光影渐变",
  "heatmap": "光影渐变",
  "glow-orbs": "光影渐变",
  "grain-gradient": "光影渐变",
  "depth-photo": "光影渐变",
  "light-rays": "光影渐变",
  "riso-dither": "印刷故障",
  halftone: "印刷故障",
  "ascii-plasma": "印刷故障",
  "rgb-glitch": "印刷故障",
  "fluted-glass": "玻璃金属",
  "holo-foil": "玻璃金属",
  "liquid-metal": "玻璃金属",
  "liquid-glass": "玻璃金属",
  "liquid-chrome": "玻璃金属",
  "holo-card": "玻璃金属",
  "curved-gallery": "玻璃金属",
  "iridescent-blob": "玻璃金属",
  "chrome-logo": "玻璃金属",
  "caustics": "焦散水面",
  "vivid-caustics": "焦散水面",
  "rain-glass": "焦散水面",
  "click-ripple": "焦散水面",
  "data-globe": "焦散水面",
  "dot-grid-wave": "网格线框",
  "pixel-grid": "网格线框",
  "topo-lines": "网格线框",
  "exploded-view": "网格线框",
  "extruded-text": "网格线框",
  keycap: "网格线框",
};
const categoryOrder = [
  "星场",
  "极光云气",
  "光影渐变",
  "玻璃金属",
  "焦散水面",
  "网格线框",
  "印刷故障",
];
const themes = sourceGroups.flatMap((group) =>
  group.themes.map((theme) => ({ ...theme, group: group.label })),
);
themes.forEach((theme) => {
  theme.category = categoryByTheme[theme.id] || "其他";
});
const themeGroups = categoryOrder
  .map((category) => ({
    id: category,
    label: category,
    themes: themes.filter((theme) => theme.category === category),
  }))
  .filter((group) => group.themes.length);
const themeMap = new Map(themes.map((theme) => [theme.id, theme]));
const storageKey = "qianbian-login-background-theme";
const tuningKey = "qianbian-login-background-tuning";
let tuningOverrides = {};

try {
  const storedTuning = JSON.parse(localStorage.getItem(tuningKey) || "{}");
  tuningOverrides =
    storedTuning && typeof storedTuning === "object" ? storedTuning : {};
} catch {
  tuningOverrides = {};
}

function effectiveTheme(theme) {
  return theme
    ? { ...theme, ...(tuningOverrides[theme.id] || {}) }
    : theme;
}

let currentTheme = themes[0];

try {
  currentTheme = effectiveTheme(
    themeMap.get(localStorage.getItem(storageKey) || "") ||
      themeMap.get("starfield") ||
      themes[0],
  );
} catch {
  currentTheme = effectiveTheme(
    themeMap.get("starfield") || themes[0],
  );
}

window.QianbianLoginThemes = themeGroups;
window.QianbianLoginBackground = {
  themes,
  get current() {
    return currentTheme.id;
  },
  get config() {
    return { ...currentTheme };
  },
  setTheme(id) {
    const base = themeMap.get(id);
    if (!base) return false;
    currentTheme = effectiveTheme(base);
    try {
      localStorage.setItem(storageKey, currentTheme.id);
    } catch {}
    window.dispatchEvent(
      new CustomEvent("qianbian:login-theme-change", {
        detail: { theme: currentTheme.id, config: { ...currentTheme } },
      }),
    );
    if (window.__qianbianLoginScene?.applyTheme) {
      window.__qianbianLoginScene.applyTheme(currentTheme);
    }
    return true;
  },
  tune(values) {
    const base = themeMap.get(currentTheme.id);
    if (!base || !values || typeof values !== "object") return false;
    tuningOverrides[base.id] = {
      ...(tuningOverrides[base.id] || {}),
      ...values,
    };
    currentTheme = effectiveTheme(base);
    try {
      localStorage.setItem(tuningKey, JSON.stringify(tuningOverrides));
    } catch {}
    if (window.__qianbianLoginScene?.applyTheme) {
      window.__qianbianLoginScene.applyTheme(currentTheme);
    }
    window.dispatchEvent(
      new CustomEvent("qianbian:login-theme-tuning", {
        detail: { theme: currentTheme.id, config: { ...currentTheme } },
      }),
    );
    return true;
  },
  resetTuning() {
    const id = currentTheme.id;
    delete tuningOverrides[id];
    currentTheme = effectiveTheme(themeMap.get(id));
    try {
      localStorage.setItem(tuningKey, JSON.stringify(tuningOverrides));
    } catch {}
    if (window.__qianbianLoginScene?.applyTheme) {
      window.__qianbianLoginScene.applyTheme(currentTheme);
    }
    window.dispatchEvent(
      new CustomEvent("qianbian:login-theme-tuning", {
        detail: { theme: currentTheme.id, config: { ...currentTheme } },
      }),
    );
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
    renderer.setClearColor(0x03040a, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMode: { value: currentTheme.mode },
      uVariant: { value: currentTheme.variant },
      uDensity: { value: currentTheme.density },
      uSpeed: { value: currentTheme.speed },
      uSize: { value: currentTheme.size },
      uDepth: { value: currentTheme.depth },
      uTwinkle: { value: currentTheme.twinkle },
      uColorA: { value: new THREE.Color(currentTheme.colors[0]) },
      uColorB: { value: new THREE.Color(currentTheme.colors[1]) },
      uColorC: { value: new THREE.Color(currentTheme.colors[2]) },
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
        uniform float uMode;
        uniform float uVariant;
        uniform float uDensity;
        uniform float uSpeed;
        uniform float uSize;
        uniform float uDepth;
        uniform float uTwinkle;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;

        float hash21(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        vec2 hash22(vec2 p) {
          float n = hash21(p);
          return vec2(n, hash21(p + 17.17));
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash21(i);
          float b = hash21(i + vec2(1.0, 0.0));
          float c = hash21(i + vec2(0.0, 1.0));
          float d = hash21(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += noise(p) * amplitude;
            p = p * 2.03 + vec2(13.1, 7.7);
            amplitude *= 0.5;
          }
          return value;
        }

        float starLayer(vec2 p, float scale, float seed, float size) {
          p += (uMouse - 0.5) * uDepth * 0.12;
          vec2 grid = p * scale;
          vec2 id = floor(grid);
          vec2 f = fract(grid) - 0.5;
          float h = hash21(id + seed);
          float present = smoothstep(0.28, 1.0, h) * uDensity;
          vec2 offset = (hash22(id + seed + 17.0) - 0.5) * 0.72;
          float distanceToStar = length(f - offset);
          float radius = mix(0.035, 0.14, pow(h, 7.0)) * size;
          float core = smoothstep(radius, 0.0, distanceToStar);
          float twinkle =
            0.66 +
            sin(uTime * uSpeed * (0.8 + uTwinkle * 2.2) + h * 40.0) *
              (0.18 + uTwinkle * 0.2);
          return core * present * (0.28 + h * h * 1.8) * twinkle;
        }

        vec3 cosmicStars(vec2 p) {
          float band = fbm(vec2(p.x * 0.72, p.y * 1.5 + p.x * 0.18) + 3.0);
          float milky = smoothstep(0.24, 0.82, band) *
            smoothstep(0.82, 0.12, abs(p.y + p.x * 0.08));
          vec3 color = uColorA * 0.42;
          color += mix(uColorB, uColorC, 0.36) * milky * 0.13;
          float stars = 0.0;
          stars += starLayer(p, 9.0, 1.0, 0.65) * 0.52;
          stars += starLayer(p, 17.0, 21.0, 0.82) * 0.75;
          stars += starLayer(p, 31.0, 47.0, 1.0) * 0.92;
          if (uVariant > 0.8) {
            stars += starLayer(p, 6.0, 83.0, 2.4) * 0.34;
          }
          float shooting = 0.0;
          float cycle = fract(uTime * 0.028 + uVariant * 0.17);
          if (cycle > 0.78) {
            vec2 a = vec2(-1.1, 0.48);
            vec2 b = vec2(0.9, -0.35);
            float line = length(p - mix(a, b, clamp((cycle - 0.78) / 0.22, 0.0, 1.0)));
            shooting = smoothstep(0.022, 0.0, line) * (1.0 - cycle) * 2.6;
          }
          return color + vec3(stars + shooting) * mix(uColorB, vec3(1.0), 0.65);
        }

        vec3 aurora(vec2 p) {
          float t = uTime * uSpeed * 0.13;
          float warp = fbm(p * 1.6 + vec2(t, t * 0.4));
          float curtain = 0.0;
          for (int i = 0; i < 3; i++) {
            float fi = float(i);
            float center =
              0.18 +
              sin(p.x * (2.1 + fi * 0.42) + t * (1.0 + fi * 0.25)) *
                (0.16 + fi * 0.025) +
              warp * 0.16;
            float band = smoothstep(0.44 - fi * 0.08, 0.0, abs(p.y - center));
            float rays =
              0.52 +
              0.48 *
                sin(p.x * (22.0 + fi * 9.0) + warp * 7.0 + t * 2.4);
            curtain += band * rays * (0.55 - fi * 0.1);
          }
          float stars = starLayer(p, 28.0, 44.0, 0.85) * 0.34;
          return uColorA * 0.44 +
            mix(uColorB, uColorC, vUv.y + warp * 0.16) * curtain * 0.9 +
            vec3(stars);
        }

        vec3 fluid(vec2 p) {
          float t = uTime * uSpeed * 0.05;
          vec2 q = vec2(fbm(p * 1.5 + vec2(t, 0.0)), fbm(p * 1.5 + vec2(4.2, t)));
          float f = fbm(p * 2.0 + q * 1.7 + vec2(t * 0.7, -t * 0.4));
          vec3 color = mix(uColorA, uColorB, smoothstep(0.14, 0.85, f));
          color = mix(color, uColorC, smoothstep(0.42, 0.95, fbm(p * 3.4 + q + t)));
          return color * (0.52 + f * 0.72);
        }

        vec3 meshGradient(vec2 p) {
          float t = uTime * uSpeed * 0.04;
          vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t));
          float f = fbm(p * 2.1 + q * 1.3 + t);
          vec3 color = mix(uColorA, uColorB, smoothstep(0.12, 0.9, f + p.x * 0.12));
          color = mix(color, uColorC, smoothstep(0.35, 0.86, 1.0 - length(p) + f * 0.3));
          return color * (0.64 + f * 0.4);
        }

        vec3 caustics(vec2 p) {
          float t = uTime * uSpeed * 0.12;
          vec2 q = p + vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t)) * 0.22;
          float web =
            abs(sin(q.x * 10.0 + sin(q.y * 8.0 + t) * 1.8 + t)) +
            abs(sin(q.y * 12.0 - sin(q.x * 7.0 - t) * 1.4 - t));
          float lines = pow(1.0 - min(web * 0.5, 1.0), 7.0);
          return uColorA * 0.36 +
            mix(uColorB, uColorC, vUv.y) * lines * 0.9;
        }

        vec3 printGrid(vec2 p) {
          float scale = mix(30.0, 82.0, uVariant);
          vec2 grid = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * scale;
          vec2 id = floor(grid);
          vec2 f = fract(grid) - 0.5;
          float h = hash21(id + floor(uTime * uSpeed * 0.1));
          float field = fbm(id * 0.045 + uTime * 0.012);
          float radius = mix(0.06, 0.43, smoothstep(0.18, 0.9, field + h * 0.2));
          float dot = smoothstep(radius, 0.0, length(f));
          vec3 ink = mix(uColorA, uColorB, smoothstep(0.05, 0.92, field));
          return mix(ink * 0.42, uColorC, dot * (0.5 + field * 0.45));
        }

        vec3 lightRays(vec2 p) {
          float t = uTime * uSpeed * 0.08;
          vec2 origin = vec2(-0.15, 0.42);
          vec2 delta = p - origin;
          float angle = atan(delta.y, delta.x);
          float rays =
            0.5 + 0.5 * sin(angle * 28.0 + sin(angle * 9.0 + t) * 3.0 + t * 2.0);
          rays = pow(rays, 8.0);
          float distanceFade = smoothstep(1.2, 0.02, length(delta));
          float dust = fbm(p * 4.0 + t) * 0.1;
          return uColorA * 0.34 +
            mix(uColorB, uColorC, vUv.x) * rays * distanceFade * 0.72 +
            vec3(dust);
        }

        vec3 foilGlass(vec2 p) {
          float t = uTime * uSpeed * 0.06;
          float ribs = sin((vUv.x * 1.35 + vUv.y * 0.42) * 28.0 + t);
          float lens = smoothstep(0.0, 0.9, 1.0 - abs(ribs));
          float sheen = smoothstep(0.12, 1.0, fbm(p * 1.8 + t) + vUv.y * 0.35);
          vec3 color = mix(uColorA, uColorB, sheen * 0.72);
          color = mix(color, uColorC, lens * 0.42);
          color += vec3(0.08) * pow(lens, 8.0);
          return color;
        }

        vec3 contourLines(vec2 p) {
          float t = uTime * uSpeed * 0.03;
          float field = fbm(p * 2.0 + t) + fbm(p * 4.2 - t) * 0.22;
          float contour = abs(fract(field * 13.0) - 0.5);
          float line = smoothstep(0.055, 0.0, contour);
          return mix(uColorA * 0.58, uColorB, vUv.y) +
            uColorC * line * 0.54;
        }

        void main() {
          vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
          vec3 color = cosmicStars(p);
          float mode = floor(uMode + 0.5);
          if (mode == 1.0) color = aurora(p);
          else if (mode == 2.0) color = fluid(p);
          else if (mode == 3.0) color = meshGradient(p);
          else if (mode == 4.0) color = caustics(p);
          else if (mode == 5.0) color = printGrid(p);
          else if (mode == 6.0) color = lightRays(p);
          else if (mode == 7.0) color = foilGlass(p);
          else if (mode == 8.0) color = contourLines(p);
          color *= 0.92;
          color = pow(max(color, 0.0), vec3(0.92));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let frame = 0;
    let lastTime = 0;
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
      const seconds = time * 0.001;
      uniforms.uTime.value = seconds;
      uniforms.uMouse.value.x +=
        (mouseX - uniforms.uMouse.value.x) * 0.035;
      uniforms.uMouse.value.y +=
        (mouseY - uniforms.uMouse.value.y) * 0.035;
      renderer.render(scene, camera);
      frame = renderer.info.render.frame;
      canvas.dataset.sceneReady = "true";
      canvas.dataset.theme = currentTheme.id;
      canvas.dataset.renderFrame = String(frame);
      lastTime = time;
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
      currentTheme = theme;
      uniforms.uMode.value = theme.mode;
      uniforms.uVariant.value = theme.variant;
      uniforms.uDensity.value = theme.density;
      uniforms.uSpeed.value = theme.speed;
      uniforms.uSize.value = theme.size;
      uniforms.uDepth.value = theme.depth;
      uniforms.uTwinkle.value = theme.twinkle;
      uniforms.uColorA.value.set(theme.colors[0]);
      uniforms.uColorB.value.set(theme.colors[1]);
      uniforms.uColorC.value.set(theme.colors[2]);
      canvas.dataset.theme = theme.id;
      renderer.render(scene, camera);
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
    window.addEventListener("qianbian:login-theme-change", (event) => {
      const theme = themeMap.get(event.detail?.theme);
      if (theme) applyTheme(theme);
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
