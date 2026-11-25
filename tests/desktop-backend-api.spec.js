const path = require("node:path");
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");

const apiScriptPath = path.resolve(__dirname, "..", "desktop-api.js");
const desktopRoot = path.resolve(__dirname, "..");
const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}?api=${encodeURIComponent("http://backend.test/api")}`;

async function unlockDesktop(page) {
  await page
    .waitForSelector("#login-gate.is-ready", {
      state: "attached",
      timeout: 5000,
    })
    .catch(() => {});
  await page.evaluate(() => {
    localStorage.setItem("qianbian-desktop-auth", "true");
    document.getElementById("login-gate").hidden = true;
    document.body.classList.remove("login-locked");
    document.documentElement.classList.remove("login-pending");
    const shell = document.getElementById("app-shell");
    shell.inert = false;
    shell.removeAttribute("aria-hidden");
  });
  await page.waitForFunction(
    () => getComputedStyle(document.getElementById("app-shell")).visibility !== "hidden",
  );
}

test("desktop API client covers every backend endpoint", async ({ page }) => {
  const calls = [];
  await page.route("http://frontend.test/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body></body></html>",
    }),
  );
  await page.route("http://frontend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    calls.push({
      method: request.method(),
      pathname,
      search: url.search,
      body: request.postData(),
      contentType: request.headers()["content-type"] || "",
    });

    if (pathname === "/sessions") {
      return route.fulfill({
        json: {
          sessions: [
            {
              sessionId: "23",
              title: "今天的天气",
              updatedAt: "2026-11-23T11:13:55.000+08:00",
            },
          ],
          nextCursor: null,
        },
      });
    }
    if (pathname === "/session/start") {
      return route.fulfill({
        json: {
          session: { sessionId: "24", title: "新对话" },
          viewCursor: "0",
          history: { mode: "inline", items: [] },
        },
      });
    }
    if (pathname === "/session/resume") {
      return route.fulfill({
        json: {
          session: { sessionId: "23", title: "今天的天气" },
          history: { mode: "inline", items: [] },
          pendingRequests: [],
        },
      });
    }
    if (pathname === "/transcript") {
      return route.fulfill({ json: { items: [] } });
    }
    if (pathname === "/turn") {
      return route.fulfill({
        json: {
          disposition: "started",
          startedNewTurn: true,
          status: "accepted",
          turnId: "turn-1",
        },
      });
    }
    if (pathname === "/models") {
      return route.fulfill({
        json: {
          models: [
            { modelId: "2", label: "DeepSeek Chat", isDefault: true },
          ],
        },
      });
    }
    if (pathname === "/skills") {
      return route.fulfill({ json: { skills: [] } });
    }
    if (pathname === "/skills/mine") {
      return route.fulfill({ json: { skills: [] } });
    }
    if (pathname === "/session/export") {
      return route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: '{"sessionId":"23"}',
      });
    }
    if (pathname === "/health") {
      return route.fulfill({ json: { status: "ok" } });
    }
    return route.fulfill({ json: { ok: true } });
  });

  await page.goto("http://frontend.test/");
  await page.addScriptTag({ path: apiScriptPath });

  const result = await page.evaluate(async () => {
    const api = window.QianbianApi;
    api.setBase("http://frontend.test/api");
    await api.health();
    await api.environments();
    await api.affinity();
    await api.authMe();
    await api.sendSmsCode("13800000000");
    await api.loginPhone({ phone: "13800000000", code: "123456" });
    await api.logout();
    await api.devices();
    await api.startDevicePairing({ type: "windows", name: "我的笔记本" });
    await api.updateDevice("device-1", { name: "我的笔记本" });
    await api.deleteDevice("device-1");
    await api.createDeviceTask("device-1", {
      type: "fs.list",
      payload: { path: "C:/Users/me/Desktop" },
    });
    await api.deviceTasks("device-1");
    await api.devicePermissions("device-1");
    await api.updateDevicePermissions("device-1", {
      allowedRoots: ["C:/Users/me/Desktop"],
      terminal: true,
      files: true,
      screenshot: false,
    });
    await api.deviceAudit("device-1");
    await api.connectorReleases();
    await api.sessions();
    await api.startSession({
      modelId: "2",
      approvalMode: "onRequest",
      workspaceRoot: "D:/project/千变/data/workspaces/u14",
    });
    await api.resumeSession("23");
    await api.transcript("23");
    await api.sendTurn({
      sessionId: "23",
      text: "你好",
      modelId: "2",
      images: [],
    });
    await api.cancelTurn("23");
    await api.decideApproval({
      sessionId: "23",
      approvalId: "57",
      choiceId: "allow_once",
    });
    await api.answerInput({
      sessionId: "23",
      userInputId: "12",
      answers: [{ questionId: "0", value: "简洁" }],
    });
    await api.cancelInput({ sessionId: "23", userInputId: "12" });
    await api.models();
    await api.setSessionModel({ sessionId: "23", modelId: "3" });
    await api.setApprovalMode({ sessionId: "23", mode: "allowAll" });
    await api.skills({ scope: "market", q: "办公" });
    await api.mineSkills();
    await api.installSkill("41");
    await api.enableSkill("41");
    await api.disableSkill("41");
    await api.deleteSkill("41");
    await api.unpublishSkill("44");
    const formData = new FormData();
    formData.set("name", "测试技能");
    formData.set("summary", "测试发布");
    formData.set("mode", "online");
    formData.set("fileName", "skill.js");
    formData.set("code", "export const skill = {};");
    await api.publishSkill(formData);
    await api.dirs("~");
    await api.view("23");
    const exported = await api.exportSession("23");
    await api.automations();
    await api.git("status");
    return { exportSize: exported.size, base: api.base };
  });

  const simplified = calls.map(({ method, pathname, search }) => ({
    method,
    pathname,
    search,
  }));
  expect(simplified).toEqual([
    { method: "GET", pathname: "/health", search: "" },
    { method: "GET", pathname: "/environments", search: "" },
    { method: "GET", pathname: "/affinity", search: "" },
    { method: "GET", pathname: "/auth/me", search: "" },
    { method: "POST", pathname: "/auth/sms-code", search: "" },
    { method: "POST", pathname: "/auth/login/phone", search: "" },
    { method: "POST", pathname: "/auth/logout", search: "" },
    { method: "GET", pathname: "/devices", search: "" },
    { method: "POST", pathname: "/devices/pair/start", search: "" },
    { method: "PATCH", pathname: "/devices/device-1", search: "" },
    { method: "DELETE", pathname: "/devices/device-1", search: "" },
    { method: "POST", pathname: "/devices/device-1/tasks", search: "" },
    { method: "GET", pathname: "/devices/device-1/tasks", search: "" },
    { method: "GET", pathname: "/devices/device-1/permissions", search: "" },
    { method: "PUT", pathname: "/devices/device-1/permissions", search: "" },
    { method: "GET", pathname: "/devices/device-1/audit", search: "" },
    { method: "GET", pathname: "/connectors/releases", search: "" },
    { method: "GET", pathname: "/sessions", search: "" },
    { method: "POST", pathname: "/session/start", search: "" },
    { method: "POST", pathname: "/session/resume", search: "" },
    { method: "GET", pathname: "/transcript", search: "?sessionId=23" },
    { method: "POST", pathname: "/turn", search: "" },
    { method: "POST", pathname: "/turn/cancel", search: "" },
    { method: "POST", pathname: "/approval/decide", search: "" },
    { method: "POST", pathname: "/input/answer", search: "" },
    { method: "POST", pathname: "/input/cancel", search: "" },
    { method: "GET", pathname: "/models", search: "" },
    { method: "POST", pathname: "/session/model", search: "" },
    { method: "POST", pathname: "/session/approval-mode", search: "" },
    {
      method: "GET",
      pathname: "/skills",
      search: "?scope=market&q=%E5%8A%9E%E5%85%AC",
    },
    { method: "GET", pathname: "/skills/mine", search: "" },
    { method: "POST", pathname: "/skills/41/install", search: "" },
    { method: "POST", pathname: "/skills/41/enable", search: "" },
    { method: "POST", pathname: "/skills/41/disable", search: "" },
    { method: "DELETE", pathname: "/skills/41", search: "" },
    { method: "POST", pathname: "/skills/44/unpublish", search: "" },
    { method: "POST", pathname: "/skills/publish", search: "" },
    { method: "GET", pathname: "/dirs", search: "?path=%7E" },
    { method: "GET", pathname: "/view", search: "?sessionId=23" },
    {
      method: "GET",
      pathname: "/session/export",
      search: "?sessionId=23",
    },
    { method: "GET", pathname: "/automations", search: "" },
    { method: "GET", pathname: "/git/status", search: "" },
  ]);

  expect(result.base).toBe("http://frontend.test/api");
  expect(result.exportSize).toBeGreaterThan(0);
  const pairingCall = calls.find(
    (call) => call.pathname === "/devices/pair/start",
  );
  expect(JSON.parse(pairingCall.body)).toEqual({
    type: "windows",
    name: "我的笔记本",
  });
  const createTaskCall = calls.find(
    (call) =>
      call.pathname === "/devices/device-1/tasks" && call.method === "POST",
  );
  expect(JSON.parse(createTaskCall.body)).toEqual({
    type: "fs.list",
    payload: { path: "C:/Users/me/Desktop" },
  });
  const updatePermissionsCall = calls.find(
    (call) =>
      call.pathname === "/devices/device-1/permissions" &&
      call.method === "PUT",
  );
  expect(JSON.parse(updatePermissionsCall.body)).toEqual({
    allowedRoots: ["C:/Users/me/Desktop"],
    terminal: true,
    files: true,
    screenshot: false,
  });
  const startCall = calls.find((call) => call.pathname === "/session/start");
  expect(JSON.parse(startCall.body)).toEqual({
    modelId: "2",
    approvalMode: "onRequest",
    workspaceRoot: "D:/project/千变/data/workspaces/u14",
  });
  const publishCall = calls.find(
    (call) => call.pathname === "/skills/publish",
  );
  expect(publishCall.contentType).toContain("multipart/form-data");
});

test("desktop API forwards complete device status events", async ({ page }) => {
  await page.route("http://frontend.test/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body></body></html>",
    }),
  );
  await page.route("http://frontend.test/api/events", (route) =>
    route.fulfill({
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
      body: [
        "event: device/status",
        'data: {"deviceId":"1","status":"offline","lastSeenAt":"2026-11-25T10:40:00+08:00","devices":[{"id":1,"name":"工作笔记本","type":"windows","platform":"Windows 11","status":"offline","capabilitiesJson":"[]","permissionsJson":null}]}',
        "",
        "",
      ].join("\n"),
    }),
  );

  await page.goto("http://frontend.test/");
  await page.addScriptTag({ path: apiScriptPath });
  await page.evaluate(() => {
    window.QianbianApi.setBase("http://frontend.test/api");
    window.__deviceStatusEvent = null;
    window.__deviceEvents = window.QianbianApi.connectEvents({
      onEvent(method, params) {
        window.__deviceStatusEvent = { method, params };
      },
    });
  });

  await expect
    .poll(() => page.evaluate(() => window.__deviceStatusEvent))
    .toMatchObject({
      method: "device/status",
      params: {
        devices: [{ id: 1, status: "offline" }],
      },
    });
});

test("desktop app hydrates sessions, models and approval prompts from API", async ({
  page,
}) => {
  await page.route("http://backend.test/api/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (pathname === "/health") {
      return route.fulfill({ json: { status: "ok" } });
    }
    if (pathname === "/sessions") {
      return route.fulfill({
        json: {
          sessions: [
            {
              sessionId: "23",
              title: "后端天气会话",
              updatedAt: new Date().toISOString(),
              status: "idle",
            },
          ],
        },
      });
    }
    if (pathname === "/models") {
      return route.fulfill({
        json: {
          models: [
            { modelId: "2", label: "DeepSeek Chat", isDefault: true },
            { modelId: "3", label: "DeepSeek Reasoner", isDefault: false },
          ],
        },
      });
    }
    if (pathname === "/devices") {
      return route.fulfill({
        json: {
          devices: [
            {
              id: 7,
              name: "设计笔记本",
              type: "windows",
              platform: "Windows 11",
              status: "online",
              capabilitiesJson: '["files"]',
              permissionsJson: null,
            },
          ],
        },
      });
    }
    if (pathname === "/skills") {
      const scope = url.searchParams.get("scope");
      return route.fulfill({
        json: {
          skills:
            scope === "market"
              ? [
                  {
                    id: 41,
                    name: "wps-office-suite",
                    displayName: "WPS Office 全家桶",
                    description: "办公套件",
                    category: "办公",
                    installed: false,
                    enabled: true,
                  },
                ]
              : [
                  {
                    id: 42,
                    name: "installed-skill",
                    displayName: "已安装技能",
                    description: "已安装",
                    installed: true,
                    enabled: true,
                  },
                ],
        },
      });
    }
    if (pathname === "/skills/mine") {
      return route.fulfill({ json: { skills: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream" },
        body: [
          'event: status\ndata: {"connected":true,"mock":false}\n',
          'event: msp\ndata: {"method":"approval/requested","params":{"approvalId":"57","sessionId":"23","toolName":"write_file","subject":{"summary":"写入测试文件"},"availableChoices":[{"choiceId":"allow_once","label":"允许一次","decision":"approved","scope":"once"}]}}\n',
        ].join("\n"),
      });
    }
    return route.fulfill({ json: {} });
  });

  await page.goto(desktopUrl);
  await unlockDesktop(page);

  await expect(page.locator("#session-list")).toContainText("后端天气会话");
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("approval/requested", {
      approvalId: "57",
      sessionId: "23",
      toolName: "write_file",
      subject: {
        summary: "写入测试文件",
        path: "D:/workspace/测试文件.md",
      },
      executionTarget: "7",
      riskLevel: "high",
      availableChoices: [
        {
          choiceId: "allow_once",
          label: "允许一次",
          decision: "approved",
          scope: "once",
        },
      ],
    });
  });
  await expect(page.locator(".backend-prompt-card")).toContainText(
    "写入测试文件",
  );
  await expect(page.locator(".backend-prompt-context")).toContainText(
    "设计笔记本",
  );
  await expect(page.locator(".backend-prompt-context")).toContainText(
    "高风险",
  );
  await expect(page.locator(".backend-prompt-context")).toContainText(
    "D:/workspace/测试文件.md",
  );
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("item/started", {
      item: {
        itemId: "tool-1",
        kind: "toolCall",
        tool: "read_file",
        status: "inProgress",
        visibleOutput: "读取",
      },
    });
    window.__qianbianBackend.handleEvent("item/delta", {
      itemId: "tool-1",
      field: "output",
      delta: "完成",
    });
  });
  await expect(page.locator(".backend-activity")).toContainText(
    "调用 1 个工具 · 0 次成功",
  );
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("item/completed", {
      item: {
        itemId: "tool-1",
        kind: "toolCall",
        tool: "read_file",
        status: "completed",
        visibleOutput: "读取完成",
        done: true,
      },
    });
  });
  await expect(page.locator(".backend-activity summary")).toContainText(
    "调用 1 个工具 · 1 次成功",
  );
  await page.locator(".backend-activity summary").click();
  await expect(page.locator(".backend-activity")).toContainText("读取完成");
});

test("desktop groups tool activity by turn above assistant replies", async ({
  page,
}) => {
  await page.goto(desktopUrl);
  await unlockDesktop(page);

  await page.evaluate(() => {
    const handle = window.__qianbianBackend.handleEvent;
    handle("turn/started", { turnId: "turn-1" });
    handle("item/completed", {
      item: {
        itemId: "user-1",
        turnId: "turn-1",
        kind: "userMessage",
        text: "帮我查怀化天气",
        status: "completed",
      },
    });
    handle("item/completed", {
      item: {
        itemId: "reason-1",
        turnId: "turn-1",
        kind: "reasoning",
        summary: ["确认城市名称"],
        status: "completed",
      },
    });
    handle("item/completed", {
      item: {
        itemId: "tool-1",
        turnId: "turn-1",
        kind: "toolCall",
        tool: "local_weather",
        args: '{"city":"怀化鹤城区"}',
        visibleOutput: "怀化 9°C 小雨",
        status: "completed",
        done: true,
      },
    });
    handle("item/completed", {
      item: {
        itemId: "answer-1",
        turnId: "turn-1",
        kind: "agentMessage",
        text: "怀化明天小雨。",
        status: "completed",
      },
    });
    handle("turn/completed", {
      turnId: "turn-1",
      terminal: "completed",
    });

    handle("turn/started", { turnId: "turn-2" });
    handle("item/completed", {
      item: {
        itemId: "user-2",
        turnId: "turn-2",
        kind: "userMessage",
        text: "再查一次",
        status: "completed",
      },
    });
    handle("item/completed", {
      item: {
        itemId: "tool-2",
        turnId: "turn-2",
        kind: "toolCall",
        tool: "local_weather",
        args: '{"city":"怀化"}',
        visibleOutput: "城市查询失败",
        status: "failed",
        done: true,
      },
    });
    handle("item/completed", {
      item: {
        itemId: "answer-2",
        turnId: "turn-2",
        kind: "agentMessage",
        text: "这次天气工具没有返回结果。",
        status: "completed",
      },
    });
    handle("turn/completed", {
      turnId: "turn-2",
      terminal: "completed",
    });
  });

  const activities = page.locator(".backend-activity");
  await expect(activities).toHaveCount(2);
  await expect(activities.nth(0).locator("summary")).toContainText(
    "调用 1 个工具 · 1 次成功",
  );
  await expect(activities.nth(1).locator("summary")).toContainText(
    "尝试 1 次 · 0 次成功",
  );
  await expect(activities.nth(0)).not.toHaveAttribute("open");
  await expect(activities.nth(1)).not.toHaveAttribute("open");

  const order = await page.evaluate(() =>
    [...document.querySelectorAll("#message-thread .backend-activity, #message-thread .message-row.assistant")].map(
      (node) => ({
        activity: node.classList.contains("backend-activity"),
        text: node.textContent.replace(/\s+/g, " ").trim(),
      }),
    ),
  );
  expect(order).toHaveLength(4);
  expect(order[0]).toMatchObject({ activity: true });
  expect(order[1].activity).toBe(false);
  expect(order[1].text).toContain("怀化明天小雨。");
  expect(order[2]).toMatchObject({ activity: true });
  expect(order[3].activity).toBe(false);
  expect(order[3].text).toContain("这次天气工具没有返回结果。");

  await activities.nth(0).locator("summary").click();
  await expect(activities.nth(0)).toContainText("local_weather");
  await expect(activities.nth(0)).toContainText("怀化 9°C 小雨");
});

test("desktop composer input has no colored focus outline", async ({ page }) => {
  await page.goto(desktopUrl);
  await unlockDesktop(page);
  await page.waitForSelector("#desktop-composer-input");

  const input = page.locator("#desktop-composer-input");
  await input.focus();
  const focusStyle = await input.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      focusVisible: element.matches(":focus-visible"),
      outlineStyle: style.outlineStyle,
      boxShadow: style.boxShadow,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
    };
  });

  expect(focusStyle).toEqual({
    focusVisible: true,
    outlineStyle: "none",
    boxShadow: "none",
    borderStyle: "none",
    borderWidth: "0px",
  });
});

test("desktop empty state omits suggestion shortcuts", async ({ page }) => {
  await page.goto(desktopUrl);
  await unlockDesktop(page);

  await expect(page.locator(".empty-inner h2")).toContainText(
    "一句话，千变万化。",
  );
  await expect(page.locator(".empty-inner > p")).toContainText(
    "说出目标，千变会整理上下文",
  );
  await expect(page.locator(".suggestion-grid")).toHaveCount(0);
  await expect(page.locator("[data-suggestion]")).toHaveCount(0);
});

test("desktop environment switcher gates cloud and sends executionTarget", async ({
  page,
}) => {
  const calls = [];
  await page.route("http://backend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (request.method() !== "OPTIONS") {
      calls.push({
        pathname,
        body: request.postData() ? JSON.parse(request.postData()) : null,
      });
    }
    if (pathname === "/health") return route.fulfill({ json: { ok: true } });
    if (pathname === "/environments") {
      return route.fulfill({
        json: {
          environments: [
            {
              id: "local",
              name: "本机工作区",
              kind: "local",
              status: "ready",
              detail: "在当前电脑执行",
            },
            {
              id: "cloud",
              name: "云电脑",
              kind: "cloud",
              status: "not_configured",
              detail: "需要配置远程云主机",
            },
          ],
        },
      });
    }
    if (pathname === "/devices" && request.method() === "GET") {
      return route.fulfill({
        json: {
          devices: [
            {
              id: 1,
              name: "工作笔记本",
              type: "windows",
              platform: "Windows 11",
              status: "1",
              capabilitiesJson: '["files","terminal"]',
              permissionsJson: null,
            },
          ],
        },
      });
    }
    if (pathname === "/devices/pair/start") {
      return route.fulfill({
        json: {
          pairingCode: "135790",
          expiresAt: "2026-11-25T12:00:00+08:00",
          qrPayload:
            '{"type":"qianbian-device","code":"135790","server":"https://agiqianbian.com"}',
          type: "windows",
        },
      });
    }
    if (pathname === "/sessions") return route.fulfill({ json: { sessions: [] } });
    if (pathname === "/models") {
      return route.fulfill({
        json: {
          models: [{ modelId: "2", label: "DeepSeek Chat", isDefault: true }],
        },
      });
    }
    if (pathname === "/skills") return route.fulfill({ json: { skills: [] } });
    if (pathname === "/skills/mine") return route.fulfill({ json: { skills: [] } });
    if (pathname === "/automations") {
      return route.fulfill({ json: { automations: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        contentType: "text/event-stream",
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    if (pathname === "/session/start") {
      return route.fulfill({
        json: {
          session: { sessionId: "24", title: "新对话" },
          history: { mode: "inline", items: [] },
        },
      });
    }
    if (pathname === "/turn") {
      return route.fulfill({
        json: { disposition: "started", turnId: "turn-1" },
      });
    }
    return route.fulfill({ json: {} });
  });

  await page.goto(desktopUrl);
  await unlockDesktop(page);
  const environment = page.locator("#desktop-environment-select");
  await expect(environment).toHaveValue("local");
  await expect(environment.locator('option[value="cloud"]')).toBeDisabled();
  const environmentPlacement = await environment.evaluate((select) => {
    const control = select.closest(".sidebar-environment");
    const box = control?.getBoundingClientRect();
    return {
      inSidebarSettings: Boolean(control?.closest(".sidebar-settings")),
      inComposer: Boolean(control?.closest(".desktop-composer")),
      left: box?.left ?? Number.POSITIVE_INFINITY,
    };
  });
  expect(environmentPlacement.inSidebarSettings).toBe(true);
  expect(environmentPlacement.inComposer).toBe(false);
  expect(environmentPlacement.left).toBeLessThan(110);
  await expect(page.locator("#header-environment")).toContainText(
    "本机工作区",
  );

  await page.locator("#desktop-composer-input").fill("检查本机工作区");
  await page.locator("#composer-send").click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/session/start"))
    .toBeTruthy();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/turn"))
    .toBeTruthy();
  expect(calls.find((call) => call.pathname === "/session/start").body)
    .toMatchObject({ executionTarget: "local" });
  expect(calls.find((call) => call.pathname === "/turn").body)
    .toMatchObject({ executionTarget: "local" });

  await page.locator("#account-menu-button").click();
  await expect(page.locator(".account-device-row")).toContainText("工作笔记本");
  const beforePairedRefresh = calls.filter(
    (call) => call.pathname === "/devices",
  ).length;
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("device/paired", {});
  });
  await expect
    .poll(
      () => calls.filter((call) => call.pathname === "/devices").length,
    )
    .toBeGreaterThan(beforePairedRefresh);
  const beforeRemovedRefresh = calls.filter(
    (call) => call.pathname === "/devices",
  ).length;
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("device/removed", {});
  });
  await expect
    .poll(
      () => calls.filter((call) => call.pathname === "/devices").length,
    )
    .toBeGreaterThan(beforeRemovedRefresh);
  await page.locator("[data-start-device-pair]").click();
  await page.locator("[data-device-pair-name]").fill("新设备");
  await page.locator("[data-submit-device-pair]").click();
  await expect(page.locator(".account-device-pair")).toContainText("135790");
  await expect
    .poll(() => calls.find((call) => call.pathname === "/devices/pair/start")?.body)
    .toEqual({ type: "windows", name: "新设备" });
});

test("desktop skill delete control aligns with card toggles", async ({
  page,
}) => {
  await page.goto(desktopUrl);
  await unlockDesktop(page);

  const skillDelete = page.locator("[data-toggle-skill-delete]");
  await expect(skillDelete).toBeVisible();
  await expect(page.locator(".insight-icon-grid .insight-icon-button")).toHaveCount(
    4,
  );
  await expect(page.locator("#context-close")).toHaveCount(0);
  await expect(
    page.locator(".right-feature-title-row [data-toggle-skill-delete]"),
  ).toHaveCount(0);

  const alignment = await page.evaluate(() => {
    const action = document.querySelector("[data-toggle-skill-delete]");
    const toggle = document.querySelectorAll("[data-skill-config-toggle]")[1];
    const actionBox = action?.getBoundingClientRect();
    const toggleBox = toggle?.getBoundingClientRect();
    return {
      actionCenter: actionBox ? actionBox.left + actionBox.width / 2 : NaN,
      actionRight: actionBox?.right ?? NaN,
      toggleCenter: toggleBox ? toggleBox.left + toggleBox.width / 2 : NaN,
      toggleRight: toggleBox?.right ?? NaN,
    };
  });
  expect(Math.abs(alignment.actionCenter - alignment.toggleCenter)).toBeLessThan(
    1,
  );
  expect(Math.abs(alignment.actionRight - alignment.toggleRight)).toBeLessThan(
    1,
  );

  await skillDelete.click();
  await expect(skillDelete).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-skill-select]").first()).toBeVisible();
  await expect(page.locator("[data-skill-config-toggle]")).toHaveCount(0);
  await expect(page.locator(".skill-delete-toolbar")).toHaveCount(0);

  const compactDelete = page.locator(
    ".skill-config-controls [data-delete-selected-skills]",
  );
  await expect(compactDelete).toBeVisible();
  await expect(compactDelete).toBeDisabled();
  await expect(compactDelete.locator(".lucide-trash-2")).toBeVisible();
  await expect(page.locator(".skill-delete-count")).toHaveText("已选 0");

  const actionAlignment = await page.evaluate(() => {
    const toggle = document.querySelector("[data-toggle-skill-delete]");
    const action = document.querySelector("[data-delete-selected-skills]");
    const toggleBox = toggle?.getBoundingClientRect();
    const actionBox = action?.getBoundingClientRect();
    return {
      actionCenter: actionBox ? actionBox.top + actionBox.height / 2 : NaN,
      toggleCenter: toggleBox ? toggleBox.top + toggleBox.height / 2 : NaN,
    };
  });
  expect(
    Math.abs(actionAlignment.actionCenter - actionAlignment.toggleCenter),
  ).toBeLessThan(1);

  await page.locator("[data-skill-select]").first().check();
  await expect(compactDelete).toBeEnabled();
  await skillDelete.click();
  await expect(compactDelete).toHaveCount(0);
});

test("desktop manages device name, pause state and pairing QR", async ({
  page,
}) => {
  const calls = [];
  const device = {
    id: 1,
    name: "工作笔记本",
    type: "windows",
    platform: "Windows 11",
    status: "1",
    capabilitiesJson: '["files","terminal"]',
    permissionsJson:
      '{"allowedRoots":["D:/workspace"],"terminal":true,"screenshot":false}',
  };
  await page.route("http://backend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (request.method() === "OPTIONS") {
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }
    calls.push({
      method: request.method(),
      pathname,
      body: request.postData() ? JSON.parse(request.postData()) : null,
    });
    const headers = {
      "access-control-allow-origin": "*",
      "content-type": "application/json",
    };
    if (pathname === "/health") {
      return route.fulfill({ headers, json: { ok: true } });
    }
    if (pathname === "/devices" && request.method() === "GET") {
      return route.fulfill({ headers, json: { devices: [device] } });
    }
    if (pathname === "/devices/pair/start") {
      return route.fulfill({
        headers,
        json: {
          pairingCode: "135790",
          expiresAt: "2026-11-25T12:00:00+08:00",
          qrPayload:
            '{"type":"qianbian-device","code":"135790","server":"https://agiqianbian.com"}',
          type: "windows",
        },
      });
    }
    if (
      pathname === "/devices/1" &&
      request.method() === "PATCH"
    ) {
      const patch = request.postDataJSON();
      if (typeof patch.name === "string") device.name = patch.name;
      if (typeof patch.paused === "boolean") {
        device.status = patch.paused ? "2" : "1";
      }
      return route.fulfill({ status: 204, headers });
    }
    if (pathname === "/devices/1/permissions") {
      if (request.method() === "GET") {
        return route.fulfill({
          headers,
          json: {
            permissions: {
              allowedRoots: ["D:/workspace"],
              terminal: true,
              files: true,
              screenshot: false,
            },
          },
        });
      }
      if (request.method() === "PUT") {
        return route.fulfill({
          headers,
          json: { permissions: request.postDataJSON() },
        });
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
    if (pathname === "/environments") {
      return route.fulfill({
        headers,
        json: {
          environments: [
            {
              id: "local",
              name: "本机工作区",
              kind: "local",
              status: "ready",
            },
          ],
        },
      });
    }
    if (pathname === "/sessions") {
      return route.fulfill({ headers, json: { sessions: [] } });
    }
    if (pathname === "/models") {
      return route.fulfill({
        headers,
        json: {
          models: [{ modelId: "2", label: "DeepSeek Chat", isDefault: true }],
        },
      });
    }
    if (pathname === "/skills" || pathname === "/skills/mine") {
      return route.fulfill({ headers, json: { skills: [] } });
    }
    if (pathname === "/automations") {
      return route.fulfill({ headers, json: { automations: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        headers: { ...headers, "content-type": "text/event-stream" },
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    return route.fulfill({ headers, json: {} });
  });

  await page.goto(desktopUrl);
  await unlockDesktop(page);
  await page.locator("#account-menu-button").click();
  await page.locator("[data-start-device-pair]").click();
  await expect(page.locator("[data-device-pair-form]")).toBeVisible();
  await page.locator("[data-device-pair-name]").fill("设计工作站");
  await page.locator("[data-submit-device-pair]").click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/devices/pair/start")?.body)
    .toEqual({ type: "windows", name: "设计工作站" });

  const pairingQr = page.locator(".account-device-pair .device-pair-qr");
  await expect(pairingQr).toHaveAttribute(
    "data-qr-payload",
    /"code":"135790"/,
  );
  await expect(page.locator(".account-device-pair")).not.toContainText(
    "有效期至 刚刚",
  );
  await expect
    .poll(() =>
      pairingQr.evaluate((canvas) => {
        const context = canvas.getContext("2d");
        return Boolean(
          context
            ?.getImageData(0, 0, canvas.width, canvas.height)
            .data.some((channel) => channel !== 0),
        );
      }),
    )
    .toBe(true);
  await expect(page.locator(".account-device-row")).toContainText(
    "Windows 11 · 在线",
  );
  await page.locator('[data-edit-device="1"]').click();
  await page
    .locator('[data-device-name-input="1"]')
    .fill("设计笔记本");
  await page.locator('[data-save-device-name="1"]').click();
  await expect(page.locator(".account-device-row")).toContainText("设计笔记本");
  expect(calls.find((call) => call.pathname === "/devices/1"))
    .toMatchObject({ method: "PATCH", body: { name: "设计笔记本" } });

  await page.locator('[data-toggle-device-pause="1"]').click();
  await expect(page.locator(".account-device-row")).toContainText("已暂停");
  expect(
    calls.filter((call) => call.pathname === "/devices/1").at(-1),
  ).toMatchObject({ method: "PATCH", body: { paused: true } });
  await expect(
    page.locator('#desktop-environment-select option[value="1"]'),
  ).toHaveText(/已暂停/);
  await expect(
    page.locator('#desktop-environment-select option[value="1"]'),
  ).toBeDisabled();

  await page.locator('[data-toggle-device-pause="1"]').click();
  await expect(page.locator(".account-device-row")).toContainText("在线");
  expect(
    calls.filter((call) => call.pathname === "/devices/1").at(-1),
  ).toMatchObject({ method: "PATCH", body: { paused: false } });
  await expect(page.locator("[data-open-connectors]")).toHaveAttribute(
    "href",
    /connectors\.html/,
  );
  await page.locator('[data-show-device-permissions="1"]').click();
  const permissions = page.locator("[data-device-permissions]");
  await expect(permissions.locator("[data-device-permission-roots]")).toHaveValue(
    "D:/workspace",
  );
  await expect(
    permissions.locator("[data-device-permission-terminal]"),
  ).toBeChecked();
  await expect(
    permissions.locator("[data-device-permission-screenshot]"),
  ).not.toBeChecked();
  await expect(permissions.locator("[data-device-audit-entry]")).toContainText(
    "权限已更新",
  );
  await permissions
    .locator("[data-device-permission-roots]")
    .fill("D:/workspace\nE:/notes");
  await permissions
    .locator("[data-device-permission-terminal]")
    .uncheck();
  await permissions.locator("[data-save-device-permissions]").click();
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
    terminal: false,
    files: true,
    screenshot: false,
  });
});

test("desktop shows live device task progress", async ({ page }) => {
  const calls = [];
  await page.route("http://backend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (request.method() !== "OPTIONS") {
      calls.push({ method: request.method(), pathname });
    }
    const headers = {
      "access-control-allow-origin": "*",
      "content-type": "application/json",
    };
    if (pathname === "/health") {
      return route.fulfill({ headers, json: { ok: true } });
    }
    if (pathname === "/devices") {
      return route.fulfill({
        headers,
        json: {
          devices: [
            {
              id: 1,
              name: "工作笔记本",
              type: "windows",
              platform: "Windows 11",
              status: "1",
              capabilitiesJson: '["files","terminal"]',
              permissionsJson: null,
            },
          ],
        },
      });
    }
    if (pathname === "/devices/1/tasks") {
      return route.fulfill({
        headers,
        json: {
          tasks: [
            {
              id: 11,
              deviceId: 1,
              type: "terminal.exec",
              status: "running",
              payload_json: '{"command":"dir"}',
              create_time: new Date(Date.now() - 2500).toISOString(),
              started_at: new Date(Date.now() - 2300).toISOString(),
            },
            {
              id: 10,
              deviceId: 1,
              type: "fs.list",
              status: "done",
              result_json: '{"count":2}',
              create_time: "2026-11-25T10:20:00+08:00",
              started_at: "2026-11-25T10:20:00+08:00",
              finished_at: "2026-11-25T10:20:01.250+08:00",
            },
          ],
        },
      });
    }
    if (pathname === "/environments" || pathname === "/sessions") {
      return route.fulfill({
        headers,
        json: pathname === "/sessions" ? { sessions: [] } : { environments: [] },
      });
    }
    if (pathname === "/models") {
      return route.fulfill({
        headers,
        json: {
          models: [{ modelId: "2", label: "DeepSeek Chat", isDefault: true }],
        },
      });
    }
    if (pathname === "/skills" || pathname === "/skills/mine") {
      return route.fulfill({ headers, json: { skills: [] } });
    }
    if (pathname === "/automations") {
      return route.fulfill({ headers, json: { automations: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        headers: { ...headers, "content-type": "text/event-stream" },
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    return route.fulfill({ headers, json: {} });
  });

  await page.goto(desktopUrl);
  await unlockDesktop(page);
  await page.locator("#account-menu-button").click();

  const tasks = page.locator(".account-device-task");
  await expect(tasks).toHaveCount(2);
  await expect(tasks.nth(0)).toContainText("工作笔记本");
  await expect(tasks.nth(0)).toContainText("执行命令");
  await expect(tasks.nth(0)).toContainText("执行中");
  await expect(tasks.nth(1)).toContainText("列目录");
  await expect(tasks.nth(1)).toContainText("已完成");
  await expect(tasks.nth(1)).toContainText("1.3s");

  const beforeRefresh = calls.filter(
    (call) => call.pathname === "/devices/1/tasks",
  ).length;
  await page.locator("[data-refresh-device-tasks]").click();
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

test("desktop shows ICP footer", async ({ page }) => {
  await page.goto(desktopUrl);
  const footer = page.locator(".icp-footer");
  await expect(footer).toBeVisible();
  await expect(footer).toHaveText("湘ICP备2026043985号-3");
  await expect(footer).toHaveAttribute(
    "href",
    "https://beian.miit.gov.cn/",
  );
  await expect(footer).toHaveAttribute("target", "_blank");
  await expect(footer).toHaveAttribute("rel", "noopener noreferrer");
});

test("desktop streams deltas into the same message node", async ({ page }) => {
  await page.goto(desktopUrl);
  await unlockDesktop(page);
  await page.evaluate(() => {
    const handle = window.__qianbianBackend.handleEvent;
    handle("turn/started", { turnId: "stream-turn" });
    handle("item/started", {
      item: {
        itemId: "stream-message",
        turnId: "stream-turn",
        kind: "agentMessage",
        text: "",
        status: "inProgress",
        done: false,
      },
    });
  });
  await page.waitForSelector(
    '[data-message-item-id="stream-message"] .message-bubble',
  );
  await page.evaluate(() => {
    const node = document.querySelector(
      '[data-message-item-id="stream-message"]',
    );
    node.dataset.streamMarker = "stable";
    window.__streamIconCalls = 0;
    window.__streamFrames = [];
    window.__streamOriginalRaf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      window.__streamFrames.push(callback);
      return window.__streamFrames.length;
    };
    const original = window.lucide.createIcons.bind(window.lucide);
    window.lucide.createIcons = (...args) => {
      window.__streamIconCalls += 1;
      return original(...args);
    };
    const handle = window.__qianbianBackend.handleEvent;
    for (const delta of ["你", "好", "，世界"]) {
      handle("item/delta", {
        itemId: "stream-message",
        field: "text",
        delta,
      });
    }
  });
  const beforeFrame = await page.locator(
    '[data-message-item-id="stream-message"] .message-bubble',
  ).textContent();
  expect(beforeFrame).toBe("");
  await page.evaluate(() => {
    const frames = window.__streamFrames;
    window.__streamFrames = [];
    window.requestAnimationFrame = window.__streamOriginalRaf;
    frames.forEach((callback) => callback(performance.now()));
  });
  await expect(
    page.locator('[data-message-item-id="stream-message"] .message-bubble'),
  ).toContainText("你好，世界");
  expect(
    await page.locator('[data-message-item-id="stream-message"]').getAttribute(
      "data-stream-marker",
    ),
  ).toBe("stable");
  expect(await page.evaluate(() => window.__streamIconCalls)).toBe(0);
});

test("desktop web auto-connects to same-origin API on localhost", async ({
  page,
}) => {
  const apiCalls = [];
  await page.route("http://localhost:3101/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.startsWith("/api/")) {
      const pathname = url.pathname.replace(/^\/api/, "");
      apiCalls.push(pathname);
      if (pathname === "/health") {
        return route.fulfill({ json: { status: "ok" } });
      }
      if (pathname === "/sessions") {
        return route.fulfill({
          json: {
            sessions: [
              {
                sessionId: "local-1",
                title: "本地联调会话",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        });
      }
      if (pathname === "/models") {
        return route.fulfill({
          json: {
            models: [
              { modelId: "2", label: "DeepSeek Chat", isDefault: true },
            ],
          },
        });
      }
      if (pathname === "/automations") {
        return route.fulfill({ json: { automations: [] } });
      }
      if (pathname === "/events") {
        return route.fulfill({
          contentType: "text/event-stream",
          body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
        });
      }
      return route.fulfill({ json: { skills: [] } });
    }

    const relative =
      url.pathname === "/"
        ? "desktop.html"
        : decodeURIComponent(url.pathname.slice(1));
    const filePath = path.resolve(desktopRoot, relative);
    if (
      !filePath.startsWith(`${desktopRoot}${path.sep}`) ||
      !fs.existsSync(filePath) ||
      fs.statSync(filePath).isDirectory()
    ) {
      return route.fulfill({ status: 404, body: "not found" });
    }
    const contentTypes = {
      ".css": "text/css",
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".min.js": "text/javascript",
      ".ttf": "font/ttf",
    };
    return route.fulfill({
      path: filePath,
      contentType:
        contentTypes[path.extname(filePath).toLowerCase()] ||
        "application/octet-stream",
    });
  });

  await page.goto("http://localhost:3101/desktop.html");

  await expect
    .poll(() => apiCalls.includes("/sessions"))
    .toBe(true);
  await expect(page.locator("#session-list")).toContainText("本地联调会话");
  expect(apiCalls).toContain("/health");
  expect(apiCalls).toContain("/sessions");
});

test("new session keeps the optimistic user message", async ({ page }) => {
  await page.route("http://backend.test/api/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (pathname === "/health") {
      return route.fulfill({ json: { status: "ok" } });
    }
    if (pathname === "/sessions") {
      return route.fulfill({ json: { sessions: [] } });
    }
    if (pathname === "/models") {
      return route.fulfill({
        json: {
          models: [
            { modelId: "2", label: "DeepSeek Chat", isDefault: true },
          ],
        },
      });
    }
    if (pathname === "/automations") {
      return route.fulfill({ json: { automations: [] } });
    }
    if (pathname === "/session/start") {
      return route.fulfill({
        json: {
          session: { sessionId: "24", title: "新对话" },
          history: { mode: "inline", items: [] },
        },
      });
    }
    if (pathname === "/turn") {
      return route.fulfill({
        json: {
          disposition: "started",
          startedNewTurn: true,
          status: "accepted",
          turnId: "turn-1",
        },
      });
    }
    if (pathname === "/events") {
      return route.fulfill({
        contentType: "text/event-stream",
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    return route.fulfill({ json: { skills: [] } });
  });

  const sessionsLoaded = page.waitForResponse(
    (response) => response.url() === "http://backend.test/api/sessions",
  );
  await page.goto(desktopUrl);
  await sessionsLoaded;
  await unlockDesktop(page);
  await page.locator("#session-nav").click();
  await page.locator("#new-chat").click();
  await page.locator("#desktop-composer-input").fill("保留这条新会话消息");

  const sessionStarted = page.waitForResponse(
    (response) => response.url() === "http://backend.test/api/session/start",
  );
  const turnStarted = page.waitForResponse(
    (response) => response.url() === "http://backend.test/api/turn",
  );
  await page.locator("#composer-send").click();
  await sessionStarted;
  await turnStarted;
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("turn/started", {
      sessionId: "24",
      turnId: "turn-1",
    });
  });

  await expect(
    page.locator(".message-row.user .message-bubble").last(),
  ).toContainText("保留这条新会话消息");
});

test("resume restores pending prompts and approval sends requirementId", async ({
  page,
}) => {
  let approvalDecision = null;
  await page.route("http://backend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    if (pathname === "/health") {
      return route.fulfill({ json: { status: "ok" } });
    }
    if (pathname === "/sessions") {
      return route.fulfill({
        json: {
          sessions: [
            {
              sessionId: "23",
              title: "等待确认的会话",
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      });
    }
    if (pathname === "/session/resume") {
      return route.fulfill({
        json: {
          session: { sessionId: "23", title: "等待确认的会话" },
          history: { mode: "inline", items: [] },
          pendingRequests: [
            {
              approvalId: "57",
              sessionId: "23",
              toolName: "write_file",
              subject: { summary: "写入测试文件" },
              currentRequirementId: { approvalId: "57", sourceIndex: 0 },
              availableChoices: [
                {
                  choiceId: "allow_once",
                  label: "允许一次",
                  decision: "approved",
                  scope: "once",
                },
              ],
            },
            {
              userInputId: "12",
              sessionId: "23",
              questions: [
                {
                  id: "style",
                  header: "风格",
                  question: "请选择回答风格",
                  options: [{ label: "简洁" }],
                },
              ],
            },
          ],
        },
      });
    }
    if (pathname === "/approval/decide") {
      approvalDecision = request.postDataJSON();
      return route.fulfill({ json: { status: "accepted" } });
    }
    if (pathname === "/models") {
      return route.fulfill({
        json: {
          models: [
            { modelId: "2", label: "DeepSeek Chat", isDefault: true },
          ],
        },
      });
    }
    if (pathname === "/automations") {
      return route.fulfill({ json: { automations: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        contentType: "text/event-stream",
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    return route.fulfill({ json: { skills: [] } });
  });

  const sessionsLoaded = page.waitForResponse(
    (response) => response.url() === "http://backend.test/api/sessions",
  );
  await page.goto(desktopUrl);
  await sessionsLoaded;
  await unlockDesktop(page);
  await page.locator("#session-nav").click();
  const resumed = page.waitForResponse(
    (response) =>
      response.url() === "http://backend.test/api/session/resume",
  );
  await page.locator('[data-session="23"]').click();
  await resumed;

  await expect(page.locator(".backend-prompt-card").first()).toContainText(
    "允许一次",
  );
  await expect(page.locator("[data-backend-input='12']")).toContainText(
    "请选择回答风格",
  );
  await page.locator("[data-approval-choice='allow_once']").click();

  await expect.poll(() => approvalDecision).not.toBeNull();
  expect(approvalDecision.requirementId).toEqual({
    approvalId: "57",
    sourceIndex: 0,
  });
});

test("long skill copy is clamped and unsupported image input is disabled", async ({
  page,
}) => {
  const apiCalls = [];
  await page.route("http://backend.test/api/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname.replace(/^\/api/, "");
    apiCalls.push(pathname);
    if (pathname === "/health") {
      return route.fulfill({ json: { status: "ok" } });
    }
    if (pathname === "/sessions") {
      return route.fulfill({ json: { sessions: [] } });
    }
    if (pathname === "/models") {
      return route.fulfill({
        json: {
          models: [
            { modelId: "2", label: "DeepSeek Chat", isDefault: true },
          ],
        },
      });
    }
    if (pathname === "/automations") {
      return route.fulfill({ json: { automations: [] } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        contentType: "text/event-stream",
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    return route.fulfill({ json: { skills: [] } });
  });

  const sessionsLoaded = page.waitForResponse(
    (response) => response.url() === "http://backend.test/api/sessions",
  );
  await page.goto(desktopUrl);
  await sessionsLoaded;
  await unlockDesktop(page);
  await page.locator("#composer-plus").click();
  await expect(
    page.locator('[data-action-detail="add-image"]'),
  ).toBeDisabled();

  const lineClamp = await page.evaluate(() => {
    const host = document.createElement("div");
    host.className = "skills-grid";
    host.style.width = "360px";
    host.innerHTML = `
      <article class="skill-card">
        <span class="skill-card-icon"></span>
        <div class="skill-card-copy">
          <h3>育儿大师</h3>
          <p>${"这是一段很长的真实技能描述，用来验证卡片不会因为文本过长而被撑开。".repeat(8)}</p>
        </div>
        <div class="skill-card-actions"></div>
      </article>
    `;
    document.body.append(host);
    const paragraph = host.querySelector(".skill-card-copy p");
    const value = getComputedStyle(paragraph).webkitLineClamp;
    host.remove();
    return value;
  });
  expect(lineClamp).toBe("3");
  const configCardClamp = await page.evaluate(() => {
    const host = document.createElement("div");
    host.className = "skill-config-grid";
    host.style.width = "360px";
    host.innerHTML = `
      <article class="right-feature-card">
        <div class="right-feature-head">
          <strong>育儿大师</strong>
          <small>成长</small>
        </div>
        <p>${"这是一段很长的真实技能描述，用来验证右侧技能配置卡片不会因为文本过长而被撑开。".repeat(12)}</p>
      </article>
    `;
    document.body.append(host);
    const paragraph = host.querySelector(".right-feature-card > p");
    const style = getComputedStyle(paragraph);
    const result = {
      clamp: style.webkitLineClamp,
      clientHeight: paragraph.clientHeight,
      scrollHeight: paragraph.scrollHeight,
      lineHeight: Number.parseFloat(style.lineHeight),
    };
    host.remove();
    return result;
  });
  expect(configCardClamp.clamp).toBe("3");
  expect(configCardClamp.clientHeight).toBeLessThan(
    configCardClamp.scrollHeight,
  );
  expect(configCardClamp.clientHeight).toBeLessThanOrEqual(
    configCardClamp.lineHeight * 3 + 1,
  );
  expect(apiCalls).toContain("/automations");

  await page.locator('[data-action-detail="more-actions"]').click();
  await page.locator('.action-dialog [data-view="automation"]').click();
  await expect(page.locator(".action-dialog")).toHaveCount(0);
  await expect(
    page.locator(".automation-list .workspace-panel-empty"),
  ).toContainText("还没有自动化");
});
