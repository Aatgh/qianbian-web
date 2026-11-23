千变手机网页端
================

这是纯静态网页包，不包含后端服务或真实 API。

目录内容：
- index.html
- app.js
- data.js
- styles.css
- manifest.webmanifest
- assets/

部署方式：
1. 将整个目录上传到任意静态网站托管服务。
2. 必须保持目录层级不变。
3. 建议通过 HTTPS 访问，以启用完整的浏览器能力。
4. 入口地址为 index.html，默认进入 #/home。

本地预览：
在包目录执行：
python -m http.server 8080
然后访问：
http://127.0.0.1:8080/index.html#/home
