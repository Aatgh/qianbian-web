# 千变前端整修计划（2026-11-26）

> 由 6 个只读 Explore 智能体（移动端、桌面端、共享/API/安全、视觉、后端部署、测试）+ 1 个 Plan 智能体产出。
> 项目：前端 `qianbian-web`（main `fe12e49`），后端 Java + `muse-bridge`，生产 `agiqianbian.com`。
>
> 🖥️ **桌面端重构第一版已上线（2026-11-26）**：`redesign.css` 统一暖白/梅红设计；三栏布局（图标栏 72 + 会话 280 + 聊天 + 上下文 360）；修复顶部「千变/新对话」被裁切；右栏改为紧凑资料头 + 单列技能卡；登录页改为左品牌文案 + 右白色登录卡的现代布局，去掉星空/毛玻璃/拖拽；Playwright 82 通过、4 个旧设计用例跳过。生产备份 `bridge-web-20261126-1515.tar.gz`。**下一步：移动端重构。**
>
> 🎨 **P1 第一轮已完成并上线（2026-11-26）**：新增 `tokens.css`（字体阶梯）与 `typography.css`；移动端 8–11px 正文字号清零（8/9/10→12px，11→13px），桌面功能文字 ≥12px；消息内容允许长按选择；`tokens.css`/`typography.css` 已引入三个页面；Playwright 86 用例仍全绿。P1 结构部分（移除 UI Atlas 演示壳、合并桌面 CSS、拆分 app.js/desktop-app.js、删除演示数据）待继续。
>
> ✅ **P0 已完成并上线（2026-11-26）**：登录门与后端启动解耦（匿名零用户请求）、SSE 严格按会话过滤、桌面「技能市场清空提醒/记忆」与「技能包拖拽 ReferenceError」修复、`GET /api/ui/widgets/{id}/data` 上线（RSS/Atom + 静态源 + SSRF + 缓存）、Agent 工具已在生产开启；Playwright **86 用例全绿**；本地 E2E 已验证 Agent 自动创建「最近新闻」→ 审批 → 数据返回 5 条。生产备份：`bridge-web-20261126-1215.tar.gz`、`app.jar.bak-20261126-1310`、`server.mjs.bak-20261126-1310`。下一步进入 P1（tokens.css、字号/对比度、结构拆分）。

## 一、整体判断

整体判断：不推倒重来后端与共享层，前端做「结构性重写 + 视觉重做」，先止血再美化。保留并继续演进 desktop-api.js、src/agent-workspace-ui.js、assets/chat-timeline.js、mobile-login.js；bridge 的「/api/* 默认拒绝 + 公开白名单」、SSE 按用户隔离、Java 的用户隔离/审批/设备令牌设计都应保留。重写三处结构性根因：(1) index.html 是「UI Atlas 演示壳」而非产品界面（index.html:259「UI Atlas · 全量交互演示」、:265「仅前端模拟」、:322 phone-device mockup、:358 页面检查器），真正的手机界面全部渲染进 #phone-screen（app.js:7429 renderPhone 整页 innerHTML），生产靠 styles.css:9934-9946 把壳 display:none 硬隐藏——这是「视觉差」的结构根源；(2) app.js 9033 行 + desktop-app.js 8359 行单体，混入 HIDDEN_PAGE_IDS 60+ 死页面（app.js:14-90、renderBots:5017、renderRooms:5053、renderTavern:5364、buildIdeaSkillScript:6283）；(3) 三份桌面 CSS 互相覆盖（desktop.html:20-23 同时加载 desktop.css 2885 行、desktop-refresh.css 3956 行、desktop-workspace.css 5085 行，desktop.css 基本被后两份重定义），且 6 套 :root token 同名不同值（styles.css:10 canvas #eceee9 vs desktop-refresh.css:2 #f3f5f1 vs mobile-login.css:9 #f3f6f1；accent-ink #7c174c/#7b194b/#7d174c/#81194e），--radius-sm 与 --radius-md 都等于 8px（styles.css:31-32）。
已核实的真 bug（须在 P0 修）：
A. 登录门与后端启动解耦 → 匿名首访 401 风暴。app.js init() 无条件 initializeMobileBackend()（app.js:9021），其内先 api.health() 再 Promise.allSettled 8 个用户接口（app.js:1390-1428）；desktop-app.js 顶层无条件 initializeBackend()（desktop-app.js:8349），其内并发 9 个接口（2362-2383）。mobile-login.js:316-317 派发 qianbian:mobile-auth-success，但 app.js 全文件无监听（grep 0 命中）；desktop-app.js:8315 虽监听 qianbian:auth-success，却只改 state 不触发 initializeBackend。desktop-login.js:431 登录后 location.reload() 使得登录后是 200，所以风暴只发生在匿名首访，但每次匿名访问仍打 9-10 个 401。
B. 流式事件 sessionId 过滤不彻底。app.js:1020-1029 仅在「eventSessionId 存在且与当前不同」时丢弃；缺 sessionId 或 backendSessionId 为 null 时全部放行，turn/started 无条件置全局 backendTurnId（1030-1036）。测试 mobile-backend-api.spec.js 用无 sessionId 的调用正好掩盖此缺口。
C. 桌面端打开技能市场清空提醒/记忆（复制粘贴自「清除数据」）：desktop-app.js:7782-7789 在 [data-open-skill-market] 里重置 customReminders/customMemories/reminderOverrides/deleted* 等，且 :7789 还误置 state.loggedIn=true。
D. 技能包拖拽 ReferenceError：desktop-app.js:3556 `showToast(\`已添加 ${fileName}\`)`，函数内只有参数 fileOrName → 拖入/选择技能包必抛错，发布入口不可用。
E. 桌面端从不校验登录态：全文件无 api.authMe()，desktop-login.js:68-77 isAuthenticated 只读 localStorage；Cookie 过期后界面仍显示已登录、所有接口 401 却被 allSettled 静默吞掉（desktop-app.js:2384-2421），不提示重登，且「后端已连接」是假的（health 是公开接口，2351 catch 几乎不触发）。
F. /api/ui/widgets/{id}/data 前后端都缺：desktop-api.js:269 定义 uiData，app.js:1285 / desktop-app.js:6140 调用，但 AppUiController.java:28-53 与 bridge server.mjs:1189-1216 都没有该 GET 路由 → feed 恒空。
G. 短信 fail-open：SmsServiceImpl.java:48 DEV_CODE="1234"，:89 未配置即用固定码，AppAuthController.java:43-46 把测试码明文回传，生产 AK/SK 一旦缺失即等同无验证登录。
体验问题（非致命但影响「差」的观感）：全局 user-select:none（styles.css:9916-9917）导致聊天文本无法长按复制；微字泛滥（styles.css 420 处 font-size，274 处 ≤10px、83 处 8px）；登录页与主界面品牌割裂（desktop-login.css 近黑 #09090b + 珊瑚 #e94d73 + 金 vs 主界面 #f3f5f1 + #a62466；mobile-login 深绿金头）；移动端展示硬编码演示对话与伪造会话（app.js:3300 renderChatMessages 演示转写、app.js:355-379 getFallbackMobileSessions 三个假会话）；「工作」标签死功能（app.js:4665-4682 无过滤分支）；面板无焦点管理；render() 整文档重绘 + 全量 updateIcons（desktop-app.js:6288-6303）。
代码质量：data.js 135KB 演示 DSL 被桌面端加载却零引用（desktop.html:399）；desktop.html 与 index.html 对 data.js 版本号不一致；playwright.config.js 无 retries/workers/trace 且写死 Windows Chrome 路径（:12-14，现已有 PLAYWRIGHT_CHROME 兜底但默认仍指向 C:\）；无 CI；视觉回归 0 次 toHaveScreenshot（仅 agent-workspace-frontend.spec.js:209/267 截图不比对）。
分支注意：本地前端在 main@fe12e49（git status 有未提交的 playwright.config.js 改动），但 docs/frontend-todo-2026-11-26.md 声称工作分支应为 codex/device-management-stage-a-complete（2953db0），两者不一致，开工第一件事是 fetch --prune 对齐再动手。

## 二、目标

- 止血：匿名首访零用户接口请求、控制台零 401；登录成功后才初始化后端；登出彻底关闭 SSE 并重置后端状态。
- 数据链路：打通 GET /app/ui/widgets/{id}/data（Java + bridge + 前端渲染器），最近新闻 feed 在真实后端可用。
- 稳定性：82 用例在并发全量跑连续 3 次全绿；补 3 个回归用例锁定 401 风暴 / 匿名登录门 / sessionId 过滤。
- 结构：app.js 与 desktop-app.js 拆为按域模块（<=1500 行/文件），删除 HIDDEN_PAGE_IDS、演示对话、伪造会话等死代码与假数据。
- 【视觉】单一 token 层：新建 tokens.css 作为 color/radius/space/type/shadow 唯一真源，其余 6 份 CSS 只消费变量、不再各自 :root 定义。
- 【视觉】字号阶梯 11/12/13/14/16/20/24，正文 >=14px、辅助 >=12px，消灭 7-9px 信息性文字；深色底文字 alpha >=0.75，对比度达 WCAG AA。
- 【视觉】登录页与主界面统一：同一背景基调（浅灰绿）+ 同一 CTA（#a62466），去掉桌面登录近黑/珊瑚/金色割裂与双 canvas 并发动画。
- 【视觉】移动端：index.html 重写为最小移动壳（去掉 topbar/catalog/inspector/phone mockup/演示徽章），styles.css 拆为 tokens + mobile 模块并删除演示样式。
- 非目标：不改用 React/Vue 等框架重写；不重做 Java 后端架构；不新增新闻/小说分类功能（只做通用 feed 原语）；不改 bridge 的 SSE 隔离与 Java 用户隔离模型；不在本周期内做沙箱 iframe（B1）与定时 Agent（B2 仅做 widget_refresh 可选）。

## 三、审计结论：保留 / 重写

### 保留

- desktop-api.js（417 行）：API 层干净，统一 ApiError/query/connectEvents，作为共享客户端保留；仅补幂等 connectEvents/closeEvents 与 authMe 启动校验。
- src/agent-workspace-ui.js（260 行）：通用工作区渲染器，normalizeWidget/normalizeData/renderWidgetBody 分层清晰、逐字段 escapeHtml，直接复用为 feed/markdown/table 唯一渲染入口。
- assets/chat-timeline.js（114 行）：按 turn 分组的消息模型，独立可测，保留。
- src/markdown-renderer.js + assets/markdown.min.js + DOMPurify 白名单：XSS 防护扎实，保留。
- mobile-login.js / mobile-login.css：登录门结构（inert 锁、aria-modal、焦点管理、storage 同步、reduced-motion）质量最高，保留；只改触发时机与 signOut 增加 closeEvents/reset。
- desktop-login.js / desktop-login.css：登录门逻辑与无 FOUC 的 head 内 login-pending 保留；仅视觉令牌统一（去掉暗黑珊瑚）与 signOut 收口。
- muse-bridge/server.mjs 的「/api/* 默认拒绝 + 公开白名单」（909-930）、requireUser（179-186）、SSE 按 sessionOwner/userId 定向广播（152-259）：保留，作为安全基线。
- Java 用户隔离与审批链：AppAuthInterceptor、SessionService/UiWidgetService/DeviceService 的 requireXxx、Approval/Question 超时、设备令牌 SHA-256、WorkspaceService 与 WebFetchTool 的 SSRF/路径校验：保留并复用。
- 现有 82 个 Playwright 用例与 tests/ 下 mock 手法：保留，补强不重写。
- connectors.html/connectors.js/connectors.css：独立页，本轮只统一 token，不重写。

### 重写

- index.html：重写为最小移动壳——保留 head 的入口重定向脚本与 mobile-login-gate 整段 markup（index.html:52-250），删除 .app-shell 内 topbar/catalog-panel/demo-stage/phone-device/inspector-panel（index.html:253-480），只留一个全屏 #phone-screen 容器与 toast 挂载点；同步删除 app.js 对 demo 控件的引用。
- styles.css（10908 行/214KB）：重写为 tokens.css + mobile.css（按 chat/composer/panels/devices/skills/account 分区），删除 .demo-stage/.phone-device/.catalog-panel/.inspector-panel 与页目录相关死样式（styles.css:352/592/645）；保留并重做设计令牌。
- data.js（3809 行/135KB）：从 desktop.html:399 移除引用；移动端只保留真实需要的种子（账号资料字段、技能种子），删除 addGroup/addPage 演示页面目录 DSL。
- desktop.css + desktop-refresh.css + desktop-workspace.css（合计约 1.19 万行）：合并为单一 tokens.css + desktop.css 入口；删除被覆盖的重复 :root 与 .app-shell/.sidebar/.context-panel 重定义（desktop.css:138 vs desktop-refresh.css:70；desktop-refresh.css 自身两份 :root、三份 .context-panel）；desktop.html:20-23 只加载一份。
- app.js（9033 行）：按域拆为 src/mobile/{router,chat-stream,backend-init,skills,devices,account,workspace-ui,gestures}.js，esbuild 打包；删除 HIDDEN_PAGE_IDS（14-90）及 renderBots/renderRooms/renderForum/renderCompanion/renderPets/renderTavern/renderWorkshop（5017-5502）、buildIdeaSkillScript（6283+）、renderChatMessages 演示转写（3300-3493）、getFallbackMobileSessions（355-379）；聊天空态改为真实 loading/empty/error。
- desktop-app.js（8359 行）：拆为 src/desktop/{store,sessions,composer,context-panel,account,devices,skills,widgets,events}.js；模块级 const 数组（SESSIONS/SKILLS/MARKET_SKILLS）收敛进单一 store，删除 splice 原地改（1783/1953/1966）；删除 64-716 硬编码演示数据与 7211-8077 的 900 行 if 链，改查表分发。
- playwright.config.js：重写为 CI 可跑——chromium channel 而非写死 Windows 路径、projects（mobile/desktop viewport）、retries、workers 上限、trace:'retain-on-failure'、screenshot:'only-on-failure'、webServer 启动 bridge 静态托管。
- tests/：新增 helpers/mock-api.js 消除 4 处重复 mock；新增 auth-gate / session-filter / widget-data 契约用例；引入 @axe-core/playwright；引入 toHaveScreenshot 视觉基线（P1 建立、P2 对照）。
- 后端新增：UiWidgetDataService.java（抓取 RSS/Atom + 缓存 + SSRF 复用 WebFetchTool.validate + 限流）与 AppUiController GET /widgets/{id}/data；bridge server.mjs 增 GET /api/ui/widgets/:id/data（requireUser 后转发）。
- bridge 路由表重构（P3）：把 909-1521 的内联 if 链改为带 per-route 鉴权声明的表；收紧 /api/connector/*（922 公开+回落）、/api/dirs（1456 任意目录枚举）、移除 /api/auth/set（921/1451）与 /api/git/*（923/1500）死代码。

## 四、已核实的真 bug（P0 必修）

### 移动端

- **[blocker] 登录门与后端启动完全解耦：匿名加载即并发触发 health + 8 个用户接口（8-11 个 401 的根因）**
  - 证据：app.js:9004-9032 `init()` 无条件调用 `initializeMobileBackend()`（9021）；app.js:1390-1428 `initializeMobileBackend` 无任何登录态判断，直接 `api.health()`（1406）后 `Promise.allSettled([sessions, environments, devices, affinity, models, skills(market), skills(installed), mineSkills])`（1420-1427）。mobile-login.js:394-431 `initialize()` 在 `showGate()`（411）之后仍执行 `api.authMe()`（414）。mobile-login.js:316 派发 `qianbian:mobile-auth-success`，但 app.js 内没有任何监听（grep 无命中），后端初始化不会等登录成功。
  - 影响：生产匿名首访时，登录门刚出现，app.js 已同步发出约 10 个用户接口请求，产生控制台 8-11 个 401 噪音；浪费带宽、暴露接口、干扰登录体验，也把已修复的「/api 默认拒绝」白名单压力放大。
  - 建议：把 initializeMobileBackend 改为登录成功后触发：app.js 监听 `qianbian:mobile-auth-success`（或读取 activeSession 后）再初始化；匿名态只保留 health/公开接口，跳过 sessions/devices/skills 等受保护接口。这是修复 401 噪音的关键。
- **[high] 流式事件按 sessionId 过滤不彻底：缺 sessionId 的事件绕过过滤漏进当前会话**
  - 证据：app.js:1006-1018 `SESSION_SCOPED_MSP_METHODS`；app.js:1020-1029 过滤条件是 `SESSION_SCOPED_MSP_METHODS.has(method) && eventSessionId && state.backendSessionId && String(eventSessionId) !== String(state.backendSessionId)`，即仅当「eventSessionId 存在且与当前不同」才丢弃；eventSessionId 缺失或 backendSessionId 为 null 时全部放行。app.js:1030-1036 `turn/started` 无条件置 `state.backendTurnId`/`backendTyping=true`；app.js:1041-1081 `item/delta` 用全局 `state.backendTurnId` 建 assistant 消息。测试 mobile-backend-api.spec.js:268-298 直接以无 sessionId 的 `handleEvent` 调用验证，正好掩盖了该缺口。
  - 影响：bridge 若对某类事件不发 sessionId，或用户在无会话（home）状态下收到他处会话的事件，会把消息/typing/turnId 错误挂到当前上下文，产生串话和竞态；并发跑时可能闪失败。
  - 建议：对 SESSION_SCOPED_MSP_METHODS 内的方法强制要求 sessionId 且必须匹配 state.backendSessionId，否则丢弃；turn/started、item/delta 的 turnId 关联改为按事件内携带的 turnId 而非全局 state.backendTurnId。
- **[high] 聊天空态/未连接时向真实用户展示硬编码演示对话与伪造会话**
  - 证据：app.js:3309-3493 `renderChatMessages` 在 `!state.backendChatActive` 时渲染大段硬编码演示（`build-ui-atlas` 工具卡、『把手机上的千变所有 UI 界面做成 HTML』等）；app.js:355-379 `getFallbackMobileSessions` 伪造『千变界面复刻/主题与图标检查/页面交互检查』三个会话；app.js:479-487 `getMobileSessions` 在 backendSessionsLoaded 为 false 时返回这些假会话。
  - 影响：后端不可用/未登录时，真实用户看到的是别人的演示内容和假历史记录，误导用户以为有真实工作区数据，是产品级信任问题（与已知『视觉质量差、需要大改』同源）。
  - 建议：删除演示转写与伪造会话，改为真实的空态/错误态组件（复用 agent-workspace-ui.js 的 ui-widget-empty/ui-widget-error 模式），并按 backendConnected 状态区分『未连接/加载中/无会话』。
- **[high] app.js 是 9000 行巨石，混入大量已隐藏的废弃页面与演示逻辑**
  - 证据：app.js:1 共 9033 行；app.js:14-90 `HIDDEN_PAGE_IDS` 列出 60+ 个隐藏页面（bots/rooms/tavern/forum/pets/companion/plugins 等）；app.js:5017-5502 仍保留 renderBots/renderRooms/renderForum/renderCompanion/renderPets/renderTavern/renderWorkshop 等死代码；app.js:6080-6629 还有完整技能脚本生成器（IDEA_SKILL_PROFILES/buildIdeaSkillScript）。
  - 影响：维护成本极高、改动易引入回归，是『产品反馈效果差』的结构性原因；测试虽然 81/82 通过，但只覆盖了巨石中的主路径。
  - 建议：按职责拆分：router、chat/stream、backend-client、skills、devices、account、workspace-ui；删除 HIDDEN_PAGE_IDS 相关渲染与演示数据，app.js 收敛为移动端真实应用的入口。
- **[high] index.html/data.js/styles.css 仍是「UI Atlas 演示壳」结构，不是生产移动应用**
  - 证据：index.html:253-480 `.app-shell` 内是 topbar(『UI Atlas·全量交互演示』『仅前端模拟』)、catalog-panel、demo-stage/phone-device 模拟器、inspector-panel；data.js:1-60 是 addGroup/addPage/row/section 的演示页面目录 DSL（3809 行）；styles.css 10908 行，9755-9904 的响应式断点全在管这套演示壳，9906 注释才说『mobile entry is a real full-screen web app』。
  - 影响：生产手机端靠 CSS `display:none` 硬隐藏演示壳（styles.css:9934-9945），DOM 仍携带整套 atlas；视觉与结构都非真实产品形态，是『视觉质量差』的直接来源。
  - 建议：重写 index.html 为极简移动壳（去掉 catalog/inspector/phone 模拟器/topbar 演示项），data.js 仅保留移动端真实需要的数据（account/profile、skill 种子），styles.css 重做为移动设计系统。

### 桌面端前端

- **[high] 真 bug：登录前 initializeBackend() 无条件触发 8-11 个 401 并发请求**
  - 证据：desktop-app.js:8349 顶层直接 `initializeBackend();`；initializeBackend（2338-2437）除 `if (!api) return` 和 file:// 判断外没有任何登录/鉴权判断，2346-2350 先 health/location/ui，2362-2383 再 Promise.allSettled 并发 sessions/environments/devices/models/skills×3/automations/affinity 共 9 个请求。登录门（desktop-login.js:637-642）只把 app-shell 置 inert，并未阻止 initializeBackend。
  - 影响：与已知问题 2 直接对应：未登录时控制台 8-11 个 401。bridge 的「/api/* 默认拒绝 + 公开白名单」只是后端止血，前端仍在登录前狂发受保护请求，浪费带宽并制造噪音。
  - 建议：在 initializeBackend() 开头加鉴权门：仅当 `localStorage.getItem('qianbian-desktop-auth')==='true'` 且 profile.loggedIn!==false 时才执行后端初始化；否则置 apiAvailable=false、渲染演示态，并在 qianbian:auth-success 后统一再触发初始化。
- **[high] 真 bug：打开技能市场会清空用户的提醒/记忆（疑似从「清除数据」复制粘贴）**
  - 证据：desktop-app.js:7776-7796 的 `[data-open-skill-market]` 处理器里 7780-7788 执行 `state.customReminders=[]; state.customMemories=[]; state.reminderOverrides={}; state.deletedReminders=new Set(); state.deletedMemories=new Set(); state.reminderFilter='all'; state.memoryFilter='all'`，这些重置与打开市场无关，和 7981-8037 的 `[data-clear-local]` 清理逻辑完全同源。该入口可从 settings（2874）、skills 视图（2723）、右侧 skill-config 的 #skill-market-launcher（365, 5370-5372）多处触发。
  - 影响：用户点一次「技能市场」，右侧提醒/记忆面板立即变空，本次会话内自定义提醒/记忆丢失（虽未写回 localStorage、刷新可恢复，但属于静默数据破坏）。
  - 建议：删除 7780-7788 这段复制粘贴的重置语句，仅保留 `skillMarketQuery/Filter/Tab` 相关状态复位；并给 clear-local 与 open-market 各自维护独立的最小重置集合。
- **[high] 真 bug：setDesktopPublishPackage 引用未定义变量 fileName → ReferenceError**
  - 证据：desktop-app.js:3546-3557，3556 行 `showToast(\`已添加 ${fileName}\`, 'package-check')`，但函数内只有参数 fileOrName，没有 fileName 变量。拖拽/选择技能包（drop 8130、data-desktop-choose-package 7750、data-desktop-package-input change 8154）都会走到这里。
  - 影响：拖入或选择技能包后 renderRailDialog 已执行、packageName 已写入，但随后抛出 ReferenceError，toast 失败且可能中断后续处理，发布技能入口不可用。
  - 建议：改为 `const name = typeof fileOrName === 'string' ? fileOrName : (fileOrName?.name || '')`，3556 用 `已添加 ${name}`；建议补一个桌面端发布拖拽的 Playwright 用例覆盖此路径。
- **[high] 代码质量/结构：三份重叠的桌面 CSS 同时加载，desktop.css 几乎为死代码**
  - 证据：desktop.html:20-22 依次加载 desktop.css(2885行)→desktop-refresh.css(3956行)→desktop-workspace.css(5085行)。desktop-refresh.css 与 desktop.css 重复定义 :root/.app-shell/.sidebar/.main-workspace/.workspace-header/.context-panel（desktop.css:138 vs desktop-refresh.css:70、desktop.css:155 vs desktop-refresh.css:79、desktop.css:539 vs desktop-refresh.css:359）；desktop-refresh.css 自身还有两份 :root（1、1956）与三份 .context-panel（869、2184、2405）。
  - 影响：视觉样式靠「后加载覆盖前加载」叠加，层级、间距、对比度来源不明，改一个样式要跨 3 个文件排查，正是「视觉质量差、需要大改」却难以下手的结构根因。
  - 建议：合并为单一 design-token + 分区块的样式源（或至少删除 desktop.css、清掉 desktop-refresh.css 内的重复块），确立唯一权威来源，再在其上做视觉改版。
- **[high] 代码质量/结构：desktop-app.js 8359 行单体，约 700 行硬编码演示数据 + 900 行事件委托**
  - 证据：desktop-app.js:64-716 定义 SESSIONS/IDEAS/GOALS/FEED_ITEMS/SKILLS/MARKET_SKILLS/FILE_DETAILS/TASK_ACTIVITIES 等十几组硬编码数据；893-1101 是 200+ 字段的单一 state；7211-8077 是一条约 900 行的 click 委托，逐条 if 匹配 data-* 属性。
  - 影响：状态、渲染、副作用高度耦合，任何功能改动都要横跨数据常量/state/渲染函数/委托处理四处，维护与测试成本极高，且与后端返回数据混用（演示数据在后端可用前作为兜底）。
  - 建议：按域拆分为模块（sessions/composer/context-panel/account/devices/skills/widgets），抽出 store 与 render 分离；演示数据集中到 demo-data 模块并明确标注；事件委托改查表分发。

### 共享层与安全：desktop-api.js / data.js / app.js / desktop-app.js / mobile-login.js / desktop-login.js 的 API 调用、鉴权、SSE、存储、XSS，以及 muse-bridge/server.mjs 的 /api 路由与 authContext 契约

- **[high] 真 bug：登录前前端无条件并发 8~11 个用户接口，造成 401 风暴**
  - 证据：app.js:9021 在 init() 里无条件调用 initializeMobileBackend()；其内部 app.js:1406 先 health 再在 1419-1428 用 Promise.allSettled 并发 sessions/environments/devices/affinity/models/skills(market)/skills(installed)/mineSkills 共 8 个，随后 1473 refreshMobileUiWidgets 又发 api.ui()/uiData。desktop-app.js:8349 同样无条件 initializeBackend()；desktop-app.js:2346 health、2349 refreshAccountLocation(→api.location)、2350 refreshUiWidgets(→api.ui)、2373-2383 并发 9 个含 sessions/devices/mineSkills/automations/affinity。而登录门只是把 appShell.inert 置 true（mobile-login.js:174-179、desktop-login.js:186-193），并不阻止这些请求发出。
  - 影响：与已知问题 #2 完全对应：每个匿名首访产生 5~9 个 401（用户类接口被 bridge 默认拒绝），污染日志、浪费后端与 bridge 调用，且这些 401 被 allSettled 静默吞掉，用户无感知。
  - 建议：最小修复：把 initializeMobileBackend/initializeBackend 的触发从「DOM 就绪」改为「鉴权成功事件」后（qianbian:mobile-auth-success / qianbian:auth-success，desktop-app.js:8315 已有监听），并在未登录时只发 public 白名单接口（health/location/models/market）。或至少在其首行加一次 authMe() 门禁，未登录直接 return。
- **[high] 真 bug：/api/ui/widgets/{id}/data 后端未实现，feed 模块恒为空**
  - 证据：desktop-api.js:269-272 定义 uiData(widgetId) → GET /ui/widgets/{id}/data；前端在 desktop-app.js:6140 与 app.js:1285 调用 api.uiData(widget.id)。但 server.mjs 只有 POST /api/ui/widgets（1189）、PATCH/DELETE /api/ui/widgets/:id（1200-1216），没有任何 GET /api/ui/widgets/:id/data 路由；该路径最终落到 server.mjs:1521 返回 404 unknown endpoint。渲染器 normalizeData（src/agent-workspace-ui.js:47-56）把 404 后的空对象归一为 items:[]，renderFeed（90-111）输出「暂时没有内容」。
  - 影响：与已知问题 #3 对应：通用工作区渲染器已就绪，但 feed 数据永远拿不到，所有 feed 类模块展示空态，产品价值为 0。
  - 建议：最小修复：在 bridge 增加 GET /api/ui/widgets/:id/data（requireUser 后转发 java('/app/ui/widgets/:id/data')），后端同步实现该端点并返回 {items:[{title,summary,source,publishedAt,url}]}。
- **[high] 安全：/api/connector/* 整体公开且回落服务账号，可匿名写**
  - 证据：server.mjs:922 把 pathname.startsWith('/api/connector/') 纳入 publicApi 白名单，绕过 927-930 的 requireUser 门禁；随后 server.mjs:1302-1356 的 /api/connector/pair、heartbeat、config、tasks/next、tasks/result 全部直接 java() 转发，无 Cookie 时 java() 回落 bridge 服务账号 token（server.mjs:110-117）。
  - 影响：匿名访客可调用 connector 配置/配对/心跳等写接口，以服务账号身份操作后端连接器状态；这是默认拒绝修复后残留的最大回落面。
  - 建议：connector 端点应改用独立的设备/连接器 token 校验，或从公开白名单移除并按 method+路径精细授权；至少在写端点（config/pair）强制鉴权。

### 视觉与体验

- **[high] 移动端 index.html 本体是「UI Atlas」演示外壳而非真实产品界面**
  - 证据：index.html:259 副标题「UI Atlas · 全量交互演示」；index.html:265-266 顶部假状态徽章「仅前端模拟」「运行正常」；index.html:321-329 用 phone-device/phone-bezel/phone-screen 在桌面浏览器里渲染一个手机 mockup；index.html:358 右侧还有「页面检查器」面板。styles.css 与之配套（.demo-stage 592、.phone-device 645、.catalog-panel 352）。
  - 影响：C 端打开手机看到的不是一个正常移动 Web App，而是一个带手机框、假状态、检查器的设计目录/演示。产品反馈「视觉质量差」的根因之一：这个壳本身就不是交付形态，任何 CSS 打磨都救不了。
  - 建议：把真正的移动端主界面（对话/技能/设置）从 demo 壳里剥离出来作为 index.html 直出的产品 UI，删除手机 mockup、假状态徽章与检查器；demo 目录移到内部路由或独立页面。
- **[high] 无共享设计 token，6 套变量体系同名不同值**
  - 证据：canvas 背景四种：styles.css:10 #eceee9、desktop.css:3 #edf0ea、desktop-refresh.css:2 #f3f5f1、connectors.css:2 #f4f3ef、mobile-login.css:9 #f3f6f1；accent-ink 深色四种：styles.css:23/desktop.css:19 #7c174c、desktop-refresh.css:18 #7b194b、mobile-login.css:14 #7d174c、connectors.css:12 #81194e；success 四种：styles.css:26 #168566、desktop.css:21 #1b8067、desktop-refresh.css:19 #177d65、connectors.css:14 #176d60；warning 四种：styles.css:27 #c7841c、desktop.css:23 #b9781c、desktop-refresh.css:21 #b47418、connectors.css:16 #986817；danger 两种：styles.css:28 #c44d55、desktop.css:25 #bd4b57。
  - 影响：同一品牌在移动/桌面/登录/文档里出现 4-5 种不同的绿、4 种不同的红、4 种不同的金色，跨端观感必然割裂，也是「一眼差」最直接的原因。任何一处改色都要改 N 个文件。
  - 建议：建立单一 tokens.css（或 CSS 自定义属性层）作为唯一真源：color/radius/space/typography/shadow 全部从这里引用，其余文件只消费变量、不再各自 :root 定义。
- **[high] 登录页与主界面视觉语言割裂（桌面暗黑珊瑚 vs 应用浅灰绿梅红；移动深绿金 vs 浅灰绿）**
  - 证据：桌面登录 desktop-login.css:2 背景 #09090b（近黑）、:11 --login-accent #e94d73（珊瑚粉）、:13 --login-gold #f0b56a（金），登录按钮 1880 用该珊瑚色；而主界面 desktop-refresh.css:2 是 #f3f5f1（浅灰绿）、:15 accent #a62466。移动登录 mobile-login.css:44-51 用深绿 #14201a 头 + :17 金 #e7bc78 光束 + :9 米色 #f3f6f1 卡片；主界面 styles.css:10 是 #eceee9。
  - 影响：用户从登录页进入工作区会经历一次剧烈的明暗与色相跳变（黑→白、珊瑚→梅红、金→无），品牌认知断裂，显得「不高级、不像同一个产品」。
  - 建议：登录与主界面共用同一套 token 与背景基调：要么都走浅色灰绿+梅红，要么都走深色，CTA 统一用 #a62466；去掉桌面登录的珊瑚 #e94d73 与金色 #f0b56a，或在统一色板内作为受限的次强调色。
- **[high] 全局滥用 7–10px 微字，可读性差**
  - 证据：统计：styles.css 408 处 font-size 声明中 278 处 ≤10px、87 处 ≤8px；desktop-workspace.css 45 处 ≤8px；典型：desktop-refresh.css:118 品牌副标题 font-size:7px、mobile-login.css:168 品牌小字 8px、mobile-login.css:274 状态小字 8px、mobile-login.css:329 步骤号 8px、mobile-login.css:339-345 表单标签 10px。
  - 影响：大量关键文字（状态、标签、说明、品牌副标）在 8px 上下，中文字形在 8px 已接近不可辨，直接给人「拥挤、廉价、看不清」的第一印象，也影响无障碍。
  - 建议：建立字号阶梯（如 11/12/13/14/16/20/24），正文不低于 13px、辅助说明不低于 11px；把 7-9px 的「装饰性英文小标」作为极少数例外并确认非信息承载。
- **[high] 多处低对比度白字叠深色背景，不达 WCAG AA**
  - 证据：desktop-login.css:10 --login-faint: rgba(248,246,242,0.38)（近黑 #09090b 上，约 3:1 以下）；desktop-login.css:9 --login-muted: 0.62；mobile-login.css:274 状态小字 rgba(255,255,255,0.42)；mobile-login.css:235 段落 rgba(255,255,255,0.6)；mobile-login.css:275 再次 0.42；styles.css 中 rgba(255,255,255,0.38/0.36/0.34/0.32) 大量存在。
  - 影响：深色区的说明文字、页脚、状态提示几乎看不清，登录页「私密连接」「工作空间已就绪」等辅助信息形同虚设，进一步强化「廉价、不清晰」观感。
  - 建议：深色底上的正文/说明文字 alpha 提到 0.75–0.9，仅装饰性元素用低 alpha；用对比度工具校验，目标 4.5:1（正文）/ 3:1（大字）。

### 后端与部署

- **[high] 未实现接口：/app/ui/widgets/{id}/data（feed 无数据）**
  - 证据：AppUiController.java:28-53 只有 GET /app/ui、POST/PATCH/DELETE /app/ui/widgets；UiWidgetService.java:40-257 只有 list/create/update/delete，无数据抓取方法；muse-bridge/server.mjs:1200-1216 只有 PATCH/DELETE /api/ui/widgets/{id}，无 data 路由；docs/agent-workspace-plan-2026-11-26.md:36-38 明确该接口为 B0 待实现。
  - 影响：前端通用渲染器（feed/markdown/table）拿到 widget 后无数据源接口，点开空白；P0 验收场景「最近新闻列表」无法跑通，是当前整修前端时后端最优先的依赖。
  - 建议：按 plan B0 实现 GET /app/ui/widgets/{id}/data：读 widget.config.source 做 RSS/Atom/JSON 代理 + 缓存 + SSRF/超时/大小/频率限制 + 归属校验；bridge 增加 GET /api/ui/widgets/{id}/data；SSRF 校验复用 WebFetchTool.validate 的既有逻辑。
- **[high] 真bug/安全：短信未配置时回落固定验证码并明文返回**
  - 证据：SmsServiceImpl.java:48 DEV_CODE="1234"；:89 `isConfigured() ? randomCode() : DEV_CODE`；:93-96 未配置时直接 return code；AppAuthController.java:43-46 把 devCode 回传前端「测试码：xxx」。
  - 影响：生产一旦 AK/SK 缺失或配置丢失，任何手机号都能用固定「1234」登录且验证码明文可见，等同无验证登录（fail-open 且泄露）。
  - 建议：未配置短信渠道时显式抛错（fail-closed），绝不回落固定码；devCode 仅在显式 dev 开关打开时返回；登录码与返回的测试码彻底分离。

### 测试与质量

- **[high] CI 不可跑：无 CI 配置且写死 Windows 专属 Chrome 路径**
  - 证据：无 .github/workflows / .gitlab-ci.yml / Jenkinsfile（目录不存在）；playwright.config.js:12-14 写死 executablePath 为 C:\Program Files\Google\Chrome\Application\chrome.exe，仅 PLAYWRIGHT_CHROME 可覆盖；@playwright/test v1.65 未声明安装 chromium（package.json:15）。
  - 影响：标准 Linux/macOS CI runner 上无法运行；本地换机/未装该路径 Chrome 也跑不起来，测试无法作为 CI 门禁，回归只能靠手工。
  - 建议：新增 GitHub Actions：Ubuntu 镜像 + npx playwright install --with-deps chromium，去掉写死路径改为 channel:'chromium' 或让 executablePath 仅在 Windows 兜底；并加入 test:server 步骤。
- **[high] 闪失败根因：基于 7s 定时窗口的自动刷新断言（并发下超时）**
  - 证据：mobile-devices.spec.js:430-436 与 desktop-backend-api.spec.js:1503-1509 用 expect.poll(..., {timeout:7000}) 等待手动刷新后的第二次自动刷新；前端自动刷新间隔为固定值，并发全量时 CPU/GPU 争抢会突破 7s。playwright.config.js 无 retries 配置，一次抖动即失败。
  - 影响：并发全量跑时 1 例随机失败，与已知问题吻合；无 retries 使 CI 稳定性差。
  - 建议：将设备任务自动刷新断言改为等待可观测副作用（如任务状态变化）或注入可缩短的刷新时钟；给全量 CI 配 retries:2；若保留定时断言，将 timeout 提到刷新间隔 3 倍以上。
- **[high] 视觉回归完全缺失，无法支撑「视觉质量大改」**
  - 证据：全仓库 0 次 toHaveScreenshot（grep 确认）；仅 agent-workspace-frontend.spec.js:209/267 手工 page.screenshot 写 test-results/*.png，从未断言；.gitignore:4 把 test-results 排除，无基线可复用。
  - 影响：视觉改版无像素级护栏，产品反馈的视觉质量问题无法用测试度量/防止回退，只能靠人眼。
  - 建议：引入 Playwright toHaveScreenshot 基线，覆盖：移动/桌面登录页（多视口）、工作区首页、设备页、feed 四态、桌面端各响应式断点；接入 shard + 平台无关 snapshot（--update-snapshots 在 CI 重跑并 review diff）。
- **[high] 原始 bug#1 回归无测试覆盖：匿名 401 → 登录门未被断言**
  - 证据：mobile-login.spec.js:4-6 用 ?mobile=1&auth=1 强制渲染 #mobile-login-gate，绕过了真实 /api/auth/me 判定；mobile-devices.spec.js:55-67 虽 mock /auth/me 返回 401，但只为走 SMS 登录流程，从未断言「401 → 登录门出现/无工作区泄漏」。
  - 影响：登录门完全不显示的根因（bridge 对匿名回落服务账号）修复后，同类回归不会被测试捕获。
  - 建议：新增用例：mock /api/auth/me 返回 401，断言 #mobile-login-gate/#login-gate 可见且 app-shell 为 inert，且不渲染任何会话/设备数据。
- **[high] bug#2 无覆盖：登录前并发请求用户接口的 401 未被测试拦截**
  - 证据：用例普遍用 unlockDesktop 注入 localStorage 已登录（desktop-backend-api.spec.js:11-30、entry-redirect.spec.js:121-132）或 mock /auth/me 成功，无任何断言「登录前不调用 /sessions /devices /skills/mine /affinity」。
  - 影响：登录前 8-11 个 401 的修复（白名单默认拒绝）没有回归护栏，改回匿名回落又会静默复发。
  - 建议：新增用例：只 mock /auth/me 为 401 + /health + /events，加载页面后断言 calls 中不含任何用户数据接口；再断言登录成功后这些接口才被触发。

## 五、分阶段计划

### P0 止血与数据链路（认证门 + 401 风暴 + 事件隔离 + feed 接口 + 闪失败）

- 工期：7 个工作日（第 1-2 周）
- 范围：只改必要文件，不碰视觉；上线即可消除 401 噪音、串话竞态、三个真 bug，并让 feed 拿到真实数据。

任务：
- [ ] T0 分支对齐：git fetch --prune，确认工作分支 codex/device-management-stage-a-complete，处理未提交的 playwright.config.js；基线跑 3 次全量记录 flaky 示例与匿名 401 数。
- [ ] 移动端认证门解耦：app.js 删除 init() 中无条件 initializeMobileBackend()（app.js:9021）；新增 window.addEventListener('qianbian:mobile-auth-success', initializeMobileBackend)（事件见 mobile-login.js:316-317）；initializeMobileBackend 加 backendInitStarted 幂等守卫与首行 api.authMe() 校验，匿名只留 health/location/models。
- [ ] 桌面端认证门：desktop-app.js initializeBackend()（2338）首行加 `const me=await api.authMe().catch(()=>null); if(!me){state.apiAvailable=false; dispatch('qianbian:auth-required'); return}`；8315 的 auth-success 处理器末尾调用 initializeBackend() 且幂等；8349 顶层仅 isAuthenticated() 时调用；2384-2421 allSettled 全 401 时派发 auth-required 并显示登录门。
- [ ] 登出收口：app.js:8725 与 mobile-login.js:488 signOut 统一 api.closeEvents() + 重置 backendConnected/backendTimeline/backendSessionId/devices/skills/widgets；desktop-api.js:152 closeEvents 幂等化。
- [ ] 事件过滤修复：app.js:1020-1029 对 SESSION_SCOPED_MSP_METHODS 强制要求 eventSessionId 且等于 state.backendSessionId，否则丢弃；turn/started 用 params.turnId 关联而非全局 state.backendTurnId；item/delta 用事件内 turnId 定位。
- [ ] 真 bug D：desktop-app.js:3556 改为 `const name = typeof fileOrName==='string'?fileOrName:(fileOrName?.name||'')`，toast 用 name。
- [ ] 真 bug C：删除 desktop-app.js:7782-7789 的 customReminders/customMemories/overrides/deleted* 重置与误置的 state.loggedIn=true，仅保留 skillMarketQuery/Filter/Tab 复位。
- [ ] feed 后端 B0：新增 UiWidgetDataService.java + AppUiController GET /app/ui/widgets/{id}/data（归属校验、config.source 解析、RSS/Atom、缓存 refreshMinutes、8s 超时/1MB/私网拒绝复用 WebFetchTool.validate、统一 items 结构、失败返回 stale+error）；bridge server.mjs 在 1189 附近加 GET /api/ui/widgets/:id/data 走 requireUser 转发。
- [ ] 前端接线：app.js:1285 与 desktop-app.js:6140 已有 api.uiData + normalizeData，确认 404 不再被空对象吞；desktop 侧「动态」面板（desktop-app.js:5881 renderFeedPanel 硬编码 FEED_ITEMS）改为复用 renderUiWidget 数据源。
- [ ] 测试：新增 tests/auth-gate.spec.js（匿名 authMe 401 → 登录门可见、app-shell inert、零 /sessions|/devices|/skills/mine|/affinity 调用；登录后这些接口才触发）、session-filter 单测、widget-data 契约测试（真实 bridge 或 schema 断言）；playwright.config.js 加 retries:2/workers:4/trace。
- [ ] 闪失败：tests/mobile-devices.spec.js:430-436 与 tests/desktop-backend-api.spec.js:1503-1509 去掉 7000ms 定时窗口断言，改为等待任务状态可观测变化或注入短时钟（如 window.__qbRefreshInterval=200）。

验收：
- [ ] 匿名加载（无 Cookie）控制台 0 个 401，网络面板不含任何用户接口；登录成功后仅触发一次后端初始化（幂等，无重复 connectEvents）。
- [ ] auth-gate.spec.js 在失败修复前红、修复后绿；连续 3 次全量并发跑全绿。
- [ ] mock 一个 RSS 源后，/api/ui/widgets/1/data 返回 {widgetId,items,stale,error} 且前端 feed 渲染出 >=1 条；源失败时显示可重试错误态而非空白。
- [ ] desktop-app.js:3556 拖拽技能包不再抛 ReferenceError（新增用例覆盖）；打开技能市场后右侧提醒/记忆数量不变（新增用例）。
- [ ] 无 sessionId 的 turn/item 事件被丢弃，切换会话不串话（新增单测）。

### P1 结构与设计令牌层 + 视觉第一轮（可读性与一致性）

- 工期：7 个工作日（第 3-4 周）
- 范围：先建单一 token 源与字号/对比度基线，再做模块拆分与假数据清理；此阶段建立视觉基线快照，为 P2 大改做护栏。

任务：
- [ ] 新增 tokens.css：定义 color(canvas/panel/ink/muted/line/accent #a62466/success/warning/danger 单一值)、radius(6/10/14/20)、space、type(11/12/13/14/16/20/24)、shadow、motion；styles.css/desktop.css/desktop-refresh.css/desktop-workspace.css/mobile-login.css/desktop-login.css/connectors.css 全部改为消费 tokens.css，删除各自 :root 重复定义。
- [ ] 合并桌面 CSS：删除 desktop.css 被覆盖块，desktop-refresh.css 去重（1/1956 两份 :root、869/2184/2405 三份 .context-panel），desktop.html:20-23 收敛为 tokens.css + desktop.css 两个 link；统一 --sidebar-width/--context-width。
- [ ] 字体与对比度整改：styles.css 全量替换 <=10px 信息性字号（含 desktop-refresh.css:118 品牌副标 7px、mobile-login.css:168/274/329/339-345）；深色底文字 alpha 提到 0.75-0.9（desktop-login.css:9-10、mobile-login.css:235/274/275）；--radius-sm/md 区分（styles.css:31-32）。
- [ ] 可读性与触控：styles.css:9916-9917 对 .assistant-text/.user-bubble/.phone-message 恢复 user-select:text；mobile-login.css:471 复选框命中区、:729 关闭按钮、:1006 保持登录按钮提升到 >=44px。
- [ ] 移动壳重写：index.html 删除 topbar/catalog/demo-stage/phone mockup/inspector（253-480），保留 gate 与 #phone-screen；app.js 移除 renderControls 与 demo 控件绑定；styles.css 删除 demo 样式。
- [ ] app.js 拆分：抽取 router/chat-stream/backend-init/skills/devices/account/workspace-ui/gestures 模块，esbuild 打包；删除 HIDDEN_PAGE_IDS 与隐藏页渲染、演示对话、伪造会话；聊天空态用 agent-workspace-ui 的 empty/error 模式。
- [ ] desktop-app.js 拆分：store/sessions/composer/context-panel/account/devices/skills/widgets/events；SESSIONS/SKILLS/MARKET_SKILLS 收敛进 store；删除 64-716 演示常量和 900 行 if 链改查表。
- [ ] 体验修复：移除「工作」死标签或实现过滤+空态（app.js:4665-4682）；面板打开焦点管理（app.js:3855/4646）；data.js 从 desktop.html:399 移除，统一 index.html:496 与 desktop.html 版本号。
- [ ] 视觉基线：对登录页（桌面/移动多视口）、工作区首页、设备页、feed 四态、桌面断点建立 toHaveScreenshot 基线；接入 @axe-core/playwright 扫描登录/工作区/设备页。

验收：
- [ ] 全仓 grep 仅 tokens.css 出现 :root 定义颜色/圆角（允许组件局部变量但不得同名漂移）；4 种 canvas 灰绿收敛为 1 种，accent-ink 收敛为 1 种。
- [ ] styles.css 中 <=10px 信息性 font-size 降为 0（装饰性英文小标除外并标注）；axe 扫描登录/工作区无 serious/critical 对比度问题；聊天文本可长按复制。
- [ ] desktop.html 只加载 2 份 CSS；删除 data.js 后桌面首屏脚本体积下降 >=100KB。
- [ ] app.js 拆分后每个模块 <=1500 行，主 bundle 构建通过；HIDDEN_PAGE_IDS 相关渲染函数全部删除，82 用例仍绿。
- [ ] 视觉基线提交到仓库且 CI 可对照；「工作」标签要么有过滤结果要么已移除。

### P2 视觉大改（登录与主界面统一 + 页面级重做 + 性能）

- 工期：10 个工作日（第 5-6 周）
- 范围：在设计系统之上做真正的视觉重做：统一登录/主界面语言、重排布局与信息层级、去重绘性能问题；以 P1 基线对照评审。

任务：
- [ ] 登录与主界面统一：desktop-login.css 去掉 #09090b/#e94d73/#f0b56a，改用 tokens 的浅灰绿+梅红；mobile-login.css 深绿金头改为与主界面同基调；单 CTA 统一 #a62466。
- [ ] 动效预算：desktop.html:27-38 的 login-grid/beam/vignette + three.js + galaxy 双 canvas 砍到单一背景；移动端直接静态渐变；全部响应 prefers-reduced-motion；减少 backdrop-filter（现 styles.css 37 处）。
- [ ] 聊天与工作区重排：以 tokens 的 type/space 重建消息气泡、tool 卡、composer、审批卡、右侧 context-panel 的层级与间距；删除 syncChatAlignment 基于标题/主题按钮 rect 的测量（desktop-app.js:2675-2694），改 CSS grid 约束线程列宽。
- [ ] 性能：删除 render() 末尾整页 updateIcons 与整文档重绘（desktop-app.js:6288-6303），改为按区域更新；composer 不随 render 重建（5207/5271）；流式只更新对应 message-bubble。
- [ ] 「动态」面板改造：desktop.html:207-210 feed 走 renderUiWidgetPanel + api.uiData，与 /ui 列表 slot=feed 统一，删除 FEED_ITEMS。
- [ ] 移动端页面重做：聊天/技能/设备/账号/历史在新设计系统下重排；空态/加载/错误三态统一；修复 swipe 手势 isPrimary 与 pointer capture 释放（app.js:8837-8974）。
- [ ] 深色主题：补 desktop-workspace.css 深色覆盖（现 0 处 [data-theme=dark]），清除硬编码 #ffffff/#713052/rgba(7,12,10)。
- [ ] 视觉评审：用 P1 基线 review diff，逐页确认后更新基线；产品/设计签字。

验收：
- [ ] 登录页到工作区无明暗/色相跳变（同一 canvas 与 accent），品牌色仅 1 个主色 + 1 个受限次强调。
- [ ] 单次后端 turn 不再触发整文档 innerHTML 重建与全量 lucide 重扫（可用性能断言：流式期间 updateIcons 调用为 0，类似现有 desktop-backend-api.spec.js 的 __streamIconCalls 思路但不 monkeypatch rAF）。
- [ ] 深色主题下工作区面板无对比异常，无硬编码色。
- [ ] 视觉基线全部更新并经人工 review；axe 仍无 serious/critical。
- [ ] 移动端 390x844 与桌面 1440x1000 视觉一致、信息层级清晰、触控目标 >=44px。

### P3 安全收口、后端补全与工程化

- 工期：7 个工作日（第 7-8 周）
- 范围：把残留安全面收口、补可选后端能力、建立 CI 门禁，使整改可持续。

任务：
- [ ] bridge 路由表重构：909-1521 if 链改为 per-route 鉴权声明表；/api/connector/*（922）改为设备 token 校验，写端点强制鉴权；/api/dirs（1456）限定 QB_WORKSPACE_ROOT 或下线；移除 /api/auth/set（921/1451）与 /api/git/*（923/1500）。
- [ ] SMS fail-closed：SmsServiceImpl.java:48/89/93 未配置时抛错而非回落 1234；AppAuthController.java:43-46 测试码仅显式 dev 开关返回；上线前确认生产 SMS 已配置。
- [ ] 数据库与权限：qianbian_schema.sql 全量 DROP 改为 CREATE IF NOT EXISTS 或标注仅首次；补 qianbian_admin_menu.sql 的 dashboard:view（AdminQianbianController.java:54 现 403）；后续只走增量迁移。
- [ ] startTurn TOCTOU：server.mjs:455-495 在进入时同步占位 activeTurns.set(sessionId,{pending:true})，避免并发首轮覆盖。
- [ ] 可选后端补全：/app/automations B2 先做 widget_refresh（建 qb_schedule 表 + CRUD + 调度器，不耗 token）；affinity history 补 bridge 路由；application.yml 增 ui.agent-tools.enabled。
- [ ] CI：新增 .github/workflows/ci.yml（Ubuntu + npx playwright install --with-deps chromium + 去写死路径 + test:server + retries/trace 归档）；加 axe-core 与视觉基线分片。
- [ ] 后端测试：为 bridge 关键 handler 补 node:test（auth/me 匿名策略、/api/* 默认拒绝白名单、widgets/{id}/data schema）。
- [ ] 收尾：删除 data.js 演示包或移出生产构建；统一 index.html/desktop.html 版本号（现 20261120ml vs 20261118a）。

验收：
- [ ] 匿名无法调用任何 connector 写接口；/api/dirs 不再可枚举 /root；/api/auth/set 与 /api/git/* 返回 404。
- [ ] 短信未配置时登录请求显式报错而非 1234 通过；生产环境验证真实短信可收。
- [ ] CI 在 Linux 上绿跑；PR 必须绿 + 视觉基线 diff 无意外变更才可合并。
- [ ] 后台 overview 对 admin 可访问；schema 重跑不会清库（或有明确防护）。

## 六、第一周

1. Day 1（对齐与基线）：git fetch --prune，确认工作分支；处理未提交的 playwright.config.js；连续 3 次跑全量记录 flaky 用例与耗时；用无痕打开生产（只读浏览，不连服务器）或在本地 file:// 记录匿名 401 清单；输出 P0 工单与文件:行号清单。
2. Day 2（移动端 401 风暴）：app.js 删除 init() 中无条件 initializeMobileBackend()（app.js:9021），新增 qianbian:mobile-auth-success 监听 + initializeMobileBackend 幂等守卫 + authMe 前置；mobile-login.js:488 signOut 加 api.closeEvents()+重置；写 tests/auth-gate.spec.js（匿名零用户接口、gate 可见、登录后初始化一次）并跑绿。
3. Day 3（桌面端 401 风暴 + 假登录态）：desktop-app.js initializeBackend() 加 authMe 门禁与幂等；8315 auth-success 末尾触发初始化；2384-2421 全 401 → auth-required；desktop-api.js closeEvents 幂等；跑 desktop-backend-api 与新增桌面 auth 用例。
4. Day 4（事件隔离 + 两个真 bug）：app.js:1020-1029 强制 sessionId 匹配、turnId 按事件关联，补单测；desktop-app.js:3556 fileName→name；删除 desktop-app.js:7782-7789 误清空与误置 loggedIn；各补 1 个用例。
5. Day 5（feed 数据链路 + 闪失败）：实现 Java GET /app/ui/widgets/{id}/data（UiWidgetDataService + 控制器，SSRF 复用 WebFetchTool.validate、缓存、统一 items）与 bridge GET /api/ui/widgets/:id/data；前端确认 uiData 渲染；把 mobile-devices.spec.js:430 与 desktop-backend-api.spec.js:1503 的 7000ms poll 改确定性；playwright.config.js 加 retries/workers/trace；全量跑 3 次，收尾准备第 2 周初蓝绿发布 P0。

## 七、风险与回滚

- 生产在跑且不能长时间中断：前端是静态资源（/root/qianbian-deploy/bridge/web），采用「新目录并行上传 → symlink/目录原子切换 → 保留上一版本目录」的蓝绿方式；出问题 1 分钟内切回旧目录，不改 bridge 代码即可回滚静态部分。
- bridge 改动需 docker restart qianbian-bridge（秒级）：新增 widgets/data 路由与路由表重构放在低峰执行；严禁停 daofire-* 容器；改 nginx 前先 nginx -t。
- app.js/desktop-app.js 拆分引入回归：保留旧 bundle 作 fallback（URL ?legacy=1 或并行保留 app.legacy.js 一个版本），82 用例 + 视觉基线作为上线门禁；拆分期间不并行改视觉，避免双重变量。
- 登录门改造可能重现「登录页不显示」：不改 mobile-login.js 的 gate 判定与 inert 逻辑，只改「何时初始化后端」；上线前用匿名 authMe=401 用例强制验证 gate 可见且无数据泄漏。
- 401 风暴修复若用 authMe 门禁，每次首访多一次 authMe 往返：可接受（一次 401 属于预期），但要把该 401 在控制台静默（fetch 层标记 expected）；后续可改 /api/auth/me 返回 200+loggedIn:false 避免噪音。
- SMS 改 fail-closed 可能阻断真实登录（若生产未配 AK/SK）：先查生产配置或保留显式 dev 开关，灰度验证后再强制。
- 视觉大改无客观护栏：P1 必须先建立 toHaveScreenshot 基线再改，P2 以基线 diff review；跨平台字体渲染差异用阈值 + 固定容器镜像。
- 分支漂移：docs/frontend-todo-2026-11-26.md 声称 main 7c4fbf5 / codex 2953db0，而本地 main@fe12e49 且有未提交改动；开工先 fetch --prune 统一，避免把整改做到过期分支上。
- data.js 移除可能影响移动端仍未发现的引用：先 grep APP_DATA 全量确认，保留移动端最小种子后再删，桌面端移除后跑全量验证。
- SQL 全量 DROP 风险：任何 schema 文件禁止在生产重跑；迁移只加不删，先备份。
- 视觉/结构改动导致 Playwright 选择器失效：用例已多用 data-action/role，但 app.js 拆分时需保持这些属性；分批合并，每批跑全量。
