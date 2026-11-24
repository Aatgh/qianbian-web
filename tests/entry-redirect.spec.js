const path = require("node:path");
const { test, expect } = require("@playwright/test");

const rootUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}`;
const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}`;

test("wide fine-pointer desktop entry redirects to desktop.html", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  });
  const page = await context.newPage();
  await page.goto(rootUrl);
  await expect(page).toHaveURL(/desktop\.html(?:[?#]|$)/);
  expect(await page.evaluate(() => Boolean(window.__entryRedirectRan))).toBe(
    true,
  );
  await context.close();
});

test("1024px desktop viewport stays on mobile page", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: false,
  });
  const page = await context.newPage();
  await page.goto(rootUrl);
  await expect(page).toHaveURL(/index\.html(?:[?#]|$)/);
  await context.close();
});

test("wide touch device stays on mobile page", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(rootUrl);
  await expect(page).toHaveURL(/index\.html(?:[?#]|$)/);
  await context.close();
});

test("390px phone stays on mobile page", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(rootUrl);
  await expect(page).toHaveURL(/index\.html(?:[?#]|$)/);
  await context.close();
});

test("?mobile=1 forces mobile and remembers the choice", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  });
  const page = await context.newPage();
  await page.goto(`${rootUrl}?mobile=1`);
  await expect(page).toHaveURL(/index\.html\?mobile=1(?:#|$)/);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("qianbian-view-preference"),
    ),
  ).toBe("mobile");
  await context.close();
});

test("remembered mobile preference prevents desktop redirect", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  });
  await context.addInitScript(() => {
    localStorage.setItem("qianbian-view-preference", "mobile");
  });
  const page = await context.newPage();
  await page.goto(rootUrl);
  await expect(page).toHaveURL(/index\.html(?:[?#]|$)/);
  await context.close();
});

test("mobile entry can switch to desktop and remember preference", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(`${rootUrl}?mobile=1#/account`);
  await page.locator('[data-action="open-desktop-version"]').click();
  await expect(page).toHaveURL(/desktop\.html(?:[?#]|$)/);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("qianbian-view-preference"),
    ),
  ).toBe("desktop");
  await context.close();
});

test("desktop account menu can switch to mobile and remember preference", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  });
  const page = await context.newPage();
  await page.goto(desktopUrl);
  await page.waitForSelector("#login-gate", { state: "attached" });
  await page.evaluate(() => {
    localStorage.setItem("qianbian-desktop-auth", "true");
    const gate = document.getElementById("login-gate");
    if (gate) gate.hidden = true;
    document.body.classList.remove("login-locked");
    document.documentElement.classList.remove("login-pending");
    const shell = document.getElementById("app-shell");
    if (shell) {
      shell.inert = false;
      shell.removeAttribute("aria-hidden");
    }
  });
  await page.locator("#account-menu-button").click();
  await page.locator('[data-action="open-mobile-version"]').click();
  await expect(page).toHaveURL(/index\.html\?mobile=1(?:#|$)/);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("qianbian-view-preference"),
    ),
  ).toBe("mobile");
  await context.close();
});
