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
      id: 1,
      name: "我的笔记本",
      type: "windows",
      platform: "Windows 11",
      status: "1",
      lastSeenAt: "2026-11-25T10:30:00+08:00",
      capabilitiesJson: '["files","terminal"]',
      permissionsJson:
        '{"allowedRoots":["D:/workspace"],"terminal":true,"screenshot":false}',
    },
  ];
  const deviceTasks = options.deviceTasks || [];
  let permissions = options.permissions || {
    allowedRoots: ["D:/workspace"],
    terminal: true,
    files: true,
    screenshot: false,
  };
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
    if (pathname === "/devices/1/tasks" && request.method() === "GET") {
      return route.fulfill({ headers, json: { tasks: deviceTasks } });
    }
    if (pathname === "/devices/1/permissions") {
      if (request.method() === "GET") {
        return route.fulfill({ headers, json: { permissions } });
      }
      if (request.method() === "PUT") {
        permissions = request.postDataJSON();
        return route.fulfill({ headers, json: { permissions } });
      }
    }
    if (pathname === "/devices/1/audit") {
      return route.fulfill({
        headers,
        json: {
          audit: [
            {
              id: 1,
              action: "permission.update",
              status: "success",
              summary: "更新终端权限",
              create_time: "2026-11-25T10:45:00+08:00",
            },
          ],
        },
      });
    }
    if (pathname === "/devices/pair/start") {
      return route.fulfill({
        headers,
        json: {
          pairingCode: "7YKN85",
          expiresAt: "2026-11-25T10:35:00+08:00",
          qrPayload:
            '{"type":"qianbian-device","code":"7YKN85","server":"https://agiqianbian.com"}',
          type: "android",
        },
      });
    }
    if (pathname === "/devices/1" && request.method() === "PATCH") {
      const patch = request.postDataJSON();
      if (typeof patch.name === "string") devices[0].name = patch.name;
      if (typeof patch.paused === "boolean") {
        devices[0].status = patch.paused ? "2" : "1";
      }
      return route.fulfill({ status: 204, headers: corsHeaders });
    }
    if (pathname === "/devices/1" && request.method() === "DELETE") {
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
  await page.setViewportSize({ width: 390, height: 844 });
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

  await page.goto(
    `${mobileUrl}?mobile=1&auth=1&api=${encodeURIComponent(apiBase)}#/account`,
  );
  await expect(gate).toBeHidden({ timeout: 10000 });
  await page.locator('[data-action="logout"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/auth/logout"))
    .toBeTruthy();
});

test("mobile lists devices, starts pairing and follows SSE status", async ({
  page,
}) => {
  const calls = [];
  await mockDeviceBackend(page, calls, { loggedIn: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `${mobileUrl}?mobile=1&api=${encodeURIComponent(apiBase)}#/account`,
  );
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);
  await page.locator('[data-action="open-devices"]').click();

  const devices = page.locator(".mobile-devices-screen");
  await expect(devices).toBeVisible();
  await expect(devices).toContainText("我的笔记本");
  await expect(devices).toContainText("Windows 11 · 在线");
  await expect(devices).toContainText("能力：files / terminal");
  const beforePairedRefresh = calls.filter(
    (call) => call.pathname === "/devices" && call.method === "GET",
  ).length;
  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("device/paired", {});
  });
  await expect
    .poll(
      () =>
        calls.filter(
          (call) => call.pathname === "/devices" && call.method === "GET",
        ).length,
    )
    .toBeGreaterThan(beforePairedRefresh);
  const beforeRemovedRefresh = calls.filter(
    (call) => call.pathname === "/devices" && call.method === "GET",
  ).length;
  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("device/removed", {});
  });
  await expect
    .poll(
      () =>
        calls.filter(
          (call) => call.pathname === "/devices" && call.method === "GET",
        ).length,
    )
    .toBeGreaterThan(beforeRemovedRefresh);

  await page.locator('[data-action="start-device-pair"]').click();
  await expect(devices.locator("[data-device-pair-form]")).toBeVisible();
  await page.locator("[data-device-pair-type]").selectOption("android");
  await page.locator("[data-device-pair-name]").fill("随身手机");
  await page.locator('[data-action="submit-device-pair"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/devices/pair/start"))
    .toMatchObject({
      method: "POST",
      body: { type: "android", name: "随身手机" },
    });
  await expect(devices).toContainText("7YKN85");
  await expect(devices.locator(".device-pair-qr")).toHaveAttribute(
    "data-qr-payload",
    /"code":"7YKN85"/,
  );
  await expect(page.locator("[data-device-download-link]")).toHaveAttribute(
    "href",
    /connectors\.html/,
  );

  await page
    .locator('[data-action="edit-device"][data-device-id="1"]')
    .click();
  await page.locator('[data-device-name-input="1"]').fill("随身笔记本");
  await page
    .locator('[data-action="save-device-name"][data-device-id="1"]')
    .click();
  await expect(devices).toContainText("随身笔记本");
  expect(
    calls.find(
      (call) =>
        call.pathname === "/devices/1" &&
        call.body?.name === "随身笔记本",
    ),
  ).toBeTruthy();
  await page
    .locator('[data-action="toggle-device-pause"][data-device-id="1"]')
    .click();
  await expect(devices).toContainText("已暂停");
  expect(
    calls.find(
      (call) =>
        call.pathname === "/devices/1" &&
        call.body?.paused === true,
    ),
  ).toBeTruthy();
  await page
    .locator('[data-action="toggle-device-pause"][data-device-id="1"]')
    .click();
  await expect(devices).toContainText("在线");

  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("device/status", {
      deviceId: "1",
      status: "offline",
      lastSeenAt: "2026-11-25T10:40:00+08:00",
      devices: [
        {
          id: 1,
          name: "随身笔记本",
          type: "windows",
          platform: "Windows 11",
          status: "0",
          capabilitiesJson: '["files","terminal"]',
          permissionsJson:
            '{"allowedRoots":["D:/workspace"],"terminal":true,"screenshot":false}',
        },
      ],
    });
  });
  await expect(devices).toContainText("离线");
  await page.locator('[data-action="show-device-permissions"]').click();
  const permissions = page.locator("[data-device-permissions]");
  await expect(permissions.locator("[data-device-permission-roots]")).toHaveValue(
    "D:/workspace",
  );
  await expect(
    permissions.locator("[data-device-permission-terminal]"),
  ).toBeChecked();
  await expect(permissions.locator("[data-device-audit-entry]")).toContainText(
    "权限已更新",
  );
  await permissions
    .locator("[data-device-permission-roots]")
    .fill("D:/workspace\nE:/notes");
  await permissions
    .locator("[data-device-permission-screenshot]")
    .check();
  await permissions.locator('[data-action="save-device-permissions"]').click();
  await expect
    .poll(
      () =>
        calls.filter(
          (call) =>
            call.pathname === "/devices/1/permissions" &&
            call.method === "PUT",
        ).length,
    )
    .toBe(1);
  expect(
    calls.find(
      (call) =>
        call.pathname === "/devices/1/permissions" &&
        call.method === "PUT",
    ).body,
  ).toEqual({
    allowedRoots: ["D:/workspace", "E:/notes"],
    terminal: true,
    files: true,
    screenshot: true,
  });

  await page.locator('[data-action="delete-device"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/devices/1"))
    .toBeTruthy();
  await expect(page.locator(".mobile-device-card")).toHaveCount(0);
});

test("mobile shows device task progress and refresh", async ({ page }) => {
  const calls = [];
  await mockDeviceBackend(page, calls, {
    loggedIn: true,
    deviceTasks: [
      {
        id: 11,
        deviceId: 1,
        type: "terminal.exec",
        status: "running",
        startedAt: new Date(Date.now() - 2100).toISOString(),
      },
      {
        id: 10,
        deviceId: 1,
        type: "fs.read",
        status: "failed",
        error: "文件不存在",
        durationMs: 340,
      },
    ],
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `${mobileUrl}?mobile=1&api=${encodeURIComponent(apiBase)}#/account`,
  );
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);
  await page.locator('[data-action="open-devices"]').click();

  const tasks = page.locator(".mobile-device-task");
  await expect(tasks).toHaveCount(2);
  await expect(tasks.nth(0)).toContainText("执行命令");
  await expect(tasks.nth(0)).toContainText("执行中");
  await expect(tasks.nth(1)).toContainText("读取文件");
  await expect(tasks.nth(1)).toContainText("失败");
  await expect(tasks.nth(1)).toContainText("0.3s");

  const beforeRefresh = calls.filter(
    (call) => call.pathname === "/devices/1/tasks",
  ).length;
  await page.locator('[data-action="refresh-device-tasks"]').click();
  await expect
    .poll(
      () =>
        calls.filter((call) => call.pathname === "/devices/1/tasks").length,
    )
    .toBeGreaterThan(beforeRefresh);
  const afterManualRefresh = calls.filter(
    (call) => call.pathname === "/devices/1/tasks",
  ).length;
  await expect
    .poll(
      () =>
        calls.filter((call) => call.pathname === "/devices/1/tasks").length,
      { timeout: 7000 },
    )
    .toBeGreaterThan(afterManualRefresh);
});
