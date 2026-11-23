# 千变后端接入说明（前端联调用）

> 前端仓库：`Aatgh/qianbian-web`（本仓库）
> 后端：若依 RuoYi（Java）+ `muse-bridge` 兼容层
> 前端不需要改页面结构，只需要把本仓库里的演示数据替换成下面的 API 调用。

当前部署地址（内网）：

- 前端页面：`http://192.168.1.10:3101/desktop.html`
- 后端 API（同源）：`http://192.168.1.10:3101/api`
- 管理后台：`http://192.168.1.10:5181`

## 认证

当前 `muse-bridge` 使用一个固定的千变账号（默认 `bridge`）登录，**浏览器不需要传 token**，直接请求 `/api/*` 即可。

如果后续做多用户，需要前端在请求头带登录态，由后端换成对应用户身份；在此之前所有前端用户共享同一个账号。

## 通用约定

- 所有接口返回 JSON；出错时 HTTP 非 2xx，响应为：
  ```json
  { "error": "错误说明" }
  ```
- 聊天使用 **SSE**：`GET /api/events`，事件名 `msp` 和 `status`。
- 会话 id 是字符串形式的后端会话 id，例如 `"23"`。
- 模型 id 也是字符串，例如 `"2"`。

---

## 1. 会话

### `GET /api/sessions`

会话列表。

```json
{
  "sessions": [
    {
      "sessionId": "23",
      "title": "今天的天气",
      "createdAt": "2026-11-23T11:13:55.000+08:00",
      "updatedAt": "2026-11-23T11:13:55.000+08:00",
      "turnCount": 2,
      "status": "idle"
    }
  ],
  "nextCursor": null
}
```

### `POST /api/session/start`

新建会话。

请求：

```json
{
  "modelId": "2",
  "approvalMode": "onRequest",
  "workspaceRoot": "D:/project/千变/data/workspaces/u14"
}
```

响应：

```json
{
  "session": { "sessionId": "24", "title": "新对话", "updatedAt": "..." },
  "viewCursor": "0",
  "history": { "mode": "inline", "items": [] }
}
```

`approvalMode` 可选值：

- `onRequest` → 写文件 / 执行命令时审批（默认）
- `promptUnmatched` / `denyUnmatched` → 更严格
- `allowAll` → 不弹审批

### `POST /api/session/resume`

打开历史会话，返回会话与历史消息。

请求：`{ "sessionId": "23" }`

响应：

```json
{
  "session": { "sessionId": "23", "title": "今天的天气" },
  "history": {
    "mode": "inline",
    "items": [
      { "itemId": "m-91", "kind": "userMessage", "text": "你好", "status": "completed", "done": true },
      { "itemId": "m-92", "kind": "agentMessage", "text": "你好，有什么可以帮你？", "status": "completed", "done": true }
    ]
  },
  "pendingRequests": []
}
```

### `GET /api/transcript?sessionId=23`

只取历史消息：

```json
{ "items": [ /* 同上，item 结构见下 */ ] }
```

### 消息 item 结构

```json
{
  "itemId": "m-92",
  "kind": "userMessage | agentMessage | reasoning | toolCall",
  "text": "文本内容",
  "status": "completed | inProgress | failed | cancelled",
  "tool": "write_file",
  "args": "{...}",
  "visibleOutput": "工具输出",
  "summary": ["思考摘要"],
  "turnId": "turn-xxx",
  "revision": 1,
  "done": true
}
```

- `userMessage` / `agentMessage` 才会渲染成消息气泡。
- `toolCall` / `reasoning` 会折叠进 Thinking 区。
- `args` 是 JSON 字符串。

---

## 2. 发送消息（SSE）

### `POST /api/turn`

请求：

```json
{
  "sessionId": "23",
  "text": "今天日照天气怎么样？",
  "modelId": "2",
  "images": []
}
```

响应（立即返回，真正内容走 `/api/events`）：

```json
{
  "commandId": "bridge",
  "disposition": "started",
  "startedNewTurn": true,
  "status": "accepted",
  "turnId": "turn-1795405190593"
}
```

### `GET /api/events`（SSE）

```js
const es = new EventSource('/api/events')
es.addEventListener('msp', (event) => {
  const { method, params } = JSON.parse(event.data)
  // method 见下
})
es.addEventListener('status', (event) => {
  const status = JSON.parse(event.data) // { connected, lastError, mock }
})
```

#### 事件方法

| method | 说明 | 关键 params |
|---|---|---|
| `turn/started` | 开始生成 | `sessionId`, `turnId` |
| `item/started` | 新 item | `item` |
| `item/delta` | 增量文本 | `itemId`, `field`, `delta` |
| `item/completed` | item 完成 | `item`（含完整 text / visibleOutput） |
| `approval/requested` | 需要审批 | `approvalId`, `sessionId`, `toolName`, `subject`, `availableChoices` |
| `approval/resolved` | 审批已处理 | `approvalId` |
| `userInput/requested` | 需要用户回答 | `userInputId`, `sessionId`, `questions` |
| `userInput/settled` | 提问已处理 | `userInputId` |
| `session/tokenUsage` | token 用量 | `usage`, `cumulative` |
| `session/contextUsage` | 上下文用量 | `usedTokens`, `windowTokens` |
| `turn/completed` | 一轮结束 | `sessionId`, `turnId`, `terminal`（`completed` / `failed` / `cancelled`） |

`item/delta` 的 `field`：

- 普通回复：`text`
- 工具输出：`output`
- 思考摘要：`summary.0`

### `POST /api/turn/cancel`

停止生成。

```json
{ "sessionId": "23" }
```

### 审批

`approval/requested` 里会带：

```json
{
  "approvalId": "57",
  "toolName": "write_file",
  "subject": { "kind": "tool", "tool": "write_file", "summary": "写入 ..." },
  "availableChoices": [
    { "choiceId": "allow_once", "label": "允许一次", "decision": "approved", "scope": "once" },
    { "choiceId": "allow_session", "label": "本会话允许", "decision": "approved", "scope": "session" },
    { "choiceId": "deny", "label": "拒绝", "decision": "abort", "scope": "once", "acceptsFeedback": true }
  ]
}
```

前端点击后调用：

```
POST /api/approval/decide
{
  "sessionId": "23",
  "approvalId": "57",
  "choiceId": "allow_once",
  "requirementId": { "approvalId": "57", "sourceIndex": 0 }
}
```

`requirementId` 取自 `approval/requested` 的 `currentRequirementId` 或待处理审批列表；bridge 的 `session/resume` 会统一输出为 `requirementId`。

### 提问

`userInput/requested` 的 `questions`：

```json
[
  {
    "id": "0",
    "header": "请确认",
    "question": "你希望回答简洁还是详细？",
    "selection": { "mode": "single" },
    "options": [{ "label": "简洁" }, { "label": "详细" }]
  }
]
```

回答：

```
POST /api/input/answer
{ "sessionId": "23", "userInputId": "12", "answers": [...] }
```

取消：

```
POST /api/input/cancel
{ "sessionId": "23", "userInputId": "12" }
```

---

## 3. 模型

### `GET /api/models`

```json
{
  "models": [
    { "modelId": "2", "label": "DeepSeek Chat", "isDefault": true },
    { "modelId": "3", "label": "DeepSeek Reasoner", "isDefault": false }
  ]
}
```

Mock 渠道已过滤；默认使用真实 DeepSeek。

### `POST /api/session/model`

```json
{ "sessionId": "23", "modelId": "3" }
```

### `POST /api/session/approval-mode`

```json
{ "sessionId": "23", "mode": "onRequest" }
```

---

## 4. 技能（Agent Skill）

### `GET /api/skills?scope=market|installed&q=`

```json
{
  "skills": [
    {
      "id": 41,
      "name": "wps-office-suite",
      "displayName": "WPS Office 全家桶",
      "description": "...",
      "category": "办公协作与生产力工具",
      "author": "...",
      "badge": "reviewed",
      "installCount": 2,
      "installed": true,
      "enabled": true,
      "version": "5.5.0",
      "risk": "low",
      "permissions": ["files:read"],
      "tools": ["skill_run"]
    }
  ]
}
```

### `GET /api/skills/mine`

```json
{
  "skills": [
    {
      "id": 44,
      "name": "家庭一周餐单",
      "displayName": "家庭一周餐单",
      "description": "...",
      "status": "pending",
      "reviewStatus": "pending",
      "version": "1.0.0"
    }
  ]
}
```

### 安装 / 启停 / 卸载

```
POST   /api/skills/{id}/install
POST   /api/skills/{id}/enable
POST   /api/skills/{id}/disable
DELETE /api/skills/{id}
POST   /api/skills/{id}/unpublish
```

### 发布技能

```
POST /api/skills/publish
Content-Type: multipart/form-data
```

字段：

- `name` 技能名称
- `summary` 一句话介绍
- `category` 分类
- `description` 可选
- `mode`：`upload` / `online`
- `file`：ZIP（`mode=upload`）
- `fileName`、`code`：在线编写时使用

---

## 5. 其他

- `GET /api/health`：健康检查
- `GET /api/dirs?path=~`：目录选择器
- `GET /api/view?sessionId=`：兼容接口
- `GET /api/session/export?sessionId=`：导出会话
- `GET /api/automations`、`GET /api/git/*`：暂时返回空数据/不可用

---

## 6. 前端接入建议

本仓库静态页需要改的地方（不改视觉，只换数据源）：

1. `renderSessions()`：用 `GET /api/sessions` 替换 `SESSIONS`
2. `sendMessage()`：改成 `POST /api/turn`，并订阅 `/api/events`
3. 历史会话：`POST /api/session/resume` / `GET /api/transcript`
4. 审批卡：监听 `approval/requested`，按钮调用 `/api/approval/decide`
5. 提问卡：监听 `userInput/requested`，提交 `/api/input/answer`
6. 技能市场 / 技能配置：`GET /api/skills?scope=...`，开关调用 enable/disable
7. 发布技能：`POST /api/skills/publish`

后端已验证：真实 DeepSeek 流式、工具调用、写文件审批、`ask_user` 提问、38 个技能的路由（技能已安装到 bridge 账号）。
