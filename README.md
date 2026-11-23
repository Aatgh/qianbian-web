# 千变 Web

千变电脑端和手机端的纯静态 Web 演示项目，包含对话工作区、技能市场、任务面板、上下文配置和本地演示交互。

电脑端首次进入会显示全屏登录界面。当前登录为本地演示流程，不会向 Google 或任何外部服务发送账号信息。

登录视觉包含本地 WebGL 主题库，参考 AIDesigner 与 Vividsites 公开展示的主题重新实现，共 44 个预设并按星场、极光云气、光影渐变、玻璃金属、焦散水面、网格线框和印刷故障分类。所有主题默认使用千变 Logo 的深梅黑、梅红与白紫高光，具体颜色可在主题参数中调整，不依赖第三方背景运行时。

## 页面入口

- 电脑端：`desktop.html`
- 手机端：`index.html`

## 本地预览

```powershell
python -m http.server 8080
```

打开：

- <http://127.0.0.1:8080/desktop.html>
- <http://127.0.0.1:8080/index.html>

## 目录

- `desktop.html`、`desktop.css`、`desktop-refresh.css`、`desktop-workspace.css`：电脑端界面
- `desktop-login.css`、`desktop-login.js`：电脑端登录界面、动画和本地登录状态
- `src/login-three-scene.js`、`assets/login-three-scene.min.js`：Three.js 登录场景源码与离线构建产物
- `desktop-api.js`：千变后端 API 客户端，覆盖会话、SSE、审批、提问、模型、技能和导出接口
- `desktop-app.js`、`data.js`：电脑端工作区交互和演示数据
- `index.html`、`styles.css`、`app.js`：手机端界面
- `assets/`：品牌、图标、字体和演示素材
- `docs/`：设计说明和实现计划
- `muse-desktop/`：基于 OpenMuse 的桌面端预览源码

## 测试

```powershell
npm install
npm run test:e2e
```

修改 Three.js 登录场景后重新构建：

```powershell
npm run build:login-scene
```

## 后端联调

部署页与后端同源时默认使用 `/api`。本地静态预览可通过查询参数临时指定：

```text
desktop.html?api=http://192.168.1.10:3101/api
```

也可以把接口地址写入 `localStorage` 的 `qianbian-api-base`。后端不可用时页面自动回退到本地演示数据。

## 说明

当前项目是可离线打开的静态前端演示，不包含真实后端、账号服务或模型接口。登录状态、用户设置和部分交互状态保存在浏览器 `localStorage` 中。

登录框当前提供手机号/邮箱验证码的统一登录注册界面。`backend-api.md` 尚未定义用户认证接口，因此账号认证仍为本地演示流程。
