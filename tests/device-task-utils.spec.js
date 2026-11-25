const path = require("node:path");
const { test, expect } = require("@playwright/test");

const scriptPath = path.resolve(__dirname, "..", "device-tasks.js");

test("device task utils covers the extended file tool set", async ({ page }) => {
  await page.route("http://frontend.test/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body></body></html>",
    }),
  );
  await page.goto("http://frontend.test/");
  await page.addScriptTag({ path: scriptPath });

  const result = await page.evaluate(() => {
    const utils = window.QianbianDeviceTasks;
    return ["fs.edit", "fs.delete", "fs.grep"].map((type) => {
      const task = utils.normalizeTask({ type, status: "running" });
      return {
        type,
        label: task.typeLabel,
        icon: utils.iconName(type),
      };
    });
  });

  expect(result).toEqual([
    { type: "fs.edit", label: "编辑文件", icon: "file-code-2" },
    { type: "fs.delete", label: "删除文件", icon: "trash-2" },
    { type: "fs.grep", label: "搜索文件", icon: "search" },
  ]);
});
