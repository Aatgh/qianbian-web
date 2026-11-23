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

test("configured starfield fills the preview viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openFreshDesktop(page, { starfieldPreview: true });

  const layout = await page.evaluate(() => {
    const host = document.querySelector('[data-aifx="starfield"]');
    const hostRect = host.getBoundingClientRect();
    const hostStyle = getComputedStyle(host);
    return {
      viewport: [window.innerWidth, window.innerHeight],
      host: [
        hostRect.left,
        hostRect.top,
        hostRect.width,
        hostRect.height,
      ],
      pointerEvents: hostStyle.pointerEvents,
      hostZ: Number(hostStyle.zIndex),
      layoutDisplay: getComputedStyle(
        document.querySelector(".login-layout"),
      ).display,
      wordmarkCount: document.querySelectorAll(".login-wordmark").length,
      attributes: Object.fromEntries(
        [...host.attributes]
          .filter(
            (attribute) =>
              attribute.name === "data-aifx" ||
              attribute.name.startsWith("data-aifx-"),
          )
          .map((attribute) => [attribute.name, attribute.value]),
      ),
      runtimeLoaded: Boolean(
        document.querySelector(
          'script[src*="cdn.aidesigner.ai/effects/runtime/v1.js"]',
        ),
      ),
    };
  });

  expect(layout.host).toEqual([
    0,
    0,
    layout.viewport[0],
    layout.viewport[1],
  ]);
  expect(layout.pointerEvents).toBe("none");
  expect(layout.hostZ).toBe(0);
  expect(layout.layoutDisplay).toBe("none");
  expect(layout.wordmarkCount).toBe(0);
  expect(layout.runtimeLoaded).toBe(true);
  expect(layout.attributes).toEqual({
    "data-aifx": "starfield",
    "data-aifx-speed": "1.67",
    "data-aifx-density": "0.1",
    "data-aifx-size": "0.33",
    "data-aifx-depth": "2",
    "data-aifx-twinkle": "0.61",
    "data-aifx-shooting": "0.6",
    "data-aifx-angle": "170",
    "data-aifx-mouse": "0.57",
  });
});
