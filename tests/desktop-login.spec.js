const path = require("node:path");
const { test, expect } = require("@playwright/test");

const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}`;

async function openFreshDesktop(page, { starfieldPreview = false } = {}) {
  await page.goto(desktopUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("body");
  if (!starfieldPreview) {
    await page.evaluate(() =>
      document
        .getElementById("login-gate")
        ?.classList.remove("login-starfield-preview"),
    );
  }
}

test("first visit shows the premium login gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await expect(gate).toBeVisible();
  await expect(gate.getByRole("heading", { name: "登录框" })).toBeVisible();
  await expect(gate.getByLabel("手机号", { exact: true })).toBeVisible();
  await expect(
    gate.getByRole("tab", { name: "手机号" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    gate.getByRole("button", { name: "登录 / 注册", exact: true }),
  ).toBeVisible();
  await expect(gate.locator(".login-google-button")).toHaveCount(0);
  await expect(page.locator("body")).toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).toHaveAttribute("inert", "");
});

test("phone code login enters the desktop workspace", async ({ page }) => {
  await openFreshDesktop(page);

  await page.getByLabel("手机号", { exact: true }).fill("13800000000");
  await page.getByRole("button", { name: "获取验证码" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "验证码已发送到手机号 13800000000",
  );
  await page.getByLabel("验证码", { exact: true }).fill("123456");
  await page
    .getByRole("button", { name: "登录 / 注册", exact: true })
    .click();
  await expect(page.locator("#login-gate")).toBeHidden({ timeout: 6000 });
  await expect(page.locator("body")).not.toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).not.toHaveAttribute("inert", "");
});

test("email account switching validates the email and code", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate.getByRole("tab", { name: "邮箱" }).click();
  await gate.getByLabel("邮箱", { exact: true }).fill("not-an-email");
  await gate.getByRole("button", { name: "登录 / 注册", exact: true }).click();
  await expect(gate.getByRole("alert")).toContainText("请输入有效的邮箱地址");

  await gate.getByLabel("邮箱", { exact: true }).fill("hello@qianbian.ai");
  await expect(gate.getByLabel("验证码", { exact: true })).toBeVisible();
  await gate.getByRole("button", { name: "获取验证码" }).click();
  await expect(gate.getByRole("alert")).toContainText(
    "验证码已发送到邮箱 hello@qianbian.ai",
  );
});

test("successful email login and logout reopen the gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate.getByRole("tab", { name: "邮箱" }).click();
  await gate.getByLabel("邮箱", { exact: true }).fill("hello@qianbian.ai");
  await gate.getByLabel("验证码", { exact: true }).fill("123456");
  await gate.getByRole("button", { name: "登录 / 注册", exact: true }).click();
  await expect(gate).toBeHidden({ timeout: 6000 });

  await page.reload();
  await expect(page.locator("#login-gate")).toBeHidden();
  await expect(page.locator("#app-shell")).toBeVisible();

  await page.locator("#account-menu-button").click();
  await page.locator("[data-account-logout]").click();
  await expect(gate).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/login-locked/);
});

test("login gate remains usable on a narrow desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await expect(gate).toBeVisible();
  await expect(gate.getByLabel("手机号", { exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - window.innerWidth,
    vertical: document.documentElement.scrollHeight - window.innerHeight,
  }));
  expect(overflow.horizontal).toBeLessThanOrEqual(1);
  expect(overflow.vertical).toBeLessThanOrEqual(1);
});

test("login gate fills wide desktop viewports", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openFreshDesktop(page);

  const coverage = await page.evaluate(() => {
    const gate = document.querySelector("#login-gate").getBoundingClientRect();
    const layout = document
      .querySelector(".login-layout")
      .getBoundingClientRect();
    const panel = document
      .querySelector(".login-panel")
      .getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      gate: [gate.left, gate.top, gate.width, gate.height],
      layoutWidth: layout.width,
      panelTop: panel.top,
      panelBottom: panel.bottom,
    };
  });

  expect(coverage.gate).toEqual([
    0,
    0,
    coverage.viewportWidth,
    coverage.viewportHeight,
  ]);
  expect(coverage.layoutWidth).toBeGreaterThanOrEqual(
    coverage.viewportWidth - 2,
  );
  expect(coverage.panelTop).toBeGreaterThanOrEqual(0);
  expect(coverage.panelBottom).toBeLessThanOrEqual(coverage.viewportHeight);
});

test("login gate stays inside a short desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 600 });
  await openFreshDesktop(page);

  const metrics = await page.evaluate(() => {
    const panel = document
      .querySelector(".login-panel")
      .getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      panelTop: panel.top,
      panelBottom: panel.bottom,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  expect(metrics.panelTop).toBeGreaterThanOrEqual(0);
  expect(metrics.panelBottom).toBeLessThanOrEqual(metrics.viewportHeight);
  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.viewportHeight);
});

test("login preview exposes all local themes and a floating login toggle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openFreshDesktop(page, { starfieldPreview: true });

  const canvas = page.locator("#login-three-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-scene-ready", "true");
  const canvasBox = await canvas.boundingBox();
  expect([
    canvasBox.x,
    canvasBox.y,
    canvasBox.width,
    canvasBox.height,
  ]).toEqual([
    0,
    0,
    1920,
    1080,
  ]);

  await expect(page.locator(".login-visual")).toBeHidden();
  await expect(page.locator(".login-panel-wrap")).toBeVisible();
  await expect(page.locator("#login-theme-toggle")).toBeVisible();
  await expect(page.locator("#login-tuning-toggle")).toBeVisible();
  await expect(page.locator("#login-box-toggle")).toHaveCount(0);
  expect(
    (await page.locator("#login-theme-toggle").textContent()).trim(),
  ).toBe("");
  expect(
    (await page.locator("#login-tuning-toggle").textContent()).trim(),
  ).toBe("");
  await expect(page.locator(".login-panel-kicker")).toHaveCount(0);
  await expect(
    page.locator('script[src*="cdn.aidesigner.ai/effects/runtime"]'),
  ).toHaveCount(0);
  await expect(page.locator("[data-aifx]")).toHaveCount(0);
  const initialPanelBox = await page.locator(".login-panel").boundingBox();
  expect(initialPanelBox.width).toBeGreaterThanOrEqual(500);
  expect(
    Math.abs(initialPanelBox.x + initialPanelBox.width / 2 - 1920 / 2),
  ).toBeLessThan(5);
  await page.locator("#login-gate").click({ position: { x: 500, y: 820 } });
  await expect(page.locator(".login-panel-wrap")).toBeVisible();

  await page.locator("#login-theme-toggle").click();
  await expect(page.locator("#login-theme-panel")).toBeVisible();
  await expect(page.locator(".login-theme-option")).toHaveCount(44);
  await expect(page.locator(".login-theme-group-title")).toHaveCount(7);
  await expect(page.locator(".login-theme-group-title").first()).toHaveText(
    "星场",
  );
  const defaultPalettes = await page.evaluate(() =>
    window.QianbianLoginBackground.themes.map((theme) =>
      theme.colors.map((color) => color.toLowerCase()),
    ),
  );
  expect(
    defaultPalettes.every(
      (palette) =>
        JSON.stringify(palette) ===
        JSON.stringify(["#09040a", "#a62466", "#f6e9ff"]),
    ),
  ).toBe(true);
  await page.locator("#login-gate").click({ position: { x: 1500, y: 820 } });
  await expect(page.locator("#login-theme-panel")).toBeHidden();
  await page.locator("#login-theme-toggle").click();

  await page.locator('[data-login-theme="aurora-flow"]').click();
  await expect(canvas).toHaveAttribute("data-theme", "aurora-flow");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("qianbian-login-background-theme"),
    ),
  ).toBe("aurora-flow");
  await page.reload();
  await expect(page.locator("#login-three-canvas")).toHaveAttribute(
    "data-theme",
    "aurora-flow",
  );
  await expect(page.locator(".login-panel-wrap")).toBeVisible();

  await page.locator("#login-tuning-toggle").click();
  await expect(page.locator("#login-tuning-panel")).toBeVisible();
  await expect(page.locator("#login-tuning-controls input")).toHaveCount(9);
  await page.locator("#login-tuning-controls input[type='range']").first().fill("1.4");
  await page.locator("#login-tuning-controls input[type='color']").first().fill("#112233");
  const tuning = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("qianbian-login-background-tuning-v2") || "{}",
    ),
  );
  expect(tuning["aurora-flow"].speed).toBe(1.4);
  expect(tuning["aurora-flow"].colors[0]).toBe("#112233");
  await page.locator("#login-tuning-reset").click();
  await page.locator("#login-gate").click({ position: { x: 1500, y: 820 } });
  await expect(page.locator("#login-tuning-panel")).toBeHidden();

  const dragHandleBox = await page
    .locator(".login-panel-drag-handle")
    .boundingBox();
  await page.mouse.move(
    dragHandleBox.x + dragHandleBox.width / 2,
    dragHandleBox.y + dragHandleBox.height / 2,
  );
  await page.mouse.down();
  await page.waitForTimeout(260);
  await page.mouse.move(
    dragHandleBox.x + dragHandleBox.width / 2 + 260,
    dragHandleBox.y + dragHandleBox.height / 2 + 140,
    { steps: 5 },
  );
  const draggedBox = await page.locator(".login-panel").boundingBox();
  expect(
    Math.abs(draggedBox.x + draggedBox.width / 2 - 1920 / 2),
  ).toBeGreaterThan(120);
  await page.mouse.up();
  await page.waitForTimeout(700);
  const snappedBox = await page.locator(".login-panel").boundingBox();
  expect(snappedBox.width).toBeGreaterThanOrEqual(500);
  expect(
    Math.abs(snappedBox.x + snappedBox.width / 2 - 1920 / 2),
  ).toBeLessThan(3);
  expect(
    Math.abs(
      snappedBox.y +
        snappedBox.height / 2 -
        (initialPanelBox.y + initialPanelBox.height / 2),
    ),
  ).toBeLessThan(5);
});

test("theme structures differ beyond color", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 270 });
  await openFreshDesktop(page, { starfieldPreview: true });
  await expect(page.locator("#login-three-canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
  );

  const result = await page.evaluate(() => {
    const api = window.QianbianLoginBackground;
    const scene = window.__qianbianLoginScene;
    const signatures = [];
    let moving = 0;
    api.themes.forEach((theme) => {
      api.setTheme(theme.id);
      api.tune({
        colors: ["#111111", "#888888", "#eeeeee"],
      });
      const signature = scene.signature();
      const start = scene.signatureAt(1000);
      const later = scene.signatureAt(9000);
      signatures.push(signature);
      if (start !== later) moving += 1;
    });
    return {
      total: signatures.length,
      unique: new Set(signatures).size,
      moving,
    };
  });

  expect(result.total).toBe(44);
  expect(result.unique).toBe(44);
  expect(result.moving).toBe(44);
});
