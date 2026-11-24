# Agent 工作模式与流式体验：前端接入说明（2026-11-24）

目标：像 WorkBuddy / 豆包一样支持「本机工作、云电脑工作、手机远程查看与操作」，并解决流式输出卡顿。

## 一、工作模式（需要前端加 UI）

后端已提供环境列表接口：

```
GET /api/environments
```

当前返回：

```json
{
  "environments": [
    {
      "id": "local",
      "name": "本机工作区",
      "kind": "local",
      "status": "ready",
      "detail": "在当前电脑的千变工作区执行文件、终端与脚本"
    },
    {
      "id": "cloud",
      "name": "云电脑",
      "kind": "cloud",
      "status": "not_configured",
      "detail": "需要配置远程云主机或容器后才能启用"
    }
  ]
}
```

前端建议：

1. 在输入框左侧或设置页加「工作环境」切换器：
   - 本机工作区（可用）
   - 云电脑（未配置时置灰，显示“待配置”）
2. 切换后把环境 id 放进会话开始/发送请求（后续接口预留 `executionTarget`）。
3. 会话标题或头部显示当前工作环境，避免用户不知道在哪运行。
4. 云电脑启用后，界面右栏或新窗口显示远程桌面/浏览器面板。

## 二、云电脑真正可用还缺什么

当前后端只能在本机工作区执行，**云电脑还没有实际执行主机**。要真正实现，需要：

1. 一台云主机/容器（Windows 或 Linux）
2. 远程执行通道（SSH / 远程 Agent / VNC）
3. 文件同步与工作区映射
4. 远程桌面画面传输
5. 权限、隔离、生命周期管理

前端可以先把「环境切换」和「云电脑面板」壳做好；后端把 `cloud` 状态从 `not_configured` 变成 `ready` 后再接真实能力。

## 三、桌面前端需要补的项目工作台

为了让「生成一个 Spring Boot + Vue 商城系统」可观察、可操作，建议加：

- 文件树 / 工作区浏览
- 终端面板（实时输出）
- 任务计划与步骤进度
- 产物列表（生成的文件、SQL、构建结果）
- 审批卡（写文件、执行命令）
- 长任务进度（不要把 200 步都塞进聊天流）

## 四、流式输出卡顿：前后端都要配合

已确认：

- 后端 DeepSeek 调用已改为 HTTP/1.1，简单问候 1～3 秒
- bridge 已把模型 delta 按 60ms 合并，减少事件频率
- 但前端如果在每个 `item/delta` 上执行整套 `render()`/`renderPhone()` + `updateIcons()`，仍会阻塞主线程，表现为“先出几个字 → 卡住 → 最后一次性出现”

前端建议：

1. **不要每个 delta 全量重渲染**：只更新当前 assistant 文本节点
2. 用 `requestAnimationFrame` 合并一帧内的多次更新
3. 不要在 delta 回调里调用 `updateIcons()` 或重建整个技能面板
4. 滚动到底部也用 rAF 节流（每 100ms 最多一次）
5. 大列表（技能市场 38 项）懒渲染或折叠

示例：

```js
let pendingText = "";
let frame = 0;
function onDelta(delta) {
  pendingText += delta;
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const node = document.querySelector("[data-streaming-text]");
    if (node) node.textContent += pendingText;
    pendingText = "";
  });
}
```

## 五、当前后端限制

- 单轮最多 200 步（已从 12 提高）
- 终端单条命令最多 300 秒
- 本机工作区为 `data/workspaces/u14`
- 没有 Docker/VM 隔离；云电脑需要额外基础设施
- 写文件、执行命令仍要审批

## 六、验收

1. 设置里能看到「本机工作区 / 云电脑」两个环境
2. 选择本机后会话正常
3. 云电脑未配置时明确显示不可用
4. 长回答流式输出连续、无明显“前几个字后卡住”
5. 工具过程折叠在回答上方，展开可见
6. 长任务有进度和文件树，不需要在聊天里刷 200 步
