const path = require("node:path");
const { test, expect } = require("@playwright/test");

const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}`;

async function openFreshDesktop(page) {
  await page.goto(desktopUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("body");
}

test("first visit shows the premium login gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await expect(gate).toBeVisible();
  await expect(gate.getByRole("heading", { name: "欢迎回来" })).toBeVisible();
  await expect(
    gate.getByRole("button", { name: "使用 Google 继续" }),
  ).toBeVisible();
  await expect(gate.getByLabel("邮箱地址")).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).toHaveAttribute("inert", "");
});

test("google connection animates into the desktop workspace", async ({
  page,
}) => {
  await openFreshDesktop(page);

  await page.getByRole("button", { name: "使用 Google 继续" }).click();
  await expect(page.locator(".login-google-button")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.getByText("正在安全连接 Google")).toBeVisible();
  await expect(page.locator("#login-gate")).toBeHidden({ timeout: 6000 });
  await expect(page.locator("body")).not.toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).not.toHaveAttribute("inert", "");
});

test("email validation and password mode switching work", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate.getByRole("button", { name: "使用邮箱继续" }).click();
  await gate.getByLabel("邮箱地址").fill("not-an-email");
  await gate.getByRole("button", { name: "登录", exact: true }).click();
  await expect(gate.getByRole("alert")).toContainText("请输入有效的邮箱地址");

  await gate.getByLabel("邮箱地址").fill("hello@qianbian.ai");
  await gate.getByRole("tab", { name: "验证码登录" }).click();
  await expect(gate.getByLabel("验证码", { exact: true })).toBeVisible();
  await gate.getByRole("tab", { name: "密码登录" }).click();
  await expect(gate.getByLabel("密码", { exact: true })).toBeVisible();
  await expect(gate.getByRole("button", { name: "显示密码" })).toBeVisible();
});

test("successful email login and logout reopen the gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate.getByLabel("邮箱地址").fill("hello@qianbian.ai");
  await gate.getByLabel("密码", { exact: true }).fill("qianbian-demo");
  await gate.getByRole("button", { name: "登录", exact: true }).click();
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
  await expect(gate.getByLabel("邮箱地址")).toBeVisible();
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

test("three.js login scene renders on desktop and mobile", async ({ page }) => {
  await openFreshDesktop(page);

  const canvas = page.locator("#login-three-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-scene-ready", "true");
  await expect(canvas).toHaveAttribute("data-scene-style", "gravity-planet");
  await expect(page.locator("#login-gate")).toHaveClass(/login-three-active/);
  const desktopBox = await canvas.boundingBox();
  expect(desktopBox.width).toBeGreaterThan(180);
  expect(desktopBox.height).toBeGreaterThan(180);

  const stats = await page.evaluate(() => window.__qianbianLoginScene?.stats());
  expect(stats?.renderCalls).toBeGreaterThan(0);
  expect(stats?.objectCount).toBeGreaterThan(2);
  const pixels = await page.evaluate(() =>
    window.__qianbianLoginScene?.samplePixels(),
  );
  expect(pixels?.painted).toBeGreaterThan(100);
  expect(pixels?.maxChannel).toBeGreaterThan(40);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  const mobileBox = await canvas.boundingBox();
  expect(mobileBox.width).toBeGreaterThan(90);
  expect(mobileBox.height).toBeGreaterThan(90);
  const mobilePixels = await page.evaluate(() =>
    window.__qianbianLoginScene?.samplePixels(),
  );
  expect(mobilePixels?.painted).toBeGreaterThan(20);
});

test("starfield covers the viewport behind a floating login layer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFreshDesktop(page);

  const layout = await page.evaluate(() => {
    const canvas = document
      .querySelector("#login-three-canvas")
      .getBoundingClientRect();
    const panel = document
      .querySelector(".login-panel")
      .getBoundingClientRect();
    const panelStyle = getComputedStyle(
      document.querySelector(".login-panel"),
    );
    const canvasStyle = getComputedStyle(
      document.querySelector("#login-three-canvas"),
    );
    return {
      viewport: [window.innerWidth, window.innerHeight],
      canvas: [canvas.left, canvas.top, canvas.width, canvas.height],
      panel: [panel.left, panel.top, panel.width, panel.height],
      panelZ: Number(panelStyle.zIndex),
      canvasZ: Number(canvasStyle.zIndex),
      wordmarkCount: document.querySelectorAll(".login-wordmark").length,
    };
  });

  expect(layout.canvas).toEqual([
    0,
    0,
    layout.viewport[0],
    layout.viewport[1],
  ]);
  expect(layout.panel[0]).toBeGreaterThan(layout.viewport[0] * 0.5);
  expect(layout.panel[2]).toBeLessThan(layout.viewport[0] * 0.45);
  expect(layout.panelZ).toBeGreaterThan(layout.canvasZ);
  expect(layout.wordmarkCount).toBe(0);
});
