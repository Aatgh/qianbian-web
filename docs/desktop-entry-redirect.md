# 电脑端入口与自动跳转（2026-11-24）

## 现状

- 根路径 <https://agiqianbian.com/> 是手机版页面，电脑打开也显示手机版对话窗口。
- 电脑版页面是 <https://agiqianbian.com/desktop.html>。
- 后端已经加了短地址：`/desktop` → 302 → `/desktop.html`（HTTP/HTTPS 都可用）。

## 需要前端做：按窗口宽度自动进入电脑版

这是前端仓库的工作，建议在手机版 `index.html` 的 `<head>` 里、页面渲染前判断，避免先闪一下手机版：

```html
<script>
  (function () {
    var forceMobile = new URLSearchParams(location.search).get("mobile") === "1";
    var userChoice = localStorage.getItem("qianbian-view-preference");
    var desktopScreen = window.matchMedia("(min-width: 1100px)").matches;
    var finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!forceMobile && userChoice !== "mobile" && desktopScreen && finePointer) {
      location.replace("/desktop.html");
    }
  })();
</script>
```

规则建议：

1. 宽度 ≥ 1100px **且** 使用鼠标/触控板（`pointer: fine`）才跳电脑版。
2. 平板、手机横屏、触摸设备不跳，避免误判。
3. 支持 `?mobile=1` 强制手机版；用户手动选择过手机版时记住偏好，不要每次强制跳回。
4. 用 `location.replace`，不要用 `location.href`，否则用户点浏览器返回会在两个页面之间来回跳。
5. `desktop.html` 里不要再反向跳回首页；桌面端提供一个「手机版」入口即可。

## 电脑版登录说明

当前 `desktop.html` 的登录页是前端演示校验：合法手机号/邮箱 + 至少 6 位密码即可进入，尚未接真实账号体系。这个属于前端后续要接的登录流程，和自动跳转分开处理。

## 需要前端补的入口

建议在两端各放一个明确入口：

- 手机版设置/菜单：`电脑版` → `/desktop.html`
- 电脑版账号菜单：`手机版` → `/?mobile=1`（或记住偏好后回首页）

## 验收矩阵

| 场景 | 期望 |
| --- | --- |
| 1440px 鼠标 | 自动进入 `/desktop.html` |
| 1280px 鼠标 | 自动进入 `/desktop.html` |
| 1024px 鼠标 | 留在手机版 |
| iPad 1024px 触摸 | 留在手机版 |
| 手机 390px | 留在手机版 |
| `agiqianbian.com/?mobile=1` | 强制手机版，不跳转 |
| 手动选择手机版后再次访问 | 尊重偏好，不自动跳 |
| 浏览器返回 | 不出现手机版/电脑版反复跳转 |

## 部署侧已完成

- `https://agiqianbian.com/desktop` → `https://agiqianbian.com/desktop.html`
- `https://agiqianbian.com/desktop/` 同样跳转
- 根路径暂时保持手机版，等前端自动跳转上线后再统一体验
