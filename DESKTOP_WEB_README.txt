千变电脑网页端
================

这是独立的纯静态电脑端版本，原手机端 index.html 不受影响。

入口：
- desktop.html

目录与依赖：
- desktop.html
- desktop.css
- desktop-app.js
- data.js
- assets/

本地预览：
python -m http.server 8080

访问：
http://127.0.0.1:8080/desktop.html

布局：
- 左侧：会话导航、最近对话、账号与主题
- 中间：对话流、输入区、添加内容面板
- 右侧：上下文、文件与运行状态

响应式：
- 1280px 以下右侧面板切换为浮层
- 980px 以下左侧导航收为窄栏
- 800px 以下切换为单栏抽屉式导航
