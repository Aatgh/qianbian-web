const path = require("node:path");
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const pageUrl = "http://frontend.test/connectors.html";

function serveStatic(route) {
  const url = new URL(route.request().url());
  const relative =
    url.pathname === "/" ? "connectors.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.resolve(root, relative);
  if (
    !filePath.startsWith(`${root}${path.sep}`) ||
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    return route.fulfill({ status: 404, body: "not found" });
  }
  const contentTypes = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  };
  return route.fulfill({
    path: filePath,
    contentType:
      contentTypes[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream",
  });
}

test("connectors page renders release manifest and fits mobile viewport", async ({
  page,
}) => {
  const releases = [
    {
      platform: "windows",
      channel: "stable",
      version: "0.2.0",
      downloadUrl: "https://downloads.test/windows/Qianbian-Setup-0.2.0.exe",
      fileName: "Qianbian-Setup-0.2.0.exe",
      sha256: "89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
      systemRequirements: "Windows 10 22H2 或更高版本",
      releaseNotes: ["新增设备暂停与恢复", "改进终端审批"],
    },
    {
      platform: "android",
      channel: "stable",
      version: "0.2.0",
      downloadUrl: "https://downloads.test/android/Qianbian-0.2.0.apk",
      fileName: "Qianbian-0.2.0.apk",
      sha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      systemRequirements: "Android 10 或更高版本",
      releaseNotes: ["支持设备状态与任务审批"],
    },
  ];
  await page.route("http://frontend.test/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/connectors/releases") {
      return route.fulfill({ json: { releases } });
    }
    return serveStatic(route);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);

  await expect(page.locator("h1")).toHaveText("千变设备连接");
  const cards = page.locator(".connector-release-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("千变 for Windows");
  await expect(cards.nth(0)).toContainText("0.2.0");
  await expect(cards.nth(0)).toContainText("Windows 10 22H2 或更高版本");
  await expect(cards.nth(0)).toContainText("新增设备暂停与恢复");
  await expect(
    cards.nth(0).locator("[data-download-release]"),
  ).toHaveAttribute(
    "href",
    "https://downloads.test/windows/Qianbian-Setup-0.2.0.exe",
  );
  await expect(cards.nth(1)).toContainText("千变 for Android");
  await expect(cards.nth(1)).toContainText("Android 10 或更高版本");

  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    cards: [...document.querySelectorAll(".connector-release-card")].map(
      (card) => {
        const rect = card.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      },
    ),
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.cards.every((card) => card.left >= 0 && card.right <= layout.viewport))
    .toBe(true);
});

test("connectors page recovers from a manifest error", async ({ page }) => {
  let fail = true;
  await page.route("http://frontend.test/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/connectors/releases") {
      if (fail) {
        return route.fulfill({
          status: 503,
          json: { error: "版本清单暂时不可用" },
        });
      }
      return route.fulfill({
        json: {
          releases: [
            {
              platform: "windows",
              version: "0.2.0",
              downloadUrl: "https://downloads.test/Qianbian.exe",
              systemRequirements: "Windows 10 22H2 或更高版本",
              releaseNotes: [],
            },
          ],
        },
      });
    }
    return serveStatic(route);
  });

  await page.goto(pageUrl);
  await expect(page.locator(".connectors-error")).toContainText(
    "版本清单暂时不可用",
  );
  fail = false;
  await page.locator("[data-retry-releases]").click();
  await expect(page.locator(".connector-release-card")).toHaveCount(1);
});

test("connectors page explains when the release API is not available", async ({
  page,
}) => {
  await page.route("http://frontend.test/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/connectors/releases") {
      return route.fulfill({
        status: 404,
        json: { error: "接口不存在" },
      });
    }
    return serveStatic(route);
  });

  await page.goto(pageUrl);
  await expect(page.locator("[data-release-pending]")).toContainText(
    "安装包版本接口尚未开放",
  );
});
