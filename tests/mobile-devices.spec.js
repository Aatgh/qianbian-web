const path = require("node:path");
const { test, expect } = require("@playwright/test");

const apiBase = "http://backend.test/api";
const mobileUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}`;
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type",
};

async function mockDeviceBackend(page, calls, options = {}) {
  let loggedIn = Boolean(options.loggedIn);
  const devices = options.devices || [
    {
      id: "device-1",
      name: "我的笔记本",
      platform: "windows",
      status: "online",
      lastSeenAt: "2026-11-25T10:30:00+08:00",
      permissions: { roots: ["D:/workspace"] },
      capabilities: ["files", "terminal"],
    },
  ];
  await page.route("http://backend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }
    calls.push({
      method: request.method(),
      pathname,
      body: request.postData() ? JSON.parse(request.postData()) : null,
    });
    const headers = {
      ...corsHeaders,
      "content-type": "application/json",
    };
    if (pathname === "/health") {
      return route.fulfill({ headers, json: { ok: true } });
    }
    if (pathname === "/auth/me") {
      if (!loggedIn) {
        return route.fulfill({
          status: 401,
          headers,
          json: { error: "未登录" },
        });
      }
      return route.fulfill({
        headers,
        json: { user: { id: "u1", name: "测试用户", phone: "13800000000" } },
      });
    }
    if (pathname === "/auth/sms-code") {
      return route.fulfill({ headers, json: { ok: true } });
    }
    if (pathname === "/auth/login/phone") {
      loggedIn = true;
      return route.fulfill({ headers, json: { ok: true, user: { id: "u1" } } });
    }
    if (pathname === "/auth/logout") {
      loggedIn = false;
      return route.fulfill({ headers, json: { ok: true } });
    }
    if (pathname === "/devices" && request.method() === "GET") {
      return route.fulfill({ headers, json: { devices } });
    }
    if (pathname === "/devices/pair/start") {
      return route.fulfill({
        headers,
        json: {
          pairingCode: "482913",
          expiresAt: "2026-11-25T10:35:00+08:00",
          qrPayload: "qianbian://pair?code=482913",
        },
      });
    }
    if (pathname === "/devices/device-1" && request.method() === "DELETE") {
      devices.splice(0, devices.length);
      return route.fulfill({ status: 204, headers: corsHeaders });
    }
    if (pathname === "/environment" || pathname === "/environments") {
      return route.fulfill({
        headers,
        json: {
          environments: [
            {
              id: "local",
              name: "云端工作区",
              kind: "local",
              status: "ready",
              detail: "服务端工作区",
            },
          ],
        },
      });
    }
    if (pathname === "/affinity") {
      return route.fulfill({
        headers,
        json: { score: 12, autoScore: 12, calibration: 50, band: "初识" },
      });
    }
    if (pathname === "/models") {
      return route.fulfill({
        headers,
        json: { models: [{ modelId: "2", label: "DeepSeek Chat", isDefault: true }] },
      });
    }
    if (pathname === "/skills" || pathname === "/skills/mine") {
      return route.fulfill({ headers, json: { skills: [] } });
    }
    if (pathname === "/sessions") {
      return route.fulfill({ headers, json: { sessions: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        headers: { ...corsHeaders, "content-type": "text/event-stream" },
        body: 'event: status\ndata: {"connected":true}\n\n',
      });
    }
    return route.fulfill({ headers, json: {} });
  });
}

test("mobile supports real SMS login", async ({ page }) => {
  const calls = [];
  await mockDeviceBackend(page, calls);
  await page.goto(`${mobileUrl}?mobile=1&auth=1&api=${encodeURIComponent(apiBase)}#/home`);

  const gate = page.locator("#mobile-login-gate");
  await expect(gate).toBeVisible();
  await page.locator("#mobile-login-phone").fill("13800000000");
  await page.locator('[data-action="mobile-send-sms"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/auth/sms-code"))
    .toBeTruthy();
  await page.locator("#mobile-login-code").fill("123456");
  await page.locator('[data-action="mobile-login-submit"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/auth/login/phone"))
    .toBeTruthy();
  await expect(gate).toBeHidden({ timeout: 10000 });
});

test("mobile lists devices, starts pairing and follows SSE status", async ({
  page,
}) => {
  const calls = [];
  await mockDeviceBackend(page, calls, { loggedIn: true });
  await page.goto(
    `${mobileUrl}?mobile=1&api=${encodeURIComponent(apiBase)}#/account`,
  );
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);
  await page.locator('[data-action="open-devices"]').click();

  const devices = page.locator(".mobile-devices-screen");
  await expect(devices).toBeVisible();
  await expect(devices).toContainText("我的笔记本");
  await expect(devices).toContainText("在线");

  await page.locator('[data-action="start-device-pair"]').click();
  await expect(devices).toContainText("482913");

  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("device/status", {
      deviceId: "device-1",
      status: "offline",
    });
  });
  await expect(devices).toContainText("离线");

  await page.locator('[data-action="delete-device"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/devices/device-1"))
    .toBeTruthy();
  await expect(page.locator(".mobile-device-card")).toHaveCount(0);
});
