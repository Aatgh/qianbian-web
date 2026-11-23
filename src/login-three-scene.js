import * as THREE from "three";

const LOGO_THEME_PALETTE = ["#09040a", "#a62466", "#f6e9ff"];

const sourceGroups = [
  {
    id: "aidesigner",
    label: "AIDesigner",
    themes: [
      ["fluted-glass", "玻璃棱镜", 12, "#071018", "#77d9ff", "#f0c7ff", 0.2],
      ["riso-dither", "复古网点", 15, "#11131c", "#ff666b", "#6d79ff", 0.12],
      ["noise-shimmer", "薄膜微光", 30, "#12111c", "#6e4bff", "#ffb7d5", 0.46],
      ["dot-grid-wave", "点阵波", 32, "#06121b", "#2ed2d0", "#b4f3ff", 0.7],
      ["fluid-smoke", "流体烟雾", 6, "#090d18", "#5b45a5", "#e16b9f", 0.3],
      ["light-rays", "体积光束", 20, "#070b12", "#ffe2a6", "#a68cff", 0.58],
      ["holo-foil", "全息箔", 13, "#0b0e17", "#7be4ff", "#ff9dd6", 0.52],
      ["halftone", "半调印刷", 15, "#17151a", "#e5c77d", "#d24276", 0.38],
      ["caustics", "水下焦散", 10, "#03131d", "#67e4ff", "#b58aff", 0.25],
      ["aurora-flow", "极光流", 4, "#050d17", "#4effc5", "#a767ff", 0.3],
      ["silk-waves", "丝绸波浪", 34, "#0b0c17", "#ca87ff", "#f2b994", 0.55],
      ["liquid-metal", "液态金属", 14, "#11131a", "#a8d8ff", "#f2c8ff", 0.72],
      ["heatmap", "热力场", 28, "#120914", "#ff4f6e", "#ffd285", 0.28],
      ["liquid-glass", "液态玻璃", 37, "#07131b", "#8fdfff", "#d0b5ff", 0.4],
      ["mesh-gradient", "网格渐变", 7, "#0d1022", "#656cff", "#ff91ba", 0.5],
      ["starfield", "星野", 0, "#030813", "#ffffff", "#b95cff", 0.16],
      ["bokeh-dust", "散景尘埃", 25, "#080916", "#f9d9ff", "#9b7bff", 0.88],
      ["glow-orbs", "光晕", 9, "#0c0714", "#ff6cab", "#7a71ff", 0.62],
      ["ascii-plasma", "ASCII 等离子", 17, "#06110d", "#62ffb4", "#d8ff74", 0.9],
      ["pixel-grid", "像素网格", 16, "#07101d", "#51b5ff", "#da8cff", 0.65],
      ["topo-lines", "等高线", 18, "#0f1118", "#e7d2a3", "#8fb6ff", 0.34],
    ],
  },
  {
    id: "vividsites",
    label: "Vividsites Shader backgrounds",
    themes: [
      ["vivid-aurora", "极光", 38, "#041019", "#5df1cf", "#b477ff", 0.65],
      ["vivid-caustics", "焦散", 40, "#031018", "#7cecff", "#b8a0ff", 0.72],
      ["cloud-sea", "云海", 5, "#07111e", "#a8c8ff", "#e9b8d8", 0.55],
      ["grain-gradient", "颗粒渐变", 26, "#15121b", "#d58bff", "#ffb58b", 0.82],
      ["ink-fluid", "墨流", 35, "#050a12", "#3e8dff", "#d270ff", 0.44],
      ["liquid-chrome", "液态铬", 43, "#0d1117", "#d9ecff", "#9b8cff", 0.86],
      ["rain-glass", "雨玻璃", 11, "#07111b", "#a6dcff", "#d2a6ff", 0.9],
      ["warp-starfield", "曲速星场", 1, "#020510", "#ffffff", "#8f6bff", 1.35],
      ["audio-sphere", "音频星球", 23, "#050817", "#b8c8ff", "#ff8dde", 0.78],
      ["chrome-logo", "铬金属标志", 39, "#0a0d13", "#eef6ff", "#8e8dff", 0.76],
      ["click-ripple", "点击涟漪", 22, "#031018", "#7aeeff", "#c6a6ff", 0.84],
      ["curved-gallery", "曲面画廊", 33, "#0d1018", "#ffd5b7", "#9fc9ff", 0.52],
      ["data-globe", "数据地球", 21, "#03101a", "#6ee7ff", "#8d9dff", 0.86],
      ["depth-photo", "景深照片", 27, "#11141b", "#f3e9da", "#90a8ff", 0.68],
      ["dissolve-transition", "溶解转场", 36, "#080a10", "#f4f5ff", "#8b7dff", 0.94],
      ["exploded-view", "爆炸视图", 24, "#08101d", "#79c5ff", "#e4b0ff", 0.46],
      ["extruded-text", "立体文字", 29, "#0f1118", "#ffffff", "#9f8aff", 0.73],
      ["galaxy", "星系", 2, "#020511", "#fff3df", "#b470ff", 0.58],
      ["holo-card", "全息卡片", 42, "#0a1018", "#80f4ff", "#ff9cd8", 0.69],
      ["iridescent-blob", "虹彩流体", 41, "#0b0c18", "#9b8dff", "#ffd6a1", 0.82],
      ["keycap", "键帽阵列", 16, "#0b1018", "#aebfff", "#f2c8ff", 0.37],
      ["rgb-glitch", "RGB 故障", 19, "#05070d", "#ff466e", "#48e6ff", 0.99],
      ["text-particles", "文字粒子", 31, "#040713", "#ffffff", "#a277ff", 1.12],
    ],
  },
].map((group) => ({
  ...group,
  themes: group.themes.map(
    ([id, name, mode, colorA, colorB, colorC, variant]) => ({
      id,
      name,
      mode,
      colors: [...LOGO_THEME_PALETTE],
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
const tuningKey = "qianbian-login-background-tuning-v2";
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

        vec3 glowOrbs(vec2 p) {
          float t = uTime * uSpeed * 0.08;
          vec3 color = uColorA * 0.22;
          for (int i = 0; i < 5; i++) {
            float fi = float(i);
            vec2 center = vec2(
              sin(t * (0.35 + fi * 0.05) + fi * 2.1) * 0.72,
              cos(t * (0.28 + fi * 0.04) + fi * 1.7) * 0.5
            );
            float glow = smoothstep(0.5 - fi * 0.04, 0.0, length(p - center));
            color += mix(uColorB, uColorC, fi / 4.0) * glow * 0.2;
          }
          return color;
        }

        vec3 rainGlass(vec2 p) {
          float t = uTime * uSpeed;
          vec3 color = fluid(p) * 0.46;
          vec2 grid = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 24.0;
          vec2 id = floor(grid);
          vec2 f = fract(grid) - 0.5;
          float h = hash21(id + 5.0);
          vec2 drop = vec2((h - 0.5) * 0.25, 0.12 + sin(t * 0.8 + h * 12.0) * 0.28);
          float dropMask = smoothstep(0.13, 0.0, length((f - drop) * vec2(1.0, 1.8)));
          float trail = smoothstep(0.05, 0.0, abs(f.x - drop.x)) *
            smoothstep(0.5, 0.0, abs(f.y - drop.y + 0.16));
          color += mix(uColorB, uColorC, h) * (dropMask + trail * 0.35) * 0.5;
          return color;
        }

        vec3 flutedGlass(vec2 p) {
          float warp = fbm(p * 1.4 + uTime * uSpeed * 0.03);
          float ribs = sin((vUv.x * 1.15 + vUv.y * 0.12) * 72.0 + warp * 2.5);
          float lens = smoothstep(0.5, 1.0, 1.0 - abs(ribs));
          float edge = smoothstep(0.92, 1.0, abs(sin(vUv.x * 44.0 + warp)));
          vec3 color = mix(uColorA, uColorB, vUv.y * 0.7 + warp * 0.2);
          color += uColorC * lens * 0.25 + vec3(edge * 0.08);
          return color;
        }

        vec3 holoFoil(vec2 p) {
          float t = uTime * uSpeed * 0.09;
          float bands =
            sin(vUv.y * 80.0 + fbm(p * 2.0 + t) * 4.0 + t * 2.0) +
            sin(vUv.x * 55.0 - p.y * 9.0 - t);
          float sheen = smoothstep(-0.4, 1.2, bands);
          vec3 color = mix(uColorA, uColorB, vUv.y);
          color = mix(color, uColorC, sheen * 0.52);
          color += vec3(pow(sheen, 4.0) * 0.22);
          return color;
        }

        vec3 liquidMetal(vec2 p) {
          float t = uTime * uSpeed * 0.07;
          vec2 q = vec2(fbm(p * 1.7 + t), fbm(p * 1.7 - t));
          float bands = sin((p.x + q.x * 0.35) * 20.0 + sin(p.y * 7.0 + t) * 2.5);
          float spec = pow(max(0.0, bands), 12.0);
          vec3 color = mix(uColorA, mix(uColorB, uColorC, q.x), 0.5 + bands * 0.22);
          return color + vec3(spec * 0.3);
        }

        vec3 halftone(vec2 p) {
          float scale = mix(42.0, 72.0, uVariant);
          vec2 grid = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * scale;
          vec2 id = floor(grid);
          vec2 f = fract(grid) - 0.5;
          float field = fbm(id * 0.035 + uTime * uSpeed * 0.015);
          float radius = mix(0.06, 0.46, smoothstep(0.2, 0.85, field));
          float dotMask = smoothstep(radius, 0.0, length(f));
          return mix(uColorA * 0.32, uColorB, dotMask * 0.88);
        }

        vec3 pixelGrid(vec2 p) {
          float count = mix(18.0, 42.0, uVariant);
          vec2 grid = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * count;
          vec2 id = floor(grid);
          vec2 f = abs(fract(grid) - 0.5);
          float cell = step(max(f.x, f.y), 0.42) * (1.0 - step(0.46, max(f.x, f.y)));
          float value = fbm(id * 0.08 + uTime * uSpeed * 0.02);
          vec3 color = mix(uColorA, uColorB, value);
          return mix(color * 0.5, uColorC, cell * value * 0.75);
        }

        vec3 asciiPlasma(vec2 p) {
          vec2 grid = floor(vUv * vec2(72.0, 40.0));
          vec2 f = fract(vUv * vec2(72.0, 40.0));
          float field = fbm(p * 2.5 + uTime * uSpeed * 0.05);
          float glyph =
            step(abs(f.x - 0.5), 0.12) +
            step(abs(f.y - 0.5), 0.08) * step(0.4, field) +
            step(abs(f.x - f.y), 0.1) * step(0.65, field);
          glyph = clamp(glyph, 0.0, 1.0);
          float inkActive = step(0.34, hash21(grid + floor(uTime * 2.0)));
          return mix(uColorA * 0.4, uColorC, glyph * inkActive * 0.8) +
            uColorB * field * 0.16;
        }

        vec3 topoLines(vec2 p) {
          float field = fbm(p * 2.1 + uTime * uSpeed * 0.025) +
            fbm(p * 4.4 - uTime * uSpeed * 0.02) * 0.28;
          float contour = abs(fract(field * 18.0) - 0.5);
          float line = smoothstep(0.045, 0.0, contour);
          float major = smoothstep(0.018, 0.0, abs(fract(field * 4.0) - 0.5));
          vec3 color = mix(uColorA * 0.52, uColorB, vUv.y);
          return color + uColorC * (line * 0.28 + major * 0.2);
        }

        vec3 glitch(vec2 p) {
          float t = floor(uTime * uSpeed * 8.0) / 8.0;
          float band = floor(vUv.y * 28.0);
          float shift = (hash21(vec2(band, t)) - 0.5) * 0.12;
          vec2 q = p + vec2(shift, 0.0);
          float field = fbm(q * 3.0 + t);
          vec3 left = mix(uColorA, uColorB, field);
          vec3 right = mix(uColorA, uColorC, fbm((q + vec2(0.03, 0.0)) * 3.0 + t));
          float scan = 0.7 + 0.3 * sin(vUv.y * 420.0);
          return vec3(left.r, mix(left.g, right.g, 0.5), right.b) * scan;
        }

        vec3 dataGlobe(vec2 p) {
          vec2 q = p * vec2(1.0, 1.0);
          float radius = length(q);
          float longitude = abs(sin(atan(q.y, q.x) * 16.0 + uTime * uSpeed * 0.15));
          float latitude = abs(sin(q.y * 38.0 - uTime * uSpeed * 0.2));
          float globeMask = smoothstep(0.53, 0.5, radius);
          float grid = (smoothstep(0.94, 1.0, longitude) +
            smoothstep(0.94, 1.0, latitude)) * globeMask;
          vec3 color = uColorA * 0.34 + uColorB * globeMask * (0.28 + radius * 0.25);
          return color + uColorC * grid * 0.62;
        }

        vec3 clickRipple(vec2 p) {
          float t = uTime * uSpeed;
          float radius = length(p);
          float ring = pow(max(0.0, sin(radius * 42.0 - t * 4.0)), 16.0);
          float ring2 = pow(max(0.0, sin(radius * 23.0 - t * 2.2)), 22.0);
          vec3 color = uColorA * 0.32 + uColorB * smoothstep(1.0, 0.0, radius) * 0.2;
          return color + mix(uColorB, uColorC, radius) * (ring * 0.7 + ring2 * 0.35);
        }

        vec3 audioSphere(vec2 p) {
          float t = uTime * uSpeed;
          float radius = length(p);
          float sphere = smoothstep(0.46, 0.42, radius);
          float wave = 0.5 + 0.5 * sin(radius * 55.0 - t * 3.0);
          float bars = pow(max(0.0, sin(atan(p.y, p.x) * 34.0 + t)), 8.0);
          vec3 color = uColorA * 0.38 + uColorB * sphere * (0.35 + wave * 0.25);
          return color + uColorC * bars * smoothstep(0.56, 0.16, radius) * 0.52;
        }

        vec3 explodedView(vec2 p) {
          float t = uTime * uSpeed;
          vec2 grid = floor((vUv - 0.5) * 15.0);
          vec2 f = abs(fract((vUv - 0.5) * 15.0) - 0.5);
          float h = hash21(grid);
          float shape = step(max(f.x, f.y), 0.34) *
            step(0.28, length(f + vec2(sin(t + h * 9.0) * 0.05, 0.0)));
          vec3 color = mix(uColorA * 0.35, uColorB, h * 0.7);
          return color + uColorC * shape * 0.35;
        }

        vec3 bokehDust(vec2 p) {
          vec3 color = uColorA * 0.45;
          for (int i = 0; i < 4; i++) {
            float fi = float(i);
            vec2 center = vec2(
              sin(uTime * uSpeed * (0.05 + fi * 0.01) + fi * 2.3) * 0.85,
              cos(uTime * uSpeed * (0.04 + fi * 0.012) + fi * 1.4) * 0.52
            );
            float disc = smoothstep(0.22 + fi * 0.045, 0.0, length(p - center));
            float rim = smoothstep(0.24 + fi * 0.04, 0.19 + fi * 0.04, length(p - center));
            color += mix(uColorB, uColorC, fi / 3.0) * disc * 0.15;
            color += uColorB * rim * 0.04;
          }
          return color;
        }

        vec3 grainGradient(vec2 p) {
          vec3 color = meshGradient(p);
          float grain = hash21(floor(vUv * uResolution + floor(uTime * 24.0)));
          return color * (0.82 + grain * 0.28);
        }

        vec3 depthPhoto(vec2 p) {
          float t = uTime * uSpeed * 0.04;
          float layers = fbm(p * 1.2 + t) * 0.6 + fbm(p * 3.8 - t) * 0.24;
          float focus = smoothstep(0.75, 0.15, length(p * vec2(1.0, 1.35)));
          vec3 color = mix(uColorA, uColorB, layers);
          return mix(color * 0.55, mix(color, uColorC, 0.22), focus);
        }

        vec3 heatmap(vec2 p) {
          float field = fbm(p * 2.1 + uTime * uSpeed * 0.035);
          float hot = smoothstep(0.5, 0.92, field);
          float cold = smoothstep(0.5, 0.12, field);
          vec3 color = mix(uColorA * 0.55, uColorB, hot);
          color = mix(color, uColorC, cold * 0.4);
          float contour = smoothstep(0.025, 0.0, abs(fract(field * 12.0) - 0.5));
          return color + vec3(contour * 0.13);
        }

        vec3 extrudedText(vec2 p) {
          vec2 grid = (vUv - 0.5) * vec2(10.0, 3.5);
          vec2 id = floor(grid);
          vec2 f = fract(grid) - 0.5;
          float h = hash21(id + 2.0);
          float stem = step(abs(f.x), 0.07 + h * 0.04) * step(abs(f.y), 0.34);
          float bar = step(abs(f.y - 0.18), 0.055) * step(abs(f.x), 0.27);
          vec3 color = mix(uColorA * 0.42, uColorB * 0.62, h);
          return color + uColorC * (stem + bar) * 0.45;
        }

        vec3 shimmer(vec2 p) {
          float t = uTime * uSpeed * 0.08;
          float ribbon =
            sin(vUv.y * 16.0 + fbm(p * 2.0 + t) * 5.0 + t * 2.0) * 0.5 + 0.5;
          float thin = pow(ribbon, 16.0);
          float grain = hash21(floor(vUv * uResolution) + floor(t * 12.0));
          vec3 color = mix(uColorA, uColorB, vUv.y * 0.42 + ribbon * 0.2);
          color += uColorC * thin * 0.22;
          return color * (0.92 + grain * 0.08);
        }

        vec3 textParticles(vec2 p) {
          float t = uTime * uSpeed;
          vec2 grid = floor(vUv * vec2(56.0, 32.0));
          vec2 f = fract(vUv * vec2(56.0, 32.0)) - 0.5;
          float h = hash21(grid);
          float bar = step(abs(f.x), 0.11) * step(abs(f.y), 0.25 + h * 0.22);
          float drift = step(0.42, fract(h + t * (0.02 + h * 0.04)));
          return uColorA * 0.4 + mix(uColorB, uColorC, h) * bar * drift * 0.55;
        }

        vec3 dotWave(vec2 p) {
          float t = uTime * uSpeed;
          float scale = mix(26.0, 62.0, uVariant);
          vec2 grid = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * scale;
          vec2 id = floor(grid);
          vec2 f = fract(grid) - 0.5;
          float h = hash21(id);
          float wave = sin(length(id) * 0.32 - t * 2.1) * 0.5 + 0.5;
          float radius = mix(0.06, 0.3, wave * (0.4 + h * 0.6));
          float dotMask = smoothstep(radius, 0.0, length(f));
          return mix(uColorA * 0.45, mix(uColorB, uColorC, wave), dotMask * 0.75);
        }

        vec3 curvedGallery(vec2 p) {
          float t = uTime * uSpeed * 0.05;
          float columns = sin(vUv.x * 34.0 + sin(vUv.y * 5.0 + t) * 2.0);
          float rim = smoothstep(0.72, 1.0, abs(columns));
          float depth = smoothstep(0.0, 1.0, 1.0 - abs(vUv.x - 0.5) * 2.0);
          vec3 color = mix(uColorA, uColorB, vUv.y * 0.7 + depth * 0.22);
          return color + uColorC * rim * 0.24;
        }

        vec3 silkWaves(vec2 p) {
          float t = uTime * uSpeed * 0.1;
          float warp = fbm(vec2(p.x * 1.4, p.y * 2.2) + t);
          float waves = sin(p.y * 24.0 + p.x * 4.0 + warp * 5.0 + t * 2.0);
          float sheen = smoothstep(0.1, 0.95, waves * 0.5 + 0.5);
          vec3 color = mix(uColorA * 0.48, uColorB, sheen * 0.62);
          color = mix(color, uColorC, pow(sheen, 6.0) * 0.34);
          return color;
        }

        vec3 inkFluid(vec2 p) {
          float t = uTime * uSpeed * 0.06;
          vec2 q = vec2(fbm(p * 1.8 + t), fbm(p * 1.8 - t));
          float ink = fbm(p * 3.0 + q * 2.4);
          float threshold = smoothstep(0.42, 0.66, ink);
          vec3 color = mix(vec3(0.015, 0.02, 0.035), uColorB, threshold);
          return color + uColorC * pow(threshold, 4.0) * 0.24;
        }

        vec3 dissolve(vec2 p) {
          float t = uTime * uSpeed * 0.08;
          vec2 cells = floor(vUv * 55.0);
          float h = hash21(cells);
          float threshold = 0.52 + sin(p.x * 3.0 + p.y * 2.0 + t) * 0.2;
          float flake = step(threshold, h + fbm(p * 2.0 + t) * 0.4);
          vec3 color = mix(uColorA * 0.4, uColorB, fbm(p * 2.3 + t));
          return mix(color, uColorC, flake * 0.72);
        }

        vec3 liquidGlass(vec2 p) {
          float t = uTime * uSpeed * 0.06;
          float blobs = 0.0;
          for (int i = 0; i < 4; i++) {
            float fi = float(i);
            vec2 center = vec2(
              sin(t + fi * 1.7) * 0.58,
              cos(t * 0.8 + fi * 1.9) * 0.42
            );
            float distanceToBlob = length(p - center);
            blobs += smoothstep(0.32 - fi * 0.03, 0.0, distanceToBlob);
          }
          vec3 color = mix(uColorA * 0.35, uColorB * 0.55, min(blobs, 1.0));
          float refraction = smoothstep(0.78, 1.0, min(blobs, 1.0));
          return color + uColorC * refraction * 0.24;
        }

        vec3 vividAurora(vec2 p) {
          float t = uTime * uSpeed * 0.12;
          float warp = fbm(p * 2.0 + t);
          float curtain = 0.0;
          for (int i = 0; i < 5; i++) {
            float fi = float(i);
            float center = -0.42 + fi * 0.2 + sin(p.x * 4.0 + t + fi) * 0.08;
            curtain += smoothstep(0.12, 0.0, abs(p.y - center)) *
              (0.4 + 0.6 * sin(p.x * 35.0 + t * 3.0 + fi));
          }
          return uColorA * 0.35 +
            mix(uColorB, uColorC, vUv.x + warp * 0.2) * curtain * 0.42;
        }

        vec3 chromeLogo(vec2 p) {
          float radius = length(p);
          float rings = sin(radius * 70.0 - uTime * uSpeed * 2.0);
          float rim = smoothstep(0.7, 1.0, abs(rings));
          float glow = smoothstep(0.5, 0.0, radius);
          vec3 color = mix(uColorA, uColorB, glow * 0.5 + rim * 0.3);
          return mix(color, uColorC, rim * glow * 0.42);
        }

        vec3 vividCaustics(vec2 p) {
          float t = uTime * uSpeed * 0.14;
          vec2 q = p * 7.0;
          float web =
            sin(q.x + sin(q.y * 1.7 + t) * 2.0) *
            cos(q.y * 1.3 - sin(q.x * 1.1 - t) * 2.0);
          float hot = pow(max(0.0, 1.0 - abs(web)), 14.0);
          float ripple = pow(max(0.0, sin(length(p) * 38.0 - t * 3.0)), 18.0);
          vec3 color = uColorA * 0.35 + mix(uColorB, uColorC, vUv.y) * hot * 0.62;
          return color + uColorC * ripple * 0.24;
        }

        vec3 iridescentBlob(vec2 p) {
          float t = uTime * uSpeed * 0.07;
          vec2 warp = vec2(fbm(p * 1.8 + t), fbm(p * 1.8 - t));
          float blob = smoothstep(0.52, 0.18, length(p + warp * 0.22));
          float rim = smoothstep(0.44, 0.3, length(p + warp * 0.22)) * blob;
          vec3 color = mix(uColorA * 0.36, uColorB, blob * 0.72);
          return color + uColorC * rim * 0.34;
        }

        vec3 holoCard(vec2 p) {
          float t = uTime * uSpeed * 0.08;
          vec2 card = abs(p) - vec2(0.54, 0.34);
          float outside = max(card.x, card.y);
          float mask = smoothstep(0.012, 0.0, outside);
          float sheen =
            sin((p.x * 1.4 + p.y * 0.8) * 18.0 + fbm(p * 2.0 + t) * 5.0);
          vec3 color = mix(uColorA * 0.38, uColorB, mask * 0.52);
          return color + uColorC * mask * smoothstep(0.1, 1.0, sheen) * 0.4;
        }

        vec3 liquidChrome(vec2 p) {
          float t = uTime * uSpeed * 0.05;
          vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t));
          float bands = sin(p.x * 13.0 + p.y * 8.0 + q.x * 7.0 + t * 2.0);
          float spec = pow(max(0.0, bands), 10.0);
          vec3 color = mix(uColorA, uColorB, 0.48 + q.y * 0.35);
          return mix(color, uColorC, spec * 0.46);
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
          else if (mode == 9.0) color = glowOrbs(p);
          else if (mode == 10.0) color = caustics(p);
          else if (mode == 11.0) color = rainGlass(p);
          else if (mode == 12.0) color = flutedGlass(p);
          else if (mode == 13.0) color = holoFoil(p);
          else if (mode == 14.0) color = liquidMetal(p);
          else if (mode == 15.0) color = halftone(p);
          else if (mode == 16.0) color = pixelGrid(p);
          else if (mode == 17.0) color = asciiPlasma(p);
          else if (mode == 18.0) color = topoLines(p);
          else if (mode == 19.0) color = glitch(p);
          else if (mode == 20.0) color = lightRays(p);
          else if (mode == 21.0) color = dataGlobe(p);
          else if (mode == 22.0) color = clickRipple(p);
          else if (mode == 23.0) color = audioSphere(p);
          else if (mode == 24.0) color = explodedView(p);
          else if (mode == 25.0) color = bokehDust(p);
          else if (mode == 26.0) color = grainGradient(p);
          else if (mode == 27.0) color = depthPhoto(p);
          else if (mode == 28.0) color = heatmap(p);
          else if (mode == 29.0) color = extrudedText(p);
          else if (mode == 30.0) color = shimmer(p);
          else if (mode == 31.0) color = textParticles(p);
          else if (mode == 32.0) color = dotWave(p);
          else if (mode == 33.0) color = curvedGallery(p);
          else if (mode == 34.0) color = silkWaves(p);
          else if (mode == 35.0) color = inkFluid(p);
          else if (mode == 36.0) color = dissolve(p);
          else if (mode == 37.0) color = liquidGlass(p);
          else if (mode == 38.0) color = vividAurora(p);
          else if (mode == 39.0) color = chromeLogo(p);
          else if (mode == 40.0) color = vividCaustics(p);
          else if (mode == 41.0) color = iridescentBlob(p);
          else if (mode == 42.0) color = holoCard(p);
          else if (mode == 43.0) color = liquidChrome(p);
          float globalDrift =
            0.5 + 0.5 * sin(uTime * uSpeed * 0.35 + p.x * 1.7 - p.y * 1.2);
          float driftTexture = fbm(p * 1.4 + uTime * uSpeed * 0.045);
          color += mix(uColorB, uColorC, globalDrift) *
            (0.008 + driftTexture * 0.018);
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
