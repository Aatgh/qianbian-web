(() => {
  const gate = document.getElementById("login-gate");
  if (!gate) return;

  const root = document.documentElement;
  const body = document.body;
  const appShell = document.getElementById("app-shell");
  const form = document.getElementById("login-form");
  const phoneInput = document.getElementById("login-phone");
  const emailInput = document.getElementById("login-email");
  const phoneField = document.getElementById("login-phone-field");
  const emailField = document.getElementById("login-email-field");
  const accountTabs = gate.querySelector(".login-account-tabs");
  const codeInput = document.getElementById("login-code");
  const errorBox = document.getElementById("login-error");
  const successPanel = document.getElementById("login-success");
  const submitButton = gate.querySelector(".login-submit");
  const submitLabel = gate.querySelector(".login-submit-label");
  const codeButton = gate.querySelector(".login-code-button");
  const legalButtons = gate.querySelectorAll(".login-legal button");
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
    location: "杭州",
    timezone: "Asia/Shanghai",
    language: "简体中文",
    loggedIn: true,
  };

  let accountType = "phone";
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
    if (!draggingLogin || !loginPanelWrap) {
      dragPointerId = null;
      return;
    }
    draggingLogin = false;
    loginPanelWrap.classList.remove("is-dragging");
    loginPanelWrap.classList.add("is-snapping");
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
      reduceMotion.matches ? 20 : 560,
    );
  }

  function beginLoginDrag(event) {
    if (event.button !== 0 || !loginPanelWrap) return;
    event.preventDefault();
    clearLongPress();
    dragPending = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragPointerId = event.pointerId;
    longPressTimer = window.setTimeout(() => {
      draggingLogin = true;
      loginPanelWrap.classList.remove("is-snapping");
      loginPanelWrap.classList.add("is-dragging");
      loginPanelWrap.setPointerCapture?.(dragPointerId);
      navigator.vibrate?.(8);
    }, reduceMotion.matches ? 0 : 220);
  }

  function moveLoginDrag(event) {
    if (!draggingLogin || !loginPanelWrap) return;
    if (dragPointerId !== null && event.pointerId !== dragPointerId) return;
    event.preventDefault();
    const rect = loginPanelWrap.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth / 2 - rect.width / 2 - 12);
    const maxY = Math.max(0, window.innerHeight / 2 - rect.height / 2 - 12);
    const x = Math.max(
      -maxX,
      Math.min(maxX, event.clientX - dragStartX),
    );
    const y = Math.max(
      -maxY,
      Math.min(maxY, event.clientY - dragStartY),
    );
    loginPanelWrap.style.setProperty("--login-drag-x", `${x}px`);
    loginPanelWrap.style.setProperty("--login-drag-y", `${y}px`);
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
    successPanel.hidden = true;
    gate.classList.remove("is-leaving");
    gate.classList.remove("is-authenticating");
    submitButton.classList.remove("is-submitting");
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitLabel.textContent = "登录 / 注册";
    codeButton.disabled = false;
    codeButton.textContent = "获取验证码";
    gate.classList.add("login-box-open");
    setAccountType("phone");
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
      focusTimer = window.setTimeout(() => phoneInput.focus(), 780);
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
    phoneInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");
    codeInput.removeAttribute("aria-invalid");
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

  function setAccountType(nextType) {
    accountType = nextType;
    if (accountTabs) accountTabs.dataset.account = accountType;
    gate.querySelectorAll("[data-login-account]").forEach((button) => {
      const active = button.dataset.loginAccount === accountType;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    phoneField.hidden = accountType !== "phone";
    emailField.hidden = accountType !== "email";
    hideError();
    submitLabel.textContent = "登录 / 注册";
    if (accountType === "phone") phoneInput.focus();
    else emailInput.focus();
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    submitButton.disabled = nextBusy;
    submitButton.classList.toggle("is-submitting", nextBusy);
    submitButton.setAttribute("aria-busy", String(nextBusy));
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
      },
      reduceMotion.matches ? 180 : 980,
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    hideError();

    const identifier =
      accountType === "phone"
        ? phoneInput.value.trim()
        : emailInput.value.trim();
    const identifierField =
      accountType === "phone"
        ? phoneInput.closest(".login-field")
        : emailInput.closest(".login-field");
    if (accountType === "phone" && !validPhone(identifier)) {
      showError("请输入有效的 11 位手机号。", identifierField);
      return;
    }
    if (accountType === "email" && !validEmail(identifier)) {
      showError("请输入有效的邮箱地址。", identifierField);
      return;
    }

    if (!/^\d{4,6}$/.test(codeInput.value.trim())) {
      showError("请输入收到的 4 到 6 位验证码。", codeInput.closest(".login-field"));
      return;
    }

    setBusy(true);
    completionTimer = window.setTimeout(
      () => {
        finishLogin({
          identifier,
          type: accountType,
          name:
            accountType === "phone"
              ? `用户${identifier.slice(-4)}`
              : identifier.split("@")[0],
          method: `${accountType}-code`,
        });
      },
      reduceMotion.matches ? 80 : 760,
    );
  }

  function startCodeCountdown() {
    const identifier =
      accountType === "phone"
        ? phoneInput.value.trim()
        : emailInput.value.trim();
    if (accountType === "phone" && !validPhone(identifier)) {
      showError(
        "请先输入有效的 11 位手机号。",
        phoneInput.closest(".login-field"),
      );
      return;
    }
    if (accountType === "email" && !validEmail(identifier)) {
      showError(
        "请先输入有效的邮箱地址。",
        emailInput.closest(".login-field"),
      );
      return;
    }

    hideError();
    showInfo(
      `验证码已发送到${accountType === "phone" ? "手机号" : "邮箱"} ${identifier}`,
    );
    countdown = 30;
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

  function syncPointer(event) {
    if (reduceMotion.matches || dragPending || draggingLogin) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    root.style.setProperty("--login-pointer-x", `${x * 24}px`);
    root.style.setProperty("--login-pointer-y", `${y * 20}px`);
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
  gate.addEventListener("pointermove", syncPointer, { passive: true });
  gate.addEventListener("pointerleave", () => {
    if (dragPending || draggingLogin) return;
    root.style.setProperty("--login-pointer-x", "0px");
    root.style.setProperty("--login-pointer-y", "0px");
  });

  fieldElements.forEach((field) => {
    const input = field.querySelector("input");
    if (!input) return;
    input.addEventListener("input", () => {
      syncFieldState(input);
      hideError();
    });
  });

  gate.querySelectorAll("[data-login-account]").forEach((button) => {
    button.addEventListener("click", () =>
      setAccountType(button.dataset.loginAccount),
    );
  });

  codeButton.addEventListener("click", startCodeCountdown);
  legalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showInfo("当前为本地演示登录，服务条款与隐私政策将在正式接入后生效。");
    });
  });

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
