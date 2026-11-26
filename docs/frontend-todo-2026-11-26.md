# 前端待办（2026-11-26）

> 后端 / bridge 已上线两项修复，这份文档只列前端需要做的事，按顺序来。
>
> 2026-11-26 10:00 拉取到的分支状态：
>
> - `main`：`7c4fbf5`
> - `codex/device-management-stage-a-complete`：`2953db0`，比 main 多 44 个提交，2026-11-26 09:43 还在更新
> - `feat/ip-location-detection`：`15add85`，**已经基于 `2953db0` 重建**，可以直接合并
>
> 请以 `codex/device-management-stage-a-complete` 作为当前工作分支，不要只看 `main`。

## 后端已上线，不需要前端做

1. **SSE 按用户隔离**：bridge 现在只把某个会话的事件推给会话所属用户。之前是全局广播，A 的回答、审批卡会推给所有在线用户。
2. **匿名访问会话接口一律 401**：`/api/sessions`、`/api/view`、`/api/transcript`、`/api/session/resume|export` 没登录不再返回 bridge 服务账号的数据。
3. **新增按 IP 定位接口** `GET /api/location`（见任务一）。

## 任务一：合并「所在地」按 IP 自动填充（必做）

### 背景

账号资料里的「所在地」一直是前端写死的默认值 `杭州`（`desktop-login.js` 的默认档案 + `desktop-app.js` 多处 fallback），从来没有请求过真实位置。

后端已上线 `GET /app/location`，bridge 暴露为 `GET /api/location`，按客户端真实 IP 返回城市级位置：

```json
{
  "ip": "223.149.176.112",
  "resolved": true,
  "city": "青园",
  "region": "湖南",
  "country": "中国",
  "label": "湖南 青园",
  "latitude": 28.1142,
  "longitude": 112.983,
  "timezone": "Asia/Shanghai"
}
```

- 私网 / 回环 IP：`{"ip":"","resolved":false}`，前端保持原值。
- `label` 是拼好的展示文案（省 + 市，直辖市只显示市），**前端直接用它，不要再自己拼**。
- 同 IP 缓存 10 分钟。

### 分支

`feat/ip-location-detection`，commit `15add85`，基于你们当前的 `codex/...` `2953db0`。

### 步骤

1. 拉取所有远端分支：

   ```bash
   git fetch origin --prune
   git branch -r
   # 必须能看到 origin/feat/ip-location-detection 和 origin/codex/device-management-stage-a-complete
   ```

2. 切到工作分支并同步：

   ```bash
   git checkout codex/device-management-stage-a-complete
   git pull --ff-only
   ```

3. 合并（二选一）：

   ```bash
   # 方式 A：整分支合并
   git merge origin/feat/ip-location-detection

   # 方式 B：只拿这一个提交
   git cherry-pick 15add85
   ```

4. 如果冲突，改动只有 4 个文件，按下面对照：

   **`desktop-api.js`**：`sessions(...)` 后面加一个方法：

   ```js
   location(signal) {
     return request("/location", { signal });
   },
   ```

   **`desktop-app.js`**（5 处）：

   - state 初始化：

     ```js
     accountLocation: storedAccountProfile.location || "",
     accountLocationAuto: storedAccountProfile.locationAuto !== false,
     ```

   - `persistAccountProfile()` 里加：

     ```js
     locationAuto: state.accountLocationAuto,
     ```

   - `refreshBackendSessions` 前面新增：

     ```js
     async function refreshAccountLocation() {
       if (!api || !state.accountLocationAuto) return;
       try {
         const payload = await api.location();
         const label = payload?.resolved
           ? String(payload.label || payload.city || "").trim()
           : "";
         if (!label || label === state.accountLocation) return;
         state.accountLocation = label;
         persistAccountProfile();
         renderAccountDialog();
         renderContext();
       } catch {}
     }
     ```

   - `initializeBackend()` 里 `engineLabel.textContent = "后端已连接"` 后面加：

     ```js
     refreshAccountLocation();
     ```

   - 「保存资料」逻辑（读 `#account-location` 的地方）改成：

     ```js
     const locationInput =
       document.getElementById("account-location")?.value.trim() || "";
     if (locationInput && locationInput !== state.accountLocation) {
       state.accountLocationAuto = false;
     }
     state.accountLocation = locationInput || state.accountLocation;
     ```

   - 另外把两处写死的 `state.accountLocation = "杭州";` 改成 `""`，并补 `state.accountLocationAuto = true;`。

   **`desktop-login.js`**：默认档案改：

   ```js
   location: "",
   locationAuto: true,
   ```

   **`docs/ip-location.md`**：分支里带的新文档，说明接口和前端行为。

5. 验证：

   - 打开生产 `https://agiqianbian.com` 登录 → 账号设置 → 「所在地」不再是杭州，而是 `label`（例如「湖南 青园」）。
   - 手动把「所在地」改成别的值 → 保存 → 刷新页面，**不再被自动覆盖**（`locationAuto` 已置 false）。
   - 清除 localStorage 里的 `qianbian-desktop-account-profile` 再登录，应该重新自动填充。
   - 老用户本地已经存了 `location: "杭州"` 且没有 `locationAuto` 字段的，会按 true 处理，下次打开自动纠正一次。

6. 合并到 `main` 后**通知后端**：

   - 线上 C 端页面由服务器 `bridge/web` 提供，后端负责同步构建产物；你们合并完告诉我，我来同步并复查。
   - 如果你们有 GitHub Pages 预览，Pages 会按 main 自动构建。

### 注意

IP 定位只能到城市级，而且不同 IP 库结果可能不一致（同一个 IP 可能分别报「长沙」「怀化」「北京」）。它只是自动填一个初始值，**「所在地」必须保持可手动修改**。

## 任务二：SSE 事件按 sessionId 过滤（建议一起做）

### 背景

服务端已经按用户隔离了，但前端收到 `msp` 事件时完全不看 `params.sessionId`，直接往当前对话里追加。后果是**同一个账号开两个标签页、各自在不同会话时，A 标签的流式回答、审批卡会串到 B 标签**。这是前端应该有的兜底，改动很小。

### 步骤

1. `desktop-app.js` 的 `handleBackendEvent` 之前加常量：

   ```js
   const SESSION_SCOPED_MSP_METHODS = new Set([
     "turn/started",
     "turn/completed",
     "item/started",
     "item/delta",
     "item/completed",
     "approval/requested",
     "approval/resolved",
     "userInput/requested",
     "userInput/settled",
     "session/tokenUsage",
     "session/contextUsage",
   ]);
   ```

2. `handleBackendEvent(method, params)` 函数第一行加过滤：

   ```js
   const eventSessionId = params.sessionId || params.session?.sessionId;
   if (
     SESSION_SCOPED_MSP_METHODS.has(method) &&
     eventSessionId &&
     state.activeSession &&
     String(eventSessionId) !== String(state.activeSession)
   ) {
     return;
   }
   ```

   **不要过滤 `session/started`**，它要更新左侧会话列表；`device/status` 是另一个事件，也不受影响。

3. `app.js` 的 `handleMobileBackendEvent(method, params = {})` 同样处理，比较对象换成 `state.backendSessionId`：

   ```js
   const eventSessionId = params.sessionId || params.session?.sessionId;
   if (
     SESSION_SCOPED_MSP_METHODS.has(method) &&
     eventSessionId &&
     state.backendSessionId &&
     String(eventSessionId) !== String(state.backendSessionId)
   ) {
     return;
   }
   ```

   常量在 `app.js` 里也定义一份（两个文件是独立的 IIFE，不能共用）。

4. 验证：

   - 同一账号开两个标签页，分别打开不同会话。
   - A 标签提问，B 标签不应出现 A 的流式文字、审批卡、提问卡。
   - A 标签自己的内容仍然正常显示。

## 合并后整体验证清单

- [ ] 两个不同账号分别登录，A 提问，B 看不到任何 A 的流式内容 / 审批卡 / 提问卡（服务端修复）。
- [ ] 同一账号两个标签页不同会话，互不串流（任务二）。
- [ ] 「所在地」自动填充；手动改后刷新不被覆盖（任务一）。
- [ ] 手机端登录、聊天、审批正常（任务二改动要在手机上验证一次）。
- [ ] 匿名打开页面不会拿到 bridge 服务账号的历史会话。

## 下一步预告：Agent 工作区扩展（先不要开工）

产品负责人已确认方向：让 Agent 能像改自己的工作台一样，给用户加侧边栏按钮、面板、widget（例如「最近新闻」），并支持定时任务。

我们这边会先出设计文档，原则是：

- 每个用户一份 UI schema，Agent 通过工具修改自己的 schema，写入前走现有审批；
- 前端只需要实现**一次**通用渲染器（feed 列表、markdown、表格、iframe 沙箱），不接收任意 HTML 注入；
- 任意代码跑在独立 origin 的沙箱 iframe 里，拿不到宿主 Cookie；
- 第三方接口统一走后端受控代理（白名单、缓存、超时），不让浏览器自己乱请求；
- 定时任务以用户身份执行，带配额、静默时段和审计。

需要前端先回复三件事（不要写代码）：

1. 通用渲染器 + 沙箱 iframe 这个方向是否可行？大致排期？
2. 移动端是否同步做，还是桌面端先行？
3. 沙箱是否需要单独子域（建议要，例如 `widget.agiqianbian.com`）？

设计文档出来后会在本仓库 `docs/` 和 Issue 里同步。
