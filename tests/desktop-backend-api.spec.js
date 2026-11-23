const path = require("node:path");
const { test, expect } = require("@playwright/test");

const apiScriptPath = path.resolve(__dirname, "..", "desktop-api.js");
const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}?api=${encodeURIComponent("http://backend.test/api")}`;

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
  await page.evaluate(() => {
    document.getElementById("login-gate").hidden = true;
    document.body.classList.remove("login-locked");
    const shell = document.getElementById("app-shell");
    shell.inert = false;
    shell.removeAttribute("aria-hidden");
  });

  await expect(page.locator("#session-list")).toContainText("后端天气会话");
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("approval/requested", {
      approvalId: "57",
      sessionId: "23",
      toolName: "write_file",
      subject: { summary: "写入测试文件" },
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
    "思考与工具调用",
  );
  await expect(page.locator(".backend-activity")).toContainText("读取完成");
});
