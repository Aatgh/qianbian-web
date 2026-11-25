(function () {
  "use strict";

  const canvas = document.getElementById("login-galaxy-canvas");
  const panel = canvas?.closest(".login-panel");
  if (!canvas || !panel) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const PARTICLE_COUNT = 210;
  const MIN_ZOOM = 0.68;
  const MAX_ZOOM = 2.35;
  const COLORS = [
    [181, 198, 255],
    [225, 206, 255],
    [255, 217, 235],
    [255, 240, 218],
    [137, 167, 255],
  ];

  let width = 1;
  let height = 1;
  let dpr = 1;
  let frame = 0;
  let animationFrame = 0;
  let lastTime = performance.now();
  let rotation = 0;
  let zoom = 1;
  let targetZoom = 1;
  let seed = 0x7f4a7c15;
  let particles = [];
  const sprites = new Map();

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  }

  function makeSprite(rgb) {
    const key = rgb.join(",");
    if (sprites.has(key)) return sprites.get(key);
    const sprite = document.createElement("canvas");
    sprite.width = 64;
    sprite.height = 64;
    const spriteContext = sprite.getContext("2d");
    const gradient = spriteContext.createRadialGradient(
      32,
      32,
      0,
      32,
      32,
      32,
    );
    gradient.addColorStop(
      0,
      `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`,
    );
    gradient.addColorStop(
      0.14,
      `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.78)`,
    );
    gradient.addColorStop(
      0.38,
      `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`,
    );
    gradient.addColorStop(
      0.7,
      `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.06)`,
    );
    gradient.addColorStop(
      1,
      `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`,
    );
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, 64, 64);
    sprites.set(key, sprite);
    return sprite;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const core = index < 28;
      const arm = index % 2;
      const distance = core
        ? Math.pow(random(), 2.4) * 0.18
        : 0.1 + Math.pow(random(), 0.72) * 0.9;
      const armAngle = arm * Math.PI;
      const angle = core
        ? random() * Math.PI * 2
        : armAngle +
          distance * 5.8 +
          (random() - 0.5) * (0.22 + distance * 0.36);
      return {
        angle,
        distance,
        drift: (random() - 0.5) * 0.08,
        size: core ? 1.5 + random() * 3.2 : 0.7 + random() * 3.4,
        alpha: core ? 0.42 + random() * 0.5 : 0.16 + random() * 0.62,
        phase: random() * Math.PI * 2,
        speed: 0.3 + random() * 0.9,
        color: COLORS[Math.floor(random() * COLORS.length)],
        vertical: core ? 0.8 : 0.34 + random() * 0.18,
      };
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawDust() {
    const centerX = width * 0.55;
    const centerY = height * 0.48;
    const radius = Math.min(width, height) * 0.7 * zoom;
    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius,
    );
    gradient.addColorStop(0, "rgba(154, 173, 255, 0.11)");
    gradient.addColorStop(0.23, "rgba(126, 115, 220, 0.07)");
    gradient.addColorStop(0.56, "rgba(88, 79, 150, 0.025)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.save();
    context.globalCompositeOperation = "screen";
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  function render(time) {
    const delta = Math.min(48, time - lastTime);
    lastTime = time;
    frame += 1;
    zoom += (targetZoom - zoom) * 0.13;
    if (!reducedMotion.matches) {
      rotation += delta * 0.000024;
    }

    context.clearRect(0, 0, width, height);
    drawDust();
    const centerX = width * 0.55;
    const centerY = height * 0.48;
    const radius = Math.min(width, height) * 0.46 * zoom;

    context.save();
    context.globalCompositeOperation = "lighter";
    particles.forEach((particle) => {
      const pulse =
        0.76 +
        Math.sin(time * 0.0011 * particle.speed + particle.phase) * 0.24;
      const angle =
        particle.angle + rotation + particle.distance * particle.drift;
      const distance = particle.distance * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y =
        centerY +
        Math.sin(angle) * distance * particle.vertical;
      const size = particle.size * (1.2 + zoom * 0.48) * (0.86 + pulse * 0.22);
      context.globalAlpha = Math.min(1, particle.alpha * pulse);
      context.drawImage(
        makeSprite(particle.color),
        x - size,
        y - size,
        size * 2,
        size * 2,
      );
    });
    context.restore();
    animationFrame = window.requestAnimationFrame(render);
  }

  function clampZoom(value) {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
  }

  function setZoom(value) {
    targetZoom = clampZoom(Number(value) || 1);
    canvas.dataset.zoom = targetZoom.toFixed(3);
  }

  function zoomBy(delta) {
    setZoom(targetZoom * Math.exp(Number(delta) || 0));
  }

  function reset() {
    setZoom(1);
  }

  function stats() {
    return {
      particleCount: particles.length,
      frame,
      zoom,
      targetZoom,
      width,
      height,
    };
  }

  panel.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomBy(-event.deltaY * 0.0016);
    },
    { passive: false },
  );

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  createParticles();
  resize();
  setZoom(1);
  animationFrame = window.requestAnimationFrame(render);

  window.QianbianLoginGalaxy = Object.freeze({
    get zoom() {
      return targetZoom;
    },
    reset,
    stats,
    zoomBy,
  });

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
  });
})();
