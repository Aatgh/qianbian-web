const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  reporter: "line",
  // 前端用例有少量依赖动画/时序；限制并发并重试，避免全量跑闪失败
  workers: 2,
  retries: 2,
  expect: { timeout: 10000 },
  use: {
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      // 不要写死某一台机器的用户目录；PLAYWRIGHT_CHROME 可覆盖
      executablePath:
        process.env.PLAYWRIGHT_CHROME ||
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    },
  },
});
