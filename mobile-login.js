(function () {
  "use strict";

  const gate = document.getElementById("mobile-login-gate");
  const form = document.getElementById("mobile-login-form");
  if (!gate || !form) return;

  const api = window.QianbianApi;
  const phoneInput = document.getElementById("mobile-login-phone");
  const codeInput = document.getElementById("mobile-login-code");
  const codeButton = gate.querySelector('[data-action="mobile-send-sms"]');
  const submitButton = gate.querySelector('[data-action="mobile-login-submit"]');
  const errorBox = document.getElementById("mobile-login-error");
  const params = new URLSearchParams(location.search);
  const forceAuth = params.get("auth") === "1";
  const production =
    /^https?:$/.test(location.protocol) &&
    !location.hostname.endsWith("github.io") &&
    !["localhost", "127.0.0.1"].includes(location.hostname);
  let countdown = 0;
  let timer = 0;

  function setError(message = "") {
    errorBox.textContent = message;
  }

  function setBusy(button, busy, label) {
    button.disabled = busy;
    if (label) button.textContent = label;
  }

  function lockApp() {
    document.documentElement.classList.add("mobile-login-pending");
    gate.hidden = false;
  }

  function unlockApp() {
    document.documentElement.classList.remove("mobile-login-pending");
    gate.hidden = true;
  }

  function validPhone() {
    const phone = phoneInput.value.trim();
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入 11 位手机号");
      phoneInput.focus();
      return null;
    }
    return phone;
  }

  function startCountdown() {
    window.clearInterval(timer);
    countdown = 60;
    codeButton.disabled = true;
    codeButton.textContent = `${countdown}s`;
    timer = window.setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        window.clearInterval(timer);
        codeButton.disabled = false;
        codeButton.textContent = "获取验证码";
        return;
      }
      codeButton.textContent = `${countdown}s`;
    }, 1000);
  }

  codeButton.addEventListener("click", async () => {
    if (!api || countdown > 0) return;
    const phone = validPhone();
    if (!phone) return;
    setError();
    setBusy(codeButton, true, "发送中");
    try {
      await api.sendSmsCode(phone);
      startCountdown();
    } catch (error) {
      setBusy(codeButton, false, "获取验证码");
      setError(error.message || "验证码发送失败");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!api) {
      setError("登录服务不可用");
      return;
    }
    const phone = validPhone();
    const code = codeInput.value.trim();
    if (!phone) return;
    if (!/^\d{4,6}$/.test(code)) {
      setError("请输入正确的验证码");
      codeInput.focus();
      return;
    }
    setError();
    setBusy(submitButton, true, "登录中");
    try {
      await api.loginPhone({ phone, code });
      localStorage.setItem("qianbian-mobile-auth", "true");
      window.dispatchEvent(
        new CustomEvent("qianbian:mobile-auth-success", {
          detail: { phone },
        }),
      );
      window.location.reload();
    } catch (error) {
      setBusy(submitButton, false, "登录 / 注册");
      setError(error.message || "登录失败");
    }
  });

  async function initialize() {
    if (!forceAuth && !production) {
      unlockApp();
      return;
    }
    lockApp();
    if (!api) {
      setError("登录服务不可用");
      return;
    }
    try {
      await api.authMe();
      unlockApp();
    } catch {
      lockApp();
    }
  }

  window.__qianbianMobileLogin = { initialize };
  initialize();
})();
