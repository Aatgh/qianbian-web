const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const origin = "http://qianbian.test";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function localFileFor(pathname) {
  const rel = pathname.replace(/^\/+/, "") || "index.html";
  const file = path.join(root, rel);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    return null;
  }
  return file;
}

test("anonymous mobile load shows the login gate and never calls user APIs", async ({
  page,
}) => {
  const calls = [];
  let loggedIn = false;

  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) {
      calls.push({ pathname: url.pathname, method: route.request().method() });
      if (url.pathname === "/api/auth/me") {
        return loggedIn
          ? route.fulfill({
              json: { ok: true, user: { id: 3, phone: "13800000001" } },
            })
          : route.fulfill({ status: 401, json: { error: "请先登录" } });
      }
      if (url.pathname === "/api/health") {
        return route.fulfill({ json: { ok: true } });
      }
      if (url.pathname === "/api/sessions") {
        return route.fulfill({ json: { sessions: [] } });
      }
      return route.fulfill({ json: {} });
    }
    const file = localFileFor(url.pathname);
    if (!file) return route.fulfill({ status: 404, body: "not found" });
    return route.fulfill({
      path: file,
      contentType: contentTypes[path.extname(file)] || "application/octet-stream",
    });
  });

  await page.goto(`${origin}/index.html?mobile=1&auth=1#/login`);
  await expect(page.locator("#mobile-login-gate")).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await page.waitForTimeout(600);

  const userPaths = calls
    .map((call) => call.pathname)
    .filter((pathname) => !["/api/auth/me", "/api/health"].includes(pathname));
  expect(userPaths).toEqual([]);
  expect(
    calls.filter((call) => call.pathname === "/api/auth/me").length,
  ).toBeLessThanOrEqual(1);

  // 登录成功后只初始化一次后端
  loggedIn = true;
  await page.evaluate(() => {
    localStorage.setItem("qianbian-mobile-auth", "true");
    localStorage.setItem(
      "qianbian-mobile-profile",
      JSON.stringify({ loggedIn: true, phone: "13800000001" }),
    );
    window.dispatchEvent(
      new CustomEvent("qianbian:mobile-auth-success", { detail: {} }),
    );
  });
  await expect
    .poll(() => calls.filter((call) => call.pathname === "/api/sessions").length)
    .toBe(1);
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("qianbian:mobile-auth-success", { detail: {} }),
    );
  });
  await page.waitForTimeout(400);
  expect(
    calls.filter((call) => call.pathname === "/api/sessions").length,
  ).toBe(1);
});
