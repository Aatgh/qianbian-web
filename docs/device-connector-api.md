# 设备连接器 API（V1，2026-11-25）

后端已完成设备配对、在线状态和 WSS 握手。前端可以据此做「我的设备」和工作环境选择。

## 认证

所有 `/api/devices/**` 请求带浏览器 Cookie `qb_app_token`（手机号验证码登录后由 bridge 写入 HttpOnly Cookie）。不要用 `Authorization`。

## 1. 生成配对码

```http
POST /api/devices/pair/start
Content-Type: application/json

{ "type": "windows", "name": "我的笔记本" }
```

`type` 仅支持 `windows` / `android`。

响应：

```json
{
  "pairingCode": "7YKN85",
  "expiresAt": "2026-11-25T10:21:25.196+08:00",
  "qrPayload": "{\"type\":\"qianbian-device\",\"code\":\"7YKN85\",\"server\":\"https://agiqianbian.com\"}",
  "type": "windows"
}
```

前端用 `pairingCode` 展示 6 位码，用 `qrPayload` 渲染二维码。配对码 10 分钟有效，一次性使用。

## 2. 设备列表

```http
GET /api/devices
```

```json
{
  "devices": [
    {
      "id": 1,
      "name": "我的笔记本",
      "type": "windows",
      "platform": "Windows 11",
      "status": "1",
      "lastSeenAt": "2026-11-25T10:11:37.000+08:00",
      "capabilitiesJson": "[\"files\",\"terminal\"]",
      "permissionsJson": null
    }
  ]
}
```

`status`：`0` 离线、`1` 在线、`2` 暂停。

## 3. 改名 / 暂停 / 解绑

```http
PATCH /api/devices/{id}
{ "name": "工作笔记本", "paused": false }

DELETE /api/devices/{id}
```

## 4. 连接器配对（连接器自己调用，不需要登录 Cookie）

```http
POST /api/connector/pair
{ "code": "7YKN85", "deviceName": "我的笔记本", "type": "windows", "platform": "Windows 11", "capabilities": ["files","terminal"] }
```

响应里的 `deviceToken` 只返回一次，连接器必须存到本机安全存储：

```json
{
  "deviceId": 1,
  "deviceToken": "6G4mDXiSqs7qkOlYP6b89C8iprHHYQCda0jDR6fhVXg",
  "name": "我的笔记本",
  "type": "windows",
  "userId": 7
}
```

## 5. WSS 连接

连接器建立长连接：

```text
wss://agiqianbian.com/ws/connector?deviceId=1&token=<deviceToken>
```

握手成功后服务器发送：

```json
{ "type": "hello", "ok": true, "deviceId": 1, "name": "我的笔记本", "deviceType": "windows" }
```

连接器每 20-30 秒发送：

```json
{ "type": "heartbeat" }
```

服务器回复：

```json
{ "type": "heartbeat", "ok": true }
```

连接断开后设备自动变成离线。

## 6. 设备状态 SSE

前端已有 `/api/events` 连接。设备状态变化时 bridge 推送：

```text
event: device/status
data: {"devices":[...]}
```

`devices` 与 `GET /api/devices` 的数组一致。前端收到后更新设备列表、工作环境选择器和在线状态，不需要轮询。

## 7. 设备任务（连接器执行）

用户/Agent 创建任务：

```http
POST /api/devices/{id}/tasks
{ "type": "fs.list", "payload": { "path": "C:/Users/me/Desktop" } }
```

查询任务：

```http
GET /api/devices/{id}/tasks
```

支持类型：

- `fs.list`：列目录
- `fs.read`：读文本
- `fs.write`：写文本
- `fs.mkdir`：建目录
- `terminal.exec`：执行命令

连接器拉取并回传：

```http
POST /api/connector/tasks/next
{ "deviceId": 1, "deviceToken": "..." }

POST /api/connector/tasks/{taskId}/result
{
  "deviceId": 1,
  "deviceToken": "...",
  "ok": true,
  "result": { ... },
  "error": null
}
```

连接器会按授权目录限制路径，系统目录和危险命令默认拒绝。

## 8. 尚未提供

- 截图预览
- 设备权限配置读写
- 设备任务审计查询页面
- 连接器安装包版本接口 `/api/connectors/releases`

这些会在桌面 GUI 和安装包阶段补上。
