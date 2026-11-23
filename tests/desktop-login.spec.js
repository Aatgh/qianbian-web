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

test("login keeps only the fixed default starfield theme", async ({
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
  await expect(page.locator("#login-theme-toggle")).toHaveCount(0);
  await expect(page.locator("#login-tuning-toggle")).toHaveCount(0);
  await expect(page.locator("#login-theme-panel")).toHaveCount(0);
  await expect(page.locator("#login-tuning-panel")).toHaveCount(0);
  await expect(page.locator("#login-box-toggle")).toHaveCount(0);
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

  const themeState = await page.evaluate(() => {
    const api = window.QianbianLoginBackground;
    return {
      themes: api.themes.map((theme) => ({
        id: theme.id,
        colors: theme.colors.map((color) => color.toLowerCase()),
      })),
      groups: window.QianbianLoginThemes?.length || 0,
      current: api.current,
      acceptedLegacyTheme: api.setTheme("holo-foil"),
      afterLegacyTheme: api.current,
    };
  });
  expect(themeState.themes).toEqual([
    {
      id: "starfield",
      colors: ["#9db4ff", "#e8efff", "#ffffff", "#ffd9a8"],
    },
  ]);
  expect(themeState.groups).toBe(1);
  expect(themeState.current).toBe("starfield");
  expect(themeState.acceptedLegacyTheme).toBe(false);
  expect(themeState.afterLegacyTheme).toBe("starfield");

  await page.evaluate(() =>
    localStorage.setItem("qianbian-login-background-theme", "holo-foil"),
  );
  await page.reload();
  await expect(page.locator("#login-three-canvas")).toHaveAttribute(
    "data-theme",
    "starfield",
  );
  await expect(page.locator(".login-panel-wrap")).toBeVisible();

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

test("default starfield animates as a single theme", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 270 });
  await openFreshDesktop(page, { starfieldPreview: true });
  await expect(page.locator("#login-three-canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
  );

  const frameBefore = await page.evaluate(
    () => window.__qianbianLoginScene.stats().frame,
  );
  await page.waitForTimeout(250);
  const frameAfter = await page.evaluate(
    () => window.__qianbianLoginScene.stats().frame,
  );
  expect(frameAfter).toBeGreaterThan(frameBefore);

  const result = await page.evaluate(() => {
    const api = window.QianbianLoginBackground;
    const scene = window.__qianbianLoginScene;
    const signatures = [];
    api.themes.forEach((theme) => {
      api.setTheme(theme.id);
      signatures.push(scene.signature());
    });
    return {
      total: signatures.length,
      unique: new Set(signatures).size,
      pixels: scene.samplePixels(),
    };
  });

  expect(result.total).toBe(1);
  expect(result.unique).toBe(1);
  expect(result.pixels.maxChannel).toBeGreaterThan(24);
});

test("direct long press keeps dragging after slight pointer movement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openFreshDesktop(page, { starfieldPreview: true });
  await page.locator("#login-gate.is-ready").waitFor();
  await page
    .locator(".login-panel-wrap")
    .evaluate((element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished)),
    );

  const wrap = page.locator("#login-panel-wrap");
  const handleBox = await page
    .locator(".login-panel-drag-handle")
    .boundingBox();
  const startX = handleBox.x + handleBox.width / 2;
  const startY = handleBox.y + 12;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.move(startX + 24, startY + 4, { steps: 3 });
  await page.waitForTimeout(260);

  await expect(wrap).toHaveClass(/is-dragging/);
  await page.mouse.move(startX + 240, startY + 140, { steps: 5 });
  const offset = await wrap.evaluate((element) => ({
    x: element.style.getPropertyValue("--login-drag-x"),
    y: element.style.getPropertyValue("--login-drag-y"),
  }));
  expect(Number.parseFloat(offset.x)).toBeGreaterThan(160);
  expect(Number.parseFloat(offset.y)).toBeGreaterThan(80);
  await page.mouse.up();
});
