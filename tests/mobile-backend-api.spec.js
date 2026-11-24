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

async function mockBackend(page, calls, options = {}) {
  const sessions = options.sessions || [
    {
      sessionId: "23",
      title: "今天的天气",
      updatedAt: "2026-11-23T11:13:55.000+08:00",
    },
  ];
  const resumeItems = options.resumeItems || [
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
        json: { sessions },
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
            items: resumeItems,
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
  await page
    .locator('[data-action="close-history"]')
    .dispatchEvent("click");
  await expect(page.locator(".history-screen")).toHaveCount(0);

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

  await page.locator('[data-action="open-history"]').click();
  await page.locator('[data-session-id="23"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/session/resume"))
    .toBeTruthy();
  await expect(
    page.locator(".mobile-backend-approval"),
  ).toHaveCount(0);

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

test("mobile does not show demo sessions when backend returns none", async ({
  page,
}) => {
  const calls = [];
  await mockBackend(page, calls, { sessions: [] });
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  await page.locator('[data-action="open-history"]').click();
  await expect(page.locator(".history-session")).toHaveCount(0);
  await expect(page.locator("#history-empty")).toBeVisible();
});

test("mobile page fills the real viewport without simulator chrome", async ({
  page,
}) => {
  const calls = [];
  await page.setViewportSize({ width: 390, height: 844 });
  await mockBackend(page, calls, { sessions: [] });
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  const layout = await page.evaluate(() => {
    const screen = document
      .querySelector("#phone-screen")
      .getBoundingClientRect();
    const fit = document.querySelector("#phone-fit").getBoundingClientRect();
    const bezel = getComputedStyle(document.querySelector(".phone-bezel"));
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      fit: {
        left: fit.left,
        top: fit.top,
        width: fit.width,
        height: fit.height,
      },
      screen: {
        left: screen.left,
        top: screen.top,
        width: screen.width,
        height: screen.height,
      },
      bezel: {
        padding: bezel.padding,
        borderWidth: bezel.borderWidth,
        borderRadius: bezel.borderRadius,
      },
      speaker: getComputedStyle(
        document.querySelector(".phone-speaker"),
      ).display,
      homeIndicator: getComputedStyle(
        document.querySelector(".home-indicator"),
      ).display,
      statusBar: getComputedStyle(
        document.querySelector(".phone-statusbar"),
      ).display,
    };
  });

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport.width);
  expect(layout.fit).toMatchObject({
    left: 0,
    top: 0,
    width: layout.viewport.width,
    height: layout.viewport.height,
  });
  expect(layout.screen).toMatchObject({
    left: 0,
    top: 0,
    width: layout.viewport.width,
    height: layout.viewport.height,
  });
  expect(layout.bezel).toMatchObject({
    padding: "0px",
    borderWidth: "0px",
    borderRadius: "0px",
  });
  expect(layout.speaker).toBe("none");
  expect(layout.homeIndicator).toBe("none");
  expect(layout.statusBar).toBe("none");
});

test("mobile formats backend markdown without allowing unsafe html", async ({
  page,
}) => {
  const calls = [];
  await mockBackend(page, calls);
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  await page.locator('[data-action="open-history"]').click();
  await page.locator('[data-session-id="23"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/session/resume"))
    .toBeTruthy();

  await page.evaluate(() => {
    window.__qianbianMobileBackend.handleEvent("item/completed", {
      item: {
        itemId: "markdown-answer",
        kind: "agentMessage",
        status: "completed",
        done: true,
        text: `哈尔滨今天天气：

**温度**：-10～-6℃
**天气**：多云

- 穿羽绒服
- 注意路面结冰

[危险链接](javascript:alert(1))
<script>window.__markdownHacked = true</script>`,
      },
    });
  });

  const answer = page.locator(".assistant-message").last();
  await expect(answer.locator(".assistant-text strong").first()).toHaveText(
    "温度",
  );
  await expect(answer.locator("li")).toHaveCount(2);
  await expect(answer).not.toContainText("**");
  await expect(answer.locator("script")).toHaveCount(0);
  expect(await page.evaluate(() => window.__markdownHacked)).toBeUndefined();
  const unsafeHref = await answer
    .locator("a[href]")
    .evaluateAll((links) =>
      links.some((link) => /^javascript:/i.test(link.getAttribute("href"))),
    );
  expect(unsafeHref).toBe(false);
});

test("mobile groups tool activity by turn above assistant replies", async ({
  page,
}) => {
  const calls = [];
  await mockBackend(page, calls, { resumeItems: [] });
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  await page.locator('[data-action="open-history"]').click();
  await page.locator('[data-session-id="23"]').click();
  await expect
    .poll(() => calls.find((call) => call.pathname === "/session/resume"))
    .toBeTruthy();

  await page.evaluate(() => {
    const handle = window.__qianbianMobileBackend.handleEvent;
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
    [...document.querySelectorAll("#chat-messages .backend-activity, #chat-messages .assistant-message")].map(
      (node) => ({
        activity: node.classList.contains("backend-activity"),
        text: node.textContent.replace(/\s+/g, " ").trim(),
      }),
    ),
  );
  expect(order).toHaveLength(4);
  expect(order[0]).toMatchObject({ activity: true });
  expect(order[1]).toMatchObject({ activity: false });
  expect(order[1].text).toContain("怀化明天小雨。");
  expect(order[2]).toMatchObject({ activity: true });
  expect(order[3]).toMatchObject({ activity: false });
  expect(order[3].text).toContain("这次天气工具没有返回结果。");

  await activities.nth(0).locator("summary").click();
  await expect(activities.nth(0)).toContainText("local_weather");
  await expect(activities.nth(0)).toContainText("怀化 9°C 小雨");
  await expect(page.locator(".tool-card")).toHaveCount(0);
});

test("composer input has no colored focus outline", async ({ page }) => {
  await page.goto(mobileUrl);
  await waitForMobileBackend(page);

  const input = page.locator("#chat-input");
  await input.focus();
  const focusStyle = await input.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      focusVisible: element.matches(":focus-visible"),
      outlineStyle: style.outlineStyle,
    };
  });

  expect(focusStyle).toEqual({
    focusVisible: true,
    outlineStyle: "none",
  });
});
