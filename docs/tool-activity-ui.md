# 工具过程展示优化建议（2026-11-23）

## 结论

天气工具连续失败 3 次的问题已经由后端修复；**工具/思考过程显示在回答下面** 是前端展示顺序问题。

## 1. 后端已修复：天气城市名

`local_weather` 现在会：

- 对「怀化鹤城区」「湖南怀化」「北京市朝阳区」这类写法做归一化
- 依次尝试原始名、去省份、去区县后缀、2/3/4 字城市前缀
- 仍然找不到时，自动退回公网 IP 定位，并在结果里注明
- 对同一个原始城市名做内存缓存，避免重复请求

实测「帮我查一下怀化鹤城区明天的天气」：

- 只有 **1 次** `local_weather` 调用
- 状态 completed
- 不再出现 3 次 failed 卡片
- 回答正常生成

前端不需要为这个再改，刷新后重新问即可。

## 2. 工具/思考过程应该放到回答上方（前端改）

现状：

- 后端按顺序推送 `reasoning` → `toolCall` → `agentMessage`
- 前端当前把消息和活动分成两个数组：`backendMessages`、`backendActivities`
- 渲染时先渲染所有消息，再渲染所有工具卡
- 所以工具卡出现在回答**下面**

建议改成豆包式：

```
┌──────────────────────────────┐
│ 已调用 1 个工具 · 1 次成功 〉  │   ← 可折叠的一行
└──────────────────────────────┘
千变的最终回答……
```

### 推荐实现

1. 不要分两个数组渲染。按事件时间维护一个 `timeline`：
   - `turn/started` 开一轮
   - `item/started`、`item/delta`、`item/completed` 往当前轮里追加
   - `turn/completed` 封口
2. 每一轮渲染顺序固定为：
   - 先渲染“本轮活动摘要”（reasoning + toolCall 汇总）
   - 再渲染本轮的 `agentMessage`
3. 活动摘要默认折叠，只显示一行：
   - 例：`调用 1 个工具 · 1 次成功 〉`
   - 例：`尝试 3 次 · 1 次成功 〉`
   - 点击展开后再显示每次工具的名称、参数、耗时、输出
4. 失败的 `toolCall` 不要单独占一张大卡片：
   - 折叠进摘要，展开后显示失败原因
   - 摘要里可以显示“3 次尝试，1 次成功”
5. reasoning 也不要单独铺开：
   - 有 toolCall 时合并进同一个活动块
   - 没有 toolCall 时，可以在活动块里显示“思考过程”
6. 活动块放在 `agentMessage` 上方，而不是下方。

### 事件数据已经够用

后端现有字段：

```json
{
  "itemId": "tool-44",
  "kind": "toolCall",
  "tool": "local_weather",
  "status": "completed",
  "args": "{\"city\":\"怀化鹤城区\",\"days\":3}",
  "visibleOutput": "怀化 9°C 小雨",
  "done": true
}
```

```json
{
  "itemId": "reason-xxx",
  "kind": "reasoning",
  "summary": ["用户想查天气，先确定位置"],
  "status": "completed"
}
```

前端自己按 `kind` 分组即可，不需要后端新增接口。

可选的后端增强（不是必须）：

- `turn/completed` 里附带 `activitySummary: { toolCount, successCount, failedCount, names }`
- 前端可以直接展示摘要文本，不用自己统计

## 3. 桌面端和手机端要一起改

- 桌面端：`desktop-app.js` 的 `renderBackendConversation()`
- 手机端：`app.js` 的 `renderBackendConversation()` / 同类函数

两端目前都存在“消息先、活动后”的问题，建议同步调整。

## 验证建议

用一个会触发工具的提问，例如：

> 帮我查一下怀化鹤城区明天的天气

期望：

1. 回答上方出现一行可折叠活动摘要
2. 摘要显示工具调用次数/成功次数
3. 展开后能看到 `local_weather` 的参数和结果
4. 回答在活动摘要下方
5. 不再出现多张 failed 工具卡堆在回答下面
