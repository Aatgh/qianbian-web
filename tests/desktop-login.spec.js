const path = require("node:path");
const { test, expect } = require("@playwright/test");

const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}`;

async function openFreshDesktop(page) {
  await page.goto(desktopUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("body");
}

test("first visit shows the premium login gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await expect(gate).toBeVisible();
  await expect(gate.getByRole("heading", { name: "欢迎回来" })).toBeVisible();
  await expect(
    gate.getByRole("button", { name: "使用 Google 继续" }),
  ).toBeVisible();
  await expect(gate.getByLabel("邮箱地址")).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).toHaveAttribute("inert", "");
});

test("google connection animates into the desktop workspace", async ({
  page,
}) => {
  await openFreshDesktop(page);

  await page.getByRole("button", { name: "使用 Google 继续" }).click();
  await expect(page.locator(".login-google-button")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.getByText("正在安全连接 Google")).toBeVisible();
  await expect(page.locator("#login-gate")).toBeHidden({ timeout: 6000 });
  await expect(page.locator("body")).not.toHaveClass(/login-locked/);
  await expect(page.locator("#app-shell")).not.toHaveAttribute("inert", "");
});

test("email validation and password mode switching work", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate.getByRole("button", { name: "使用邮箱继续" }).click();
  await gate.getByLabel("邮箱地址").fill("not-an-email");
  await gate.getByRole("button", { name: "继续" }).click();
  await expect(gate.getByRole("alert")).toContainText("请输入有效的邮箱地址");

  await gate.getByLabel("邮箱地址").fill("hello@qianbian.ai");
  await gate.getByRole("button", { name: "验证码登录" }).click();
  await expect(gate.getByLabel("验证码")).toBeVisible();
  await gate.getByRole("button", { name: "密码登录" }).click();
  await expect(gate.getByLabel("密码")).toBeVisible();
  await expect(gate.getByRole("button", { name: "显示密码" })).toBeVisible();
});

test("successful email login and logout reopen the gate", async ({ page }) => {
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await gate.getByLabel("邮箱地址").fill("hello@qianbian.ai");
  await gate.getByLabel("密码").fill("qianbian-demo");
  await gate.getByRole("button", { name: "登录" }).click();
  await expect(gate).toBeHidden({ timeout: 6000 });

  await page.locator("#account-menu-button").click();
  await page.locator("[data-account-logout]").click();
  await expect(gate).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/login-locked/);
});

test("login gate remains usable on a narrow desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFreshDesktop(page);

  const gate = page.locator("#login-gate");
  await expect(gate).toBeVisible();
  await expect(gate.getByLabel("邮箱地址")).toBeVisible();
  const overflow = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - window.innerWidth,
    vertical: document.documentElement.scrollHeight - window.innerHeight,
  }));
  expect(overflow.horizontal).toBeLessThanOrEqual(1);
  expect(overflow.vertical).toBeLessThanOrEqual(1);
});
