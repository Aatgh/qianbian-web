const path = require("node:path");
const { test, expect } = require("@playwright/test");

const logo3dUrl = `file:///${path
  .resolve(__dirname, "..", "logo-3d", "index.html")
  .replaceAll("\\", "/")}`;

test("logo 3D demo renders an interactive extruded model", async ({ page }) => {
  const issues = [];
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(message.text());
  });
  page.on("pageerror", (error) => issues.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(logo3dUrl);
  await page.locator('[data-artifact-ready="true"]').waitFor();

  const canvas = page.locator("#logo-3d-canvas");
  await expect(canvas).toBeVisible();
  const initial = await page.evaluate(() => {
    const model = window.__qianbianLogo3D;
    return {
      meshCount: model.meshCount,
      shapeCount: model.shapeCount,
      rotation: model.rotation(),
      pixels: model.samplePixels(),
      autoRotate: model.autoRotate,
    };
  });
  expect(initial.meshCount).toBeGreaterThanOrEqual(2);
  expect(initial.shapeCount).toBe(2);
  expect(initial.pixels.maxChannel).toBeGreaterThan(40);
  expect(initial.autoRotate).toBe(true);
  await expect(page.locator("#toggle-rotation")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator("#toggle-rotation").click();
  await expect(page.locator("#toggle-rotation")).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 230,
    box.y + box.height / 2 + 80,
    { steps: 8 },
  );
  await page.mouse.up();
  const rotationAfterDrag = await page.evaluate(() =>
    window.__qianbianLogo3D.rotation(),
  );
  expect(
    Math.abs(rotationAfterDrag.y - initial.rotation.y),
  ).toBeGreaterThan(0.15);
  expect(issues).toEqual([]);
});

test("logo 3D demo remains framed on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto(logo3dUrl);
  await page.locator('[data-artifact-ready="true"]').waitFor();

  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector("#logo-3d-canvas");
    const controls = document.querySelector(".logo-3d-controls");
    const canvasBox = canvas.getBoundingClientRect();
    const controlsBox = controls.getBoundingClientRect();
    return {
      canvas: canvasBox.toJSON(),
      controls: controlsBox.toJSON(),
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      modelBounds: window.__qianbianLogo3D.screenBounds(),
      pixels: window.__qianbianLogo3D.samplePixels(),
    };
  });

  expect(metrics.canvas.width).toBe(metrics.viewport.width);
  expect(metrics.canvas.height).toBe(metrics.viewport.height);
  expect(metrics.controls.left).toBeGreaterThanOrEqual(0);
  expect(metrics.controls.right).toBeLessThanOrEqual(metrics.viewport.width);
  expect(metrics.controls.bottom).toBeLessThanOrEqual(metrics.viewport.height);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport.width);
  expect(metrics.modelBounds.left).toBeGreaterThanOrEqual(0);
  expect(metrics.modelBounds.right).toBeLessThanOrEqual(metrics.viewport.width);
  expect(metrics.modelBounds.top).toBeGreaterThanOrEqual(0);
  expect(metrics.modelBounds.bottom).toBeLessThanOrEqual(metrics.viewport.height);
  expect(metrics.pixels.maxChannel).toBeGreaterThan(100);
});
