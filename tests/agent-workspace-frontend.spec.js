const path = require("node:path");
const { test, expect } = require("@playwright/test");

const backendApi = "http://backend.test/api";
const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}?api=${encodeURIComponent(backendApi)}`;
const mobileUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}?mobile=1&api=${encodeURIComponent(backendApi)}#/home`;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type",
};

const widgets = [
  {
    id: 101,
    slot: "sidebar",
    kind: "feed",
    title: "最近动态",
    icon: "newspaper",
    sortOrder: 1,
    enabled: true,
    status: "active",
    version: 1,
    config: { source: { refreshMinutes: 0 } },
  },
  {
    id: 102,
    slot: "sidebar",
    kind: "feed",
    title: "失败数据",
    icon: "cloud-alert",
    sortOrder: 2,
    enabled: true,
    status: "active",
    version: 1,
    config: { source: { refreshMinutes: 0 } },
  },
  {
    id: 103,
    slot: "sidebar",
    kind: "feed",
    title: "空数据",
    icon: "inbox",
    sortOrder: 3,
    enabled: true,
    status: "active",
    version: 1,
    config: { source: { refreshMinutes: 0 } },
  },
  {
    id: 104,
    slot: "sidebar",
    kind: "iframe",
    title: "暂不支持",
    icon: "panels-top-left",
    sortOrder: 4,
    enabled: true,
    status: "active",
    version: 1,
    config: {},
  },
];

async function mockAgentWorkspace(page) {
  const calls = {
    ui: 0,
    data: new Map(),
  };
  await page.route("http://backend.test/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api/, "");
    const headers = {
      ...corsHeaders,
      "content-type": "application/json",
    };
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }
    if (pathname === "/events") {
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "text/event-stream" },
        body: "",
      });
    }
    if (pathname === "/health") {
      return route.fulfill({ headers, json: { status: "ok" } });
    }
    if (pathname === "/ui") {
      calls.ui += 1;
      return route.fulfill({ headers, json: { widgets } });
    }
    if (pathname === "/ui/widgets/101/data") {
      calls.data.set(101, (calls.data.get(101) || 0) + 1);
      await new Promise((resolve) => setTimeout(resolve, 120));
      return route.fulfill({
        headers,
        json: {
          widgetId: 101,
          updatedAt: "2026-11-26T11:30:00+08:00",
          stale: false,
          error: null,
          items: [
            {
              id: "item-1",
              title: "第一条通用动态",
              url: "https://example.com/one",
              summary: "通用 feed 的第一条摘要",
              publishedAt: "2026-11-26T10:00:00+08:00",
              source: "示例来源",
            },
            {
              id: "item-2",
              title: "第二条通用动态",
              url: "https://example.com/two",
              summary: "通用 feed 的第二条摘要",
              publishedAt: "2026-11-26T09:00:00+08:00",
              source: "示例来源",
            },
          ],
        },
      });
    }
    if (pathname === "/ui/widgets/102/data") {
      calls.data.set(102, (calls.data.get(102) || 0) + 1);
      return route.fulfill({
        headers,
        json: {
          widgetId: 102,
          stale: true,
          error: "数据源暂时不可用",
          items: [],
        },
      });
    }
    if (pathname === "/ui/widgets/103/data") {
      calls.data.set(103, (calls.data.get(103) || 0) + 1);
      return route.fulfill({
        headers,
        json: {
          widgetId: 103,
          stale: false,
          error: null,
          items: [],
        },
      });
    }
    if (pathname === "/sessions") {
      return route.fulfill({
        headers,
        json: { sessions: [], nextCursor: null },
      });
    }
    if (pathname === "/models") {
      return route.fulfill({
        headers,
        json: {
          models: [
            { modelId: "2", label: "Test Model", isDefault: true },
          ],
        },
      });
    }
    if (pathname === "/skills" || pathname === "/skills/mine") {
      return route.fulfill({ headers, json: { skills: [] } });
    }
    if (pathname === "/affinity") {
      return route.fulfill({ headers, json: { score: 20 } });
    }
    return route.fulfill({ headers, json: {} });
  });
  return calls;
}

async function unlockDesktop(page) {
  await page.evaluate(() => {
    localStorage.setItem("qianbian-desktop-auth", "true");
    document.getElementById("login-gate").hidden = true;
    document.body.classList.remove("login-locked");
    document.documentElement.classList.remove("login-pending");
    const shell = document.getElementById("app-shell");
    shell.inert = false;
    shell.removeAttribute("aria-hidden");
  });
}

test("desktop renders generic agent workspace widgets and feed states", async ({
  page,
}) => {
  const calls = await mockAgentWorkspace(page);
  await page.goto(desktopUrl);
  await unlockDesktop(page);

  const host = page.locator("#desktop-ui-widget-host");
  await expect(host.locator("[data-ui-widget-id]")).toHaveCount(4);
  await host.locator('[data-ui-widget-id="101"]').click();

  await expect(page.locator(".ui-widget-loading")).toBeVisible();
  await expect(page.locator(".ui-widget-feed-item")).toHaveCount(2);
  await expect(page.locator(".ui-widget-panel")).toContainText(
    "第一条通用动态",
  );

  const beforeRefresh = calls.data.get(101) || 0;
  await page.locator("[data-ui-widget-refresh]").click();
  await expect.poll(() => calls.data.get(101) || 0).toBeGreaterThan(
    beforeRefresh,
  );

  await page.locator("[data-close-rail-dialog]").first().click();
  await host.locator('[data-ui-widget-id="102"]').click();
  await expect(page.locator(".ui-widget-error")).toContainText(
    "数据源暂时不可用",
  );
  const beforeRetry = calls.data.get(102) || 0;
  await page.locator("[data-ui-widget-retry]").click();
  await expect.poll(() => calls.data.get(102) || 0).toBeGreaterThan(
    beforeRetry,
  );

  await page.locator("[data-close-rail-dialog]").first().click();
  await host.locator('[data-ui-widget-id="103"]').click();
  await expect(page.locator(".ui-widget-empty")).toBeVisible();

  await page.locator("[data-close-rail-dialog]").first().click();
  await host.locator('[data-ui-widget-id="104"]').click();
  await expect(page.locator(".ui-widget-unsupported")).toContainText(
    "暂不支持的类型",
  );

  const beforeTurnRefresh = calls.ui;
  await page.evaluate(() => {
    window.__qianbianBackend.handleEvent("turn/completed", {
      turnId: "widget-refresh-turn",
    });
  });
  await expect.poll(() => calls.ui).toBeGreaterThan(beforeTurnRefresh);
});

test("mobile renders generic widget navigation in a full-screen drawer", async ({
  page,
}) => {
  const calls = await mockAgentWorkspace(page);
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto(mobileUrl);
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);
  await page
    .locator('.conversation-nav-action[data-action="open-main-nav"]')
    .click();

  const host = page.locator("#mobile-ui-widget-host");
  await expect(host.locator("[data-ui-widget-id]")).toHaveCount(4);
  await host.locator('[data-ui-widget-id="101"]').click();

  await expect(page.locator(".mobile-ui-widget-layer")).toBeVisible();
  await expect(page.locator(".ui-widget-feed-item")).toHaveCount(2);
  const beforeRefresh = calls.data.get(101) || 0;
  await page.locator("[data-ui-widget-refresh]").click();
  await expect.poll(() => calls.data.get(101) || 0).toBeGreaterThan(
    beforeRefresh,
  );

  await page.locator("[data-close-ui-widget]").click();
  await expect(page.locator(".mobile-ui-widget-layer")).toHaveCount(0);
  await page
    .locator('.conversation-nav-action[data-action="open-main-nav"]')
    .click();
  await host.locator('[data-ui-widget-id="102"]').click();
  await expect(page.locator(".ui-widget-error")).toContainText(
    "数据源暂时不可用",
  );
  await expect(page.locator("[data-ui-widget-retry]")).toBeVisible();
});
