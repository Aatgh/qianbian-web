(() => {
  const gate = document.getElementById("login-gate");
  if (!gate) return;

  const root = document.documentElement;
  const body = document.body;
  const appShell = document.getElementById("app-shell");
  const form = document.getElementById("login-form");
  const accountInput = document.getElementById("login-account");
  const accountField = document.getElementById("login-account-field");
  const codeInput = document.getElementById("login-code");
  const passwordInput = document.getElementById("login-password");
  const errorBox = document.getElementById("login-error");
  const successPanel = document.getElementById("login-success");
  const submitButton = gate.querySelector(".login-submit");
  const modeSwitch = gate.querySelector(".login-mode-switch");
  const passwordToggle = gate.querySelector(".login-password-toggle");
  const codeButton = gate.querySelector(".login-code-button");
  const fieldElements = gate.querySelectorAll(".login-field");
  const loginPanelWrap = document.getElementById("login-panel-wrap");
  const loginPanel = gate.querySelector(".login-panel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const authKey = "qianbian-desktop-auth";
  const profileKey = "qianbian-desktop-account-profile";
  const defaultProfile = {
    accountId: "main",
    name: "千变用户",
    email: "demo@qianbian.ai",
    bio: "关注产品设计、工程实践与长期成长。",
    avatar: "assets/brand/qianbian-tile.png",
    phone: "",
    role: "产品与设计",
    company: "千变实验室",
    location: "",
    locationAuto: true,
    timezone: "Asia/Shanghai",
    language: "简体中文",
    loggedIn: true,
  };

  let accountType = "account";
  let loginMode = "password";
  let busy = false;
  let completionTimer = 0;
  let focusTimer = 0;
  let countdownTimer = 0;
  let countdown = 0;
  let longPressTimer = 0;
  let dragPending = false;
  let draggingLogin = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragPointerId = null;
  let dragFrame = 0;
  let dragTargetX = 0;
  let dragTargetY = 0;

  function readProfile() {
    try {
      const value = localStorage.getItem(profileKey);
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  }

  function isAuthenticated() {
    try {
      return (
        localStorage.getItem(authKey) === "true" &&
        readProfile().loggedIn !== false
      );
    } catch {
      return false;
    }
  }

  function updateIcons(target = gate) {
    window.lucide?.createIcons({
      root: target,
      attrs: {
        "stroke-width": "1.8",
        "aria-hidden": "true",
      },
    });
  }

  function clearLongPress() {
    window.clearTimeout(longPressTimer);
    longPressTimer = 0;
    dragPending = false;
  }

  function finishLoginDrag() {
    clearLongPress();
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    if (!draggingLogin || !loginPanelWrap) {
      dragPointerId = null;
      return;
    }
    draggingLogin = false;
    loginPanelWrap.classList.remove("is-dragging");
    loginPanelWrap.classList.add("is-snapping");
    loginPanelWrap.style.setProperty("--login-drag-rx", "0deg");
    loginPanelWrap.style.setProperty("--login-drag-ry", "0deg");
    loginPanelWrap.style.setProperty("--login-drag-x", "0px");
    loginPanelWrap.style.setProperty("--login-drag-y", "0px");
    if (
      dragPointerId !== null &&
      loginPanelWrap.hasPointerCapture?.(dragPointerId)
    ) {
      loginPanelWrap.releasePointerCapture(dragPointerId);
    }
    dragPointerId = null;
    window.setTimeout(
      () => {
        loginPanelWrap.classList.remove("is-snapping");
        loginPanelWrap.style.removeProperty("--login-drag-x");
        loginPanelWrap.style.removeProperty("--login-drag-y");
      },
      reduceMotion.matches ? 20 : 460,
    );
  }

  function beginLoginDrag(event) {
    if (event.button !== 0 || !loginPanelWrap) return;
    event.preventDefault();
    clearLongPress();
    dragPending = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragTargetX = 0;
    dragTargetY = 0;
    dragPointerId = event.pointerId;
    longPressTimer = window.setTimeout(() => {
      draggingLogin = true;
      loginPanelWrap.classList.remove("is-snapping");
      loginPanelWrap.classList.add("has-dragged");
      loginPanelWrap.classList.add("is-dragging");
      loginPanelWrap.setPointerCapture?.(dragPointerId);
    }, reduceMotion.matches ? 0 : 220);
  }

  function moveLoginDrag(event) {
    if (!draggingLogin || !loginPanelWrap) return;
    if (dragPointerId !== null && event.pointerId !== dragPointerId) return;
    event.preventDefault();
    const latest =
      event.getCoalescedEvents?.().at(-1) || event;
    const rect = loginPanelWrap.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth / 2 - rect.width / 2 - 12);
    const maxY = Math.max(0, window.innerHeight / 2 - rect.height / 2 - 12);
    dragTargetX = Math.max(
      -maxX,
      Math.min(maxX, latest.clientX - dragStartX),
    );
    dragTargetY = Math.max(
      -maxY,
      Math.min(maxY, latest.clientY - dragStartY),
    );
    if (dragFrame) return;
    dragFrame = window.requestAnimationFrame(() => {
      dragFrame = 0;
      if (!draggingLogin || !loginPanelWrap) return;
      loginPanelWrap.style.setProperty(
        "--login-drag-x",
        `${dragTargetX}px`,
      );
      loginPanelWrap.style.setProperty(
        "--login-drag-y",
        `${dragTargetY}px`,
      );
      loginPanelWrap.style.setProperty(
        "--login-drag-rx",
        `${maxY ? (-dragTargetY / maxY) * 9 : 0}deg`,
      );
      loginPanelWrap.style.setProperty(
        "--login-drag-ry",
        `${maxX ? (dragTargetX / maxX) * 12 : 0}deg`,
      );
    });
  }

  function setLocked(locked) {
    body.classList.toggle("login-locked", locked);
    root.classList.toggle("login-pending", locked);
    if (!appShell) return;
    appShell.inert = locked;
    if (locked) appShell.setAttribute("aria-hidden", "true");
    else appShell.removeAttribute("aria-hidden");
  }

  function clearCompletionTimer() {
    window.clearTimeout(completionTimer);
    completionTimer = 0;
  }

  function resetLoginState() {
    clearCompletionTimer();
    window.clearTimeout(focusTimer);
    window.clearInterval(countdownTimer);
    countdown = 0;
    busy = false;
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    loginPanelWrap?.classList.remove(
      "has-dragged",
      "is-dragging",
      "is-snapping",
    );
    loginPanelWrap?.style.removeProperty("--login-drag-x");
    loginPanelWrap?.style.removeProperty("--login-drag-y");
    loginPanelWrap?.style.removeProperty("--login-drag-rx");
    loginPanelWrap?.style.removeProperty("--login-drag-ry");
    successPanel.hidden = true;
    gate.classList.remove("is-leaving");
    gate.classList.remove("is-authenticating");
    submitButton.classList.remove("is-submitting");
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    accountInput.value = "";
    accountInput.closest(".login-field")?.classList.remove("has-value");
    passwordInput.value = "";
    codeInput.value = "";
    passwordInput.type = "password";
    passwordInput.closest(".login-field")?.classList.remove("has-value");
    passwordToggle?.setAttribute("aria-label", "显示密码");
    if (passwordToggle) {
      passwordToggle.innerHTML = '<i data-lucide="eye"></i>';
    }
    codeButton.disabled = false;
    codeButton.textContent = "获取验证码";
    gate.classList.add("login-box-open");
    accountType = "account";
    setMode("password");
    hideError();
  }

  function showGate({ focusEmail = false } = {}) {
    resetLoginState();
    gate.hidden = false;
    gate.classList.remove("is-ready");
    setLocked(true);
    updateIcons();

    if (reduceMotion.matches) {
      gate.classList.add("is-ready");
    } else {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => gate.classList.add("is-ready"));
      });
    }

    if (focusEmail) {
      focusTimer = window.setTimeout(() => accountInput.focus(), 780);
    }
  }

  function hideGate() {
    gate.classList.remove("is-ready");
    gate.classList.add("is-leaving");
    setLocked(false);

    completionTimer = window.setTimeout(
      () => {
        gate.hidden = true;
        gate.classList.remove("is-leaving");
        successPanel.hidden = true;
        resetLoginState();
        document.querySelector(".main-workspace")?.focus?.();
      },
      reduceMotion.matches ? 20 : 460,
    );
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
    errorBox.classList.remove("is-info");
    fieldElements.forEach((field) => field.classList.remove("is-invalid"));
    accountInput.removeAttribute("aria-invalid");
    codeInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
  }

  function showError(message, field) {
    errorBox.hidden = false;
    errorBox.classList.remove("is-info");
    errorBox.textContent = message;
    fieldElements.forEach((item) => item.classList.remove("is-invalid"));
    if (field) {
      field.classList.add("is-invalid");
      field.querySelector("input")?.setAttribute("aria-invalid", "true");
      field.querySelector("input")?.focus();
      window.setTimeout(() => field.classList.remove("is-invalid"), 420);
    }
  }

  function showInfo(message) {
    errorBox.hidden = false;
    errorBox.classList.add("is-info");
    errorBox.textContent = message;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validPhone(value) {
    return /^1\d{10}$/.test(value);
  }

  function syncFieldState(input) {
    input.closest(".login-field")?.classList.toggle(
      "has-value",
      Boolean(input.value.trim()),
    );
  }

  function accountTypeForIdentifier(value) {
    if (validEmail(value)) return "email";
    if (validPhone(value)) return "phone";
    return "account";
  }

  function setMode(nextMode) {
    loginMode = nextMode === "password" ? "password" : "code";
    if (modeSwitch) {
      modeSwitch.dataset.loginMode =
        loginMode === "password" ? "code" : "password";
      modeSwitch.textContent =
        loginMode === "password" ? "验证码登录" : "密码登录";
      modeSwitch.setAttribute(
        "aria-pressed",
        String(loginMode === "code"),
      );
    }
    gate.querySelectorAll("[data-login-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.loginPanel !== loginMode;
    });
    hideError();
    submitButton.setAttribute(
      "aria-label",
      loginMode === "password" ? "登录" : "登录 / 注册",
    );
    if (loginMode === "password") passwordInput.focus();
    else codeInput.focus();
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    submitButton.disabled = nextBusy;
    submitButton.classList.toggle("is-submitting", nextBusy);
    submitButton.setAttribute("aria-busy", String(nextBusy));
  }

  function realAuthEnabled() {
    return (
      /^https?:$/.test(location.protocol) &&
      !location.hostname.endsWith("github.io") &&
      !["localhost", "127.0.0.1"].includes(location.hostname)
    );
  }

  async function postJson(path, payload) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || data.msg || "请求失败，请稍后再试");
    }
    return data;
  }

  function finishLogin({ identifier, type, name, method }) {
    const safeEmail = validEmail(identifier)
      ? identifier
      : `${identifier.replace(/\D/g, "") || "user"}@phone.qianbian`;
    const existing = readProfile();
    const profile = {
      ...defaultProfile,
      ...existing,
      name:
        existing.name && existing.name !== defaultProfile.name
          ? existing.name
          : name || safeEmail.split("@")[0],
      email: safeEmail,
      phone:
        type === "phone"
          ? identifier
          : existing.phone || defaultProfile.phone,
      loggedIn: true,
      authMethod: method,
      lastLoginAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(authKey, "true");
    } catch {
      showError("无法保存登录状态，请检查浏览器隐私设置。");
      setBusy(false);
      return;
    }

    gate.classList.add("is-authenticating");
    successPanel.hidden = false;
    updateIcons(successPanel);

    window.dispatchEvent(
      new CustomEvent("qianbian:auth-success", {
        detail: {
          email: profile.email,
          phone: profile.phone,
          name: profile.name,
          method,
        },
      }),
    );

    completionTimer = window.setTimeout(
      () => {
        hideGate();
        // 登录后必须重新初始化，否则桌面端首屏仍拿 bridge 服务账号的数据
        if (realAuthEnabled()) {
          window.setTimeout(() => location.reload(), 120);
        }
      },
      reduceMotion.matches ? 180 : 980,
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    hideError();

    const identifier = accountInput.value.trim();
    if (!identifier) {
      showError("请输入账号、邮箱或手机号。", accountField);
      return;
    }
    if (identifier.includes("@") && !validEmail(identifier)) {
      showError("请输入有效的邮箱地址。", accountField);
      return;
    }
    if (/^\d+$/.test(identifier) && !validPhone(identifier)) {
      showError("请输入有效的 11 位手机号。", accountField);
      return;
    }
    accountType = accountTypeForIdentifier(identifier);

    if (loginMode === "password" && passwordInput.value.length < 6) {
      showError(
        "请输入至少 6 位密码。",
        passwordInput.closest(".login-field"),
      );
      return;
    }

    if (loginMode === "code" && !/^\d{4,6}$/.test(codeInput.value.trim())) {
      showError("请输入收到的 4 到 6 位验证码。", codeInput.closest(".login-field"));
      return;
    }

    if (!realAuthEnabled()) {
      setBusy(true);
      completionTimer = window.setTimeout(
        () => {
          finishLogin({
            identifier,
            type: accountType,
            name:
              accountType === "phone"
                ? `用户${identifier.slice(-4)}`
                : accountType === "email"
                  ? identifier.split("@")[0]
                  : identifier,
            method: `${accountType}-${loginMode}`,
          });
        },
        reduceMotion.matches ? 80 : 760,
      );
      return;
    }

    if (accountType !== "phone" || loginMode !== "code") {
      showError("当前仅支持手机号验证码登录，请切换到手机号 + 验证码。");
      return;
    }

    setBusy(true);
    postJson("/api/auth/login/phone", {
      phone: identifier,
      code: codeInput.value.trim(),
    })
      .then((data) => {
        setBusy(false);
        finishLogin({
          identifier,
          type: "phone",
          name: data.user?.nickname || `用户${identifier.slice(-4)}`,
          method: "phone-code",
        });
      })
      .catch((error) => {
        setBusy(false);
        showError(error.message || "验证码登录失败");
      });
  }

  async function startCodeCountdown() {
    const identifier = accountInput.value.trim();
    if (!identifier) {
      showError("请先输入手机号或邮箱。", accountField);
      return;
    }
    if (/^\d+$/.test(identifier) && !validPhone(identifier)) {
      showError("请先输入有效的 11 位手机号。", accountField);
      return;
    }
    if (identifier.includes("@") && !validEmail(identifier)) {
      showError("请先输入有效的邮箱地址。", accountField);
      return;
    }
    accountType = accountTypeForIdentifier(identifier);

    hideError();

    if (realAuthEnabled()) {
      if (accountType !== "phone") {
        showError("短信验证码暂只支持手机号登录。");
        return;
      }
      codeButton.disabled = true;
      codeButton.textContent = "发送中";
      try {
        const data = await postJson("/api/auth/sms-code", {
          phone: identifier,
        });
        showInfo(data.message || "验证码已发送");
      } catch (error) {
        codeButton.disabled = false;
        codeButton.textContent = "获取验证码";
        showError(error.message || "验证码发送失败");
        return;
      }
    } else {
      showInfo(
        accountType === "phone"
          ? `验证码已发送到手机号 ${identifier}`
          : accountType === "email"
            ? `验证码已发送到邮箱 ${identifier}`
            : `验证码已发送到账号 ${identifier}`,
      );
    }

    countdown = 60;
    codeButton.disabled = true;
    codeButton.textContent = `${countdown}s`;
    window.clearInterval(countdownTimer);
    countdownTimer = window.setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        window.clearInterval(countdownTimer);
        codeButton.disabled = false;
        codeButton.textContent = "获取验证码";
        return;
      }
      codeButton.textContent = `${countdown}s`;
    }, 1000);
  }

  function togglePasswordVisibility() {
    const visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    passwordToggle?.setAttribute(
      "aria-label",
      visible ? "显示密码" : "隐藏密码",
    );
    if (passwordToggle) {
      passwordToggle.innerHTML = `<i data-lucide="${visible ? "eye" : "eye-off"}"></i>`;
      updateIcons(passwordToggle);
    }
    passwordInput.focus();
  }

  form.addEventListener("submit", handleSubmit);
  loginPanel?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("input, textarea, select, button, a, label")) {
      return;
    }
    beginLoginDrag(event);
  });
  window.addEventListener("pointermove", moveLoginDrag, {
    passive: false,
  });
  window.addEventListener("pointerup", finishLoginDrag);
  window.addEventListener("pointercancel", finishLoginDrag);
  window.addEventListener("blur", finishLoginDrag);

  fieldElements.forEach((field) => {
    const input = field.querySelector("input");
    if (!input) return;
    input.addEventListener("input", () => {
      if (input === accountInput) {
        accountType = accountTypeForIdentifier(input.value.trim());
      }
      syncFieldState(input);
      hideError();
    });
  });

  gate.querySelectorAll("[data-login-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.loginMode));
  });

  passwordToggle?.addEventListener("click", togglePasswordVisibility);

  codeButton.addEventListener("click", startCodeCountdown);

  window.addEventListener("qianbian:auth-required", () => {
    showGate({ focusEmail: true });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === authKey && event.newValue !== "true") {
      showGate();
    }
  });

  if (isAuthenticated()) {
    gate.hidden = true;
    setLocked(false);
  } else {
    showGate();
  }

  gate.classList.add("login-box-open");
})();
