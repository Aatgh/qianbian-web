const path = require("node:path");
const { test, expect } = require("@playwright/test");

const mobileUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}#/home`;

test.use({
  viewport: { width: 393, height: 852 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
});

async function holdTouch(page, moves = []) {
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 196, y: 320, radiusX: 2, radiusY: 2, force: 1, id: 1 },
    ],
  });
  await page.waitForTimeout(650);
  for (const [x, y] of moves) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 },
      ],
    });
    await page.waitForTimeout(80);
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(300);
}

test("long press with small finger drift does not open side panels", async ({
  page,
}) => {
  await page.goto(mobileUrl);
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);

  await holdTouch(page, [
    [214, 321],
    [198, 321],
    [214, 322],
  ]);

  await expect(page.locator(".main-nav-screen")).toHaveCount(0);
  await expect(page.locator(".history-screen")).toHaveCount(0);
});

test("long press does not leave the mobile interface text-selected", async ({
  page,
}) => {
  await page.goto(mobileUrl);
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);

  await holdTouch(page);

  const selection = await page.evaluate(() => ({
    ranges: window.getSelection()?.rangeCount || 0,
    text: window.getSelection()?.toString() || "",
  }));
  expect(selection).toEqual({ ranges: 0, text: "" });
});

test("fast horizontal swipe still opens history", async ({ page }) => {
  await page.goto(mobileUrl);
  await page.waitForFunction(() => window.__qianbianMobileBackend?.ready);

  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 196, y: 420, radiusX: 2, radiusY: 2, force: 1, id: 1 },
    ],
  });
  await page.waitForTimeout(50);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: 312, y: 422, radiusX: 2, radiusY: 2, force: 1, id: 1 },
    ],
  });
  await page.waitForTimeout(50);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(320);

  await expect(page.locator(".history-screen")).toHaveCount(1);
});
