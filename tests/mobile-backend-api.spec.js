const path = require("node:path");
const { test, expect } = require("@playwright/test");

const apiBase = "http://backend.test/api";
const mobileUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}?api=${encodeURIComponent(apiBase)}#/home`;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type",
};

async function mockBackend(page, calls) {
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
      search: url.search,
      body: request.postDataJSON?.() || null,
      rawBody: request.postData(),
    });

    const headers = {
      ...corsHeaders,
      "content-type": "application/json",
    };
    if (pathname === "/health") {
      return route.fulfill({ headers, json: { status: "ok" } });
    }
    if (pathname === "/sessions") {
      return route.fulfill({
        headers,
        json: {
          sessions: [
            {
              sessionId: "23",
              title: "今天的天气",
              updatedAt: "2026-11-23T11:13:55.000+08:00",
            },
          ],
        },
      });
    }
    if (pathname === "/models") {
      return route.fulfill({
        headers,
        json: {
          models: [
            { modelId: "2", label: "DeepSeek Chat", isDefault: true },
          ],
        },
      });
    }
    if (pathname === "/skills" && url.searchParams.get("scope") === "market") {
      return route.fulfill({
        headers,
        json: {
          skills: [
            {
              id: 7,
              name: "weather-helper",
              displayName: "天气助手",
              description: "查询真实天气，并根据出行场景整理建议。",
              category: "生活",
              installed: true,
              enabled: true,
            },
          ],
        },
      });
    }
    if (pathname === "/skills" && url.searchParams.get("scope") === "installed") {
      return route.fulfill({
        headers,
        json: {
          skills: [
            {
              id: 7,
              name: "weather-helper",
              displayName: "天气助手",
              description: "查询真实天气，并根据出行场景整理建议。",
              category: "生活",
              installed: true,
              enabled: true,
            },
          ],
        },
      });
    }
    if (pathname === "/skills/mine") {
      return route.fulfill({ headers, json: { skills: [] } });
    }
    if (pathname === "/session/start") {
      return route.fulfill({
        headers,
        json: {
          session: {
            sessionId: "24",
            title: "新对话",
            updatedAt: "2026-11-23T12:00:00.000+08:00",
          },
          viewCursor: "0",
          modelId: "2",
          history: { mode: "inline", items: [] },
        },
      });
    }
    if (pathname === "/session/resume") {
      return route.fulfill({
        headers,
        json: {
          session: {
            sessionId: "23",
            title: "今天的天气",
            updatedAt: "2026-11-23T11:13:55.000+08:00",
          },
          history: {
            mode: "inline",
            items: [
              {
                itemId: "m-1",
                kind: "userMessage",
                text: "今天日照天气怎么样？",
                status: "completed",
                done: true,
              },
              {
                itemId: "m-2",
                kind: "agentMessage",
                text: "日照今天晴，适合出行。",
                status: "completed",
                done: true,
              },
            ],
          },
          pendingRequests: [],
        },
      });
    }
    if (pathname === "/turn") {
      return route.fulfill({
        headers,
        json: {
          commandId: "bridge",
          disposition: "started",
          status: "accepted",
          turnId: "turn-1",
        },
      });
    }
    if (pathname === "/approval/decide" || pathname === "/input/answer") {
      return route.fulfill({ headers, json: { ok: true } });
    }
    if (pathname === "/events") {
      return route.fulfill({
        status: 200,
        headers: {
          ...corsHeaders,
          "content-type": "text/event-stream",
        },
        body: 'event: status\ndata: {"connected":true,"mock":false}\n\n',
      });
    }
    return route.fulfill({ headers, json: {} });
  });
}

async function waitForMobileBackend(page) {
  await page.waitForFunction(
    () => window.__qianbianMobileBackend?.ready === true,
    null,
    { timeout: 5000 },
  );
}

test("mobile hydrates backend sessions, skills and streamed replies", async ({
  page,
}) => {
  const calls = [];
  await mockBackend(page, calls);
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  expect(await page.evaluate(() => Boolean(window.QianbianApi))).toBe(true);
  expect(
    await page.evaluate(() =>
      window.APP_DATA.pages["plugin-market"].marketItems.map(
        (skill) => skill.name,
      ),
    ),
  ).toContain("天气助手");

  await page.locator('[data-action="open-history"]').click();
  await expect(page.locator(".history-session").first()).toContainText(
    "今天的天气",
  );
  await page.locator('[data-action="close-history"]').click();

  await page.locator("#chat-input").fill("今天日照天气怎么样？");
  await page.locator('[data-action="send-message"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/session/start"))
    .toBeTruthy();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/turn"))
    .toBeTruthy();

  const turn = calls.find((call) => call.pathname === "/turn");
  expect(turn.body).toMatchObject({
    sessionId: "24",
    text: "今天日照天气怎么样？",
    modelId: "2",
  });

  await page.evaluate(() => {
    const backend = window.__qianbianMobileBackend;
    backend.handleEvent("item/started", {
      item: {
        itemId: "m-2",
        kind: "agentMessage",
        text: "",
        status: "inProgress",
        done: false,
      },
    });
    backend.handleEvent("item/delta", {
      itemId: "m-2",
      field: "text",
      delta: "日照今天晴，",
    });
    backend.handleEvent("item/completed", {
      item: {
        itemId: "m-2",
        kind: "agentMessage",
        text: "日照今天晴，适合出行。",
        status: "completed",
        done: true,
      },
    });
    backend.handleEvent("turn/completed", {
      sessionId: "24",
      turnId: "turn-1",
      terminal: "completed",
    });
  });

  await expect(page.locator(".assistant-message")).toContainText(
    "日照今天晴，适合出行。",
  );
});

test("mobile renders backend approvals and user questions", async ({ page }) => {
  const calls = [];
  await mockBackend(page, calls);
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("approval/requested", {
      approvalId: "57",
      sessionId: "23",
      toolName: "write_file",
      subject: { summary: "写入天气报告.md" },
      availableChoices: [
        {
          choiceId: "allow_once",
          label: "允许一次",
          decision: "approved",
          scope: "once",
        },
      ],
      requirementId: { approvalId: "57", sourceIndex: 0 },
    });
  });

  await expect(page.locator(".mobile-backend-approval")).toContainText(
    "写入天气报告.md",
  );
  await page.locator('[data-mobile-approval-choice="allow_once"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/approval/decide"))
    .toBeTruthy();
  expect(
    calls.find((call) => call.pathname === "/approval/decide").body,
  ).toMatchObject({
    sessionId: "23",
    approvalId: "57",
    choiceId: "allow_once",
    requirementId: { approvalId: "57", sourceIndex: 0 },
  });

  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("userInput/requested", {
      userInputId: "12",
      sessionId: "23",
      questions: [
        {
          id: "0",
          header: "回答风格",
          question: "请选择回答风格",
          options: [{ label: "简洁" }, { label: "详细" }],
        },
      ],
    });
  });

  await expect(page.locator(".mobile-backend-question")).toContainText(
    "请选择回答风格",
  );
  await page.locator('[data-mobile-input-answer="12"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/input/answer"))
    .toBeTruthy();
  expect(
    calls.find((call) => call.pathname === "/input/answer").body,
  ).toMatchObject({
    sessionId: "23",
    userInputId: "12",
  });
});
