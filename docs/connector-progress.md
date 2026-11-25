# 连接器开发进度与分工（2026-11-25）

前端请按这份进度对接，接口以 `docs/device-connector-api.md` 为准。

## 后端已完成并部署

- `qb_device` / `qb_device_pair_code` / `qb_device_task` / `qb_device_audit`
- 设备配对：`POST /api/devices/pair/start`、`POST /api/connector/pair`
- 设备列表/改名/暂停/解绑
- WSS：`wss://agiqianbian.com/ws/connector?deviceId=&token=`
- 设备上线/离线状态
- SSE：`event: device/status`
- 设备任务：`fs.list` / `fs.read` / `fs.write` / `fs.mkdir` / `terminal.exec`
- 连接器任务轮询与结果回传
- 手机号短信登录 + Cookie 会话

## 前端已完成

- 设备管理 Stage A：设备列表、配对、工作环境选择
- 手机端登录入口
- 设备状态展示

## 已完成（2026-11-25）

- Agent 工具路由到设备：
  - `list_files`、`read_file`、`write_file`、`edit_file`、`delete_file`、`grep_files`、`run_terminal`
  - 设备模式下走连接器任务，不再误操作服务器
- 设备任务：`fs.list/read/write/mkdir/edit/delete/grep`、`terminal.exec`
- 本地端到端实测：聊天读取 Windows 桌面文件成功
- 设备状态对前端统一映射为 `online/offline/paused`

## 前端下一步

1. 对接设备任务状态（可选）：`GET /api/devices/{id}/tasks`
2. 设备执行中的任务展示：设备名、任务类型、状态、耗时
3. 设备连接器的安装/下载页面，等待 OSS 发布接口
4. 移动端设备审批入口
5. 暂不做：实时屏幕预览、Android 无障碍操作（V2）

## 重要边界

- 前端不要自行生成有效配对码；必须使用后端返回的 `pairingCode` / `qrPayload`
- 前端不要轮询设备列表；使用现有 SSE 的 `device/status`
- 设备任务必须经过用户审批后再创建；不要直接给连接器发命令
- 设备令牌只在连接器本地保存，前端永远拿不到
- 后端未提供的接口不要自行 mock；先提 Issue

## 下一步排期

1. 后端：工具路由 + 审批（进行中）
2. 连接器：把 Node MVP 打包成 `千变 for Windows` 安装包
3. 前端：设备任务/审批 UI + 下载页
4. 联调：Windows 实测读桌面文件、执行命令


---

# 前端下一步开发计划（配合当前真实后端）

## 1. 设备状态事件

bridge 现在发送的是**单设备事件**：

```text
event: device/status
data: {
  "deviceId": "1",
  "status": "online",   // online / offline / paused
  "lastSeenAt": "...",
  "devices": [...]
}
```

同时新增：

```text
event: device/paired
event: device/removed
```

前端已有 `device/status` / `device/paired` / `device/removed` 处理，请确认桌面端和手机端都会刷新设备列表。

## 2. 设备下载页

真实接口已可用：

```http
GET /api/connectors/releases
```

当前返回 `0.1.0-test` Windows 未签名测试包：

- 平台：Windows
- 渠道：test
- 版本：0.1.0-test
- 大小：91,833,344 bytes
- SHA256：`e5b4c0311d00aefcdea1506ae2ce7a820a615e579f3e9f084e4ea8e0dc6c1ea3`
- 下载地址：OSS `connectors/windows/test/0.1.0/qianbian-connector.exe`
- `signed: false`

前端需要显示：

- 版本、平台、大小、SHA256
- “未签名测试版，Windows 可能提示发布者不明”
- 下载按钮
- 暂不提供 Android 包时显示“待发布”

## 3. 设备任务状态

```http
GET /api/devices/{id}/tasks
```

返回：

```json
[
  {
    "id": 1,
    "type": "fs.list",
    "payload_json": "...",
    "status": "done",
    "result_json": "...",
    "error": null,
    "create_time": "...",
    "started_at": "...",
    "finished_at": "..."
  }
]
```

建议在设备详情或任务面板展示：任务类型、状态、耗时、失败原因。

## 4. 设备审批

后端工具审批已经走现有 approval 事件。请确认审批卡能显示：

- `executionTarget`（设备 id）
- 设备名称
- 路径或命令
- 风险等级
- 允许一次 / 本会话 / 拒绝

## 5. 权限配置

后端下一步提供：

```http
GET /api/devices/{id}/permissions
PUT /api/devices/{id}/permissions
```

字段草案：

```json
{
  "allowedRoots": ["C:/Users/me/Desktop"],
  "terminal": true,
  "screenshot": false
}
```

前端可以先预留设备权限卡片，不要自行伪造接口。

## 6. 不要做的事

- 不要在前端生成有效配对码
- 不要轮询设备列表，使用 SSE
- 不要把设备令牌存到浏览器 localStorage
- 不要把未签名测试版标成正式版
- 不要 mock `/api/connectors/releases`、`/api/devices/*`

后端继续做权限、任务审批和安装包正式签名。
