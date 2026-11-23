(() => {
  const gate = document.getElementById("login-gate");
  if (!gate) return;

  const root = document.documentElement;
  const body = document.body;
  const appShell = document.getElementById("app-shell");
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const codeInput = document.getElementById("login-code");
  const errorBox = document.getElementById("login-error");
  const successPanel = document.getElementById("login-success");
  const googleButton = gate.querySelector(".login-google-button");
  const googleLabel = gate.querySelector(".login-google-label");
  const submitButton = gate.querySelector(".login-submit");
  const submitLabel = gate.querySelector(".login-submit-label");
  const modeTabs = gate.querySelector(".login-mode-tabs");
  const passwordToggle = gate.querySelector(".login-password-toggle");
  const codeButton = gate.querySelector(".login-code-button");
  const emailContinue = gate.querySelector(".login-email-button");
  const forgotButton = gate.querySelector(".login-text-button");
  const legalButtons = gate.querySelectorAll(".login-legal button");
  const fieldElements = gate.querySelectorAll(".login-field");
  const themeToggle = document.getElementById("login-theme-toggle");
  const themePanel = document.getElementById("login-theme-panel");
  const themeClose = document.getElementById("login-theme-close");
  const themeGrid = document.getElementById("login-theme-grid");
  const themeName = document.getElementById("login-theme-name");
  const loginBoxToggle = document.getElementById("login-box-toggle");
  const loginPanelWrap = document.getElementById("login-panel-wrap");
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

  let mode = "password";
  let busy = false;
  let completionTimer = 0;
  let focusTimer = 0;
  let countdownTimer = 0;
  let countdown = 0;

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

  function renderThemeOptions() {
    if (!themeGrid) return;
    themeGrid.replaceChildren();
    const groups = window.QianbianLoginThemes || [];
    groups.forEach((group) => {
      const heading = document.createElement("div");
      heading.className = "login-theme-group-title";
      heading.textContent = group.label;
      themeGrid.append(heading);
      group.themes.forEach((theme) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "login-theme-option";
        button.dataset.loginTheme = theme.id;
        const swatch = document.createElement("span");
        swatch.className = "login-theme-swatch";
        swatch.style.setProperty("--theme-a", theme.colors[0]);
        swatch.style.setProperty("--theme-b", theme.colors[1]);
        swatch.style.setProperty("--theme-c", theme.colors[2]);
        const label = document.createElement("span");
        label.textContent = theme.name;
        button.append(swatch, label);
        button.addEventListener("click", () => {
          selectTheme(theme);
        });
        themeGrid.append(button);
      });
    });
    syncThemeSelection();
  }

  function getActiveTheme() {
    const activeId = window.QianbianLoginBackground?.current;
    return (
      window.QianbianLoginBackground?.themes.find(
        (theme) => theme.id === activeId,
      ) || window.QianbianLoginThemes?.[0]?.themes?.[0]
    );
  }

  function syncThemeSelection() {
    const active = getActiveTheme();
    themeGrid
      ?.querySelectorAll("[data-login-theme]")
      .forEach((button) => {
        const selected = button.dataset.loginTheme === active?.id;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    if (themeName && active) themeName.textContent = active.name;
  }

  function selectTheme(theme) {
    window.QianbianLoginBackground?.setTheme(theme.id);
    syncThemeSelection();
  }

  function toggleThemePanel(force) {
    if (!themePanel || !themeToggle) return;
    const open =
      typeof force === "boolean" ? force : themePanel.hidden;
    themePanel.hidden = !open;
    themeToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      syncThemeSelection();
      themePanel.querySelector(".login-theme-option")?.focus();
    } else {
      themeToggle.focus();
    }
  }

  function syncLoginBoxToggle(open) {
    if (!loginBoxToggle) return;
    gate.classList.toggle("login-box-open", open);
    loginBoxToggle.setAttribute("aria-expanded", String(open));
    const label = loginBoxToggle.querySelector("span");
    if (label) label.textContent = open ? "收起" : "登录框";
    loginBoxToggle.innerHTML = `<i data-lucide="${open ? "x" : "log-in"}"></i><span>${open ? "收起" : "登录框"}</span>`;
    updateIcons(loginBoxToggle);
    if (open) {
      window.requestAnimationFrame(() => {
        loginPanelWrap?.querySelector("button, input")?.focus();
      });
    }
  }

  function toggleLoginBox(force) {
    const open =
      typeof force === "boolean"
        ? force
        : !gate.classList.contains("login-box-open");
    syncLoginBoxToggle(open);
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
    googleButton.classList.remove("is-connecting");
    googleButton.removeAttribute("aria-busy");
    googleLabel.textContent = "使用 Google 继续";
    submitButton.classList.remove("is-submitting");
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitLabel.textContent = "登录";
    codeButton.disabled = false;
    codeButton.textContent = "获取验证码";
    gate.classList.remove("login-box-open");
    themePanel.hidden = true;
    themeToggle?.setAttribute("aria-expanded", "false");
    syncLoginBoxToggle(false);
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
      focusTimer = window.setTimeout(() => emailInput.focus(), 780);
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
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
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

  function syncFieldState(input) {
    input.closest(".login-field")?.classList.toggle(
      "has-value",
      Boolean(input.value.trim()),
    );
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeTabs.dataset.mode = mode;
    gate.querySelectorAll("[data-login-mode]").forEach((button) => {
      const active = button.dataset.loginMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    gate.querySelectorAll("[data-login-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.loginPanel !== mode;
    });
    hideError();
    submitLabel.textContent = "登录";
    if (mode === "password") passwordInput.focus();
    else codeInput.focus();
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    submitButton.disabled = nextBusy;
    submitButton.classList.toggle("is-submitting", nextBusy);
    submitButton.setAttribute("aria-busy", String(nextBusy));
  }

  function finishLogin({ email, name, method }) {
    const safeEmail = validEmail(email) ? email : defaultProfile.email;
    const existing = readProfile();
    const profile = {
      ...defaultProfile,
      ...existing,
      name:
        existing.name && existing.name !== defaultProfile.name
          ? existing.name
          : name || safeEmail.split("@")[0],
      email: safeEmail,
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

  function handleGoogleLogin() {
    if (busy) return;
    hideError();
    const email = validEmail(emailInput.value.trim())
      ? emailInput.value.trim()
      : defaultProfile.email;
    googleButton.classList.add("is-connecting");
    googleButton.setAttribute("aria-busy", "true");
    googleLabel.textContent = "正在安全连接 Google";
    busy = true;
    completionTimer = window.setTimeout(
      () => {
        finishLogin({
          email,
          name: email.split("@")[0],
          method: "google",
        });
      },
      reduceMotion.matches ? 80 : 920,
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    hideError();

    const email = emailInput.value.trim();
    const emailField = emailInput.closest(".login-field");
    if (!validEmail(email)) {
      showError("请输入有效的邮箱地址。", emailField);
      return;
    }

    if (mode === "password" && passwordInput.value.length < 6) {
      showError("请输入至少 6 位密码。", passwordInput.closest(".login-field"));
      return;
    }

    if (mode === "code" && !/^\d{4,6}$/.test(codeInput.value.trim())) {
      showError("请输入收到的 4 到 6 位验证码。", codeInput.closest(".login-field"));
      return;
    }

    setBusy(true);
    completionTimer = window.setTimeout(
      () => {
        finishLogin({
          email,
          name: email.split("@")[0],
          method: mode,
        });
      },
      reduceMotion.matches ? 80 : 760,
    );
  }

  function startCodeCountdown() {
    const email = emailInput.value.trim();
    if (!validEmail(email)) {
      showError("请先输入有效的邮箱地址。", emailInput.closest(".login-field"));
      return;
    }

    hideError();
    showInfo(`验证码已发送到 ${email}`);
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

  function togglePassword() {
    const visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    passwordToggle.setAttribute(
      "aria-label",
      visible ? "显示密码" : "隐藏密码",
    );
    passwordToggle.innerHTML = `<i data-lucide="${visible ? "eye" : "eye-off"}"></i>`;
    updateIcons(passwordToggle);
    passwordInput.focus();
  }

  function syncPointer(event) {
    if (reduceMotion.matches) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    root.style.setProperty("--login-pointer-x", `${x * 24}px`);
    root.style.setProperty("--login-pointer-y", `${y * 20}px`);
  }

  googleButton.addEventListener("pointermove", (event) => {
    const rect = googleButton.getBoundingClientRect();
    googleButton.style.setProperty(
      "--login-spot-x",
      `${event.clientX - rect.left}px`,
    );
    googleButton.style.setProperty(
      "--login-spot-y",
      `${event.clientY - rect.top}px`,
    );
  });
  googleButton.addEventListener("click", handleGoogleLogin);
  form.addEventListener("submit", handleSubmit);
  themeToggle?.addEventListener("click", () => toggleThemePanel());
  themeClose?.addEventListener("click", () => toggleThemePanel(false));
  loginBoxToggle?.addEventListener("click", () => toggleLoginBox());
  gate.addEventListener("pointermove", syncPointer, { passive: true });
  gate.addEventListener("pointerleave", () => {
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

  gate.querySelectorAll("[data-login-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.loginMode));
  });

  passwordToggle.addEventListener("click", togglePassword);
  codeButton.addEventListener("click", startCodeCountdown);
  emailContinue.addEventListener("click", () => {
    emailInput.focus();
    emailInput.select();
  });
  forgotButton.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (!validEmail(email)) {
      showError("请先输入邮箱地址，再获取重置链接。", emailInput.closest(".login-field"));
      return;
    }
    showInfo(`密码重置链接已发送到 ${email}`);
  });
  legalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showInfo("当前为本地演示登录，服务条款与隐私政策将在正式接入后生效。");
    });
  });

  window.addEventListener("qianbian:auth-required", () => {
    showGate({ focusEmail: true });
  });

  window.addEventListener("qianbian:login-theme-change", () => {
    syncThemeSelection();
  });

  document.addEventListener("keydown", (event) => {
    if (!body.classList.contains("login-locked")) return;
    if (event.key !== "Escape") return;
    if (themePanel && !themePanel.hidden) {
      event.preventDefault();
      toggleThemePanel(false);
    }
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

  renderThemeOptions();
  syncLoginBoxToggle(false);
})();
