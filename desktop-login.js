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
  const themeToggle = document.getElementById("login-theme-toggle");
  const themePanel = document.getElementById("login-theme-panel");
  const themeClose = document.getElementById("login-theme-close");
  const themeGrid = document.getElementById("login-theme-grid");
  const tuningToggle = document.getElementById("login-tuning-toggle");
  const tuningPanel = document.getElementById("login-tuning-panel");
  const tuningClose = document.getElementById("login-tuning-close");
  const tuningControls = document.getElementById("login-tuning-controls");
  const tuningReset = document.getElementById("login-tuning-reset");
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

  let accountType = "phone";
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
    return (
      window.QianbianLoginBackground?.config ||
      window.QianbianLoginThemes?.[0]?.themes?.[0]
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
    if (active && themeToggle) {
      const label = `选择主题，当前${active.name}`;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.title = label;
    }
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
      tuningPanel.hidden = true;
      tuningToggle?.setAttribute("aria-expanded", "false");
      syncThemeSelection();
      themePanel.querySelector(".login-theme-option")?.focus();
    } else {
      themeToggle.focus();
    }
  }

  const tuningFields = [
    { key: "speed", label: "动画速度", min: 0.2, max: 2.5, step: 0.05 },
    { key: "density", label: "粒子密度", min: 0.1, max: 2, step: 0.05 },
    { key: "size", label: "粒子大小", min: 0.4, max: 2.2, step: 0.05 },
    { key: "depth", label: "空间深度", min: 0, max: 2.5, step: 0.05 },
    { key: "twinkle", label: "闪烁强度", min: 0, max: 1, step: 0.05 },
    { key: "variant", label: "纹理变化", min: 0, max: 1.5, step: 0.05 },
  ];

  function renderTuningControls() {
    if (!tuningControls) return;
    const config = getActiveTheme();
    if (!config) return;
    tuningControls.replaceChildren();
    tuningFields.forEach((field) => {
      const row = document.createElement("label");
      row.className = "login-tuning-row";
      const name = document.createElement("span");
      name.textContent = field.label;
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(field.min);
      input.max = String(field.max);
      input.step = String(field.step);
      input.value = String(config[field.key] ?? field.min);
      const output = document.createElement("output");
      output.textContent = Number(input.value).toFixed(2);
      input.addEventListener("input", () => {
        const value = Number(input.value);
        output.textContent = value.toFixed(2);
        window.QianbianLoginBackground?.tune({
          [field.key]: value,
        });
      });
      row.append(name, input, output);
      tuningControls.append(row);
    });

    const colorLabels = ["主色", "辅色", "高光"];
    const colors = [...(config.colors || [])];
    colorLabels.forEach((label, index) => {
      const row = document.createElement("label");
      row.className = "login-tuning-row login-tuning-color-row";
      const name = document.createElement("span");
      name.textContent = label;
      const input = document.createElement("input");
      input.type = "color";
      input.value = colors[index] || "#ffffff";
      const output = document.createElement("output");
      output.textContent = input.value.toUpperCase();
      input.addEventListener("input", () => {
        colors[index] = input.value;
        output.textContent = input.value.toUpperCase();
        window.QianbianLoginBackground?.tune({
          colors: [...colors],
        });
      });
      row.append(name, input, output);
      tuningControls.append(row);
    });
  }

  function toggleTuningPanel(force) {
    if (!tuningPanel || !tuningToggle) return;
    const open =
      typeof force === "boolean" ? force : tuningPanel.hidden;
    tuningPanel.hidden = !open;
    tuningToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      themePanel.hidden = true;
      themeToggle?.setAttribute("aria-expanded", "false");
      renderTuningControls();
      tuningPanel.querySelector('input[type="range"]')?.focus();
    } else {
      tuningToggle.focus();
    }
  }

  function syncLoginBoxToggle(open) {
    if (!loginBoxToggle) return;
    gate.classList.toggle("login-box-open", open);
    loginBoxToggle.setAttribute("aria-expanded", String(open));
    const label = open ? "收起登录框" : "打开登录框";
    loginBoxToggle.setAttribute("aria-label", label);
    loginBoxToggle.title = label;
    loginBoxToggle.innerHTML = `<i data-lucide="${open ? "x" : "log-in"}"></i><span class="sr-only">${label}</span>`;
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
    submitButton.classList.remove("is-submitting");
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitLabel.textContent = "登录 / 注册";
    codeButton.disabled = false;
    codeButton.textContent = "获取验证码";
    gate.classList.remove("login-box-open");
    themePanel.hidden = true;
    tuningPanel.hidden = true;
    themeToggle?.setAttribute("aria-expanded", "false");
    tuningToggle?.setAttribute("aria-expanded", "false");
    syncLoginBoxToggle(false);
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
    if (reduceMotion.matches) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    root.style.setProperty("--login-pointer-x", `${x * 24}px`);
    root.style.setProperty("--login-pointer-y", `${y * 20}px`);
  }

  form.addEventListener("submit", handleSubmit);
  themeToggle?.addEventListener("click", () => toggleThemePanel());
  tuningToggle?.addEventListener("click", () => toggleTuningPanel());
  themeClose?.addEventListener("click", () => toggleThemePanel(false));
  tuningClose?.addEventListener("click", () => toggleTuningPanel(false));
  tuningReset?.addEventListener("click", () => {
    window.QianbianLoginBackground?.resetTuning();
    renderTuningControls();
  });
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

  window.addEventListener("qianbian:login-theme-change", () => {
    syncThemeSelection();
    if (!tuningPanel.hidden) renderTuningControls();
  });

  window.addEventListener("qianbian:login-theme-tuning", () => {
    syncThemeSelection();
  });

  document.addEventListener("keydown", (event) => {
    if (!body.classList.contains("login-locked")) return;
    if (event.key !== "Escape") return;
    if (themePanel && !themePanel.hidden) {
      event.preventDefault();
      toggleThemePanel(false);
      return;
    }
    if (tuningPanel && !tuningPanel.hidden) {
      event.preventDefault();
      toggleTuningPanel(false);
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
  renderTuningControls();
  syncLoginBoxToggle(false);
})();
