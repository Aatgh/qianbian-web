# 千变 Web

千变电脑端和手机端的纯静态 Web 演示项目，包含对话工作区、技能市场、任务面板、上下文配置和本地演示交互。

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
- `desktop-app.js`、`data.js`：电脑端交互和演示数据
- `index.html`、`styles.css`、`app.js`：手机端界面
- `assets/`：品牌、图标、字体和演示素材
- `docs/`：设计说明和实现计划
- `muse-desktop/`：基于 OpenMuse 的桌面端预览源码

## 说明

当前项目是可离线打开的静态前端演示，不包含真实后端、账号服务或模型接口。用户设置和部分交互状态保存在浏览器 `localStorage` 中。
