# 连接器开发进度与分工（2026-11-25）

前端请按这份进度对接，接口以 `docs/device-connector-api.md` 和本文件最新章节为准。

## 后端已完成并部署

- `qb_device` / `qb_device_pair_code` / `qb_device_task` / `qb_device_audit`
- 设备配对：`POST /api/devices/pair/start`、`POST /api/connector/pair`
- 设备列表/改名/暂停/解绑
- WSS：`wss://agiqianbian.com/ws/connector?deviceId=&token=`
- 设备上线/离线状态
- SSE：`event: device/status`、`device/paired`、`device/removed`
- 设备任务：`fs.list/read/write/mkdir/edit/delete/grep`、`terminal.exec`
- 连接器任务轮询与结果回传
- 设备权限读写、设备审计
- 手机号短信登录 + Cookie 会话

## 前端已完成

- 设备管理 Stage A：设备列表、配对、工作环境选择
- 手机端登录入口
- 设备状态展示与 `online/offline/paused` 映射
- `device/status` 单设备事件、完整设备数组、`device/paired`、`device/removed`
- 设备任务 API 客户端、任务面板、手刷和面板内自动刷新
- 设备任务兼容 `payload_json`、`result_json`、`create_time`、`finished_at`
- 设备审批上下文：设备名、系统类型、路径/命令、风险等级
- 真实版本清单下载页、未签名测试版提示、Android“待发布”
- 设备权限真实读写：授权目录、文件、终端、截图
- 设备审计列表：权限修改、任务创建/完成/失败等记录

## Agent / 连接器已完成

- Agent 工具路由到设备：`list_files`、`read_file`、`write_file`、`edit_file`、`delete_file`、`grep_files`、`run_terminal`
- 设备模式下走连接器任务，不再误操作服务器
- 本地端到端实测：聊天读取 Windows 桌面文件成功

## 设备下载页

真实接口：`GET /api/connectors/releases`。

当前返回 `0.1.0-test` Windows 未签名测试包：

- 渠道：test
- 大小：`91,833,344 bytes`
- SHA256：`e5b4c0311d00aefcdea1506ae2ce7a820a615e579f3e9f084e4ea8e0dc6c1ea3`
- 下载地址：OSS `connectors/windows/test/0.1.0/qianbian-connector.exe`
- `signed: false`

前端必须显示未签名提示，不能标成正式稳定版；Android 未发布时显示“待发布”。

## 设备任务状态

`GET /api/devices/{id}/tasks` 返回：

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

前端展示任务类型、状态、耗时和失败原因。

## 设备审批

后端工具审批走现有 approval 事件。审批卡展示设备 ID、设备名称、路径或命令、风险等级，以及允许一次 / 本会话 / 拒绝。

## 设备权限（已可用）

```http
GET /api/devices/{id}/permissions
PUT /api/devices/{id}/permissions
```

```json
{
  "allowedRoots": ["C:/Users/me/Desktop"],
  "terminal": true,
  "files": true,
  "screenshot": false
}
```

连接器在启动时和每 60 秒同步一次，权限变更无需重启。前端需要接入真实读写并展示保存状态。

## 设备审计（已可用）

```http
GET /api/devices/{id}/audit
```

返回配对、权限修改、任务创建和任务完成/失败记录。前端需要在权限卡或设备详情中展示最近审计记录。

## 重要边界

- 前端不要自行生成有效配对码；必须使用后端返回的 `pairingCode` / `qrPayload`
- 前端不要轮询设备列表；使用 SSE
- 不要把设备令牌存到浏览器 localStorage
- 不要把未签名测试版标成正式版
- 不要 mock `/api/connectors/releases`、`/api/devices/*`

## 下一步排期

1. 后端：设备任务审批事件
2. 连接器：Windows 安装包正式签名
3. 联调：Windows 实测读桌面文件、执行命令
