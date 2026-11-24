# 前端变更提醒（2026-11-24，请勿回退）

这 4 个桌面端文件已经在 `agiqianbian.com` 生产环境改动并验证。请前端同学保留这些行为，后续合并时不要回退：

- `desktop-login.js`
- `desktop-app.js`
- `desktop-api.js`
- `desktop.html`

## 1. 桌面端登录改成真实手机号验证码

原登录页是本地演示：任意手机号/邮箱 + 6 位密码即可进入。现在生产环境：

- 手机号 + 验证码走真实短信
- 未注册手机号验证码通过后自动注册
- 登录成功后写 HttpOnly Cookie `qb_app_token`
- 登录后刷新页面，切换到当前用户自己的会话与技能

使用的 bridge 接口：

```text
POST /api/auth/sms-code        { "phone": "手机号" }
POST /api/auth/login/phone     { "phone": "手机号", "code": "验证码" }
GET  /api/auth/me
POST /api/auth/logout
```

实现要点：

- `startCodeCountdown()` 调 `/api/auth/sms-code`
- `handleSubmit()` 在生产环境调 `/api/auth/login/phone`
- 非生产环境（localhost / github.io）仍保留演示登录
- 生产环境邮箱/密码登录会提示「当前仅支持手机号验证码登录」
- 登录成功后自动 reload，避免首屏仍使用 bridge 服务账号的数据
- 退出登录调用 `/api/auth/logout` 清除 Cookie

## 2. 契合度改成真实后端数据

以前：

```js
state.agentTraining = state.agentTraining + 4
```

是 localStorage 演示值，所以新用户发一句话就是 4%。

现在：

- `desktop-api.js` 新增 `affinity()` → `GET /api/affinity`
- 初始化时读取后端真实 `score`
- 每轮 `turn/completed` 后重新读取
- 删除每条消息 `+4` 的本地逻辑
- 最大显示值按后端限制为 **80%**

**产品规则：契合度最高 80%，不是 100%。**
Agent 无法彻底读懂人的主观思想，留出 20% 的不可知空间。

## 3. 不要重新加回演示逻辑

请后续合并时保留：

- 不要在 `desktop-app.js` 重新加入 `agentTraining + 4`
- 不要把 `affinity()` 删掉
- 不要把真实的 `/api/auth/*` 登录换回本地演示
- 不要把 `desktop.html` 里的资源版本号回退（浏览器缓存很强）

## 4. 后续前端还需要做

- 移动端目前还没有登录入口，未登录仍走 bridge 服务账号
- 「认识你」资料采集页面：出生年月、性别、城市、职业、身高体重、近视、健康、爱好、审美等
- 敏感字段授权与脱敏展示
- Agent 主动聊天的未读提醒/开关
- 契合度分档文案：0–19 初识 / 20–49 正在熟悉 / 50–79 默契渐成 / 80 贾维斯上限
