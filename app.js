(function () {
  "use strict";

  const D = window.APP_DATA;
  const api = window.QianbianApi || null;
  const pages = D.pages;
  const HIDDEN_GROUP_IDS = new Set([
    "workspace",
    "ai",
    "phone",
    "companion",
    "tavern",
  ]);
  const HIDDEN_PAGE_IDS = new Set([
    "model-sheet",
    "generate-sheet",
    "about",
    "updates",
    "licenses",
    "drawer",
    "quick-panel",
    "session-search",
    "engine",
    "remote",
    "engine-settings",
    "system-access",
    "performance",
    "background",
    "privacy",
    "diagnostics",
    "agent-team",
    "ssh-form",
    "remote-pairing",
    "network-details",
    "engine-schema",
    "subagent-settings",
    "agent-loop",
    "shell-settings",
    "permission-sheet",
    "host-switch",
    "context-sheet",
    "error-state",
    "empty-state",
    "subscription",
    "forum-topic",
    "forum-compose",
    "forum-search",
    "forum-notifications",
    "bots",
    "bot-chat",
    "bot-detail",
    "new-bot",
    "rooms",
    "room-chat",
    "room-detail",
    "new-room",
    "plugin-inventory",
    "plugins",
    "plugin-market",
    "plugin-detail",
    "plugin-settings",
    "skills",
    "access-pick",
    "access-summary",
    "hosted-links",
    "icons",
    "launch-screen",
    "launch-editor",
    "setup-runtime",
    "setup-appearance",
    "setup-access",
    "setup-api",
    "setup-connect",
    "setup-finish",
    "startup-failure",
    "session-detail",
    "trajectory",
    "usage",
    "all-features",
    "web-mode",
    "local-web",
    "interface",
    "language",
    "voice",
    "voice-reading",
    "text-size",
    "pets",
    "pet-picker",
    "pet-custom",
  ]);
  const RETAINED_SUB_PAGE_IDS = new Set([
    "notifications",
  ]);
  const visibleGroups = D.groups.filter((group) => !HIDDEN_GROUP_IDS.has(group.id));
  const visiblePages = D.flatPages.filter(
    (page) =>
      (!HIDDEN_GROUP_IDS.has(page.group) || RETAINED_SUB_PAGE_IDS.has(page.id)) &&
      !HIDDEN_PAGE_IDS.has(page.id),
  );
  const visiblePageIds = new Set(visiblePages.map((page) => page.id));
  const root = document.documentElement;
  const phoneScreen = document.getElementById("phone-screen");
  const phoneFit = document.getElementById("phone-fit");
  const catalogTree = document.getElementById("catalog-tree");
  const catalogEmpty = document.getElementById("catalog-empty");
  const catalogPanel = document.getElementById("catalog-panel");
  const inspectorPanel = document.getElementById("inspector-panel");
  const globalSearch = document.getElementById("global-search");
  const toastRegion = document.getElementById("toast-region");
  const srStatus = document.getElementById("sr-status");
  const ACCENT_IDS = ["a62466"];
  const AFFINITY_MAX = 80;
  const ACCENT_COLORS = {
    a62466: "#a62466",
  };
  const ACCENT_LABELS = { a62466: "深梅" };
  const storedAccent = localStorage.getItem("dshgo-atlas-accent");

  const state = {
    current: "home",
    page: null,
    history: ["home"],
    catalogSearch: "",
    collapsedGroups: new Set(),
    theme: localStorage.getItem("dshgo-atlas-theme") || "light",
    accent: ACCENT_IDS.includes(storedAccent) ? storedAccent : "a62466",
    agentTraining: 0,
    glass: localStorage.getItem("dshgo-atlas-glass") !== "false",
    reducedMotion: localStorage.getItem("dshgo-atlas-motion") === "true",
    engine: localStorage.getItem("dshgo-atlas-engine") || "running",
    network: localStorage.getItem("dshgo-atlas-network") || "online",
    host: localStorage.getItem("dshgo-atlas-host") || "phone",
    locale: localStorage.getItem("dshgo-atlas-locale") || "zh",
    device: localStorage.getItem("dshgo-atlas-device") || "390x844",
    sheet: null,
    dialog: null,
    toast: null,
    toggles: {},
    segments: {},
    chatMessages: [],
    chatDraft: "",
    backendChatActive: false,
    backendReady: false,
    backendConnected: false,
    backendSessions: [],
    backendSessionsLoaded: false,
    backendTimeline: [],
    environments: [
      {
        id: "local",
        name: "工作环境读取失败",
        kind: "local",
        status: "not_configured",
        detail: "无法读取可用工作环境",
      },
    ],
    executionTarget: "local",
    backendApprovals: [],
    backendInputs: [],
    backendSessionId: null,
    backendTurnId: null,
    backendTyping: false,
    backendModelId: null,
    backendModelLabel: "",
    lastActivityAt: null,
    devices: [],
    devicesLoaded: false,
    devicesOpen: false,
    pairing: null,
    deviceError: "",
    deviceEditingId: null,
    pairingFormOpen: false,
    pairingType: "windows",
    pairingName: "",
    deviceRevision: 0,
    deviceTasks: [],
    deviceTasksLoaded: false,
    deviceTasksLoading: false,
    deviceTasksError: "",
    terminalCommandCount: 0,
    catalogOpen: false,
    inspectorOpen: false,
    mainNavOpen: false,
    publishStep: 1,
    skillModal: null,
    skillDetail: null,
    downloadedSkills: new Set(),
    historyOpen: false,
    historyView: "chat",
    historyQuery: "",
    workbenchMode: "web",
    skillBrowserQuery: "",
    skillBrowserFilter: "all",
    skillBrowserGroupOpen: null,
    deletedSkills: new Set(),
    skillDeleteSelection: new Set(),
    skillMultiSelect: false,
    publishedSkillSelection: new Set(),
    publishedSkills: [],
    installedSkillEnabled: new Map(
      (pages.plugins?.pluginList || []).map((item) => [
        item.name,
        item.value !== "停用",
      ]),
    ),
    installedSkillSelection: new Set(),
    accountEditing: false,
    accountDraft: null,
    accountProfile: { ...(pages.account?.profile || {}) },
  };
  const COMPOSE_ACTIONS = [
    ["图片", "从相册选择", "image"],
    ["拍照", "使用相机", "camera"],
    ["文件", "从工作区选择", "folder-open"],
    ["引用", "把文件加入对话", "file-plus-2"],
    ["图像", "打开生成参数", "wand-sparkles"],
    ["视频", "打开视频参数", "video"],
    ["扫描", "扫描纸质文档", "scan-line"],
    ["更多", "查看全部能力", "ellipsis"],
  ];
  let pendingSheetAnimation = null;
  let sheetCloseTimer = null;
  let sheetClosing = false;
  let streamTextFrame = 0;
  let chatScrollFrame = 0;
  let chatScrollTimer = null;
  let lastChatScrollAt = 0;
  const pendingStreamItemIds = new Set();

  function isPageVisible(id) {
    return visiblePageIds.has(id);
  }

  function icon(name, extra = "") {
    return `<i data-lucide="${name}"${extra ? ` class="${extra}"` : ""}></i>`;
  }

  function conversationNavIcon(name) {
    const icons = {
      history: {
        viewBox: "0 0 1024 1024",
        paths: [
          "M0 603.062857m56.612571 0l910.774858 0q56.612571 0 56.612571 56.612572l0 0.073142q0 56.612571-56.612571 56.612572l-910.774858 0q-56.612571 0-56.612571-56.612572l0-0.073142q0-56.612571 56.612571-56.612572Z",
          "M0 307.638857m56.612571 0l910.774858 0q56.612571 0 56.612571 56.612572l0 0.073142q0 56.612571-56.612571 56.612572l-910.774858 0q-56.612571 0-56.612571-56.612572l0-0.073142q0-56.612571 56.612571-56.612572Z",
        ],
      },
      skills: {
        viewBox: "0 0 1024 1024",
        paths: [
          "M753.152 479.4368H613.376c-12.5952 0-22.2208-11.3664-20.1728-23.7568l49.7664-304.8448c3.2768-19.968-21.4016-32.0512-35.2256-17.3056L255.8976 510.0544c-12.1856 13.1072-2.9696 34.5088 14.9504 34.5088H410.624c12.5952 0 22.2208 11.3664 20.1728 23.7568l-49.7664 304.8448c-3.2768 19.968 21.4016 32.0512 35.2256 17.3056l351.8464-376.5248c12.288-13.1072 2.9696-34.5088-14.9504-34.5088z",
        ],
      },
    };
    const current = icons[name];
    if (!current) return "";
    return `<svg class="conversation-nav-icon" viewBox="${current.viewBox}" width="200" height="200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${current.paths
      .map((path) => `<path fill="currentColor" d="${path}"></path>`)
      .join("")}</svg>`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getPage(id) {
    return pages[id] || pages.chat;
  }

  function getFallbackMobileSessions() {
    return [
      {
        id: "demo-ui",
        name: "千变界面复刻",
        time: "09:41",
        icon: "message-circle",
        kind: "chat",
      },
      {
        id: "demo-theme",
        name: "主题与图标检查",
        time: "昨天",
        icon: "palette",
        kind: "chat",
      },
      {
        id: "demo-pages",
        name: "页面交互检查",
        time: "08:26",
        icon: "scan-search",
        kind: "chat",
      },
    ];
  }

  function formatBackendTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "刚刚";
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
  }

  function parseChatDate(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }

  function dayKey(date) {
    if (!date) return "";
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  function formatChatTime(value, status = "") {
    if (status === "inProgress") return "生成中";
    const date = parseChatDate(value);
    if (!date) return "刚刚";
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const clock = date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (dayKey(date) === dayKey(now)) return clock;
    if (dayKey(date) === dayKey(yesterday)) return `昨天 ${clock}`;
    return `${date.getMonth() + 1}月${date.getDate()}日 ${clock}`;
  }

  function formatChatDay(value) {
    const date = parseChatDate(value);
    if (!date) return "刚刚";
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (dayKey(date) === dayKey(now)) return "今天";
    if (dayKey(date) === dayKey(yesterday)) return "昨天";
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatRecentActivity(value) {
    const date = parseChatDate(value);
    if (!date) return "";
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const clock = date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (dayKey(date) === dayKey(now)) return `今天 ${clock}`;
    if (dayKey(date) === dayKey(yesterday)) return `昨天 ${clock}`;
    return `${date.getMonth() + 1}月${date.getDate()}日 ${clock}`;
  }

  function affinityFill(score) {
    return Math.min(
      100,
      (Math.min(AFFINITY_MAX, Math.max(0, Number(score) || 0)) /
        AFFINITY_MAX) *
        100,
    );
  }

  function affinityBand(score) {
    const value = Math.min(AFFINITY_MAX, Math.max(0, Number(score) || 0));
    if (value >= 80) return "高度拟人（上限）";
    if (value >= 50) return "默契渐成";
    if (value >= 20) return "正在熟悉";
    return "初识";
  }

  function mapBackendSession(session) {
    const id = String(session?.sessionId ?? session?.id ?? "");
    return {
      id,
      name: session?.title || "未命名会话",
      time: formatBackendTime(session?.updatedAt || session?.createdAt),
      icon: "message-circle",
      kind: "chat",
      updatedAt: session?.updatedAt || session?.createdAt || "",
      active: Boolean(id && id === state.backendSessionId),
    };
  }

  function getMobileSessions() {
    if (!state.backendSessionsLoaded) {
      return getFallbackMobileSessions();
    }
    return state.backendSessions.map((session) => ({
      ...session,
      active: session.id === state.backendSessionId,
    }));
  }

  function resetBackendChat() {
    state.backendChatActive = false;
    state.backendSessionId = null;
    state.backendTurnId = null;
    state.backendTimeline = [];
    state.backendApprovals = [];
    state.backendInputs = [];
    state.backendTyping = false;
  }

  function mapBackendTimelineItem(item) {
    if (!item) return null;
    if (["userMessage", "agentMessage"].includes(item.kind)) {
      return {
        kind: item.kind,
        itemId: item.itemId ? String(item.itemId) : "",
        turnId: item.turnId ? String(item.turnId) : "",
        createdAt: item.createdAt || "",
        role: item.kind === "userMessage" ? "user" : "assistant",
        text: item.text || "",
        status: item.status || "completed",
        done:
          item.done === undefined
            ? !/inProgress|running|pending/i.test(item.status || "completed")
            : item.done === true,
      };
    }
    if (["reasoning", "toolCall"].includes(item.kind)) {
      return {
        kind: item.kind,
        itemId: item.itemId ? String(item.itemId) : "",
        turnId: item.turnId ? String(item.turnId) : "",
        createdAt: item.createdAt || "",
        tool: item.tool || "",
        args: item.args || "",
        summary: Array.isArray(item.summary)
          ? item.summary
          : item.summary
            ? [String(item.summary)]
            : [],
        summaryText: item.text || "",
        visibleOutput: item.visibleOutput || "",
        status: item.status || "completed",
        done:
          item.done === undefined
            ? !/inProgress|running|pending/i.test(item.status || "completed")
            : item.done === true,
      };
    }
    return null;
  }

  function mapBackendTimeline(payload) {
    const items = payload?.history?.items || payload?.items || [];
    return items.map(mapBackendTimelineItem).filter(Boolean);
  }

  function mergeOptimisticBackendMessages(persisted) {
    const optimistic = state.backendTimeline.filter(
      (item) => !item.itemId && item.kind === "userMessage",
    );
    const merged = [...persisted];
    for (const message of optimistic) {
      if (
        !merged.some(
          (candidate) =>
            candidate.kind === "userMessage" &&
            candidate.text === message.text,
        )
      ) {
        merged.push(message);
      }
    }
    return merged;
  }

  function mobileSkillIcon(skill) {
    const text = `${skill?.name || ""} ${skill?.displayName || ""} ${skill?.category || ""}`;
    if (/天气|出行|旅行/.test(text)) return "cloud-sun";
    if (/餐|食|菜|营养/.test(text)) return "utensils";
    if (/睡眠|健康|运动/.test(text)) return "moon-star";
    if (/办公|文档|表格/.test(text)) return "briefcase";
    if (/代码|开发|自动化/.test(text)) return "code-2";
    return "puzzle";
  }

  function mapMobileSkill(skill, scope = "market") {
    const title = skill?.displayName || skill?.name || "未命名技能";
    return {
      name: title,
      title,
      description: skill?.description || "暂无技能说明。",
      icon: mobileSkillIcon(skill),
      badge: skill?.badge || skill?.category || (scope === "market" ? "技能" : "已安装"),
      group: "backend-skills",
      subcategory: skill?.category || "",
      value: skill?.enabled === false ? "停用" : "启用",
      nav: "plugin-detail",
      raw: skill,
    };
  }

  function applyMobileSkills({ market, installed, mine }) {
    if (market && Array.isArray(market.skills)) {
      const items = market.skills.map((skill) => mapMobileSkill(skill, "market"));
      if (pages["plugin-market"]) pages["plugin-market"].marketItems = items;
    }
    if (installed && Array.isArray(installed.skills)) {
      const items = installed.skills.map((skill) =>
        mapMobileSkill(skill, "installed"),
      );
      if (pages.plugins) pages.plugins.pluginList = items;
      items.forEach((item) => {
        state.installedSkillEnabled.set(item.name, item.raw?.enabled !== false);
      });
    }
    if (mine && Array.isArray(mine.skills) && pages.plugins) {
      pages.plugins.mySkills = mine.skills.map((skill) => ({
        name: skill.displayName || skill.name || "未命名技能",
        description: skill.description || "暂无技能说明。",
        icon: mobileSkillIcon(skill),
        badge:
          skill.status === "published" || skill.reviewStatus === "approved"
            ? "已发布"
            : "待审核",
        group: "backend-skills",
        subcategory: skill.category || "",
        raw: skill,
      }));
    }
  }

  function applyMobileEnvironments(payload) {
    const serverDeployment =
      /^https?:$/.test(location.protocol) &&
      !["localhost", "127.0.0.1", "0.0.0.0"].includes(location.hostname) &&
      !/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
        location.hostname,
      );
    const environments = Array.isArray(payload?.environments)
      ? payload.environments
          .filter((environment) => environment?.id)
          .map((environment) => ({
            id: String(environment.id),
            name:
              environment.id === "local" && serverDeployment
                ? "云端工作区"
                : environment.name || environment.id,
            kind: environment.kind || "local",
            status: environment.status || "not_configured",
            detail: environment.detail || "",
          }))
      : [];
    if (!environments.length) return;
    state.environments = environments;
    const current = environments.find(
      (environment) =>
        environment.id === state.executionTarget &&
        environment.status === "ready",
    );
    state.executionTarget =
      current?.id ||
      environments.find((environment) => environment.status === "ready")?.id ||
      "local";
  }

  function markMobileEnvironmentsUnavailable() {
    state.environments = [
      {
        id: "local",
        name: "工作环境读取失败",
        kind: "local",
        status: "not_configured",
        detail: "无法读取可用工作环境",
      },
    ];
    state.executionTarget = "local";
  }

  function applyMobileDevices(payload) {
    const devices = Array.isArray(payload?.devices)
      ? payload.devices
          .filter((device) => device?.id)
          .map(normalizeMobileDevice)
      : [];
    state.devices = devices;
    state.devicesLoaded = true;
    state.environments = [
      ...state.environments.filter((environment) => environment.kind !== "device"),
      ...devices.map((device) => ({
        id: device.id,
        name: device.name,
        kind: "device",
        status:
          device.status === "online" && !device.paused
            ? "ready"
            : "not_configured",
        detail: `${device.platform} 连接器`,
        device,
      })),
    ];
    const selected = state.environments.find(
      (environment) =>
        environment.id === state.executionTarget &&
        environment.status === "ready",
    );
    if (!selected) {
      state.executionTarget =
        state.environments.find(
          (environment) => environment.status === "ready",
        )?.id || "local";
    }
  }

  async function refreshMobileDevices() {
    if (!api || !state.backendConnected) return;
    state.deviceError = "";
    const revision = state.deviceRevision;
    try {
      const payload = await api.devices();
      if (revision === state.deviceRevision) {
        applyMobileDevices(payload);
      }
    } catch (error) {
      state.devicesLoaded = true;
      state.deviceError = error.message || "设备列表读取失败";
    }
    renderPhone();
    updateIcons();
    if (state.devicesOpen) {
      refreshMobileDeviceTasks();
    }
  }

  function normalizeMobileDevice(device) {
    const platformValue = String(device.platform || "").trim();
    const platformKey = platformValue.toLowerCase();
    const typeValue = String(
      device.type ||
        device.deviceType ||
        (["windows", "android"].includes(platformKey) ? platformValue : ""),
    ).toLowerCase();
    const type = typeValue === "android" ? "android" : "windows";
    const rawStatus = String(device.status ?? "0").toLowerCase();
    const paused =
      device.paused === true ||
      rawStatus === "2" ||
      rawStatus === "paused";
    const status = paused
      ? "paused"
      : ["1", "online"].includes(rawStatus)
        ? "online"
        : "offline";
    const parsedCapabilities = parseMobileDeviceJson(
      device.capabilitiesJson || device.capabilities,
      [],
    );
    const parsedPermissions = parseMobileDeviceJson(
      device.permissionsJson || device.permissions,
      {},
    );
    return {
      id: String(device.id),
      name: device.name || "未命名设备",
      type,
      platform:
        platformValue && !["windows", "android"].includes(platformKey)
          ? platformValue
          : type === "android"
            ? "Android"
            : "Windows",
      status,
      paused,
      lastSeenAt: device.lastSeenAt || "",
      permissions:
        parsedPermissions && typeof parsedPermissions === "object"
          ? parsedPermissions
          : {},
      capabilities: Array.isArray(parsedCapabilities)
        ? parsedCapabilities.map(String)
        : [],
    };
  }

  function parseMobileDeviceJson(value, fallback) {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      return value;
    }
    if (typeof value !== "string" || !value.trim()) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function devicePlatformLabel(platform) {
    if (platform === "android") return "Android";
    if (platform === "windows") return "Windows";
    return platform || "设备";
  }

  function mobileDeviceStateLabel(device) {
    if (device?.paused || device?.status === "paused") return "已暂停";
    return device?.status === "online" ? "在线" : "离线";
  }

  function mobileConnectorPageUrl() {
    const url = new URL("connectors.html", location.href);
    try {
      const configured =
        new URL(location.href).searchParams.get("api") ||
        localStorage.getItem("qianbian-api-base");
      if (configured) url.searchParams.set("api", configured);
    } catch {}
    return url.href;
  }

  function mergeMobileDevicePatch(device, patch) {
    const next = { ...device, ...patch };
    if (next.paused === true && next.status === "online") {
      next.status = "paused";
    } else if (next.paused === false && next.status === "paused") {
      next.status = "online";
    }
    return normalizeMobileDevice(next);
  }

  function updateMobileDevice(deviceId, patch, successMessage) {
    if (!api || !deviceId) return;
    const current = state.devices.find((device) => device.id === deviceId);
    if (!current) return;
    state.deviceError = "";
    state.deviceRevision += 1;
    api
      .updateDevice(deviceId, patch)
      .then((payload) => {
        const updated = payload?.device || payload?.item;
        const devices = state.devices.map((device) =>
          device.id === deviceId
            ? updated?.id
              ? normalizeMobileDevice(updated)
              : mergeMobileDevicePatch(device, patch)
            : device,
        );
        applyMobileDevices({ devices });
        state.deviceEditingId = null;
        renderControls();
        renderPhone();
        updateIcons();
        showToast(successMessage, "circle-check");
      })
      .catch((error) => {
        state.deviceError = error.message || "设备操作失败";
        renderPhone();
        updateIcons();
        showToast(state.deviceError, "circle-alert");
      });
  }

  async function refreshMobileDeviceTasks() {
    if (!api || !state.backendConnected || state.deviceTasksLoading) return;
    if (!state.devices.length) {
      state.deviceTasks = [];
      state.deviceTasksLoaded = true;
      state.deviceTasksError = "";
      renderPhone();
      updateIcons();
      return;
    }
    const taskUtils = window.QianbianDeviceTasks;
    if (!taskUtils) return;
    state.deviceTasksLoading = true;
    state.deviceTasksError = "";
    renderPhone();
    updateIcons();
    const results = await Promise.allSettled(
      state.devices.map(async (device) => {
        const payload = await api.deviceTasks(device.id);
        return taskUtils.normalizeTasks(payload, device.id);
      }),
    );
    const tasks = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
    if (results.every((result) => result.status === "rejected")) {
      state.deviceTasksError = "设备任务读取失败";
    }
    state.deviceTasks = taskUtils.orderTasks(tasks);
    state.deviceTasksLoaded = true;
    state.deviceTasksLoading = false;
    renderPhone();
    updateIcons();
  }

  function currentMobileEnvironment() {
    return (
      state.environments.find(
        (environment) => environment.id === state.executionTarget,
      ) || state.environments[0]
    );
  }

  function mobileEnvironmentOptions() {
    return state.environments
      .map((environment) => {
        const paused = Boolean(environment.device?.paused);
        const unavailable = environment.status !== "ready" || paused;
        const suffix =
          environment.kind === "device"
            ? paused
              ? " · 已暂停"
              : unavailable
                ? " · 离线"
                : " · 在线"
            : unavailable
              ? " · 待配置"
              : "";
        return `<option value="${escapeHtml(environment.id)}" ${unavailable ? "disabled" : ""} ${environment.id === state.executionTarget ? "selected" : ""}>${escapeHtml(
          environment.name + suffix,
        )}</option>`;
      })
      .join("");
  }

  function setMobileExecutionTarget(id) {
    const environment = state.environments.find(
      (candidate) => candidate.id === String(id),
    );
    if (!environment || environment.status !== "ready") return;
    state.executionTarget = environment.id;
    renderPhone();
    updateIcons();
  }

  function upsertBackendTimelineItem(item) {
    const mapped = mapBackendTimelineItem(item);
    if (!mapped) return;
    if (!mapped.createdAt) mapped.createdAt = new Date().toISOString();
    state.lastActivityAt = mapped.createdAt;
    if (!mapped.turnId && state.backendTurnId) {
      mapped.turnId = String(state.backendTurnId);
    }
    let index = mapped.itemId
      ? state.backendTimeline.findIndex(
          (message) => message.itemId === mapped.itemId,
        )
      : -1;
    if (
      index < 0 &&
      mapped.kind === "userMessage" &&
      state.backendTimeline.at(-1)?.kind === "userMessage" &&
      !state.backendTimeline.at(-1)?.itemId &&
      state.backendTimeline.at(-1)?.text === mapped.text
    ) {
      index = state.backendTimeline.length - 1;
    }
    if (index >= 0) {
      state.backendTimeline[index] = {
        ...state.backendTimeline[index],
        ...mapped,
      };
    } else {
      state.backendTimeline.push(mapped);
    }
    if (mapped.kind === "agentMessage" && mapped.done) {
      state.backendTyping = false;
    }
    renderPhone();
    updateIcons();
  }

  function handleMobileBackendEvent(method, params = {}) {
    if (method === "turn/started") {
      state.backendTurnId = params.turnId || null;
      state.backendTyping = true;
      state.lastActivityAt = new Date().toISOString();
      renderPhone();
      return;
    }
    if (method === "item/started" || method === "item/completed") {
      upsertBackendTimelineItem(params.item);
      return;
    }
    if (method === "item/delta") {
      const itemId = String(params.itemId || "");
      if (params.field !== "text") {
        const activity = state.backendTimeline.find(
          (item) => item.itemId === itemId,
        );
        if (activity) {
          if (params.field === "output") {
            activity.visibleOutput = `${activity.visibleOutput || ""}${params.delta || ""}`;
          } else {
            activity.summaryText = `${activity.summaryText || ""}${params.delta || ""}`;
          }
          renderPhone();
        }
        return;
      }
      let message = state.backendTimeline.find(
        (item) => item.itemId && item.itemId === itemId,
      );
      let created = false;
      if (!message) {
        message = {
          kind: "agentMessage",
          itemId,
          turnId: state.backendTurnId ? String(state.backendTurnId) : "",
          createdAt: new Date().toISOString(),
          role: "assistant",
          text: "",
          status: "inProgress",
          done: false,
        };
        state.backendTimeline.push(message);
        created = true;
      }
      message.text += params.delta || "";
      message.status = "inProgress";
      state.backendTyping = false;
      if (created) renderPhone();
      else scheduleStreamingMessageUpdate(itemId);
      return;
    }
    if (method === "approval/requested") {
      state.backendApprovals = [
        ...state.backendApprovals.filter(
          (item) => String(item.approvalId) !== String(params.approvalId),
        ),
        params,
      ];
      renderPhone();
      updateIcons();
      return;
    }
    if (method === "approval/resolved") {
      state.backendApprovals = state.backendApprovals.filter(
        (item) => String(item.approvalId) !== String(params.approvalId),
      );
      renderPhone();
      updateIcons();
      return;
    }
    if (method === "userInput/requested") {
      state.backendInputs = [
        ...state.backendInputs.filter(
          (item) => String(item.userInputId) !== String(params.userInputId),
        ),
        params,
      ];
      renderPhone();
      updateIcons();
      return;
    }
    if (method === "userInput/settled") {
      state.backendInputs = state.backendInputs.filter(
        (item) => String(item.userInputId) !== String(params.userInputId),
      );
      renderPhone();
      updateIcons();
      return;
    }
    if (method === "turn/completed") {
      state.backendTyping = false;
      state.backendTurnId = null;
      renderPhone();
      updateIcons();
      refreshMobileSessions();
      refreshMobileAffinity();
      return;
    }
    if (method === "device/status") {
      state.deviceRevision += 1;
      if (Array.isArray(params.devices)) {
        applyMobileDevices(params);
        renderControls();
        renderPhone();
        updateIcons();
        return;
      }
      const device = state.devices.find(
        (item) => item.id === String(params.deviceId || params.id || ""),
      );
      if (device) {
        device.status = params.status || device.status;
        if (typeof params.paused === "boolean") {
          device.paused = params.paused;
        }
        device.lastSeenAt = params.lastSeenAt || device.lastSeenAt;
        applyMobileDevices({ devices: state.devices });
        renderControls();
        renderPhone();
        updateIcons();
      }
      return;
    }
    if (method === "device/paired" || method === "device/removed") {
      refreshMobileDevices();
    }
  }

  async function refreshMobileSessions() {
    if (!api || !state.backendConnected) return;
    try {
      const payload = await api.sessions();
      if (Array.isArray(payload?.sessions)) {
        state.backendSessions = payload.sessions.map(mapBackendSession);
        state.backendSessionsLoaded = true;
        renderPhone();
        updateIcons();
      }
    } catch {}
  }

  function applyMobileAffinity(payload) {
    const score = Number(payload?.score);
    if (!Number.isFinite(score)) return;
    state.agentTraining = Math.min(
      AFFINITY_MAX,
      Math.max(0, Math.round(score)),
    );
    localStorage.removeItem("dshgo-agent-training");
  }

  async function refreshMobileAffinity() {
    if (!api || !state.backendConnected) return;
    try {
      applyMobileAffinity(await api.affinity());
      renderControls();
      renderPhone();
      updateIcons();
    } catch {}
  }

  async function initializeMobileBackend() {
    if (!api) {
      state.backendReady = true;
      return;
    }
    const staticHost =
      location.protocol === "file:" ||
      location.hostname === "github.io" ||
      location.hostname.endsWith(".github.io");
    if (staticHost && !api.explicit) {
      state.backendReady = true;
      state.devicesLoaded = true;
      state.deviceError = "设备服务未连接";
      return;
    }
    try {
      await api.health();
      state.backendConnected = true;
      state.network = "online";
      const [
        sessions,
        environments,
        devices,
        affinity,
        models,
        market,
        installed,
        mine,
      ] =
        await Promise.allSettled([
          api.sessions(),
          api.environments(),
          api.devices(),
          api.affinity(),
          api.models(),
          api.skills({ scope: "market" }),
          api.skills({ scope: "installed" }),
          api.mineSkills(),
        ]);
      if (sessions.status === "fulfilled") {
        state.backendSessions = (sessions.value?.sessions || []).map(
          mapBackendSession,
        );
        state.backendSessionsLoaded = true;
        state.lastActivityAt =
          state.backendSessions.find((session) => session.updatedAt)
            ?.updatedAt || state.lastActivityAt;
      }
      if (environments.status === "fulfilled") {
        applyMobileEnvironments(environments.value);
      }
      if (devices.status === "fulfilled") {
        applyMobileDevices(devices.value);
      }
      if (affinity.status === "fulfilled") {
        applyMobileAffinity(affinity.value);
      }
      if (models.status === "fulfilled") {
        const modelList = models.value?.models || [];
        const selected =
          modelList.find((model) => model.isDefault) || modelList[0];
        state.backendModelId = selected
          ? String(selected.modelId ?? selected.id)
          : null;
        state.backendModelLabel = selected?.label || selected?.name || "";
      }
      applyMobileSkills({
        market: market.status === "fulfilled" ? market.value : undefined,
        installed:
          installed.status === "fulfilled" ? installed.value : undefined,
        mine: mine.status === "fulfilled" ? mine.value : undefined,
      });
      api.connectEvents({
        onStatus(status) {
          state.network = status?.connected ? "online" : "reconnecting";
          renderPhone();
        },
        onEvent: handleMobileBackendEvent,
        onError() {
          state.network = "reconnecting";
          renderPhone();
        },
      });
    } catch {
      state.backendConnected = false;
      state.network = "offline";
      markMobileEnvironmentsUnavailable();
      state.devicesLoaded = true;
      state.deviceError = "设备服务未连接";
    } finally {
      state.backendReady = true;
      renderControls();
      renderPhone();
      updateIcons();
    }
  }

  async function selectMobileSession(sessionId) {
    const session = state.backendSessions.find(
      (item) => item.id === String(sessionId),
    );
    if (!session) return;
    state.backendChatActive = true;
    state.backendSessionId = session.id;
    state.backendTimeline = [];
    state.backendApprovals = [];
    state.backendInputs = [];
    state.backendTyping = Boolean(api && state.backendConnected);
    state.historyOpen = false;
    navigate("chat");
    if (api && state.backendConnected) {
      try {
        const payload = await api.resumeSession(session.id);
        state.backendTimeline = mapBackendTimeline(payload);
        const pending = Array.isArray(payload?.pendingRequests)
          ? payload.pendingRequests
          : [];
        state.backendApprovals = pending.filter((item) => item.approvalId);
        state.backendInputs = pending.filter((item) => item.userInputId);
      } catch (error) {
        showToast(error.message || "会话打开失败", "circle-alert");
      } finally {
        state.backendTyping = false;
        renderPhone();
        updateIcons();
      }
    }
  }

  async function startMobileBackendSession() {
    const payload = await api.startSession({
      modelId: state.backendModelId || undefined,
      approvalMode: "onRequest",
      executionTarget: state.executionTarget,
    });
    const session = payload?.session;
    if (!session?.sessionId) throw new Error("后端未返回会话 ID");
    state.backendSessionId = String(session.sessionId);
    state.backendModelId = payload.modelId || state.backendModelId;
    const mapped = mapBackendSession(session);
    state.backendSessions = [
      mapped,
      ...state.backendSessions.filter((item) => item.id !== mapped.id),
    ];
    state.backendSessionsLoaded = true;
    state.backendTimeline = mergeOptimisticBackendMessages(
      mapBackendTimeline(payload),
    );
    state.backendApprovals = [];
    state.backendInputs = [];
    return mapped;
  }

  async function decideMobileApproval(approvalId, choiceId) {
    if (!api || !state.backendSessionId) return;
    const approval = state.backendApprovals.find(
      (item) => String(item.approvalId) === String(approvalId),
    );
    if (!approval) return;
    const choice = (approval.availableChoices || []).find(
      (item) => String(item.choiceId) === String(choiceId),
    );
    try {
      await api.decideApproval({
        sessionId: state.backendSessionId,
        approvalId: String(approvalId),
        choiceId: String(choiceId),
        ...(approval.requirementId
          ? { requirementId: approval.requirementId }
          : choice
            ? { requirementId: choice.requirementId }
            : {}),
      });
      state.backendApprovals = state.backendApprovals.filter(
        (item) => String(item.approvalId) !== String(approvalId),
      );
      renderPhone();
      updateIcons();
      showToast("审批已提交", "shield-check");
    } catch (error) {
      showToast(error.message || "审批提交失败", "circle-alert");
    }
  }

  async function submitMobileInput(userInputId) {
    if (!api || !state.backendSessionId) return;
    const request = state.backendInputs.find(
      (item) => String(item.userInputId) === String(userInputId),
    );
    if (!request) return;
    const answers = (request.questions || []).map((question) => ({
      id: String(question.id),
      answer:
        document.querySelector(
          `[data-mobile-input-question="${CSS.escape(String(question.id))}"]`,
        )?.value || "",
    }));
    try {
      await api.answerInput({
        sessionId: state.backendSessionId,
        userInputId: String(userInputId),
        answers,
      });
      state.backendInputs = state.backendInputs.filter(
        (item) => String(item.userInputId) !== String(userInputId),
      );
      renderPhone();
      updateIcons();
      showToast("回答已提交", "message-circle-check");
    } catch (error) {
      showToast(error.message || "回答提交失败", "circle-alert");
    }
  }

  async function cancelMobileInput(userInputId) {
    if (!api || !state.backendSessionId) return;
    try {
      await api.cancelInput({
        sessionId: state.backendSessionId,
        userInputId: String(userInputId),
      });
      state.backendInputs = state.backendInputs.filter(
        (item) => String(item.userInputId) !== String(userInputId),
      );
      renderPhone();
      updateIcons();
    } catch (error) {
      showToast(error.message || "取消提问失败", "circle-alert");
    }
  }

  window.__qianbianMobileBackend = {
    get ready() {
      return state.backendReady;
    },
    initialize: initializeMobileBackend,
    handleEvent: handleMobileBackendEvent,
  };

  function isConversationSurface() {
    return state.page?.kind === "chat";
  }

  function parseHash() {
    const match = window.location.hash.match(/^#\/?([\w-]+)/);
    return match && pages[match[1]] ? match[1] : null;
  }

  function commitHash(id, replace = false) {
    const next = `#/${id}`;
    if (replace) {
      window.history.replaceState({ page: id }, "", next);
    } else {
      window.history.pushState({ page: id }, "", next);
    }
  }

  function navigate(id, options = {}) {
    const target = isPageVisible(id) ? getPage(id) : getPage("home");
    if (!target) return;
    const same = state.current === target.id;
    state.current = target.id;
    state.page = target;
    state.sheet = target.kind === "sheet" ? target.sheetType || "default" : null;
    state.dialog = null;
    state.catalogOpen = false;
    state.mainNavOpen = false;
    state.skillModal = null;
    state.skillDetail = null;
    state.historyOpen = false;

    if (options.replace) {
      state.history[state.history.length - 1] = target.id;
      commitHash(target.id, true);
    } else if (!same) {
      state.history.push(target.id);
      commitHash(target.id, false);
    }

    renderAll();
    announce(`${target.title} 已打开`);
    scrollChatToBottom();
  }

  function back() {
    if (state.dialog) {
      state.dialog = null;
      renderAll();
      return;
    }
    if (state.skillModal || state.skillDetail) {
      if (state.skillDetail) {
        state.skillDetail = null;
        renderPhone();
        updateIcons();
        return;
      }
      state.skillModal = null;
      renderPhone();
      updateIcons();
      return;
    }
    if (state.historyOpen) {
      state.historyOpen = false;
      renderPhone();
      updateIcons();
      return;
    }
    if (state.mainNavOpen) {
      state.mainNavOpen = false;
      renderPhone();
      updateIcons();
      return;
    }
    if (state.sheet && state.page?.kind === "sheet") {
      const base = state.page.basePage || "chat";
      state.sheet = null;
      navigate(base, { replace: true });
      return;
    }
    if (state.sheet) {
      state.sheet = null;
      renderAll();
      return;
    }
    if (state.history.length > 1) {
      state.history.pop();
      const target = state.history[state.history.length - 1];
      state.current = target;
      state.page = getPage(target);
      state.sheet = null;
      commitHash(target, true);
      renderAll();
      announce(`返回 ${getPage(target).title}`);
      return;
    }
    if (state.current !== "home") navigate("home", { replace: true });
  }

  function openSheet(type) {
    if (sheetClosing) return;
    if (sheetCloseTimer) {
      window.clearTimeout(sheetCloseTimer);
      sheetCloseTimer = null;
    }
    const chatInput = document.getElementById("chat-input");
    if (chatInput) state.chatDraft = chatInput.value;
    pendingSheetAnimation = type;
    state.sheet = type;
    renderPhone();
    updateIcons();
    announce("已打开底部面板");
  }

  function closeSheet() {
    if (state.page?.kind === "sheet") {
      back();
      return;
    }
    if (!state.sheet || sheetClosing) return;
    if (state.sheet !== "plus" || state.reducedMotion) {
      state.sheet = null;
      renderPhone();
      updateIcons();
      return;
    }
    const panel = phoneScreen.querySelector(".composer-extension-panel-wrap");
    if (!panel) {
      state.sheet = null;
      renderPhone();
      updateIcons();
      return;
    }
    sheetClosing = true;
    panel.classList.add("is-closing");
    sheetCloseTimer = window.setTimeout(() => {
      sheetCloseTimer = null;
      sheetClosing = false;
      state.sheet = null;
      renderPhone();
      updateIcons();
    }, 170);
  }

  function showDialog(title, body, confirmLabel = "继续", action = "") {
    state.dialog = { title, body, confirmLabel, action };
    renderPhone();
    updateIcons();
  }

  function closeDialog() {
    state.dialog = null;
    renderPhone();
    updateIcons();
  }

  function completeSkillPublish() {
    const fieldValue = (key) =>
      String(state.segments[`publish-skill:${key}`] || "").trim();
    const name = fieldValue("skillName") || "未命名技能";
    const summary = fieldValue("skillSummary") || "未填写技能介绍";
    const category = fieldValue("skillCategory") || "效率工具";
    const publishMode = fieldValue("publishMode") || "upload";
    const iconByCategory = {
      效率工具: "zap",
      内容创作: "pen-line",
      开发工具: "code-2",
      数据分析: "chart-no-axes-combined",
    };
    state.publishedSkills = [
      {
        name,
        description: summary,
        category,
        script: fieldValue("skillCode"),
        icon:
          publishMode === "ai"
            ? "sparkles"
            : iconByCategory[category] || "sparkles",
        badge: "已发布",
      },
      ...state.publishedSkills.filter((item) => item.name !== name),
    ];
    Object.keys(state.segments)
      .filter((key) => key.startsWith("publish-skill:"))
      .forEach((key) => delete state.segments[key]);
    state.publishStep = 1;
    state.dialog = null;
    renderPhone();
    updateIcons();
    showToast(`“${name}”已发布到技能空间`, "circle-check");
  }

  function showAffinityDialog() {
    state.dialog = { type: "affinity" };
    renderPhone();
    updateIcons();
    announce(`Agent 契合度 ${Math.round(state.agentTraining)}%`);
    window.requestAnimationFrame(() => {
      document.querySelector(".affinity-popover-close")?.focus();
    });
  }

  function openMainNavOverlay() {
    state.mainNavOpen = true;
    state.skillModal = null;
    state.skillDetail = null;
    state.historyOpen = false;
    renderPhone();
    updateIcons();
  }

  function showToast(message, iconName = "circle-check") {
    state.toast = { message, icon: iconName, id: Date.now() };
    renderToast();
    updateIcons(toastRegion);
    if (state.page) renderPhone();
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      if (state.toast) {
        state.toast = null;
        renderToast();
        if (state.page) renderPhone();
      }
    }, 2600);
  }

  function announce(message) {
    srStatus.textContent = "";
    window.setTimeout(() => {
      srStatus.textContent = message;
    }, 20);
  }

  function updateIcons(scope = document) {
    if (!window.lucide) return;
    const available = window.lucide.icons || {};
    scope.querySelectorAll("[data-lucide]").forEach((element) => {
      const name = element.dataset.lucide;
      const pascal = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      if (!available[name] && !available[pascal]) {
        element.dataset.lucide = "circle";
      }
    });
    window.lucide.createIcons({
      root: scope,
      attrs: {
        "stroke-width": "1.8",
        "aria-hidden": "true",
      },
    });
  }

  function setTheme(theme) {
    state.theme = theme;
    root.dataset.theme = theme;
    localStorage.setItem("dshgo-atlas-theme", theme);
    document.querySelectorAll("#theme-control button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.theme === theme);
    });
    renderPhone();
    updateIcons();
  }

  function setAccent(accent) {
    if (!ACCENT_IDS.includes(accent)) accent = "a62466";
    state.accent = accent;
    root.dataset.accent = accent;
    localStorage.setItem("dshgo-atlas-accent", accent);
    document.querySelectorAll("#accent-control .swatch").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.accent === accent);
    });
    renderPhone();
    updateIcons();
  }

  function setAgentTraining(value, { notify = false } = {}) {
    const previous = state.agentTraining;
    const next = Math.min(
      AFFINITY_MAX,
      Math.max(0, Math.round(Number(value) || 0)),
    );
    state.agentTraining = next;
    renderControls();
    renderPhone();
    updateIcons();
    if (notify && previous < AFFINITY_MAX && next >= AFFINITY_MAX) {
      showToast("用户与 Agent 已达到高度拟人上限", "badge-check");
    } else if (notify) {
      showToast(`用户与 Agent 契合度：${next}%`, "activity");
    }
  }

  function setDeviceSize(size) {
    state.device = size;
    localStorage.setItem("dshgo-atlas-device", size);
    const [width, height] = size.split("x").map(Number);
    root.style.setProperty("--device-width", `${width}px`);
    root.style.setProperty("--device-height", `${height}px`);
    document.getElementById("device-size").value = size;
    fitDevice();
    renderPhone();
    updateIcons();
  }

  function fitDevice() {
    const rect = phoneFit.getBoundingClientRect();
    const styles = window.getComputedStyle(phoneFit);
    const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const [width, height] = state.device.split("x").map(Number);
    const availableWidth = Math.max(180, rect.width - horizontalPadding - 8);
    const availableHeight = Math.max(260, rect.height - verticalPadding - 12);
    const scale = Math.max(
      0.42,
      Math.min(1, availableWidth / (width + 20), availableHeight / (height + 20))
    );
    root.style.setProperty("--device-scale", scale.toFixed(4));
  }

  function statusBar() {
    return `
      <div class="phone-statusbar">
        <span>9:41</span>
        <span class="status-right">
          ${icon("signal")}
          ${icon("wifi")}
          ${icon("battery-full")}
        </span>
      </div>
    `;
  }

  function phoneHeader(title, subtitle = "", options = {}) {
    const backButton = options.noBack
      ? ""
      : `<button class="phone-icon-button ghost" data-action="back" type="button" aria-label="返回">${icon(
          "chevron-left"
        )}</button>`;
    const action = options.action || "";
    return `
      <header class="phone-header ${options.floating ? "is-floating" : ""}">
        ${backButton}
        <div class="phone-header-title">
          <h1>${escapeHtml(title)}</h1>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
        </div>
        ${action}
      </header>
    `;
  }

  function phonePageHeader(page, options = {}) {
    return phoneHeader(page.title, options.hideSubtitle ? "" : page.summary, options);
  }

  function renderBadge(text, tone = "") {
    if (!text) return "";
    return `<span class="badge ${tone || ""}">${escapeHtml(text)}</span>`;
  }

  function toggleKey(pageId, label) {
    return `${pageId}::${label}`;
  }

  function segmentKey(pageId, label) {
    return `${pageId}::${label}`;
  }

  function rowState(pageId, row) {
    const key = toggleKey(pageId, row.label);
    if (Object.prototype.hasOwnProperty.call(state.toggles, key)) {
      return state.toggles[key];
    }
    return row.checked;
  }

  function rowSegment(pageId, row) {
    const key = segmentKey(pageId, row.label);
    if (Object.prototype.hasOwnProperty.call(state.segments, key)) {
      return state.segments[key];
    }
    return row.selected || 0;
  }

  function renderRow(pageId, row, options = {}) {
    if (row.nav && !isPageVisible(row.nav)) return "";
    const tag = row.nav || row.action || (row.control === "switch" && false) ? "button" : "div";
    const attrs = [];
    if (row.nav) attrs.push(`data-nav="${escapeHtml(row.nav)}"`);
    if (row.action) attrs.push(`data-action="${escapeHtml(row.action)}"`);
    if (row.danger) attrs.push('data-danger="true"');
    const clickable = Boolean(row.nav || row.action);
    const element = clickable ? "button" : "div";
    let trailing = "";

    if (row.control === "switch") {
      const checked = rowState(pageId, row);
      trailing = `<button class="phone-toggle ${checked ? "is-on" : ""}" data-toggle="${escapeHtml(
        toggleKey(pageId, row.label)
      )}" type="button" aria-label="${escapeHtml(row.label)}" aria-pressed="${checked}"><span></span></button>`;
    } else if (row.control === "segment" && row.options.length) {
      const selected = rowSegment(pageId, row);
      trailing = `
        <div class="phone-segment">
          ${row.options
            .map(
              (option, index) =>
                `<button class="${index === selected ? "is-active" : ""}" data-segment="${escapeHtml(
                  segmentKey(pageId, row.label)
                )}" data-segment-index="${index}" type="button">${escapeHtml(option)}</button>`
            )
            .join("")}
        </div>
      `;
    } else if (row.control === "select" && row.options.length) {
      const values =
        row.values.length === row.options.length
          ? row.values
          : row.options.map((_, index) => String(index));
      const selected =
        row.key === "locale"
          ? Math.max(0, values.indexOf(state.locale))
          : rowSegment(pageId, row);
      const selectAttributes =
        row.key === "locale"
          ? "data-locale-select"
          : `data-row-select="${escapeHtml(row.key)}" data-row-page="${escapeHtml(
              pageId,
            )}" data-row-label="${escapeHtml(row.label)}"`;
      trailing = `
        <select class="phone-row-select" ${selectAttributes} aria-label="${escapeHtml(row.label)}">
          ${row.options
            .map(
              (option, index) =>
                `<option value="${escapeHtml(values[index])}" ${
                  index === selected ? "selected" : ""
                }>${escapeHtml(option)}</option>`,
            )
            .join("")}
        </select>
      `;
    } else {
      const value = row.value ? `<span class="phone-row-value">${escapeHtml(row.value)}</span>` : "";
      const badge = renderBadge(row.badge, row.tone);
      const chevron = row.nav ? icon("chevron-right", "row-chevron") : "";
      trailing = `${value}${badge}${chevron}`;
    }

    return `
      <${element}
        class="phone-row ${row.danger ? "is-danger" : ""}"
        ${clickable ? `type="button"` : ""}
        ${attrs.join(" ")}
      >
        <span class="row-glyph">${icon(row.icon || "circle")}</span>
        <span class="phone-row-main">
          <span class="phone-row-label">${escapeHtml(row.label)}</span>
          ${row.description ? `<span class="phone-row-description">${escapeHtml(row.description)}</span>` : ""}
        </span>
        ${trailing}
      </${element}>
    `;
  }

  function renderSections(page, sections, options = {}) {
    if (!sections?.length) return "";
    return sections
      .map((section) => {
        const rows = section.rows.filter((row) => !row.nav || isPageVisible(row.nav));
        if (!rows.length) return "";
        return `
          <section class="phone-section">
            ${
              section.title
                ? `<div class="phone-section-heading"><span>${escapeHtml(section.title)}</span></div>`
                : ""
            }
            <div class="phone-list">
              ${rows.map((row) => renderRow(page.id, row, options)).join("")}
            </div>
            ${section.note ? `<p class="phone-section-note">${escapeHtml(section.note)}</p>` : ""}
          </section>
        `;
      })
      .join("");
  }

  function renderMetrics(metrics = []) {
    if (!metrics.length) return "";
    return `
      <div class="metric-grid">
        ${metrics
          .map(
            (metric) => `
              <div class="metric-cell">
                <strong>${escapeHtml(metric.value)}</strong>
                <span>${escapeHtml(metric.label)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderStatus(status) {
    if (!status) return "";
    const tone = status.tone || "success";
    return `
      <div class="status-card ${tone === "error" ? "is-error" : tone === "warning" ? "is-warn" : ""}">
        <span class="status-card-dot"></span>
        <div>
          <strong>${escapeHtml(status.title)}</strong>
          <span>${escapeHtml(status.description)}</span>
        </div>
      </div>
    `;
  }

  function renderHero(page) {
    if (!page.hero && !page.heroTitle) return "";
    const actions = (page.hideHeroActions ? [] : page.actions || []).filter(
      (action) => !action.nav || isPageVisible(action.nav),
    );
    return `
      <section class="generic-hero">
        <span class="generic-hero-icon">${icon(page.icon || "panels-top-left")}</span>
        <h2>${escapeHtml(page.heroTitle || page.title)}</h2>
        <p>${escapeHtml(page.hero || page.summary || "")}</p>
        ${
          actions.length
            ? `<div class="generic-actions">${actions
                .slice(0, 2)
                .map(
                  (action) =>
                    `<button class="phone-secondary-button" ${
                      action.nav ? `data-nav="${escapeHtml(action.nav)}"` : 'data-toast="前端演示操作"'
                    } type="button">${icon(action.icon || "arrow-right")}${escapeHtml(action.label)}</button>`
                )
                .join("")}</div>`
            : ""
        }
      </section>
    `;
  }

  function renderTabs(page) {
    if (!page.tabs?.length) return "";
    const selected = rowSegment(page.id, { label: "__tabs", selected: page.activeTab || 0 });
    return `
      <div class="phone-section">
        <div class="phone-tabs">
          ${page.tabs
            .map(
              (tab, index) =>
                `<button class="${index === selected ? "is-active" : ""}" data-segment="${escapeHtml(
                  segmentKey(page.id, "__tabs")
                )}" data-segment-index="${index}" type="button">${escapeHtml(tab)}</button>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function formValue(page, field, index) {
    const key = segmentKey(page.id, `form:${field.label}:${index}`);
    return Object.prototype.hasOwnProperty.call(state.segments, key) ? state.segments[key] : field.value || "";
  }

  function renderForm(page) {
    if (!page.form?.length) return "";
    return `
      <div class="phone-section">
        <div class="phone-list" style="padding:12px;display:grid;gap:11px">
          ${page.form
            .map(
              (field, index) => `
                <div class="setup-field">
                  <label>${escapeHtml(field.label)}</label>
                  ${
                    field.type === "textarea"
                      ? `<textarea class="composer-input" style="min-height:96px;width:100%;padding:10px;border:1px solid var(--phone-line);border-radius:8px;background:var(--phone-bg)" data-form-field="${escapeHtml(
                          `${page.id}:${index}`
                        )}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(
                          formValue(page, field, index)
                        )}</textarea>`
                      : `<input type="${field.type === "password" ? "password" : "text"}" data-form-field="${escapeHtml(
                          `${page.id}:${index}`
                        )}" value="${escapeHtml(formValue(page, field, index))}" placeholder="${escapeHtml(
                          field.placeholder || ""
                        )}" />`
                  }
                  ${field.hint ? `<span class="setup-meta">${escapeHtml(field.hint)}</span>` : ""}
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderActions(actions = [], pageId = "") {
    const visibleActions = actions.filter((action) => !action.nav || isPageVisible(action.nav));
    if (!visibleActions.length) return "";
    return `
      <div class="phone-section" style="display:grid;gap:8px">
        ${visibleActions
          .map(
            (action, index) => `
              <button
                class="${action.secondary ? "phone-secondary-button" : "phone-primary-button"}"
                ${action.nav ? `data-nav="${escapeHtml(action.nav)}"` : action.action ? `data-action="${escapeHtml(action.action)}"` : `data-toast="${escapeHtml(action.label)} · 前端模拟"`}
                type="button"
                data-danger="${action.danger ? "true" : "false"}"
              >
                ${icon(action.icon || "check")}
                ${escapeHtml(action.label)}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderGeneric(page) {
    return `
      <div class="phone-page generic-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          ${renderHero(page)}
          ${renderMetrics(page.metrics)}
          ${renderStatus(page.status)}
          ${renderTabs(page)}
          ${renderForm(page)}
          ${renderSections(page, page.sections)}
          ${page.note ? `<div class="phone-body"><div class="phone-notice">${icon("info")}<span>${escapeHtml(page.note)}</span></div></div>` : ""}
          ${renderActions(page.actions, page.id)}
          <div style="height:20px"></div>
        </div>
      </div>
    `;
  }

  function renderSettings(page) {
    const isHub = page.id === "settings";
    return `
      <div class="phone-page settings-page">
        ${statusBar()}
        ${phonePageHeader(page, { hideSubtitle: isHub })}
        <div class="phone-scroll">
          ${renderStatus(page.status)}
          ${renderMetrics(page.metrics)}
          ${renderTabs(page)}
          ${renderForm(page)}
          ${renderSections(page, page.sections)}
          ${renderActions(page.actions, page.id)}
          <div style="height:24px"></div>
        </div>
      </div>
    `;
  }

  function renderAccount(page) {
    const profile =
      state.accountEditing && state.accountDraft
        ? state.accountDraft
        : state.accountProfile;
    const fields = [
      { key: "nickname", label: "昵称", icon: "user-round", type: "text" },
      { key: "accountId", label: "账号 ID", icon: "badge", type: "text" },
      { key: "email", label: "绑定邮箱", icon: "mail", type: "email" },
      { key: "phone", label: "手机号", icon: "smartphone", type: "tel" },
      { key: "region", label: "地区", icon: "map-pin", type: "text" },
    ];
    const recentActivity = formatRecentActivity(state.lastActivityAt);
    return `
      <div class="phone-page account-page">
        ${statusBar()}
        ${phonePageHeader(page, { hideSubtitle: true })}
        <div class="phone-scroll">
          <section class="account-profile-hero">
            <div class="account-avatar">
              <img src="assets/brand/qianbian-tile.png" alt="个人头像" />
            </div>
            <h2 class="account-profile-name">${escapeHtml(profile.nickname || "千变用户")}</h2>
            <p>个人账号 · 已登录</p>
            <button class="account-edit-button" data-action="toggle-account-edit" type="button">
              ${icon(state.accountEditing ? "x" : "pencil")}
              ${state.accountEditing ? "取消编辑" : "编辑资料"}
            </button>
          </section>

          <div class="account-section-heading">个人资料</div>

          ${
            state.accountEditing
              ? `
                <section class="account-edit-form">
                  ${fields
                    .map(
                      (field) => `
                        <label>
                          <span>${icon(field.icon)}${escapeHtml(field.label)}</span>
                          <input
                            type="${field.type}"
                            data-account-field="${field.key}"
                            value="${escapeHtml(profile[field.key] || "")}"
                            autocomplete="off"
                          />
                        </label>
                      `,
                    )
                    .join("")}
                  <button class="account-save-button" data-action="save-account-profile" type="button">
                    ${icon("check")}保存资料
                  </button>
                </section>
              `
              : `
                <div class="phone-list account-profile-list">
                  ${fields
                    .map(
                      (field) => `
                        <div class="account-profile-row">
                          <span class="row-glyph">${icon(field.icon)}</span>
                          <span class="phone-row-main">
                            <span class="phone-row-label">${escapeHtml(field.label)}</span>
                            <span class="phone-row-description">${escapeHtml(profile[field.key] || "")}</span>
                          </span>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
          }

          ${
            recentActivity
              ? `<div class="account-login-note">
                  ${icon("shield-check")}
                  <span>当前设备已登录，最近活动：${escapeHtml(recentActivity)}</span>
                </div>`
              : ""
          }
          <div class="phone-list" style="margin:0 14px 14px">
            <button class="phone-row" data-action="open-devices" type="button">
              <span class="row-glyph">${icon("monitor-smartphone")}</span>
              <span class="phone-row-main">
                <span class="phone-row-label">我的设备</span>
                <span class="phone-row-description">管理本机与手机连接器</span>
              </span>
              ${icon("chevron-right", "row-chevron")}
            </button>
            <button class="phone-row" data-action="open-desktop-version" type="button">
              <span class="row-glyph">${icon("monitor")}</span>
              <span class="phone-row-main">
                <span class="phone-row-label">电脑版</span>
                <span class="phone-row-description">在桌面浏览器中打开工作区</span>
              </span>
              ${icon("chevron-right", "row-chevron")}
            </button>
          </div>
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderWelcome(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="phone-scroll">
          <div class="welcome-page">
            <div class="welcome-brand">
              <img src="assets/brand/qianbian-tile.png" alt="千变" />
              <div>
                <strong>千变</strong>
                <span>AI Agent · 装在口袋里</span>
              </div>
            </div>
            <div class="welcome-copy">
              <h1>一念千变，万种可能。</h1>
              <p>把想法交给千变，让它不断生长，直到成为你想要的样子。</p>
            </div>
            <img class="welcome-pet" src="assets/brand/qianbian-mark.png" alt="千变" />
            <div class="welcome-actions">
              <button class="phone-secondary-button" data-nav="home" type="button">
                ${icon("compass")}进入千变空间
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderOnboarding(page) {
    const steps = page.steps || 6;
    const step = page.step || 1;
    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="phone-scroll">
          <div class="onboarding-page">
            <div class="onboarding-progress">
              ${Array.from({ length: steps }, (_, index) => `<span class="${index < step ? "done" : ""}"></span>`).join("")}
            </div>
            <div class="onboarding-copy">
              <p class="eyebrow">${escapeHtml(page.eyebrow || `SETUP 0${step}`)}</p>
              <h1>${escapeHtml(page.heroTitle || page.title)}</h1>
              <p>${escapeHtml(page.hero || page.summary)}</p>
            </div>
            ${
              page.choices?.length
                ? `<div class="onboarding-options">${page.choices
                    .map(
                      (choice) => `
                        <button class="choice-card ${choice.selected ? "is-selected" : ""}" ${
                          choice.nav ? `data-nav="${escapeHtml(choice.nav)}"` : 'data-toast="已选择"'
                        } type="button">
                          <span class="choice-icon">${icon(choice.icon || "circle")}</span>
                          <span>
                            <strong>${escapeHtml(choice.title)}</strong>
                            <span>${escapeHtml(choice.description || "")}</span>
                          </span>
                          ${icon(choice.selected ? "check-circle-2" : "circle", "row-chevron")}
                        </button>
                      `
                    )
                    .join("")}</div>`
                : ""
            }
            ${
              page.swatches?.length
                ? `<div class="swatch-row" style="margin-top:22px">${page.swatches
                    .map(
                      (accent) =>
                        `<button class="swatch ${state.accent === accent ? "is-active" : ""}" data-accent-choice="${accent}" style="--swatch:${ACCENT_COLORS[accent]}" type="button" aria-label="${ACCENT_LABELS[accent] || accent}"></button>`
                    )
                    .join("")}</div>`
                : ""
            }
            ${renderForm(page)}
            ${renderMetrics(page.metrics)}
            ${renderStatus(page.status)}
            ${renderSections(page, page.sections)}
            <div class="onboarding-footer">
              ${
                page.cta
                  ? `<button class="phone-primary-button" data-nav="${escapeHtml(
                      page.ctaNav || "home"
                    )}" type="button">${icon("arrow-right")}${escapeHtml(page.cta)}</button>`
                  : ""
              }
              ${
                page.secondary
                  ? `<button class="phone-secondary-button" data-nav="${escapeHtml(
                      page.secondaryNav || "home"
                    )}" type="button">${escapeHtml(page.secondary)}</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLaunch(page) {
    return `
      <div class="phone-page launch-page" style="background:#0c1714;color:#f2f6f3">
        <div class="welcome-page" style="min-height:100%;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(45,109,246,.3),transparent 34%),#0c1714">
          <img src="assets/brand/qianbian-tile.png" alt="千变" style="width:74px;height:74px;border-radius:20px;object-fit:cover;margin-bottom:22px" />
          <strong style="font-size:30px;font-weight:300">${escapeHtml(page.heroTitle || "千变")}</strong>
          <span style="margin-top:8px;color:rgba(242,246,243,.56);font-size:10px">AI Agent</span>
          <button class="phone-secondary-button" data-nav="home" type="button" style="margin-top:48px;background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.14);color:#fff">
            ${icon("arrow-right")}进入首页
          </button>
        </div>
      </div>
    `;
  }

  function renderChatMessageUser(text, name = "", createdAt = "", status = "") {
    const time = createdAt || status ? formatChatTime(createdAt, status) : "";
    return `
      <div class="user-message">
        <div class="user-bubble">
          ${name ? `<div style="font-size:8px;opacity:.72;margin-bottom:3px">${escapeHtml(name)}</div>` : ""}
          ${escapeHtml(text)}
        </div>
        ${time ? `<time class="message-time">${escapeHtml(time)}</time>` : ""}
      </div>
    `;
  }

  function renderChatMessageAssistant(page, options = {}) {
    return `
      <div class="assistant-message" data-message-item-id="${escapeHtml(options.itemId || "")}">
        <div class="assistant-meta">
          <span class="assistant-avatar">${icon(options.avatar || "sparkles")}</span>
          <strong>${escapeHtml(options.name || "千变")}</strong>
          <span>${escapeHtml(options.time || "刚刚")}</span>
          ${state.agentTraining >= AFFINITY_MAX ? '<span class="agent-human-badge">契合</span>' : ""}
        </div>
        <div class="assistant-text">
          ${options.content || ""}
          ${options.tool || ""}
        </div>
        <div class="message-actions">
          <button class="message-action" data-toast="已复制" type="button" aria-label="复制">${icon("copy")}</button>
          <button class="message-action" data-toast="已引用" type="button" aria-label="引用">${icon("quote")}</button>
          <button class="message-action" data-sheet="share" type="button" aria-label="分享">${icon("share-2")}</button>
          <button class="message-action" data-toast="正在重新生成" type="button" aria-label="重新生成">${icon("refresh-cw")}</button>
        </div>
      </div>
    `;
  }

  function renderToolCard(title = "读取页面源码", status = "完成", lines = []) {
    return `
      <div class="tool-card">
        <div class="tool-card-head">
          ${icon("terminal-square")}
          <strong>${escapeHtml(title)}</strong>
          <span class="tool-status">${escapeHtml(status)}</span>
        </div>
        <div class="tool-code">${lines.map((line) => escapeHtml(line)).join("\n")}</div>
      </div>
    `;
  }

  function renderBackendMarkdown(text) {
    if (window.QianbianMarkdown?.render) {
      return window.QianbianMarkdown.render(text);
    }
    return `<p>${escapeHtml(text || "").replaceAll("\n", "<br>")}</p>`;
  }

  function renderMobileApprovalContext(approval) {
    const target =
      approval.executionTarget && typeof approval.executionTarget === "object"
        ? approval.executionTarget
        : {};
    const targetDevice = state.devices.find(
      (device) =>
        device.id ===
        String(target.deviceId || target.id || approval.deviceId || ""),
    );
    const deviceName =
      target.name ||
      target.deviceName ||
      approval.deviceName ||
      targetDevice?.name ||
      "";
    const deviceType =
      target.type ||
      target.deviceType ||
      approval.deviceType ||
      targetDevice?.type ||
      "";
    const path =
      approval.subject?.path ||
      approval.subject?.command ||
      approval.path ||
      approval.command ||
      "";
    const riskValue = String(approval.riskLevel || approval.risk || "");
    const riskLabel =
      {
        high: "高风险",
        medium: "中风险",
        low: "低风险",
      }[riskValue.toLowerCase()] || riskValue;
    const tags = [
      deviceName
        ? `<span>${icon("monitor")}${escapeHtml(deviceName)}</span>`
        : "",
      deviceType
        ? `<span>${escapeHtml(
            deviceType === "android" ? "Android" : "Windows",
          )}</span>`
        : "",
      riskLabel
        ? `<span class="is-risk-${escapeHtml(
            riskValue.toLowerCase(),
          )}">${icon("shield-alert")}${escapeHtml(riskLabel)}</span>`
        : "",
      path
        ? `<span class="is-path"><code>${escapeHtml(path)}</code></span>`
        : "",
    ].filter(Boolean);
    if (!tags.length) return "";
    return `<div class="mobile-approval-context">${tags.join("")}</div>`;
  }

  function renderMobileBackendApprovals() {
    return state.backendApprovals
      .map((approval) => {
        const subject =
          typeof approval.subject === "string"
            ? approval.subject
            : approval.subject?.summary ||
              JSON.stringify(approval.subject || {});
        return `
          <div class="approval-card mobile-backend-approval">
            <div class="approval-head">${icon("shield-alert")}需要确认</div>
            <p>${escapeHtml(subject)}</p>
            ${renderMobileApprovalContext(approval)}
            <div class="approval-actions">
              ${(approval.availableChoices || [])
                .map(
                  (choice) => `
                    <button
                      class="${choice.decision === "approved" ? "allow" : "reject"}"
                      data-action="mobile-approval"
                      data-mobile-approval-choice="${escapeHtml(String(choice.choiceId))}"
                      data-approval-id="${escapeHtml(String(approval.approvalId))}"
                      data-approval-choice="${escapeHtml(String(choice.choiceId))}"
                      type="button"
                    >${escapeHtml(choice.label || choice.choiceId)}</button>
                  `,
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderMobileBackendQuestions() {
    return state.backendInputs
      .map(
        (request) => `
          <div class="question-card mobile-backend-question">
            <strong>千变需要补充信息</strong>
            ${(request.questions || [])
              .map(
                (question) => `
                  <p>${escapeHtml(question.question || question.header || "请选择")}</p>
                  <select data-mobile-input-question="${escapeHtml(String(question.id))}">
                    ${(question.options || [])
                      .map(
                        (option) =>
                          `<option value="${escapeHtml(String(option.label))}">${escapeHtml(String(option.label))}</option>`,
                      )
                      .join("")}
                  </select>
                `,
              )
              .join("")}
            <div class="approval-actions">
              <button class="reject" data-action="mobile-input-cancel" data-mobile-input-cancel="${escapeHtml(String(request.userInputId))}" data-input-id="${escapeHtml(String(request.userInputId))}" type="button">取消</button>
              <button class="allow" data-action="mobile-input-answer" data-mobile-input-answer="${escapeHtml(String(request.userInputId))}" data-input-id="${escapeHtml(String(request.userInputId))}" type="button">提交回答</button>
            </div>
          </div>
        `,
      )
      .join("");
  }

  function renderMobileActivityBlock(items) {
    const summary = window.QianbianTimeline.summarize(items);
    if (!summary.text) return "";
    return `
      <details class="backend-activity">
        <summary>
          ${icon("sparkles")}
          <span>${escapeHtml(summary.text)}</span>
          ${icon("chevron-right", "backend-activity-chevron")}
        </summary>
        <div class="backend-activity-list">
          ${items
            .slice(-12)
            .map((item) => {
              const failed = window.QianbianTimeline.isFailed(item);
              const output = window.QianbianTimeline.activityText(item);
              const status = failed
                ? "失败"
                : item.status === "inProgress"
                  ? "进行中"
                  : "完成";
              return `
                <div class="backend-activity-row ${failed ? "is-failed" : ""}">
                  ${icon(
                    item.kind === "toolCall" ? "wrench" : "sparkles",
                  )}
                  <span>
                    <strong>${escapeHtml(
                      item.tool ||
                        (item.kind === "reasoning" ? "思考摘要" : "工具调用"),
                    )}</strong>
                    <small>${escapeHtml(status)}${output ? ` · ${escapeHtml(output)}` : ""}</small>
                    ${item.args ? `<code>${escapeHtml(item.args)}</code>` : ""}
                  </span>
                </div>
              `;
            })
            .join("")}
        </div>
      </details>
    `;
  }

  function renderBackendConversation() {
    const turns = window.QianbianTimeline.group(state.backendTimeline);
    let lastDay = "";
    const messages = turns
      .map((turn) => {
        const firstDatedItem = turn.items.find((item) => item.createdAt);
        const currentDay = firstDatedItem?.createdAt
          ? dayKey(parseChatDate(firstDatedItem.createdAt))
          : "unknown";
        const dateSeparator =
          currentDay !== lastDay
            ? `<div class="chat-day">${escapeHtml(
                formatChatDay(firstDatedItem?.createdAt),
              )}</div>`
            : "";
        lastDay = currentDay;
        const userMessages = turn.items
          .filter((item) => item.kind === "userMessage")
          .map((item) =>
            renderChatMessageUser(
              item.text,
              "",
              item.createdAt,
              item.status,
            ),
          )
          .join("");
        const activity = renderMobileActivityBlock(
          window.QianbianTimeline.activities(turn),
        );
        const assistantMessages = turn.items
          .filter((item) => item.kind === "agentMessage")
          .map((item) =>
            renderChatMessageAssistant(null, {
              itemId: item.itemId,
              content: renderBackendMarkdown(item.text),
              time: formatChatTime(item.createdAt, item.status),
            }),
          )
          .join("");
        return `
          ${dateSeparator}
          <section class="backend-turn" data-turn-id="${escapeHtml(turn.id)}">
            ${userMessages}
            ${activity}
            ${assistantMessages}
          </section>
        `;
      })
      .join("");
    const thinking = state.backendTyping
      ? `
        <div class="thinking-pill">
          <span class="thinking-dots"><span></span><span></span><span></span></span>
          正在生成
        </div>
      `
      : "";
    return `
      ${messages}
      ${thinking}
      ${renderMobileBackendApprovals()}
      ${renderMobileBackendQuestions()}
    `;
  }

  function renderMobileDeviceTasks() {
    if (!state.devices.length) return "";
    const taskUtils = window.QianbianDeviceTasks;
    const rows = state.deviceTasks
      .slice(0, 8)
      .map((task) => {
        const device = state.devices.find(
          (item) => item.id === String(task.deviceId),
        );
        const duration = taskUtils?.formatDuration(task) || "";
        return `
          <article class="mobile-device-task" data-task-id="${escapeHtml(
            task.id || task.type,
          )}">
            <span class="mobile-device-task-icon">${icon(
              task.type === "terminal.exec" ? "terminal" : "file-search",
            )}</span>
            <span class="mobile-device-task-copy">
              <strong>${escapeHtml(task.typeLabel)}</strong>
              <small>${escapeHtml(device?.name || "未知设备")}${
                task.error ? ` · ${escapeHtml(task.error)}` : ""
              }</small>
            </span>
            <span class="task-status task-status-${escapeHtml(task.tone)}">${escapeHtml(
              task.statusLabel,
            )}</span>
            <span class="mobile-device-task-duration">${escapeHtml(
              duration || "—",
            )}</span>
          </article>
        `;
      })
      .join("");
    return `
      <section class="mobile-device-tasks">
        <div class="mobile-device-tasks-head">
          <div>
            <strong>设备任务</strong>
            <span>${state.deviceTasks.length} 条记录</span>
          </div>
          <button data-action="refresh-device-tasks" type="button">${icon(
            "refresh-cw",
          )}刷新</button>
        </div>
        ${
          state.deviceTasksError
            ? `<div class="mobile-devices-error">${escapeHtml(
                state.deviceTasksError,
              )}</div>`
            : ""
        }
        <div class="mobile-device-task-list">
          ${
            state.deviceTasksLoading
              ? `<div class="mobile-devices-loading">正在读取设备任务…</div>`
              : rows ||
                `<div class="mobile-devices-loading">${
                  state.deviceTasksLoaded
                    ? "暂无设备任务"
                    : "等待读取设备任务"
                }</div>`
          }
        </div>
      </section>
    `;
  }

  function renderMobileDevicesOverlay() {
    const pairing = state.pairing;
    const devices = state.devices
      .map(
        (device) => {
          const editing = state.deviceEditingId === device.id;
          return `
          <article class="mobile-device-card ${
            device.paused ? "is-paused" : ""
          }" data-device-id="${escapeHtml(device.id)}">
            <span class="mobile-device-icon">${icon(
              device.type === "android" ? "smartphone" : "laptop",
            )}</span>
            <div class="mobile-device-copy">
              ${
                editing
                  ? `<input class="mobile-device-name-input" data-device-name-input="${escapeHtml(
                      device.id,
                    )}" value="${escapeHtml(device.name)}" aria-label="设备名称" />`
                  : `<strong>${escapeHtml(device.name)}</strong>`
              }
              <small>${escapeHtml(
                devicePlatformLabel(device.platform),
              )} · ${mobileDeviceStateLabel(device)}</small>
              <small>${escapeHtml(
                Array.isArray(device.capabilities) && device.capabilities.length
                  ? `能力：${device.capabilities.join(" / ")}`
                  : "尚未上报能力",
              )}</small>
            </div>
            <div class="mobile-device-actions">
              ${
                editing
                  ? `
                    <button class="is-primary" data-action="save-device-name" data-device-id="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="保存设备名称" title="保存">${icon(
                      "check",
                    )}</button>
                    <button data-action="cancel-device-name" type="button" aria-label="取消重命名" title="取消">${icon(
                      "x",
                    )}</button>
                  `
                  : `
                    <button data-action="edit-device" data-device-id="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="重命名 ${escapeHtml(
                      device.name,
                    )}" title="重命名">${icon("pencil")}</button>
                    <button data-action="toggle-device-pause" data-device-id="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="${
                      device.paused ? "恢复" : "暂停"
                    } ${escapeHtml(device.name)}" title="${
                      device.paused ? "恢复设备" : "暂停设备"
                    }">${icon(device.paused ? "play" : "pause")}</button>
                  `
              }
              <button class="is-danger" data-action="delete-device" data-device-id="${escapeHtml(
                device.id,
              )}" type="button" aria-label="解绑 ${escapeHtml(
                device.name,
              )}" title="解绑设备">${icon("unlink")}</button>
            </div>
          </article>
        `;
        },
      )
      .join("");
    return `
      <section class="mobile-devices-screen" role="dialog" aria-modal="true" aria-label="我的设备">
        <header class="mobile-devices-head">
          <button data-action="close-devices" type="button" aria-label="关闭我的设备">${icon(
            "chevron-left",
          )}</button>
          <div>
            <h2>我的设备</h2>
            <span>${state.devices.length} 台设备</span>
          </div>
          <button class="mobile-devices-pair" data-action="start-device-pair" type="button">${icon(
            "plus",
          )}添加</button>
        </header>
        <div class="mobile-devices-body">
          ${
            state.pairingFormOpen
              ? `
                <section class="mobile-device-pair-form" data-device-pair-form>
                  <div class="mobile-device-pair-form-head">
                    <strong>添加设备</strong>
                    <span>二维码和配对码由服务端生成</span>
                  </div>
                  <label>
                    <span>设备类型</span>
                    <select data-device-pair-type>
                      <option value="windows" ${
                        state.pairingType === "windows" ? "selected" : ""
                      }>千变 for Windows</option>
                      <option value="android" ${
                        state.pairingType === "android" ? "selected" : ""
                      }>千变 for Android</option>
                    </select>
                  </label>
                  <label>
                    <span>设备名称</span>
                    <input data-device-pair-name value="${escapeHtml(
                      state.pairingName,
                    )}" placeholder="例如：我的笔记本" />
                  </label>
                  <div class="mobile-device-pair-form-actions">
                    <button class="is-primary" data-action="submit-device-pair" type="button">${icon(
                      "qr-code",
                    )}生成配对码</button>
                    <button data-action="cancel-device-pair" type="button">取消</button>
                  </div>
                </section>
              `
              : ""
          }
          ${
            pairing
              ? `
                <section class="mobile-device-pair-card">
                  <span>配对码</span>
                  <strong data-pairing-code>${escapeHtml(
                    pairing.pairingCode || "",
                  )}</strong>
                  <canvas class="device-pair-qr" data-qr-payload="${escapeHtml(
                    pairing.qrPayload || pairing.pairingCode || "",
                  )}" width="176" height="176"></canvas>
                  <p>在${
                    pairing.type === "android"
                      ? "千变 for Android"
                      : "千变 for Windows"
                  }中输入配对码，保持当前页面打开。</p>
                  <button data-action="copy-pair-code" type="button">${icon(
                    "copy",
                  )}复制配对码</button>
                  <small>有效期至 ${escapeHtml(
                    formatBackendTime(pairing.expiresAt),
                  )}</small>
                </section>
              `
              : ""
          }
          ${
            state.deviceError
              ? `<div class="mobile-devices-error">${escapeHtml(
                  state.deviceError,
                )}</div>`
              : ""
          }
          <div class="mobile-device-list">
            ${
              devices ||
              (state.devicesLoaded
                ? `<div class="mobile-devices-empty">${icon(
                    "monitor-smartphone",
                  )}<strong>还没有设备</strong><span>安装连接器后输入配对码完成绑定。</span></div>`
                : `<div class="mobile-devices-loading">正在读取设备…</div>`)
            }
          </div>
          ${renderMobileDeviceTasks()}
          <a class="mobile-devices-help" data-device-download-link href="${escapeHtml(
            mobileConnectorPageUrl(),
          )}">
            <strong>安装千变设备连接</strong>
            <span>Windows 支持文件、终端和审批；Android V1 支持在线状态与审批。</span>
          </a>
        </div>
      </section>
    `;
  }

  function renderChatMessages(page) {
    if (state.backendChatActive) {
      return renderBackendConversation();
    }
    const mode = page.mode || "active";
    let messages = "";

    if (mode === "running" || mode === "approval" || mode === "question") {
      messages += renderChatMessageUser("把手机上的 千变 所有 UI 界面做成 HTML，放在电脑上演示。");
      messages += `
        <div class="thinking-pill">
          <span class="thinking-dots"><span></span><span></span><span></span></span>
          ${mode === "approval" ? "等待你的确认" : mode === "question" ? "等待你的回答" : "正在执行页面检查"}
        </div>
      `;
      messages += renderChatMessageAssistant(page, {
        content:
          "<p>我已经按真实页面结构整理了目录，正在检查页面引用、手机内导航和弹层状态。</p>",
        tool: renderToolCard("check-pages --all", mode === "running" ? "运行中" : "完成", [
          `✓ ${visiblePages.length} 个可用页面`,
          "✓ 328 个导航引用",
          "✓ 12 个底部面板",
          "→ Playwright 布局检查",
        ]),
      });
      if (mode === "approval") {
        messages += `
          <div class="approval-card">
            <div class="approval-head">${icon("shield-alert")}需要确认</div>
            <p>允许在本地工作区运行 <span class="inline-code">npm run check:ui</span> 并写入截图文件？</p>
            <div class="approval-actions">
              <button class="allow" data-toast="已允许并继续执行" type="button">允许</button>
              <button class="reject" data-toast="已拒绝执行" type="button">拒绝</button>
            </div>
          </div>
        `;
      }
      if (mode === "question") {
        messages += `
          <div class="question-card">
            <strong>演示优先覆盖哪些尺寸？</strong>
            <p>可以多选；后续仍可在检查器中切换。</p>
            <div class="question-options">
              <button data-toast="已选择 390 × 844" type="button">390 × 844 · 主流手机</button>
              <button data-toast="已选择 430 × 932" type="button">430 × 932 · 大屏手机</button>
              <button data-toast="已选择 360 × 780" type="button">360 × 780 · 紧凑手机</button>
            </div>
          </div>
        `;
      }
    } else if (mode === "bot") {
      messages += renderChatMessageAssistant(page, {
        name: page.botName || "Deepy",
        avatar: "sparkles",
        content:
          "<p>早上好。界面复刻的页面目录已经整理好了，要我先跑一遍所有入口，还是先精修对话与设置主流程？</p>",
      });
      messages += renderChatMessageUser("先把所有入口都跑通。", "你");
      messages += renderChatMessageAssistant(page, {
        name: page.botName || "Deepy",
        avatar: "sparkles",
        content:
          "<p>明白。我会按“启动 → 对话 → 全部功能 → 设置 → 二级页 → 弹层”的顺序检查，并把失败项列出来。</p>",
        tool: renderToolCard("route-audit", "完成", [
          `pages: ${visiblePages.length}`,
          "unreachable: 0",
          "dead_links: 0",
          "open_sheets: 12",
        ]),
      });
    } else if (mode === "room") {
      messages += renderChatMessageUser("今天先把 UI 演示里的所有入口跑一遍。");
      messages += renderChatMessageAssistant(page, {
        name: "Deepy",
        avatar: "sparkles",
        content: "<p>我负责页面树和导航检查。</p>",
      });
      messages += renderChatMessageAssistant(page, {
        name: "设计搭档",
        avatar: "palette",
        content: "<p>我会检查窄屏文字溢出、按钮命中区和主题对比度。</p>",
      });
      messages += renderChatMessageAssistant(page, {
        name: "代码审查员",
        avatar: "scan-search",
        content: "<p>最后我统一检查死链、重复 ID 和不可达弹层。</p>",
      });
    } else {
      messages += renderChatMessageUser("把手机上的 千变 所有 UI 界面做成 HTML，放在电脑上演示。");
      messages += renderChatMessageAssistant(page, {
        content:
          "<p>我已经把界面收敛为以 <strong>对话为主</strong> 的交互演示。顶部保留历史记录与技能空间，外观和系统设置收在历史记录右下角。</p><p>当前覆盖启动、对话、技能板块、社区与伙伴、外观、主机与设置。</p>",
        tool: renderToolCard("build-ui-atlas", "完成", [
          `✓ ${visibleGroups.length} 个对话延伸分组`,
          `✓ ${visiblePages.length} 个可用页面`,
          "✓ 前端状态模拟",
          "✓ 本地资源，无需服务器",
        ]),
      });
      messages += [
        {
          role: "user",
          text: "长对话与玻璃输入框：请把这一轮多轮对话展开，我想看看消息滚动后输入框的透明度和模糊效果。",
        },
        {
          role: "assistant",
          time: "10:18",
          content:
            "<p>收到。我会保留一段足够长的上下文，让消息区产生真实滚动，同时让输入框固定在底部，方便检查玻璃拟态。</p>",
        },
        {
          role: "user",
          text: "输入框不要被底部渐变完全遮住，要能透出后面的内容。",
        },
        {
          role: "assistant",
          time: "10:19",
          content:
            "<p>底部会改成半透明渐变，输入框本身使用低不透明背景、高光边框和背景模糊，滚动内容经过时会形成玻璃层次。</p>",
        },
        {
          role: "user",
          text: "再检查一下长文本、工具卡和多轮消息同时存在时的布局。",
        },
        {
          role: "assistant",
          time: "10:20",
          content:
            "<p>我正在混合用户气泡、助手回复和工具结果，确保滚动区域不会被底部输入框挤压。</p>",
          tool: renderToolCard("glass-composer-check", "完成", [
            "✓ 消息区可滚动",
            "✓ 输入框固定在底部",
            "✓ 透明层不高于 30%",
            "✓ 背景模糊已启用",
          ]),
        },
        {
          role: "user",
          text: "如果消息很多，最后一条要能自然停在输入框上方。",
        },
        {
          role: "assistant",
          time: "10:21",
          content:
            "<p>消息底部已经预留安全间距，自动滚动到底部时，最后一条内容不会被输入框覆盖。</p>",
        },
        {
          role: "user",
          text: "再把浅色和深色下的边框都检查一遍。",
        },
        {
          role: "assistant",
          time: "10:22",
          content:
            "<p>边框使用主题文字色的低透明度，外层还有白色高光，因此浅色和深色模式都能保持玻璃边缘。</p>",
        },
        {
          role: "user",
          text: "现在把最终状态停在对话底部，我要直接看输入框。",
        },
        {
          role: "assistant",
          time: "10:23",
          content:
            "<p>已经准备好。当前消息足够形成长列表，底部输入框保持悬浮，可以直接测试输入和发送。</p>",
        },
      ]
        .map((entry) =>
          entry.role === "user"
            ? renderChatMessageUser(entry.text)
            : renderChatMessageAssistant(page, {
                time: entry.time,
                content: entry.content,
                tool: entry.tool || "",
              }),
        )
        .join("");
    }

    for (const message of state.chatMessages) {
      messages += renderChatMessageUser(message);
    }

    return messages;
  }

  function renderComposerControls({ embedded = false } = {}) {
    const leftButton = embedded
      ? `<button class="composer-plus composer-close" data-action="close-sheet" type="button" aria-label="关闭添加内容">${icon("x")}</button>`
      : `<button class="composer-plus" data-sheet="plus" type="button" aria-label="添加内容">${icon("plus")}</button>`;
    return `
      <div class="phone-composer">
        <label class="composer-environment" title="${escapeHtml(currentMobileEnvironment().detail || "工作环境")}">
          ${icon(currentMobileEnvironment().kind === "cloud" ? "cloud" : "monitor")}
          <select id="mobile-environment-select" aria-label="工作环境">
            ${mobileEnvironmentOptions()}
          </select>
        </label>
        ${leftButton}
        <textarea class="composer-input" id="chat-input" rows="1" placeholder="发消息给千变">${escapeHtml(
          state.chatDraft,
        )}</textarea>
        <button class="composer-send" data-action="send-message" type="button" aria-label="发送">${icon("arrow-up")}</button>
      </div>
    `;
  }

  function renderComposer(page) {
    if (state.sheet === "plus") {
      const isOpening = pendingSheetAnimation === "plus";
      return `
        <div class="chat-composer-wrap is-extended">
          <div class="composer-extension-stack">
            ${renderComposerControls({ embedded: true })}
            <div class="composer-extension-panel-wrap ${isOpening ? "is-opening" : ""}">
              <section class="composer-extension-panel" role="group" aria-label="添加内容">
                <div class="compose-action-grid">
                  ${COMPOSE_ACTIONS.map(
                    (item) => `
                      <button class="compose-action-tile" data-toast="${escapeHtml(item[0])} · 已选择" type="button" aria-label="${escapeHtml(item[0])}">
                        <span class="compose-action-icon">${icon(item[2])}</span>
                        <span class="compose-action-label">${escapeHtml(item[0])}</span>
                      </button>
                    `,
                  ).join("")}
                </div>
              </section>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div class="chat-composer-wrap">
        ${renderComposerControls()}
      </div>
    `;
  }

  function conversationHeader({
    leftAttribute = 'data-action="open-history"',
    leftLabel = "对话目录",
  } = {}) {
    const progress = Math.round(state.agentTraining);
    const isAligned = progress >= AFFINITY_MAX;
    const progressFill = affinityFill(progress);
    return `
      <header class="chat-top new-chat-top unified-conversation-nav">
        <button class="phone-icon-button ghost conversation-nav-action" ${leftAttribute} type="button" aria-label="${escapeHtml(
          leftLabel,
        )}">${conversationNavIcon("history")}</button>
        <button
          class="top-progress-cluster ${isAligned ? "is-complete" : ""}"
          style="--agent-progress:${progressFill}%"
          data-action="open-affinity"
          type="button"
          aria-label="查看 Agent 契合度，当前 ${progress}%"
          aria-haspopup="dialog"
        >
          <div
            class="top-progress-ring"
            role="progressbar"
            aria-label="用户与 Agent 契合度"
            aria-valuemin="0"
            aria-valuemax="${AFFINITY_MAX}"
            aria-valuenow="${progress}"
          >
            <div class="top-progress-logo">
              <img src="assets/brand/qianbian-tile.png" alt="千变 Logo" />
            </div>
          </div>
        </button>
        <button class="phone-icon-button ghost conversation-nav-action" data-action="open-main-nav" type="button" aria-label="技能空间">${conversationNavIcon(
          "skills",
        )}</button>
      </header>
    `;
  }

  function renderChat(page) {
    const mode = page.mode || "active";
    const isBot = mode === "bot" || mode === "room";
    const title = isBot ? page.botName || page.title : page.title === "新对话" ? "新对话" : "千变 界面复刻";
    const status =
      state.network === "offline"
        ? "未连接"
        : state.engine === "error"
          ? "引擎异常"
          : mode === "running"
            ? "正在生成"
            : mode === "approval"
              ? "等待确认"
              : mode === "question"
                ? "等待回答"
                : isBot
                  ? "在线"
                  : state.backendModelLabel
                    ? `已连接 · ${state.backendModelLabel}`
                    : "已连接";
    const statusClass =
      state.network === "offline" || state.engine === "error"
        ? "is-error"
        : ["running", "approval", "question"].includes(mode)
          ? "is-busy"
          : "";

    const header = conversationHeader();

    if (mode === "empty") {
      return `
        <div class="phone-page">
          ${statusBar()}
          <div class="chat-page">
            ${header}
            <div class="phone-scroll">
              <div class="chat-empty">
                <div class="new-chat-slogan">
                  <h1>一句话，千变万化。</h1>
                  <p class="slogan-note">说出想法，千变会把它一步步变成你要的样子。</p>
                </div>
              </div>
            </div>
            ${renderComposer(page)}
          </div>
        </div>
      `;
    }

    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="chat-page">
          ${header}
          <div class="chat-messages" id="chat-messages">
            ${renderChatMessages(page)}
          </div>
          ${renderComposer(page)}
        </div>
      </div>
    `;
  }

  function renderDrawer(page) {
    const drawerSessions = getMobileSessions();
    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="chat-page">
          ${conversationHeader({
            leftAttribute: 'data-action="close-drawer"',
            leftLabel: "关闭目录",
          })}
          <div class="chat-messages">
            <div class="chat-day">${escapeHtml(
              formatChatDay(new Date().toISOString()),
            )}</div>
            ${renderChatMessageUser("先整理全部页面，再把主流程连起来。")}
            ${renderChatMessageAssistant(page, {
              content: "<p>页面目录已整理完成。打开左侧对话目录可以查看会话，也可以从底部进入全部功能与设置。</p>",
            })}
          </div>
          ${renderComposer(page)}
          <button class="phone-scrim" data-action="close-drawer" type="button" aria-label="关闭目录"></button>
          <aside class="drawer-panel">
            <div class="drawer-head">
              <div class="drawer-lockup">
                <img src="assets/brand/qianbian-tile.png" alt="千变" />
                <div>
                  <strong>千变</strong>
                </div>
              </div>
              <button class="drawer-new-chat" data-action="new-chat" type="button">${icon("square-pen")}新对话</button>
            </div>
            <button class="drawer-search" data-nav="session-search" type="button">${icon("search")}搜索对话</button>
            <div class="drawer-workspace">${icon("folder")}工作区 <span style="margin-left:auto">${drawerSessions.length} 个会话</span></div>
            <div class="drawer-session-list">
              <div class="drawer-list-label">最近对话</div>
              ${drawerSessions
                .map(
                  (session) => `
                    <button
                      class="drawer-session ${session.active ? "is-active" : ""}"
                      data-action="select-session"
                      data-session-id="${escapeHtml(session.id)}"
                      type="button"
                    >
                      <span class="drawer-session-icon">${icon(session.icon || "message-circle")}</span>
                      <span class="drawer-session-name">${escapeHtml(session.name)}</span>
                      <time>${escapeHtml(session.time)}</time>
                    </button>
                  `,
                )
                .join("")}
            </div>
            <div class="drawer-footer">
              <span style="flex:1"></span>
              <button class="phone-icon-button" data-nav="session-workbench" type="button" aria-label="会话工作台">${icon(
                "panels-top-left"
              )}</button>
              <button class="phone-icon-button" data-nav="settings" type="button" aria-label="设置">${icon(
                "settings-2"
              )}</button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderSkillHubCards(items, mode) {
    return items
      .map((item, index) => {
        const title = item.name || item.title || "";
        const description = item.description || "";
        const iconName = item.icon || (mode === "recommended" ? "book-open" : "puzzle");
        const skillIndex = item.skillIndex ?? index;
        return `
          <button
            class="skill-hub-card"
            data-action="open-skill-detail"
            data-skill-source="${mode}"
            data-skill-index="${skillIndex}"
            data-skill-category="${escapeHtml(item.category || "")}"
            data-skill-group="${escapeHtml(item.group || "")}"
            data-skill-subcategory="${escapeHtml(item.subcategory || "")}"
            type="button"
          >
            <span class="skill-hub-card-icon">${icon(iconName)}</span>
            <span class="skill-hub-card-copy">
              <strong>${escapeHtml(title)}</strong>
              <small>${escapeHtml(description)}</small>
            </span>
            <span class="skill-hub-card-meta">查看详情</span>
          </button>
        `;
      })
      .join("");
  }

  function renderPublishedSkillCards(items) {
    return items
      .map((item) => {
        const selected = state.publishedSkillSelection.has(item.name);
        if (state.skillMultiSelect) {
          return `
            <button
              class="published-skill-select-card ${selected ? "is-selected" : ""}"
              data-published-skill-select="${escapeHtml(item.name)}"
              type="button"
              aria-pressed="${selected}"
            >
              <span class="published-skill-select-mark">${selected ? icon("check") : ""}</span>
              <span class="published-skill-icon">${icon(item.icon || "sparkles")}</span>
              <span class="published-skill-copy">
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.description || "")}</small>
              </span>
              <span class="published-skill-badge">${escapeHtml(item.badge || "已发布")}</span>
            </button>
          `;
        }
        return `
          <article class="published-skill-card">
            <button
              class="skill-hub-card"
              data-action="open-skill-detail"
              data-skill-source="mine"
              data-skill-index="${item.skillIndex}"
              data-skill-subcategory="${escapeHtml(item.subcategory || "")}"
              type="button"
            >
              <span class="skill-hub-card-icon">${icon(item.icon || "sparkles")}</span>
              <span class="skill-hub-card-copy">
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.description || "")}</small>
              </span>
              <span class="skill-hub-card-meta">查看详情</span>
            </button>
            <div class="published-skill-card-footer">
              <span>${escapeHtml(item.badge || "已发布")}</span>
              <button data-action="unpublish-skill" data-skill-name="${escapeHtml(item.name)}" type="button">取消发布</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function getActiveSkillItems(items) {
    return items.filter((item) => !state.deletedSkills.has(item.name));
  }

  function getMySkillItems() {
    const items = [
      ...state.publishedSkills,
      ...(pages.plugins?.mySkills || []),
    ];
    return items.filter(
      (item, index) =>
        items.findIndex((candidate) => candidate.name === item.name) === index,
    );
  }

  function isInstalledSkillEnabled(name) {
    return state.installedSkillEnabled.get(name) !== false;
  }

  function getActiveSkillConflicts() {
    return (pages.plugins?.skillConflicts || [])
      .map((conflict) => ({
        ...conflict,
        skills: conflict.skills.filter(
          (skill) =>
            !state.deletedSkills.has(skill.name) &&
            (skill.source !== "已安装技能" ||
              isInstalledSkillEnabled(skill.name)),
        ),
      }))
      .filter((conflict) => conflict.skills.length >= 2);
  }

  function renderMainNavOverlay() {
    const affinity = Math.round(state.agentTraining);
    const affinityFillValue = affinityFill(affinity);
    const installedSkills = getActiveSkillItems(
      pages.plugins?.pluginList || [],
    );
    const mySkills = getActiveSkillItems(getMySkillItems());
    const marketSkills = getActiveSkillItems(
      pages["plugin-market"]?.marketItems || [],
    );
    const hotSkills = marketSkills.slice(0, 5).map((item, index) => ({
      ...item,
      skillIndex: index,
    }));
    return `
      <section class="main-nav-screen" role="dialog" aria-modal="true" aria-label="技能空间">
        <header class="main-nav-head">
          <button class="phone-icon-button ghost" data-action="close-main-nav" type="button" aria-label="返回对话">${icon(
            "chevron-left"
          )}</button>
          <div>
            <h2>技能空间</h2>
          </div>
        </header>
        <button
          class="main-nav-hero"
          data-action="open-skill-settings"
          type="button"
          aria-label="打开空间设置"
        >
          <div class="main-nav-logo">
            <img src="assets/brand/qianbian-tile.png" alt="千变 Logo" />
          </div>
          <div
            class="main-nav-affinity"
            data-affinity-progress
            role="progressbar"
            aria-label="用户与 Agent 契合度"
            aria-valuemin="0"
            aria-valuemax="${AFFINITY_MAX}"
            aria-valuenow="${affinity}"
          >
            <div class="main-nav-affinity-head">
              <strong>千变</strong>
              <b class="main-nav-affinity-value">${affinity}%</b>
            </div>
            <span class="main-nav-affinity-label">用户与 Agent 契合度</span>
            <div class="main-nav-affinity-track">
              <span class="main-nav-affinity-fill" style="width:${affinityFillValue}%"></span>
            </div>
          </div>
          <span class="main-nav-hero-action">${icon("settings-2")}</span>
        </button>
        <div class="skill-hub-actions is-single">
          <button
            class="skill-hub-entry is-text-only"
            data-action="open-skill-modal"
            data-skill-modal="mine"
            type="button"
          >
            <span class="skill-hub-entry-copy"><strong>我发布的技能</strong></span>
            <span class="skill-hub-entry-count">${mySkills.length} 项</span>
            <span class="skill-hub-entry-arrow">${icon("chevron-right")}</span>
          </button>
        </div>
        <section class="skill-hot">
          <div class="skill-hot-head">
            <div>
              <h3>热门技能</h3>
            </div>
            <button class="skill-more-button" data-action="open-hot-skills" type="button">
              查看更多
              ${icon("arrow-right")}
            </button>
          </div>
          <div class="skill-hub-list">
            ${renderSkillHubCards(hotSkills, "hot")}
          </div>
        </section>
        <button
          class="skill-share-pill"
          data-nav="publish-skill"
          type="button"
          aria-label="点击分享你的 Agent Skill"
        >
          <span class="skill-share-plus">${icon("plus")}</span>
          <span class="skill-share-text">点击分享你的 Agent Skill</span>
          <span class="skill-share-spacer" aria-hidden="true"></span>
        </button>
        <div class="main-nav-handle" aria-hidden="true"></div>
      </section>
    `;
  }

  function renderSkillDetailOverlay() {
    const { source, item } = state.skillDetail;
    const title = item.name || item.title || "技能";
    const description = item.description || "暂无技能说明";
    const iconName = item.icon || "sparkles";
    const key = `${source}:${title}`;
    const downloaded = state.downloadedSkills.has(key);
    const sourceLabel =
      source === "market"
        ? "技能市场"
        : source === "hot"
          ? "热门技能"
          : source === "recommended"
            ? "为你推荐"
            : source === "mine"
              ? "我发布的技能"
            : "已安装技能";
    const samples = {
      "UI 组件": {
        version: "1.4.0",
        entry: "src/index.js",
        permissions: ["界面渲染", "临时状态", "图表绘制"],
        source: `// UI 组件
export default {
  name: "ui-components",
  version: "1.4.0",
  tools: ["render_card", "open_form", "draw_chart"],
  permissions: ["ui:render", "state:temporary"]
};`,
        prompt:
          "当用户需要查看结构化结果、填写交互表单或展示图表时，请使用 UI 组件渲染，并保持内容简洁、可操作。",
      },
      "图像与视频": {
        version: "1.2.0",
        entry: "skills/media.js",
        permissions: ["媒体生成", "附件读取", "任务提交"],
        source: `// 图像与视频
export async function run(input) {
  return media.generate({
    prompt: input.prompt,
    type: input.type || "image",
    attachments: input.files
  });
}`,
        prompt:
          "当用户要求生成、编辑或分析图片与视频时，先确认尺寸、风格和输出格式，再调用媒体服务。",
      },
      联网搜索: {
        version: "1.1.2",
        entry: "skills/web-search.js",
        permissions: ["网络访问", "引用抓取"],
        source: `// 联网搜索
export async function run({ query, freshness = "week" }) {
  const results = await search.query(query, { freshness });
  return results.map(toCitationCard);
}`,
        prompt:
          "遇到需要实时信息、来源核验或外部资料的问题时，使用联网搜索，并保留原始链接和引用摘要。",
      },
      语音播报: {
        version: "1.0.5",
        entry: "skills/speech.js",
        permissions: ["音频播放", "语音模型"],
        source: `// 语音播报
export async function speak(text) {
  const audio = await tts.synthesize(text, {
    voice: "云海",
    speed: 1.0
  });
  return player.play(audio);
}`,
        prompt:
          "当用户要求朗读回复或开启免提对话时，调用语音播报，并优先保持自然停顿和清晰语气。",
      },
      "Mermaid Preview": {
        version: "2.0.1",
        entry: "market/mermaid/index.js",
        permissions: ["界面渲染", "代码块读取"],
        source: `// Mermaid Preview
export function renderBlock(block) {
  if (block.lang !== "mermaid") return null;
  return { component: "mermaid-preview", source: block.code };
}`,
        prompt:
          "检测到 mermaid 代码块时，自动展示可缩放流程图，并在图形下方保留原始代码。",
      },
      "Web Capture": {
        version: "1.3.0",
        entry: "market/web-capture/index.js",
        permissions: ["网络访问", "正文提取"],
        source: `// Web Capture
export async function capture(url) {
  const page = await browser.open(url);
  return {
    title: page.title,
    content: page.readableText,
    citations: page.links
  };
}`,
        prompt:
          "用户提供网页链接并希望总结、引用或归档时，抓取正文和关键元数据，同时保留来源地址。",
      },
      "Pet Themes": {
        version: "1.1.0",
        entry: "market/pet-themes/manifest.json",
        permissions: ["资源读取", "宠物渲染"],
        source: `{
  "name": "pet-themes",
  "themes": ["deep-sea", "paper", "night"],
  "assets": ["idle.webp", "happy.webp", "typing.webp"]
}`,
        prompt:
          "当用户选择宠物主题时，加载对应的静态资源与动作配置，并保持低资源占用。",
      },
      "Board Tools": {
        version: "1.0.4",
        entry: "market/board-tools/index.js",
        permissions: ["界面渲染", "会话状态"],
        source: `// Board Tools
export function createBoard(columns) {
  return {
    type: "interactive-board",
    columns,
    draggable: true
  };
}`,
        prompt:
          "用户需要整理任务、对比方案或规划步骤时，创建可交互看板，并允许修改状态和顺序。",
      },
      使用指南: {
        version: "1.0.0",
        entry: "skills/guide.md",
        permissions: ["只读知识库"],
        source: `// 使用指南
export const guide = {
  scope: "app-help",
  answerStyle: "concise",
  citeScreens: true
};`,
        prompt:
          "回答产品使用问题时，优先查找内置指南，给出具体入口和操作步骤，避免推测不存在的功能。",
      },
      技能开发: {
        version: "1.2.0",
        entry: "skills/developer/index.js",
        permissions: ["工作区读写", "命令执行"],
        source: `// 技能开发
export function scaffold(name) {
  return createFiles({
    "manifest.json": manifest(name),
    "index.js": entryTemplate(),
    "README.md": readmeTemplate(name)
  });
}`,
        prompt:
          "用户要创建或调试技能时，生成 manifest、入口代码和说明文档，并运行最小验证用例。",
      },
      "pet-theme": {
        version: "1.0.3",
        entry: "skills/pet-theme/index.js",
        permissions: ["图片读取", "资源生成"],
        source: `// pet-theme
export async function buildTheme(files) {
  return pipeline([
    resizeAssets(files),
    generateAnimationFrames(),
    validateThemePackage()
  ]);
}`,
        prompt:
          "根据用户提供的角色图生成宠物主题资源，检查透明背景、尺寸和动作帧后输出技能包。",
      },
      "security-review": {
        version: "1.5.0",
        entry: "skills/security-review/index.js",
        permissions: ["代码读取", "依赖审计"],
        source: `// security-review
export async function review(target) {
  return audit(target, {
    secrets: true,
    authz: true,
    injection: true,
    dependencies: true
  });
}`,
        prompt:
          "审查代码或配置时，优先检查输入边界、权限提升、密钥泄漏、注入风险和依赖漏洞，并给出可执行修复。",
      },
    };
    const sample = samples[title] || {
      version: "1.0.0",
      entry: "skills/index.js",
      permissions: ["按需授权"],
      source: `// ${title}\nexport default {\n  name: "${title}",\n  description: "${description}"\n};`,
      prompt: `使用“${title}”完成对应任务，并在执行前确认输入、权限和预期输出。`,
    };
    return `
      <div class="skill-modal-layer">
        <button class="skill-modal-scrim" data-action="close-skill-modal" type="button" aria-label="关闭技能悬浮窗"></button>
        <section class="skill-modal" role="dialog" aria-modal="true" aria-label="技能详情">
          <header class="skill-modal-head">
            <div>
              <h2>技能详情</h2>
            </div>
            <button class="skill-modal-close" data-action="close-skill-modal" type="button" aria-label="关闭">${icon(
              "x",
            )}</button>
          </header>
          <div class="skill-detail">
            <span class="skill-detail-icon">${icon(iconName)}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
            <div class="skill-detail-meta">
              <span>${icon("layers")}${sourceLabel}</span>
              <span>${icon("badge-check")}${downloaded ? "已下载" : "可下载"}</span>
            </div>
            <section class="skill-detail-section">
              <h4>基本信息</h4>
              <div class="skill-info-grid">
                <div><span>版本</span><strong>${escapeHtml(sample.version)}</strong></div>
                <div><span>入口文件</span><strong>${escapeHtml(sample.entry)}</strong></div>
                <div><span>技能类型</span><strong>${escapeHtml(sourceLabel)}</strong></div>
                <div><span>当前状态</span><strong>${downloaded ? "已下载" : "可下载"}</strong></div>
              </div>
            </section>
            <section class="skill-detail-section">
              <h4>技能源码</h4>
              <pre class="skill-source-code"><code>${escapeHtml(sample.source)}</code></pre>
            </section>
            <section class="skill-detail-section">
              <h4>提示词</h4>
              <p class="skill-prompt">${escapeHtml(sample.prompt)}</p>
            </section>
            <section class="skill-detail-section">
              <h4>权限与资源</h4>
              <div class="skill-permission-list">
                ${sample.permissions
                  .map(
                    (permission) =>
                      `<span>${icon("shield-check")}${escapeHtml(permission)}</span>`,
                  )
                  .join("")}
              </div>
            </section>
            <button
              class="skill-download-button"
              data-action="download-skill"
              type="button"
              ${downloaded ? "disabled" : ""}
            >${icon(downloaded ? "check" : "download")}${downloaded ? "已下载" : "下载技能"}</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderSkillConflictSettings() {
    const affinity = Math.round(state.agentTraining);
    const conflicts = getActiveSkillConflicts();
    const selectedCount = state.skillDeleteSelection.size;
    const installedSkills = getActiveSkillItems(
      pages.plugins?.pluginList || [],
    );
    const selectedInstalledSkills = installedSkills.filter((skill) =>
      state.installedSkillSelection.has(skill.name),
    );
    const hasEnabledSelected = selectedInstalledSkills.some((skill) =>
      isInstalledSkillEnabled(skill.name),
    );
    const hasDisabledSelected = selectedInstalledSkills.some(
      (skill) => !isInstalledSkillEnabled(skill.name),
    );
    const conflictSection = conflicts.length
      ? `
        <div class="skill-conflict-heading">
          <div>
            <h3>冲突与建议</h3>
            <span>${conflicts.length} 组</span>
          </div>
          <p>同类生活技能职责重叠时，建议保留更完整的一项。</p>
        </div>
        <div class="skill-conflict-list">
          ${conflicts
            .map(
              (conflict) => `
                <article class="skill-conflict-card">
                  <header>
                    <span class="skill-conflict-badge">${conflict.severity === "warning" ? "需处理" : "可优化"}</span>
                    <strong>${escapeHtml(conflict.title)}</strong>
                  </header>
                  <div class="skill-conflict-choices">
                    ${conflict.skills
                      .map(
                        (skill) => `
                          <label class="skill-conflict-choice">
                            <input
                              type="checkbox"
                              data-skill-delete-name="${escapeHtml(skill.name)}"
                              ${state.skillDeleteSelection.has(skill.name) ? "checked" : ""}
                            />
                            <span class="skill-conflict-checkmark">${icon("check")}</span>
                            <span class="skill-conflict-choice-copy">
                              <strong>${escapeHtml(skill.name)}</strong>
                              <small>${escapeHtml(skill.source)}</small>
                            </span>
                            ${skill.recommended ? `<span class="skill-conflict-recommended">建议保留</span>` : ""}
                          </label>
                        `,
                      )
                      .join("")}
                  </div>
                  <div class="skill-conflict-suggestion">
                    ${icon("lightbulb")}
                    <p><strong>建议</strong>${escapeHtml(conflict.suggestion)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      `
      : "";
    return `
      <section class="skill-settings-layer" role="dialog" aria-modal="true" aria-label="空间设置">
        <header class="skill-settings-head">
          <button class="phone-icon-button ghost" data-action="close-skill-modal" type="button" aria-label="返回技能空间">${icon(
            "chevron-left",
          )}</button>
          <div>
            <h2>空间设置</h2>
          </div>
        </header>
        <div class="skill-settings-body">
          <section class="skill-settings-affinity">
            <div class="skill-settings-avatar">
              <img src="assets/brand/qianbian-tile.png" alt="千变 Logo" />
            </div>
            <div>
              <span>当前契合度</span>
              <strong>${affinity}%</strong>
              <div class="skill-settings-progress" role="progressbar" aria-label="当前契合度" aria-valuemin="0" aria-valuemax="${AFFINITY_MAX}" aria-valuenow="${affinity}">
                <span style="width:${affinityFill(affinity)}%"></span>
              </div>
            </div>
          </section>

          <section class="skill-settings-options">
            <div class="skill-settings-option">
              <span>冲突检测</span>
              <button class="phone-toggle is-on" data-toggle="skillConflictDetection" type="button" aria-label="切换冲突检测" aria-pressed="true"><span></span></button>
            </div>
            <div class="skill-settings-option">
              <span>重复技能提醒</span>
              <button class="phone-toggle is-on" data-toggle="skillDuplicateNotice" type="button" aria-label="切换重复技能提醒" aria-pressed="true"><span></span></button>
            </div>
          </section>

          ${conflictSection}

          <section class="skill-settings-installed">
            <div class="skill-settings-installed-head">
              <div>
                <h3>已安装技能</h3>
                <span>${installedSkills.length} 项</span>
              </div>
              <p>已安装技能与发布技能会一起参与冲突检测。</p>
            </div>
            <div class="skill-settings-installed-list">
              ${installedSkills
                .map((skill) => {
                  const enabled = isInstalledSkillEnabled(skill.name);
                  const selected = state.installedSkillSelection.has(skill.name);
                  return `
                    <div class="skill-settings-installed-row ${selected ? "is-selected" : ""}">
                      <label class="skill-installed-select">
                        <input
                          type="checkbox"
                          data-installed-skill-select="${escapeHtml(skill.name)}"
                          ${selected ? "checked" : ""}
                        />
                        <span>${icon("check")}</span>
                      </label>
                      <span class="skill-settings-installed-icon">${icon(skill.icon || "puzzle")}</span>
                      <span class="skill-settings-installed-copy">
                        <strong>${escapeHtml(skill.name)}</strong>
                        <small>${escapeHtml(skill.description || "")}</small>
                      </span>
                      <button
                        class="skill-installed-toggle ${enabled ? "is-on" : ""}"
                        data-action="toggle-installed-skill"
                        data-skill-name="${escapeHtml(skill.name)}"
                        type="button"
                      >${enabled ? "停用" : "启用"}</button>
                    </div>
                  `;
                })
                .join("")}
            </div>
            <div class="skill-installed-batch">
              <span id="installed-skill-selection-count">已选择 ${state.installedSkillSelection.size} 项</span>
              <div>
                ${hasEnabledSelected ? `<button data-action="disable-selected-installed" type="button">停用所选</button>` : ""}
                ${hasDisabledSelected ? `<button data-action="enable-selected-installed" type="button">启用所选</button>` : ""}
              </div>
            </div>
          </section>

        </div>
        <footer class="skill-delete-bar">
          <span id="skill-delete-count">已选择 ${selectedCount} 项</span>
          <button
            data-action="delete-selected-skills"
            type="button"
            ${selectedCount ? "" : "disabled"}
          >删除所选</button>
        </footer>
      </section>
    `;
  }

  function getSkillBrowserItems() {
    const sourceItems = getActiveSkillItems(
      state.skillModal === "installed"
        ? pages.plugins?.pluginList || []
        : state.skillModal === "mine"
          ? getMySkillItems()
          : pages["plugin-market"]?.marketItems || [],
    );
    const query = state.skillBrowserQuery.trim().toLowerCase();
    return sourceItems
      .map((item, index) => ({ ...item, skillIndex: index }))
      .filter((item) => {
        const filterMatch =
          state.skillBrowserFilter === "all" ||
          item.subcategory === state.skillBrowserFilter;
        const textMatch =
          !query ||
          `${item.name} ${item.description} ${item.group || ""} ${item.subcategory || ""} ${item.badge || ""}`
            .toLowerCase()
            .includes(query);
        return filterMatch && textMatch;
      });
  }

  function getSkillBrowserSourceMode() {
    if (state.skillModal === "installed") return "installed";
    if (state.skillModal === "mine") return "mine";
    return "market";
  }

  function getSkillFilterGroups() {
    return [
      {
        id: "life-scenes",
        label: "生活场景",
        options: [
          { id: "cooking", label: "烹饪" },
          { id: "home", label: "收纳" },
          { id: "travel", label: "出行" },
        ],
      },
      {
        id: "wellness",
        label: "身心健康",
        options: [
          { id: "sleep", label: "睡眠" },
          { id: "fitness", label: "运动" },
          { id: "mood", label: "情绪" },
        ],
      },
      {
        id: "growth",
        label: "成长习惯",
        options: [
          { id: "reading", label: "阅读" },
          { id: "focus", label: "专注" },
        ],
      },
    ];
  }

  function updateSkillFilterMenus() {
    const groups = getSkillFilterGroups();
    document.querySelectorAll("[data-skill-filter]").forEach((button) => {
      const selected = button.dataset.skillFilter === state.skillBrowserFilter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    groups.forEach((group) => {
      const trigger = document.querySelector(
        `[data-skill-filter-group="${group.id}"]`,
      );
      const menu = document.querySelector(
        `.skill-filter-menu[data-filter-menu="${group.id}"]`,
      );
      const hasFilter = group.options.some(
        (option) => option.id === state.skillBrowserFilter,
      );
      const expanded = state.skillBrowserGroupOpen === group.id;
      trigger?.classList.toggle("has-filter", hasFilter);
      trigger?.setAttribute("aria-expanded", String(expanded));
      if (menu) menu.hidden = !expanded;
    });
  }

  function updateSkillBrowserResults() {
    const list = document.getElementById("skill-browser-results");
    if (!list) return;
    const items = getSkillBrowserItems();
    list.innerHTML =
      state.skillModal === "mine"
        ? renderPublishedSkillCards(items)
        : renderSkillHubCards(items, getSkillBrowserSourceMode());
    const count = document.getElementById("skill-browser-count");
    if (count) count.textContent = `${String(items.length).padStart(2, "0")} 项`;
    const empty = document.getElementById("skill-browser-empty");
    if (empty) empty.hidden = items.length > 0;
    updateIcons(list);
  }

  function updatePublishedSkillControls() {
    const count = document.getElementById("published-skill-delete-count");
    if (count) {
      count.textContent = `已选择 ${state.publishedSkillSelection.size} 项`;
    }
    const button = document.querySelector(
      '[data-action="delete-selected-published"]',
    );
    if (button) button.disabled = state.publishedSkillSelection.size === 0;
  }

  function updateSkillDeleteControls() {
    const count = document.getElementById("skill-delete-count");
    if (count) {
      count.textContent = `已选择 ${state.skillDeleteSelection.size} 项`;
    }
    const button = document.querySelector(
      '[data-action="delete-selected-skills"]',
    );
    if (button) button.disabled = state.skillDeleteSelection.size === 0;
  }

  function renderSkillBrowserOverlay() {
    const filterGroups = getSkillFilterGroups();
    const items = getSkillBrowserItems();
    const isMine = state.skillModal === "mine";
    const title =
      state.skillModal === "installed"
        ? "已安装技能"
        : state.skillModal === "mine"
          ? "我发布的技能"
          : "热门技能";
    return `
      <section class="skill-browser-layer" role="dialog" aria-modal="true" aria-label="${title}">
        <header class="skill-browser-head">
          <button class="phone-icon-button ghost" data-action="close-skill-modal" type="button" aria-label="返回技能空间">${icon(
            "chevron-left",
          )}</button>
          <div>
            <h2>${title}</h2>
            <span id="skill-browser-count">${String(items.length).padStart(2, "0")} 项</span>
          </div>
          ${
            isMine
              ? `<button class="skill-browser-add" data-nav="publish-skill" type="button" aria-label="新增发布">${icon("plus")}</button>`
              : ""
          }
        </header>
        <div class="skill-browser-tools">
          <label class="skill-browser-search" for="skill-browser-search">
            ${icon("search")}
            <input
              id="skill-browser-search"
              type="search"
              value="${escapeHtml(state.skillBrowserQuery)}"
              placeholder="搜索生活技能名称或用途"
              autocomplete="off"
            />
          </label>
          ${
            isMine
              ? `
                <div class="skill-browser-mine-toolbar">
                  <button
                    class="${state.skillMultiSelect ? "is-active" : ""}"
                    data-action="toggle-skill-multiselect"
                    type="button"
                  >${icon("list-checks")}${state.skillMultiSelect ? "完成" : "多选"}</button>
                </div>
              `
              : `<div class="skill-browser-filters" role="tablist" aria-label="技能分类">
            <button
              class="${state.skillBrowserFilter === "all" ? "is-active" : ""}"
              data-skill-filter="all"
              type="button"
              role="tab"
              aria-selected="${state.skillBrowserFilter === "all"}"
            >全部</button>
            ${filterGroups
              .map((group) => {
                const hasFilter = group.options.some(
                  (option) => option.id === state.skillBrowserFilter,
                );
                const expanded = state.skillBrowserGroupOpen === group.id;
                return `
                  <div class="skill-filter-dropdown">
                    <button
                      class="skill-filter-trigger ${hasFilter ? "has-filter" : ""}"
                      data-skill-filter-group="${group.id}"
                      type="button"
                      aria-expanded="${expanded}"
                    >
                      ${group.label}
                      ${icon("chevron-down")}
                    </button>
                    <div
                      class="skill-filter-menu"
                      data-filter-menu="${group.id}"
                      ${expanded ? "" : "hidden"}
                    >
                      ${group.options
                        .map(
                          (option) => `
                            <button
                              class="${option.id === state.skillBrowserFilter ? "is-active" : ""}"
                              data-skill-filter="${option.id}"
                              type="button"
                              role="tab"
                              aria-selected="${option.id === state.skillBrowserFilter}"
                            >${option.label}</button>
                          `,
                        )
                        .join("")}
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>`
          }
        </div>
        <div class="skill-browser-body">
          <div id="skill-browser-results" class="skill-hub-list skill-browser-list">
            ${
              isMine
                ? renderPublishedSkillCards(items)
                : renderSkillHubCards(items, getSkillBrowserSourceMode())
            }
          </div>
          <div id="skill-browser-empty" class="skill-browser-empty" ${items.length ? "hidden" : ""}>
            ${icon("search-x")}
            <strong>没有匹配技能</strong>
            <span>换个关键词或分类试试。</span>
          </div>
        </div>
        ${
          isMine && state.skillMultiSelect
            ? `
              <footer class="skill-delete-bar published-skill-delete-bar">
                <span id="published-skill-delete-count">已选择 ${state.publishedSkillSelection.size} 项</span>
                <button data-action="delete-selected-published" type="button" ${state.publishedSkillSelection.size ? "" : "disabled"}>取消发布所选</button>
              </footer>
            `
            : ""
        }
      </section>
    `;
  }

  function renderSkillModalOverlay() {
    if (state.skillDetail) return renderSkillDetailOverlay();
    if (state.skillModal === "conflict-settings") {
      return renderSkillConflictSettings();
    }
    if (["hot-all", "installed", "mine"].includes(state.skillModal)) {
      return renderSkillBrowserOverlay();
    }
    const isMarket = state.skillModal === "market";
    const isMine = state.skillModal === "mine";
    const items = isMarket
      ? pages["plugin-market"]?.marketItems || []
      : isMine
        ? getMySkillItems()
      : pages.plugins?.pluginList || [];
    return `
      <div class="skill-modal-layer">
        <button class="skill-modal-scrim" data-action="close-skill-modal" type="button" aria-label="关闭技能悬浮窗"></button>
        <section class="skill-modal" role="dialog" aria-modal="true" aria-label="${isMarket ? "技能市场" : isMine ? "我发布的技能" : "已安装技能"}">
          <header class="skill-modal-head">
            <div>
              <p class="eyebrow">技能列表</p>
              <h2>${isMarket ? "技能市场" : isMine ? "我发布的技能" : "已安装技能"}</h2>
              <span>${items.length} 项技能</span>
            </div>
            <button class="skill-modal-close" data-action="close-skill-modal" type="button" aria-label="关闭">${icon(
              "x",
            )}</button>
          </header>
          <div class="skill-modal-body">
            <div class="skill-hub-list">
              ${renderSkillHubCards(items, isMarket ? "market" : isMine ? "mine" : "installed")}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderHistoryOverlay() {
    const sessions = getMobileSessions();
    return `
      <button class="history-scrim" data-action="close-history" type="button" aria-label="关闭历史记录"></button>
      <section class="history-screen" role="dialog" aria-modal="true" aria-label="历史记录">
        <header class="history-head">
          <div class="history-heading">
            <h2>历史记录</h2>
          </div>
          <button class="phone-icon-button ghost" data-action="new-chat" type="button" aria-label="新增对话">${icon(
            "square-pen"
          )}</button>
        </header>
        <label class="history-search" for="history-search-input">
          ${icon("search")}
          <input
            id="history-search-input"
            type="search"
            value="${escapeHtml(state.historyQuery)}"
            placeholder="搜索历史对话"
            autocomplete="off"
          />
        </label>
        <div class="history-views" role="tablist" aria-label="历史记录类型">
          <button
            class="history-view ${state.historyView === "chat" ? "is-active" : ""}"
            data-history-view="chat"
            type="button"
            role="tab"
            aria-selected="${state.historyView === "chat"}"
            tabindex="${state.historyView === "chat" ? "0" : "-1"}"
          >聊天</button>
          <button
            class="history-view ${state.historyView === "work" ? "is-active" : ""}"
            data-history-view="work"
            type="button"
            role="tab"
            aria-selected="${state.historyView === "work"}"
            tabindex="${state.historyView === "work" ? "0" : "-1"}"
          >工作</button>
        </div>
        <div class="history-list">
          <div class="history-group-label">最近对话</div>
          ${sessions
            .map(
              (session) => `
                <button
                  class="history-session ${session.active ? "is-active" : ""}"
                  data-action="select-session"
                  data-session-id="${escapeHtml(session.id)}"
                  data-history-name="${escapeHtml(session.name)}"
                  data-history-kind="${session.kind}"
                  type="button"
                >
                  <span class="history-session-icon">${icon(session.icon)}</span>
                  <span class="history-session-main">
                    <strong>${escapeHtml(session.name)}</strong>
                    <small>${session.kind === "chat" ? "聊天会话" : "工作会话"}</small>
                  </span>
                  <time>${escapeHtml(session.time)}</time>
                </button>
              `,
            )
            .join("")}
        </div>
        <p class="history-empty" id="history-empty" hidden>没有匹配的会话</p>
        <div class="history-footer">
          <button
            class="history-settings-trigger"
            data-nav="settings"
            type="button"
            aria-label="设置"
          >
            <svg class="history-settings-svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M956.6 450.7c-3.5-19.3-22.2-38.9-41.8-43.1l-14.6-3.3c-34.3-10.2-64.6-32.6-84-65.5-19.3-33.1-23.9-70.8-15.5-105.2l4.6-13.5c5.8-18.7-1.7-44.5-17-57.4 0 0-13.7-11.4-52.3-33.4-38.7-21.9-55.3-28-55.3-28-18.8-6.8-45.1-0.3-58.9 14.1L611.7 126c-25.9 24.3-60.9 39-99.6 39-38.7 0-73.9-14.9-99.9-39.3l-9.8-10.4c-13.5-14.4-40-20.7-58.9-14.1 0 0-16.8 6.1-55.5 28-38.7 22.2-52.2 33.6-52.2 33.6-15.3 12.6-22.9 38.3-17 57.2l4.2 13.7c8.2 34.5 3.9 72-15.5 105.1-19.4 33.1-50.1 55.7-84.5 65.7l-14 3.1c-19.3 4.4-38.3 23.8-41.8 43.1 0 0-3.2 17.3-3.2 61.3s3.2 61.3 3.2 61.3c3.5 19.4 22.2 38.9 41.8 43.1l13.7 3.1c34.5 10 65.3 32.6 84.6 65.9 19.3 33.1 23.9 70.8 15.5 105.2l-4 13.4c-5.8 18.7 1.8 44.5 17 57.4 0 0 13.7 11.4 52.3 33.4 38.6 22 55.3 28 55.3 28 18.8 6.8 45.1 0.3 58.9-14.1l9.7-10.2c26.1-24.4 61.3-39.4 100.1-39.4s74.1 15.1 100.1 39.5l9.7 10.2c13.5 14.4 40 20.7 58.9 14.1 0 0 16.8-6.1 55.5-28 38.7-22 52.2-33.4 52.2-33.4 15.3-12.7 22.9-38.5 17-57.4l-4.2-13.9c-8.2-34.3-3.9-71.8 15.5-104.7 19.3-33.1 50.3-55.8 84.6-65.9l13.7-3.1c19.3-4.4 38.2-23.8 41.8-43.1 0 0 3.2-17.3 3.2-61.3-0.3-44.1-3.5-61.4-3.5-61.4zM512.2 688.3c-98.6 0-178.6-78.8-178.6-176.3 0-97.3 79.9-176.1 178.6-176.1 98.6 0 178.7 78.9 178.7 176.3-0.3 97.3-80.2 176.1-178.7 176.1z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </section>
    `;
  }

  function featureSectionRender(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          ${(page.featureSections || [])
            .map((section) => {
              const items = section.items.filter(
                (item) => !item.nav || isPageVisible(item.nav),
              );
              if (!items.length) return "";
              return `
                <section class="phone-section">
                  <div class="phone-section-heading"><span>${escapeHtml(section.title)}</span></div>
                  <div class="feature-grid">
                    ${items
                      .map(
                        (item) => `
                          <button class="feature-tile" data-nav="${escapeHtml(item.nav || "empty-state")}" type="button">
                            <span class="feature-tile-icon">${icon(item.icon || "circle")}</span>
                            <strong>${escapeHtml(item.title)}</strong>
                            <span>${escapeHtml(item.summary || "")}</span>
                          </button>
                        `
                      )
                      .join("")}
                  </div>
                </section>
              `;
            })
            .join("")}
          <div class="phone-body">
            <button class="phone-primary-button" data-nav="settings" type="button">${icon(
              "settings-2"
            )}全部设置</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderFiles(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-toast="已新建文件夹" type="button" aria-label="新建">${icon(
            "folder-plus"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div class="file-path">${icon("folder-open")}<span>${escapeHtml(page.filesPath || "~/workspace")}</span></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.files || [])
              .map(
                (file) => `
                  <button class="phone-row file-row" data-nav="${escapeHtml(
                    file.nav || "file-preview"
                  )}" type="button">
                    <span class="row-glyph">${icon(fileIcon(file.type))}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(file.name)}</span>
                      <span class="phone-row-description">${escapeHtml(file.type)}</span>
                    </span>
                    <span class="phone-row-value file-size">${escapeHtml(file.meta || "")}${icon(
                      file.type === "folder" ? "chevron-right" : "ellipsis",
                      "row-chevron"
                    )}</span>
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderActions(page.actions, page.id)}
          <div class="phone-section"></div>
        </div>
      </div>
    `;
  }

  function fileIcon(type) {
    const map = {
      folder: "folder",
      markdown: "file-text",
      html: "code-xml",
      code: "braces",
      package: "package",
      image: "image",
      link: "link-2",
      pdf: "file-type-2",
      video: "film",
    };
    return map[type] || "file";
  }

  function renderTerminal(page) {
    return `
      <div class="phone-page terminal-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-toast="终端已清屏" type="button" aria-label="更多">${icon(
            "ellipsis"
          )}</button>`,
        })}
        <div class="terminal-body" id="terminal-body">
          ${(page.terminalLines || [])
            .map(
              (line) =>
                `<div class="terminal-line ${
                  line.type === "prompt" ? "terminal-prompt" : "terminal-out"
                }">${
                  line.type === "prompt"
                    ? `<span class="terminal-path">${escapeHtml(page.terminalPath || "~")}</span> $ ${escapeHtml(
                        line.text
                      )}`
                    : escapeHtml(line.text)
                }</div>`
            )
            .join("")}
        </div>
        <div class="terminal-keys">
          <button data-toast="Esc" type="button">esc</button>
          <button data-toast="Tab" type="button">tab</button>
          <button data-toast="Ctrl" type="button">ctrl</button>
          <button data-toast="↑" type="button">↑</button>
          <button data-toast="↓" type="button">↓</button>
          <button data-toast="←" type="button">←</button>
          <button data-toast="→" type="button">→</button>
        </div>
        <div class="terminal-input-row">
          <span class="terminal-prompt">$</span>
          <input id="terminal-input" autocomplete="off" spellcheck="false" placeholder="输入命令" />
        </div>
      </div>
    `;
  }

  function renderProviders(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-nav="provider-form" type="button" aria-label="添加提供方">${icon(
            "plus"
          )}</button>`,
        })}
        <div class="phone-scroll">
          ${
            page.id === "provider-detail"
              ? `<div class="provider-hero">
                  <span class="provider-mark">${icon("sparkles")}</span>
                  <div>
                    <strong>AI 平台</strong>
                    <span>官方 API · 最近延迟 246ms</span>
                  </div>
                  ${renderBadge("已连接", "success")}
                </div>`
              : ""
          }
          ${renderMetrics(page.metrics)}
          <div class="phone-list" style="margin:0 14px 16px">
            ${(page.providers || [])
              .map(
                (provider) => `
                  <button class="model-option ${provider.active ? "is-selected" : ""}" data-nav="${escapeHtml(
                    provider.nav || "provider-detail"
                  )}" type="button">
                    <span class="row-glyph">${icon(provider.icon || "sparkles")}</span>
                    <span>
                      <strong>${escapeHtml(provider.name)}</strong>
                      <span>${escapeHtml(provider.description || "")}</span>
                    </span>
                    ${provider.active ? icon("check-circle-2", "row-chevron") : renderBadge(provider.badge || "")}
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderSections(page, page.sections)}
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderRemote(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-nav="ssh-form" type="button" aria-label="添加主机">${icon(
            "plus"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          ${(page.hosts || [])
            .map(
              (host) => `
                <button class="host-card ${host.active ? "is-active" : ""} ${
                  host.tone === "idle" ? "is-offline" : ""
                }" data-nav="${escapeHtml(host.nav || "network-details")}" type="button">
                  <span class="host-card-icon">${icon(host.icon || "server")}</span>
                  <span>
                    <strong>${escapeHtml(host.name)}</strong>
                    <span>${escapeHtml(host.description)}</span>
                  </span>
                  ${host.active ? renderBadge(host.badge || "已连接", "success") : renderBadge(host.badge || "", host.tone)}
                </button>
              `
            )
            .join("")}
          ${renderSections(page, page.sections)}
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderEngine(page) {
    const statusTone = page.status?.tone || "success";
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-nav="diagnostics" type="button" aria-label="诊断">${icon(
            "file-clock"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div class="engine-ring" style="${
            statusTone === "error" ? "background:conic-gradient(var(--danger) 0deg 175deg,var(--phone-line) 175deg 360deg)" : ""
          }">
            <div class="engine-ring-content">
              ${icon("cpu")}
              <strong>${statusTone === "error" ? "!" : "98%"}</strong>
              <span>${statusTone === "error" ? "需要恢复" : "运行健康"}</span>
            </div>
          </div>
          ${renderStatus(page.status)}
          ${renderMetrics(page.metrics)}
          ${renderSections(page, page.sections)}
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderPlugins(page) {
    const isMarket = page.kind === "market";
    const items = isMarket ? page.marketItems || [] : page.pluginList || [];
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-nav="${
            isMarket ? "plugins" : "plugin-market"
          }" type="button" aria-label="切换">${icon(isMarket ? "package-check" : "store")}</button>`,
        })}
        <div class="phone-scroll">
          <div class="plugin-hero">
            <span class="plugin-hero-icon">${icon(isMarket ? "store" : page.icon || "puzzle")}</span>
            <div>
              <strong>${isMarket ? "技能市场" : "已安装技能"}</strong>
              <span>${isMarket ? "已审查版本与来源，安装前仍会展示风险" : "5 个技能 · 4 个已启用"}</span>
            </div>
            <button class="phone-icon-button ghost" data-toast="正在刷新技能状态" type="button">${icon("refresh-cw")}</button>
          </div>
          <div class="phone-list" style="margin:0 14px 16px">
            ${items
              .map(
                (item) => `
                  <button class="plugin-card" data-nav="${escapeHtml(item.nav || "plugin-detail")}" type="button">
                    <span class="plugin-card-glyph">${icon(item.icon || "puzzle")}</span>
                    <span>
                      <strong>${escapeHtml(item.name)}</strong>
                      <span>${escapeHtml(item.description || "")}</span>
                    </span>
                    <small>${escapeHtml(item.value || item.badge || "")}</small>
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderSections(page, page.sections)}
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderBots(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-nav="new-bot" type="button" aria-label="新建 Bot">${icon(
            "plus"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div class="community-banner">
            <h2>和你的 Bot 一起工作</h2>
            <p>单聊、群聊和频道共享同一套模型、工具与记忆。</p>
          </div>
          <div class="phone-list" style="margin:0 14px 16px">
            ${(page.bots || [])
              .map(
                (bot) => `
                  <button class="bot-card" data-nav="${escapeHtml(bot.nav || "bot-chat")}" type="button">
                    <span class="bot-avatar">${icon(bot.icon || "bot")}</span>
                    <span>
                      <strong>${escapeHtml(bot.name)}</strong>
                      <p>${escapeHtml(bot.description || "")}</p>
                    </span>
                    ${renderBadge(bot.badge || "", bot.tone)}
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderRooms(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-nav="new-room" type="button" aria-label="新建群聊">${icon(
            "plus"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.rooms || [])
              .map(
                (room) => `
                  <button class="phone-row" data-nav="${escapeHtml(room.nav || "room-chat")}" type="button">
                    <span class="row-glyph">${icon(room.icon || "users-round")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(room.title)}</span>
                      <span class="phone-row-description">${escapeHtml(room.description)}</span>
                    </span>
                    ${renderBadge(room.badge || "0")}${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderForum(page) {
    if (page.kind === "forum-topic") {
      const topic = page.topic || {};
      return `
        <div class="phone-page">
          ${statusBar()}
          ${phonePageHeader(page, {
            action: `<button class="phone-icon-button ghost" data-toast="已收藏主题" type="button">${icon(
              "bookmark"
            )}</button>`,
          })}
          <div class="phone-scroll">
            <div class="phone-profile-card" style="margin:0 14px 12px">
              <div style="display:flex;gap:9px;align-items:center;margin-bottom:10px">
                <span class="forum-avatar">${escapeHtml(topic.avatar || "F")}</span>
                <div>
                  <strong style="font-size:11px">${escapeHtml(topic.author || "论坛用户")}</strong>
                  <div style="color:var(--phone-muted);font-size:8px">${escapeHtml(topic.time || "")}</div>
                </div>
              </div>
              <h2 style="margin:0;font-size:18px">${escapeHtml(topic.title || page.title)}</h2>
              <p style="margin:7px 0 0;color:var(--phone-muted);font-size:10px;line-height:1.65">${escapeHtml(
                topic.body || ""
              )}</p>
              <div class="message-actions" style="margin-top:8px">
                <button class="message-action" data-toast="已点赞" type="button">${icon("heart")}</button>
                <button class="message-action" data-toast="已收藏" type="button">${icon("bookmark")}</button>
                <button class="message-action" data-toast="已复制链接" type="button">${icon("link")}</button>
              </div>
            </div>
            <div class="phone-section-heading" style="padding:0 16px">回复 · ${escapeHtml(
              topic.replies || 0
            )}</div>
            ${(page.posts || [])
              .map(
                (post) => `
                  <div class="forum-topic" style="margin:0 14px 8px;border:1px solid var(--phone-line);border-radius:9px">
                    <span class="forum-avatar">${escapeHtml(post.avatar)}</span>
                    <div>
                      <strong>${escapeHtml(post.author)}</strong>
                      <p style="-webkit-line-clamp:4">${escapeHtml(post.body)}</p>
                      <div class="forum-topic-meta"><span>${escapeHtml(post.time)}</span><span>回复</span><span>点赞</span></div>
                    </div>
                  </div>
                `
              )
              .join("")}
            <div class="phone-body">
              <button class="phone-primary-button" data-nav="forum-compose" type="button">${icon(
                "message-square-plus"
              )}参与讨论</button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-nav="forum-compose" type="button" aria-label="发帖">${icon(
            "square-pen"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div class="community-banner">
            <h2>千变 论坛</h2>
            <p>教程、技能、使用反馈与真实案例。</p>
          </div>
          <div style="display:flex;gap:7px;padding:0 14px 12px;overflow:auto">
            ${["全部", "教程", "技能", "手机操控", "使用反馈"]
              .map(
                (tag, index) =>
                  `<button class="phone-secondary-button" style="min-height:29px;padding:0 10px;white-space:nowrap;${
                    index === 0 ? "background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)" : ""
                  }" data-toast="已筛选：${tag}" type="button">${tag}</button>`
              )
              .join("")}
          </div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.topics || [])
              .map(
                (topic) => `
                  <button class="forum-topic" data-nav="${escapeHtml(topic.nav || "forum-topic")}" type="button">
                    <span class="forum-avatar">${escapeHtml(topic.avatar || "F")}</span>
                    <span>
                      <strong>${escapeHtml(topic.title)}</strong>
                      <p>${escapeHtml(topic.excerpt)}</p>
                      <span class="forum-topic-meta"><span>${escapeHtml(topic.replies)} 回复</span><span>${escapeHtml(
                        topic.time
                      )}</span></span>
                    </span>
                    ${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="phone-body">
            <button class="phone-secondary-button" data-nav="forum-notifications" type="button" style="width:100%">${icon(
              "bell"
            )}查看论坛通知</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderNotifications(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-toast="已全部标为已读" type="button" aria-label="全部已读">${icon(
            "check-check"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.notifications || [])
              .map(
                (item) => `
                  <button class="phone-row" data-toast="已打开通知" type="button">
                    <span class="row-glyph">${icon(item.icon || "bell")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(item.title)}</span>
                      <span class="phone-row-description">${escapeHtml(item.description)}</span>
                    </span>
                    <span class="phone-row-value">${escapeHtml(item.time)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderCommunity(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="community-banner">
            <h2>一起把 千变 带得更远</h2>
              <p>论坛、QQ 群和微信群，都能找到同好与帮助。</p>
          </div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.communityItems || [])
              .map(
                (item) => `
                  <button class="phone-row" ${item.nav ? `data-nav="${item.nav}"` : `data-toast="${escapeHtml(
                    item.title
                  )} · 外部入口"`} type="button">
                    <span class="row-glyph">${icon(item.icon || "users")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(item.title)}</span>
                      <span class="phone-row-description">${escapeHtml(item.description)}</span>
                    </span>
                    ${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderCompanion(page) {
    const petSrc = "assets/brand/qianbian-mark.png";
    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="phone-scroll">
          <div class="companion-stage">
            <div class="companion-sky"></div>
            <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between">
              <button class="phone-icon-button ghost" data-nav="home" type="button">${icon("chevron-left")}</button>
              <span class="badge success">在线</span>
              <button class="phone-icon-button ghost" data-nav="companion-persona" type="button">${icon(
                "user-round-cog"
              )}</button>
            </div>
            <img class="companion-stage-pet" src="${petSrc}" alt="" />
            <div class="companion-bubble">
              船长，页面目录已经整理好了。要不要我陪你逐页走一遍？我会记下需要调整的地方。
            </div>
            <div class="companion-actions">
              <button class="companion-action" data-nav="companion-memory" type="button">${icon(
                "brain"
              )}记忆</button>
              <button class="companion-action" data-nav="companion-voice" type="button">${icon(
                "audio-lines"
              )}声音</button>
              <button class="companion-action" data-nav="companion-persona" type="button">${icon(
                "heart"
              )}性格</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMemory(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-toast="已新建记忆" type="button">${icon(
            "plus"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.memories || [])
              .map(
                (memory) => `
                  <div class="phone-row">
                    <span class="row-glyph">${icon(memory.icon || "brain")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(memory.title)}</span>
                      <span class="phone-row-description">${escapeHtml(memory.detail)}</span>
                    </span>
                    <span class="phone-row-value">${escapeHtml(memory.time)}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderPets(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          ${
            page.pets?.length
              ? `<div class="phone-section">
                  <div class="phone-list" style="margin:0 14px">
                    ${page.pets
                      .map(
                        (pet) => `
                          <button class="phone-row" data-nav="${escapeHtml(pet.nav || "pet-picker")}" type="button">
                            <span class="row-glyph" style="width:42px;height:42px;border-radius:12px">${icon(
                              pet.icon || "paw-print"
                            )}</span>
                            <span class="phone-row-main">
                              <span class="phone-row-label">${escapeHtml(pet.title)}</span>
                              <span class="phone-row-description">${escapeHtml(pet.description)}</span>
                            </span>
                            ${pet.active ? renderBadge("当前", "success") : icon("chevron-right", "row-chevron")}
                          </button>
                        `,
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
          ${renderSections(page, page.sections)}
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderTavern(page) {
    if (page.kind === "tavern-chat") {
      return `
        <div class="phone-page">
          ${statusBar()}
          ${phonePageHeader(page, {
            action: `<button class="phone-icon-button ghost" data-toast="已打开故事状态" type="button">${icon(
              "book-open"
            )}</button>`,
          })}
          <div class="phone-scroll" style="background:var(--phone-bg)">
            <div class="tavern-body">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                <span class="forum-avatar" style="width:42px;height:42px">林</span>
                <div>
                  <strong style="font-size:12px">林雾</strong>
                  <div style="color:var(--phone-muted);font-size:8px">灯塔看守人 · 好感 12</div>
                </div>
                <span class="badge" style="margin-left:auto">场景中</span>
              </div>
              <div class="tavern-story">
                灯塔的灯芯在玻璃罩里轻轻颤了一下。林雾没有回头，只把手中的铜钥匙放回桌面。
                <br /><br />
                “今晚的雾，比往常来得早。”<br />
                她的声音很轻，像怕惊动窗外那片正在靠近的白。
              </div>
              <div class="tavern-choices">
                <button data-toast="选择：追问海面异象" type="button">追问她海面究竟出现了什么</button>
                <button data-toast="选择：走到窗边" type="button">先走到窗边，观察那片雾</button>
                <button data-toast="选择：出示信件" type="button">把那封没有署名的信放到桌上</button>
              </div>
              <div class="phone-list" style="margin-top:12px">
                <button class="phone-row" data-nav="tavern-storybook" type="button">
                  <span class="row-glyph">${icon("book-heart")}</span>
                  <span class="phone-row-main"><span class="phone-row-label">故事书</span><span class="phone-row-description">第二章：失约的信号</span></span>
                  ${icon("chevron-right", "row-chevron")}
                </button>
                <button class="phone-row" data-nav="tavern-lorebooks" type="button">
                  <span class="row-glyph">${icon("book-marked")}</span>
                  <span class="phone-row-main"><span class="phone-row-label">世界书</span><span class="phone-row-description">42 条设定已加载</span></span>
                  ${icon("chevron-right", "row-chevron")}
                </button>
              </div>
            </div>
          </div>
          <div style="padding:10px 12px 23px;background:var(--glass-strong);border-top:1px solid var(--phone-line)">
            <div class="phone-composer">
              <button class="composer-plus" data-toast="已打开故事输入选项" type="button">${icon("list-ordered")}</button>
              <textarea class="composer-input" rows="1" placeholder="你想说什么？"></textarea>
              <button class="composer-send" data-toast="剧情已推进" type="button">${icon("arrow-up")}</button>
            </div>
          </div>
        </div>
      `;
    }

    if (page.kind === "tavern-storybook") {
      return `
        <div class="phone-page">
          ${statusBar()}
          ${phonePageHeader(page)}
          <div class="phone-scroll">
            <section class="phone-section">
              <div class="phone-list" style="margin:0 14px">
                ${(page.chapters || [])
                  .map(
                    (chapter) => `
                      <button class="phone-row" data-nav="tavern-chat" type="button">
                        <span class="row-glyph">${icon(chapter.icon || "book-open")}</span>
                        <span class="phone-row-main">
                          <span class="phone-row-label">${escapeHtml(chapter.title)}</span>
                          <span class="phone-row-description">${escapeHtml(chapter.description)}</span>
                        </span>
                        ${renderBadge(chapter.badge || "", chapter.badge === "进行中" ? "warning" : chapter.badge === "已完成" ? "success" : "")}
                        ${icon("chevron-right", "row-chevron")}
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </section>
          </div>
        </div>
      `;
    }

    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="phone-scroll">
          <div class="tavern-cover">
            <div style="position:absolute;top:12px;left:12px;right:12px;z-index:2;display:flex;justify-content:space-between">
              <button class="phone-icon-button ghost" data-nav="home" type="button" style="color:#fff">${icon(
                "chevron-left"
              )}</button>
              <button class="phone-icon-button ghost" data-nav="tavern-settings" type="button" style="color:#fff">${icon(
                "settings-2"
              )}</button>
            </div>
            <div class="tavern-cover-copy">
              <p class="eyebrow">INTERACTIVE STORY</p>
              <h1>${escapeHtml(page.tavernTitle || page.title)}</h1>
              <p>${escapeHtml(page.tavernSubtitle || page.summary)}</p>
            </div>
          </div>
          <div class="tavern-body">
            <button class="phone-primary-button" data-nav="tavern-chat" type="button">${icon(
              "play"
            )}继续故事</button>
            <div class="phone-list" style="margin-top:14px">
              ${[
                ["角色卡", "林雾与故事中的其他角色", "user-round", "tavern-character"],
                ["故事书", "章节、分支与回放", "book-heart", "tavern-storybook"],
                ["世界书", "雾港、灯塔与潮汐规则", "book-marked", "tavern-lorebooks"],
                ["扮演身份", "你在故事中的身份", "venetian-mask", "tavern-personas"],
                ["酒馆预设", "叙事风格与模型参数", "sliders-horizontal", "tavern-presets"],
                ["正则与替换", "清理输出与变量替换", "regex", "tavern-regex"],
                ["故事草稿", "编辑、测试与分支管理", "notebook-pen", "tavern-drafts"],
              ]
                .map(
                  ([title, description, iconName, nav]) => `
                    <button class="phone-row" data-nav="${nav}" type="button">
                      <span class="row-glyph">${icon(iconName)}</span>
                      <span class="phone-row-main">
                        <span class="phone-row-label">${escapeHtml(title)}</span>
                        <span class="phone-row-description">${escapeHtml(description)}</span>
                      </span>
                      ${icon("chevron-right", "row-chevron")}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWorkshop(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button primary" data-nav="workshop-publish" type="button">${icon(
            "upload"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div class="community-banner">
            <h2>创意工坊</h2>
            <p>发现社区制作的主题、宠物包、技能和启动画面。</p>
          </div>
          <div class="workshop-grid">
            ${(page.workshopItems || [])
              .map(
                (item) => `
                  <button class="workshop-card" data-toast="${escapeHtml(item.title)} · 已打开详情" type="button">
                    <span class="workshop-thumb">${icon(item.icon || "blocks")}</span>
                    <span class="workshop-card-copy">
                      <strong>${escapeHtml(item.title)}</strong>
                      <span>${escapeHtml(item.description)}</span>
                      <span class="badge" style="margin-top:6px">${escapeHtml(item.badge || "作品")}</span>
                    </span>
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderAllFeatures(page) {
    return featureSectionRender(page);
  }

  function renderSessionWorkbench(page) {
    const workbench = page.workbench || {};
    const modes = workbench.modes || [];
    const activeMode =
      modes.find((mode) => mode.id === state.workbenchMode) ||
      modes.find((mode) => mode.id === "web") ||
      modes[0] ||
      {};
    const usage = workbench.usage || {};
    return `
      <div class="phone-page session-workbench-page">
        ${statusBar()}
        ${phonePageHeader(page, { hideSubtitle: true })}
        <div class="phone-scroll">
          <div class="workbench-body">
            <section class="workbench-session">
              <div class="workbench-session-head">
                <div>
                  <h2>${escapeHtml(workbench.sessionTitle || page.title)}</h2>
                  <p>${escapeHtml(workbench.sessionMeta || "")}</p>
                </div>
                <span class="workbench-status">${escapeHtml(workbench.status || "运行中")}</span>
              </div>
              <div class="workbench-metrics">
                ${(workbench.metrics || [])
                  .map(
                    (metric) => `
                      <div class="workbench-metric">
                        <strong>${escapeHtml(metric.value)}</strong>
                        <span>${escapeHtml(metric.label)}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </section>

            <section class="workbench-section">
              <div class="workbench-section-heading">
                <h2>执行轨迹</h2>
                <span>${(workbench.trajectory || []).length} 个步骤</span>
              </div>
              <div class="workbench-timeline">
                ${(workbench.trajectory || [])
                  .map(
                    (step, index) => `
                      <div class="workbench-step ${step.state === "进行中" ? "is-active" : ""}">
                        <span class="workbench-step-index">${String(index + 1).padStart(2, "0")}</span>
                        <span class="workbench-step-icon">${icon(step.icon || "circle")}</span>
                        <div>
                          <strong>${escapeHtml(step.title)}</strong>
                          <p>${escapeHtml(step.detail)}</p>
                        </div>
                        <span class="workbench-step-time">${escapeHtml(step.time)}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </section>

            <section class="workbench-section">
              <div class="workbench-section-heading">
                <h2>上下文用量</h2>
                <span>${escapeHtml(`${usage.used || "0"} / ${usage.window || "0"}`)}</span>
              </div>
              <div class="workbench-usage-summary">
                <strong>${escapeHtml(`${usage.percent || 0}%`)}</strong>
                <span>窗口占用</span>
              </div>
              <div class="workbench-usage-track" role="progressbar" aria-label="上下文窗口占用" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Number(usage.percent) || 0}">
                <span style="width:${Number(usage.percent) || 0}%"></span>
              </div>
              <div class="workbench-usage-parts">
                ${(usage.parts || [])
                  .map(
                    (part) => `
                      <div>
                        <span>${icon(part.icon || "circle")}${escapeHtml(part.label)}</span>
                        <strong>${escapeHtml(part.value)}</strong>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </section>

            <section class="workbench-section">
              <div class="workbench-section-heading">
                <h2>运行方式</h2>
                <span>${modes.length} 种方式</span>
              </div>
              <div class="workbench-mode-switch" role="tablist" aria-label="运行方式">
                ${modes
                  .map(
                    (mode) => `
                      <button
                        class="${mode.id === activeMode.id ? "is-active" : ""}"
                        data-workbench-mode="${escapeHtml(mode.id)}"
                        type="button"
                        role="tab"
                        aria-selected="${mode.id === activeMode.id}"
                      >${escapeHtml(mode.label)}</button>
                    `,
                  )
                  .join("")}
              </div>
              <div class="workbench-mode-detail">
                <span class="workbench-mode-icon">${icon(activeMode.id === "local" ? "globe-lock" : activeMode.id === "web" ? "globe" : "smartphone")}</span>
                <div>
                  <strong>${escapeHtml(activeMode.title || "")}</strong>
                  <p>${escapeHtml(activeMode.detail || "")}</p>
                </div>
                <code>${escapeHtml(activeMode.endpoint || "")}</code>
              </div>
            </section>

            <section class="workbench-section">
              <div class="workbench-section-heading">
                <h2>快捷入口</h2>
                <span>${(workbench.actions || []).length} 个入口</span>
              </div>
              <div class="workbench-actions">
                ${(workbench.actions || [])
                  .map(
                    (action) => `
                      <button class="workbench-action" data-toast="${escapeHtml(action.label)} · 已选择" type="button">
                        <span>${icon(action.icon || "circle")}</span>
                        <strong>${escapeHtml(action.label)}</strong>
                        <small>${escapeHtml(action.detail || "")}</small>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  function renderSessionDetail(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="phone-body">
            ${renderMetrics(page.metrics)}
            ${renderTabs(page)}
          </div>
          ${renderSections(page, page.sections)}
        </div>
      </div>
    `;
  }

  function renderTimeline(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div style="margin:0 18px;position:relative">
            <div style="position:absolute;top:5px;bottom:12px;left:15px;width:1px;background:var(--phone-line)"></div>
            ${(page.timeline || [])
              .map(
                (item) => `
                  <div style="display:grid;grid-template-columns:31px minmax(0,1fr);gap:10px;margin-bottom:15px;position:relative">
                    <span class="row-glyph" style="position:relative;z-index:1">${icon(item.icon || "circle")}</span>
                    <div class="phone-list" style="padding:11px">
                      <strong style="font-size:11px">${escapeHtml(item.title)}</strong>
                      <p style="margin:4px 0 0;color:var(--phone-muted);font-size:9px;line-height:1.55">${escapeHtml(
                        item.detail
                      )}</p>
                      <div style="margin-top:6px;color:var(--phone-muted);font-family:'JetBrains Mono',monospace;font-size:8px">${escapeHtml(
                        item.time
                      )}</div>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderDiagnostics(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.checks || [])
              .map(
                (check) => `
                  <div class="phone-row">
                    <span class="row-glyph">${icon(
                      check.status === "正常" || check.status === "通过"
                        ? "circle-check"
                        : check.status === "关闭"
                          ? "circle-minus"
                          : "circle-alert"
                    )}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(check.title)}</span>
                      <span class="phone-row-description">${escapeHtml(check.description)}</span>
                    </span>
                    ${renderBadge(
                      check.status,
                      check.status === "正常" || check.status === "通过" ? "success" : "warning"
                    )}
                  </div>
                `
              )
              .join("")}
          </div>
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderAccess(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.accessItems || [])
              .map(
                (item) => `
                  <button class="phone-row" data-action="access-${escapeHtml(item.title)}" type="button">
                    <span class="row-glyph">${icon(item.icon || "shield")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(item.title)}</span>
                      <span class="phone-row-description">${escapeHtml(item.description)}</span>
                    </span>
                    ${renderBadge(item.status, item.tone || "")}${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="phone-body">
            <button class="phone-secondary-button" data-nav="access-pick" type="button" style="width:100%">${icon(
              "list-checks"
            )}按功能开启</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderJobs(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${(page.jobs || [])
              .map(
                (job) => `
                  <button class="phone-row" data-nav="${escapeHtml(job.nav || "job-output")}" type="button">
                    <span class="row-glyph">${icon(
                      job.tone === "running" ? "loader-circle" : job.tone === "success" ? "circle-check" : "clock"
                    )}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(job.title)}</span>
                      <span class="phone-row-description">${escapeHtml(job.description)}</span>
                    </span>
                    ${renderBadge(job.status, job.tone === "success" ? "success" : job.tone === "running" ? "warning" : "")}
                    ${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderFilePreview(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-sheet="share" type="button">${icon("share-2")}</button>`,
        })}
        <div class="phone-scroll">
          <div class="file-path">${icon("file-text")}<span>${escapeHtml(page.fileName || page.title)}</span></div>
          <div class="phone-profile-card" style="margin:0 14px;font-family:'JetBrains Mono',monospace;font-size:9px;line-height:1.75;white-space:pre-wrap">${escapeHtml(
            page.fileContent || ""
          )}</div>
        </div>
      </div>
    `;
  }

  function renderArtifactPreview(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-toast="已在浏览器打开" type="button">${icon(
            "external-link"
          )}</button>`,
        })}
        <div class="phone-scroll">
          <div class="phone-profile-card" style="margin:0 14px 14px;text-align:center;padding:22px">
            <img src="assets/brand/qianbian-tile.png" alt="千变" style="width:56px;height:56px;border-radius:16px;object-fit:cover;margin:0 auto 13px" />
            <h2 style="margin:0;font-size:18px">${escapeHtml(page.artifactTitle || page.title)}</h2>
            <p style="margin:6px 0 0;color:var(--phone-muted);font-size:10px">${escapeHtml(
              page.artifactSubtitle || ""
            )}</p>
            <button class="phone-primary-button" data-nav="session-workbench" type="button" style="margin-top:16px">${icon(
              "panels-top-left"
            )}打开工作台</button>
          </div>
          <div class="phone-list" style="margin:0 14px">
            <button class="phone-row" data-toast="已复制预览地址" type="button">
              <span class="row-glyph">${icon("link")}</span>
              <span class="phone-row-main"><span class="phone-row-label">本地链接</span><span class="phone-row-description">index.html#/chat</span></span>
              ${icon("copy", "row-chevron")}
            </button>
            <button class="phone-row" data-nav="files" type="button">
              <span class="row-glyph">${icon("folder-open")}</span>
              <span class="phone-row-main"><span class="phone-row-label">查看源文件</span><span class="phone-row-description">4 个文件 · 本地资源</span></span>
              ${icon("chevron-right", "row-chevron")}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderImageViewer(page) {
    return `
      <div class="phone-page" style="background:#08100d;color:#f4f7f5">
        ${statusBar()}
        <header class="phone-header" style="color:#f4f7f5;background:rgba(8,16,13,.9);border-color:rgba(255,255,255,.1)">
          <button class="phone-icon-button ghost" data-action="back" type="button" style="color:#fff">${icon(
            "chevron-left"
          )}</button>
          <div class="phone-header-title"><h1>preview.png</h1><p>1440 × 900 · 2.1 MB</p></div>
          <button class="phone-icon-button ghost" data-sheet="image" type="button" style="color:#fff">${icon(
            "ellipsis"
          )}</button>
        </header>
        <div style="flex:1;display:grid;place-items:center;overflow:hidden;background:#050a08">
          <img src="${escapeHtml(page.imageSrc || "assets/feature/remote-demo.webp")}" alt="" style="width:100%;object-fit:contain" />
        </div>
        <div style="display:flex;justify-content:center;gap:24px;padding:18px;background:#08100d">
          <button class="message-action" data-toast="已保存到相册" type="button" style="color:#fff">${icon("download")}</button>
          <button class="message-action" data-sheet="share" type="button" style="color:#fff">${icon("share-2")}</button>
          <button class="message-action" data-toast="已加入附件" type="button" style="color:#fff">${icon("paperclip")}</button>
        </div>
      </div>
    `;
  }

  function renderSearch(page) {
    const results = (page.searchResults || []).filter(
      (result) => !result.nav || isPageVisible(result.nav),
    );
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="search-hero">
            <div class="search-input-large">
              ${icon("search")}
              <input id="page-search-input" type="search" placeholder="${escapeHtml(page.searchHint || "搜索")}" autocomplete="off" />
              ${icon("x", "row-chevron")}
            </div>
          </div>
          <div class="search-result-group">
            <div class="phone-section-heading"><span>最近</span><span>${String(
              results.length
            ).padStart(2, "0")} 个结果</span></div>
            ${results
              .map(
                (result) => `
                  <button class="search-result" data-nav="${escapeHtml(result.nav || "chat")}" type="button">
                    ${icon(result.icon || "search")}
                    <span style="flex:1">
                      <strong>${escapeHtml(result.title)}</strong>
                      <span>${escapeHtml(result.subtitle)}</span>
                    </span>
                    ${icon("arrow-up-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="phone-body">
            <div class="phone-notice">${icon("info")}这里只演示前端搜索体验，不会读取真实对话、文件或设置数据。</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWeb(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="web-page" style="display:flex;flex-direction:column;min-height:100%">
          <header class="phone-header">
            <button class="phone-icon-button ghost" data-action="back" type="button">${icon("chevron-left")}</button>
            <div class="phone-header-title"><h1>${escapeHtml(page.webTitle || "千变 Web")}</h1><p>${escapeHtml(
              page.webSubtitle || ""
            )}</p></div>
            <button class="phone-icon-button ghost" data-toast="已刷新网页" type="button">${icon("refresh-cw")}</button>
          </header>
          <div class="phone-scroll">
            <div class="web-content">
              <p class="eyebrow">AI AGENT</p>
              <h1>今天想做什么？</h1>
              <p>网页版与原生界面共享同一段对话，切换后接着使用。</p>
              <div class="web-thread">
                <strong>千变 界面复刻</strong>
                <p>把手机端全部可触达页面整理成 HTML 演示。</p>
                <div style="height:1px;background:rgba(28,36,33,.08);margin:10px 0"></div>
                <div style="display:flex;gap:8px;color:#71807a;font-size:9px">
                  <span>通用模型 V4</span><span>·</span><span>12.4k Tokens</span><span style="margin-left:auto">刚刚</span>
                </div>
              </div>
              <div class="phone-composer" style="margin-top:20px;background:#fff;border-color:rgba(28,36,33,.12)">
                <button class="composer-plus" data-sheet="plus" type="button">${icon("plus")}</button>
                <textarea class="composer-input" rows="1" placeholder="发消息给 千变"></textarea>
                <button class="composer-send" data-toast="网页版发送 · 前端模拟" type="button">${icon("arrow-up")}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderShare(page) {
    const shareItems = page.shareItems || [];
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="share-card">
            <div class="share-card-cover">
              <img class="brand-tile" src="assets/brand/qianbian-tile.png" alt="千变" />
              <p class="eyebrow">千变 · SHARE</p>
              <h2>${escapeHtml(page.shareTitle || "分享")}</h2>
              <p>${escapeHtml(page.shareDescription || "")}</p>
            </div>
            <div class="share-card-footer">
              <span>已隐藏密钥与私人路径</span>
              ${renderBadge("端到端加密", "success")}
            </div>
          </div>
          ${
            shareItems.length
              ? `<div class="phone-section">
                  <div class="phone-section-heading"><span>包含内容</span></div>
                  <div class="phone-list">
                    ${shareItems
                      .map(
                        (item) => `
                          <div class="phone-row">
                            <span class="row-glyph">${icon(item.icon || "check")}</span>
                            <span class="phone-row-main">
                              <span class="phone-row-label">${escapeHtml(item.title)}</span>
                              <span class="phone-row-description">${escapeHtml(item.description)}</span>
                            </span>
                            <button class="phone-toggle ${item.checked ? "is-on" : ""}" data-toggle="share::${
                              item.title
                            }" type="button" aria-label="${escapeHtml(item.title)}"><span></span></button>
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
          ${renderActions(
            page.actions || [
              { label: "复制链接", icon: "link" },
              { label: "显示二维码", icon: "qr-code", secondary: true, nav: "share-qr" },
            ],
            page.id
          )}
        </div>
      </div>
    `;
  }

  function renderSkills(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="phone-list" style="margin:14px">
            ${(page.skills || [])
              .map(
                (skill) => `
                  <button class="phone-row" data-toast="${escapeHtml(skill.title)} · 已打开详情" type="button">
                    <span class="row-glyph">${icon(skill.icon || "book-open")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(skill.title)}</span>
                      <span class="phone-row-description">${escapeHtml(skill.description)}</span>
                    </span>
                    ${renderBadge(skill.badge || "可用", "success")}
                    ${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderSections(page, page.sections)}
        </div>
      </div>
    `;
  }

  const IDEA_SKILL_PROFILES = [
    {
      pattern: /算命|命理|八字|运势|塔罗|占卜|星盘/,
      title: "个人运势解读",
      purpose:
        "根据用户提供的出生信息、关注方向和表达偏好，生成偏娱乐参考的个性化解读。",
      when: "当用户想了解近期状态、事业、感情、财运或家庭方向时使用。",
      inputs: ["出生日期和大致时辰", "最想了解的方向", "希望温和或直接的解读风格"],
      steps: [
        "确认出生信息和这次想了解的方向。",
        "结合关注方向整理可能的机会、阻力和行动建议。",
        "用用户选择的方式输出解读，并明确仅供娱乐参考。",
      ],
      outputs: ["整体状态摘要", "三个重点提示", "可以马上行动的小建议"],
      boundaries: [
        "不要制造恐慌或绝对化预测",
        "不要替代医疗、法律、投资等专业意见",
        "结果必须标注仅供娱乐参考",
      ],
    },
    {
      pattern: /吃|餐|饭|菜|冰箱|买菜|食谱|营养/,
      title: "家庭一周餐单",
      purpose:
        "根据人数、口味、预算和冰箱现有食材，规划一周晚餐并整理采购清单。",
      when: "当用户需要安排一周晚餐、决定今天吃什么或生成购物清单时使用。",
      inputs: ["家庭人数和每餐份量", "口味、忌口和过敏食材", "预算与可用食材"],
      steps: [
        "先确认人数、预算、忌口和已有食材。",
        "按营养和重复度安排一周晚餐。",
        "根据餐单整理食材缺口和采购清单。",
      ],
      outputs: ["按星期列出的餐单", "按类别整理的采购清单", "需要提前准备的食材"],
      boundaries: ["不要推荐过敏食材", "不要虚构冰箱里没有的库存"],
    },
    {
      pattern: /旅行|出行|旅游|行程|酒店|景点|打包/,
      title: "家庭出行规划",
      purpose:
        "根据目的地、天数、同行人和预算，整理行程、预算与行李清单。",
      when: "当用户准备短途或长途旅行，需要安排路线、预算或打包时使用。",
      inputs: ["目的地和出行日期", "同行人和交通方式", "预算、天气和特殊需求"],
      steps: [
        "先确认目的地、天数、同行人和预算。",
        "按天整理行程并保留休息时间。",
        "生成预算、行李和出发前检查清单。",
      ],
      outputs: ["按天行程安排", "预算和预订清单", "分类行李清单"],
      boundaries: ["不要虚构无法确认的营业时间", "不要安排明显超预算的行程"],
    },
    {
      pattern: /睡|作息|起床|熬夜|休息|疲惫/,
      title: "睡眠节奏助手",
      purpose:
        "根据近期作息和起床时间，给出可执行的睡眠调整和晚间放松安排。",
      when: "当用户想调整入睡时间、减少熬夜或建立固定作息时使用。",
      inputs: ["希望起床和入睡的时间", "近期作息与干扰因素", "可接受的调整幅度"],
      steps: [
        "确认目标作息和当前最晚入睡时间。",
        "把调整拆成一周内可完成的小变化。",
        "生成晚间流程和起床后的检查清单。",
      ],
      outputs: ["一周作息调整表", "睡前放松流程", "需要避免的干扰因素"],
      boundaries: ["不要提供医疗诊断", "出现持续失眠时提醒寻求专业帮助"],
    },
    {
      pattern: /整理|收纳|打扫|清洁|房间|家务/,
      title: "家庭整理助手",
      purpose:
        "根据房间、可用时间和家务优先级，拆出可以立即执行的整理步骤。",
      when: "当用户想整理房间、制定清洁计划或分配家庭家务时使用。",
      inputs: ["需要整理的区域", "可用时间和工具", "需要保留或丢弃的物品规则"],
      steps: [
        "先按房间和难度整理待办事项。",
        "把任务拆成可以在 10 到 30 分钟内完成的步骤。",
        "生成清洁、收纳和家庭分工清单。",
      ],
      outputs: ["房间整理顺序", "清洁任务清单", "家庭分工建议"],
      boundaries: ["不要擅自丢弃用户物品", "涉及贵重物品时先确认"],
    },
    {
      pattern: /日程|提醒|安排|计划|待办|时间/,
      title: "日常安排助手",
      purpose:
        "根据时间、优先级和必须完成的事项，整理今天或本周可执行的安排。",
      when: "当用户需要安排日程、拆分待办或提醒重要事项时使用。",
      inputs: ["日期和时间范围", "必须完成与可选事项", "不能被打断的时间"],
      steps: [
        "确认时间范围、优先级和固定安排。",
        "把任务拆成可以安排到具体时段的步骤。",
        "生成日程、提醒和待确认事项。",
      ],
      outputs: ["按时间排序的安排", "优先级清单", "提醒和冲突提示"],
      boundaries: ["不要虚构用户已有日程", "冲突无法确认时先询问"],
    },
  ];

  const DEFAULT_IDEA_SKILL_PROFILE = {
    title: "生活小帮手",
    purpose: "把用户的小想法整理成清晰、可执行的日常处理流程。",
    when: "当用户遇到与这个想法相关的日常问题时使用。",
    inputs: ["用户的具体目标", "当前情况和限制", "希望得到的结果"],
    steps: [
      "先理解用户真正想完成的事情。",
      "整理已知信息和需要补充的信息。",
      "按照日常场景给出可执行结果。",
    ],
    outputs: ["清晰的结果", "下一步行动", "需要确认的事项"],
    boundaries: ["不要虚构用户没有提供的信息", "信息不足时先提出最少量的问题"],
  };

  const IDEA_SKILL_QUESTIONS = {
    个人运势解读: [
      { id: "nickname", label: "怎么称呼你", type: "text", placeholder: "例如：小林", required: false },
      { id: "birthDate", label: "出生日期", type: "date" },
      {
        id: "birthTime",
        label: "出生时辰",
        type: "select",
        options: ["不确定", "早上", "中午", "下午", "晚上"],
      },
      {
        id: "focus",
        label: "想了解什么",
        type: "select",
        options: ["综合状态", "事业", "感情", "财运", "家庭"],
      },
      {
        id: "style",
        label: "喜欢哪种解读",
        type: "select",
        options: ["温和鼓励", "直接分析"],
      },
    ],
    家庭一周餐单: [
      { id: "people", label: "家里几个人吃饭", type: "select", options: ["1 人", "2 人", "3-4 人", "5 人以上"] },
      { id: "days", label: "要安排几天", type: "select", options: ["3 天", "5 天", "一周"] },
      { id: "taste", label: "口味偏好", type: "text", placeholder: "例如：清淡、微辣、孩子爱吃" },
      { id: "avoid", label: "忌口或过敏", type: "text", placeholder: "没有可以写“无”" },
      { id: "budget", label: "大概预算", type: "text", placeholder: "例如：每天 80 元" },
    ],
    家庭出行规划: [
      { id: "destination", label: "想去哪里", type: "text", placeholder: "例如：杭州周边" },
      { id: "days", label: "去几天", type: "select", options: ["1 天", "2 天", "3 天", "4 天以上"] },
      { id: "companions", label: "和谁一起去", type: "text", placeholder: "例如：两大一小" },
      { id: "budget", label: "出行预算", type: "text", placeholder: "例如：总预算 1500 元" },
      { id: "needs", label: "特别需要", type: "textarea", rows: 2, placeholder: "例如：少走路、带孩子、想看自然风景" },
    ],
    睡眠节奏助手: [
      { id: "wakeTime", label: "希望几点起床", type: "time" },
      { id: "sleepTime", label: "现在通常几点睡", type: "time" },
      { id: "problem", label: "最难的地方", type: "textarea", rows: 2, placeholder: "例如：躺下后一直刷手机，很难入睡" },
    ],
    家庭整理助手: [
      { id: "area", label: "先整理哪里", type: "select", options: ["客厅", "卧室", "厨房", "卫生间", "全屋"] },
      { id: "minutes", label: "每天能花多久", type: "select", options: ["10 分钟", "20 分钟", "30 分钟", "1 小时"] },
      { id: "priority", label: "最在意什么", type: "textarea", rows: 2, placeholder: "例如：先让地面和桌面空出来" },
    ],
    日常安排助手: [
      { id: "date", label: "安排哪一天", type: "date" },
      { id: "hours", label: "大概有多少空闲", type: "select", options: ["2 小时", "4 小时", "6 小时", "一整天"] },
      { id: "priorities", label: "必须完成什么", type: "textarea", rows: 3, placeholder: "每行写一件，例如：交报告、买菜、接孩子" },
    ],
    生活小帮手: [
      { id: "goal", label: "最想解决什么", type: "textarea", rows: 3, placeholder: "具体写一下你希望得到的结果" },
      { id: "limits", label: "有什么限制", type: "text", placeholder: "例如：时间少、预算有限、不想太复杂" },
      { id: "result", label: "希望得到什么", type: "text", placeholder: "例如：一份清单、计划或提醒" },
    ],
  };

  function getIdeaQuestionFields(profile) {
    return IDEA_SKILL_QUESTIONS[profile.title] || IDEA_SKILL_QUESTIONS["生活小帮手"];
  }

  function inferIdeaSkillProfile(idea) {
    return (
      IDEA_SKILL_PROFILES.find((profile) => profile.pattern.test(idea)) ||
      DEFAULT_IDEA_SKILL_PROFILE
    );
  }

  function getIdeaAnswerKey(id) {
    return `publish-skill:ideaAnswer:${id}`;
  }

  function getIdeaAnswers(profile) {
    return Object.fromEntries(
      getIdeaQuestionFields(profile).map((field) => [
        field.id,
        String(state.segments[getIdeaAnswerKey(field.id)] || "").trim(),
      ]),
    );
  }

  function ideaCodeLiteral(value, highlight = false) {
    const escaped = String(value || "")
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("\n", "\\n");
    if (!highlight) return `"${escaped}"`;
    return `"<span class="publish-code-token">${escapeHtml(escaped)}</span>"`;
  }

  function buildIdeaSkillScript(
    profile,
    idea,
    answers,
    skillName,
    skillSummary,
    highlight = false,
  ) {
    const fields = getIdeaQuestionFields(profile);
    const answerLines = fields
      .map(
        (field, index) =>
          `    ${JSON.stringify(field.label)}: ${ideaCodeLiteral(
            answers[field.id] || "",
            highlight,
          )}${index === fields.length - 1 ? "" : ","}`,
      )
      .join("\n");
    return `// 千变小想法技能脚本
// 彩色文字是可修改项，改完后会直接保存到代码面板。

const SKILL = {
  name: ${ideaCodeLiteral(skillName || profile.title, highlight)},
  summary: ${ideaCodeLiteral(
    skillSummary || profile.purpose,
    highlight,
  )},
  idea: ${ideaCodeLiteral(idea, highlight)},
  version: "2.0.0",
  tokenPolicy: {
    input: "unlimited",
    output: "unlimited",
    context: "expand-as-needed"
  },
  memoryPolicy: {
    recallBeforeRun: true,
    persistPreferences: true,
    summarizeLongContext: true
  },
  planning: {
    strategy: "multi-step",
    askOnlyMissingInformation: true,
    selfReviewPasses: 2
  },
  answers: {
${answerLines}
  },
  steps: [
${profile.steps.map((step) => `    ${JSON.stringify(step)}`).join(",\n")}
  ],
  outputs: ${JSON.stringify(profile.outputs)},
  boundaries: ${JSON.stringify(profile.boundaries)}
};

function validateRequest(input) {
  const question = String(input?.question || "").trim();
  return {
    ok: Boolean(question),
    question,
    message: question ? "" : "请先告诉我你想了解什么"
  };
}

function createPlan(input, memories) {
  return {
    goal: input.question,
    context: memories,
    steps: SKILL.steps,
    expectedOutputs: SKILL.outputs,
    boundaries: SKILL.boundaries
  };
}

async function reviewResult(draft) {
  return {
    passed: Boolean(draft?.content),
    needsFollowUp: !draft?.content,
    qualityChecks: [
      "是否直接回答了问题",
      "是否引用了用户配置",
      "是否遵守边界",
      "是否给出可执行结果"
    ]
  };
}

export async function run(input, context) {
  const request = validateRequest(input);
  if (!request.ok) {
    return {
      status: "need_question",
      message: request.message
    };
  }

  const memories = await context.memory.recall({
    skill: SKILL.name,
    query: request.question
  });
  const plan = createPlan(request, memories);
  const firstDraft = await context.generate({
    system: SKILL.idea,
    skill: SKILL.name,
    config: SKILL.answers,
    plan,
    tokenPolicy: SKILL.tokenPolicy
  });
  const review = await reviewResult(firstDraft);
  const finalDraft = review.passed
    ? firstDraft
    : await context.generate({
        system: SKILL.idea,
        config: SKILL.answers,
        plan,
        repair: review,
        tokenPolicy: SKILL.tokenPolicy
      });

  await context.memory.store({
    skill: SKILL.name,
    question: request.question,
    usefulPreferences: SKILL.answers,
    resultSummary: finalDraft?.summary || ""
  });

  return {
    status: "ok",
    skill: SKILL.name,
    plan,
    review,
    result: finalDraft
  };
}`;
  }

  function fillIdeaSkillScriptFromState() {
    const idea = String(
      state.segments["publish-skill:ideaPrompt"] || "",
    ).trim();
    if (!idea) return { ok: false, reason: "idea" };
    const profile = inferIdeaSkillProfile(idea);
    const fields = getIdeaQuestionFields(profile);
    const answers = getIdeaAnswers(profile);
    const missing = fields.find(
      (field) => field.required !== false && !answers[field.id],
    );
    if (missing) return { ok: false, reason: "answer", field: missing };
    const skillName =
      String(state.segments["publish-skill:skillName"] || "").trim() ||
      profile.title;
    const skillSummary =
      String(state.segments["publish-skill:skillSummary"] || "").trim() ||
      profile.purpose;
    const script = buildIdeaSkillScript(
      profile,
      idea,
      answers,
      skillName,
      skillSummary,
    );
    const highlightedScript = buildIdeaSkillScript(
      profile,
      idea,
      answers,
      skillName,
      skillSummary,
      true,
    );
    const fileName = `${profile.title.replace(/[\\/:*?"<>|\s]+/g, "-")}.js`;
    state.segments["publish-skill:ideaSkillCode"] = script;
    state.segments["publish-skill:ideaCodeMarkup"] = highlightedScript;
    state.segments["publish-skill:ideaCodeEdited"] = "false";
    state.segments["publish-skill:ideaSkillFileName"] = fileName;
    state.segments["publish-skill:skillCode"] = script;
    state.segments["publish-skill:aiGenerated"] = "true";
    return { ok: true, profile };
  }

  function inferIdeaCategory(profile) {
    if (profile.title === "个人运势解读") return "内容创作";
    return "效率工具";
  }

  function renderSkillBuilder(page) {
    const fieldValue = (key) => state.segments[`publish-skill:${key}`] || "";
    const ideaPrompt = fieldValue("ideaPrompt");
    const profile = inferIdeaSkillProfile(ideaPrompt);
    const questionsReady = fieldValue("ideaQuestionsReady") === "true";
    const answers = getIdeaAnswers(profile);
    const skillCode = fieldValue("ideaSkillCode");
    const codeMarkup = fieldValue("ideaCodeMarkup");
    const codeEdited = fieldValue("ideaCodeEdited") === "true";
    const packageName = fieldValue("package");
    const skillName = fieldValue("skillName") || profile.title;
    const skillSummary = fieldValue("skillSummary") || profile.purpose;
    const category = fieldValue("skillCategory") || inferIdeaCategory(profile);
    const publishMode = packageName ? "upload" : "ai";
    return `
      <div class="phone-page skill-builder-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-toast="Skill 预览已打开" type="button" aria-label="预览 Skill">${icon("eye")}</button>`,
        })}
        <div class="phone-scroll">
          <section class="skill-builder-intro">
            <span class="skill-builder-orbit">${icon("wand-sparkles")}</span>
            <div>
              <span class="publish-kicker">创建 Skill</span>
              <h2>告诉千变你想做什么</h2>
              <p>一句话就够。剩下的问题、脚本和结构化规则会自动整理好。</p>
            </div>
            <span class="skill-builder-power">无限上下文</span>
          </section>

          <section class="skill-builder-panel">
            <label class="skill-builder-prompt">
              <span>你的想法</span>
              <textarea
                data-idea-prompt
                data-form-field="publish-skill:ideaPrompt"
                rows="3"
                placeholder="例如：我想做一个懂一点命理的小工具"
              >${escapeHtml(ideaPrompt)}</textarea>
            </label>
            ${
              !questionsReady
                ? `
                  <button class="skill-builder-primary" data-build-idea-questions type="button">
                    ${icon("arrow-right")}继续
                  </button>
                `
                : `
                  <div class="skill-builder-recognition">
                    <span>${icon("sparkles")}已识别</span>
                    <strong>${escapeHtml(profile.title)}</strong>
                    <small>${escapeHtml(profile.purpose)}</small>
                  </div>
                  <div class="skill-builder-questions">
                    ${getIdeaQuestionFields(profile)
                      .map((field) => {
                        const value = answers[field.id] || "";
                        const label = `${field.label}${
                          field.required === false ? "（可选）" : ""
                        }`;
                        if (field.type === "select") {
                          return `
                            <label>
                              <span>${escapeHtml(label)}</span>
                              <select data-form-field="${getIdeaAnswerKey(field.id)}">
                                ${field.options
                                  .map(
                                    (option) =>
                                      `<option ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`,
                                  )
                                  .join("")}
                              </select>
                            </label>
                          `;
                        }
                        if (field.type === "textarea") {
                          return `
                            <label>
                              <span>${escapeHtml(label)}</span>
                              <textarea data-form-field="${getIdeaAnswerKey(field.id)}" rows="${field.rows || 2}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea>
                            </label>
                          `;
                        }
                        return `
                          <label>
                            <span>${escapeHtml(label)}</span>
                            <input type="${field.type || "text"}" data-form-field="${getIdeaAnswerKey(field.id)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" autocomplete="off" />
                          </label>
                        `;
                      })
                      .join("")}
                  </div>
                  <button class="skill-builder-primary" data-fill-idea-script type="button">
                    ${icon("file-code-2")}生成脚本
                  </button>
                `
            }
          </section>

          ${
            skillCode
              ? `
                <section class="skill-builder-script">
                  <div class="skill-builder-script-head">
                    <div>
                      <span>Skill 脚本</span>
                      <small><i></i>黄色文字可修改</small>
                    </div>
                    <button data-refill-idea-script type="button">${icon("refresh-cw")}重新填入</button>
                  </div>
                  <pre
                    class="publish-code-editor publish-code-editable"
                    data-idea-code-editor
                    contenteditable="true"
                    spellcheck="false"
                  >${codeEdited ? escapeHtml(skillCode) : codeMarkup || escapeHtml(skillCode)}</pre>
                  <details class="skill-builder-meta">
                    <summary>${icon("sliders-horizontal")}Skill 信息</summary>
                    <div>
                      <label>
                        <span>名称</span>
                        <input data-form-field="publish-skill:skillName" value="${escapeHtml(skillName)}" />
                      </label>
                      <label>
                        <span>一句话介绍</span>
                        <input data-form-field="publish-skill:skillSummary" value="${escapeHtml(skillSummary)}" />
                      </label>
                      <label>
                        <span>适合场景</span>
                        <select data-form-field="publish-skill:skillCategory">
                          ${["效率工具", "内容创作", "开发工具", "数据分析"]
                            .map(
                              (item) =>
                                `<option ${category === item ? "selected" : ""}>${item}</option>`,
                            )
                            .join("")}
                        </select>
                      </label>
                    </div>
                  </details>
                </section>
              `
              : ""
          }

          <details class="skill-builder-import" ${packageName ? "open" : ""}>
            <summary>${icon("package-plus")}已经有技能包</summary>
            <button data-select-package type="button">
              ${icon(packageName ? "package-check" : "upload")}
              <span><strong>${packageName ? escapeHtml(packageName) : "上传已有技能包"}</strong><small>${packageName ? "发布时将使用这个技能包" : "支持 ZIP，最大 20 MB"}</small></span>
              ${icon("chevron-right")}
            </button>
          </details>
        </div>
        <div class="skill-builder-actions">
          <span>${publishMode === "upload" ? "将发布上传的技能包" : skillCode ? "脚本已准备好" : "完成后即可发布"}</span>
          <button class="skill-builder-publish" data-action="publish-skill" type="button">${icon("send")}发布 Skill</button>
        </div>
      </div>
    `;
  }

  function renderPublishSkill(page) {
    const fieldValue = (key) => state.segments[`publish-skill:${key}`] || "";
    const step = Math.min(3, Math.max(1, Number(state.publishStep) || 1));
    const name = fieldValue("skillName");
    const summary = fieldValue("skillSummary");
    const category = fieldValue("skillCategory") || "效率工具";
    const description = fieldValue("skillDescription");
    const packageName = fieldValue("package");
    const publishMode = fieldValue("publishMode") === "upload" ? "upload" : "ai";
    const ideaPrompt = fieldValue("ideaPrompt");
    const ideaProfile = inferIdeaSkillProfile(ideaPrompt);
    const ideaQuestionsReady = fieldValue("ideaQuestionsReady") === "true";
    const ideaAnswers = getIdeaAnswers(ideaProfile);
    const ideaSkillCode = fieldValue("ideaSkillCode");
    const ideaSkillFileName = fieldValue("ideaSkillFileName");
    const ideaCodeMarkup = fieldValue("ideaCodeMarkup");
    const ideaCodeEdited = fieldValue("ideaCodeEdited") === "true";
    const ideaQuestionFields = getIdeaQuestionFields(ideaProfile);
    const stepTitles = ["基本信息", "用途与技能包", "确认发布"];
    const stepContent = {
      1: `
        <section class="publish-step publish-step-card" data-step="1">
          <span class="publish-step-kicker">第 1 步，共 3 步</span>
          <h2>先给技能起个名字</h2>
          <p>用一句简单的话说明它帮你做什么。</p>
          <label class="publish-field">
            <span>技能名称</span>
            <input
              type="text"
              name="skillName"
              data-publish-field
              data-form-field="publish-skill:skillName"
              value="${escapeHtml(name)}"
              placeholder="例如：每日穿搭助手"
              autocomplete="off"
            />
          </label>
          <label class="publish-field">
            <span>一句话介绍</span>
            <input
              type="text"
              name="skillSummary"
              data-publish-field
              data-form-field="publish-skill:skillSummary"
              value="${escapeHtml(summary)}"
              placeholder="例如：根据天气帮你搭配今天的衣服"
              autocomplete="off"
            />
          </label>
        </section>
      `,
      2: `
        <section class="publish-step publish-step-card" data-step="2">
          <span class="publish-step-kicker">第 2 步，共 3 步</span>
          <h2>它主要帮你做什么？</h2>
          <p>用小想法自动填好脚本，或直接上传技能包。</p>
          <label class="publish-field">
            <span>适合场景</span>
            <select name="skillCategory" data-publish-field data-form-field="publish-skill:skillCategory">
              ${["效率工具", "内容创作", "开发工具", "数据分析"].map(
                (item) =>
                  `<option ${category === item ? "selected" : ""}>${item}</option>`,
              ).join("")}
            </select>
          </label>
          <label class="publish-field">
            <span>补充说明（可选）</span>
            <textarea
              name="skillDescription"
              data-publish-field
              data-form-field="publish-skill:skillDescription"
              rows="3"
              placeholder="例如：它会先问天气，再给出三套搭配"
            >${escapeHtml(description)}</textarea>
          </label>
          <div class="publish-method-tabs" role="tablist" aria-label="发布方式">
            <button class="${publishMode === "ai" ? "is-active" : ""}" data-publish-mode="ai" type="button" role="tab" aria-selected="${publishMode === "ai"}">${icon("lightbulb")}小想法</button>
            <button class="${publishMode === "upload" ? "is-active" : ""}" data-publish-mode="upload" type="button" role="tab" aria-selected="${publishMode === "upload"}">${icon("package-plus")}上传技能包</button>
          </div>
          ${
            publishMode === "ai"
              ? `
                  <div class="publish-idea-guide">
                    <div class="publish-idea-guide-head">
                      <span class="publish-idea-auto">${icon("sparkles")}自动生成</span>
                      <small>问答式 Skill</small>
                    </div>
                    <label class="publish-idea-input">
                      <span>想做什么</span>
                      <textarea
                        name="ideaPrompt"
                        data-idea-prompt
                        data-publish-field
                        data-form-field="publish-skill:ideaPrompt"
                        rows="3"
                        placeholder="例如：我想安排一周家庭晚餐和采购清单"
                      >${escapeHtml(ideaPrompt)}</textarea>
                    </label>
                    ${
                      !ideaQuestionsReady
                        ? `
                          <button class="publish-idea-create" data-build-idea-questions type="button">
                            ${icon("message-circle-question")}下一步
                          </button>
                        `
                        : `
                          <div class="publish-idea-profile">
                            <span>识别为</span>
                            <strong>${escapeHtml(ideaProfile.title)}</strong>
                          </div>
                          <div class="publish-idea-questionnaire">
                            ${ideaQuestionFields
                              .map((field) => {
                                const value = ideaAnswers[field.id] || "";
                                const label = `${field.label}${
                                  field.required === false ? "（可选）" : ""
                                }`;
                                if (field.type === "select") {
                                  return `
                                    <label class="publish-idea-field">
                                      <span>${escapeHtml(label)}</span>
                                      <select data-form-field="${getIdeaAnswerKey(field.id)}">
                                        ${field.options
                                          .map(
                                            (option) =>
                                              `<option ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`,
                                          )
                                          .join("")}
                                      </select>
                                    </label>
                                  `;
                                }
                                if (field.type === "textarea") {
                                  return `
                                    <label class="publish-idea-field">
                                      <span>${escapeHtml(label)}</span>
                                      <textarea
                                        data-form-field="${getIdeaAnswerKey(field.id)}"
                                        rows="${field.rows || 2}"
                                        placeholder="${escapeHtml(field.placeholder || "")}"
                                      >${escapeHtml(value)}</textarea>
                                    </label>
                                  `;
                                }
                                return `
                                  <label class="publish-idea-field">
                                    <span>${escapeHtml(label)}</span>
                                    <input
                                      type="${field.type || "text"}"
                                      data-form-field="${getIdeaAnswerKey(field.id)}"
                                      value="${escapeHtml(value)}"
                                      placeholder="${escapeHtml(field.placeholder || "")}"
                                      autocomplete="off"
                                    />
                                  </label>
                                `;
                              })
                              .join("")}
                          </div>
                          <button class="publish-idea-create" data-fill-idea-script type="button">
                            ${icon("file-code-2")}填入技能脚本
                          </button>
                          ${
                            ideaSkillCode
                              ? `
                                <div class="publish-idea-code">
                                  <div class="publish-idea-code-head">
                                    <strong>${icon("code-2")}技能脚本</strong>
                                    <small><i></i>彩色文字可直接修改</small>
                                    <button class="publish-idea-code-refill" data-refill-idea-script type="button">${icon("refresh-cw")}重新填入</button>
                                  </div>
                                  <pre
                                    class="publish-code-editor publish-code-editable"
                                    data-idea-code-editor
                                    contenteditable="true"
                                    spellcheck="false"
                                  >${ideaCodeEdited ? escapeHtml(ideaSkillCode) : ideaCodeMarkup || escapeHtml(ideaSkillCode)}</pre>
                                </div>
                              `
                              : ""
                          }
                        `
                    }
                  </div>
                `
                : `
                <button class="publish-package-button ${packageName ? "is-ready" : ""}" data-select-package type="button">
                  ${icon(packageName ? "package-check" : "package-plus")}
                  <span><strong>${packageName ? "技能包已准备好" : "选择技能包"}</strong><small>${packageName ? escapeHtml(packageName) : "支持 ZIP 文件，最大 20 MB"}</small></span>
                  ${icon("chevron-right")}
                </button>
                ${
                  packageName
                    ? `<div class="publish-package-ready">${icon("circle-check")}文件已添加，可以继续下一步</div>`
                    : ""
                }
                `
          }
        </section>
      `,
      3: `
        <section class="publish-step publish-step-card" data-step="3">
          <span class="publish-step-kicker">第 3 步，共 3 步</span>
          <h2>确认一下，就可以发布</h2>
          <p>发布后，其他用户可以在技能市场找到它。</p>
          <div class="publish-review">
            <div><span>技能名称</span><strong>${escapeHtml(name || "未填写")}</strong></div>
            <div><span>一句话介绍</span><strong>${escapeHtml(summary || "未填写")}</strong></div>
            <div><span>适合场景</span><strong>${escapeHtml(category)}</strong></div>
            <div><span>发布方式</span><strong>${publishMode === "ai" ? "小想法" : "上传文件"}</strong></div>
            <div><span>文件</span><strong>${escapeHtml(publishMode === "upload" ? packageName || "未上传" : ideaSkillFileName || "尚未填入")}</strong></div>
          </div>
          <div class="publish-tip">${icon("shield-check")}发布前会检查文件完整性和基础权限。</div>
        </section>
      `,
    };
    return `
      <div class="phone-page publish-skill-page">
        ${statusBar()}
        ${phonePageHeader(page, {
          action: `<button class="phone-icon-button ghost" data-toast="技能预览已打开" type="button" aria-label="预览技能">${icon(
            "eye",
          )}</button>`,
        })}
        <div class="phone-scroll">
          <section class="publish-compact-intro">
            <span class="publish-hero-icon">${icon("upload-cloud")}</span>
            <div>
              <span class="publish-kicker">发布技能</span>
              <h2>把你的技能分享出去</h2>
              <p>跟着三步完成，不需要填写复杂设置。</p>
            </div>
          </section>
          <div class="publish-wizard-progress" aria-label="发布进度">
            ${[1, 2, 3]
              .map(
                (item) => `
                  <span class="${item === step ? "is-active" : ""} ${item < step ? "is-done" : ""}">
                    <b>${item < step ? "✓" : item}</b>
                    <small>${stepTitles[item - 1]}</small>
                  </span>
                `,
              )
              .join("")}
          </div>
          ${stepContent[step]}
        </div>
        <div class="publish-wizard-actions">
          ${
            step > 1
              ? `<button class="publish-back" data-publish-back type="button">${icon("arrow-left")}上一步</button>`
              : ""
          }
          ${
            step < 3
              ? `<button class="publish-next" data-publish-next type="button">下一步${icon("arrow-right")}</button>`
              : `<button class="publish-next" data-action="publish-skill" type="button">${icon("send")}发布技能</button>`
          }
        </div>
      </div>
    `;
  }

  function renderAppearance(page) {
    return `
      <div class="phone-page settings-page">
        ${statusBar()}
        ${phonePageHeader(page, { hideSubtitle: true })}
        <div class="phone-scroll">
          <div class="generic-hero">
            <span class="generic-hero-icon">${icon("palette")}</span>
            <h2>选择配色</h2>
            <div class="swatch-row" style="margin-top:13px">
              ${ACCENT_IDS
                .map(
                  (accent) =>
                    `<button class="swatch ${state.accent === accent ? "is-active" : ""}" data-accent-choice="${accent}" style="--swatch:${ACCENT_COLORS[accent]}" type="button" aria-label="${ACCENT_LABELS[accent] || accent}"></button>`
                )
                .join("")}
            </div>
          </div>
          ${renderSections(page, page.sections)}
        </div>
      </div>
    `;
  }

  function renderIcons(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="workshop-grid" style="margin-bottom:16px">
            ${(page.iconOptions || [])
              .map(
                (option) => `
                  <button class="workshop-card" data-toast="${escapeHtml(option.title)} · 已应用" type="button">
                    <span class="workshop-thumb">${
                      option.image
                        ? `<img src="${escapeHtml(option.image)}" alt="${escapeHtml(option.title)}" />`
                        : icon(option.icon || "shapes")
                    }</span>
                    <span class="workshop-card-copy">
                      <strong>${escapeHtml(option.title)}</strong>
                      <span>${escapeHtml(option.description)}</span>
                      ${option.active ? renderBadge("当前", "success") : ""}
                    </span>
                  </button>
                `
              )
              .join("")}
          </div>
          ${
            page.id === "app-icon"
              ? ""
              : `<div class="phone-body"><div class="phone-notice">${icon("info")}功能磁贴会同时应用于全部功能、技能面板与分享卡。</div></div>`
          }
        </div>
      </div>
    `;
  }

  function renderWallpaper(page) {
    const gradients = [
      "linear-gradient(145deg,#163e55,#a6cdd6 55%,#e4eff0)",
      "linear-gradient(145deg,#e8e3d9,#fbfaf6)",
      "linear-gradient(145deg,#193a35,#5ba49a 55%,#d7e6df)",
      "var(--phone-surface)",
    ];
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="workshop-grid" style="margin:14px 14px 16px">
            ${(page.wallpapers || [])
              .map(
                (title, index) => `
                  <button class="workshop-card ${index === 0 ? "is-selected" : ""}" data-toast="壁纸：${escapeHtml(
                    title
                  )}" type="button">
                    <span class="workshop-thumb" style="background:${gradients[index % gradients.length]}">
                      ${index === 0 ? icon("check-circle-2") : ""}
                    </span>
                    <span class="workshop-card-copy"><strong>${escapeHtml(title)}</strong></span>
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderSettingsHub(page) {
    return renderSettings(page);
  }

  function renderListPage(page) {
    const listItems = (page.listItems || []).filter(
      (item) => !item.nav || isPageVisible(item.nav),
    );
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div style="height:14px"></div>
          <div class="phone-list" style="margin:0 14px">
            ${listItems
              .map(
                (item) => `
                  <button class="phone-row" ${item.nav ? `data-nav="${item.nav}"` : 'data-toast="已打开"'} type="button">
                    <span class="row-glyph">${icon(item.icon || "circle")}</span>
                    <span class="phone-row-main">
                      <span class="phone-row-label">${escapeHtml(item.title)}</span>
                      <span class="phone-row-description">${escapeHtml(item.description || "")}</span>
                    </span>
                    ${renderBadge(item.badge || "", item.badge === "使用中" ? "success" : "")}
                    ${icon("chevron-right", "row-chevron")}
                  </button>
                `
              )
              .join("")}
          </div>
          ${renderActions(page.actions, page.id)}
        </div>
      </div>
    `;
  }

  function renderEmpty(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        ${phonePageHeader(page)}
        <div class="phone-scroll">
          <div class="phone-empty">
            <span class="phone-empty-icon">${icon(page.icon || "inbox")}</span>
            <h2>${escapeHtml(page.emptyTitle || page.title)}</h2>
            <p>${escapeHtml(page.emptyDescription || page.summary)}</p>
            ${renderActions(page.actions, page.id)}
          </div>
        </div>
      </div>
    `;
  }

  function renderQuickPanel(page) {
    return `
      <div class="phone-page">
        ${statusBar()}
        <div class="chat-page">
          ${conversationHeader()}
          <div class="chat-messages">${renderChatMessages(getPage("chat"))}</div>
          ${renderComposer(page)}
          <button class="phone-scrim" data-action="close-quick" type="button"></button>
          <aside class="drawer-panel" style="left:auto;right:0;width:min(300px,calc(100% - 42px));border-right:0;border-left:1px solid var(--phone-line);border-radius:18px 0 0 18px;animation-name:drawer-right-in">
            <div class="drawer-head">
              <div class="drawer-lockup"><div><strong>快捷面板</strong><span>当前对话</span></div></div>
              <button class="phone-icon-button small" data-action="close-quick" type="button">${icon("x")}</button>
            </div>
            <div class="phone-list" style="margin:12px 10px">
              <button class="phone-row" data-nav="session-workbench" type="button"><span class="row-glyph">${icon(
                "panels-top-left"
              )}</span><span class="phone-row-main"><span class="phone-row-label">会话工作台</span></span>${icon(
                "chevron-right",
                "row-chevron"
              )}</button>
              <button class="phone-row" data-nav="appearance" type="button"><span class="row-glyph">${icon(
                "palette"
              )}</span><span class="phone-row-main"><span class="phone-row-label">外观与界面</span></span>${icon(
                "chevron-right",
                "row-chevron"
              )}</button>
              <button class="phone-row" data-nav="plugins" type="button"><span class="row-glyph">${icon(
                "puzzle"
              )}</span><span class="phone-row-main"><span class="phone-row-label">技能板块</span></span>${icon(
                "chevron-right",
                "row-chevron"
              )}</button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderSheetContent(type) {
    const content = {
      model: {
        title: "选择模型",
        description: "当前提供方：AI 平台",
        rows: [
          ["通用模型 V4", "128k 上下文 · 工具调用", "brain", "默认"],
          ["推理模型", "深度推理 · 64k 上下文", "lightbulb", ""],
          ["对话模型", "快速响应 · 32k 上下文", "zap", ""],
        ],
      },
      permission: {
        title: "当前对话权限",
        description: "仅影响这个对话",
        rows: [
          ["仅可查看", "只能读取，不修改文件或执行命令", "eye", ""],
          ["工作区内修改", "默认档位，修改限制在工作区", "folder-pen", "选中"],
          ["完全权限", "减少执行前确认，风险更高", "shield-alert", ""],
        ],
      },
      host: {
        title: "切换主机",
        description: "对话会在同一段上下文上切换",
        rows: [
          ["这台手机", "运行中 · 千变 0.1.1-rc.2", "smartphone", "当前"],
          ["工作室电脑", "SSH · 18ms · 在线", "monitor", ""],
          ["开发服务器", "Remote · 42ms · 在线", "server", ""],
        ],
      },
      generate: {
        title: "图像生成",
        description: "参数只影响下一条消息",
        rows: [
          ["模式", "图像 / 视频", "image-play", "图像"],
          ["比例", "1:1 / 4:3 / 16:9", "ratio", "16:9"],
          ["数量", "1 / 2 / 4", "copy-plus", "2"],
          ["模型", "imagine-v3", "wand-sparkles", ""],
        ],
      },
      session: {
        title: "会话操作",
        description: "千变 界面复刻",
        rows: [
          ["置顶", "保持在对话列表顶部", "pin", ""],
          ["重命名", "修改会话标题", "pencil", ""],
          ["分享", "生成分享卡或链接", "share-2", ""],
          ["移动到文件夹", "整理对话列表", "folder-input", ""],
          ["归档", "从当前列表移出", "archive", ""],
          ["删除", "不可恢复", "trash-2", ""],
        ],
      },
      share: {
        title: "分享对话",
        description: "分享前会遮蔽密钥与私人路径",
        rows: [
          ["生成分享卡", "图片形式，适合直接发送", "image", ""],
          ["分享链接", "可回放整段对话", "link", ""],
          ["二维码", "用手机扫码打开", "qr-code", ""],
          ["导出文件", "Markdown 或 HTML", "file-archive", ""],
        ],
      },
      image: {
        title: "图片操作",
        description: "preview.png",
        rows: [
          ["保存到相册", "下载原始图片", "download", ""],
          ["分享图片", "系统分享或生成链接", "share-2", ""],
          ["创建变体", "基于这张图继续生成", "copy-plus", ""],
          ["加入下一轮", "把图片放入输入条", "paperclip", ""],
        ],
      },
      trajectory: {
        title: "本轮执行过程",
        description: "3 个工具 · 18 秒",
        rows: [
          ["读取页面源码", "完成 · 3.2s", "file-search", ""],
          ["整理页面树", "完成 · 5.9s", "list-tree", ""],
          ["检查 HTML 交互", "进行中", "scan-search", ""],
          ["查看完整轨迹", "打开对话详情", "route", ""],
        ],
      },
      send: {
        title: "发送方式",
        description: "当前正在生成回复",
        rows: [
          ["排队", "本轮结束后发送", "clock", ""],
          ["立即插话", "把消息送进当前轮次", "message-square-dashed", ""],
          ["打断后发送", "停止当前轮次再发送", "octagon-x", ""],
        ],
      },
      context: {
        title: "上下文用量",
        description: "128k 模型窗口",
        rows: [
          ["已用 Tokens", "12.4k · 9.7%", "gauge", ""],
          ["系统与工具", "4.1k", "wrench", ""],
          ["对话消息", "6.8k", "messages-square", ""],
          ["附件", "1.5k", "paperclip", ""],
          ["自动压缩", "剩余 24 条消息时", "minimize-2", ""],
        ],
      },
      default: {
        title: "操作面板",
        description: "前端交互演示",
        rows: [
          ["查看详情", "打开当前页面", "arrow-up-right", ""],
          ["刷新状态", "重新渲染前端数据", "refresh-cw", ""],
        ],
      },
    };
    const config = content[type] || content.default;
    const selectedIndex =
      type === "permission" ? 1 : type === "host" ? 0 : type === "model" ? 0 : -1;
    const sheetBody = `
      <div class="sheet-list">
        ${config.rows
          .map(
            (item, index) => `
              <button class="phone-row" data-toast="${escapeHtml(item[0])} · 已选择" type="button" style="${
                index === selectedIndex ? "background:var(--accent-soft)" : ""
              }">
                <span class="row-glyph">${icon(item[2])}</span>
                <span class="phone-row-main">
                  <span class="phone-row-label">${escapeHtml(item[0])}</span>
                  <span class="phone-row-description">${escapeHtml(item[1])}</span>
                </span>
                ${item[3] ? renderBadge(item[3], index === selectedIndex ? "success" : "") : ""}
                ${icon(index === selectedIndex ? "check" : "chevron-right", "row-chevron")}
              </button>
            `,
          )
          .join("")}
      </div>
    `;
    return `
      <button class="bottom-sheet-scrim" data-action="close-sheet" type="button" aria-label="关闭"></button>
      <section class="bottom-sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(config.title)}">
        <div class="sheet-grabber"></div>
        <div class="sheet-head">
          <div>
            <h2>${escapeHtml(config.title)}</h2>
            <p>${escapeHtml(config.description)}</p>
          </div>
          <button class="sheet-close" data-action="close-sheet" type="button" aria-label="关闭">${icon("x")}</button>
        </div>
        ${sheetBody}
      </section>
    `;
  }

  function renderSheet(baseHtml) {
    if (!state.sheet || state.sheet === "plus") return baseHtml;
    return baseHtml + renderSheetContent(state.sheet);
  }

  function syncSheetMotion(animateEntry = false) {
    const sheet = phoneScreen.querySelector(".bottom-sheet");
    if (!sheet) {
      return;
    }

    if (animateEntry) return;
    sheet.classList.add("is-sheet-settled");
    phoneScreen
      .querySelector(".bottom-sheet-scrim")
      ?.classList.add("is-sheet-settled");
  }

  function renderAffinityDialog() {
    const progress = Math.round(state.agentTraining);
    const stateLabel = affinityBand(progress);
    const progressFill = affinityFill(progress);
    return `
      <div class="affinity-layer">
        <button
          class="affinity-scrim"
          data-action="close-dialog"
          type="button"
          aria-label="关闭契合度窗口"
        ></button>
        <section
          class="affinity-popover"
          role="dialog"
          aria-modal="true"
          aria-labelledby="affinity-popover-title"
        >
          <header class="affinity-popover-head">
            <div>
              <h2 id="affinity-popover-title">契合度</h2>
            </div>
            <button
              class="affinity-popover-close"
              data-action="close-dialog"
              type="button"
              aria-label="关闭"
            >${icon("x")}</button>
          </header>
          <div class="affinity-popover-summary">
            <strong class="affinity-popover-value">${progress}%</strong>
            <span>${stateLabel}</span>
          </div>
          <div
            class="affinity-popover-track"
            role="progressbar"
            aria-label="用户与 Agent 契合度"
            aria-valuemin="0"
            aria-valuemax="${AFFINITY_MAX}"
            aria-valuenow="${progress}"
          >
            <span class="affinity-popover-fill" style="width:${progressFill}%"></span>
          </div>
        </section>
      </div>
    `;
  }

  function renderDialog() {
    if (!state.dialog) return "";
    if (state.dialog.type === "affinity") return renderAffinityDialog();
    return `
      <div class="dialog-scrim" role="presentation">
        <section class="phone-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(state.dialog.title)}">
          <h2>${escapeHtml(state.dialog.title)}</h2>
          <p>${escapeHtml(state.dialog.body)}</p>
          <div class="dialog-actions">
            <button class="cancel" data-action="close-dialog" type="button">取消</button>
            <button class="confirm" data-action="confirm-dialog" type="button">${escapeHtml(
              state.dialog.confirmLabel
            )}</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderToast() {
    if (!state.toast) {
      toastRegion.innerHTML = "";
      return;
    }
    toastRegion.innerHTML = `<div class="desktop-toast">${icon(state.toast.icon)}${escapeHtml(
      state.toast.message
    )}</div>`;
  }

  function renderPage(page) {
    switch (page.kind) {
      case "welcome":
        return renderWelcome(page);
      case "onboarding":
        return renderOnboarding(page);
      case "launch":
        return renderLaunch(page);
      case "chat":
        return renderChat(page);
      case "drawer":
        return renderDrawer(page);
      case "quick-panel":
        return renderQuickPanel(page);
      case "account":
        return renderAccount(page);
      case "settings":
        return renderSettings(page);
      case "all-features":
        return renderAllFeatures(page);
      case "files":
        return renderFiles(page);
      case "terminal":
        return renderTerminal(page);
      case "providers":
        return renderProviders(page);
      case "remote":
        return renderRemote(page);
      case "engine":
        return renderEngine(page);
      case "plugins":
      case "plugin-detail":
        return renderPlugins(page);
      case "market":
        return renderPlugins(page);
      case "bots":
        return renderBots(page);
      case "rooms":
        return renderRooms(page);
      case "forum":
      case "forum-topic":
        return renderForum(page);
      case "notifications":
        return renderNotifications(page);
      case "community":
        return renderCommunity(page);
      case "companion":
        return renderCompanion(page);
      case "memory":
        return renderMemory(page);
      case "pets":
        return renderPets(page);
      case "tavern":
      case "tavern-chat":
      case "tavern-storybook":
        return renderTavern(page);
      case "workshop":
        return renderWorkshop(page);
      case "session-detail":
        return renderSessionDetail(page);
      case "timeline":
        return renderTimeline(page);
      case "session-workbench":
        return renderSessionWorkbench(page);
      case "diagnostics":
        return renderDiagnostics(page);
      case "access":
        return renderAccess(page);
      case "jobs":
        return renderJobs(page);
      case "file-preview":
        return renderFilePreview(page);
      case "artifact-preview":
        return renderArtifactPreview(page);
      case "image-viewer":
        return renderImageViewer(page);
      case "search":
        return renderSearch(page);
      case "web":
        return renderWeb(page);
      case "share":
        return renderShare(page);
      case "skills":
        return renderSkills(page);
      case "publish-skill":
        return renderSkillBuilder(page);
      case "appearance":
        return renderAppearance(page);
      case "icons":
        return renderIcons(page);
      case "wallpaper":
        return renderWallpaper(page);
      case "list":
        return renderListPage(page);
      case "empty":
        return renderEmpty(page);
      case "sheet":
        return renderSheet(renderPage(getPage(page.basePage || "chat")));
      default:
        return renderGeneric(page);
    }
  }

  function renderPhone() {
    const page = state.page || getPage(state.current);
    const animateSheet = Boolean(
      state.sheet && pendingSheetAnimation === state.sheet,
    );
    let html = renderPage(page);
    if (state.sheet && page.kind !== "sheet") {
      html = renderSheet(html);
    }
    if (state.mainNavOpen) html += renderMainNavOverlay();
    if (state.skillModal || state.skillDetail) html += renderSkillModalOverlay();
    if (state.historyOpen) html += renderHistoryOverlay();
    if (state.devicesOpen) html += renderMobileDevicesOverlay();
    if (state.dialog) html += renderDialog();
    if (state.toast) {
      html += `<div class="phone-toast">${icon(state.toast.icon)}${escapeHtml(state.toast.message)}</div>`;
    }
    phoneScreen.innerHTML = html;
    updateIcons(phoneScreen);
    syncSheetMotion(animateSheet);
    pendingSheetAnimation = null;
    bindLocalInputs();
    const pairingQr = phoneScreen.querySelector(".device-pair-qr");
    if (pairingQr && window.QianbianQR) {
      window.QianbianQR.render(pairingQr.dataset.qrPayload, pairingQr).catch(
        () => {
          pairingQr.hidden = true;
        },
      );
    }
    scheduleChatScrollToBottom();
  }

  function bindLocalInputs() {
    document.querySelectorAll("[data-form-field]").forEach((input) => {
      const updateValue = () => {
        const key = input.dataset.formField;
        state.segments[key] = input.value;
        const isIdeaPrompt = key === "publish-skill:ideaPrompt";
        const isIdeaAnswer = key.startsWith("publish-skill:ideaAnswer:");
        if (isIdeaPrompt || isIdeaAnswer) {
          if (isIdeaPrompt) {
            delete state.segments["publish-skill:ideaQuestionsReady"];
          }
          delete state.segments["publish-skill:ideaSkillCode"];
          delete state.segments["publish-skill:ideaCodeMarkup"];
          delete state.segments["publish-skill:ideaCodeEdited"];
          delete state.segments["publish-skill:ideaSkillFileName"];
          delete state.segments["publish-skill:skillCode"];
          state.segments["publish-skill:aiGenerated"] = "false";
        }
      };
      if (!Object.prototype.hasOwnProperty.call(state.segments, input.dataset.formField)) {
        state.segments[input.dataset.formField] = input.value;
      }
      input.addEventListener("input", updateValue);
      input.addEventListener("change", updateValue);
    });
    const ideaCodeEditor = document.querySelector("[data-idea-code-editor]");
    if (ideaCodeEditor) {
      ideaCodeEditor.addEventListener("input", () => {
        state.segments["publish-skill:ideaSkillCode"] = ideaCodeEditor.innerText;
        state.segments["publish-skill:skillCode"] = ideaCodeEditor.innerText;
        state.segments["publish-skill:ideaCodeEdited"] = "true";
      });
    }
    const historySearch = document.getElementById("history-search-input");
    if (historySearch) {
      historySearch.addEventListener("input", () => {
        state.historyQuery = historySearch.value;
        applyHistoryFilters();
      });
      applyHistoryFilters();
    }
    const skillBrowserSearch = document.getElementById("skill-browser-search");
    if (skillBrowserSearch) {
      skillBrowserSearch.addEventListener("input", () => {
        state.skillBrowserQuery = skillBrowserSearch.value;
        updateSkillBrowserResults();
      });
    }
    document.querySelectorAll("[data-skill-delete-name]").forEach((input) => {
      input.addEventListener("change", () => {
        const name = input.dataset.skillDeleteName;
        if (input.checked) state.skillDeleteSelection.add(name);
        else state.skillDeleteSelection.delete(name);
        updateSkillDeleteControls();
      });
    });
    document.querySelectorAll("[data-installed-skill-select]").forEach((input) => {
      input.addEventListener("change", () => {
        const name = input.dataset.installedSkillSelect;
        if (input.checked) state.installedSkillSelection.add(name);
        else state.installedSkillSelection.delete(name);
        renderPhone();
        updateIcons();
      });
    });
    document.querySelectorAll("[data-account-field]").forEach((input) => {
      input.addEventListener("input", () => {
        if (state.accountDraft) {
          state.accountDraft[input.dataset.accountField] = input.value;
        }
      });
    });
    const localeSelect = document.querySelector("[data-locale-select]");
    if (localeSelect) {
      localeSelect.addEventListener("change", () => {
        state.locale = localeSelect.value === "en" ? "en" : "zh";
        localStorage.setItem("dshgo-atlas-locale", state.locale);
        showToast(
          state.locale === "zh"
            ? "界面语言：简体中文"
            : "Interface language: English",
          "languages",
        );
      });
    }
    document.querySelectorAll("[data-row-select]").forEach((select) => {
      select.addEventListener("change", () => {
        const key = segmentKey(select.dataset.rowPage || "", select.dataset.rowLabel || "");
        state.segments[key] = select.selectedIndex;
      });
    });
    const chatInput = document.getElementById("chat-input");
    const environmentSelect = document.getElementById("mobile-environment-select");
    const pairNameInput = document.querySelector("[data-device-pair-name]");
    const pairTypeSelect = document.querySelector("[data-device-pair-type]");
    if (pairNameInput) {
      pairNameInput.addEventListener("input", () => {
        state.pairingName = pairNameInput.value;
      });
    }
    if (pairTypeSelect) {
      pairTypeSelect.addEventListener("change", () => {
        state.pairingType =
          pairTypeSelect.value === "android" ? "android" : "windows";
      });
    }
    if (environmentSelect) {
      environmentSelect.addEventListener("change", () => {
        setMobileExecutionTarget(environmentSelect.value);
      });
    }
    if (chatInput) {
      chatInput.addEventListener("input", () => {
        state.chatDraft = chatInput.value;
      });
    }
  }

  function applyHistoryFilters() {
    const query = state.historyQuery.trim().toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll(".history-session").forEach((session) => {
      const name = (session.dataset.historyName || "").toLowerCase();
      const viewMatches = session.dataset.historyKind === state.historyView;
      const queryMatches = query.length === 0 || name.includes(query);
      session.hidden = !viewMatches || !queryMatches;
      if (!session.hidden) visibleCount += 1;
    });
    const empty = document.getElementById("history-empty");
    if (empty) {
      empty.hidden = visibleCount > 0;
      empty.textContent =
        state.historyView === "chat" ? "没有匹配的聊天会话" : "没有匹配的工作会话";
    }
  }

  function scheduleChatScrollToBottom() {
    if (chatScrollFrame || chatScrollTimer) return;
    const wait = Math.max(0, 100 - (performance.now() - lastChatScrollAt));
    chatScrollTimer = window.setTimeout(() => {
      chatScrollTimer = null;
      chatScrollFrame = window.requestAnimationFrame(() => {
        chatScrollFrame = 0;
        const messages = document.getElementById("chat-messages");
        if (messages) messages.scrollTop = messages.scrollHeight;
        lastChatScrollAt = performance.now();
      });
    }, wait);
  }

  function scheduleStreamingMessageUpdate(itemId) {
    pendingStreamItemIds.add(String(itemId));
    if (streamTextFrame) return;
    streamTextFrame = window.requestAnimationFrame(() => {
      streamTextFrame = 0;
      const ids = [...pendingStreamItemIds];
      pendingStreamItemIds.clear();
      for (const id of ids) {
        const message = state.backendTimeline.find(
          (item) => item.itemId === id,
        );
        const textNode = document.querySelector(
          `[data-message-item-id="${CSS.escape(id)}"] .assistant-text`,
        );
        if (message && textNode) {
          textNode.innerHTML = renderBackendMarkdown(message.text);
        }
      }
      document.querySelectorAll(".thinking-pill").forEach((node) => node.remove());
      scheduleChatScrollToBottom();
    });
  }

  function scrollChatToBottom() {
    scheduleChatScrollToBottom();
    const terminal = document.getElementById("terminal-body");
    if (terminal) {
      window.requestAnimationFrame(() => {
        terminal.scrollTop = terminal.scrollHeight;
      });
    }
  }

  function renderCatalog() {
    const query = state.catalogSearch.trim().toLowerCase();
    let visibleCount = 0;
    catalogTree.innerHTML = visibleGroups
      .map((group) => {
        const visiblePages = group.pageIds
          .map((id) => pages[id])
          .filter((page) => isPageVisible(page.id))
          .filter((page) => {
            if (!query) return true;
            return `${page.title} ${page.summary} ${page.path.join(" ")} ${group.title}`
              .toLowerCase()
              .includes(query);
          });
        if (!visiblePages.length) return "";
        visibleCount += visiblePages.length;
        const collapsed = state.collapsedGroups.has(group.id) && !query;
        return `
          <section class="catalog-group ${collapsed ? "is-collapsed" : ""}" data-group="${escapeHtml(group.id)}">
            <button class="catalog-group-head" data-group-toggle="${escapeHtml(group.id)}" type="button">
              ${icon(group.icon)}
              <span>${escapeHtml(group.title)}</span>
              <span style="margin-left:auto;color:var(--faint);font-family:'JetBrains Mono',monospace;font-size:9px">${String(
                visiblePages.length
              ).padStart(2, "0")}</span>
              ${icon("chevron-down", "group-caret")}
            </button>
            <div class="catalog-page-list">
              ${visiblePages
                .map((page) => {
                  const opensSkillRepository = page.kind === "skill-repository-link";
                  const active =
                    page.id === state.current ||
                    (opensSkillRepository && state.mainNavOpen);
                  const actionAttribute = opensSkillRepository
                    ? `data-nav="${page.id}" data-action="open-main-nav"`
                    : `data-nav="${page.id}"`;
                  return `
                    <button class="catalog-page-button ${active ? "is-active" : ""}" ${actionAttribute} data-overlay="${page.overlay}" type="button">
                      <span class="nav-icon">${icon(page.icon)}</span>
                      <span class="catalog-page-name">${escapeHtml(page.title)}</span>
                      <span class="catalog-page-kind"></span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
    catalogEmpty.hidden = visibleCount > 0;
    catalogTree.hidden = visibleCount === 0;
    updateIcons(catalogTree);
  }

  function renderInspector() {
    const page = state.page || getPage(state.current);
    const visibleIndex = Math.max(0, visiblePages.findIndex((item) => item.id === page.id));
    document.getElementById("current-page-icon").innerHTML = icon(page.icon);
    document.getElementById("current-page-title").textContent = page.title;
    document.getElementById("current-page-summary").textContent = page.summary || page.groupTitle;
    document.getElementById("current-page-path").textContent = page.path.join(" / ");
    document.getElementById("coverage-count").textContent = `${visibleIndex + 1} / ${visiblePages.length}`;
    document.getElementById("coverage-fill").style.width = `${((visibleIndex + 1) / visiblePages.length) * 100}%`;
    document.getElementById("stage-path").textContent = page.path.join(" / ");
    document.getElementById("page-count").textContent = visiblePages.length;
    updateIcons(document.getElementById("current-page-icon"));
  }

  function renderControls() {
    root.dataset.theme = state.theme;
    root.dataset.accent = state.accent;
    root.dataset.glass = String(state.glass);
    root.dataset.reducedMotion = String(state.reducedMotion);
    document.querySelectorAll("#theme-control button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.theme === state.theme);
    });
    document.querySelectorAll("#accent-control .swatch").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.accent === state.accent);
    });
    document.querySelectorAll('[data-toggle="glass"]').forEach((button) => {
      button.classList.toggle("is-on", state.glass);
    });
    document.querySelectorAll('[data-toggle="reducedMotion"]').forEach((button) => {
      button.classList.toggle("is-on", state.reducedMotion);
    });
    document.getElementById("engine-state").value = state.engine;
    document.getElementById("network-state").value = state.network;
    document.getElementById("host-state").value = state.host;
    document.getElementById("locale-state").value = state.locale;
    document.getElementById("device-size").value = state.device;
    document.getElementById("agent-training").value = String(Math.round(state.agentTraining));
    document.getElementById("agent-training-value").textContent = `${Math.round(state.agentTraining)}%`;
  }

  function renderAll() {
    renderControls();
    renderCatalog();
    renderInspector();
    renderPhone();
    const activeCatalogPage = catalogTree.querySelector(".catalog-page-button.is-active");
    if (activeCatalogPage) {
      const treeRect = catalogTree.getBoundingClientRect();
      const activeRect = activeCatalogPage.getBoundingClientRect();
      if (activeRect.top < treeRect.top) {
        catalogTree.scrollTop -= treeRect.top - activeRect.top + 8;
      } else if (activeRect.bottom > treeRect.bottom) {
        catalogTree.scrollTop += activeRect.bottom - treeRect.bottom + 8;
      }
    }
  }

  async function handleSendMessage() {
    const input = document.getElementById("chat-input");
    const text = input?.value.trim();
    if (!text) {
      showToast("先输入一条消息", "info");
      return;
    }
    const wasNewChat =
      state.current === "home" ||
      (state.page?.kind === "chat" && state.page?.mode === "empty");
    state.chatDraft = "";
    showToast("消息已发送", "send");
    if (api && state.backendConnected) {
      if (wasNewChat) resetBackendChat();
      state.backendChatActive = true;
      state.backendTimeline.push({
        kind: "userMessage",
        turnId: `pending-${Date.now()}`,
        createdAt: new Date().toISOString(),
        role: "user",
        text,
        status: "inProgress",
        done: false,
      });
      state.backendTyping = true;
      if (wasNewChat) navigate("chat");
      else renderPhone();
      try {
        if (!state.backendSessionId) await startMobileBackendSession();
        const payload = await api.sendTurn({
          sessionId: state.backendSessionId,
          text,
          modelId: state.backendModelId,
          images: [],
          executionTarget: state.executionTarget,
        });
        state.backendTurnId = payload?.turnId || null;
      } catch (error) {
        state.backendTyping = false;
        renderPhone();
        showToast(error.message || "消息发送失败", "circle-alert");
      }
      return;
    }
    state.chatMessages.push(text);
    if (wasNewChat) navigate("chat");
  }

  function handleTerminalCommand() {
    const input = document.getElementById("terminal-input");
    const command = input?.value.trim();
    if (!command) return;
    state.terminalCommandCount += 1;
    const page = state.page;
    page.terminalLines = [
      ...(page.terminalLines || []),
      { type: "prompt", text: command },
      { type: "out", text: `demo:${command} -> ok (${state.terminalCommandCount})` },
    ];
    renderPhone();
  }

  function changeEngine(value) {
    state.engine = value;
    localStorage.setItem("dshgo-atlas-engine", value);
    showToast(
      `引擎状态：${
        value === "running" ? "运行中" : value === "starting" ? "启动中" : value === "error" ? "异常" : "未启动"
      }`,
      value === "error" ? "triangle-alert" : "cpu"
    );
    renderPhone();
  }

  function changeNetwork(value) {
    state.network = value;
    localStorage.setItem("dshgo-atlas-network", value);
    showToast(`网络状态：${value === "online" ? "在线" : value === "reconnecting" ? "重连中" : "离线"}`, "wifi");
    renderPhone();
  }

  function handleKeydown(event) {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      globalSearch.focus();
      return;
    }
    if (event.key === "Escape") {
      if (state.dialog) closeDialog();
      else if (state.skillDetail) {
        state.skillDetail = null;
        renderPhone();
        updateIcons();
      }
      else if (state.skillModal) {
        state.skillModal = null;
        renderPhone();
        updateIcons();
      }
      else if (state.sheet) closeSheet();
      else if (state.catalogOpen) {
        state.catalogOpen = false;
        catalogPanel.classList.remove("is-open");
      } else if (state.inspectorOpen) {
        state.inspectorOpen = false;
        inspectorPanel.classList.remove("is-open");
      }
      return;
    }
    if (event.key === "Enter" && event.target.id === "chat-input" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
    if (event.key === "Enter" && event.target.id === "terminal-input") {
      event.preventDefault();
      handleTerminalCommand();
    }
  }

  function handleDocumentClick(event) {
    if (event.target.closest("#mobile-login-gate")) return;
    const openMainNavTarget = event.target.closest('[data-action="open-main-nav"]');
    if (openMainNavTarget) {
      event.preventDefault();
      openMainNavOverlay();
      return;
    }

    const navTarget = event.target.closest("[data-nav]");
    if (navTarget) {
      event.preventDefault();
      navigate(navTarget.dataset.nav);
      return;
    }

    const accentChoice = event.target.closest("[data-accent-choice]");
    if (accentChoice) {
      event.preventDefault();
      setAccent(accentChoice.dataset.accentChoice);
      showToast("主题色已更新", "palette");
      return;
    }

    const sheetTarget = event.target.closest("[data-sheet]");
    if (sheetTarget) {
      event.preventDefault();
      openSheet(sheetTarget.dataset.sheet);
      return;
    }

    const toastTarget = event.target.closest("[data-toast]");
    if (toastTarget) {
      event.preventDefault();
      showToast(toastTarget.dataset.toast);
      return;
    }

    const segmentTarget = event.target.closest("[data-segment]");
    if (segmentTarget) {
      event.preventDefault();
      const key = segmentTarget.dataset.segment;
      const index = Number(segmentTarget.dataset.segmentIndex);
      state.segments[key] = index;
      renderPhone();
      showToast(`已选择：${segmentTarget.textContent.trim()}`, "circle-check");
      return;
    }

    const toggleTarget = event.target.closest("[data-toggle]");
    if (toggleTarget) {
      event.preventDefault();
      const key = toggleTarget.dataset.toggle;
      if (key === "glass") {
        state.glass = !state.glass;
        localStorage.setItem("dshgo-atlas-glass", String(state.glass));
        renderControls();
        renderPhone();
        showToast(state.glass ? "玻璃模糊已开启" : "玻璃模糊已关闭", "sparkles");
      } else if (key === "reducedMotion") {
        state.reducedMotion = !state.reducedMotion;
        localStorage.setItem("dshgo-atlas-motion", String(state.reducedMotion));
        renderControls();
        renderPhone();
        showToast(state.reducedMotion ? "已减少界面动画" : "界面动画已开启", "waves");
      } else {
        state.toggles[key] = !Boolean(state.toggles[key]);
        toggleTarget.classList.toggle("is-on", state.toggles[key]);
        toggleTarget.setAttribute("aria-pressed", String(state.toggles[key]));
        showToast(state.toggles[key] ? "已开启" : "已关闭", state.toggles[key] ? "circle-check" : "circle-minus");
      }
      return;
    }

    const themeButton = event.target.closest("#theme-control button");
    if (themeButton) {
      setTheme(themeButton.dataset.theme);
      showToast(themeButton.dataset.theme === "dark" ? "已切换到深色" : "已切换到浅色", themeButton.dataset.theme === "dark" ? "moon" : "sun");
      return;
    }

    const accentButton = event.target.closest("#accent-control .swatch");
    if (accentButton) {
      setAccent(accentButton.dataset.accent);
      showToast("主题色已更新", "palette");
      return;
    }

    const workbenchMode = event.target.closest("[data-workbench-mode]");
    if (workbenchMode) {
      event.preventDefault();
      state.workbenchMode = workbenchMode.dataset.workbenchMode;
      renderPhone();
      updateIcons();
      return;
    }

    const skillFilterGroup = event.target.closest("[data-skill-filter-group]");
    if (skillFilterGroup) {
      event.preventDefault();
      const group = skillFilterGroup.dataset.skillFilterGroup;
      state.skillBrowserGroupOpen =
        state.skillBrowserGroupOpen === group ? null : group;
      updateSkillFilterMenus();
      return;
    }

    const skillFilter = event.target.closest("[data-skill-filter]");
    if (skillFilter) {
      event.preventDefault();
      state.skillBrowserFilter = skillFilter.dataset.skillFilter;
      state.skillBrowserGroupOpen = null;
      updateSkillFilterMenus();
      updateSkillBrowserResults();
      return;
    }

    const publishedSkillSelect = event.target.closest(
      "[data-published-skill-select]",
    );
    if (publishedSkillSelect) {
      event.preventDefault();
      const name = publishedSkillSelect.dataset.publishedSkillSelect;
      if (state.publishedSkillSelection.has(name)) {
        state.publishedSkillSelection.delete(name);
      } else {
        state.publishedSkillSelection.add(name);
      }
      const selected = state.publishedSkillSelection.has(name);
      publishedSkillSelect.classList.toggle("is-selected", selected);
      publishedSkillSelect.setAttribute("aria-pressed", String(selected));
      const mark = publishedSkillSelect.querySelector(
        ".published-skill-select-mark",
      );
      if (mark) mark.innerHTML = selected ? icon("check") : "";
      updateIcons(publishedSkillSelect);
      updatePublishedSkillControls();
      return;
    }

    const groupToggle = event.target.closest("[data-group-toggle]");
    if (groupToggle) {
      event.preventDefault();
      const id = groupToggle.dataset.groupToggle;
      if (state.collapsedGroups.has(id)) state.collapsedGroups.delete(id);
      else state.collapsedGroups.add(id);
      renderCatalog();
      return;
    }

    const historyView = event.target.closest("[data-history-view]");
    if (historyView) {
      event.preventDefault();
      state.historyView = historyView.dataset.historyView;
      document.querySelectorAll("[data-history-view]").forEach((button) => {
        const selected = button === historyView;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      applyHistoryFilters();
      return;
    }

    if (event.target.closest("[data-publish-next]")) {
      const name = String(
        state.segments["publish-skill:skillName"] || "",
      ).trim();
      const summary = String(
        state.segments["publish-skill:skillSummary"] || "",
      ).trim();
      if (state.publishStep === 1 && (!name || !summary)) {
        showToast("请先填写技能名称和一句话介绍", "info");
        document.querySelector('[name="skillName"]')?.focus();
        return;
      }
      if (
        state.publishStep === 1 &&
        (state.segments["publish-skill:publishMode"] || "ai") === "ai" &&
        state.segments["publish-skill:ideaSkillCode"] &&
        state.segments["publish-skill:ideaCodeEdited"] !== "true"
      ) {
        fillIdeaSkillScriptFromState();
      }
      if (
        state.publishStep === 2 &&
        (state.segments["publish-skill:publishMode"] || "ai") === "ai" &&
        state.segments["publish-skill:aiGenerated"] !== "true"
      ) {
        const idea = String(
          state.segments["publish-skill:ideaPrompt"] || "",
        ).trim();
        showToast(
          !idea
            ? "请先写下你想做什么"
            : state.segments["publish-skill:ideaQuestionsReady"] !== "true"
              ? "请先完成问答"
              : "请先填入技能脚本",
          "info",
        );
        document
          .querySelector(
            idea
              ? state.segments["publish-skill:ideaQuestionsReady"] === "true"
                ? "[data-fill-idea-script]"
                : "[data-build-idea-questions]"
              : "[data-idea-prompt]",
          )
          ?.focus();
        return;
      }
      if (
        state.publishStep === 2 &&
        (state.segments["publish-skill:publishMode"] || "upload") ===
          "upload" &&
        !String(state.segments["publish-skill:package"] || "").trim()
      ) {
        showToast("请先选择技能包", "info");
        document.querySelector("[data-select-package]")?.focus();
        return;
      }
      state.publishStep = Math.min(3, (state.publishStep || 1) + 1);
      renderPhone();
      updateIcons();
      document.querySelector(".phone-scroll")?.scrollTo({ top: 0 });
      return;
    }
    if (event.target.closest("[data-publish-back]")) {
      state.publishStep = Math.max(1, (state.publishStep || 1) - 1);
      renderPhone();
      updateIcons();
      document.querySelector(".phone-scroll")?.scrollTo({ top: 0 });
      return;
    }
    const publishModeTarget = event.target.closest("[data-publish-mode]");
    if (publishModeTarget) {
      state.segments["publish-skill:publishMode"] =
        publishModeTarget.dataset.publishMode;
      renderPhone();
      updateIcons();
      return;
    }
    if (event.target.closest("[data-build-idea-questions]")) {
      const idea = String(
        state.segments["publish-skill:ideaPrompt"] || "",
      ).trim();
      if (!idea) {
        showToast("先写下你想让 Agent 做什么", "info");
        document.querySelector("[data-idea-prompt]")?.focus();
        return;
      }
      const profile = inferIdeaSkillProfile(idea);
      getIdeaQuestionFields(profile).forEach((field) => {
        delete state.segments[getIdeaAnswerKey(field.id)];
      });
      state.segments["publish-skill:ideaQuestionsReady"] = "true";
      state.segments["publish-skill:skillName"] = profile.title;
      state.segments["publish-skill:skillSummary"] = profile.purpose;
      state.segments["publish-skill:skillCategory"] = inferIdeaCategory(profile);
      delete state.segments["publish-skill:ideaSkillCode"];
      delete state.segments["publish-skill:ideaCodeMarkup"];
      delete state.segments["publish-skill:ideaCodeEdited"];
      state.segments["publish-skill:aiGenerated"] = "false";
      renderPhone();
      updateIcons();
      showToast("已识别想法，继续补充几个问题", "message-circle-question");
      return;
    }
    if (event.target.closest("[data-fill-idea-script]")) {
      const result = fillIdeaSkillScriptFromState();
      if (!result.ok && result.reason === "idea") {
        showToast("先写下你想让 Agent 做什么", "info");
        document.querySelector("[data-idea-prompt]")?.focus();
        return;
      }
      if (!result.ok && result.reason === "answer") {
        showToast(`请填写${result.field.label}`, "info");
        document
          .querySelector(
            `[data-form-field="${getIdeaAnswerKey(result.field.id)}"]`,
          )
          ?.focus();
        return;
      }
      renderPhone();
      updateIcons();
      showToast("脚本已填入，可直接修改彩色文字", "code-2");
      return;
    }
    if (event.target.closest("[data-refill-idea-script]")) {
      const result = fillIdeaSkillScriptFromState();
      if (!result.ok) {
        showToast("问答内容还不完整，请先补充", "info");
        return;
      }
      renderPhone();
      updateIcons();
      showToast("已用最新内容重新填入脚本", "refresh-cw");
      return;
    }
    if (event.target.closest("[data-select-package]")) {
      state.segments["publish-skill:package"] = "我的技能包.zip";
      state.segments["publish-skill:publishMode"] = "upload";
      renderPhone();
      updateIcons();
      showToast("技能包已添加", "package-check");
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      event.preventDefault();
      const action = actionTarget.dataset.action;
      if (action === "back") back();
      else if (action === "close-sheet") closeSheet();
      else if (action === "open-affinity") showAffinityDialog();
      else if (action === "close-dialog") closeDialog();
      else if (action === "new-chat") {
        resetBackendChat();
        state.chatMessages = [];
        navigate("home", { replace: true });
      }
      else if (action === "select-session") {
        selectMobileSession(actionTarget.dataset.sessionId);
      }
      else if (action === "mobile-approval") {
        decideMobileApproval(
          actionTarget.dataset.approvalId,
          actionTarget.dataset.approvalChoice,
        );
      }
      else if (action === "mobile-input-answer") {
        submitMobileInput(actionTarget.dataset.inputId);
      }
      else if (action === "mobile-input-cancel") {
        cancelMobileInput(actionTarget.dataset.inputId);
      }
      else if (action === "open-main-nav") {
        openMainNavOverlay();
      } else if (action === "close-main-nav") {
        state.mainNavOpen = false;
        state.skillModal = null;
        state.skillDetail = null;
        renderPhone();
        updateIcons();
      } else if (action === "open-skill-modal") {
        state.skillModal = actionTarget.dataset.skillModal || "installed";
        state.skillDetail = null;
        state.skillBrowserQuery = "";
        state.skillBrowserFilter = "all";
        state.skillBrowserGroupOpen = null;
        state.installedSkillSelection.clear();
        state.skillMultiSelect = false;
        state.publishedSkillSelection.clear();
        renderPhone();
        updateIcons();
      } else if (action === "close-skill-modal") {
        state.skillModal = null;
        state.skillDetail = null;
        state.skillBrowserGroupOpen = null;
        state.skillDeleteSelection.clear();
        state.installedSkillSelection.clear();
        state.skillMultiSelect = false;
        state.publishedSkillSelection.clear();
        renderPhone();
        updateIcons();
      } else if (action === "open-skill-settings") {
        state.skillModal = "conflict-settings";
        state.skillDetail = null;
        state.skillBrowserGroupOpen = null;
        state.skillDeleteSelection.clear();
        state.installedSkillSelection.clear();
        renderPhone();
        updateIcons();
      } else if (action === "delete-selected-skills") {
        const names = [...state.skillDeleteSelection];
        names.forEach((name) => state.deletedSkills.add(name));
        state.skillDeleteSelection.clear();
        renderPhone();
        updateIcons();
        showToast(
          names.length ? `已删除 ${names.length} 个冲突技能` : "未选择技能",
          "trash-2",
        );
      } else if (action === "toggle-installed-skill") {
        const name = actionTarget.dataset.skillName;
        if (name) {
          const enabled = !isInstalledSkillEnabled(name);
          state.installedSkillEnabled.set(name, enabled);
          const skill = (pages.plugins?.pluginList || []).find(
            (item) => item.name === name,
          );
          const skillId = skill?.raw?.id;
          if (api && state.backendConnected && skillId != null) {
            const request = enabled
              ? api.enableSkill(skillId)
              : api.disableSkill(skillId);
            request.catch((error) => {
              state.installedSkillEnabled.set(name, !enabled);
              renderPhone();
              updateIcons();
              showToast(error.message || "技能状态更新失败", "circle-alert");
            });
          }
          renderPhone();
          updateIcons();
          showToast(
            `${name} · ${enabled ? "已启用" : "已停用"}`,
            enabled ? "circle-check" : "circle-minus",
          );
        }
      } else if (action === "disable-selected-installed") {
        const names = [...state.installedSkillSelection];
        names.forEach((name) =>
          state.installedSkillEnabled.set(name, false),
        );
        if (api && state.backendConnected) {
          const ids = names
            .map(
              (name) =>
                (pages.plugins?.pluginList || []).find(
                  (item) => item.name === name,
                )?.raw?.id,
            )
            .filter((id) => id != null);
          Promise.allSettled(ids.map((id) => api.disableSkill(id))).then(
            (results) => {
              if (results.some((result) => result.status === "rejected")) {
                showToast("部分技能停用失败", "circle-alert");
              }
            },
          );
        }
        state.installedSkillSelection.clear();
        renderPhone();
        updateIcons();
        showToast(
          names.length ? `已停用 ${names.length} 个技能` : "未选择技能",
          "circle-minus",
        );
      } else if (action === "enable-selected-installed") {
        const names = [...state.installedSkillSelection];
        names.forEach((name) => state.installedSkillEnabled.set(name, true));
        if (api && state.backendConnected) {
          const ids = names
            .map(
              (name) =>
                (pages.plugins?.pluginList || []).find(
                  (item) => item.name === name,
                )?.raw?.id,
            )
            .filter((id) => id != null);
          Promise.allSettled(ids.map((id) => api.enableSkill(id))).then(
            (results) => {
              if (results.some((result) => result.status === "rejected")) {
                showToast("部分技能启用失败", "circle-alert");
              }
            },
          );
        }
        state.installedSkillSelection.clear();
        renderPhone();
        updateIcons();
        showToast(
          names.length ? `已启用 ${names.length} 个技能` : "未选择技能",
          "circle-check",
        );
      } else if (action === "toggle-skill-multiselect") {
        state.skillMultiSelect = !state.skillMultiSelect;
        state.publishedSkillSelection.clear();
        renderPhone();
        updateIcons();
      } else if (action === "unpublish-skill") {
        const name = actionTarget.dataset.skillName;
        if (name) {
          state.deletedSkills.add(name);
          state.publishedSkillSelection.delete(name);
          renderPhone();
          updateIcons();
          showToast(`已取消发布 ${name}`, "trash-2");
        }
      } else if (action === "delete-selected-published") {
        const names = [...state.publishedSkillSelection];
        names.forEach((name) => state.deletedSkills.add(name));
        state.publishedSkillSelection.clear();
        renderPhone();
        updateIcons();
        showToast(
          names.length ? `已取消发布 ${names.length} 个技能` : "未选择技能",
          "trash-2",
        );
      } else if (action === "open-hot-skills") {
        state.skillModal = "hot-all";
        state.skillBrowserQuery = "";
        state.skillBrowserFilter = "all";
        state.skillBrowserGroupOpen = null;
        renderPhone();
        updateIcons();
      } else if (action === "open-skill-detail") {
        const source = actionTarget.dataset.skillSource;
        const index = Number(actionTarget.dataset.skillIndex);
        const items =
          source === "market" || source === "hot"
            ? pages["plugin-market"]?.marketItems || []
            : source === "mine"
              ? getMySkillItems()
            : source === "recommended"
              ? pages.skills?.skills || []
              : pages.plugins?.pluginList || [];
        const item = items[index];
        if (item) {
          state.skillDetail = { source, item };
          renderPhone();
          updateIcons();
        }
      } else if (action === "back-skill-detail") {
        state.skillDetail = null;
        renderPhone();
        updateIcons();
      } else if (action === "download-skill") {
        if (state.skillDetail) {
          const title =
            state.skillDetail.item.name || state.skillDetail.item.title || "skill";
          state.downloadedSkills.add(
            `${state.skillDetail.source}:${title}`,
          );
          showToast(`已下载 ${title}`, "download");
        }
      } else if (action === "open-history") {
        state.historyOpen = true;
        state.mainNavOpen = false;
        renderPhone();
        updateIcons();
      } else if (action === "close-history") {
        state.historyOpen = false;
        renderPhone();
        updateIcons();
      } else if (action === "publish-skill") {
        const packageName = String(
          state.segments["publish-skill:package"] || "",
        ).trim();
        const script = String(
          state.segments["publish-skill:ideaSkillCode"] || "",
        ).trim();
        if (!packageName && !script) {
          showToast("请先生成 Skill 脚本", "info");
          document.querySelector("[data-idea-prompt]")?.focus();
          return;
        }
        if (
          !packageName &&
          script &&
          state.segments["publish-skill:ideaCodeEdited"] !== "true"
        ) {
          fillIdeaSkillScriptFromState();
        }
        const name =
          String(state.segments["publish-skill:skillName"] || "").trim() ||
          (packageName ? "我的技能包" : "未命名技能");
        showDialog(
          "发布技能？",
          `即将把“${name}”提交到技能市场。发布前仍会检查权限、资源包和展示内容。`,
          "确认发布",
          action,
        );
      }
      else if (action === "confirm-dialog") {
        const dialogAction = state.dialog?.action;
        const label = state.dialog?.confirmLabel || "继续";
        if (dialogAction === "publish-skill") {
          completeSkillPublish();
        } else if (dialogAction === "logout") {
          const finishLogout = () => {
            localStorage.removeItem("qianbian-mobile-auth");
            window.location.reload();
          };
          if (api && state.backendConnected) {
            api.logout().then(finishLogout, finishLogout);
          } else {
            finishLogout();
          }
        } else {
          closeDialog();
          showToast(`${label} · 前端模拟完成`, "circle-check");
        }
      } else if (action === "send-message") handleSendMessage();
      else if (action === "close-drawer" || action === "close-quick") {
        navigate("chat", { replace: true });
      } else if (action === "locale") {
        state.locale = state.locale === "zh" ? "en" : "zh";
        showToast(state.locale === "zh" ? "界面语言：简体中文" : "Interface language: English", "languages");
      } else if (action === "switch-account") {
        showDialog(
          "切换账号？",
          "切换后当前账号的个人资料与技能空间会保留，可以随时重新登录。",
          "切换账号",
          action,
        );
      } else if (action === "toggle-account-edit") {
        if (state.accountEditing) {
          state.accountEditing = false;
          state.accountDraft = null;
        } else {
          state.accountDraft = { ...state.accountProfile };
          state.accountEditing = true;
        }
        renderPhone();
        updateIcons();
      } else if (action === "save-account-profile") {
        if (state.accountDraft) {
          state.accountProfile = { ...state.accountDraft };
        }
        state.accountEditing = false;
        state.accountDraft = null;
        renderPhone();
        updateIcons();
        showToast("个人资料已保存", "circle-check");
      } else if (action === "open-desktop-version") {
        localStorage.setItem("qianbian-view-preference", "desktop");
        location.replace(new URL("desktop.html", location.href).href);
      } else if (action === "open-devices") {
        state.devicesOpen = true;
        state.pairing = null;
        state.deviceError = "";
        state.deviceEditingId = null;
        state.pairingFormOpen = false;
        state.deviceTasks = [];
        state.deviceTasksLoaded = false;
        state.deviceTasksError = "";
        renderPhone();
        updateIcons();
        if (!api || !state.backendConnected) {
          state.devicesLoaded = true;
          state.deviceError = "设备服务未连接";
          renderPhone();
          updateIcons();
        } else {
          refreshMobileDevices();
        }
      } else if (action === "close-devices") {
        state.devicesOpen = false;
        state.pairing = null;
        state.deviceEditingId = null;
        state.pairingFormOpen = false;
        renderPhone();
        updateIcons();
      } else if (action === "edit-device") {
        const deviceId = actionTarget.dataset.deviceId;
        if (!deviceId) return;
        state.deviceEditingId = deviceId;
        state.deviceError = "";
        renderPhone();
        updateIcons();
        window.requestAnimationFrame(() => {
          phoneScreen
            .querySelector(
              `[data-device-name-input="${CSS.escape(deviceId)}"]`,
            )
            ?.focus();
        });
      } else if (action === "cancel-device-name") {
        state.deviceEditingId = null;
        renderPhone();
        updateIcons();
      } else if (action === "save-device-name") {
        const deviceId = actionTarget.dataset.deviceId;
        const input = phoneScreen.querySelector(
          `[data-device-name-input="${CSS.escape(deviceId || "")}"]`,
        );
        const name = input?.value.trim() || "";
        if (!deviceId || !name) return;
        updateMobileDevice(deviceId, { name }, "设备名称已更新");
      } else if (action === "toggle-device-pause") {
        const deviceId = actionTarget.dataset.deviceId;
        const device = state.devices.find((item) => item.id === deviceId);
        if (!device) return;
        updateMobileDevice(
          deviceId,
          { paused: !device.paused },
          device.paused ? "设备已恢复" : "设备已暂停",
        );
      } else if (action === "start-device-pair") {
        if (!api || !state.backendConnected) {
          showToast("登录后可添加设备", "circle-alert");
          return;
        }
        state.pairingFormOpen = !state.pairingFormOpen;
        state.deviceError = "";
        if (state.pairingFormOpen) {
          state.pairing = null;
          state.pairingType = "windows";
          state.pairingName = "";
        }
        renderPhone();
        updateIcons();
        if (state.pairingFormOpen) {
          window.requestAnimationFrame(() =>
            phoneScreen.querySelector("[data-device-pair-name]")?.focus(),
          );
        }
      } else if (action === "cancel-device-pair") {
        state.pairingFormOpen = false;
        state.deviceError = "";
        renderPhone();
        updateIcons();
      } else if (action === "submit-device-pair") {
        if (!api || !state.backendConnected) {
          showToast("登录后可添加设备", "circle-alert");
          return;
        }
        const form = phoneScreen.querySelector("[data-device-pair-form]");
        const type =
          form?.querySelector("[data-device-pair-type]")?.value === "android"
            ? "android"
            : "windows";
        const name =
          form?.querySelector("[data-device-pair-name]")?.value.trim() || "";
        const payload = { type };
        if (name) payload.name = name;
        api
          .startDevicePairing(payload)
          .then((pairing) => {
            state.pairing = {
              ...pairing,
              type: pairing?.type || type,
            };
            state.pairingFormOpen = false;
            state.pairingName = "";
            renderPhone();
            updateIcons();
          })
          .catch((error) => {
            state.deviceError = error.message || "配对码生成失败";
            renderPhone();
            updateIcons();
          });
      } else if (action === "refresh-device-tasks") {
        refreshMobileDeviceTasks();
      } else if (action === "copy-pair-code") {
        const code = state.pairing?.pairingCode || "";
        if (code) {
          navigator.clipboard?.writeText(code).then(
            () => showToast("配对码已复制", "copy"),
            () => showToast(`配对码：${code}`, "copy"),
          );
        }
      } else if (action === "delete-device") {
        const deviceId = actionTarget.dataset.deviceId;
        if (!deviceId || !api) return;
        api
          .deleteDevice(deviceId)
          .then(() => {
            state.devices = state.devices.filter(
              (device) => device.id !== deviceId,
            );
            state.deviceTasks = state.deviceTasks.filter(
              (task) => task.deviceId !== deviceId,
            );
            applyMobileDevices({ devices: state.devices });
            renderControls();
            renderPhone();
            updateIcons();
            showToast("设备已解绑", "unlink");
          })
          .catch((error) => {
            showToast(error.message || "解绑失败", "circle-alert");
          });
      } else if (action === "logout") {
        showDialog("退出登录？", "本地演示不会真正退出任何账号。", "退出登录", action);
      } else if (action === "restart") {
        showDialog("重启引擎？", "运行中的回复会中断，已完成的内容会保留。", "重启", action);
      } else if (action === "reset") {
        showDialog(
          "重置运行环境？",
          "演示不会删除任何内容。真实 App 中已安装的 Linux 软件会被移除，对话默认保留。",
          "继续",
          action
        );
      } else if (action === "uninstall") {
        showDialog("卸载运行环境？", "演示不会执行删除操作。", "卸载", action);
      } else {
        showToast("前端演示操作已执行", "mouse-pointer-click");
      }
      return;
    }

    const catalogButton = event.target.closest(".catalog-page-button");
    if (catalogButton) {
      navigate(catalogButton.dataset.nav);
    }
  }

  function bindEvents() {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", (event) => {
      if (event.target.closest("input, textarea, [contenteditable='true']")) {
        return;
      }
      event.preventDefault();
    });
    globalSearch.addEventListener("input", () => {
      state.catalogSearch = globalSearch.value;
      renderCatalog();
    });

    document.getElementById("phone-back").addEventListener("click", back);
    document.getElementById("phone-drawer").addEventListener("click", () => {
      state.historyOpen = true;
      state.mainNavOpen = false;
      renderPhone();
      updateIcons();
    });
    document.getElementById("phone-settings").addEventListener("click", () => navigate("settings"));
    document.getElementById("go-all-features").addEventListener("click", () => navigate("session-workbench"));
    document.getElementById("copy-link").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("当前页链接已复制", "link");
      } catch {
        showToast("浏览器未允许剪贴板访问", "triangle-alert");
      }
    });
    document.getElementById("toggle-theme").addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
      showToast(state.theme === "dark" ? "已切换到深色" : "已切换到浅色", state.theme === "dark" ? "moon" : "sun");
    });
    document.getElementById("engine-state").addEventListener("change", (event) => changeEngine(event.target.value));
    document.getElementById("network-state").addEventListener("change", (event) => changeNetwork(event.target.value));
    document.getElementById("host-state").addEventListener("change", (event) => {
      state.host = event.target.value;
      localStorage.setItem("dshgo-atlas-host", state.host);
      showToast(
        `当前主机：${state.host === "phone" ? "这台手机" : state.host === "desktop" ? "工作室电脑" : "远程服务器"}`,
        "server"
      );
      renderPhone();
    });
    document.getElementById("locale-state").addEventListener("change", (event) => {
      state.locale = event.target.value;
      localStorage.setItem("dshgo-atlas-locale", state.locale);
      showToast(state.locale === "zh" ? "界面语言：简体中文" : "Interface language: English", "languages");
    });
    document.getElementById("agent-training").addEventListener("input", (event) => {
      setAgentTraining(event.target.value);
    });
    document.getElementById("agent-training").addEventListener("change", (event) => {
      setAgentTraining(event.target.value, { notify: true });
    });
    document.getElementById("device-size").addEventListener("change", (event) => setDeviceSize(event.target.value));

    const openCatalog = () => {
      state.catalogOpen = !state.catalogOpen;
      catalogPanel.classList.toggle("is-open", state.catalogOpen);
      document.getElementById("mobile-scrim").hidden = !state.catalogOpen && !state.inspectorOpen;
    };
    const openInspector = () => {
      state.inspectorOpen = !state.inspectorOpen;
      inspectorPanel.classList.toggle("is-open", state.inspectorOpen);
      document.getElementById("mobile-scrim").hidden = !state.catalogOpen && !state.inspectorOpen;
    };
    document.getElementById("toggle-catalog").addEventListener("click", openCatalog);
    document.getElementById("close-catalog").addEventListener("click", openCatalog);
    document.getElementById("toggle-inspector").addEventListener("click", openInspector);
    document.getElementById("close-inspector").addEventListener("click", openInspector);
    document.getElementById("mobile-scrim").addEventListener("click", () => {
      state.catalogOpen = false;
      state.inspectorOpen = false;
      catalogPanel.classList.remove("is-open");
      inspectorPanel.classList.remove("is-open");
      document.getElementById("mobile-scrim").hidden = true;
    });

    let swipeStart = null;
    let swipeHoldTimer = null;
    const swipePreviewThreshold = 30;
    phoneScreen.addEventListener("pointerdown", (event) => {
      if (!isConversationSurface()) {
        swipeStart = null;
        return;
      }
      if (event.button !== 0) return;
      if (event.target.closest("button, a, input, textarea, select, [role='button'], [data-no-swipe]")) return;
      window.clearTimeout(swipeHoldTimer);
      swipeStart = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
        canPreview: !state.mainNavOpen && !state.historyOpen && !state.dialog && !state.sheet,
        preview: null,
        width: phoneScreen.clientWidth,
      };
      swipeHoldTimer = window.setTimeout(() => {
        if (!swipeStart || swipeStart.preview) return;
        swipeStart = null;
      }, 450);
    });
    window.addEventListener("pointermove", (event) => {
      if (!isConversationSurface()) return;
      if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;
      const dx = event.clientX - swipeStart.x;
      const dy = event.clientY - swipeStart.y;
      if (
        !swipeStart.preview &&
        swipeStart.canPreview &&
        Math.abs(dx) >= swipePreviewThreshold &&
        Math.abs(dx) > Math.abs(dy) * 1.2
      ) {
        window.clearTimeout(swipeHoldTimer);
        swipeStart.preview = dx < 0 ? "nav" : "history";
        state.mainNavOpen = swipeStart.preview === "nav";
        state.historyOpen = swipeStart.preview === "history";
        renderPhone();
        updateIcons();
      }
      if (!swipeStart.preview) return;
      const overlay = phoneScreen.querySelector(
        swipeStart.preview === "nav" ? ".main-nav-screen" : ".history-screen",
      );
      if (!overlay) return;
      const width =
        swipeStart.preview === "history"
          ? overlay.getBoundingClientRect().width || overlay.offsetWidth
          : swipeStart.width || phoneScreen.clientWidth;
      const offset =
        swipeStart.preview === "nav"
          ? Math.max(0, Math.min(width, width + dx))
          : Math.max(-width, Math.min(0, -width + dx));
      overlay.style.animation = "none";
      overlay.style.transition = "none";
      overlay.style.transform = `translateX(${offset}px)`;
    });
    window.addEventListener("pointerup", (event) => {
      if (!isConversationSurface()) return;
      if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;
      window.clearTimeout(swipeHoldTimer);
      const dx = event.clientX - swipeStart.x;
      const dy = event.clientY - swipeStart.y;
      const preview = swipeStart.preview;
      swipeStart = null;
      if (preview) {
        const accepted = Math.abs(dx) >= 48 && Math.abs(dx) >= Math.abs(dy) * 1.1;
        const overlay = phoneScreen.querySelector(
          preview === "nav" ? ".main-nav-screen" : ".history-screen",
        );
        if (!accepted) {
          state.mainNavOpen = false;
          state.historyOpen = false;
          renderPhone();
          updateIcons();
          return;
        }
        if (overlay) {
          overlay.style.animation = "none";
          overlay.style.transition = "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease";
          overlay.style.transform = "translateX(0)";
          overlay.style.opacity = "1";
          window.setTimeout(() => {
            if (!overlay.isConnected) return;
            overlay.style.animation = "";
            overlay.style.transition = "";
            overlay.style.transform = "";
            overlay.style.opacity = "";
          }, 280);
        }
        return;
      }
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      if (state.historyOpen && dx < 0) {
        state.historyOpen = false;
        renderPhone();
        updateIcons();
      } else if (state.mainNavOpen && dx > 0) {
        state.mainNavOpen = false;
        renderPhone();
        updateIcons();
      } else if (!state.mainNavOpen && !state.dialog && !state.sheet && dx < 0) {
        state.mainNavOpen = true;
        state.historyOpen = false;
        renderPhone();
        updateIcons();
      } else if (!state.historyOpen && !state.dialog && !state.sheet && dx > 0) {
        state.historyOpen = true;
        state.mainNavOpen = false;
        renderPhone();
        updateIcons();
      }
    });
    window.addEventListener("pointercancel", () => {
      window.clearTimeout(swipeHoldTimer);
      if (swipeStart?.preview) {
        state.mainNavOpen = false;
        state.historyOpen = false;
        renderPhone();
        updateIcons();
      }
      swipeStart = null;
    });

    window.addEventListener("resize", fitDevice);
    if (window.ResizeObserver) {
      new ResizeObserver(fitDevice).observe(phoneFit);
    }
    window.addEventListener("popstate", () => {
      const id = parseHash() || "home";
      state.current = isPageVisible(id) ? id : "home";
      state.page = getPage(state.current);
      state.sheet = state.page.kind === "sheet" ? state.page.sheetType || "default" : null;
      state.dialog = null;
      state.mainNavOpen = false;
      state.historyOpen = false;
      renderAll();
    });
  }

  function init() {
    const initial = parseHash() || "home";
    state.current = isPageVisible(initial) ? initial : "home";
    state.page = getPage(state.current);
    state.history = [state.current];
    state.sheet = state.page.kind === "sheet" ? state.page.sheetType || "default" : null;
    root.dataset.theme = state.theme;
    root.dataset.accent = state.accent;
    root.dataset.glass = String(state.glass);
    root.dataset.reducedMotion = String(state.reducedMotion);
    root.style.setProperty("--device-width", `${state.device.split("x")[0]}px`);
    root.style.setProperty("--device-height", `${state.device.split("x")[1]}px`);
    document.getElementById("device-size").value = state.device;
    bindEvents();
    renderControls();
    renderAll();
    commitHash(state.current, true);
    initializeMobileBackend();
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "stroke-width": "1.8",
          "aria-hidden": "true",
        },
      });
    }
  }

  init();
})();
