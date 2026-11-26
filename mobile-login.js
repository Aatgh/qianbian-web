(function () {
  "use strict";

  const gate = document.getElementById("mobile-login-gate");
  const form = document.getElementById("mobile-login-form");
  if (!gate || !form) return;

  const root = document.documentElement;
  const appShell = document.querySelector(".app-shell");
  const api = window.QianbianApi;
  const phoneInput = document.getElementById("mobile-login-phone");
  const phoneField = document.getElementById("mobile-auth-phone-field");
  const codeInput = document.getElementById("mobile-login-code");
  const codeField = document.getElementById("mobile-auth-code-field");
  const codeButton = gate.querySelector('[data-action="mobile-send-sms"]');
  const submitButton = gate.querySelector(
    '[data-action="mobile-login-submit"]',
  );
  const submitLabel = submitButton.querySelector("[data-submit-label]");
  const rememberInput = document.getElementById("mobile-login-remember");
  const feedback = document.getElementById("mobile-login-feedback");
  const successPanel = document.getElementById("mobile-auth-success");
  const legalDialog = document.getElementById("mobile-auth-legal-dialog");
  const legalPanel = legalDialog.querySelector(".mobile-auth-dialog-panel");
  const legalTitle = document.getElementById("mobile-auth-dialog-title");
  const legalCopy = document.getElementById("mobile-auth-dialog-copy");
  const params = new URLSearchParams(location.search);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const authKey = "qianbian-mobile-auth";
  const profileKey = "qianbian-mobile-profile";
  const forceAuth = params.get("auth") === "1";
  const loginRoute = /^#\/?login\b/i.test(location.hash);
  const hosted = /^https?:$/.test(location.protocol);
  const localHost = ["localhost", "127.0.0.1"].includes(location.hostname);
  const githubPages =
    location.hostname === "github.io" ||
    location.hostname.endsWith(".github.io");
  const remoteAuth = Boolean(
    api?.explicit ||
      (hosted && !localHost && !githubPages),
  );
  const needsAuth = forceAuth || loginRoute || (hosted && !localHost);
  const legalContent = {
    terms: {
      title: "服务条款",
      body: `
        <strong>千变移动工作空间</strong>
        <p>登录后，你可以同步对话、技能与设备连接。请妥善保管账号信息，并仅在你拥有权限的设备和工作区内使用相关能力。</p>
        <p>涉及远程设备、文件写入或自动化任务时，请在执行前确认操作范围。需要额外授权的能力会单独向你询问。</p>
      `,
    },
    privacy: {
      title: "隐私政策",
      body: `
        <strong>你的内容只属于你</strong>
        <p>手机号仅用于身份验证与账号识别。登录状态保存在当前设备，可在账号设置中随时退出并清除。</p>
        <p>对话与工作区数据会按照你所连接的千变服务处理；本地体验模式不会把输入内容发送到远端。</p>
      `,
    },
  };

  let busy = false;
  let countdown = 0;
  let countdownTimer = 0;
  let completionTimer = 0;
  let previousFocus = null;

  function updateIcons(target = gate) {
    window.lucide?.createIcons({
      root: target,
      attrs: {
        "stroke-width": "1.8",
        "aria-hidden": "true",
      },
    });
  }

  function readProfile(storage) {
    if (!storage) return null;
    try {
      const value = storage.getItem(profileKey);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  function activeSession() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        if (storage.getItem(authKey) === "true") {
          return {
            storage,
            profile: readProfile(storage),
          };
        }
      } catch {}
    }
    return null;
  }

  function clearSession() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        storage.removeItem(authKey);
        storage.removeItem(profileKey);
      } catch {}
    }
  }

  function persistSession(profile) {
    const storage = rememberInput.checked
      ? window.localStorage
      : window.sessionStorage;
    const otherStorage = rememberInput.checked
      ? window.sessionStorage
      : window.localStorage;
    storage.setItem(profileKey, JSON.stringify(profile));
    storage.setItem(authKey, "true");
    otherStorage.removeItem(authKey);
    otherStorage.removeItem(profileKey);
  }

  function maskPhone(phone) {
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
  }

  function normalizePhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length === 13 && digits.startsWith("86")
      ? digits.slice(2)
      : digits;
  }

  function currentPhone() {
    return normalizePhone(phoneInput.value);
  }

  function validPhone(phone) {
    return /^1\d{10}$/.test(phone);
  }

  function setFieldInvalid(field, invalid) {
    field.classList.toggle("is-invalid", invalid);
    const input = field.querySelector("input");
    if (invalid) input?.setAttribute("aria-invalid", "true");
    else input?.removeAttribute("aria-invalid");
  }

  function clearInvalidFields() {
    setFieldInvalid(phoneField, false);
    setFieldInvalid(codeField, false);
  }

  function setFeedback(message, tone = "muted") {
    feedback.textContent = message;
    feedback.dataset.tone = tone;
  }

  function clearFeedback() {
    setFeedback("验证码将发送至你的手机号");
  }

  function showError(message, field) {
    setFeedback(message, "error");
    clearInvalidFields();
    if (field) {
      setFieldInvalid(field, true);
      field.querySelector("input")?.focus();
    }
  }

  function lockApp() {
    root.classList.add("mobile-login-pending");
    if (!appShell) return;
    appShell.inert = true;
    appShell.setAttribute("aria-hidden", "true");
  }

  function unlockApp() {
    root.classList.remove("mobile-login-pending");
    gate.hidden = true;
    gate.classList.remove("is-ready");
    if (!appShell) return;
    appShell.inert = false;
    appShell.removeAttribute("aria-hidden");
  }

  function showGate({ focusPhone = false } = {}) {
    gate.hidden = false;
    successPanel.hidden = true;
    gate.classList.remove("is-authenticating");
    lockApp();
    updateIcons();
    window.requestAnimationFrame(() => {
      gate.classList.add("is-ready");
      if (focusPhone && !window.matchMedia("(pointer: coarse)").matches) {
        phoneInput.focus();
      }
    });
  }

  function setSubmitBusy(nextBusy) {
    busy = nextBusy;
    submitButton.disabled = nextBusy;
    submitButton.classList.toggle("is-busy", nextBusy);
    submitButton.setAttribute("aria-busy", String(nextBusy));
    submitLabel.textContent = nextBusy ? "正在验证" : "进入工作空间";
  }

  function setCodeButtonBusy(nextBusy, label = "获取验证码") {
    codeButton.disabled =
      nextBusy || countdown > 0 || !validPhone(currentPhone());
    codeButton.textContent = label;
  }

  function syncCodeButton() {
    if (countdown > 0 || busy) return;
    codeButton.disabled = !validPhone(currentPhone());
  }

  function startCountdown() {
    window.clearInterval(countdownTimer);
    countdown = 60;
    setCodeButtonBusy(true, `${countdown}s`);
    countdownTimer = window.setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        window.clearInterval(countdownTimer);
        countdown = 0;
        setCodeButtonBusy(false);
        return;
      }
      codeButton.textContent = `${countdown}s`;
    }, 1000);
  }

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function readableError(error, fallback) {
    const message = String(error?.message || "").trim();
    if (
      !message ||
      /failed to fetch|networkerror|load failed|network request failed/i.test(
        message,
      )
    ) {
      return fallback;
    }
    return message;
  }

  async function sendCode() {
    if (busy || countdown > 0) return;
    const phone = currentPhone();
    if (!validPhone(phone)) {
      showError("请输入有效的 11 位手机号", phoneField);
      return;
    }
    clearInvalidFields();
    setFeedback("正在发送验证码", "info");
    setCodeButtonBusy(true, "发送中");
    try {
      if (remoteAuth) {
        if (!api?.sendSmsCode) throw new Error("登录服务不可用");
        await api.sendSmsCode(phone);
      } else {
        await wait(reduceMotion.matches ? 60 : 520);
      }
      setFeedback(`验证码已发送至 ${maskPhone(phone)}`, "info");
      startCountdown();
      codeInput.focus();
    } catch (error) {
      countdown = 0;
      setCodeButtonBusy(false);
      showError(
        readableError(error, "验证码发送失败，请重试或稍后再试"),
        phoneField,
      );
    }
  }

  function buildProfile(phone, user = {}) {
    return {
      accountId:
        user.accountId ||
        user.id ||
        `qb_${phone.slice(-4)}_${Date.now().toString(36)}`,
      phone,
      nickname:
        user.nickname ||
        user.name ||
        `千变用户 ${phone.slice(-4)}`,
      loggedIn: true,
      authMethod: "phone-code",
      authMode: remoteAuth ? "remote" : "demo",
      lastLoginAt: new Date().toISOString(),
    };
  }

  function finishLogin(profile) {
    try {
      persistSession(profile);
    } catch {
      setSubmitBusy(false);
      showError("无法保存登录状态，请检查浏览器隐私设置", phoneField);
      return;
    }

    gate.classList.add("is-authenticating");
    successPanel.hidden = false;
    updateIcons(successPanel);
    window.dispatchEvent(
      new CustomEvent("qianbian:mobile-auth-success", {
        detail: {
          phone: profile.phone,
          nickname: profile.nickname,
          mode: profile.authMode,
        },
      }),
    );

    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(
      () => {
        const next = new URL(location.href);
        next.searchParams.delete("auth");
        next.hash = "/home";
        location.replace(next.href);
      },
      reduceMotion.matches ? 120 : 920,
    );
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (busy) return;
    const phone = currentPhone();
    const code = codeInput.value.replace(/\D/g, "").slice(0, 6);
    codeInput.value = code;

    if (!validPhone(phone)) {
      showError("请输入有效的 11 位手机号", phoneField);
      return;
    }
    if (!/^\d{4,6}$/.test(code)) {
      showError("请输入收到的 4 到 6 位验证码", codeField);
      return;
    }

    clearInvalidFields();
    setFeedback("正在确认你的身份", "info");
    setSubmitBusy(true);
    try {
      let user = {};
      if (remoteAuth) {
        if (!api?.loginPhone) throw new Error("登录服务不可用");
        const result = await api.loginPhone({ phone, code });
        user = result?.user || result?.account || {};
      } else {
        await wait(reduceMotion.matches ? 80 : 650);
      }
      finishLogin(buildProfile(phone, user));
    } catch (error) {
      setSubmitBusy(false);
      showError(
        readableError(error, "登录失败，请检查验证码后重试"),
        codeField,
      );
    }
  }

  function openLegal(kind) {
    const content = legalContent[kind];
    if (!content) return;
    previousFocus = document.activeElement;
    legalTitle.textContent = content.title;
    legalCopy.innerHTML = content.body;
    legalDialog.hidden = false;
    updateIcons(legalDialog);
    window.requestAnimationFrame(() => legalPanel.focus());
  }

  function closeLegal() {
    if (legalDialog.hidden) return;
    legalDialog.hidden = true;
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    previousFocus = null;
  }

  async function initialize() {
    clearFeedback();
    setSubmitBusy(false);
    setCodeButtonBusy(false);
    syncCodeButton();

    if (!needsAuth) {
      unlockApp();
      return;
    }

    const session = activeSession();
    if (!remoteAuth && session?.profile?.loggedIn) {
      unlockApp();
      return;
    }

    showGate();
    if (!api || !remoteAuth) return;
    try {
      const account = await api.authMe();
      const profile = buildProfile(
        session?.profile?.phone ||
          account?.phone ||
          account?.user?.phone ||
          "",
        account?.user || account || {},
      );
      profile.authMode = "remote";
      try {
        persistSession(profile);
      } catch {}
      unlockApp();
      window.dispatchEvent(
        new CustomEvent("qianbian:mobile-auth-success", {
          detail: {
            phone: profile.phone,
            nickname: profile.nickname,
            mode: "remote",
          },
        }),
      );
    } catch {
      if (session?.profile?.authMode === "remote") clearSession();
      showGate();
    }
  }

  phoneInput.addEventListener("input", () => {
    const phone = normalizePhone(phoneInput.value).slice(0, 11);
    if (phoneInput.value !== phone) phoneInput.value = phone;
    setFieldInvalid(phoneField, false);
    clearFeedback();
    syncCodeButton();
  });

  phoneInput.addEventListener("blur", () => {
    if (phoneInput.value && !validPhone(currentPhone())) {
      setFieldInvalid(phoneField, true);
    }
  });

  phoneInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      codeInput.focus();
    }
  });

  codeInput.addEventListener("input", () => {
    const code = codeInput.value.replace(/\D/g, "").slice(0, 6);
    if (codeInput.value !== code) codeInput.value = code;
    setFieldInvalid(codeField, false);
    clearFeedback();
  });

  codeButton.addEventListener("click", sendCode);
  form.addEventListener("submit", submitLogin);
  legalDialog
    .querySelectorAll("[data-auth-dialog-close]")
    .forEach((button) => button.addEventListener("click", closeLegal));
  gate.querySelectorAll("[data-auth-legal]").forEach((button) => {
    button.addEventListener("click", () =>
      openLegal(button.dataset.authLegal),
    );
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLegal();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== authKey) return;
    const session = activeSession();
    if (session?.profile?.loggedIn) unlockApp();
    else if (needsAuth) showGate();
  });
  window.addEventListener("qianbian:mobile-auth-required", () =>
    showGate({ focusPhone: true }),
  );

  window.__qianbianMobileAuth = {
    remote: remoteAuth,
    requiresAuth: needsAuth,
    initialize,
    signOut() {
      clearSession();
      window.QianbianApi?.closeEvents?.();
      window.dispatchEvent(new Event("qianbian:mobile-auth-required"));
      showGate({ focusPhone: true });
    },
  };

  initialize();
})();
