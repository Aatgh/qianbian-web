const path = require("node:path");
const { test, expect } = require("@playwright/test");

const desktopUrl = `file:///${path
  .resolve(__dirname, "..", "desktop.html")
  .replaceAll("\\", "/")}?api=${encodeURIComponent(
  "http://backend.test/api",
)}&debug=1`;

async function unlockDesktop(page) {
  await page
    .waitForSelector("#login-gate.is-ready", {
      state: "attached",
      timeout: 5000,
    })
    .catch(() => {});
  await page.evaluate(() => {
    localStorage.setItem("qianbian-desktop-auth", "true");
    document.getElementById("login-gate").hidden = true;
    document.body.classList.remove("login-locked");
    document.documentElement.classList.remove("login-pending");
    const shell = document.getElementById("app-shell");
    shell.inert = false;
    shell.removeAttribute("aria-hidden");
  });
  await page.waitForFunction(
    () =>
      getComputedStyle(document.getElementById("app-shell")).visibility !==
      "hidden",
  );
}

test("opening skill market keeps custom reminders and memories", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("qianbian-desktop-auth", "true");
    localStorage.setItem(
      "qianbian-desktop-account-profile",
      JSON.stringify({ loggedIn: true }),
    );
    localStorage.setItem(
      "qianbian-desktop-custom-reminders",
      JSON.stringify([
        {
          id: "regression-reminder",
          title: "回归测试提醒",
          description: "不应被技能市场清空",
          time: "每天 09:00",
          cadence: "每天",
          enabled: true,
          icon: "alarm-clock",
        },
      ]),
    );
  });
  await page.goto(desktopUrl);
  await unlockDesktop(page);

  expect(
    await page.evaluate(
      () => window.__qianbianDebug.getState().customReminders.length,
    ),
  ).toBe(1);

  // 用 document 级委托触发真实的技能市场入口，不依赖按钮当前是否可见
  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.dataset.openSkillMarket = "";
    document.body.appendChild(trigger);
    trigger.click();
  });
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => ({
    reminders: window.__qianbianDebug.getState().customReminders.length,
    memories: window.__qianbianDebug.getState().customMemories.length,
  }));
  expect(state.reminders).toBe(1);
  expect(state.memories).toBe(0);
});

test("adding a skill package does not throw ReferenceError", async ({
  page,
}) => {
  await page.goto(desktopUrl);
  await unlockDesktop(page);

  const result = await page.evaluate(() => {
    try {
      const file = new File(["# skill"], "test-skill.md", {
        type: "text/markdown",
      });
      window.__qianbianDebug.setDesktopPublishPackage(file);
      return {
        error: null,
        name: window.__qianbianDebug.getState().desktopPublishDraft
          .packageName,
      };
    } catch (error) {
      return { error: error.message, name: null };
    }
  });

  expect(result.error).toBeNull();
  expect(result.name).toBe("test-skill.md");
});
