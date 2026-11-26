const path = require("node:path");
const { test, expect } = require("@playwright/test");

const loginUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}?mobile=1&auth=1#/login`;
const accountUrl = `file:///${path
  .resolve(__dirname, "..", "index.html")
  .replaceAll("\\", "/")}?mobile=1#/account`;

async function openFreshLogin(page) {
  await page.goto(loginUrl);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator("#mobile-login-gate")).toBeVisible();
  await page.waitForSelector("#mobile-login-gate.is-ready");
}

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});

test("mobile login presents a complete accessible sign-in surface", async ({
  page,
}) => {
  await openFreshLogin(page);

  const gate = page.locator("#mobile-login-gate");
  await expect(
    gate.getByRole("heading", { name: /让灵感，\s*继续发生。/ }),
  ).toBeVisible();
  await expect(
    gate.getByRole("heading", { name: "登录千变" }),
  ).toBeVisible();
  await expect(page.getByLabel("手机号")).toBeVisible();
  await expect(page.getByLabel("验证码")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "进入工作空间" }),
  ).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await expect(page.locator("html")).toHaveClass(/mobile-login-pending/);

  const geometry = await page.evaluate(() => {
    const form = document
      .querySelector(".mobile-auth-form")
      .getBoundingClientRect();
    const submit = document
      .querySelector(".mobile-auth-submit")
      .getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      form: [form.left, form.right],
      submitBottom: submit.bottom,
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.form[0]).toBeGreaterThanOrEqual(0);
  expect(geometry.form[1]).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.submitBottom).toBeLessThanOrEqual(844);

  await page.getByRole("button", { name: "《隐私政策》" }).click();
  await expect(
    page.getByRole("dialog", { name: "隐私政策" }),
  ).toBeVisible();
  await expect(page.locator("#mobile-auth-dialog-copy")).toContainText(
    "你的内容只属于你",
  );
  await page.getByRole("button", { name: "我知道了" }).click();
  await expect(page.locator("#mobile-auth-legal-dialog")).toBeHidden();
});

test("mobile login validates phone, sends code and starts countdown", async ({
  page,
}) => {
  await openFreshLogin(page);

  const sendCode = page.locator('[data-action="mobile-send-sms"]');
  const phone = page.getByLabel("手机号");
  await expect(sendCode).toBeDisabled();
  await phone.fill("1380000");
  await page.getByRole("button", { name: "进入工作空间" }).click();
  await expect(page.locator("#mobile-login-feedback")).toHaveText(
    "请输入有效的 11 位手机号",
  );
  await expect(phone).toHaveAttribute("aria-invalid", "true");

  await phone.fill("13800001234");
  await expect(sendCode).toBeEnabled();
  await sendCode.click();
  await expect(page.locator("#mobile-login-feedback")).toContainText(
    "验证码已发送至 138****1234",
  );
  await expect(sendCode).toBeDisabled();
  await expect(sendCode).toHaveText(/^(60|59)s$/);

  await page.getByLabel("验证码").fill("12");
  await page.getByRole("button", { name: "进入工作空间" }).click();
  await expect(page.locator("#mobile-login-feedback")).toHaveText(
    "请输入收到的 4 到 6 位验证码",
  );
});

test("local mobile login enters the workspace and hydrates the account", async ({
  page,
}) => {
  await openFreshLogin(page);

  await page.getByLabel("手机号").fill("13800001234");
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "进入工作空间" }).click();

  await expect(page.locator("#mobile-auth-success")).toBeVisible();
  await expect(page.locator("#mobile-login-gate")).toBeHidden({
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#\/home$/);
  await expect(page.locator("#chat-input")).toBeVisible();

  const profile = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qianbian-mobile-profile")),
  );
  expect(profile).toMatchObject({
    phone: "13800001234",
    authMethod: "phone-code",
    authMode: "demo",
    loggedIn: true,
  });

  await page.goto(accountUrl);
  await expect(page.locator(".account-profile-name")).toContainText("1234");
  await expect(page.locator(".account-page")).toContainText("138****1234");
});

test("mobile login stays within a compact phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await openFreshLogin(page);

  const geometry = await page.evaluate(() => {
    const form = document
      .querySelector(".mobile-auth-form")
      .getBoundingClientRect();
    const codeInput = document
      .querySelector("#mobile-login-code")
      .getBoundingClientRect();
    const codeButton = document
      .querySelector(".mobile-auth-code-button")
      .getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      formLeft: form.left,
      formRight: form.right,
      codeInputRight: codeInput.right,
      codeButtonLeft: codeButton.left,
      codeButtonRight: codeButton.right,
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.formLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.formRight).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.codeInputRight).toBeLessThanOrEqual(
    geometry.codeButtonLeft,
  );
  expect(geometry.codeButtonRight).toBeLessThanOrEqual(geometry.formRight);
});
