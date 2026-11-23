# 前端接口联调检查（2026-11-23）

已部署最新前端（仓库 `main`，`desktop-api.js` 已接入 `/api`），后端使用 `muse-bridge` + 若依 Java 后端。

## 本轮处理结果

前端侧可直接闭环的项目已经处理：

- `localhost` / `127.0.0.1` 现在会默认连接同源 `/api`
- 新建会话会保留刚发送的用户消息，直到后端回显替换它
- `POST /api/session/resume` 会合并宿主待处理列表与 bridge 事件缓存，刷新后恢复审批和提问
- 审批请求现在携带 `requirementId`，与 `approval/decide` 接口要求一致
- 技能卡描述限制为三行，长描述不再撑开卡片
- 图片入口在后端接入视觉模型前保持禁用
- 自动化页接入 `GET /api/automations`，空数组和服务不可用都有明确空态
- 静态 `desktop.html` 当前没有独立 Git / 浏览器面板；`api.git()` 客户端已经保留，后续面板接入时应按 `available:false` 显示禁用态

验证覆盖了同源联调、乐观消息、刷新恢复、审批字段、技能卡截断、图片禁用和自动化空态。bridge 侧新增待处理请求合并测试，并用 mock 服务实际验证了审批与提问恢复。

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

已在 `desktop-app.js` 放开该限制。localhost 现在和局域网地址一样默认请求同源 `/api`。

### 2. 新建会话时，用户刚发的消息会被清掉

复现：

1. 新会话输入并发送
2. 后端返回第一个 `item/started` 之前，页面只剩一个「…」的助手气泡，用户自己的消息不见了
3. 回复完成后用户消息仍然不显示

原因在 `desktop-app.js`：

- `sendMessage()` 先把用户消息 push 到 `state.messages`
- 随后 `startBackendSession()` 调用 `state.messages = hydrateMessagesFromBackend(payload)`
- 新会话 `history.items` 是空数组，于是把刚 push 的用户消息覆盖掉了

已修复：`startBackendSession()` 会保留尚未获得 `itemId` 的本地用户消息，后端历史消息随后正常合并。

### 3. 刷新/重进页面时，未处理的审批和提问不会恢复

前端支持 `payload.pendingRequests`，会拆成 `pendingApprovals` / `pendingInputs`。
当前 bridge 的 `/api/session/resume` 返回 `pendingRequests: []`，所以审批/提问进行中刷新页面，卡片会消失，后端仍在等待。

后端已有 `GET /app/approvals/pending?sessionId=`；bridge 需要在 resume 时合并：
- 生效中的审批（approvalId、toolName、availableChoices）
- 等待中的问题（userInputId、questions）

已修复：bridge 会合并宿主待处理列表和当前进程收到的 `approval/requested` / `userInput/requested` 事件，并在审批对象中统一提供 `requirementId`。

### 4. 技能卡片文字溢出

真实技能描述很长（如「育儿大师」「八字算命 AI 大师」），右侧技能卡描述会撑满卡片并溢出视觉区域。
已修复：技能卡描述使用三行截断，完整描述仍由后端提供。

### 5. 图片附件暂不支持

前端会发送 `images`（base64），bridge 当前只把图片数量转成一句文字提示，不能做视觉理解。
已处理：图片入口暂时禁用；后端接入视觉模型后再恢复。

### 6. Git / 自动化 / 浏览器面板

- `GET /api/automations` 返回空数组
- `GET /api/git/*` 返回 `available:false`
- 前端需要对这两个状态做空态/禁用提示，否则会以为接口坏了

已处理：自动化页已读取后端数组并提供空态/不可用态。静态桌面页没有独立 Git / 浏览器面板，因此当前没有可切换的 Git 面板；新增面板时应直接使用 `available:false` 渲染禁用状态。

## 接口字段提醒

- 会话 id 是字符串（例如 `"32"`），不要转成数字后在比较时丢精度。
- 模型 id 是字符串（`"2"`、`"3"`），Mock 已被后端过滤，默认 DeepSeek。
- `item/delta` 的 `field` 只有 `text` / `output` / `summary.N`。
- 审批按钮回传 `choiceId`：`allow_once` / `allow_session` / `deny`。
- 审批按钮同时回传事件里的 `requirementId`（兼容 `currentRequirementId`）。
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
