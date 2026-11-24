# 生产环境展示问题清单（2026-11-24）

C 端已上线：<https://agiqianbian.com>（HTTPS，SSE 正常，38 个技能已接入）。

以下问题都在**线上实测**确认，请前端处理。与后端相关的数据已经补好。

## P0：全站缺少 ICP 备案号（必须加）

按备案要求，网站页脚需展示：

> 湘ICP备2026043985号-3

并链接到 <https://beian.miit.gov.cn/>。

要求：

1. 首页、对话页、历史记录、技能空间、桌面端都要能看到，不能只在某一个页面。
2. 手机端不要被输入框遮挡，建议固定在底部安全区上方，或放进「设置 / 关于」页并保证首页也有一处可见。
3. 样式弱化（12px、次要色），不要抢主界面的视觉。
4. 链接 `target="_blank"` + `rel="noopener noreferrer"`。

示例：

```html
<a class="icp-footer" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
  湘ICP备2026043985号-3
</a>
```

```css
.icp-footer {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 4px);
  transform: translateX(-50%);
  z-index: 8;
  font-size: 11px;
  color: var(--phone-muted);
  text-decoration: none;
  pointer-events: auto;
}
```

如果担心遮住输入框，可在对话页把页脚放进「设置 → 关于」，同时在首页底部保留一行。

## P1：对话时间写死「今天 09:41」/「刚刚」

线上截图里，刚发送的消息上方显示「今天 09:41」，助手消息永远显示「刚刚」。

原因在 `app.js`：

- `renderChatMessages` 里写死了 `<div class="chat-day">今天 09:41</div>`（约 2281 行）。
- 历史抽屉的演示消息也写死了同样的时间（约 2301 行）。
- 助手消息渲染时 `time` 固定为「刚刚」（约 1921 行）：`item.status === "inProgress" ? "生成中" : "刚刚"`。
- 用户消息 `renderChatMessageUser` 没有时间参数。

后端已补：`/api/transcript`、`/api/session/resume` 的每个 item 现在带 `createdAt`（ISO 8601，带时区），例如：

```json
{
  "itemId": "m-3",
  "kind": "userMessage",
  "text": "你好",
  "createdAt": "2026-11-24T15:14:40.000+08:00",
  "done": true
}
```

建议：

1. 用第一轮消息的 `createdAt` 生成日期分组，不再写死。
2. 用户消息和助手消息都显示真实时间。
3. 格式规则：
   - 今天：`HH:mm`
   - 昨天：`昨天 HH:mm`
   - 更早：`M月D日 HH:mm`
4. `createdAt` 为空（流式进行中的 item）时显示「刚刚」或「生成中」，不要用固定 09:41。
5. 实时新消息也可以直接用本地时间，历史消息用 `createdAt`。

## P1：设置页的「最近活动：今天 09:41」也是写死的

`app.js` 约 1618 行：

```js
<span>当前设备已登录，最近活动：今天 09:41</span>
```

请改成真实最近活跃时间；没有数据时显示「刚刚」或隐藏这一行。

## P2：云部署后仍显示「本机工作区」

在服务器部署时，用户看到的是：

- `本机工作区`
- `云电脑 · 待配置`

当前 `/api/environments` 返回的 `local` 是服务端工作区，`cloud` 未配置。请业务确认文案：

1. 如果服务端就是工作区，建议把 `local` 的展示名改为「云端工作区」或「服务端工作区」。
2. 如果仍保留「本机 / 云电脑」两档，未配置的项置灰并显示“待配置”，不要让它看起来可用。
3. 接口失败时不要硬编码 fallback 成「本机工作区」，至少显示“工作环境读取失败”。

## P2：检查演示占位内容是否会出现在真实页面

`app.js` 里还有这些写死的演示内容：

- `今天先把 UI 演示里的所有入口跑一遍。`
- `通用模型 V4`、`12.4k Tokens`
- 部分演示对话

请确认这些只存在于设计演示路由，不会在真实会话/设置页中出现；如果可达，请替换成真实数据或移除。

## 已验证正常，不用改

- 手机 390×844：输入框、发送按钮完整，无横向溢出。
- 桌面 1440×900：布局正常。
- HTTPS + SSE：对话可正常流式返回。
- 工具过程已折叠在回答上方。

## 验收

1. `https://agiqianbian.com` 首页与对话页都能看到 ICP 号。
2. 新消息时间与手机当前时间一致，不再是 09:41。
3. 历史消息按真实日期分组。
4. 设置页不再出现写死的「今天 09:41」。
5. 手机端页脚不遮挡输入框。
