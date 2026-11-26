# 按 IP 自动定位「所在地」（2026-11-26）

账号资料的「所在地」以前是前端写死的默认值（`杭州`），从未请求过真实位置。现在改为登录后按客户端 IP 解析城市级位置。

## 接口

```http
GET /api/location
```

bridge 转发到后端 `GET /app/location`。响应：

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

- 私网/回环 IP 无法定位：`{"ip":"","resolved":false}`，前端保持原值。
- `label` 是拼好的展示文案（`省 + 市`，直辖市只显示市），前端直接用它。
- IP 来源：nginx `X-Real-IP` → bridge 透传 `X-Client-IP` → 后端解析。客户端无法伪造（nginx 覆盖）。
- 后端优先用 ip-api 中文结果，失败依次降级 ip.sb / ipwho / ipapi.co；同 IP 缓存 10 分钟。

## 前端行为（本分支改动）

- `desktop-api.js`：新增 `api.location()`。
- `desktop-app.js`：
  - 初始化后端连接成功后调用 `refreshAccountLocation()`，把 `label` 写进 `state.accountLocation` 并持久化。
  - `accountLocationAuto`：默认 true；用户手动改过「所在地」后置 false，之后不再自动覆盖。
  - 移除三处写死的 `"杭州"` 默认值。
- `desktop-login.js`：默认档案 `location: ""`、`locationAuto: true`。
  - 老用户本地已存 `location: "杭州"` 且没有 `locationAuto` 字段，会按 true 处理，下次打开自动纠正一次。

## 注意

- IP 定位只能到城市级，且不同 IP 库结果可能不一致（同一个 IP 可能分别报「长沙」「怀化」「北京」）。所以「所在地」仍允许手动修改，手动改过就以手动为准。
- 如果要更准，接高德/腾讯 IP 定位 Web 服务（需要单独的 Web 服务 Key 和配额），不要把 App 端 Key 拿来用。
