# Agent 工作区扩展设计（草案 v0.1，2026-11-26）

> 目标：让 Agent 能像改自己的工作台一样，给当前用户新增侧边栏按钮、面板、widget（例如「最近新闻」），并支持定时任务。
>
> 状态：**P0 后端已在本地实现并验证（2026-11-26），尚未部署生产；前端已答复 5 个问题（见第 13 节），等待 codex → main 合并。**
> 前端先看第 7 节「前端契约」和第 12 节「待确认问题」，以及第 5 节末尾的「实现状态」。
>
> 📌 **执行计划以 `agent-workspace-plan-2026-11-26.md` 为准**（2026-11-26 修正：不做新闻/小说等分类功能，做通用 feed + 沙箱原语）。

## 1. 目标与非目标

**目标**

- 用户用自然语言让 Agent 给自己加一个界面模块（按钮 / 面板 / 列表 / 小工具）。
- 模块只影响**当前用户**，不影响其他用户。
- 模块可以有自己的数据源（新闻、天气、待办等），数据由后端统一代理。
- 用户可以让 Agent 定时执行任务（例如每天早上刷新新闻、每周整理一次待办）。
- 所有变更可审批、可审计、可撤销。

**非目标（v1 不做）**

- 不让 Agent 直接修改部署中的前端源码，也不改别人的界面。
- 不允许任意 HTML/JS 直接注入产品页面。
- 不允许浏览器直接携带用户 Cookie 去请求任意第三方接口。
- 不做多用户共享的公共插件市场（后续再议）。

## 2. 核心原则

1. **Schema，不是代码**：Agent 输出结构化 JSON（widget schema），前端用通用渲染器渲染。
2. **用户隔离**：所有 widget / schedule 都带 `user_id`，查询和推送都按用户过滤。
3. **审批 + 审计**：Agent 修改工作区走现有 approval 机制；每次变更写审计。
4. **数据走后端**：第三方接口由后端受控代理（域名白名单、超时、缓存），浏览器只读后端数据。
5. **任意代码进沙箱**：确实需要自定义代码时，跑在独立 origin 的 iframe 里，拿不到宿主 Cookie。
6. **可撤销**：每次变更版本化，支持 undo。

## 3. 数据模型

### 3.1 `qb_ui_widget`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| user_id | bigint | 所属用户 |
| slot | varchar(32) | `sidebar` / `panel` / `header` / `composer` |
| kind | varchar(32) | `feed` / `markdown` / `table` / `iframe` / `link_list` |
| title | varchar(80) | 展示名，例如「最近新闻」 |
| icon | varchar(40) | lucide 图标名，例如 `newspaper` |
| config_json | json/text | 数据源与样式配置（见第 4 节） |
| sort_order | int | 排序 |
| enabled | tinyint | 是否显示 |
| version | int | 每次修改 +1，用于 undo |
| status | varchar(16) | `draft` / `active` / `disabled` |
| create_time / update_time | datetime | 时间 |
| del_flag | char(1) | 软删 |

### 3.2 `qb_ui_widget_version`（v1 可先不做，只保留 version 字段）

保存历史版本，用于撤销。

### 3.3 `qb_schedule`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| user_id | bigint | 所属用户 |
| name | varchar(80) | 任务名 |
| cron | varchar(64) | 5/6 段 cron |
| kind | varchar(32) | `agent_prompt` / `widget_refresh` |
| target_session_id | bigint | `agent_prompt` 写回哪个会话，可空 |
| device_id | bigint | 是否绑定设备执行，可空 |
| payload_json | json/text | prompt / widgetId / 参数 |
| approval_policy | varchar(32) | `ask` / `auto_readonly` / `deny_write` |
| enabled | tinyint | 开关 |
| last_run_at / next_run_at | datetime | 调度 |
| status | varchar(16) | `active` / `paused` / `error` |

## 4. Widget Schema v1

```json
{
  "kind": "feed",
  "title": "最近新闻",
  "icon": "newspaper",
  "slot": "sidebar",
  "source": {
    "type": "news",
    "channel": "tech",
    "limit": 20,
    "refreshMinutes": 30
  },
  "render": {
    "style": "compact",
    "showTime": true
  }
}
```

`source.type` 取值：

- `feed`（主）：通用 RSS/Atom/JSON 数据源，Agent 在运行时填任意公网 URL；后端做 SSRF 防护、超时、大小限制和缓存。新闻/小说/技术资讯都走这个，不按分类写代码。
- `news`：`feed` 的默认示例（中国新闻网 RSS），保留作为兼容别名。
- `http`：其他 JSON 接口的受控代理，和 `feed` 共用安全限制。
- `static`：Agent 生成的静态内容（markdown / table）。
- `session`：引用某个会话的摘要（例如「我的待办」）。
- `iframe`：P1 沙箱资产，Agent 运行时生成 HTML/JS，独立 origin 运行。

`kind: iframe` 的定制代码不放在 `config_json` 里，而是存到独立表 `qb_ui_asset`（带版本）；前端用单独子域的沙箱 iframe 加载，严格 CSP，禁止 `document.cookie`、禁止访问父页面 DOM。

## 5. 后端接口（拟）

```http
GET    /app/ui                      # 当前用户的工作区：widgets + schedules + version
POST   /app/ui/widgets              # 新增
PATCH  /app/ui/widgets/{id}         # 修改（version 乐观锁）
DELETE /app/ui/widgets/{id}         # 软删
GET    /app/ui/widgets/{id}/data    # 拉取数据（后端代理、缓存）
POST   /app/ui/widgets/{id}/refresh # 手动刷新

GET    /app/automations             # 定时任务列表（bridge 已经在前端调用这个路径）
POST   /app/automations
PATCH  /app/automations/{id}
DELETE /app/automations/{id}
```

bridge 对应暴露 `/api/ui/**`、`/api/automations/**`，全部带 Cookie 鉴权并透传当前用户。

SSE 新增用户级事件（不带 sessionId）：

```text
event: ui
data: {"method":"widget/created","widget":{...}}
data: {"method":"widget/updated","widget":{...}}
data: {"method":"widget/removed","widgetId":123}
data: {"method":"ui/dataUpdated","widgetId":123}
```

注意：现有 bridge 的 `broadcastMsp` 对没有 `sessionId` 的事件会全局广播；用户级 `ui` 事件必须走单独的 `broadcastToUser(userId, event, data)`，不能复用全局广播。

### 实现状态（2026-11-26，本地已验证）

- 表：`qb_ui_widget`、`qb_ui_audit`（SQL：`sql/qianbian_ui_20261126.sql`）。
- 接口：
  - `GET /app/ui` → `{"widgets":[{id,slot,kind,title,icon,config,sortOrder,enabled,version,status,createTime,updateTime}]}`
  - `POST /app/ui/widgets`、`PATCH /app/ui/widgets/{id}`、`DELETE /app/ui/widgets/{id}`
  - bridge 对应 `/api/ui`、`/api/ui/widgets...`，全部要求登录 Cookie。
- Agent 工具：`ui_list_widgets`（只读）、`ui_add_widget`（WRITE，走审批）、`ui_remove_widget`（DESTRUCTIVE，必审批）。
- 隔离已实测：A 创建的模块 B 看不到；B 修改/删除 A 的模块返回「模块不存在或已删除」；SSE `ui` 事件只有 A 收到，B 收到 0 个。
- 版本冲突（PATCH 带旧 version）返回错误信息「模块已被修改，请刷新后重试」，前端按 `msg/error` 提示即可。
- **P0 限制**：Agent 在后台创建的模块不会通过 bridge 推送（后端工具执行时拿不到 SSE hub）。请前端在每轮 `turn/completed` 后重新拉一次 `GET /api/ui`；用户主动通过 `/api/ui/widgets` 修改时才会收到 `ui` 事件。
- 新闻数据源尚未接入（等第 12 节第 4 条确认），P0 先把按钮/面板/审批/隔离跑通。

## 6. Agent 工具（拟）

| 工具 | 风险 | 说明 |
|---|---|---|
| `ui_list_widgets` | 只读 | 列出当前用户已有模块 |
| `ui_add_widget` | 写，需审批 | 新增 sidebar 按钮 / 面板 |
| `ui_update_widget` | 写，需审批 | 修改标题、数据源、排序 |
| `ui_remove_widget` | 写，需审批 | 删除 |
| `schedule_create` | 写，需审批 | 创建定时任务 |
| `schedule_list` / `schedule_cancel` | 只读 / 写 | 管理定时任务 |

审批卡直接复用现有 approval 事件，`subject.tool` 带工具名，`subject.summary` 展示「在左侧新增『最近新闻』按钮」这种人话。

## 7. 前端契约（评审重点）

前端需要做一次性的通用能力：

1. **侧边栏扩展位**：读取 `GET /api/ui`，在现有左侧导航中插入 `slot=sidebar` 的项；点击打开右侧/居中面板。
2. **通用渲染器**：至少支持
   - `feed`：图标 + 标题 + 时间 + 摘要列表，点击打开原文链接；
   - `markdown`：安全 markdown 渲染（现有 markdown 库白名单）；
   - `table`：简单表格；
   - `status`：只读状态卡（v1 可选）。
3. **数据获取**：调用 `GET /api/ui/widgets/{id}/data`，支持手动刷新和 `refreshMinutes` 定时刷新；收到 `ui` SSE 事件时更新。
4. **沙箱 iframe（P1）**：`kind=iframe` 的 widget 在独立子域（例如 `widget.agiqianbian.com`）加载，`sandbox="allow-scripts"`，通过 `postMessage` 读取后端数据；宿主页面不注入任何 Agent 生成的 HTML。
5. **错误态**：数据源失败时展示「数据暂时不可用 + 重试」，不能空白，也不能把错误堆栈透给用户。

不要求前端解析 Prompt、不要求前端执行任何 Agent 生成的 JS。

## 8. 定时任务

- 复用若依 quartz 调度器或轻量的 Spring `@Scheduled` 扫描 `qb_schedule`（每分钟）。
- 到点后：
  - `widget_refresh`：只刷新 widget 数据缓存，不消耗大模型 token；
  - `agent_prompt`：以该用户身份创建一次 Agent turn（走现有会话/消息链路），结果写回指定会话或站内通知。
- 必须带：每日执行次数上限、token 配额、静默时段（默认 23:00-07:00 不执行）、失败重试 1 次、审计记录。
- 敏感操作（写文件、终端、支付）在定时任务里默认拒绝，除非用户显式设置 `approval_policy=auto_readonly` 并只允许只读工具。
- 前端 `/api/automations` 已经有调用位，bridge 现在返回空数组；后端补上后前端只需渲染列表/开关。

## 9. 安全边界

- 所有表都带 `user_id`，所有接口按当前 token 的用户过滤，不做全局查询。
- 第三方接口只允许后端代理，域名白名单 + 超时 + 响应大小上限 + 缓存。
- 沙箱 iframe 独立 origin，严格 CSP，禁止访问宿主 Cookie / localStorage。
- 新闻内容注意版权与资质：优先使用已授权的内容 API，不直接抓取未授权站点。
- Agent 写入前审批；所有变更写 `qb_device_audit` 同类的审计表（`qb_ui_audit`）。
- 限额：单用户 widget 数量（例如 20）、单 widget 数据大小、定时任务数量（例如 10）。

## 10. 分期

> 分期以 `agent-workspace-plan-2026-11-26.md` 为准；下面是概要。

**P0（约 1 周）**

- `qb_ui_widget` 表 + `/app/ui` CRUD + bridge 路由；
- `feed` 类型 + 内置新闻源（先接一个合规 API，具体源待定）；
- Agent 工具 `ui_add_widget` / `ui_list_widgets` / `ui_remove_widget`；
- 前端渲染 sidebar + feed 面板；
- 审批 + 审计。

**P1**

- `iframe` 沙箱 + `qb_ui_asset`；
- `markdown` / `table` 类型；
- 版本历史与 undo。

**P2**

- `qb_schedule` + 定时任务；
- `/api/automations` 前端接通；
- 配额、静默时段、失败重试。

## 11. 验收场景（P0）

1. 用户对 Agent 说：「在左边加一个最近新闻的按钮」。
2. Agent 调 `ui_add_widget`，审批卡显示：「在左侧新增『最近新闻』按钮（feed，来源：科技新闻，每 30 分钟刷新）」。
3. 用户允许后，左侧出现按钮；点击打开新闻列表。
4. 用户 B 登录，左侧没有这个按钮。
5. 用户让 Agent 删除，按钮消失；审计里有记录。
6. 新闻源失败时，面板显示重试，不影响聊天。

## 12. 待确认问题（请前端回复）

1. 通用渲染器 + 独立子域沙箱 iframe 是否可行？大致排期？
2. 移动端是否同步做，还是桌面端先行？
3. 沙箱子域用 `widget.agiqianbian.com` 是否可以？需要运维配合证书与 DNS。
4. 新闻源：产品侧是否已有已授权的新闻 API？没有的话，后端先用一个可商用的来源做 P0。
5. `feed` 面板放在右侧工作区还是弹层？请按现有设计语言给一个建议。

## 13. 评审结论（2026-11-26）

前端已答复第 12 节的 5 个问题，后端确认如下：

1. **两阶段渲染器**：同意。第一阶段先做 feed / Markdown / 表格等安全渲染器，第二阶段再做独立域沙箱 iframe；暂估每阶段一个开发迭代。
   - P0：schema 驱动的 `feed` / `markdown` / `table` 渲染器 + 侧边栏扩展位 + 数据请求 + 错误态 + 版本冲突处理。
   - P1：独立 origin 的 iframe，`sandbox="allow-scripts"`、不授予 `allow-same-origin`，通过 `postMessage` 通信；服务端配置严格 CSP 和 `frame-ancestors`。
2. **桌面先行**：同意桌面端先做 P0；移动端复用同一套 schema，但单独适配全屏抽屉、滚动容器、安全区和触控，不复用桌面右栏布局。
3. **沙箱子域**：`widget.agiqianbian.com` 可以使用。DNS、独立证书、部署、nginx 和 CSP 由后端/运维配合；沙箱页面不得读取宿主 Cookie、localStorage 或父页面 DOM。
4. **新闻源**：同意不抓未授权站点。后端负责找可商用 API（可能涉及费用和资质）；数据源确定前，P0 只做按钮 / 面板 / 审批 / 用户隔离，`/app/ui/widgets/{id}/data` 等数据源定了再补。
5. **feed 位置**：桌面放右侧工作区的独立标签/面板；移动端用全屏抽屉，不做小弹层。

### P0 前端实现约束（前端补充）

- Agent 在后台创建 widget 后，当前 bridge 不保证推送 `ui` 事件；前端在每轮 `turn/completed` 后重新拉取 `GET /api/ui`。
- PATCH 遇到版本冲突时，按后端 `msg/error` 展示「模块已被修改，请刷新后重试」。
- 数据源失败时必须显示可重试错误态，不显示空白，也不透传后端堆栈。
- 前端不解析 Prompt、不执行 Agent 生成的 JavaScript，也不接收任意 HTML 注入。
- 桌面连接器的 ZIP、签名和发布工作继续暂停，不作为本扩展的前置条件。

### 合并与发布

- 2026-11-26 当前状态：`main` = `5d3923f`（多 1 个文档提交），`codex/device-management-stage-a-complete` = `d9648c3`（多 50 个提交），**双方都改了本文档，已经不能直接快进**。
- 合并顺序：先把 `origin/main` 合进 `codex`，文档冲突以 `main` 的本文档为准（已经包含前端回复和 P0 约束），再把 `codex` 合并到 `main` 并推送。
- 合并后后端负责：拉取 `main` → 同步生产 `bridge/web`（生产 C 端由 bridge 静态托管，不是 GitHub Pages）→ 用两个账号验证「所在地」和 SSE 隔离。
- 生产同步属于发布操作，需产品负责人明确授权后再执行。
- 桌面连接器继续暂停，不做 ZIP / 签名相关工作。

