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
