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

test("device task utils maps the bridge snake case task shape", async ({
  page,
}) => {
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
    const task = utils.normalizeTasks(
      [
        {
          id: 1,
          type: "fs.list",
          payload_json: '{"path":"C:/Users/me/Desktop"}',
          status: "done",
          result_json: '{"count":3}',
          error: null,
          create_time: "2026-11-25T10:20:00+08:00",
          started_at: "2026-11-25T10:20:01+08:00",
          finished_at: "2026-11-25T10:20:03.500+08:00",
        },
      ],
      "7",
    )[0];
    return {
      ...task,
      duration: utils.formatDuration(task),
    };
  });

  expect(result).toMatchObject({
    id: "1",
    deviceId: "7",
    type: "fs.list",
    typeLabel: "列目录",
    statusLabel: "已完成",
    payload: { path: "C:/Users/me/Desktop" },
    result: { count: 3 },
    createdAt: "2026-11-25T10:20:00+08:00",
    startedAt: "2026-11-25T10:20:01+08:00",
    completedAt: "2026-11-25T10:20:03.500+08:00",
    duration: "2.5s",
  });
});
