# 前端接口联调检查（2026-11-23）

已部署最新前端（仓库 `main`，`desktop-api.js` 已接入 `/api`），后端使用 `muse-bridge` + 若依 Java 后端。

## 已验证通过

在内网地址 `http://192.168.1.10:3101/desktop.html` 实测：

- 登录后页面显示后端 38 个已安装技能
- 发送「今天日照天气怎么样？适合穿什么？」：
  - 真实 DeepSeek 回复
  - 调用 `local_weather` 工具
  - 右侧技能配置、技能市场来自后端
- 会话/模型/技能接口无 404，页面控制台无报错

## 需要注意/建议前端修的地方

### 1. 用 `localhost` 打开时不会连接后端（重要）

`desktop-app.js` 的 `initializeBackend()` 有一段：

```js
if (
  ["localhost", "127.0.0.1"].includes(location.hostname) &&
  !api.explicit
) {
  return;
}
```

如果前端人员用 `http://localhost:3101/desktop.html` 或 `http://127.0.0.1:3101` 打开，会跳过所有 `/api` 请求，于是页面永远显示演示回复。

当前有两种规避方式（不改代码）：

- 用局域网地址打开：`http://192.168.1.10:3101/desktop.html`
- 或显式指定 API 地址：`http://localhost:3101/desktop.html?api=http://localhost:3101/api`

如果希望 localhost 也能自动连接，需要前端放开这段限制。

### 2. 新建会话时，用户刚发的消息会被清掉

复现：

1. 新会话输入并发送
2. 后端返回第一个 `item/started` 之前，页面只剩一个「…」的助手气泡，用户自己的消息不见了
3. 回复完成后用户消息仍然不显示

原因在 `desktop-app.js`：

- `sendMessage()` 先把用户消息 push 到 `state.messages`
- 随后 `startBackendSession()` 调用 `state.messages = hydrateMessagesFromBackend(payload)`
- 新会话 `history.items` 是空数组，于是把刚 push 的用户消息覆盖掉了

建议：`startBackendSession()` 只有在 `payload.history.items.length > 0` 时才覆盖 `state.messages`，或者把本地乐观消息保留到后端回显。

### 3. 刷新/重进页面时，未处理的审批和提问不会恢复

前端支持 `payload.pendingRequests`，会拆成 `pendingApprovals` / `pendingInputs`。
当前 bridge 的 `/api/session/resume` 返回 `pendingRequests: []`，所以审批/提问进行中刷新页面，卡片会消失，后端仍在等待。

后端已有 `GET /app/approvals/pending?sessionId=`；bridge 需要在 resume 时合并：
- 生效中的审批（approvalId、toolName、availableChoices）
- 等待中的问题（userInputId、questions）

### 4. 技能卡片文字溢出

真实技能描述很长（如「育儿大师」「八字算命 AI 大师」），右侧技能卡描述会撑满卡片并溢出视觉区域。
建议前端给技能卡描述加 `line-clamp: 3` 或固定高度；后端已经提供完整描述，不需要改接口。

### 5. 图片附件暂不支持

前端会发送 `images`（base64），bridge 当前只把图片数量转成一句文字提示，不能做视觉理解。
如果要支持，需要后端接入视觉模型；否则前端可以暂时隐藏/禁用图片附件入口。

### 6. Git / 自动化 / 浏览器面板

- `GET /api/automations` 返回空数组
- `GET /api/git/*` 返回 `available:false`
- 前端需要对这两个状态做空态/禁用提示，否则会以为接口坏了

## 接口字段提醒

- 会话 id 是字符串（例如 `"32"`），不要转成数字后在比较时丢精度。
- 模型 id 是字符串（`"2"`、`"3"`），Mock 已被后端过滤，默认 DeepSeek。
- `item/delta` 的 `field` 只有 `text` / `output` / `summary.N`。
- 审批按钮回传 `choiceId`：`allow_once` / `allow_session` / `deny`。
- 提问回答回传 `answers` 数组，格式：`[{ questionId, value }]`。

## 验证命令

```bash
curl http://192.168.1.10:3101/api/health
curl "http://192.168.1.10:3101/api/skills?scope=installed"
curl -X POST http://192.168.1.10:3101/api/session/start \
  -H 'Content-Type: application/json' \
  -d '{"approvalMode":"onRequest"}'
```

SSE：

```bash
curl -N http://192.168.1.10:3101/api/events
```
