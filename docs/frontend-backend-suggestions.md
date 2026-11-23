# 前端联调第二轮建议（2026-11-23）

基于最新 `main`（`d3e9dcd fix: complete frontend backend integration`）实测。

## 已修复并验证

- 用 `localhost:3101` 打开也会连接同源 `/api`
- 新建会话的用户消息不再被空 history 覆盖
- 右侧技能配置已显示后端真实的 38 个技能
- 天气问题实测：真实 DeepSeek + `local_weather`，回复正常
- 登录页、主题、可拖拽面板正常，没有 404 资源
- bridge 的 `session/resume` 已补上待处理审批/提问合并；审批对象同时提供 `requirementId`

## 仍然建议处理

### P0：右侧技能卡描述没有截断

`desktop-refresh.css` 里截断的是技能页的 `.skill-card-copy p`：

```css
.skill-card-copy p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

但右侧「技能配置」实际用的是 `.skill-config-grid .right-feature-card > p`，那条规则没有截断。
建议在 `desktop-workspace.css` 加：

```css
.skill-config-grid .right-feature-card > p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow-wrap: anywhere;
}
```

这样「育儿大师」「八字算命 AI 大师」这类长描述才不会把卡片撑到整屏。

### P0：手机端还没有接后端

`index.html` / `app.js` 目前完全没有引用 `desktop-api.js`，也没有 `/api` 请求。
移动端仍是纯本地演示。如果要和桌面端一致，需要在 `index.html` 引入 `desktop-api.js`，并把 `app.js` 里的会话、发送消息、技能市场数据源换成 `/api`。

### P1：技能分类显示的是原始英文 key

右侧技能卡标签会出现 `general · 1.13.0`、`productivity` 等。
项目里已经有 `skillCategoryLabel()`，建议渲染时套一层，或让后端把 category 映射成中文后再返回。

### P1：多用户部署需要登录态

当前 bridge 所有浏览器共用一个 `bridge` 账号，相当于单用户工作区。
如果要给多个测试人员同时用，需要前端把登录态传给后端（或在 bridge 加按浏览器隔离的 token），否则所有人会看到同一批会话和同一份记忆。

### P1：登录页目前不校验后端

`desktop-login.js` 的验证码是本地演示逻辑（任意 4-6 位数字都能登录）。
如果对外部署，需要接真实的手机号/邮箱验证码接口，不能让任何人随便进入。

### P2：刷新后建议自动恢复最近会话

现在刷新页面后，审批恢复依赖用户重新点击那个会话；建议记住 `activeSession`，刷新后自动 `resume` 最近一次会话，这样待处理审批/提问能立刻看到。

### P2：前端技能列表搜索

右侧已安装技能有 38 个，垂直滚动很长。建议给 `.skill-config-grid` 上方加一个搜索框或分类筛选（已有 `全部 / 已启用 / 已停用`，可以再加文本搜索）。

### P2：自动化 / Git / 浏览器面板

- `GET /api/automations` 目前返回空数组
- `/api/git/*` 返回 `available:false`
- 前端已经能显示空态，这部分不用再改接口

## 后端已补充

- `POST /api/session/start` 响应现在额外返回 `modelId`，前端可直接同步当前模型
- `session/resume` 返回 `pendingRequests`（审批 + 提问）
- `POST /api/skills/publish` 已实测：在线代码模式发布成功（测试数据已清理）

## 验证地址

- `http://192.168.1.10:3101/desktop.html`
- 后端 `/api` 与页面同源，不需要额外配置
