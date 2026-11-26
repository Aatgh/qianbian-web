# Agent 工作区执行计划（2026-11-26 修正版）

> **方向修正**：不做「新闻模块」「小说模块」这种分类功能，做**平台原语**。服务器上的千变 Agent 在运行时按每个用户的请求组合原语；新闻只是第一个 `feed` 示例。
>
> 本文是执行计划，前端请按 **F0 → F1 → F2** 执行；后端按 **B0 → B1 → B2** 执行。设计细节见 `agent-workspace-extension.md`，冲突时以本文为准。

## 0. P0 验收场景

用户 A 对 Agent 说：「在左边加一个最近新闻的按钮。」

1. Agent 调 `ui_add_widget`，审批卡显示「在左侧新增『最近新闻』模块（feed，中国新闻网 RSS，30 分钟刷新）」。
2. A 允许后，左侧出现按钮；点开是新闻列表。
3. 用户 B 登录：左侧**没有**这个按钮，也无法通过接口读到 A 的模块或数据。
4. A 让 Agent 删除，按钮消失，审计里有记录。

新闻 / 小说 / 技术资讯都走同一个 `feed` 原语；H5 游戏这类自定义界面走 P1 的沙箱 iframe，不由我们逐个写分类。

## 1. 平台原语

| 原语 | 作用 | 谁实现 |
|---|---|---|
| widget schema + CRUD | 每个用户自己的侧边栏/面板配置 | 后端（已完成） |
| 通用 feed 数据代理 | Agent 给一个 RSS/Atom/JSON 地址，后端抓取、解析、缓存、返回统一结构 | 后端 B0 |
| 通用渲染器 | 侧边栏扩展位、feed/markdown/table 列表、错误态、刷新 | 前端 F0 |
| 沙箱 iframe + 资产存储 | Agent 运行时写 HTML/JS，跑在独立子域，拿不到宿主 Cookie | 后端 B1 + 前端 F1 |
| 定时任务 | 定时刷新数据 / 定时触发 Agent（受限工具） | 后端 B2 + 前端 F2 |
| 审批、审计、用户隔离 | 所有写操作走现有 approval，按 `user_id` 查询/推送 | 后端（已完成/持续） |

## 2. 后端计划（我们）

### B0：通用 feed + 数据接口（0.5–1 天，优先级最高）

**接口**

```http
GET /app/ui/widgets/{id}/data
```

- 只允许模块所属用户访问；越权返回「模块不存在或已删除」。
- 读取 widget 的 `config.source`：

```json
{
  "source": {
    "type": "feed",
    "url": "https://www.chinanews.com.cn/rss/scroll-news.xml",
    "format": "rss",
    "limit": 20,
    "refreshMinutes": 30
  }
}
```

- `format`：`rss` / `atom`（B0），`json`（B0.5，带 `itemsPath` 和字段映射）。
- 安全：只允许 `http/https`；解析前拒绝私网/回环/链路本地地址；禁止重定向到私网；超时 8 秒；响应最大 1MB；单用户每分钟最多 10 次外部抓取。
- 缓存：按 `widgetId + url` 缓存 `refreshMinutes`（默认 30 分钟），命中直接返回。
- 解析后统一结构（最多 `limit` 条，默认 20）：

```json
{
  "widgetId": 1,
  "updatedAt": "2026-11-26T11:30:00+08:00",
  "stale": false,
  "items": [
    {
      "id": "https://www.chinanews.com.cn/...",
      "title": "标题",
      "url": "https://www.chinanews.com.cn/...",
      "summary": "摘要（纯文本，去 HTML）",
      "publishedAt": "2026-11-26T10:00:00+08:00",
      "source": "中国新闻网"
    }
  ],
  "error": null
}
```

- 源失败：HTTP 200，`items: []`、`stale: true`、`error: "数据源暂时不可用"`；前端显示可重试错误态，不显示空白、不透传堆栈。
- 默认示例源：中国新闻网即时新闻 RSS（已实测生产可达）；`QB_UI_NEWS_RSS` 可覆盖。RSS 商用合规由产品/法务确认，换有授权的 API 时前端契约不变。

**bridge**

```http
GET    /api/ui
POST   /api/ui/widgets
PATCH  /api/ui/widgets/{id}
DELETE /api/ui/widgets/{id}
GET    /api/ui/widgets/{id}/data
```

全部要求登录 Cookie；CRUD 走 `requireUser`；数据接口只允许本人。

**Agent 工具**

- 已有：`ui_list_widgets`、`ui_add_widget`（WRITE，审批）、`ui_remove_widget`（DESTRUCTIVE，审批）。
- `ui_add_widget` 的 `config.source` 支持任意 `feed` 地址；审批卡展示 URL 和标题，用户点允许即视为同意抓取该域名。
- 工具开关 `qb.ui.agent-tools.enabled`：联调前保持 false；P0 验收前打开（只对测试账号，后续全量）。

**测试**

- A 建 feed 模块 → 数据接口返回条目；B 访问同一 widgetId → 拒绝。
- 缓存命中（第二次不打源站）；源超时/404 → `stale:true` + `error`。
- 私网 URL / 重定向到 127.0.0.1 → 拒绝。
- 生产服务器能拉取默认 RSS（已测 HTTP 200）。

### B1：沙箱资产（1–2 天）

- 新表 `qb_ui_asset`：`id, user_id, widget_id, content, version, size, create_time`，单文件 ≤ 256KB，每用户 ≤ 10MB。
- 接口：`POST /app/ui/widgets/{id}/asset`（写 HTML/JS，审批）、`GET /public/ui-assets/{id}/{version}`（无 Cookie、`text/html`、严格 CSP）。
- 子域：`widget.agiqianbian.com`，独立证书，nginx 只服务资产接口；`X-Frame-Options: ALLOW-FROM` 不适用，用 CSP `frame-ancestors https://agiqianbian.com`。
- Agent 工具 `ui_write_asset`（WRITE，审批），生成 `kind=iframe` 的 widget。
- 安全：沙箱页 `sandbox="allow-scripts"`，**不给** `allow-same-origin`；不能读宿主 Cookie/localStorage；所有数据由宿主 `postMessage` 传入。

### B2：定时任务（2–3 天）

- 表 `qb_schedule`（设计见扩展文档第 3.3 节）；接口 `GET/POST/PATCH/DELETE /app/automations`（bridge 已在前端调用，目前返回空数组）。
- 第一阶段只做 `widget_refresh`：定时刷新 feed 缓存，不消耗大模型 token。
- 第二阶段 `agent_prompt`：以用户身份跑一轮 Agent；默认只允许 READ/INTERNAL 工具，写操作需用户预先授权；每日次数、静默时段、失败重试、审计。
- 结果写入站内通知或指定会话。

## 3. 前端计划

### F0：通用渲染器（1 个前端迭代）

1. `desktop-api.js` 增加：

   ```js
   ui(signal) { return request("/ui", { signal }); }
   uiData(widgetId, signal) {
     return request(`/ui/widgets/${encodeURIComponent(widgetId)}/data`, { signal });
   }
   ```

2. 启动时拉 `GET /api/ui`，在左侧导航插入 `slot=sidebar` 的模块；点击打开面板。
3. `feed` 渲染器：
   - 列表项：标题、来源、发布时间、摘要；
   - 点击用外部链接打开；
   - 加载中 / 空态 / 错误态（`error` 字段 + 重试按钮）；
   - 打开时拉一次数据，之后按 `refreshMinutes` 刷新（页面隐藏时暂停）；
   - 手动刷新按钮。
4. 不支持的 `kind` 显示占位卡「暂不支持的类型」，不能报错或白屏。
5. 每轮 `turn/completed` 后重新拉 `GET /api/ui`（Agent 后台创建的模块没有 `ui` SSE 事件）。
6. PATCH 版本冲突按 `msg/error` 提示「模块已被修改，请刷新后重试」。
7. 移动端：全屏抽屉、滚动容器、安全区适配；不复用桌面右栏布局。
8. Playwright：mock `/api/ui` 和 data，覆盖加载/空/错误/重试/刷新；不依赖真实新闻源。

### F1：沙箱 iframe（1 个前端迭代，依赖 B1）

1. `kind=iframe` 的 widget：`<iframe src="https://widget.agiqianbian.com/p/{id}/{version}" sandbox="allow-scripts" referrerpolicy="no-referrer">`。
2. 宿主 → 沙箱：

   ```js
   iframe.contentWindow.postMessage({ type: "qb/init", payload: { theme, locale, data } }, "https://widget.agiqianbian.com");
   ```

3. 沙箱 → 宿主：
   - `{type:"qb/ready"}`：可以开始传数据；
   - `{type:"qb/open", url}`：宿主校验 `http/https` 后新窗口打开；
   - `{type:"qb/resize", height}`：宿主动态调整 iframe 高度。
4. 宿主校验 `event.origin === "https://widget.agiqianbian.com"`；不把 Cookie/会话 token 传给沙箱。
5. CSP：`frame-src https://widget.agiqianbian.com`；沙箱侧 `default-src 'none'`，只允许内联脚本/样式和图片。
6. 错误/超时：5 秒没收到 `qb/ready` 显示「模块加载失败 + 重试」。

### F2：定时任务界面（依赖 B2）

1. 使用现有 `/api/automations` 接口，列表展示名称、cron、下次执行、状态、上次结果。
2. 创建/编辑/暂停/删除；`widget_refresh` 选择已有 widget；`agent_prompt` 输入指令并选择目标会话。
3. 明确提示「定时任务会在你不在线时执行」，敏感操作默认关闭。

## 4. 时间线（建议）

| 时间 | 后端 | 前端 |
|---|---|---|
| 11-26 ~ 11-27 | B0：通用 feed + data 接口 + bridge 部署 | F0 开始：侧边栏 + feed 渲染器 |
| 11-27 ~ 11-28 | B0 联调、生产部署（工具先关） | F0 完成，mock 测试通过 |
| 11-28 | 打开测试账号的 Agent 工具开关 | 与后端联调 P0 验收场景 |
| 11-29 ~ 11-30 | B1：资产表 + 沙箱子域 | F1：iframe 宿主 + postMessage |
| 12-01 ~ 12-02 | B1 部署 | F1 联调 |
| 12-02 ~ 12-03 | B2：调度器 + `/app/automations` | F2：任务界面 |

前端迭代长度未知，以上是依赖顺序建议，日期可平移；**F0 不依赖 B1/B2，可以立即开始**。

## 5. 安全与合规

- 所有表带 `user_id`，所有查询按当前登录用户过滤；SSE 已按用户隔离。
- 写操作走现有 approval；每次变更写 `qb_ui_audit`。
- feed 抓取：只允许公网 http/https，拒绝私网/回环/链路本地、重定向到私网、非 80/443 端口；超时、大小限制、缓存、单用户频率限制。
- RSS/新闻内容商用前需产品/法务确认；平台可随时换成有授权的 API，不改前端契约。
- 沙箱 iframe 独立 origin、无宿主 Cookie、严格 CSP；Agent 生成的 JavaScript 只能在沙箱内运行。
- 版权/平台规则：不抓取盗版小说、不绕过抖音等平台的访问限制；只接官方 API、公开内容或用户自有内容。
- 限额：单用户 20 个模块、10 个定时任务、10MB 沙箱资产；单文件 256KB。

## 6. 验收清单

- [ ] A 建「最近新闻」→ 审批 → 左侧按钮 → 新闻列表；B 完全不可见。
- [ ] 新闻源失败时显示重试，聊天不受影响。
- [ ] A 修改/删除模块，B 无法操作；审计有记录。
- [ ] 移动端全屏抽屉正常。
- [ ] H5 小游戏：Agent 生成沙箱资产 → 左侧按钮 → 打开可玩；宿主 Cookie 不可读。
- [ ] 定时刷新新闻不消耗模型 token；定时 Agent 任务按策略执行并写通知。
- [ ] 桌面和手机各跑一遍 Playwright/手测。

## 7. 边界与沟通

- 前端只实现**通用渲染器和沙箱宿主**，不要按新闻/小说/游戏分类写页面。
- 后端不直接改前端代码；接口/契约变更先更新本文件。
- 桌面连接器 ZIP/签名/发布继续暂停。
- 有疑问在本仓库 `docs/` 或 Issue 里提，不要默默改契约。
