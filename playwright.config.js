const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  reporter: "line",
  use: {
    headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      // 不要写死某一台机器的用户目录；PLAYWRIGHT_CHROME 可覆盖
      executablePath:
        process.env.PLAYWRIGHT_CHROME ||
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    },
  },
});
