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
  await expect(gate.getByRole("heading", { name: "登录千变" })).toBeVisible();
  await expect(gate.locator("#login-description")).toHaveCount(0);
  await expect(gate.locator(".login-legal")).toHaveCount(0);
  const account = gate.getByLabel("账号/邮箱/手机号", { exact: true });
  const password = gate.getByLabel("密码", { exact: true });
  await expect(account).toBeVisible();
  await expect(account).toHaveAttribute("placeholder", "账号/邮箱/手机号");
  await expect(password).toBeVisible();
  await expect(password).toHaveAttribute("placeholder", "密码");
  await expect(
    gate.getByRole("button", { name: "验证码登录", exact: true }),
  ).toHaveClass(/login-mode-switch/);
  await expect(gate.getByLabel("验证码", { exact: true })).toBeHidden();
  const submit = gate.getByRole("button", { name: "登录", exact: true });
  await expect(submit).toBeVisible();
  await expect(submit.locator(".login-submit-label")).toHaveCount(0);
  await expect(submit.locator("svg")).toHaveCount(1);
  const submitLayout = await submit.evaluate((button) => {
    const style = getComputedStyle(button);
    const panel = document.querySelector(".login-panel");
    return {
      text: button.textContent.trim(),
      width: button.getBoundingClientRect().width,
      height: button.getBoundingClientRect().height,
      panelWidth: panel.getBoundingClientRect().width,
      radius: Number.parseFloat(style.borderRadius),
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
    };
  });
  expect(submitLayout.text).toBe("");
  expect(submitLayout.width).toBeLessThan(submitLayout.panelWidth * 0.4);
  expect(submitLayout.radius).toBeGreaterThanOrEqual(
    submitLayout.height / 2,
  );
  expect(submitLayout.marginLeft).toBe(submitLayout.marginRight);
  const headAlignment = await gate
    .locator(".login-panel-head")
    .evaluate((element) => getComputedStyle(element).textAlign);
  expect(headAlignment).toBe("center");
  await expect(gate.locator(".login-google-button")).toHaveCount(0);
  await expect(page.locator("body")).toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).toHaveAttribute("inert", "");
  const radius = await page
    .locator(".login-panel")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).borderRadius));
  expect(radius).toBeGreaterThanOrEqual(48);
});

test("phone code login enters the desktop workspace", async ({ page }) => {
  await openFreshDesktop(page);

  await page
    .getByLabel("账号/邮箱/手机号", { exact: true })
    .fill("13800000000");
  await page.getByRole("button", { name: "验证码登录", exact: true }).click();
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

test("phone password login can reveal the password and enter the workspace", async ({
  page,
}) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await expect(gate.getByLabel("验证码", { exact: true })).toBeHidden();

  await gate
    .getByLabel("账号/邮箱/手机号", { exact: true })
    .fill("13800000000");
  const password = gate.getByLabel("密码", { exact: true });
  await expect(password).toBeVisible();
  await password.fill("qianbian123");
  await gate.getByRole("button", { name: "显示密码" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await gate.getByRole("button", { name: "隐藏密码" }).click();
  await expect(password).toHaveAttribute("type", "password");

  await page.evaluate(() => {
    window.__lastDesktopAuthMethod = null;
    window.addEventListener(
      "qianbian:auth-success",
      (event) => {
        window.__lastDesktopAuthMethod = event.detail.method;
      },
      { once: true },
    );
  });
  await gate.getByRole("button", { name: "登录", exact: true }).click();
  await expect(gate).toBeHidden({ timeout: 6000 });
  await expect
    .poll(() => page.evaluate(() => window.__lastDesktopAuthMethod))
    .toBe("phone-password");
});

test("email account switching validates the email and code", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  const account = gate.getByLabel("账号/邮箱/手机号", { exact: true });
  await account.fill("not-an-email@");
  await gate.getByRole("button", { name: "登录", exact: true }).click();
  await expect(gate.getByRole("alert")).toContainText("请输入有效的邮箱地址");

  await account.fill("hello@qianbian.ai");
  await gate.getByRole("button", { name: "验证码登录", exact: true }).click();
  await expect(gate.getByLabel("验证码", { exact: true })).toBeVisible();
  await gate.getByRole("button", { name: "获取验证码" }).click();
  await expect(gate.getByRole("alert")).toContainText(
    "验证码已发送到邮箱 hello@qianbian.ai",
  );
});

test("successful email login and logout reopen the gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate
    .getByLabel("账号/邮箱/手机号", { exact: true })
    .fill("hello@qianbian.ai");
  await gate.getByRole("button", { name: "验证码登录", exact: true }).click();
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
  await expect(
    gate.getByLabel("账号/邮箱/手机号", { exact: true }),
  ).toBeVisible();
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

test("login panel contains a zoomable particle galaxy", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openFreshDesktop(page, { starfieldPreview: true });
  await page.locator("#login-gate.is-ready").waitFor();
  await page
    .locator(".login-panel-wrap")
    .evaluate((element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished)),
    );

  const canvas = page.locator("#login-galaxy-canvas");
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => window.QianbianLoginGalaxy?.stats()),
    )
    .toMatchObject({
      particleCount: expect.any(Number),
      frame: expect.any(Number),
    });
  const stats = await page.evaluate(() => window.QianbianLoginGalaxy.stats());
  expect(stats.particleCount).toBeGreaterThanOrEqual(140);
  const paintedPixels = await canvas.evaluate((element) => {
    const context = element.getContext("2d");
    const data = context.getImageData(
      0,
      0,
      element.width,
      element.height,
    ).data;
    let painted = 0;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 0) painted += 1;
    }
    return painted;
  });
  expect(paintedPixels).toBeGreaterThan(200);

  const initialZoom = await page.evaluate(
    () => window.QianbianLoginGalaxy.zoom,
  );
  await page.locator(".login-panel").hover();
  await page.mouse.wheel(0, -420);
  await expect
    .poll(() => page.evaluate(() => window.QianbianLoginGalaxy.zoom))
    .toBeGreaterThan(initialZoom);
  const zoomedIn = await page.evaluate(
    () => window.QianbianLoginGalaxy.zoom,
  );
  await page.mouse.wheel(0, 320);
  await expect
    .poll(() => page.evaluate(() => window.QianbianLoginGalaxy.zoom))
    .toBeLessThan(zoomedIn);
  await expect(page.getByLabel("账号/邮箱/手机号", { exact: true })).toBeVisible();
});

test("login panel can be dragged after long press", async ({
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
  await expect(page.locator(".login-panel-drag-handle")).toHaveCount(0);
  const panelBox = await page.locator(".login-panel").boundingBox();
  const initialCenter = {
    x: panelBox.x + panelBox.width / 2,
    y: panelBox.y + panelBox.height / 2,
  };
  const startX = panelBox.x + 36;
  const startY = panelBox.y + 16;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(320);
  await expect(wrap).toHaveClass(/is-dragging/);
  await page.mouse.move(startX + 240, startY + 140, { steps: 5 });
  await expect
    .poll(() =>
      wrap.evaluate((element) => getComputedStyle(element).translate),
    )
    .not.toBe("none");
  await expect
    .poll(() =>
      wrap.evaluate((element) => getComputedStyle(element).willChange),
    )
    .toContain("translate");
  const offset = await wrap.evaluate((element) => ({
    x: element.style.getPropertyValue("--login-drag-x"),
    y: element.style.getPropertyValue("--login-drag-y"),
  }));
  expect(Number.parseFloat(offset.x)).toBeGreaterThan(160);
  expect(Number.parseFloat(offset.y)).toBeGreaterThan(80);
  await page.mouse.up();
  await page.waitForTimeout(600);
  await expect(wrap).toHaveClass(/has-dragged/);
  await expect(wrap).not.toHaveClass(/is-snapping/);
  const settledAnimationName = await wrap.evaluate(
    (element) => getComputedStyle(element).animationName,
  );
  expect(settledAnimationName).toBe("none");
  const settledBox = await page.locator(".login-panel").boundingBox();
  expect(
    Math.abs(settledBox.x + settledBox.width / 2 - initialCenter.x),
  ).toBeLessThan(3);
  expect(
    Math.abs(settledBox.y + settledBox.height / 2 - initialCenter.y),
  ).toBeLessThan(3);
});

test("login panel always uses the pressed frosted glass material", async ({
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

  const readPanelState = () =>
    page.evaluate(() => {
      const panel = document.querySelector(".login-panel");
      const rootStyle = getComputedStyle(document.documentElement);
      const panelStyle = getComputedStyle(panel);
      const colorMatch = panelStyle.backgroundColor.match(
        /rgba?\(([^)]+)\)/,
      );
      const colorParts = colorMatch
        ? colorMatch[1].split(",").map((part) => Number(part.trim()))
        : [];
      const blurMatch = panelStyle.backdropFilter.match(
        /blur\(([\d.]+)px\)/,
      );
      return {
        radius: Number.parseFloat(panelStyle.borderRadius),
        alpha: colorParts.length === 4 ? colorParts[3] : 1,
        red: colorParts[0] ?? 0,
        green: colorParts[1] ?? 0,
        blue: colorParts[2] ?? 0,
        backgroundImage: panelStyle.backgroundImage,
        backdrop: panelStyle.backdropFilter || panelStyle.webkitBackdropFilter,
        blur: blurMatch ? Number(blurMatch[1]) : 0,
        beforeDisplay: getComputedStyle(panel, "::before").display,
        afterDisplay: getComputedStyle(panel, "::after").display,
      };
    });

  const panelBox = await page.locator(".login-panel").boundingBox();
  const startX = panelBox.x + 36;
  const startY = panelBox.y + 16;
  await page.mouse.move(startX, startY);
  const before = await readPanelState();
  expect(before.radius).toBeGreaterThanOrEqual(32);
  expect(before.alpha).toBeGreaterThanOrEqual(0.55);
  expect(before.alpha).toBeLessThanOrEqual(0.65);
  expect((before.red + before.green + before.blue) / 3).toBeLessThanOrEqual(
    80,
  );
  expect(before.blur).toBeGreaterThanOrEqual(30);
  expect(before.backgroundImage).toBe("none");
  expect(before.beforeDisplay).toBe("none");
  expect(before.afterDisplay).toBe("none");

  await page.mouse.down();
  await page.waitForTimeout(320);
  await page.mouse.move(startX + 240, startY + 140, { steps: 5 });
  const during = await readPanelState();
  const wrap = page.locator("#login-panel-wrap");
  await expect(wrap).toHaveClass(/is-dragging/);
  await expect(wrap).not.toHaveClass(/is-snapping/);
  expect(during.radius).toBe(before.radius);
  expect(during.alpha).toBeCloseTo(before.alpha, 2);
  expect((during.red + during.green + during.blue) / 3).toBeLessThanOrEqual(
    80,
  );
  expect(during.blur).toBeCloseTo(before.blur, 0);
  expect(during.backgroundImage).toBe("none");

  await page.mouse.up();
  await page.waitForTimeout(560);
  const after = await readPanelState();
  expect(after.alpha).toBeCloseTo(before.alpha, 2);
  expect(after.blur).toBeCloseTo(before.blur, 0);
  expect(after.backgroundImage).toBe(before.backgroundImage);
});

test("login submit has no left-side hover flash", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openFreshDesktop(page, { starfieldPreview: true });
  await page.locator("#login-gate.is-ready").waitFor();

  const submit = page.locator(".login-submit");
  await expect(page.locator(".login-submit-glow")).toHaveCount(0);
  await submit.hover();
  await page.waitForTimeout(220);
  await expect(page.locator(".login-submit-glow")).toHaveCount(0);
});
