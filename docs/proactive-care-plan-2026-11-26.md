# 千变 · 主动关心型生活 Agent 计划（2026-11-26）

## 1. 产品定位

不是“问答 Agent”，而是**懂主人生活节奏、在合适时机主动关心主人**的 Agent。

核心不是收集一切，而是：

- 少量高价值信号（步数、位置、天气、App 内活跃）
- 长期记忆与契合度（知道用户是谁、喜欢什么语气）
- 时机判断与频率控制（不打扰、不油腻、不监控）

产品目标：让用户感到“它真的在意我今天过得怎么样”，愿意长期使用并付费。

## 2. 本期边界

**做**

- APK 套壳（Capacitor / 原生 WebView）
- 只读采集：步数、位置（系统定位/粗定位）、天气、设备基础信息、App 内行为
- 后端主动关心引擎：规则触发 + LLM 组织语言 + 频控 + 去重
- 站内消息 / 推送 / 「千变的关心」固定会话
- 用户开关：关心总开关、频率、静默时段、主题

**不做（本期明确放弃）**

- 操控其他 App、无障碍点击/滑动
- 截图、录屏、读取其他 App 界面
- 任何形式的“监控式”全量采集

## 3. 信号与数据模型

### 3.1 采集信号

| 信号 | 来源 | 说明 |
|---|---|---|
| `steps_daily` | APK 原生插件 | 今日累计步数、最近 2 小时增量、首次/最后活跃时间 |
| `location` | 系统定位（GPS/Wi-Fi 融合）或 IP | 城市级为主；精确坐标需单独授权，仅用于天气/附近 |
| `weather` | 后端天气服务 | 当前天气、降水类型/强度、温度、更新时间 |
| `app_activity` | 后端已有 | 最近聊天、技能使用、连续活跃天数 |
| `preferences` | 用户设置 | 静默时段、每日上限、关心主题、语气 |

**不存原始传感器流**，只存日聚合和事件；BSSID/SSID 不作为主定位手段。

### 3.2 表

```text
qb_life_signal
  id, user_id, date, steps_total, steps_delta_2h, city, lat, lon,
  weather_json, source, updated_at

qb_care_event
  id, user_id, type, payload_json, dedupe_key, status,
  scheduled_at, sent_at, reply_at, create_time

qb_care_preference
  user_id, enabled, quiet_start, quiet_end, max_per_day,
  topics_json, tone, updated_at
```

消息可写入现有会话体系（固定「千变的关心」会话），回复进入记忆/契合度，形成闭环。

## 4. 架构

```text
APK DeviceBridge（原生插件）
  └─ POST /app/device/signals（步数/位置/设备信息，日聚合）
          ↓
后端 LifeSignalService（归一化、日切分、差分）
          ↓
CareRuleEngine（规则触发：步数平台期、降雨、早晨/深夜、连续活跃）
          ↓
CareComposer（LLM + 人设 + 长期记忆 + 近期对话摘要）
          ↓
CareScheduler（静默时段、每日上限、24h 去重、相关性）
          ↓
站内消息 / 推送 / 「千变的关心」会话
          ↓
用户回复 → 记忆/契合度 → 下次更懂
```

## 5. MVP 关心规则

1. **步数平台期**：17:00–21:00，今日步数 > 5000，最近 90 分钟增量 < 200：
   > “今天已经走了 7,200 步啦，后来去哪休息了？脚还好吗？”
2. **降雨**：用户所在城市当前有降水：
   > “外面正在下小雨，出门记得带伞；已经在外面的话，别淋着。”
3. **早晨/深夜**：在允许时段内做轻问候/提醒休息；静默时段不发。
4. **久未联系/连续活跃**：低频问候，不制造焦虑。

约束：

- 每用户每天默认最多 1–2 条主动消息；
- 静默 23:00–08:00（可调）；
- 同一事件 24 小时内去重；
- 不使用“我一直在看着你”“我监控到”等措辞，用“注意到/想起/提醒”；
- 不做医疗、心理诊断；发现自伤/危机倾向转人工（沿用 Shua 的用户关怀经验）。

## 6. APK 采集方案

- **Android**：Capacitor 壳 + 原生插件
  - `TYPE_STEP_COUNTER`（开机累计，按日差分；Android 10+ 需 `ACTIVITY_RECOGNITION`；部分机型无传感器）
  - WorkManager / 前台服务定时读取；夜间与低电量策略
  - 系统定位（`LocationManager` / 高德/腾讯定位 SDK）
  - `POST_NOTIFICATIONS`（Android 13+）、通知渠道
  - 厂商后台限制引导（小米/华为/OPPO）
- **iOS**：`CMPedometer` 可查询历史步数 + CoreLocation；HealthKit 可选；APNs
- **WebView 本身**：只能拿网页 API 权限内的定位/运动传感器，**步数必须原生插件**。

## 7. 隐私与合规

- 首次开启逐项说明用途，主动关心默认关闭；
- 位置、健康（步数）属于敏感个人信息，单独同意、可随时关闭/删除；
- 只存日聚合与事件，不存原始传感器流和原始 Wi-Fi 数据；
- 隐私政策、商店审核、中国 PIPL；不做后台隐蔽采集；
- 用户可设置频率、静默时段、关闭主题；
- 不做医疗/心理诊断；危机情况人工介入。

## 8. 分阶段

**P-Care 0（后端 MVP，不依赖 APK）**

- 用 IP 定位 + 天气 + App 内活跃 + 模拟步数信号
- 实现 `qb_life_signal` / `qb_care_event` / `qb_care_preference`
- 规则引擎、频控、静默、去重、消息写入「千变的关心」会话
- 前端：关心设置页、消息入口、通知权限引导
- 用测试账号验收

**P-Care 1（APK 壳）**

- Capacitor + DeviceBridge：location / steps / notifications
- 后台同步、真机验证（Android 优先）
- 关闭无障碍/截图方向

**P-Care 2（个性化）**

- 记忆 + 契合度驱动语气、主题、时机
- 扩展天气/步数/作息场景
- 用户反馈学习（回复/忽略/关闭）

**P-Care 3（可选）**

- Health Connect / HealthKit 历史
- 桌面端同步、多设备 token

## 9. 路线调整

- **取消** Android 连接器的无障碍点击/截图（V2）与手机操控目标；
- 保留 Windows 连接器用于电脑文件/终端（与手机关心无关）；
- 多设备 token 同步排后；
- 当前前端大整改继续，但后续 UI 重点转向：关心设置、关心消息卡、通知体验。

## 10. 待确认

1. 天气源：和风天气 / 高德天气 / 现有 7timer，谁提供实时降水？
2. APK：Capacitor 优先，iOS 是否同期？
3. 主动消息默认频率、静默时段、是否允许自定义“人格/语气”？
4. 关心消息放固定会话还是独立“关心”页？
