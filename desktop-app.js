(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const viewScroll = document.getElementById("view-scroll");
  const composerZone = document.getElementById("composer-zone");
  const composerHost = document.getElementById("desktop-composer");
  const sessionList = document.getElementById("session-list");
  const pageTitle = document.getElementById("page-title");
  const breadcrumbCurrent = document.getElementById("breadcrumb-current");
  const commandPalette = document.getElementById("command-palette");
  const commandInput = document.getElementById("command-input");
  const commandResults = document.getElementById("command-results");
  const toastRegion = document.getElementById("toast-region");
  const srStatus = document.getElementById("sr-status");
  const mobileScrim = document.getElementById("mobile-scrim");
  const detailBack = document.getElementById("detail-back");
  const engineLabel = document.querySelector("#engine-status span");
  const profileName = document.getElementById("profile-name");
  const profileSubtitle = document.getElementById("profile-subtitle");
  const railDialogHost = document.getElementById("rail-dialog-host");
  const actionDialogHost = document.getElementById("action-dialog-host");
  const settingsSheetHost = document.getElementById("settings-sheet-host");
  const accountDialogHost = document.getElementById("account-dialog-host");
  const workspaceSwitcher = document.getElementById("workspace-switcher");
  const workspaceList = document.getElementById("workspace-list");
  const desktopUiWidgetHost = document.getElementById("desktop-ui-widget-host");
  const affinityRing = document.getElementById("context-affinity-ring");
  const affinityValue = document.getElementById("context-affinity-value");
  const insightPanelContent = document.getElementById("insight-panel-content");
  const skillMarketLauncher = document.getElementById("skill-market-launcher");
  const sideSearchInput = document.getElementById("side-search-input");
  const sideSearchFilters = document.getElementById("side-search-filters");
  const sideSearchResults = document.getElementById("side-search-results");
  const sidePanelClose = document.getElementById("side-panel-close");
  const ideasPanelHost = document.getElementById("ideas-panel-host");
  const goalsPanelHost = document.getElementById("goals-panel-host");
  const feedPanelHost = document.getElementById("feed-panel-host");
  const libraryPanelHost = document.getElementById("library-panel-host");
  const documentsPanelHost = document.getElementById("documents-panel-host");
  const historyFilter = document.getElementById("history-filter");
  const historyCount = document.getElementById("history-count");
  const backendPromptHost = document.getElementById("backend-prompt-host");
  const api = window.QianbianApi || null;

  const VIEW_META = {
    chat: { title: "新对话", breadcrumb: "新对话" },
    skills: { title: "技能空间", breadcrumb: "技能空间" },
    automation: { title: "自动化", breadcrumb: "自动化" },
    settings: { title: "设置", breadcrumb: "设置" },
  };

  const DEFAULT_ENVIRONMENTS = [
    {
      id: "local",
      name: "工作环境读取失败",
      kind: "local",
      status: "not_configured",
      detail: "无法读取可用工作环境",
    },
  ];

  const MARKET_SKILLS = [
    {
      id: "daily-meals",
      title: "每日餐单",
      description: "按冰箱食材生成一周食谱。",
      icon: "utensils",
      badge: "官方",
      category: "life",
    },
    {
      id: "fridge-manager",
      title: "冰箱管家",
      description: "记录食材保质期并提醒消耗。",
      icon: "refrigerator",
      badge: "已审查",
      category: "life",
    },
    {
      id: "travel-pack",
      title: "旅行打包",
      description: "按天气与行程生成行李清单。",
      icon: "luggage",
      badge: "社区",
      category: "life",
    },
    {
      id: "sleep-rhythm",
      title: "睡眠节律",
      description: "记录作息并给出睡前建议。",
      icon: "moon-star",
      badge: "社区",
      category: "wellness",
    },
    {
      id: "reading-list",
      title: "阅读清单",
      description: "整理想读、在读和读书笔记。",
      icon: "book-open",
      badge: "官方",
      category: "growth",
    },
    {
      id: "focus-tomato",
      title: "专注番茄",
      description: "按任务拆解专注时段并记录干扰。",
      icon: "timer",
      badge: "社区",
      category: "growth",
    },
  ];

  const WORKSPACES = [
    {
      id: "main",
      name: "我的工作区",
      description: "个人项目与日常任务",
      icon: "layers",
    },
    {
      id: "product",
      name: "产品设计",
      description: "方案、流程与原型",
      icon: "pen-tool",
    },
    {
      id: "engineering",
      name: "开发调试",
      description: "代码、测试与运行状态",
      icon: "terminal",
    },
  ];

  const ACCOUNTS = [
    {
      id: "main",
      name: "我的工作区",
      email: "me@qianbian.local",
      description: "个人项目与日常任务",
      avatar: "千",
    },
    {
      id: "product",
      name: "产品设计",
      email: "product@qianbian.local",
      description: "方案、流程与原型",
      avatar: "产",
    },
    {
      id: "engineering",
      name: "开发调试",
      email: "dev@qianbian.local",
      description: "代码、测试与运行状态",
      avatar: "开",
    },
  ];

  const FILE_DETAILS = {
    "desktop.html": {
      type: "页面结构",
      size: "18 KB",
      preview: `<main class="main-workspace">
  <header class="workspace-header">…</header>
  <section class="view-scroll">…</section>
  <section class="composer-zone">…</section>
</main>`,
    },
    "desktop.css": {
      type: "桌面端样式",
      size: "42 KB",
      preview: `.app-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr) 304px;
  height: 100dvh;
}`,
    },
    "desktop-app.js": {
      type: "工作区交互",
      size: "31 KB",
      preview: `const state = {
  view: "chat",
  messages: [],
  composerOpen: false
};`,
    },
    "desktop-cover": {
      type: "图片",
      size: "1.8 MB",
      image: "assets/brand/qianbian-tile.png",
      preview: "桌面工作区的品牌封面素材，用于工作区概览与分享卡片。",
    },
    "theme-tokens": {
      type: "设计令牌",
      size: "12 KB",
      preview: `{
  "accent": "#a62466",
  "canvas": "#f3f5f1",
  "surface": "#ffffff",
  "darkCanvas": "#0d1411"
}`,
    },
    "ui-prototype": {
      type: "HTML 原型",
      size: "46 KB",
      preview: `<main class="desktop-workspace">
  <nav class="workspace-rail">…</nav>
  <aside class="workspace-panel">…</aside>
  <section class="conversation">…</section>
</main>`,
    },
    "weekly-report": {
      type: "产品报告",
      size: "24 页",
      preview: `# 第 47 周产品简报

## 本周结论
- 桌面工作区完成导航升级
- 主题切换与深色样式恢复稳定
- 搜索覆盖会话、文件和目标

## 下周重点
- 继续完善资源预览与文档协作`,
    },
    "content-plan": {
      type: "电子表格",
      size: "8 个工作表",
      preview: `月份,主题,渠道,状态
11 月,桌面工作区发布,产品内,进行中
11 月,Agent 使用技巧,内容社区,待发布
12 月,年度工作流复盘,邮件,草稿`,
    },
    "research-brief": {
      type: "用户研究",
      size: "18 页",
      preview: `# 用户研究工作流总结

用户希望在同一个工作区内完成查找、规划、收集和产出，
避免在会话、文件、目标与报告之间反复切换。`,
    },
  };

  const SESSIONS = [
    {
      id: "design-system",
      title: "桌面端产品结构",
      meta: "刚刚",
      icon: "layout-dashboard",
      messages: [
        {
          role: "user",
          text: "把移动端整理成一套电脑工作区，保留千变的视觉语言。",
        },
        {
          role: "assistant",
          text: "可以先建立三栏工作区：左侧会话导航，中间对话与输入，右侧上下文和任务状态。手机端不需要跟着改。",
        },
      ],
    },
    {
      id: "glass-review",
      title: "玻璃面板细节",
      meta: "12 分钟前",
      icon: "layers-2",
      messages: [
        {
          role: "user",
          text: "添加内容面板需要和输入框连成一体，背景文字不要抢视觉。",
        },
        {
          role: "assistant",
          text: "输入框与面板会共用一条连续玻璃表面。面板向下展开时，输入框自然上移，聊天内容保持不动。",
        },
      ],
    },
    {
      id: "automation-plan",
      title: "每周产品简报",
      meta: "昨天",
      icon: "workflow",
      messages: [
        {
          role: "user",
          text: "帮我整理每周产品动态，并生成可直接发送的简报。",
        },
        {
          role: "assistant",
          text: "我会按产品发布、用户反馈、竞品变化和下周计划四个部分整理。你也可以在自动化页面启用每周一自动执行。",
        },
      ],
    },
    {
      id: "research-notes",
      title: "用户研究摘录",
      meta: "周一",
      icon: "notebook-tabs",
      messages: [
        {
          role: "user",
          text: "把这份访谈整理成用户痛点、行为模式和改进机会。",
        },
        {
          role: "assistant",
          text: "已按三类整理。最明显的共性是：用户希望在任务执行过程中随时看到上下文，而不是频繁切换页面。",
        },
      ],
    },
  ];

  const IDEAS = [
    {
      id: "weekly-review",
      title: "把每周复盘变成 15 分钟例行",
      description:
        "你每周都会整理进度。可以让千变在周五自动汇总完成项、阻塞项和下周重点。",
      tag: "工作节奏",
      icon: "refresh-cw",
      prompt:
        "请帮我设计一套 15 分钟即可完成的每周复盘流程，并在周五主动提醒我执行。",
    },
    {
      id: "focus-block",
      title: "为深度工作预留固定时段",
      description:
        "最近的对话集中在产品设计与实现。建议建立一个无通知的专注区块，并把相关资料提前收拢。",
      tag: "专注",
      icon: "timer-reset",
      prompt:
        "帮我制定一个每天 90 分钟深度工作的安排，包含开始前准备、专注期间规则和结束后的复盘。",
    },
    {
      id: "research-radar",
      title: "建立持续更新的研究雷达",
      description:
        "把用户访谈、竞品变化和行业新闻合并成一条主题线索，每周只保留真正影响决策的内容。",
      tag: "研究",
      icon: "radar",
      prompt:
        "帮我建立一个用户研究雷达，持续收集访谈洞察、竞品变化和行业动态，并每周提炼一次。",
    },
  ];

  const GOALS = [
    {
      id: "daily-learning",
      title: "每天学习 30 分钟",
      description: "AI 产品、交互设计与工程实践交替学习。",
      cadence: "每天",
      progress: 62,
      streak: 7,
      icon: "book-open",
    },
    {
      id: "weekly-exercise",
      title: "每周锻炼 4 次",
      description: "力量训练和低强度有氧结合，保持稳定节奏。",
      cadence: "每周",
      progress: 50,
      streak: 4,
      icon: "dumbbell",
    },
    {
      id: "desktop-rewrite",
      title: "完成桌面工作区改版",
      description: "完成导航、搜索、目标与资源库的核心流程。",
      cadence: "本季度",
      progress: 75,
      streak: 12,
      icon: "monitor-cog",
    },
  ];

  const FEED_ITEMS = [
    {
      id: "agent-workspaces",
      category: "产品",
      source: "千变产品观察",
      time: "18 分钟前",
      title: "Agent 工作区正在从聊天框走向任务台",
      description:
        "会话、文件、目标和产出正在合并为同一个可追踪的工作上下文。",
      icon: "panels-top-left",
      prompt:
        "请结合 Agent 工作区从聊天框走向任务台的趋势，分析我们的桌面工作区下一步应该优先增强什么。",
    },
    {
      id: "ai-design-tools",
      category: "AI",
      source: "AI Product Weekly",
      time: "1 小时前",
      title: "设计工具开始直接理解项目上下文",
      description:
        "新一代工具不再只生成单张界面，而是读取目标、历史决策和组件约束。",
      icon: "sparkles",
      prompt:
        "请总结设计工具理解项目上下文这一趋势，并给出三个对千变桌面端有价值的产品机会。",
    },
    {
      id: "knowledge-work",
      category: "行业",
      source: "Future of Work",
      time: "昨天",
      title: "知识工作者的搜索正在变成行动入口",
      description:
        "搜索不再只返回文档，而是直接连接目标、历史对话与下一步动作。",
      icon: "search-check",
      prompt:
        "请分析搜索从信息入口变成行动入口的趋势，并为千变设计一套可落地的搜索体验。",
    },
  ];

  const TASK_ACTIVITIES = [
    {
      id: "weekly-brief-run",
      title: "每周产品简报",
      description: "汇总产品更新、用户反馈和下周重点。",
      meta: "今天 09:12 · 耗时 42 秒",
      status: "已完成",
      tone: "done",
      icon: "file-check-2",
    },
    {
      id: "library-index-run",
      title: "资源库索引",
      description: "正在为最近生成的图片和文件建立可搜索索引。",
      meta: "已处理 11 / 14 个文件",
      status: "运行中",
      tone: "running",
      icon: "loader-circle",
    },
    {
      id: "daily-backup-run",
      title: "工作区备份",
      description: "创建本地快照并保留最近 7 天版本。",
      meta: "计划于今天 22:00 执行",
      status: "已计划",
      tone: "scheduled",
      icon: "database-backup",
    },
  ];

  const REMINDERS = [
    {
      id: "daily-goal-review",
      title: "复盘今天的目标进度",
      description: "检查学习、锻炼和工作目标，补上下一步动作。",
      time: "今天 15:30",
      cadence: "每天",
      enabled: false,
      icon: "alarm-clock",
    },
    {
      id: "weekly-review-reminder",
      title: "准备每周复盘",
      description: "整理本周完成项、阻塞项和下周重点。",
      time: "周五 17:00",
      cadence: "周一",
      enabled: true,
      icon: "calendar-check",
    },
    {
      id: "inbox-cleanup",
      title: "清理临时会话与草稿",
      description: "处理未完成草稿，保持工作区整洁。",
      time: "每月 1 日",
      cadence: "周日",
      enabled: true,
      icon: "eraser",
    },
  ];

  const MEMORY_ITEMS = [
    {
      id: "communication-style",
      title: "偏好简洁、直接的表达",
      description: "先给结论，再补充必要依据，避免重复铺垫。",
      category: "沟通风格",
      icon: "message-circle",
    },
    {
      id: "work-rhythm",
      title: "上午更适合处理深度工作",
      description: "复杂分析与创作优先安排在上午，下午集中沟通和整理。",
      category: "工作习惯",
      icon: "sunrise",
    },
    {
      id: "product-taste",
      title: "偏好安静、密集、可扫描的工具界面",
      description: "减少装饰，重视层级、快捷操作和长期使用效率。",
      category: "长期偏好",
      icon: "layout-dashboard",
    },
  ];

  const LIBRARY_ITEMS = [
    {
      id: "desktop-cover",
      title: "桌面工作区封面.png",
      type: "image",
      typeLabel: "图片",
      meta: "PNG · 1.8 MB · 今天",
      icon: "image",
    },
    {
      id: "theme-tokens",
      title: "theme-tokens.json",
      type: "code",
      typeLabel: "代码",
      meta: "JSON · 12 KB · 今天",
      icon: "braces",
    },
    {
      id: "ui-prototype",
      title: "desktop-workspace.html",
      type: "file",
      typeLabel: "文件",
      meta: "HTML · 46 KB · 昨天",
      icon: "file-code-2",
    },
  ];

  const DOCUMENT_ITEMS = [
    {
      id: "weekly-report",
      title: "第 47 周产品简报",
      type: "report",
      typeLabel: "报告",
      meta: "24 页 · 今天 09:20",
      icon: "file-chart-column",
    },
    {
      id: "content-plan",
      title: "内容运营月度表格",
      type: "sheet",
      typeLabel: "表格",
      meta: "8 个工作表 · 昨天",
      icon: "table-2",
    },
    {
      id: "research-brief",
      title: "用户研究总结",
      type: "document",
      typeLabel: "文档",
      meta: "18 页 · 周一",
      icon: "file-text",
    },
  ];

  const DEFAULT_PUBLISHED_SKILLS = [
    {
      id: "weekly-grocery-plan",
      title: "一周买菜计划",
      description: "按人数与预算生成采购清单。",
      icon: "shopping-basket",
      category: "life",
      status: "draft",
      updatedAt: "今天 10:20",
    },
    {
      id: "home-organizing-list",
      title: "家庭整理清单",
      description: "按房间拆分清洁与收纳任务。",
      icon: "list-checks",
      category: "life",
      status: "published",
      updatedAt: "昨天 18:40",
    },
  ];

  const SKILLS = [
    {
      id: "guide",
      title: "使用指南",
      icon: "book-open-check",
      description: "按产品使用指南回答功能问题。",
      tags: ["指南", "功能", "帮助"],
    },
    {
      id: "skill-dev",
      title: "技能开发",
      icon: "puzzle",
      description: "创建、检查和调试原生技能。",
      tags: ["技能", "原生", "调试"],
    },
    {
      id: "pet-theme",
      title: "宠物主题",
      icon: "paw-print",
      description: "生成与验证宠物包素材。",
      tags: ["宠物", "素材", "验证"],
    },
    {
      id: "security-review",
      title: "安全审查",
      icon: "shield-check",
      description: "检查输入边界、密钥与权限风险。",
      tags: ["安全", "权限", "检查"],
    },
    {
      id: "product-brief",
      title: "产品方案",
      icon: "notebook-pen",
      description: "整理目标、流程、边界与验收条件。",
      tags: ["需求", "方案", "验收"],
    },
    {
      id: "data-review",
      title: "数据分析",
      icon: "chart-column",
      description: "检查数据质量并提炼趋势。",
      tags: ["数据", "趋势", "报告"],
    },
    {
      id: "design-review",
      title: "设计审查",
      icon: "panels-top-left",
      description: "检查层级、间距和交互状态。",
      tags: ["界面", "体验", "细节"],
    },
    {
      id: "automation",
      title: "流程自动化",
      icon: "workflow",
      description: "把重复步骤组织成可监控的自动流程。",
      tags: ["任务", "触发", "监控"],
    },
  ];

  const AUTOMATIONS = [
    {
      id: "weekly-brief",
      title: "每周产品简报",
      description: "每周一 09:00 汇总产品更新与用户反馈",
      icon: "calendar-clock",
      schedule: "每周一",
      enabled: true,
    },
    {
      id: "pr-review",
      title: "代码变更摘要",
      description: "有新提交时生成变更摘要与风险提示",
      icon: "git-pull-request-arrow",
      schedule: "有提交时",
      enabled: true,
    },
    {
      id: "backup",
      title: "工作区备份",
      description: "每天 22:00 创建本地快照",
      icon: "database-backup",
      schedule: "每天",
      enabled: false,
    },
    {
      id: "release-watch",
      title: "发布检查",
      description: "发布前检查页面、资源和关键交互",
      icon: "rocket",
      schedule: "手动",
      enabled: false,
    },
  ];

  const COMPOSE_ACTIONS = [
    {
      id: "upload-file",
      label: "上传文件",
      description: "文档、表格或代码",
      icon: "upload",
    },
    {
      id: "add-image",
      label: "添加图片",
      description: "当前后端暂不支持图片理解",
      icon: "image",
      disabled: true,
    },
    {
      id: "choose-folder",
      label: "选择文件夹",
      description: "把整个目录加入上下文",
      icon: "folder-open",
    },
    {
      id: "screenshot",
      label: "截取屏幕",
      description: "选择窗口或屏幕区域",
      icon: "scan-line",
    },
    {
      id: "paste-content",
      label: "粘贴内容",
      description: "从剪贴板添加文本",
      icon: "clipboard-paste",
    },
    {
      id: "quote-conversation",
      label: "引用对话",
      description: "引用已有会话或回答",
      icon: "messages-square",
    },
    {
      id: "invoke-skill",
      label: "调用技能",
      description: "选择一种处理能力",
      icon: "sparkles",
    },
    {
      id: "more-actions",
      label: "更多操作",
      description: "打开工作区工具",
      icon: "ellipsis",
    },
  ];

  const TIME_OPTIONS = Array.from({ length: 34 }, (_, index) => {
    const minutes = 6 * 60 + index * 30;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60,
    ).padStart(2, "0")}`;
  });

  const REMINDER_CADENCES = [
    "每天",
    "周一",
    "周二",
    "周三",
    "周四",
    "周五",
    "周六",
    "周日",
  ];

  const DEFAULT_SETTINGS = {
    notifications: true,
    taskNotifications: true,
    sound: false,
    history: true,
    diagnostics: false,
    autoSave: true,
    compactSidebar: false,
    externalLinks: false,
    debug: false,
  };

  const DEFAULT_SETTING_OPTIONS = {
    language: "简体中文",
    startup: "新对话",
    updates: "稳定版",
    "skill-access": "工作区内修改",
    digest: "每天 18:00",
    network: "按需访问",
    context: "128k",
    confirm: "每次确认",
    density: "舒适",
  };

  function readStoredJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  const storedTheme = localStorage.getItem("qianbian-desktop-theme");
  const storedWorkspace = localStorage.getItem("qianbian-desktop-workspace");
  const storedAffinity = Number(localStorage.getItem("dshgo-agent-training"));
  const storedActiveSessionId = localStorage.getItem(
    "qianbian-desktop-active-session",
  );
  const initialActiveSession =
    SESSIONS.find((session) => session.id === storedActiveSessionId) || null;
  const storedInsightTab = localStorage.getItem(
    "qianbian-desktop-insight-tab",
  );
  const initialInsightTab = [
    "skill-config",
    "task-activity",
    "reminders",
    "memory",
  ].includes(storedInsightTab)
    ? storedInsightTab
    : "skill-config";
  const storedSkillFilter = localStorage.getItem(
    "qianbian-desktop-skill-filter",
  );
  const initialSkillFilter = ["all", "enabled", "disabled"].includes(
    storedSkillFilter,
  )
    ? storedSkillFilter
    : "all";
  const initialWorkspace =
    WORKSPACES.find((workspace) => workspace.id === storedWorkspace) ||
    WORKSPACES[0];
  const storedGoalProgress = readStoredJson("qianbian-desktop-goals", {});
  const storedCustomGoalValue = readStoredJson(
    "qianbian-desktop-goal-definitions",
    [],
  );
  const storedCustomGoals = Array.isArray(storedCustomGoalValue)
    ? storedCustomGoalValue
    : [];
  const storedSavedIdeas = readStoredJson(
    "qianbian-desktop-saved-ideas",
    [],
  );
  const storedReadFeed = readStoredJson("qianbian-desktop-read-feed", []);
  const storedReminderState = readStoredJson(
    "qianbian-desktop-reminder-state",
    {},
  );
  const storedMemoryPins = readStoredJson(
    "qianbian-desktop-memory-pins",
    [],
  );
  const storedDisabledSkills = readStoredJson(
    "qianbian-desktop-disabled-skills",
    [],
  );
  const storedDeletedSkills = readStoredJson(
    "qianbian-desktop-deleted-skills",
    [],
  );
  const storedCustomReminderValue = readStoredJson(
    "qianbian-desktop-custom-reminders",
    [],
  );
  const storedCustomMemoryValue = readStoredJson(
    "qianbian-desktop-custom-memories",
    [],
  );
  const storedCustomReminders = Array.isArray(storedCustomReminderValue)
    ? storedCustomReminderValue
    : [];
  const storedCustomMemories = Array.isArray(storedCustomMemoryValue)
    ? storedCustomMemoryValue
    : [];
  const storedReminderOverrides = readStoredJson(
    "qianbian-desktop-reminder-overrides",
    {},
  );
  const storedDeletedReminders = readStoredJson(
    "qianbian-desktop-deleted-reminders",
    [],
  );
  const storedDeletedMemories = readStoredJson(
    "qianbian-desktop-deleted-memories",
    [],
  );
  const storedAccountProfile = readStoredJson(
    "qianbian-desktop-account-profile",
    {},
  );
  const storedDesktopSettings = readStoredJson(
    "qianbian-desktop-settings",
    {},
  );
  const storedSettingOptions = readStoredJson(
    "qianbian-desktop-setting-options",
    {},
  );
  const storedMarketInstalled = readStoredJson(
    "qianbian-desktop-market-installed",
    [],
  );
  const storedPublishedSkillsValue = readStoredJson(
    "qianbian-desktop-published-skills",
    DEFAULT_PUBLISHED_SKILLS,
  );
  const storedPublishedSkills = Array.isArray(storedPublishedSkillsValue)
    ? storedPublishedSkillsValue
    : DEFAULT_PUBLISHED_SKILLS;
  const initialGoals = [...GOALS, ...storedCustomGoals]
    .filter((goal) => goal && goal.id && goal.title)
    .map((goal) => ({
      ...goal,
      progress: Math.min(
        100,
        Math.max(
          0,
          Number(storedGoalProgress[goal.id]?.progress ?? goal.progress ?? 0),
        ),
      ),
      streak: Math.max(
        0,
        Number(storedGoalProgress[goal.id]?.streak ?? goal.streak ?? 0),
      ),
    }));
  const state = {
    view: "chat",
    activeSession: initialActiveSession?.id || null,
    historyPanelQuery: "",
    messages: initialActiveSession
      ? initialActiveSession.messages.map((message) => ({
          ...message,
          role: message.role || "assistant",
          kind:
            message.kind ||
            (message.role === "user" ? "userMessage" : "agentMessage"),
        }))
      : [],
    typing: false,
    draft: localStorage.getItem("qianbian-desktop-draft") || "",
    quotedMessage: null,
    theme: storedTheme === "dark" ? "dark" : "light",
    composerOpen: false,
    composerOpening: false,
    composerClosing: false,
    contextOpen: window.innerWidth > 1280,
    contextTab: "overview",
    workspaceId: initialWorkspace.id,
    workspaceName: initialWorkspace.name,
    workspaceRoot:
      localStorage.getItem("qianbian-workspace-root") ||
      "D:/project/千变/data/workspaces/u14",
    workspaceMenuOpen: false,
    detail: null,
    railDialog: null,
    actionDialog: null,
    paletteOpen: false,
    paletteQuery: "",
    sidePanel: "sessions",
    sidePanelOpen: false,
    sideSearchQuery: "",
    searchFilter: "all",
    panelFilters: {
      goals: "active",
      feed: "all",
      library: "all",
      documents: "all",
      skillConfig: initialSkillFilter,
    },
    goalFormOpen: false,
    goals: initialGoals,
    customGoals: storedCustomGoals,
    savedIdeas: new Set(Array.isArray(storedSavedIdeas) ? storedSavedIdeas : []),
    readFeed: new Set(Array.isArray(storedReadFeed) ? storedReadFeed : []),
    reminderState: Object.fromEntries(
      [...REMINDERS, ...storedCustomReminders].map((reminder) => [
        reminder.id,
        Boolean(
          storedReminderState &&
            Object.prototype.hasOwnProperty.call(
              storedReminderState,
              reminder.id,
            )
            ? storedReminderState[reminder.id]
            : reminder.enabled,
        ),
      ]),
    ),
    memoryPins: new Set(
      Array.isArray(storedMemoryPins) ? storedMemoryPins : [],
    ),
    disabledSkills: new Set(
      Array.isArray(storedDisabledSkills) ? storedDisabledSkills : [],
    ),
    deletedSkills: new Set(
      Array.isArray(storedDeletedSkills) ? storedDeletedSkills : [],
    ),
    skillDeleteMode: false,
    selectedSkills: new Set(),
    settingsTab:
      localStorage.getItem("qianbian-desktop-settings-tab") || "appearance",
    carePrefs: null,
    careEvents: [],
    careSignal: null,
    careLoaded: false,
    careLoading: false,
    careTesting: false,
    careError: "",
    careMessage: "",
    settingsSheetOpen: false,
    insightTab: initialInsightTab,
    skillMarketQuery: "",
    skillMarketFilter: "all",
    skillMarketTab: "market",
    publishedSkills: storedPublishedSkills,
    desktopPublishDraft: {
      name: "",
      summary: "",
      category: "life",
      description: "",
      mode: "upload",
      packageName: "",
      packageFile: null,
      fileName: "skill.js",
      code: "",
      aiIdea: "",
      aiGenerated: false,
    },
    rightDetail: null,
    skillFilter: "all",
    reminderFilter: "all",
    memoryFilter: "all",
    reminderFormOpen: false,
    memoryFormOpen: false,
    customReminders: storedCustomReminders,
    customMemories: storedCustomMemories,
    reminderOverrides:
      storedReminderOverrides &&
      typeof storedReminderOverrides === "object"
        ? storedReminderOverrides
        : {},
    deletedReminders: new Set(
      Array.isArray(storedDeletedReminders) ? storedDeletedReminders : [],
    ),
    deletedMemories: new Set(
      Array.isArray(storedDeletedMemories) ? storedDeletedMemories : [],
    ),
    model: "",
    modelId: "2",
    models: [],
    approvalMode: "onRequest",
    apiAvailable: false,
    apiStatus: null,
    environments: DEFAULT_ENVIRONMENTS.map((environment) => ({
      ...environment,
    })),
    executionTarget: "local",
    devices: [],
    devicesLoaded: false,
    devicePairing: null,
    deviceError: "",
    deviceEditingId: null,
    devicePairingFormOpen: false,
    devicePairType: "windows",
    devicePairName: "",
    devicePermissionId: null,
    devicePermissions: null,
    devicePermissionsLoading: false,
    devicePermissionsSaving: false,
    devicePermissionsError: "",
    deviceAudit: [],
    deviceAuditLoading: false,
    deviceRevision: 0,
    deviceTasks: [],
    deviceTasksLoaded: false,
    deviceTasksLoading: false,
    deviceTasksError: "",
    sessionLoading: false,
    activeTurnId: null,
    uiWidgets: [],
    uiWidgetsStatus: "idle",
    uiWidgetsError: "",
    uiWidgetData: new Map(),
    uiWidgetRefreshTimers: new Map(),
    uiWidgetActiveId: null,
    pendingApprovals: [],
    pendingInputs: [],
    backendAutomations: [],
    automationsState: "demo",
    contextUsage: null,
    tokenUsage: null,
    questionSelections: new Map(),
    agentTraining: 0,
    currentAccountId: storedAccountProfile.accountId || "main",
    accountName:
      storedAccountProfile.name ||
      ACCOUNTS.find(
        (account) => account.id === storedAccountProfile.accountId,
      )?.name ||
      ACCOUNTS[0].name,
    accountEmail:
      storedAccountProfile.email || ACCOUNTS[0].email,
    accountBio:
      storedAccountProfile.bio || "关注产品设计、工程实践与长期成长。",
    accountAvatar:
      storedAccountProfile.avatar || "assets/brand/qianbian-tile.png",
    accountPhone: storedAccountProfile.phone || "",
    accountRole: storedAccountProfile.role || "产品与设计",
    accountCompany: storedAccountProfile.company || "千变实验室",
    accountLocation: storedAccountProfile.location || "",
    accountLocationAuto: storedAccountProfile.locationAuto !== false,
    accountTimezone:
      storedAccountProfile.timezone || "Asia/Shanghai",
    accountLanguage: storedAccountProfile.language || "简体中文",
    accountDialogOpen: false,
    accountSwitchOpen: false,
    loggedIn: storedAccountProfile.loggedIn !== false,
    marketInstalled: new Set(
      Array.isArray(storedMarketInstalled) ? storedMarketInstalled : [],
    ),
    voiceRecording: false,
    voiceStarting: false,
    voiceSeconds: 0,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(storedDesktopSettings &&
      typeof storedDesktopSettings === "object"
        ? storedDesktopSettings
        : {}),
    },
    settingOptions: {
      ...DEFAULT_SETTING_OPTIONS,
      ...(storedSettingOptions &&
      typeof storedSettingOptions === "object"
        ? storedSettingOptions
        : {}),
    },
    automationEnabled: new Map(
      AUTOMATIONS.map((automation) => [automation.id, automation.enabled]),
    ),
    toasts: [],
  };

  if (
    ![
      "general",
      "appearance",
      "skills",
      "notifications",
      "privacy",
      "advanced",
      "care",
    ].includes(state.settingsTab)
  ) {
    state.settingsTab = "appearance";
  }

  let closeTimer = null;
  let typingTimer = null;
  let voiceTimer = null;
  let voiceStream = null;
  let mediaRecorder = null;
  let lastWideLayout = window.innerWidth > 1280;
  let viewportRenderFrame = 0;
  let streamTextFrame = 0;
  let scrollFrame = 0;
  let scrollTimer = null;
  let lastScrollAt = 0;
  const pendingStreamItemIds = new Set();
  let skillSearchTimer = null;
  let settingsSheetEntering = false;
  let skillMarketEntering = false;
  let accountDialogEntering = false;
  let deviceTaskRefreshTimer = null;

  function getActiveSkills() {
    const installedMarketSkills = MARKET_SKILLS.filter(
      (skill) =>
        state.marketInstalled.has(skill.id) &&
        !state.deletedSkills.has(skill.id) &&
        !SKILLS.some((installed) => installed.id === skill.id),
    ).map((skill) => ({
      id: skill.id,
      title: skill.title,
      description: skill.description,
      icon: skill.icon,
      tags: [skill.badge, "技能市场"],
      market: true,
    }));
    return [
      ...SKILLS.filter((skill) => !state.deletedSkills.has(skill.id)),
      ...installedMarketSkills,
    ];
  }

  function getAllReminders() {
    return [...REMINDERS, ...state.customReminders]
      .filter((reminder) => !state.deletedReminders.has(reminder.id))
      .map((reminder) => ({
        ...reminder,
        ...(state.reminderOverrides[reminder.id] || {}),
      }));
  }

  function getAllMemories() {
    return [...MEMORY_ITEMS, ...state.customMemories].filter(
      (memory) => !state.deletedMemories.has(memory.id),
    );
  }

  function icon(name, className = "") {
    return `<i data-lucide="${name}"${className ? ` class="${className}"` : ""}></i>`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderTimeOptions(selectedValue) {
    const match = String(selectedValue || "").match(/\b([01]\d|2[0-3]):[0-5]\d\b/);
    const selected = match?.[0] || "09:00";
    return TIME_OPTIONS.map(
      (time) =>
        `<option value="${time}" ${time === selected ? "selected" : ""}>${time}</option>`,
    ).join("");
  }

  function renderCadencePicker(scope, selectedValue) {
    const selected = String(selectedValue || "每天")
      .split(/[、,，]/)
      .map((value) => value.trim())
      .filter((value) => REMINDER_CADENCES.includes(value));
    const values = selected.length ? selected : ["每天"];
    const inputId =
      scope === "detail" ? "detail-reminder-cadence" : "reminder-cadence";
    return `
      <div class="cadence-picker" data-cadence-picker="${scope}">
        <input id="${inputId}" type="hidden" value="${escapeHtml(values.join("、"))}" />
        ${REMINDER_CADENCES.map(
          (cadence) => `
            <button
              class="cadence-chip ${values.includes(cadence) ? "is-active" : ""}"
              data-cadence-option="${cadence}"
              type="button"
              aria-pressed="${values.includes(cadence)}"
            >${cadence}</button>
          `,
        ).join("")}
      </div>
    `;
  }

  function formatParagraphs(text) {
    return String(text)
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  }

  function formatMessageContent(message) {
    if (message.role === "user") return formatParagraphs(message.text);
    if (window.QianbianMarkdown?.render) {
      return window.QianbianMarkdown.render(message.text);
    }
    return formatParagraphs(message.text);
  }

  function getDetailInfo(detail) {
    if (!detail) return null;
    const skill = detail.id
      ? getActiveSkills().find((item) => item.id === detail.id)
      : null;
    const automation = detail.id
      ? getVisibleAutomations().find((item) => item.id === detail.id)
      : null;
    const action = detail.id
      ? COMPOSE_ACTIONS.find((item) => item.id === detail.id)
      : null;
    const file = detail.id ? FILE_DETAILS[detail.id] : null;
    const generatedItem = detail.id
      ? [...LIBRARY_ITEMS, ...DOCUMENT_ITEMS].find(
          (item) => item.id === detail.id,
        )
      : null;
    const meta = {
      model: { title: "模型与运行方式", label: "模型" },
      workspace: { title: "工作区详情", label: "工作区" },
      skillNew: { title: "新建技能", label: "技能" },
      skillDetail: { title: skill?.title || "技能详情", label: "技能" },
      automationNew: { title: "新建自动化", label: "自动化" },
      automationDetail: {
        title: automation?.title || "自动化详情",
        label: "自动化",
      },
      file: {
        title: generatedItem?.title || detail.id || "文件详情",
        label: generatedItem?.typeLabel || "文件",
      },
      voice: { title: "语音输入", label: "输入" },
      action: { title: action?.label || "添加上下文", label: "添加内容" },
    }[detail.type];
    return meta
      ? { ...meta, skill, automation, action, file }
      : { title: "详情", label: "工作区" };
  }

  function updateIcons(target = document) {
    if (window.lucide) {
      window.lucide.createIcons({
        root: target,
        attrs: {
          "stroke-width": "1.8",
          "aria-hidden": "true",
        },
      });
    }
  }

  function announce(message) {
    srStatus.textContent = "";
    window.requestAnimationFrame(() => {
      srStatus.textContent = message;
    });
  }

  function showToast(message, iconName = "circle-check") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `${icon(iconName)}<span>${escapeHtml(message)}</span>`;
    toastRegion.append(toast);
    updateIcons(toast);
    window.setTimeout(() => toast.remove(), 2300);
    announce(message);
  }

  function persistSettingsState() {
    localStorage.setItem(
      "qianbian-desktop-settings",
      JSON.stringify(state.settings),
    );
    localStorage.setItem(
      "qianbian-desktop-setting-options",
      JSON.stringify(state.settingOptions),
    );
    localStorage.setItem(
      "qianbian-desktop-settings-tab",
      state.settingsTab,
    );
  }

  function syncChrome() {
    root.dataset.theme = state.theme;
    root.dataset.accent = "a62466";
    root.lang = state.settingOptions.language === "English" ? "en" : "zh-CN";
    body.dataset.density = state.settingOptions.density;
    body.classList.toggle(
      "compact-sidebar",
      Boolean(state.settings.compactSidebar),
    );
    body.classList.toggle("workspace-panel-open", state.sidePanelOpen);
    body.classList.toggle(
      "context-open",
      state.contextOpen && window.innerWidth <= 1280,
    );
    body.classList.toggle(
      "context-closed",
      !state.contextOpen && window.innerWidth > 1280,
    );
    if (state.sidePanelOpen && window.innerWidth <= 900) {
      mobileScrim.hidden = false;
    } else if (!body.classList.contains("sidebar-open")) {
      mobileScrim.hidden = true;
    }
    const themeIcon = state.theme === "dark" ? "sun" : "moon";
    document.getElementById("theme-toggle").innerHTML = icon(themeIcon);
    document.getElementById("theme-toggle").setAttribute(
      "aria-label",
      state.theme === "dark" ? "切换浅色模式" : "切换深色模式",
    );
    const contextToggle = document.getElementById("context-toggle");
    if (contextToggle) {
      contextToggle.setAttribute(
        "aria-expanded",
        String(state.contextOpen && window.innerWidth <= 1280),
      );
      contextToggle.setAttribute(
        "aria-label",
        state.contextOpen ? "关闭任务与配置" : "打开任务与配置",
      );
    }
    const skillCount = document.getElementById("skill-count");
    if (skillCount) skillCount.textContent = String(getActiveSkills().length);
    detailBack.hidden = true;
    if (engineLabel) engineLabel.textContent = state.model || "未选择模型";
    if (profileName) profileName.textContent = state.workspaceName;
    if (profileSubtitle) profileSubtitle.textContent = state.accountName;
    renderSidebarEnvironment();
  }

  function renderWorkspaceSwitcher() {
    if (!workspaceSwitcher) return;
    workspaceSwitcher.hidden = !state.workspaceMenuOpen;
    if (!state.workspaceMenuOpen) return;
    workspaceList.innerHTML = WORKSPACES.map(
      (workspace) => `
        <button class="workspace-option ${workspace.id === state.workspaceId ? "is-active" : ""}" data-workspace="${workspace.id}" type="button">
          <span class="workspace-option-icon">${icon(workspace.icon)}</span>
          <span class="workspace-option-copy">
            <strong>${escapeHtml(workspace.name)}</strong>
            <small>${escapeHtml(workspace.description)}</small>
          </span>
          ${workspace.id === state.workspaceId ? icon("check", "workspace-check") : ""}
        </button>
      `,
    ).join("");
    updateIcons(workspaceSwitcher);
  }

  function formatBackendTime(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "刚刚";
    const diff = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    if (hours < 48) return "昨天";
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      month: "numeric",
      day: "numeric",
    });
  }

  function formatBackendDateTime(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "稍后";
    return new Date(timestamp).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function mapBackendSession(session) {
    return {
      id: String(session.sessionId ?? session.id),
      title: session.title || "新对话",
      meta: formatBackendTime(session.updatedAt || session.createdAt),
      icon: "message-square",
      messages: [],
      raw: session,
    };
  }

  function mapBackendAutomation(automation) {
    const schedule =
      automation.cron ||
      (automation.everyMinutes
        ? `每 ${automation.everyMinutes} 分钟`
        : "手动");
    return {
      id: String(automation.automationId || automation.id),
      title: automation.name || automation.title || "未命名自动化",
      description: automation.prompt || automation.description || "",
      icon: "workflow",
      schedule,
      enabled: automation.enabled !== false,
    };
  }

  function applyBackendEnvironments(payload) {
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
    const selected = environments.find(
      (environment) =>
        environment.id === state.executionTarget &&
        environment.status === "ready",
    );
    state.executionTarget =
      selected?.id ||
      environments.find((environment) => environment.status === "ready")?.id ||
      "local";
  }

  function applyBackendDevices(payload) {
    const devices = Array.isArray(payload?.devices)
      ? payload.devices
          .filter((device) => device?.id)
          .map(normalizeDevice)
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
    if (
      !state.environments.some(
        (environment) =>
          environment.id === state.executionTarget &&
          environment.status === "ready",
      )
    ) {
      state.executionTarget =
        state.environments.find(
          (environment) => environment.status === "ready",
        )?.id || "local";
    }
  }

  async function refreshBackendDevices() {
    if (!api || !state.apiAvailable) return;
    state.deviceError = "";
    const revision = state.deviceRevision;
    try {
      const payload = await api.devices();
      if (revision === state.deviceRevision) {
        applyBackendDevices(payload);
      }
    } catch (error) {
      state.devicesLoaded = true;
      state.deviceError = error.message || "设备列表读取失败";
    }
    render();
  }

  function normalizeDevice(device) {
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
    const parsedCapabilities = parseDeviceJson(
      device.capabilitiesJson || device.capabilities,
      [],
    );
    const parsedPermissions = parseDeviceJson(
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

  function parseDeviceJson(value, fallback) {
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

  function deviceStateLabel(device) {
    if (device?.paused || device?.status === "paused") return "已暂停";
    return device?.status === "online" ? "在线" : "离线";
  }

  function connectorPageUrl() {
    const url = new URL("connectors.html", location.href);
    try {
      const configured =
        new URL(location.href).searchParams.get("api") ||
        localStorage.getItem("qianbian-api-base");
      if (configured) url.searchParams.set("api", configured);
    } catch {}
    return url.href;
  }

  function mergeDevicePatch(device, patch) {
    const next = { ...device, ...patch };
    if (next.paused === true && next.status === "online") {
      next.status = "paused";
    } else if (next.paused === false && next.status === "paused") {
      next.status = "online";
    }
    return normalizeDevice(next);
  }

  function updateBackendDevice(deviceId, patch, successMessage) {
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
              ? normalizeDevice(updated)
              : mergeDevicePatch(device, patch)
            : device,
        );
        applyBackendDevices({ devices });
        state.deviceEditingId = null;
        renderAccountDialog();
        renderComposer();
        renderContext();
        syncChrome();
        showToast(successMessage, "circle-check");
      })
      .catch((error) => {
        state.deviceError = error.message || "设备操作失败";
        renderAccountDialog();
        showToast(state.deviceError, "circle-alert");
      });
  }

  async function refreshBackendDeviceTasks({ silent = false } = {}) {
    if (!api || !state.apiAvailable || state.deviceTasksLoading) return;
    if (!state.devices.length) {
      state.deviceTasks = [];
      state.deviceTasksLoaded = true;
      state.deviceTasksError = "";
      if (state.accountDialogOpen) renderAccountDialog();
      return;
    }
    const taskUtils = window.QianbianDeviceTasks;
    if (!taskUtils) return;
    state.deviceTasksLoading = true;
    state.deviceTasksError = "";
    if (!silent) renderAccountDialog();
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
    if (
      state.accountDialogOpen &&
      !state.deviceEditingId &&
      !state.devicePairingFormOpen
    ) {
      renderAccountDialog();
    }
  }

  function stopBackendDeviceTaskPolling() {
    if (!deviceTaskRefreshTimer) return;
    window.clearInterval(deviceTaskRefreshTimer);
    deviceTaskRefreshTimer = null;
  }

  function startBackendDeviceTaskPolling() {
    stopBackendDeviceTaskPolling();
    deviceTaskRefreshTimer = window.setInterval(() => {
      if (
        !state.accountDialogOpen ||
        !state.devices.length ||
        state.deviceEditingId ||
        state.devicePairingFormOpen
      ) {
        return;
      }
      refreshBackendDeviceTasks({ silent: true });
    }, 4000);
  }

  function currentEnvironment() {
    return (
      state.environments.find(
        (environment) => environment.id === state.executionTarget,
      ) ||
      state.environments[0] ||
      DEFAULT_ENVIRONMENTS[0]
    );
  }

  function environmentOptions() {
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
        return `<option value="${escapeHtml(environment.id)}" ${unavailable ? "disabled" : ""} ${environment.id === state.executionTarget ? "selected" : ""}>${escapeHtml(environment.name + suffix)}</option>`;
      })
      .join("");
  }

  function renderSidebarEnvironment() {
    const host = document.getElementById("sidebar-environment-host");
    if (!host) return;
    const environment = currentEnvironment();
    host.innerHTML = `
      <label class="sidebar-environment" title="${escapeHtml(
        environment.detail || "工作环境",
      )}">
        ${icon(environment.kind === "cloud" ? "cloud" : "monitor")}
        <select id="desktop-environment-select" aria-label="工作环境">
          ${environmentOptions()}
        </select>
      </label>
    `;
    updateIcons(host);
    host
      .querySelector("#desktop-environment-select")
      ?.addEventListener("change", (event) => {
        setExecutionTarget(event.target.value);
      });
  }

  function setExecutionTarget(id) {
    const environment = state.environments.find(
      (candidate) => candidate.id === String(id),
    );
    if (!environment || environment.status !== "ready") return;
    state.executionTarget = environment.id;
    renderComposer();
    renderContext();
    syncChrome();
  }

  function getVisibleAutomations() {
    return state.apiAvailable && state.automationsState === "ready"
      ? state.backendAutomations
      : AUTOMATIONS;
  }

  function replaceBackendSessions(list) {
    const mapped = (Array.isArray(list) ? list : [])
      .filter((session) => session && (session.sessionId || session.id))
      .map(mapBackendSession);
    SESSIONS.splice(0, SESSIONS.length, ...mapped);
  }

  function mapBackendTimelineItem(item) {
    if (!item) return null;
    if (["userMessage", "agentMessage"].includes(item.kind)) {
      return {
        kind: item.kind,
        role: item.kind === "userMessage" ? "user" : "assistant",
        text: item.text || "",
        itemId: item.itemId ? String(item.itemId) : undefined,
        turnId: item.turnId ? String(item.turnId) : "",
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

  function extractBackendItems(payload) {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.history?.items)) return payload.history.items;
    return [];
  }

  function hydrateTimelineFromBackend(payload) {
    return extractBackendItems(payload)
      .map(mapBackendTimelineItem)
      .filter(Boolean);
  }

  function preserveLocalUserMessages(hydrated, existing) {
    if (!hydrated.length) return existing;
    const localOnly = existing.filter(
      (message) =>
        message.role === "user" &&
        !message.itemId &&
        !hydrated.some(
          (item) => item.role === "user" && item.text === message.text,
        ),
    );
    return [...hydrated, ...localOnly];
  }

  function upsertBackendTimelineItem(item) {
    const mapped = mapBackendTimelineItem(item);
    if (!mapped) return;
    if (!mapped.turnId && state.activeTurnId) {
      mapped.turnId = String(state.activeTurnId);
    }
    const itemId = mapped.itemId;
    let index = itemId
      ? state.messages.findIndex((message) => message.itemId === itemId)
      : -1;
    if (
      index < 0 &&
      mapped.role === "user" &&
      state.messages.at(-1)?.role === "user" &&
      !state.messages.at(-1)?.itemId &&
      state.messages.at(-1)?.text === mapped.text
    ) {
      index = state.messages.length - 1;
    }
    if (index >= 0) {
      state.messages[index] = { ...state.messages[index], ...mapped };
    } else {
      state.messages.push(mapped);
    }
    if (mapped.kind === "agentMessage" && mapped.done) {
      state.typing = false;
    }
    render();
  }

  function syncBackendModels(payload) {
    const models = Array.isArray(payload?.models) ? payload.models : [];
    if (!models.length) return;
    state.models = models.map((model) => ({
      modelId: String(model.modelId ?? model.id),
      label: model.label || model.name || "未命名模型",
      isDefault: Boolean(model.isDefault),
    }));
    const selected =
      state.models.find((model) => model.modelId === state.modelId) ||
      state.models.find((model) => model.isDefault) ||
      state.models[0];
    state.modelId = selected.modelId;
    state.model = selected.label;
  }

  function normalizeBackendSkill(skill, scope = "market") {
    const id = String(skill.id ?? skill.skillId ?? skill.name);
    const badgeLabels = {
      official: "官方",
      reviewed: "已审查",
      community: "社区",
    };
    return {
      id,
      title: skill.displayName || skill.name || "未命名技能",
      name: skill.name || skill.displayName || id,
      description: skill.description || "暂无技能说明。",
      icon: scope === "market" ? "puzzle" : "sparkles",
      badge:
        badgeLabels[skill.badge] ||
        skill.author ||
        skill.category ||
        "技能",
      category: skill.category || "growth",
      tags: [
        skill.category,
        skill.version,
        badgeLabels[skill.badge] || skill.author,
      ].filter(Boolean),
      installed: Boolean(skill.installed),
      enabled: skill.enabled !== false,
      version: skill.version || "",
      risk: skill.risk || "low",
      permissions: Array.isArray(skill.permissions) ? skill.permissions : [],
      raw: skill,
    };
  }

  function skillCategoryLabel(category) {
    const labels = {
      all: "全部",
      development: "开发",
      data: "数据",
      life: "生活",
      wellness: "健康",
      growth: "成长",
      office: "办公",
      design: "设计",
      general: "通用",
      productivity: "效率",
      research: "研究",
      automation: "自动化",
    };
    return labels[category] || category || "其他";
  }

  function applyBackendSkills({ market, installed, mine }) {
    const marketSkills = Array.isArray(market?.skills)
      ? market.skills.map((skill) => normalizeBackendSkill(skill, "market"))
      : [];
    if (marketSkills.length) {
      MARKET_SKILLS.splice(0, MARKET_SKILLS.length, ...marketSkills);
    }
    state.marketInstalled = new Set(
      marketSkills
        .filter((skill) => skill.installed)
        .map((skill) => skill.id),
    );
    const installedSkills = Array.isArray(installed?.skills)
      ? installed.skills.map((skill) =>
          normalizeBackendSkill(skill, "installed"),
        )
      : [];
    if (installedSkills.length || installed) {
      SKILLS.splice(0, SKILLS.length, ...installedSkills);
      state.disabledSkills = new Set(
        installedSkills
          .filter((skill) => !skill.enabled)
          .map((skill) => skill.id),
      );
    }
    const mineSkills = Array.isArray(mine?.skills)
      ? mine.skills.map((skill) => ({
          id: String(skill.id ?? skill.skillId ?? skill.name),
          title: skill.displayName || skill.name || "未命名技能",
          description: skill.description || "暂无技能说明。",
          icon: "package-check",
          category: skill.category || "life",
          status: skill.status || skill.reviewStatus || "pending",
          updatedAt: formatBackendTime(skill.updatedAt),
          raw: skill,
        }))
      : [];
    if (mineSkills.length || mine) state.publishedSkills = mineSkills;
  }

  function renderBackendApprovalContext(approval) {
    const target =
      approval.executionTarget && typeof approval.executionTarget === "object"
        ? approval.executionTarget
        : {};
    const targetId = String(
      typeof approval.executionTarget === "object"
        ? target.deviceId || target.id || approval.deviceId || ""
        : approval.executionTarget || approval.deviceId || "",
    );
    const targetDevice = state.devices.find(
      (device) => device.id === targetId,
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
    return `<div class="backend-prompt-context">${tags.join("")}</div>`;
  }

  function renderBackendPrompts() {
    if (!backendPromptHost) return;
    const approvalCards = state.pendingApprovals.map((approval) => {
      const subject =
        typeof approval.subject === "string"
          ? approval.subject
          : approval.subject?.summary ||
            JSON.stringify(approval.subject || {});
      return `
        <article class="backend-prompt-card" data-backend-approval="${escapeHtml(String(approval.approvalId))}">
          <div class="backend-prompt-head">
            <div>
              <span>需要确认</span>
              <strong>${escapeHtml(approval.toolName || "工具操作")}</strong>
            </div>
            ${icon("shield-alert")}
          </div>
          <p class="backend-prompt-copy">${escapeHtml(subject)}</p>
          ${renderBackendApprovalContext(approval)}
          <div class="backend-prompt-actions">
            ${(approval.availableChoices || [])
              .map(
                (choice) => `
                  <button
                    class="${choice.decision === "approved" ? "primary-button" : "secondary-button"}"
                    data-approval-id="${escapeHtml(String(approval.approvalId))}"
                    data-approval-choice="${escapeHtml(String(choice.choiceId))}"
                    type="button"
                  >${escapeHtml(choice.label || choice.choiceId)}</button>
                `,
              )
              .join("")}
          </div>
        </article>
      `;
    });
    const inputCards = state.pendingInputs.map(
      (request) => `
        <article class="backend-prompt-card" data-backend-input="${escapeHtml(String(request.userInputId))}">
          <div class="backend-prompt-head">
            <div>
              <span>需要回答</span>
              <strong>千变需要补充信息</strong>
            </div>
            ${icon("message-circle-question")}
          </div>
          ${(request.questions || [])
            .map(
              (question) => `
                <div class="backend-prompt-question">
                  <strong>${escapeHtml(question.header || question.question || "请选择")}</strong>
                  <p class="backend-prompt-copy">${escapeHtml(question.question || "")}</p>
                  <select data-backend-question="${escapeHtml(String(question.id))}">
                    ${(question.options || [])
                      .map(
                        (option) =>
                          `<option value="${escapeHtml(String(option.label))}">${escapeHtml(String(option.label))}</option>`,
                      )
                      .join("")}
                  </select>
                </div>
              `,
            )
            .join("")}
          <div class="backend-prompt-actions">
            <button class="secondary-button" data-input-cancel="${escapeHtml(String(request.userInputId))}" type="button">取消</button>
            <button class="primary-button" data-input-submit="${escapeHtml(String(request.userInputId))}" type="button">${icon("send")}提交回答</button>
          </div>
        </article>
      `,
    );
    backendPromptHost.innerHTML = [...approvalCards, ...inputCards].join("");
    updateIcons(backendPromptHost);
  }

  const SESSION_SCOPED_MSP_METHODS = new Set([
    "turn/started",
    "turn/completed",
    "item/started",
    "item/delta",
    "item/completed",
    "approval/requested",
    "approval/resolved",
    "userInput/requested",
    "userInput/settled",
    "session/tokenUsage",
    "session/contextUsage",
  ]);
  function handleBackendEvent(method, params = {}) {
    const eventSessionId = params.sessionId || params.session?.sessionId;
    if (SESSION_SCOPED_MSP_METHODS.has(method)) {
      // 会话级事件必须带 sessionId 且等于当前会话；缺 sessionId 一律丢弃，避免串话
      if (
        !eventSessionId ||
        !state.activeSession ||
        String(eventSessionId) !== String(state.activeSession)
      ) {
        return;
      }
    }
    if (method === "turn/started") {
      state.activeTurnId = params.turnId || null;
      state.typing = true;
      render();
      return;
    }
    if (method === "item/started") {
      upsertBackendTimelineItem(params.item);
      return;
    }
    if (method === "item/delta") {
      const itemId = String(params.itemId || "");
      if (params.field !== "text") {
        const activity = state.messages.find(
          (item) => item.itemId === itemId,
        );
        if (activity) {
          if (params.field === "output") {
            activity.visibleOutput = `${activity.visibleOutput || ""}${params.delta || ""}`;
          } else {
            activity.summaryText = `${activity.summaryText || ""}${params.delta || ""}`;
          }
          render();
        }
        return;
      }
      let message = state.messages.find(
        (item) => item.itemId && item.itemId === itemId,
      );
      let created = false;
      if (!message) {
        message = {
          kind: "agentMessage",
          role: "assistant",
          text: "",
          itemId,
          turnId: state.activeTurnId ? String(state.activeTurnId) : "",
          status: "inProgress",
          done: false,
        };
        state.messages.push(message);
        created = true;
      }
      if (params.field === "text") {
        message.text += params.delta || "";
        state.typing = false;
        if (created) render();
        else scheduleStreamingMessageUpdate(itemId);
      }
      return;
    }
    if (method === "item/completed") {
      upsertBackendTimelineItem(params.item);
      return;
    }
    if (method === "approval/requested") {
      state.pendingApprovals = [
        ...state.pendingApprovals.filter(
          (item) => item.approvalId !== params.approvalId,
        ),
        params,
      ];
      renderBackendPrompts();
      return;
    }
    if (method === "approval/resolved") {
      state.pendingApprovals = state.pendingApprovals.filter(
        (item) => item.approvalId !== params.approvalId,
      );
      renderBackendPrompts();
      return;
    }
    if (method === "userInput/requested") {
      state.pendingInputs = [
        ...state.pendingInputs.filter(
          (item) => item.userInputId !== params.userInputId,
        ),
        params,
      ];
      renderBackendPrompts();
      return;
    }
    if (method === "userInput/settled") {
      state.pendingInputs = state.pendingInputs.filter(
        (item) => item.userInputId !== params.userInputId,
      );
      renderBackendPrompts();
      return;
    }
    if (method === "session/tokenUsage") {
      state.tokenUsage = params;
      return;
    }
    if (method === "session/contextUsage") {
      state.contextUsage = params;
      return;
    }
    if (method === "device/status") {
      state.deviceRevision += 1;
      if (Array.isArray(params.devices)) {
        applyBackendDevices(params);
        renderComposer();
        renderAccountDialog();
        syncChrome();
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
        applyBackendDevices({ devices: state.devices });
        renderComposer();
        renderAccountDialog();
        syncChrome();
      }
      return;
    }
    if (method === "device/paired" || method === "device/removed") {
      refreshBackendDevices();
      return;
    }
    if (method === "turn/completed") {
      state.typing = false;
      state.activeTurnId = null;
      render();
      refreshBackendSessions();
      refreshUiWidgets({ silent: true });
      if (api) {
        api
          .affinity()
          .then((affinity) => {
            const score = Number(affinity?.score);
            if (Number.isFinite(score)) {
              state.agentTraining = Math.min(80, Math.max(0, score));
              renderContext();
            }
          })
          .catch(() => {});
      }
    }
  }

  async function refreshAccountLocation() {
    if (!api || !state.accountLocationAuto) return;
    try {
      const payload = await api.location();
      const label = payload?.resolved
        ? String(payload.label || payload.city || "").trim()
        : "";
      if (!label || label === state.accountLocation) return;
      state.accountLocation = label;
      persistAccountProfile();
      renderAccountDialog();
      renderContext();
    } catch {}
  }

  async function refreshBackendSessions() {
    if (!api || !state.apiAvailable) return;
    try {
      const payload = await api.sessions();
      replaceBackendSessions(payload?.sessions);
      renderSessions();
      renderContext();
    } catch {}
  }

  async function refreshBackendSkills(query = "") {
    if (!api || !state.apiAvailable) return;
    const results = await Promise.allSettled([
      api.skills({ scope: "market", q: query }),
      api.skills({ scope: "installed", q: query }),
      api.mineSkills(),
    ]);
    if (results.every((result) => result.status === "rejected")) {
      throw results[0].reason || new Error("技能市场刷新失败");
    }
    const [market, installed, mine] = results;
    applyBackendSkills({
      market: market.status === "fulfilled" ? market.value : undefined,
      installed: installed.status === "fulfilled" ? installed.value : undefined,
      mine: mine.status === "fulfilled" ? mine.value : undefined,
    });
    render();
  }

  let backendInitStarted = false;

  function desktopAuthenticated() {
    try {
      const profile = JSON.parse(
        localStorage.getItem("qianbian-desktop-account-profile") || "{}",
      );
      return (
        localStorage.getItem("qianbian-desktop-auth") === "true" &&
        profile.loggedIn !== false
      );
    } catch {
      return false;
    }
  }

  async function initializeBackend() {
    if (!api || backendInitStarted) return;
    if (location.protocol === "file:" && !api.explicit) {
      state.devicesLoaded = true;
      state.deviceError = "设备服务未连接";
      return;
    }
    const realAuth = isRealAuthEnvironment();
    if (realAuth && !desktopAuthenticated()) {
      state.apiAvailable = false;
      return;
    }
    backendInitStarted = true;
    if (realAuth) {
      const me = await api.authMe().catch(() => null);
      if (!me) {
        backendInitStarted = false;
        state.apiAvailable = false;
        window.dispatchEvent(new Event("qianbian:auth-required"));
        return;
      }
    }
    try {
      await api.health();
      state.apiAvailable = true;
      if (engineLabel) engineLabel.textContent = "后端已连接";
      refreshAccountLocation();
      refreshUiWidgets({ silent: true });
    } catch (error) {
      state.apiAvailable = false;
      state.apiStatus = { connected: false, error: error.message };
      state.environments = DEFAULT_ENVIRONMENTS.map((environment) => ({
        ...environment,
      }));
      state.executionTarget = "local";
      state.devicesLoaded = true;
      state.deviceError = "设备服务未连接";
      return;
    }
    const [
      sessionsResult,
      environmentsResult,
      devicesResult,
      modelsResult,
      marketResult,
      installedResult,
      mineResult,
      automationsResult,
      affinityResult,
    ] =
      await Promise.allSettled([
        api.sessions(),
        api.environments(),
        api.devices(),
        api.models(),
        api.skills({ scope: "market" }),
        api.skills({ scope: "installed" }),
        api.mineSkills(),
        api.automations(),
        api.affinity(),
      ]);
    if (sessionsResult.status === "fulfilled") {
      replaceBackendSessions(sessionsResult.value?.sessions);
    }
    if (environmentsResult.status === "fulfilled") {
      applyBackendEnvironments(environmentsResult.value);
    }
    if (devicesResult.status === "fulfilled") {
      applyBackendDevices(devicesResult.value);
    }
    if (modelsResult.status === "fulfilled") {
      syncBackendModels(modelsResult.value);
    }
    applyBackendSkills({
      market:
        marketResult.status === "fulfilled" ? marketResult.value : undefined,
      installed:
        installedResult.status === "fulfilled"
          ? installedResult.value
          : undefined,
      mine: mineResult.status === "fulfilled" ? mineResult.value : undefined,
    });
    if (automationsResult.status === "fulfilled") {
      const list = automationsResult.value?.automations;
      state.backendAutomations = (Array.isArray(list) ? list : []).map(
        mapBackendAutomation,
      );
      state.automationsState = "ready";
    } else {
      state.backendAutomations = [];
      state.automationsState = "unavailable";
    }
    if (affinityResult.status === "fulfilled") {
      const score = Number(affinityResult.value?.score);
      if (Number.isFinite(score)) {
        state.agentTraining = Math.min(80, Math.max(0, score));
        renderContext();
      }
    }
    api.connectEvents({
      onStatus(status) {
        state.apiStatus = status;
        if (engineLabel) {
          engineLabel.textContent = status?.connected
            ? "后端已连接"
            : "后端重连中";
        }
      },
      onEvent: handleBackendEvent,
      onError(error) {
        state.apiStatus = { connected: false, error: error?.message || "" };
      },
    });
    render();
  }

  if (new URLSearchParams(location.search).get("debug") === "1") {
    window.__qianbianDebug = {
      getState: () => state,
      setDesktopPublishPackage,
    };
  }

  window.__qianbianBackend = {
    handleEvent(method, params = {}) {
      // 测试便捷：会话级事件没带 sessionId 时补当前会话（没有会话则造一个测试会话）；
      // 真实 SSE 走 handleEventRaw，严格丢弃缺 sessionId 的事件
      if (SESSION_SCOPED_MSP_METHODS.has(method)) {
        const sessionId =
          params.sessionId ||
          params.session?.sessionId ||
          state.activeSession ||
          "test-session";
        if (!state.activeSession) state.activeSession = sessionId;
        return handleBackendEvent(method, { ...params, sessionId });
      }
      return handleBackendEvent(method, params);
    },
    handleEventRaw: handleBackendEvent,
    initialize: initializeBackend,
  };

  function renderSessions() {
    const query = state.historyPanelQuery.trim().toLowerCase();
    const visible = SESSIONS.filter((session) =>
      session.title.toLowerCase().includes(query),
    );
    const groups = [
      { label: "今天", items: [] },
      { label: "昨天", items: [] },
      { label: "更早", items: [] },
    ];
    for (const session of visible) {
      if (session.meta.includes("昨天")) groups[1].items.push(session);
      else if (session.meta.includes("周")) groups[2].items.push(session);
      else groups[0].items.push(session);
    }
    historyCount.textContent = String(visible.length);
    sessionList.innerHTML =
      visible.length > 0
        ? groups
            .filter((group) => group.items.length)
            .map(
              (group) => `
                <section class="history-group">
                  <h3>${group.label}</h3>
                  ${group.items
                    .map(
                      (session) => `
                        <button class="session-button history-session-button ${state.activeSession === session.id ? "is-active" : ""}" data-session="${session.id}" type="button">
                          ${icon(session.icon)}
                          <span class="session-copy">
                            <strong>${escapeHtml(session.title)}</strong>
                            <small>${escapeHtml(session.meta)}</small>
                          </span>
                          ${icon("chevron-right", "history-chevron")}
                        </button>
                      `,
                    )
                    .join("")}
                </section>
              `,
            )
            .join("")
        : `<div class="history-empty">${icon("search-x")}<span>没有匹配的历史会话</span></div>`;
    updateIcons(sessionList);
  }

  function renderEmptyChat() {
    return `
      <div class="chat-empty">
        <div class="empty-inner">
          <h2>一句话，<strong>千变万化。</strong></h2>
          <p>多和千变聊聊，聊得越多，它就越懂你，慢慢长成另一个你。</p>
        </div>
      </div>
    `;
  }

  function renderMessage(message, index) {
    const isUser = message.role === "user";
    const userAvatar =
      state.accountAvatar || "assets/brand/qianbian-tile.png";
    return `
      <article class="message-row ${isUser ? "user" : "assistant"}" data-message-item-id="${escapeHtml(message.itemId || "")}">
        ${
          isUser
            ? ""
            : `<span class="message-avatar"><img src="assets/brand/qianbian-tile.png" alt="" /></span>`
        }
        <div class="message-content">
          <div class="message-author">${isUser ? "你" : "千变"}</div>
          <div class="message-bubble">${formatMessageContent(message)}</div>
          <div class="message-actions" aria-label="消息操作">
            <button data-message-action="copy" data-message-index="${index}" type="button" aria-label="复制消息">${icon("copy")}<span>复制</span></button>
            <button data-message-action="quote" data-message-index="${index}" type="button" aria-label="引用消息">${icon("quote")}<span>引用</span></button>
          </div>
        </div>
        ${
          isUser
            ? `<span class="message-avatar user-avatar"><img src="${escapeHtml(userAvatar)}" alt="" /></span>`
            : ""
        }
      </article>
    `;
  }

  function scheduleThreadScrollToBottom() {
    if (scrollFrame || scrollTimer) return;
    const wait = Math.max(0, 100 - (performance.now() - lastScrollAt));
    scrollTimer = window.setTimeout(() => {
      scrollTimer = null;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        const thread = document.getElementById("message-thread");
        if (thread) viewScroll.scrollTop = viewScroll.scrollHeight;
        lastScrollAt = performance.now();
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
        const message = state.messages.find((item) => item.itemId === id);
        const bubble = document.querySelector(
          `[data-message-item-id="${CSS.escape(id)}"] .message-bubble`,
        );
        if (message && bubble) {
          bubble.innerHTML = formatMessageContent(message);
        }
      }
      document.querySelectorAll(".message-row.is-typing").forEach((node) => {
        node.remove();
      });
      scheduleThreadScrollToBottom();
    });
  }

  function renderBackendActivityBlock(items, isActiveTurn = false) {
    const summary = window.QianbianTimeline.summarize(items);
    if (!summary.text && !isActiveTurn) return "";
    const latest = items.at(-1);
    const latestName =
      latest?.tool ||
      (latest?.kind === "reasoning" ? "思考摘要" : "工具调用") ||
      "";
    const latestOutput = latest
      ? window.QianbianTimeline.activityText(latest)
      : "";
    const active =
      isActiveTurn ||
      items.some((item) => item.status === "inProgress" && item.done !== true);
    const primary = active ? "Agent 正在工作" : "Agent 工作流";
    const secondary =
      [summary.text, latestName, latestOutput].filter(Boolean).join(" · ") ||
      "正在整理上下文，准备下一步";
    return `
      <details class="backend-activity">
        <summary class="backend-workflow-status" data-workflow-state="${active ? "active" : "complete"}">
          ${icon("brain-circuit")}
          <span class="backend-activity-copy">
            <strong>${escapeHtml(primary)}</strong>
            <small>${escapeHtml(secondary)}</small>
          </span>
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

  function renderChatThread() {
    const turns = window.QianbianTimeline.group(state.messages);
    const messages = turns
      .map((turn) => {
        const userMessages = turn.items
          .filter((item) => item.kind === "userMessage")
          .map((item) => renderMessage(item, state.messages.indexOf(item)))
          .join("");
        const activityItems = window.QianbianTimeline.activities(turn);
        const activity = renderBackendActivityBlock(
          activityItems,
          state.typing && turn === turns.at(-1),
        );
        const assistantMessages = turn.items
          .filter((item) => item.kind === "agentMessage")
          .map((item) => renderMessage(item, state.messages.indexOf(item)))
          .join("");
        return `
          <section class="backend-turn" data-turn-id="${escapeHtml(turn.id)}">
            ${userMessages}
            ${activity}
            ${assistantMessages}
          </section>
        `;
      })
      .join("");
    const typing = state.typing
      ? `
        <article class="message-row assistant is-typing">
          <span class="message-avatar"><img src="assets/brand/qianbian-tile.png" alt="" /></span>
          <div class="message-content">
            <div class="message-author">千变</div>
            <div class="message-bubble">
              <span class="typing-dots" aria-label="千变正在输入"><span></span><span></span><span></span></span>
            </div>
          </div>
        </article>
      `
      : "";
    return `
      <div class="message-thread" id="message-thread">
        <div class="thread-meta">今天</div>
        ${messages}
        ${typing}
      </div>
    `;
  }

  function syncChatAlignment() {
    const thread = document.getElementById("message-thread");
    const main = document.querySelector(".main-workspace");
    const title = document.querySelector(".page-heading h1");
    const themeToggle = document.getElementById("theme-toggle");
    if (!thread || !main || !title || !themeToggle) return;

    const mainRect = main.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const themeRect = themeToggle.getBoundingClientRect();
    const start = Math.max(0, titleRect.left - mainRect.left);
    const end = Math.max(
      start + 200,
      Math.min(mainRect.width, themeRect.right - mainRect.left),
    );

    thread.style.marginLeft = `${start}px`;
    thread.style.marginRight = "auto";
    thread.style.width = `${end - start}px`;
  }

  function renderChatView() {
    return state.messages.length || state.typing
      ? renderChatThread()
      : renderEmptyChat();
  }

  function renderSkillsView() {
    const activeSkills = getActiveSkills();
    const visibleSkills = activeSkills.filter((skill) => {
      if (state.skillFilter === "all") return true;
      if (state.skillFilter === "dev") {
        return ["skill-dev", "security-review", "automation"].includes(skill.id);
      }
      if (state.skillFilter === "content") {
        return ["guide", "pet-theme", "product-brief"].includes(skill.id);
      }
      return ["data-review", "design-review"].includes(skill.id);
    });
    return `
      <div class="page-view">
        <div class="page-view-head">
          <div>
            <span class="eyebrow">技能</span>
            <h2>把能力组织成可复用的工作方式</h2>
            <p>从对话中调用技能，或为特定任务固定一套方法与输出标准。</p>
          </div>
          <div class="page-view-actions">
            <button class="secondary-button" data-open-skill-market type="button">${icon("store")}技能市场</button>
            <button class="primary-button" data-detail-type="skillNew" type="button">${icon("plus")}新建技能</button>
          </div>
        </div>
        <div class="skill-toolbar" role="group" aria-label="技能筛选">
          ${[
            ["all", "全部"],
            ["dev", "开发"],
            ["content", "内容"],
            ["analysis", "分析"],
          ]
            .map(
              ([id, label]) => `
                <button class="filter-button ${state.skillFilter === id ? "is-active" : ""}" data-skill-filter="${id}" type="button">${label}</button>
              `,
            )
            .join("")}
        </div>
        <div class="skills-grid">
          ${visibleSkills.map(
            (skill) => `
              <article class="skill-card">
                <span class="skill-card-icon">${icon(skill.icon)}</span>
                <div class="skill-card-copy">
                  <h3>${escapeHtml(skill.title)}</h3>
                  <p>${escapeHtml(skill.description)}</p>
                  <div class="tag-row">${skill.tags.map((tag) => `<span class="soft-tag">${escapeHtml(tag)}</span>`).join("")}</div>
                </div>
                <div class="skill-card-actions">
                  <button class="skill-detail" data-skill-detail="${skill.id}" type="button">详情</button>
                  <button class="skill-use" data-use-skill="${skill.id}" type="button">使用</button>
                </div>
              </article>
            `,
          ).join("")}
        </div>
      </div>
    `;
  }

  function renderAutomationRows(automations, emptyCopy) {
    if (!automations.length && state.apiAvailable) {
      return `<div class="workspace-panel-empty">${icon("workflow")}<strong>${emptyCopy[0]}</strong><span>${emptyCopy[1]}</span></div>`;
    }
    return automations
      .map((automation) => {
        const enabled = Boolean(
          automation.enabled ?? state.automationEnabled.get(automation.id),
        );
        return `
          <article class="automation-row">
            <button class="automation-main" data-automation-detail="${automation.id}" type="button">
              <span class="automation-row-icon">${icon(automation.icon)}</span>
              <span class="automation-copy">
                <strong>${escapeHtml(automation.title)}</strong>
                <span>${escapeHtml(automation.description)}</span>
              </span>
            </button>
            <span class="schedule-pill">${escapeHtml(automation.schedule)}</span>
            <button class="switch ${enabled ? "is-on" : ""}" data-automation="${automation.id}" type="button" aria-label="${enabled ? "停用" : "启用"}${escapeHtml(automation.title)}" aria-pressed="${enabled}"></button>
          </article>
        `;
      })
      .join("");
  }

  function renderAutomationView() {
    const automations = getVisibleAutomations();
    const emptyCopy =
      state.apiAvailable && state.automationsState === "unavailable"
        ? ["自动化服务暂不可用", "恢复连接后会自动刷新。"]
        : ["还没有自动化", "创建后会在这里显示执行计划。"];
    const description = state.apiAvailable
      ? "设置触发条件、执行内容和通知方式，任务状态直接来自当前后端。"
      : "设置触发条件、执行内容和通知方式。所有任务都为本地演示状态。";
    return `
      <div class="page-view">
        <div class="page-view-head">
          <div>
            <span class="eyebrow">自动化</span>
            <h2>让重复工作按计划运行</h2>
            <p>${description}</p>
          </div>
          <div class="page-view-actions">
            <button class="primary-button" data-detail-type="automationNew" type="button">${icon("plus")}新建自动化</button>
          </div>
        </div>
        <div class="automation-list">
          ${renderAutomationRows(automations, emptyCopy)}
        </div>
      </div>
    `;
  }

  function settingToggle(key, label, description) {
    const enabled = Boolean(state.settings[key]);
    return `
      <div class="settings-row">
        <div class="settings-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(description)}</small></div>
        <button class="switch ${enabled ? "is-on" : ""}" data-setting-toggle="${key}" type="button" aria-label="切换${escapeHtml(label)}" aria-pressed="${enabled}"></button>
      </div>
    `;
  }

  function settingSelect(key, options) {
    return `
      <select data-setting-select="${key}">
        ${options
          .map(
            (option) =>
              `<option ${state.settingOptions[key] === option ? "selected" : ""}>${escapeHtml(option)}</option>`,
          )
          .join("")}
      </select>
    `;
  }

  async function loadDesktopCare() {
    if (!api || state.careLoading) return;
    state.careLoading = true;
    state.careError = "";
    try {
      const [prefs, signal, events] = await Promise.all([
        api.carePreferences(),
        api.careSignal().catch(() => null),
        api.careEvents({ limit: 12 }).catch(() => []),
      ]);
      state.carePrefs = prefs;
      state.careSignal = signal;
      state.careEvents = Array.isArray(events) ? events : [];
      state.careLoaded = true;
    } catch (error) {
      state.careError = error.message || "关心设置加载失败";
      showToast(state.careError, "circle-alert");
    } finally {
      state.careLoading = false;
      render();
    }
  }

  function retryDesktopCare() {
    state.careError = "";
    state.careLoaded = false;
    loadDesktopCare();
  }

  function careReasonText(reason) {
    const labels = {
      care_disabled: "主动关心还没开启",
      quiet_hours: "当前在免打扰时段，这次先不打扰",
      daily_limit: "今天的主动关心已达上限",
      location_unknown: "还没有获取到所在城市",
      worker_disabled: "关心服务暂时不可用",
      news_unavailable: "本地新闻源暂时不可用，请稍后再试",
      no_local_news: "今天附近暂时没有合适的本地消息",
      duplicate: "这条关心今天已经发过了",
    };
    return labels[reason] || reason || "暂无合适内容";
  }

  async function saveDesktopCare(patch) {
    if (!api) return;
    const previous = state.carePrefs;
    const next = { ...(previous || {}), ...patch };
    state.carePrefs = next;
    render();
    try {
      state.carePrefs = await api.updateCarePreferences({
        enabled: next.enabled,
        mode: next.mode || "normal",
        quietStart: String(next.quietStart || "23:00").slice(0, 5),
        quietEnd: String(next.quietEnd || "08:00").slice(0, 5),
        maxPerDay: Number(next.maxPerDay) || 1,
        topics: next.topics || ["本地新闻"],
      });
      state.careLoaded = true;
      showToast("关心设置已保存", "check");
    } catch (error) {
      state.carePrefs = previous;
      showToast(error.message || "保存失败，已恢复原设置", "circle-alert");
    }
    render();
  }

  async function useDesktopLocationForCare() {
    if (!api) return;
    try {
      const place = await api.location();
      if (!place?.city) {
        showToast("暂时无法解析当前位置", "circle-alert");
        return;
      }
      state.careSignal = await api.mockCareSignal({
        city: place.city,
        region: place.region || place.city,
        stepsTotal: 0,
        stepsDelta2h: 0,
      });
      showToast(`已使用${place.city}作为本地新闻位置`, "map-pin");
      render();
    } catch (error) {
      showToast(error.message || "定位失败", "circle-alert");
    }
  }

  async function testDesktopCare() {
    if (!api || state.careTesting) return;
    state.careTesting = true;
    state.careMessage = "";
    render();
    try {
      const result = await api.triggerCare({ force: true });
      if (result?.sent) {
        state.careMessage = result.message || "";
        state.careEvents = await api.careEvents({ limit: 12 }).catch(() => state.careEvents);
        showToast("已发到「千变的关心」", "heart");
      } else {
        state.careMessage = `这次没有发送：${careReasonText(result?.reason)}`;
      }
    } catch (error) {
      state.careMessage = `试发失败：${error.message || "请稍后再试"}`;
      showToast(error.message || "试发失败", "circle-alert");
    } finally {
      state.careTesting = false;
      render();
    }
  }

  function renderDesktopCareContent() {
    if (!state.careLoaded && !state.careLoading && !state.careError) {
      setTimeout(loadDesktopCare, 0);
    }
    const prefs = state.carePrefs || {
      enabled: false,
      maxPerDay: 1,
      quietStart: "23:00",
      quietEnd: "08:00",
    };
    const loading = !state.careLoaded && !state.careError;
    const disabledAttr = loading || state.careError ? "disabled" : "";
    const signal = state.careSignal || {};
    const events = state.careEvents || [];
    const quietOptions = (selected) =>
      ["22:00", "23:00", "00:00", "07:00", "08:00", "09:00"]
        .map((value) => `<option ${value === selected ? "selected" : ""}>${value}</option>`)
        .join("");
    return `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-copy"><strong>主动关心</strong><small>${loading ? "正在加载设置…" : "本地新闻、天气和作息提醒，默认关闭；每天最多 1–2 条，23:00–08:00 静默。"}</small></div>
          <button class="switch ${prefs.enabled ? "is-on" : ""} ${loading ? "is-loading" : ""}" data-care-toggle type="button" aria-label="切换主动关心" aria-pressed="${Boolean(prefs.enabled)}" aria-busy="${loading}" ${disabledAttr}></button>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>每日上限</strong><small>最多主动发几条</small></div>
          <select data-care-frequency ${disabledAttr}>
            <option value="1" ${Number(prefs.maxPerDay) === 1 ? "selected" : ""}>1 条</option>
            <option value="2" ${Number(prefs.maxPerDay) === 2 ? "selected" : ""}>2 条</option>
          </select>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>免打扰</strong><small>这个时间段不发主动消息</small></div>
          <div class="care-quiet-controls">
            <select data-care-quiet-start ${disabledAttr}>${quietOptions(String(prefs.quietStart || "23:00").slice(0, 5))}</select>
            <span>—</span>
            <select data-care-quiet-end ${disabledAttr}>${quietOptions(String(prefs.quietEnd || "08:00").slice(0, 5))}</select>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>本地新闻位置</strong><small>${loading ? "正在获取…" : signal.city ? `${escapeHtml(signal.region || "")} ${escapeHtml(signal.city)}` : "尚未获取，使用 IP 或等待 App 上报"}</small></div>
          <button class="secondary-button" data-care-locate type="button" ${disabledAttr}>使用当前定位</button>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>试一条</strong><small>立即触发一次本地关心，用于验收</small></div>
          <button class="secondary-button" data-care-test type="button" ${disabledAttr || (state.careTesting ? "disabled" : "")}>${state.careTesting ? "正在找附近的消息…" : "试一条关心"}</button>
        </div>
        ${state.careError ? `<div class="settings-row"><div class="settings-copy"><strong>加载失败</strong><small>${escapeHtml(state.careError)}</small></div><button class="secondary-button" data-care-retry type="button">重新加载</button></div>` : ""}
        ${state.careMessage ? `<div class="settings-row"><div class="settings-copy"><strong>最近一次结果</strong><small>${escapeHtml(state.careMessage)}</small></div></div>` : ""}
      </div>
      <div class="settings-section">
        <div class="settings-row"><div class="settings-copy"><strong>最近的关心</strong><small>只显示已发送的消息</small></div></div>
        ${events.length ? events.map((item) => `<div class="settings-row care-event-row"><div class="settings-copy"><strong>${escapeHtml(item.careType === "local_news" ? "本地新闻" : item.careType || "关心")}</strong><small>${escapeHtml(item.message || "")}</small></div><span class="soft-tag">${escapeHtml(String(item.sentAt || item.createdAt || "").slice(0, 10))}</span></div>`).join("") : `<div class="settings-row"><div class="settings-copy"><strong>${loading ? "正在加载最近的关心…" : state.careError ? "加载失败" : "还没有关心记录"}</strong><small>${loading ? "请稍候" : state.careError ? "请点击上方「重新加载」" : "开启后这里会显示发过的消息"}</small></div></div>`}
      </div>
    `;
  }

  function renderSettingsContent() {
    if (state.settingsTab === "care") {
      return renderDesktopCareContent();
    }
    if (state.settingsTab === "general") {
      return `
        <div class="settings-section">
          <div class="settings-row">
            <div class="settings-copy"><strong>默认模型</strong><small>新对话使用当前模型</small></div>
            <button class="secondary-button" data-detail-type="model" type="button">${escapeHtml(state.model)}</button>
          </div>
          <div class="settings-row">
            <div class="settings-copy"><strong>界面语言</strong><small>控制菜单、状态和提示语言</small></div>
            ${settingSelect("language", ["简体中文", "English"])}
          </div>
          <div class="settings-row">
            <div class="settings-copy"><strong>启动页面</strong><small>打开工作区后默认进入的位置</small></div>
            ${settingSelect("startup", ["新对话", "最近对话", "技能空间"])}
          </div>
          ${settingToggle("autoSave", "自动保存草稿", "切换页面后仍保留未发送内容")}
          ${settingToggle("compactSidebar", "紧凑侧栏", "减少会话列表间距，显示更多记录")}
          <div class="settings-row">
            <div class="settings-copy"><strong>更新通道</strong><small>桌面端界面版本与资源更新方式</small></div>
            ${settingSelect("updates", ["稳定版", "预览版"])}
          </div>
        </div>
      `;
    }
    if (state.settingsTab === "skills") {
      return `
        <div class="settings-section">
          <div class="settings-row">
            <div class="settings-copy"><strong>已启用技能</strong><small>${getActiveSkills().length} 个技能可用于当前工作区</small></div>
            <button class="secondary-button" data-view="skills" type="button">管理技能</button>
          </div>
          <div class="settings-row">
            <div class="settings-copy"><strong>技能市场</strong><small>浏览并安装新的处理能力</small></div>
            <button class="secondary-button" data-open-skill-market type="button">打开市场</button>
          </div>
          ${settingToggle("autoSave", "自动选择技能", "根据任务内容推荐合适能力")}
          <div class="settings-row">
            <div class="settings-copy"><strong>技能执行权限</strong><small>限制技能访问文件和网络的范围</small></div>
            ${settingSelect("skill-access", ["工作区内修改", "仅查看", "完全权限"])}
          </div>
        </div>
      `;
    }
    if (state.settingsTab === "notifications") {
      return `
        <div class="settings-section">
          ${settingToggle("notifications", "桌面通知", "任务完成或需要确认时显示系统通知")}
          ${settingToggle("taskNotifications", "后台任务提醒", "自动化或长任务状态变化时提醒")}
          ${settingToggle("sound", "声音提示", "通知出现时播放轻提示音")}
          <div class="settings-row">
            <div class="settings-copy"><strong>每日摘要</strong><small>汇总当天会话、任务和技能使用情况</small></div>
            ${settingSelect("digest", ["每天 18:00", "每天 09:00", "关闭"])}
          </div>
        </div>
      `;
    }
    if (state.settingsTab === "privacy") {
      return `
        <div class="settings-section">
          ${settingToggle("history", "保存对话记录", "在本地保存会话和最近使用内容")}
          ${settingToggle("diagnostics", "发送诊断信息", "仅发送匿名错误信息用于改进界面")}
          ${settingToggle("externalLinks", "允许外部链接", "打开工作区以外的网页地址")}
          <div class="settings-row">
            <div class="settings-copy"><strong>网络访问</strong><small>控制需要联网的模型和技能</small></div>
            ${settingSelect("network", ["按需访问", "始终允许", "完全禁止"])}
          </div>
          <div class="settings-row">
            <div class="settings-copy"><strong>本地界面数据</strong><small>清除主题、草稿和工作区选择</small></div>
            <button class="secondary-button danger-button" data-clear-local type="button">清除数据</button>
          </div>
        </div>
      `;
    }
    if (state.settingsTab === "advanced") {
      return `
        <div class="settings-section">
          <div class="settings-row">
            <div class="settings-copy"><strong>上下文窗口</strong><small>控制单次对话保留的上下文范围</small></div>
            ${settingSelect("context", ["128k", "64k", "32k"])}
          </div>
          <div class="settings-row">
            <div class="settings-copy"><strong>工具确认</strong><small>执行文件、终端或网络操作前的确认方式</small></div>
            ${settingSelect("confirm", ["每次确认", "仅高风险操作", "自动执行"])}
          </div>
          ${settingToggle("debug", "调试日志", "显示界面事件和资源加载信息")}
          <div class="settings-row">
            <div class="settings-copy"><strong>导出工作区设置</strong><small>下载当前界面配置</small></div>
            <button class="secondary-button" data-toast="设置导出入口已就绪" type="button">导出设置</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-copy"><strong>界面模式</strong><small>浅色和深色使用同一套信息层级</small></div>
          <div class="segmented" role="group" aria-label="界面模式">
            <button class="${state.theme === "light" ? "is-active" : ""}" data-set-theme="light" type="button">浅色</button>
            <button class="${state.theme === "dark" ? "is-active" : ""}" data-set-theme="dark" type="button">深色</button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>主题色</strong><small>当前使用深梅色作为专注色</small></div>
          <span class="soft-tag">深梅色</span>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>界面密度</strong><small>控制列表、消息和工具按钮的间距</small></div>
          ${settingSelect("density", ["舒适", "紧凑", "宽松"])}
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>玻璃质感</strong><small>用于输入框、浮层和上下文面板</small></div>
          <span class="state-pill is-on">已开启</span>
        </div>
        <div class="settings-row">
          <div class="settings-copy"><strong>动画效果</strong><small>遵循系统减少动态效果设置</small></div>
          <span class="soft-tag">跟随系统</span>
        </div>
      </div>
    `;
  }

  function renderSettingsView() {
    return `
      <div class="page-view">
        <div class="page-view-head">
          <div>
            <span class="eyebrow">设置</span>
            <h2>设置</h2>
            <p>管理账号、默认能力、界面模式和技能偏好。</p>
          </div>
        </div>
        <div class="settings-layout">
          <nav class="settings-index" aria-label="设置分类">
            ${[
              ["general", "通用"],
              ["appearance", "外观"],
              ["skills", "技能"],
              ["care", "主动关心"],
              ["notifications", "通知"],
              ["privacy", "隐私"],
              ["advanced", "高级"],
            ]
              .map(
                ([id, label]) => `
                  <button class="${state.settingsTab === id ? "is-active" : ""}" data-settings-tab="${id}" type="button">${label}</button>
                `,
              )
              .join("")}
          </nav>
          ${renderSettingsContent()}
        </div>
      </div>
    `;
  }

  function renderDetailShell(title, description, primary, secondary = "") {
    return `
      <div class="page-view detail-view">
        <div class="page-view-head detail-page-head">
          <div>
            <span class="eyebrow">${escapeHtml(getDetailInfo(state.detail)?.label || "详情")}</span>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
          </div>
        </div>
        <div class="detail-layout">
          <div class="detail-primary">${primary}</div>
          ${secondary ? `<aside class="detail-secondary">${secondary}</aside>` : ""}
        </div>
      </div>
    `;
  }

  function renderModelDetail() {
    const fallbackModels = [
      {
        modelId: "2",
        name: "通用模型 V4",
        description: "日常任务、工具调用与稳定输出",
        meta: "128k 上下文",
        icon: "sparkles",
      },
      {
        modelId: "3",
        name: "推理模型",
        description: "复杂分析、规划与多步骤问题",
        meta: "64k 上下文",
        icon: "brain",
      },
      {
        modelId: "4",
        name: "快速模型",
        description: "短对话、信息整理与快速草稿",
        meta: "32k 上下文",
        icon: "zap",
      },
    ];
    const models = state.models.length
      ? state.models.map((model) => ({
          modelId: model.modelId,
          name: model.label,
          description: model.isDefault
            ? "后端默认模型，适合日常任务与工具调用"
            : "后端可用模型，用于当前会话",
          meta: `ID ${model.modelId}`,
          icon: model.isDefault ? "sparkles" : "brain",
        }))
      : fallbackModels;
    const selectedModel =
      models.find((model) => model.modelId === state.modelId) ||
      models.find((model) => model.name === state.model) ||
      models[0];
    return renderDetailShell(
      "模型与运行方式",
      "选择当前对话使用的模型。切换后会用于下一轮消息，不会改写已有内容。",
      `
        <section class="detail-block">
          <div class="detail-block-head"><strong>可用模型</strong><span>${models.length} 个</span></div>
          <div class="choice-list">
            ${models
              .map(
                (model) => `
                  <button class="choice-row ${selectedModel?.modelId === model.modelId ? "is-selected" : ""}" data-select-model="${escapeHtml(model.modelId)}" type="button">
                    <span class="choice-icon">${icon(model.icon)}</span>
                    <span class="choice-copy"><strong>${escapeHtml(model.name)}</strong><small>${escapeHtml(model.description)}</small></span>
                    <span class="soft-tag">${escapeHtml(model.meta)}</span>
                    ${selectedModel?.modelId === model.modelId ? icon("check", "choice-check") : ""}
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="detail-block">
          <div class="detail-block-head"><strong>能力设置</strong><span>当前对话</span></div>
          <div class="detail-list">
            <div class="detail-row">${icon("wrench")}<span>工具调用</span><strong>已启用</strong></div>
            <div class="detail-row">${icon("route")}<span>运行位置</span><strong>本地工作区</strong></div>
            <div class="detail-row">${icon("shield-check")}<span>权限</span><strong>工作区内修改</strong></div>
            <label class="detail-row">
              ${icon("badge-check")}
              <span>审批模式</span>
              <select id="approval-mode-select">
                <option value="onRequest" ${state.approvalMode === "onRequest" ? "selected" : ""}>按需审批</option>
                <option value="promptUnmatched" ${state.approvalMode === "promptUnmatched" ? "selected" : ""}>未匹配时询问</option>
                <option value="denyUnmatched" ${state.approvalMode === "denyUnmatched" ? "selected" : ""}>未匹配时拒绝</option>
                <option value="allowAll" ${state.approvalMode === "allowAll" ? "selected" : ""}>全部允许</option>
              </select>
            </label>
          </div>
        </section>
      `,
      `
        <section class="detail-side-section">
          <span class="detail-side-label">当前状态</span>
          <div class="status-summary">
            <span class="status-dot"></span>
            <strong>${escapeHtml(selectedModel?.name || state.model)}</strong>
            <small>连接正常，可以继续对话</small>
          </div>
        </section>
        <section class="detail-side-section">
          <span class="detail-side-label">说明</span>
          <p class="detail-note">模型切换只影响当前对话。工作区权限与模型选择相互独立。</p>
        </section>
      `,
    );
  }

  function renderWorkspaceDetail() {
    return renderDetailShell(
      `${state.workspaceName}详情`,
      "查看当前工作区的文件、会话和运行状态。",
      `
        <section class="detail-block">
          <div class="detail-block-head"><strong>千变演示空间</strong><span>本地</span></div>
          <div class="workspace-stats">
            <div><strong>14</strong><span>工作区文件</span></div>
            <div><strong>4</strong><span>最近会话</span></div>
            <div><strong>8</strong><span>可用技能</span></div>
          </div>
        </section>
        <section class="detail-block">
          <div class="detail-block-head"><strong>最近会话</strong><span>${SESSIONS.length} 个</span></div>
          <div class="detail-session-list">
            ${SESSIONS.map(
              (session) => `
                <button class="detail-session-row" data-session="${session.id}" type="button">
                  ${icon(session.icon)}
                  <span><strong>${escapeHtml(session.title)}</strong><small>${escapeHtml(session.meta)}</small></span>
                  ${icon("chevron-right")}
                </button>
              `,
            ).join("")}
          </div>
        </section>
      `,
      `
        <section class="detail-side-section">
          <span class="detail-side-label">路径</span>
          <code class="path-code">千变 / ${escapeHtml(state.workspaceName)}</code>
        </section>
        <section class="detail-side-section">
          <span class="detail-side-label">自动保存</span>
          <div class="detail-row">${icon("history")}<span>界面状态</span><strong>已开启</strong></div>
        </section>
      `,
    );
  }

  function renderSkillMarketTabs() {
    return `
      <div class="skill-market-tabs" role="tablist" aria-label="技能市场页面">
        ${[
          ["market", "技能市场", "store"],
          ["mine", "我的发布", "upload-cloud"],
        ]
          .map(
            ([id, label, iconName]) => `
              <button
                class="${state.skillMarketTab === id ? "is-active" : ""}"
                data-skill-market-tab="${id}"
                type="button"
                role="tab"
                aria-selected="${state.skillMarketTab === id}"
              >
                ${icon(iconName)}
                <span>${label}</span>
                ${
                  id === "mine"
                    ? `<small>${state.publishedSkills.length}</small>`
                    : ""
                }
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderPublishedSkillsPanel() {
    const statusLabel = {
      draft: "草稿",
      reviewing: "审核中",
      published: "已发布",
      rejected: "未通过",
    };
    return `
      <section class="desktop-published-panel">
        <div class="desktop-published-head">
          <div>
            <strong>我的发布</strong>
            <span>${state.publishedSkills.length} 个技能</span>
          </div>
          <button class="primary-button" data-open-desktop-publish type="button">
            ${icon("plus")}发布技能
          </button>
        </div>
        <div class="desktop-published-list">
          ${state.publishedSkills
            .map(
              (skill) => `
                <article class="desktop-published-skill-card">
                  <span class="desktop-published-skill-icon">${icon(skill.icon || "sparkles")}</span>
                  <div class="desktop-published-skill-copy">
                    <strong>${escapeHtml(skill.title)}</strong>
                    <small>${escapeHtml(skill.description)}</small>
                    <span>${escapeHtml(skill.updatedAt || "刚刚")}</span>
                  </div>
                  <span class="desktop-published-status is-${escapeHtml(skill.status || "published")}">${escapeHtml(statusLabel[skill.status] || "已发布")}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderDesktopPublishSkill() {
    const draft = state.desktopPublishDraft;
    const categoryLabel =
      draft.category === "wellness"
        ? "健康"
        : draft.category === "growth"
          ? "成长"
          : "生活";
    const sourceLabel =
      draft.mode === "ai"
        ? "AI 帮写"
        : draft.mode === "online"
          ? "在线编写"
          : "上传文件";
    const sourceName =
      draft.mode === "upload"
        ? draft.packageName || "尚未拖入技能包"
        : draft.fileName || "skill.js";
    const sourceReady =
      draft.mode === "upload"
        ? Boolean(draft.packageName)
        : draft.mode === "online"
          ? Boolean(draft.code.trim())
          : Boolean(draft.aiGenerated);
    return `
      <section class="desktop-publish-integrated">
        <div class="desktop-publish-integrated-head">
          <button class="secondary-button" data-desktop-publish-cancel type="button">${icon("arrow-left")}返回我的发布</button>
          <span>拖入文件、补充信息，右侧会实时更新发布卡片</span>
        </div>
        <div class="desktop-publish-integrated-grid">
          <div class="desktop-publish-form-column">
            <section class="desktop-publish-section">
              <div class="desktop-publish-section-head">
                <span>基本信息</span>
                <small>用户首先看到的内容</small>
              </div>
              <div class="desktop-publish-fields">
                <label>
                  <span>技能名称</span>
                  <input data-desktop-publish-field="name" value="${escapeHtml(draft.name)}" placeholder="例如：家庭一周餐单" autocomplete="off" />
                </label>
                <label>
                  <span>适合场景</span>
                  <select data-desktop-publish-select="category">
                    ${[
                      ["life", "生活"],
                      ["wellness", "健康"],
                      ["growth", "成长"],
                    ]
                      .map(
                        ([value, label]) =>
                          `<option value="${value}" ${draft.category === value ? "selected" : ""}>${label}</option>`,
                      )
                      .join("")}
                  </select>
                </label>
                <label>
                  <span>一句话介绍</span>
                  <input data-desktop-publish-field="summary" value="${escapeHtml(draft.summary)}" placeholder="例如：按口味和预算生成一周晚餐与采购清单" autocomplete="off" />
                </label>
                <label>
                  <span>补充说明</span>
                  <textarea data-desktop-publish-field="description" rows="4" placeholder="说明输入、输出和使用边界">${escapeHtml(draft.description)}</textarea>
                </label>
              </div>
            </section>
            <section class="desktop-publish-section">
              <div class="desktop-publish-section-head">
                <span>技能来源</span>
                <small>桌面端优先支持拖拽技能包</small>
              </div>
              <div class="desktop-publish-modes" role="tablist" aria-label="技能来源">
                ${[
                  ["upload", "拖拽技能包", "upload"],
                  ["online", "在线编写", "code-2"],
                  ["ai", "AI 帮写", "sparkles"],
                ]
                  .map(
                    ([value, label, iconName]) => `
                      <button class="${draft.mode === value ? "is-active" : ""}" data-desktop-publish-mode="${value}" type="button" role="tab" aria-selected="${draft.mode === value}">
                        ${icon(iconName)}${label}
                      </button>
                    `,
                  )
                  .join("")}
              </div>
              ${
                draft.mode === "upload"
                  ? `
                    <div class="desktop-publish-dropzone ${draft.packageName ? "is-ready" : ""}" data-desktop-dropzone tabindex="0" role="button" aria-label="拖入技能包或选择文件">
                      <input type="file" accept=".zip,.js,.md,.json,.yaml,.yml" data-desktop-package-input hidden />
                      <span class="desktop-publish-dropzone-icon">${icon(draft.packageName ? "package-check" : "upload-cloud")}</span>
                      <div>
                        <strong>${draft.packageName ? escapeHtml(draft.packageName) : "把技能包拖到这里"}</strong>
                        <small>${draft.packageName ? "已准备发布，可重新拖入替换" : "支持 ZIP、JS、Markdown、JSON 或 YAML"}</small>
                      </div>
                      <button class="secondary-button" data-desktop-choose-package type="button">${icon("folder-open")}选择文件</button>
                    </div>
                  `
                  : draft.mode === "online"
                    ? `
                      <div class="desktop-publish-fields desktop-publish-code-fields">
                        <label>
                          <span>技能文件名</span>
                          <input data-desktop-publish-field="fileName" value="${escapeHtml(draft.fileName)}" placeholder="skill.js" autocomplete="off" />
                        </label>
                        <label>
                          <span>技能代码</span>
                          <textarea class="desktop-publish-code" data-desktop-publish-field="code" rows="11" spellcheck="false" placeholder="// 在这里编写技能代码">${escapeHtml(draft.code)}</textarea>
                        </label>
                      </div>
                    `
                    : `
                      <div class="desktop-publish-ai">
                        <label>
                          <span>描述技能目标</span>
                          <textarea data-desktop-publish-field="aiIdea" rows="4" placeholder="例如：根据冰箱食材安排一周晚餐">${escapeHtml(draft.aiIdea)}</textarea>
                        </label>
                        <button class="secondary-button" data-desktop-generate-ai type="button">${icon("sparkles")}生成技能草稿</button>
                        ${
                          draft.aiGenerated
                            ? `
                              <div class="desktop-publish-ai-result">
                                <div>${icon("circle-check")}<span><strong>AI 草稿已生成</strong><small>可以继续修改文件名和代码</small></span></div>
                                <label>
                                  <span>技能文件名</span>
                                  <input data-desktop-publish-field="fileName" value="${escapeHtml(draft.fileName)}" />
                                </label>
                                <label>
                                  <span>技能草稿</span>
                                  <textarea class="desktop-publish-code" data-desktop-publish-field="code" rows="9" spellcheck="false">${escapeHtml(draft.code)}</textarea>
                                </label>
                              </div>
                            `
                            : ""
                        }
                      </div>
                    `
              }
            </section>
          </div>
          <aside class="desktop-publish-preview">
            <div class="desktop-publish-preview-head">
              <span>发布预览</span>
              <small>实时</small>
            </div>
            <article class="desktop-publish-preview-card">
              <span class="desktop-publish-preview-icon">${icon(
                draft.category === "wellness"
                  ? "moon-star"
                  : draft.category === "growth"
                    ? "book-open"
                    : "sparkles",
              )}</span>
              <strong id="desktop-publish-preview-name">${escapeHtml(draft.name || "技能名称")}</strong>
              <p id="desktop-publish-preview-summary">${escapeHtml(draft.summary || "一句话介绍会显示在这里")}</p>
              <div>
                <span id="desktop-publish-preview-category">${categoryLabel}</span>
                <span id="desktop-publish-preview-source">${sourceLabel}</span>
              </div>
            </article>
            <div class="desktop-publish-checklist">
              <div class="${draft.name.trim() ? "is-done" : ""}" data-preview-check="name">${icon("check")}技能名称</div>
              <div class="${draft.summary.trim() ? "is-done" : ""}" data-preview-check="summary">${icon("check")}一句话介绍</div>
              <div class="${sourceReady ? "is-done" : ""}" data-preview-check="source">${icon("check")}技能来源</div>
            </div>
            <div class="desktop-publish-preview-file">
              ${icon("file-code-2")}
              <span><small>发布文件</small><strong id="desktop-publish-preview-file">${escapeHtml(sourceName)}</strong></span>
            </div>
            <div class="desktop-publish-note">${icon("shield-check")}演示发布只保存在当前浏览器。</div>
          </aside>
        </div>
        <footer class="desktop-publish-integrated-actions">
          <span>发布后会出现在“我的发布”中。</span>
          <div>
            <button class="secondary-button" data-toast="技能草稿已保存" type="button">保存草稿</button>
            <button class="primary-button" data-desktop-confirm-publish type="button">${icon("send")}发布技能</button>
          </div>
        </footer>
      </section>
    `;
  }

  function renderSkillMarketDialog() {
    if (state.skillMarketTab === "publish") {
      return renderDesktopPublishSkill();
    }
    const query = state.skillMarketQuery.trim().toLowerCase();
    const visible = MARKET_SKILLS.filter((skill) => {
      const filterMatch =
        state.skillMarketFilter === "all" ||
        skill.category === state.skillMarketFilter;
      const queryMatch =
        !query ||
        skill.title.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.badge.toLowerCase().includes(query);
      return filterMatch && queryMatch;
    });
    const categories = [
      ["all", "全部"],
      ...[...new Set(MARKET_SKILLS.map((skill) => skill.category))]
        .filter(Boolean)
        .map((category) => [category, skillCategoryLabel(category)]),
    ];
    return `
      <section class="skill-market-dialog">
        ${renderSkillMarketTabs()}
        ${
          state.skillMarketTab === "mine"
            ? renderPublishedSkillsPanel()
            : `
              <div class="skill-market-dialog-tools">
                <label class="skill-market-search">
                  ${icon("search")}
                  <input id="skill-market-search" type="search" value="${escapeHtml(state.skillMarketQuery)}" placeholder="搜索技能名称、用途或来源" autocomplete="off" aria-label="搜索技能市场" />
                </label>
                <button class="icon-button skill-market-refresh" type="button" aria-label="刷新技能市场">${icon("refresh-cw")}</button>
              </div>
              <div class="workspace-filter-row skill-market-filters" aria-label="技能市场分类">
                ${categories
                  .map(
                    ([value, label]) => `
                      <button class="workspace-filter ${state.skillMarketFilter === value ? "is-active" : ""}" data-skill-market-filter="${value}" type="button" aria-pressed="${state.skillMarketFilter === value}">${label}</button>
                    `,
                  )
                  .join("")}
              </div>
              <div class="skill-market-dialog-summary">
                <span>${visible.length} 项技能</span>
                <small>已审查来源，安装前会展示权限与风险。</small>
              </div>
              <div class="skill-market-dialog-list">
                ${
                  visible.length
                    ? visible
                        .map((skill) => {
                          const installed = state.marketInstalled.has(skill.id);
                          return `
                            <article class="skill-market-dialog-card" data-market-skill-id="${skill.id}">
                              <span class="skill-market-dialog-icon">${icon(skill.icon)}</span>
                              <div><strong>${escapeHtml(skill.title)}</strong><small>${escapeHtml(skill.badge)} · ${escapeHtml(skill.description)}</small></div>
                              <button class="secondary-button" data-install-market-skill="${skill.id}" type="button">${installed ? "已安装" : "安装"}</button>
                            </article>
                          `;
                        })
                        .join("")
                    : `<div class="workspace-panel-empty">${icon("search-x")}<strong>没有匹配的技能</strong><span>换一个关键词或分类试试。</span></div>`
                }
              </div>
            `
        }
      </section>
    `;
  }

  function persistPublishedSkills() {
    localStorage.setItem(
      "qianbian-desktop-published-skills",
      JSON.stringify(state.publishedSkills),
    );
  }

  function syncDesktopPublishPreview() {
    const draft = state.desktopPublishDraft;
    const name = railDialogHost.querySelector(
      "#desktop-publish-preview-name",
    );
    const summary = railDialogHost.querySelector(
      "#desktop-publish-preview-summary",
    );
    const category = railDialogHost.querySelector(
      "#desktop-publish-preview-category",
    );
    const source = railDialogHost.querySelector(
      "#desktop-publish-preview-source",
    );
    const fileName = railDialogHost.querySelector(
      "#desktop-publish-preview-file",
    );
    if (name) name.textContent = draft.name.trim() || "技能名称";
    if (summary) {
      summary.textContent =
        draft.summary.trim() || "一句话介绍会显示在这里";
    }
    if (category) {
      category.textContent =
        draft.category === "wellness"
          ? "健康"
          : draft.category === "growth"
            ? "成长"
            : "生活";
    }
    if (source) {
      source.textContent =
        draft.mode === "ai"
          ? "AI 帮写"
          : draft.mode === "online"
            ? "在线编写"
            : "上传文件";
    }
    if (fileName) {
      fileName.textContent =
        draft.mode === "upload"
          ? draft.packageName || "尚未拖入技能包"
          : draft.fileName || "skill.js";
    }
    railDialogHost
      .querySelector('[data-preview-check="name"]')
      ?.classList.toggle("is-done", Boolean(draft.name.trim()));
    railDialogHost
      .querySelector('[data-preview-check="summary"]')
      ?.classList.toggle("is-done", Boolean(draft.summary.trim()));
    const sourceReady =
      draft.mode === "upload"
        ? Boolean(draft.packageName)
        : draft.mode === "online"
          ? Boolean(draft.code.trim())
          : Boolean(draft.aiGenerated);
    railDialogHost
      .querySelector('[data-preview-check="source"]')
      ?.classList.toggle("is-done", sourceReady);
  }

  function setDesktopPublishPackage(fileOrName) {
    if (!fileOrName) return;
    if (typeof fileOrName === "string") {
      state.desktopPublishDraft.packageName = fileOrName;
      state.desktopPublishDraft.packageFile = null;
    } else {
      state.desktopPublishDraft.packageName = fileOrName.name || "";
      state.desktopPublishDraft.packageFile = fileOrName;
    }
    renderRailDialog();
    const name =
      typeof fileOrName === "string" ? fileOrName : fileOrName.name || "技能包";
    showToast(`已添加 ${name}`, "package-check");
  }

  function setSkillMarketTab(tab) {
    if (!["market", "mine"].includes(tab)) return;
    state.skillMarketTab = tab;
    renderRailDialog();
  }

  function openDesktopPublish() {
    state.desktopPublishDraft = {
      name: "",
      summary: "",
      category: "life",
      description: "",
      mode: "upload",
      packageName: "",
      packageFile: null,
      fileName: "skill.js",
      code: "",
      aiIdea: "",
      aiGenerated: false,
    };
    state.skillMarketTab = "publish";
    renderRailDialog();
    window.requestAnimationFrame(() => {
      railDialogHost
        .querySelector('[data-desktop-publish-field="name"]')
        ?.focus();
    });
  }

  function generateDesktopAiDraft() {
    const draft = state.desktopPublishDraft;
    const idea = draft.aiIdea.trim();
    if (!idea) {
      showToast("先告诉 AI 你想让技能做什么", "info");
      railDialogHost
        .querySelector('[data-desktop-publish-field="aiIdea"]')
        ?.focus();
      return;
    }
    draft.fileName = "ai-skill.js";
    draft.code = `// 千变 AI 生成的技能草稿
export const skill = {
  name: ${JSON.stringify(draft.name.trim() || "AI 技能")},
  goal: ${JSON.stringify(idea)},
  run(input, context) {
    return {
      summary: "围绕需求处理：" + ${JSON.stringify(idea)},
      steps: ["理解家庭场景", "整理可用信息", "返回执行结果"]
    };
  }
};`;
    draft.aiGenerated = true;
    renderRailDialog();
    showToast("AI 技能草稿已生成", "sparkles");
  }

  async function confirmDesktopPublish() {
    const draft = state.desktopPublishDraft;
    if (!draft.name.trim() || !draft.summary.trim()) {
      showToast("请填写技能名称和一句话介绍", "info");
      railDialogHost
        .querySelector(
          `[data-desktop-publish-field="${draft.name.trim() ? "summary" : "name"}"]`,
        )
        ?.focus();
      return;
    }
    if (draft.mode === "upload" && !draft.packageName) {
      showToast("请先拖入或选择技能包", "info");
      railDialogHost.querySelector("[data-desktop-dropzone]")?.focus();
      return;
    }
    if (draft.mode === "online" && !draft.code.trim()) {
      showToast("请先在线编写技能代码", "info");
      railDialogHost
        .querySelector('[data-desktop-publish-field="code"]')
        ?.focus();
      return;
    }
    if (draft.mode === "ai" && !draft.aiGenerated) {
      showToast("请先生成 AI 技能草稿", "info");
      railDialogHost
        .querySelector('[data-desktop-publish-field="aiIdea"]')
        ?.focus();
      return;
    }
    if (api && state.apiAvailable) {
      const formData = new FormData();
      formData.set("name", draft.name.trim());
      formData.set("summary", draft.summary.trim());
      formData.set("category", draft.category);
      formData.set("description", draft.description || "");
      formData.set(
        "mode",
        draft.mode === "upload" ? "upload" : "online",
      );
      if (draft.mode === "upload") {
        if (!draft.packageFile) {
          showToast("请选择实际的技能 ZIP 文件", "info");
          return;
        }
        formData.set("file", draft.packageFile);
      } else {
        formData.set("fileName", draft.fileName || "skill.js");
        formData.set("code", draft.code || "");
      }
      try {
        await api.publishSkill(formData);
        await refreshBackendSkills();
        state.skillMarketTab = "mine";
        renderRailDialog();
        showToast(`“${draft.name.trim()}”已提交发布`, "circle-check");
      } catch (error) {
        showToast(error.message || "技能发布失败", "circle-alert");
      }
      return;
    }
    const skill = {
      id: `published-${Date.now()}`,
      title: draft.name.trim() || "未命名技能",
      description: draft.summary.trim() || "未填写技能介绍",
      icon:
        draft.category === "wellness"
          ? "moon-star"
          : draft.category === "growth"
            ? "book-open"
            : "sparkles",
      category: draft.category,
      status: "published",
      updatedAt: "刚刚",
    };
    state.publishedSkills = [
      skill,
      ...state.publishedSkills.filter((item) => item.title !== skill.title),
    ];
    persistPublishedSkills();
    state.skillMarketTab = "mine";
    renderRailDialog();
    showToast(`“${skill.title}”已发布`, "circle-check");
  }

  function renderSkillNewDetail() {
    return renderDetailShell(
      "新建技能",
      "定义技能的用途、处理方式和输出标准。",
      `
        <section class="detail-block detail-form">
          <label><span>技能名称</span><input id="skill-name" placeholder="例如：产品需求整理" /></label>
          <label><span>用途说明</span><textarea id="skill-description" rows="3" placeholder="说明这个技能解决什么问题"></textarea></label>
          <label><span>处理要求</span><textarea id="skill-instructions" rows="5" placeholder="写下步骤、限制和输出格式"></textarea></label>
          <div class="form-actions">
            <button class="primary-button" data-save-skill type="button">${icon("check")}保存技能</button>
            <button class="secondary-button" data-close-detail type="button">取消</button>
          </div>
        </section>
      `,
      `
        <section class="detail-side-section">
          <span class="detail-side-label">建议</span>
          <p class="detail-note">先写清楚什么时候使用这个技能，再补充步骤和输出格式。</p>
        </section>
      `,
    );
  }

  function renderSkillDetail() {
    const skill = getDetailInfo(state.detail).skill;
    if (!skill) return renderDetailShell("技能详情", "未找到技能", "");
    return renderDetailShell(
      skill.title,
      skill.description,
      `
        <section class="detail-block">
          <div class="detail-block-head"><strong>能力范围</strong><span>已启用</span></div>
          <div class="tag-row">${skill.tags.map((tag) => `<span class="soft-tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="detail-list detail-list-spaced">
            <div class="detail-row">${icon("circle-check")}<span>适合任务</span><strong>桌面工作区内的重复工作</strong></div>
            <div class="detail-row">${icon("message-square")}<span>调用方式</span><strong>对话中自动选择或手动指定</strong></div>
          </div>
        </section>
        <section class="detail-block">
          <div class="detail-block-head"><strong>示例任务</strong><span>1 个</span></div>
          <p class="detail-note">请使用「${escapeHtml(skill.title)}」能力，帮我处理当前任务并给出可检查的结果。</p>
        </section>
      `,
      `
        <section class="detail-side-section">
          <button class="primary-button detail-full-button" data-use-skill="${skill.id}" type="button">${icon("arrow-up-right")}开始使用</button>
        </section>
      `,
    );
  }

  function renderAutomationDetail() {
    const automation = getDetailInfo(state.detail).automation;
    if (!automation) return renderDetailShell("自动化详情", "未找到自动化", "");
    const enabled = Boolean(
      automation.enabled ?? state.automationEnabled.get(automation.id),
    );
    return renderDetailShell(
      automation.title,
      automation.description,
      `
        <section class="detail-block">
          <div class="detail-block-head"><strong>执行设置</strong><span>${escapeHtml(automation.schedule)}</span></div>
          <div class="detail-list detail-list-spaced">
            <div class="detail-row">${icon("clock-3")}<span>触发时间</span><strong>${escapeHtml(automation.schedule)}</strong></div>
            <div class="detail-row">${icon("workflow")}<span>执行内容</span><strong>${escapeHtml(automation.description)}</strong></div>
            <div class="detail-row">${icon("bell")}<span>完成后通知</span><strong>站内提示</strong></div>
          </div>
        </section>
        <section class="detail-block">
          <div class="detail-block-head"><strong>最近运行</strong><span>演示数据</span></div>
          <div class="activity-row">${icon("circle-check")}<span class="file-copy"><strong>执行成功</strong><small>生成结果并保存到工作区</small></span><span>昨天</span></div>
        </section>
      `,
      `
        <section class="detail-side-section">
          <span class="detail-side-label">当前状态</span>
          <button class="switch ${enabled ? "is-on" : ""}" data-automation="${automation.id}" type="button" aria-label="${enabled ? "停用" : "启用"}${escapeHtml(automation.title)}" aria-pressed="${enabled}"></button>
        </section>
        <section class="detail-side-section">
          <button class="secondary-button detail-full-button" data-toast="已开始一次演示运行" type="button">${icon("play")}立即运行</button>
        </section>
      `,
    );
  }

  function renderAutomationNewDetail() {
    return renderDetailShell(
      "新建自动化",
      "设置触发条件、执行内容和通知方式。",
      `
        <section class="detail-block detail-form">
          <label><span>名称</span><input id="automation-name" placeholder="例如：每日工作摘要" /></label>
          <label><span>触发方式</span><select id="automation-trigger"><option>每天</option><option>每周</option><option>手动触发</option><option>文件变化时</option></select></label>
          <label><span>执行内容</span><textarea id="automation-instructions" rows="5" placeholder="说明需要自动完成什么"></textarea></label>
          <div class="form-actions">
            <button class="primary-button" data-create-automation type="button">${icon("check")}创建自动化</button>
            <button class="secondary-button" data-close-detail type="button">取消</button>
          </div>
        </section>
      `,
      `<section class="detail-side-section"><span class="detail-side-label">提示</span><p class="detail-note">自动化默认只在本地模拟运行，不会连接外部服务。</p></section>`,
    );
  }

  function renderFileDetailView() {
    const file = getDetailInfo(state.detail).file || {
      type: "文件",
      size: "",
      preview: "没有可预览内容",
    };
    return renderDetailShell(
      state.detail.id,
      "查看当前桌面工作区中的文件内容与用途。",
      `
        <section class="detail-block">
          <div class="detail-block-head"><strong>文件预览</strong><span>${escapeHtml(file.size)}</span></div>
          ${
            file.image
              ? `<div class="workspace-detail-image"><img src="${escapeHtml(file.image)}" alt="${escapeHtml(getDetailInfo(state.detail)?.title || "")}" /><p>${escapeHtml(file.preview)}</p></div>`
              : `<pre class="code-preview">${escapeHtml(file.preview)}</pre>`
          }
        </section>
      `,
      `
        <section class="detail-side-section">
          <span class="detail-side-label">文件信息</span>
          <div class="detail-list">
            <div class="detail-row">${icon("file-code-2")}<span>类型</span><strong>${escapeHtml(file.type)}</strong></div>
            <div class="detail-row">${icon("hard-drive")}<span>大小</span><strong>${escapeHtml(file.size)}</strong></div>
          </div>
        </section>
        <section class="detail-side-section">
          <button class="secondary-button detail-full-button" data-toast="文件操作入口已就绪" type="button">${icon("more-horizontal")}更多操作</button>
        </section>
      `,
    );
  }

  function renderVoiceDetailView() {
    return renderDetailShell(
      "语音输入",
      "选择输入设备和语言，开始语音转写。",
      `
        <section class="detail-block detail-form">
          <label><span>输入设备</span><select><option>系统默认麦克风</option><option>内置麦克风</option></select></label>
          <label><span>识别语言</span><select><option>中文普通话</option><option>英语</option></select></label>
          <div class="voice-capture">
            <span class="voice-orb">${icon("mic")}</span>
            <strong>准备录音</strong>
            <small>点击开始后，语音会转换为可编辑文本。</small>
            <button class="primary-button" data-voice-start type="button">${icon("mic")}开始录音</button>
          </div>
        </section>
      `,
      `<section class="detail-side-section"><span class="detail-side-label">隐私</span><p class="detail-note">当前为本地界面演示，不会真正访问麦克风。</p></section>`,
    );
  }

  function renderActionDialogContent(action) {
    if (!action) return "";
    let primary = "";
    if (["upload-file", "add-image", "choose-folder"].includes(action.id)) {
      primary = `
        <section class="detail-block">
          <div class="source-dropzone">
            ${icon(action.icon)}
            <strong>${escapeHtml(action.label)}</strong>
            <span>${escapeHtml(action.description)}</span>
            <button class="primary-button" data-toast="${escapeHtml(action.label)}入口已就绪" type="button">选择来源</button>
          </div>
        </section>
      `;
    } else if (action.id === "screenshot") {
      primary = `
        <section class="detail-block">
          <div class="detail-block-head"><strong>选择截取范围</strong><span>本机</span></div>
          <div class="choice-list">
            <button class="choice-row" data-toast="窗口截取入口已就绪" type="button"><span class="choice-icon">${icon("panel-top")}</span><span class="choice-copy"><strong>选择窗口</strong><small>截取一个应用窗口</small></span>${icon("chevron-right")}</button>
            <button class="choice-row" data-toast="区域截取入口已就绪" type="button"><span class="choice-icon">${icon("scan")}</span><span class="choice-copy"><strong>选择区域</strong><small>拖动选择屏幕区域</small></span>${icon("chevron-right")}</button>
            <button class="choice-row" data-toast="全屏截取入口已就绪" type="button"><span class="choice-icon">${icon("monitor")}</span><span class="choice-copy"><strong>整个屏幕</strong><small>截取当前显示器</small></span>${icon("chevron-right")}</button>
          </div>
        </section>
      `;
    } else if (action.id === "paste-content") {
      primary = `
        <section class="detail-block detail-form">
          <label><span>剪贴板预览</span><textarea rows="7" placeholder="把文本粘贴到这里"></textarea></label>
          <div class="form-actions"><button class="primary-button" data-toast="内容已加入输入区" type="button">${icon("clipboard-paste")}加入输入区</button></div>
        </section>
      `;
    } else if (action.id === "quote-conversation") {
      primary = `
        <section class="detail-block">
          <div class="detail-block-head"><strong>选择对话</strong><span>${SESSIONS.length} 个</span></div>
          <div class="detail-session-list">
            ${SESSIONS.map(
              (session) => `<button class="detail-session-row" data-quote-session="${session.id}" type="button">${icon(session.icon)}<span><strong>${escapeHtml(session.title)}</strong><small>${escapeHtml(session.meta)}</small></span>${icon("quote")}</button>`,
            ).join("")}
          </div>
        </section>
      `;
    } else if (action.id === "invoke-skill") {
      primary = `
        <section class="detail-block">
          <div class="detail-block-head"><strong>选择技能</strong><span>${getActiveSkills().length} 个</span></div>
          <div class="detail-session-list">
            ${getActiveSkills().map(
              (skill) => `<button class="detail-session-row" data-use-skill="${skill.id}" type="button">${icon(skill.icon)}<span><strong>${escapeHtml(skill.title)}</strong><small>${escapeHtml(skill.description)}</small></span>${icon("arrow-up-right")}</button>`,
            ).join("")}
          </div>
        </section>
      `;
    } else {
      primary = `
        <section class="detail-block">
          <div class="detail-block-head"><strong>工作区工具</strong><span>选择入口</span></div>
          <div class="detail-session-list">
            <button class="detail-session-row" data-view="skills" type="button">${icon("sparkles")}<span><strong>技能空间</strong><small>管理当前可用能力</small></span>${icon("chevron-right")}</button>
            <button class="detail-session-row" data-view="automation" type="button">${icon("workflow")}<span><strong>自动化</strong><small>查看自动运行任务</small></span>${icon("chevron-right")}</button>
            <button class="detail-session-row" data-view="settings" type="button">${icon("settings-2")}<span><strong>设置</strong><small>调整工作区偏好</small></span>${icon("chevron-right")}</button>
          </div>
        </section>
      `;
    }
    return primary;
  }

  function renderActionDetailView() {
    const action = getDetailInfo(state.detail).action;
    if (!action) return renderDetailShell("添加上下文", "未找到操作", "");
    return renderDetailShell(
      action.label,
      action.description,
      renderActionDialogContent(action),
      `<section class="detail-side-section"><span class="detail-side-label">说明</span><p class="detail-note">添加的内容会进入当前对话上下文，不会自动发送消息。</p></section>`,
    );
  }

  function renderDetailView() {
    const type = state.detail.type;
    if (type === "model") return renderModelDetail();
    if (type === "workspace") return renderWorkspaceDetail();
    if (type === "skillNew") return renderSkillNewDetail();
    if (type === "skillDetail") return renderSkillDetail();
    if (type === "automationNew") return renderAutomationNewDetail();
    if (type === "automationDetail") return renderAutomationDetail();
    if (type === "file") return renderFileDetailView();
    if (type === "voice") return renderVoiceDetailView();
    if (type === "action") return renderActionDetailView();
    return renderDetailShell("详情", "页面正在准备中。", "");
  }

  function openDetail(type, id = null, root = null) {
    closeWorkspacePanel({ renderNow: false });
    state.actionDialog = null;
    state.workspaceMenuOpen = false;
    if (root) state.railDialog = { root };
    else state.railDialog ||= { root: "none" };
    state.detail = { type, id, from: state.view };
    state.composerOpen = false;
    state.composerOpening = false;
    state.composerClosing = false;
    state.pendingApprovals = [];
    state.pendingInputs = [];
    renderBackendPrompts();
    render();
    window.requestAnimationFrame(() => {
      railDialogHost
        .querySelector("[data-rail-dialog-back], [data-close-rail-dialog]")
        ?.focus();
    });
  }

  function closeDetail() {
    if (!state.railDialog) return;
    if (
      ["none", "model", "side-settings"].includes(state.railDialog.root)
    ) {
      closeRailDialog();
      return;
    }
    state.detail = null;
    render();
    window.requestAnimationFrame(() => {
      railDialogHost.querySelector("[data-close-rail-dialog]")?.focus();
    });
  }

  function renderActionDialog() {
    if (!state.actionDialog) {
      actionDialogHost.innerHTML = "";
      return;
    }
    const action = COMPOSE_ACTIONS.find(
      (item) => item.id === state.actionDialog,
    );
    if (!action || action.disabled) {
      actionDialogHost.innerHTML = "";
      return;
    }
    actionDialogHost.innerHTML = `
      <div class="action-dialog-layer">
        <button class="action-dialog-backdrop" data-close-action-dialog type="button" aria-label="关闭悬浮框"></button>
        <section class="action-dialog" role="dialog" aria-modal="true" aria-labelledby="action-dialog-title">
          <header class="action-dialog-head">
            <div>
              <span class="eyebrow">添加内容</span>
              <h2 id="action-dialog-title">${escapeHtml(action.label)}</h2>
              <p>${escapeHtml(action.description)}</p>
            </div>
            <button class="icon-button action-dialog-close" data-close-action-dialog type="button" aria-label="关闭">${icon("x")}</button>
          </header>
          <div class="action-dialog-body">${renderActionDialogContent(action)}</div>
          <footer class="action-dialog-foot">${icon("info")}<span>添加的内容会进入当前对话上下文，不会自动发送消息。</span></footer>
        </section>
      </div>
    `;
    updateIcons(actionDialogHost);
  }

  function getRailDialogInfo() {
    if (!state.railDialog) return null;
    if (state.railDialog.root === "right-detail" && state.rightDetail) {
      const detail = getRightDetailData();
      return {
        title: detail?.title || "详情",
        description: "查看完整内容与相关状态。",
      };
    }
    if (state.detail) {
      const info = getDetailInfo(state.detail);
      if (state.detail.type === "workspace") {
        return {
          ...info,
          title: `${state.workspaceName}详情`,
          description: "查看当前工作区的文件、会话和运行状态。",
        };
      }
      return info;
    }
    if (state.railDialog.root === "ui-widget") {
      const widget = getUiWidget(state.railDialog.widgetId);
      return {
        title: widget?.title || "工作区模块",
        description:
          widget?.kind === "feed"
            ? "通用数据流模块"
            : "由当前账号工作区提供的通用模块",
      };
    }
    if (state.railDialog.root === "skill-market") {
      if (state.detail) return null;
      if (state.skillMarketTab === "publish") {
        return {
          title: "发布技能",
          description: "填写技能信息、选择来源并确认发布。",
        };
      }
      if (state.skillMarketTab === "mine") {
        return {
          title: "我的发布",
          description: "查看自己发布的技能，并创建新的生活技能。",
        };
      }
    }
    const info = {
      skills: {
        title: VIEW_META.skills.title,
        description: "浏览、筛选并调用当前工作区可用的能力。",
      },
      automation: {
        title: VIEW_META.automation.title,
        description: "管理计划任务、启停状态与执行方式。",
      },
      "skill-market": {
        title: "技能市场",
        description: "搜索、筛选并安装适合当前工作区的技能。",
      },
      context: {
        title: "平台信息",
        description: "查看同步状态、运行方式与当前上下文。",
      },
    }[state.railDialog.root];
    return info || { title: "详情", description: "查看当前工作区信息。" };
  }

  function renderContextDialog() {
    const tabs = [
      ["overview", "概览"],
      ["files", "文件"],
      ["activity", "活动"],
    ];
    const body =
      state.contextTab === "files"
        ? renderContextFiles()
        : state.contextTab === "activity"
          ? renderContextActivity()
          : renderContextOverview();
    return `
      <div class="context-dialog-view">
        <div class="context-tabs rail-context-tabs" role="tablist" aria-label="平台信息分类">
          ${tabs
            .map(
              ([id, label]) => `
                <button class="${state.contextTab === id ? "is-active" : ""}" data-context-tab="${id}" type="button" role="tab" aria-selected="${state.contextTab === id}">${label}</button>
              `,
            )
            .join("")}
        </div>
        <div class="context-dialog-body">${body}</div>
      </div>
    `;
  }

  function getRightDetailData() {
    if (!state.rightDetail) return null;
    const { type, id } = state.rightDetail;
    if (type === "task") {
      return {
        ...TASK_ACTIVITIES.find((item) => item.id === id),
        typeLabel: "任务动态",
      };
    }
    if (type === "reminder") {
      const reminder = getAllReminders().find((item) => item.id === id);
      return reminder
        ? {
            ...reminder,
            typeLabel: "提醒任务",
            status: state.reminderState[id] ? "已开启" : "已关闭",
            fields: [
              ["状态", state.reminderState[id] ? "已开启" : "已关闭"],
              ["提醒时间", reminder.time],
              ["重复节奏", reminder.cadence],
              ["提醒类型", "本地提醒"],
              ["通知方式", "站内提示"],
            ],
          }
        : null;
    }
    if (type === "memory") {
      const memory = getAllMemories().find((item) => item.id === id);
      return memory
        ? {
            ...memory,
            typeLabel: "记忆与个性",
            status: state.memoryPins.has(id) ? "已置顶" : "长期记忆",
            fields: [
              ["分类", memory.category],
              ["来源", memory.id.startsWith("custom-") ? "手动添加" : "对话洞察"],
              ["置信度", "高"],
              ["更新时间", memory.id.startsWith("custom-") ? "刚刚" : "最近 7 天"],
              ["作用范围", state.workspaceName],
              ["状态", state.memoryPins.has(id) ? "已置顶" : "长期记忆"],
            ],
          }
        : null;
    }
    if (type === "skill") {
      const skill = SKILLS.find((item) => item.id === id);
      return skill
        ? {
            ...skill,
            title: skill.title,
            description: skill.description,
            typeLabel: "技能配置",
            status: state.disabledSkills.has(id) ? "已停用" : "已启用",
            fields: [
              ["版本", "1.0.0"],
              ["作者", "千变本地技能"],
              ["权限", "读取当前对话 · 生成内容"],
              ["来源", "当前工作区"],
              ["最近使用", "今天"],
              ["使用场景", skill.description],
            ],
          }
        : null;
    }
    return null;
  }

  function renderRightDetail() {
    const detail = getRightDetailData();
    if (!detail) {
      return `<div class="workspace-panel-empty">${icon("search-x")}<strong>内容不存在</strong></div>`;
    }
    return `
      <section class="right-detail-dialog">
        <div class="right-detail-hero">
          <span class="right-detail-icon">${icon(detail.icon || "circle-dot")}</span>
          <div>
            <span class="eyebrow">${escapeHtml(detail.typeLabel)}</span>
            <h3>${escapeHtml(detail.title)}</h3>
            <p>${escapeHtml(detail.description || "")}</p>
          </div>
        </div>
        <div class="right-detail-grid">
          ${(detail.fields || [
            ["状态", detail.status || "正常"],
            ...(detail.time ? [["时间", detail.time]] : []),
            ...(detail.cadence ? [["节奏", detail.cadence]] : []),
            ...(detail.meta ? [["信息", detail.meta]] : []),
            ...(detail.category ? [["分类", detail.category]] : []),
            ...(detail.tags ? [["标签", detail.tags.join(" · ")]] : []),
          ])
            .map(
              ([label, value]) => `
                <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
              `,
            )
            .join("")}
        </div>
        ${
          state.rightDetail.type === "reminder"
            ? `
              <section class="right-detail-form">
                <div class="right-detail-section-head"><strong>编辑提醒</strong><span>修改后立即生效</span></div>
                <label><span>提醒内容</span><input id="detail-reminder-title" value="${escapeHtml(detail.title)}" /></label>
                <label><span>提醒时间</span><select id="detail-reminder-time">${renderTimeOptions(detail.time)}</select></label>
                <div class="right-detail-field"><span>重复节奏</span>${renderCadencePicker("detail", detail.cadence)}</div>
                <label><span>说明</span><textarea id="detail-reminder-description" rows="3">${escapeHtml(detail.description || "")}</textarea></label>
                <label class="right-detail-switch-row"><span>启用提醒</span><input id="detail-reminder-enabled" type="checkbox" ${state.reminderState[state.rightDetail.id] ? "checked" : ""} /></label>
                <button class="workspace-primary-button right-detail-action" data-save-right-reminder type="button">${icon("check")}保存修改</button>
              </section>
            `
            : ""
        }
        ${
          detail.prompt
            ? `<section class="right-detail-section"><span>内容说明</span><p>${escapeHtml(detail.prompt)}</p></section>`
            : ""
        }
        ${
          state.rightDetail.type === "memory"
            ? `
              <section class="right-detail-section">
                <span>记忆说明</span>
                <p>${escapeHtml(detail.description || "")}</p>
              </section>
              <section class="right-detail-section">
                <span>使用方式</span>
                <p>千变会在相关对话、任务规划和偏好判断中参考这条记忆，并始终允许你调整或删除。</p>
              </section>
            `
            : ""
        }
        ${
          state.rightDetail.type === "skill"
            ? `<button class="workspace-primary-button right-detail-action" data-use-skill="${state.rightDetail.id}" type="button">${icon("arrow-up-right")}打开技能</button>`
            : ""
        }
        ${
          ["skill", "reminder", "memory"].includes(state.rightDetail.type)
            ? `<button class="right-detail-delete" data-delete-right-item type="button">${icon("trash-2")}删除${state.rightDetail.type === "skill" ? "技能" : state.rightDetail.type === "reminder" ? "提醒" : "记忆"}</button>`
            : ""
        }
      </section>
    `;
  }

  function renderRailDialogContent() {
    if (state.detail) return renderDetailView();
    if (state.railDialog?.root === "right-detail") {
      return renderRightDetail();
    }
    if (state.railDialog?.root === "ui-widget") return renderUiWidgetPanel();
    if (state.railDialog?.root === "skills") return renderSkillsView();
    if (state.railDialog?.root === "skill-market") {
      return renderSkillMarketDialog();
    }
    if (state.railDialog?.root === "automation") return renderAutomationView();
    if (state.railDialog?.root === "context") return renderContextDialog();
    return "";
  }

  function renderRailDialog() {
    if (!state.railDialog) {
      railDialogHost.innerHTML = "";
      body.classList.remove("rail-dialog-open");
      return;
    }
    const info = getRailDialogInfo();
    const canGoBack =
      Boolean(state.detail) &&
      !["none", "model"].includes(state.railDialog.root);
    const skillMarketMotionClass =
      state.railDialog.root === "skill-market"
        ? skillMarketEntering
          ? "is-entering is-measuring"
          : "is-stable"
        : "";
    railDialogHost.innerHTML = `
      <div class="rail-dialog-layer">
        <button class="rail-dialog-backdrop" data-close-rail-dialog type="button" aria-label="关闭弹窗"></button>
        <section class="rail-dialog rail-dialog-${escapeHtml(state.railDialog.root)} ${skillMarketMotionClass}" role="dialog" aria-modal="true" aria-labelledby="rail-dialog-title">
          <header class="rail-dialog-head">
            <div class="rail-dialog-title-wrap">
              ${
                canGoBack
                  ? `<button class="icon-button rail-dialog-back" data-rail-dialog-back type="button" aria-label="返回">${icon("arrow-left")}</button>`
                  : ""
              }
              <div>
                <span class="eyebrow">${state.detail ? "当前详情" : "工作区"}</span>
                <h2 id="rail-dialog-title">${escapeHtml(info?.title || "详情")}</h2>
                <p>${escapeHtml(info?.description || "")}</p>
              </div>
            </div>
            <button class="icon-button rail-dialog-close" data-close-rail-dialog type="button" aria-label="关闭弹窗">${icon("x")}</button>
          </header>
          <div class="rail-dialog-body">${renderRailDialogContent()}</div>
        </section>
      </div>
    `;
    body.classList.add("rail-dialog-open");
    updateIcons(railDialogHost);
  }

  function renderSettingsSheet() {
    if (!settingsSheetHost) return;
    if (!state.settingsSheetOpen) {
      settingsSheetHost.innerHTML = "";
      body.classList.remove("settings-sheet-open");
      return;
    }
    settingsSheetHost.innerHTML = `
      <div class="settings-sheet-layer">
        <button class="settings-sheet-backdrop" data-close-settings type="button" aria-label="关闭设置"></button>
        <section class="settings-sheet ${settingsSheetEntering ? "is-entering is-measuring" : "is-stable"}" role="dialog" aria-modal="true" aria-labelledby="settings-sheet-title">
          <header class="settings-sheet-head">
            <div>
              <span class="eyebrow">工作区设置</span>
              <h2 id="settings-sheet-title">设置</h2>
            </div>
            <button class="icon-button settings-sheet-close" data-close-settings type="button" aria-label="关闭设置">${icon("x")}</button>
          </header>
          <div class="settings-sheet-body">${renderSettingsView()}</div>
        </section>
      </div>
    `;
    body.classList.add("settings-sheet-open");
    updateIcons(settingsSheetHost);
    if (settingsSheetEntering) {
      window.requestAnimationFrame(() => {
        const sheet = settingsSheetHost.querySelector(".settings-sheet");
        const trigger = document.querySelector("[data-open-settings]");
        if (!sheet || !trigger) return;
        const sheetRect = sheet.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        sheet.style.setProperty(
          "--settings-origin-x",
          `${triggerRect.left + triggerRect.width / 2 - sheetRect.left}px`,
        );
        sheet.style.setProperty(
          "--settings-origin-y",
          `${triggerRect.top + triggerRect.height / 2 - sheetRect.top}px`,
        );
        sheet.classList.remove("is-measuring");
        settingsSheetEntering = false;
      });
    }
  }

  function openSettingsSheet() {
    closeWorkspacePanel({ renderNow: false });
    state.settingsSheetOpen = true;
    state.railDialog = null;
    state.actionDialog = null;
    settingsSheetEntering = true;
    render();
    window.requestAnimationFrame(() => {
      settingsSheetHost
        .querySelector(".settings-sheet [data-close-settings]")
        ?.focus();
    });
  }

  function closeSettingsSheet() {
    state.settingsSheetOpen = false;
    renderSettingsSheet();
    document.querySelector("[data-open-settings]")?.focus();
  }

  function persistAccountProfile() {
    localStorage.setItem(
      "qianbian-desktop-account-profile",
      JSON.stringify({
        accountId: state.currentAccountId,
        name: state.accountName,
        email: state.accountEmail,
        bio: state.accountBio,
        avatar: state.accountAvatar,
        phone: state.accountPhone,
        role: state.accountRole,
        company: state.accountCompany,
        location: state.accountLocation,
        locationAuto: state.accountLocationAuto,
        timezone: state.accountTimezone,
        language: state.accountLanguage,
        loggedIn: state.loggedIn,
      }),
    );
  }

  function renderAccountDeviceTasks() {
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
          <article class="account-device-task" data-task-id="${escapeHtml(
            task.id || task.type,
          )}">
            <span class="account-device-task-icon">${icon(
              taskUtils?.iconName(task.type) || "file-search",
            )}</span>
            <span class="account-device-task-copy">
              <strong>${escapeHtml(task.typeLabel)}</strong>
              <small>${escapeHtml(device?.name || "未知设备")}${
                task.error ? ` · ${escapeHtml(task.error)}` : ""
              }</small>
            </span>
            <span class="task-status task-status-${escapeHtml(task.tone)}">${escapeHtml(
              task.statusLabel,
            )}</span>
            <span class="account-device-task-duration">${escapeHtml(
              duration || "—",
            )}</span>
          </article>
        `;
      })
      .join("");
    return `
      <div class="account-device-tasks">
        <div class="account-device-tasks-head">
          <div>
            <strong>设备任务</strong>
            <span>${state.deviceTasks.length} 条记录</span>
          </div>
          <button data-refresh-device-tasks type="button">${icon(
            "refresh-cw",
          )}刷新</button>
        </div>
        ${
          state.deviceTasksError
            ? `<p class="account-device-error">${escapeHtml(
                state.deviceTasksError,
              )}</p>`
            : ""
        }
        <div class="account-device-task-list">
          ${
            state.deviceTasksLoading
              ? `<p class="account-device-empty">正在读取设备任务…</p>`
              : rows ||
                `<p class="account-device-empty">${
                  state.deviceTasksLoaded
                    ? "暂无设备任务"
                    : "等待读取设备任务"
                }</p>`
          }
        </div>
      </div>
    `;
  }

  async function openBackendDevicePermissions(deviceId) {
    if (!api || !state.apiAvailable || !deviceId) return;
    const settingsUtils = window.QianbianDeviceSettings;
    if (!settingsUtils) return;
    state.devicePermissionId = String(deviceId);
    state.devicePermissions = null;
    state.devicePermissionsLoading = true;
    state.devicePermissionsSaving = false;
    state.devicePermissionsError = "";
    state.deviceAudit = [];
    state.deviceAuditLoading = true;
    renderAccountDialog();
    const [permissionsResult, auditResult] = await Promise.allSettled([
      api.devicePermissions(deviceId),
      api.deviceAudit(deviceId),
    ]);
    if (state.devicePermissionId !== String(deviceId)) return;
    if (permissionsResult.status === "fulfilled") {
      state.devicePermissions = settingsUtils.normalizePermissions(
        permissionsResult.value,
      );
    } else {
      state.devicePermissionsError = "设备权限读取失败";
    }
    state.devicePermissionsLoading = false;
    state.deviceAudit =
      auditResult.status === "fulfilled"
        ? settingsUtils.normalizeAudit(auditResult.value)
        : [];
    state.deviceAuditLoading = false;
    renderAccountDialog();
  }

  async function refreshBackendDeviceAudit(deviceId) {
    if (!api || !state.apiAvailable || !deviceId) return;
    const settingsUtils = window.QianbianDeviceSettings;
    if (!settingsUtils) return;
    state.deviceAuditLoading = true;
    try {
      state.deviceAudit = settingsUtils.normalizeAudit(
        await api.deviceAudit(deviceId),
      );
    } catch {
      state.deviceAudit = [];
    } finally {
      if (state.devicePermissionId === String(deviceId)) {
        state.deviceAuditLoading = false;
        renderAccountDialog();
      }
    }
  }

  async function saveBackendDevicePermissions() {
    const deviceId = state.devicePermissionId;
    const host = accountDialogHost.querySelector("[data-device-permissions]");
    if (!deviceId || !host || !api || !state.apiAvailable) return;
    const settingsUtils = window.QianbianDeviceSettings;
    if (!settingsUtils) return;
    const allowedRoots = String(
      host.querySelector("[data-device-permission-roots]")?.value || "",
    )
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    const payload = {
      allowedRoots,
      terminal: Boolean(
        host.querySelector("[data-device-permission-terminal]")?.checked,
      ),
      files: Boolean(
        host.querySelector("[data-device-permission-files]")?.checked,
      ),
      screenshot: Boolean(
        host.querySelector("[data-device-permission-screenshot]")?.checked,
      ),
    };
    state.devicePermissionsSaving = true;
    state.devicePermissionsError = "";
    renderAccountDialog();
    try {
      const result = await api.updateDevicePermissions(deviceId, payload);
      if (state.devicePermissionId !== String(deviceId)) return;
      state.devicePermissions = settingsUtils.normalizePermissions(result);
      state.devicePermissionsSaving = false;
      renderAccountDialog();
      showToast("设备权限已保存", "shield-check");
      refreshBackendDeviceAudit(deviceId);
    } catch (error) {
      state.devicePermissionsSaving = false;
      state.devicePermissionsError =
        error.message || "设备权限保存失败";
      renderAccountDialog();
    }
  }

  function renderAccountDevicePermissions() {
    if (!state.devicePermissionId) return "";
    const device = state.devices.find(
      (item) => item.id === String(state.devicePermissionId),
    );
    if (!device) return "";
    const fallbackPermissions =
      device.permissions && typeof device.permissions === "object"
        ? device.permissions
        : {};
    const permissions = state.devicePermissions || {
      allowedRoots: Array.isArray(fallbackPermissions.allowedRoots)
        ? fallbackPermissions.allowedRoots
        : Array.isArray(fallbackPermissions.roots)
          ? fallbackPermissions.roots
          : [],
      files: fallbackPermissions.files !== false,
      terminal:
        fallbackPermissions.terminal === true ||
        device.capabilities.includes("terminal"),
      screenshot:
        fallbackPermissions.screenshot === true ||
        device.capabilities.includes("screenshot"),
    };
    const auditRows = state.deviceAudit
      .slice(0, 6)
      .map(
        (entry) => `
          <div class="account-device-audit-entry" data-device-audit-entry>
            <span class="task-status task-status-${escapeHtml(entry.tone)}">${escapeHtml(
              entry.actionLabel,
            )}</span>
            <span>${escapeHtml(entry.summary || entry.status || "设备操作")}</span>
            <time>${escapeHtml(formatBackendDateTime(entry.createdAt))}</time>
          </div>
        `,
      )
      .join("");
    return `
      <div class="account-device-permissions" data-device-permissions>
        <div class="account-device-permissions-head">
          <div>
            <strong>设备权限</strong>
            <span>${escapeHtml(device.name)}</span>
          </div>
          <button data-close-device-permissions type="button" aria-label="关闭权限卡片">${icon(
            "x",
          )}</button>
        </div>
        ${
          state.devicePermissionsError
            ? `<p class="account-device-error">${escapeHtml(
                state.devicePermissionsError,
              )}</p>`
            : ""
        }
        ${
          state.devicePermissionsLoading
            ? `<p class="account-device-empty">正在读取设备权限…</p>`
            : `
              <label class="account-device-permission-roots">
                <span>授权目录，每行一个</span>
                <textarea data-device-permission-roots rows="3">${escapeHtml(
                  permissions.allowedRoots.join("\n"),
                )}</textarea>
              </label>
              <div class="account-device-permission-toggles">
                <label><input type="checkbox" data-device-permission-files ${
                  permissions.files ? "checked" : ""
                } /><span>${icon("files")}文件访问</span></label>
                <label><input type="checkbox" data-device-permission-terminal ${
                  permissions.terminal ? "checked" : ""
                } /><span>${icon("terminal")}终端</span></label>
                <label><input type="checkbox" data-device-permission-screenshot ${
                  permissions.screenshot ? "checked" : ""
                } /><span>${icon("scan-line")}截图</span></label>
              </div>
              <button class="account-device-permission-save" data-save-device-permissions type="button" ${
                state.devicePermissionsSaving ? "disabled" : ""
              }>${icon("check")}${
                state.devicePermissionsSaving ? "保存中…" : "保存权限"
              }</button>
            `
        }
        <div class="account-device-audit">
          <div class="account-device-audit-head">
            <strong>最近审计</strong>
            ${
              state.deviceAuditLoading
                ? `<span>读取中…</span>`
                : `<span>${state.deviceAudit.length} 条</span>`
            }
          </div>
          ${
            auditRows ||
            (!state.deviceAuditLoading
              ? `<p class="account-device-empty">暂无审计记录</p>`
              : "")
          }
        </div>
      </div>
    `;
  }

  function renderAccountDialog() {
    if (!accountDialogHost) return;
    if (!state.accountDialogOpen) {
      accountDialogHost.innerHTML = "";
      return;
    }
    const current = ACCOUNTS.find(
      (account) => account.id === state.currentAccountId,
    );
    const deviceCards = state.devices
      .map(
        (device) => {
          const editing = state.deviceEditingId === device.id;
          return `
          <div class="account-device-row" data-device-id="${escapeHtml(device.id)}">
            <span class="account-device-icon">${icon(
              device.type === "android" ? "smartphone" : "laptop",
            )}</span>
            <span class="account-device-copy">
              ${
                editing
                  ? `<input class="account-device-name-input" data-device-name-input="${escapeHtml(
                      device.id,
                    )}" value="${escapeHtml(device.name)}" aria-label="设备名称" />`
                  : `<strong>${escapeHtml(device.name)}</strong>`
              }
              <small>${escapeHtml(
                devicePlatformLabel(device.platform),
              )} · ${deviceStateLabel(device)}</small>
            </span>
            <span class="account-device-actions">
              ${
                editing
                  ? `
                    <button class="account-device-icon-button is-primary" data-save-device-name="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="保存设备名称" title="保存">${icon(
                      "check",
                    )}</button>
                    <button class="account-device-icon-button" data-cancel-device-name type="button" aria-label="取消重命名" title="取消">${icon(
                      "x",
                    )}</button>
                  `
                  : `
                    <button class="account-device-icon-button" data-show-device-permissions="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="查看 ${escapeHtml(
                      device.name,
                    )} 的权限" title="设备权限">${icon(
                      "shield-check",
                    )}</button>
                    <button class="account-device-icon-button" data-edit-device="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="重命名 ${escapeHtml(
                      device.name,
                    )}" title="重命名">${icon("pencil")}</button>
                    <button class="account-device-icon-button" data-toggle-device-pause="${escapeHtml(
                      device.id,
                    )}" type="button" aria-label="${
                      device.paused ? "恢复" : "暂停"
                    } ${escapeHtml(device.name)}" title="${
                      device.paused ? "恢复设备" : "暂停设备"
                    }">${icon(device.paused ? "play" : "pause")}</button>
                  `
              }
              <button class="account-device-icon-button is-danger" data-delete-device="${escapeHtml(
                device.id,
              )}" type="button" aria-label="解绑 ${escapeHtml(
                device.name,
              )}" title="解绑设备">${icon("unlink")}</button>
            </span>
          </div>
        `;
        },
      )
      .join("");
    const deviceSection = `
      <section class="account-section">
        <div class="account-section-head">
          <strong>我的设备</strong>
          <button class="workspace-text-button" data-start-device-pair type="button">${icon(
            "plus",
          )}添加设备</button>
        </div>
        ${
          state.devicePairingFormOpen
            ? `<div class="account-device-pair-form" data-device-pair-form>
                <div class="account-device-pair-form-head">
                  <strong>添加设备</strong>
                  <span>选择设备端连接器</span>
                </div>
                <label>
                  <span>设备类型</span>
                  <select data-device-pair-type>
                    <option value="windows" ${
                      state.devicePairType === "windows" ? "selected" : ""
                    }>千变 for Windows</option>
                    <option value="android" ${
                      state.devicePairType === "android" ? "selected" : ""
                    }>千变 for Android</option>
                  </select>
                </label>
                <label>
                  <span>设备名称</span>
                  <input data-device-pair-name value="${escapeHtml(
                    state.devicePairName,
                  )}" placeholder="例如：工作笔记本" />
                </label>
                <div class="account-device-pair-form-actions">
                  <button class="workspace-primary-button" data-submit-device-pair type="button">${icon(
                    "qr-code",
                  )}生成配对码</button>
                  <button class="secondary-button" data-cancel-device-pair type="button">取消</button>
                </div>
              </div>`
            : ""
        }
        ${
          state.devicePairing
            ? `<div class="account-device-pair">
                <canvas class="device-pair-qr" data-qr-payload="${escapeHtml(
                  state.devicePairing.qrPayload ||
                    state.devicePairing.pairingCode ||
                    "",
                )}" width="176" height="176"></canvas>
                <span>配对码</span>
                <strong>${escapeHtml(state.devicePairing.pairingCode || "")}</strong>
                <button data-copy-device-pair type="button">${icon(
                  "copy",
                )}复制配对码</button>
                <small>在${
                  state.devicePairing.type === "android"
                    ? "千变 for Android"
                    : "千变 for Windows"
                }中输入配对码，有效期至 ${escapeHtml(
                  formatBackendDateTime(state.devicePairing.expiresAt),
                )}</small>
              </div>`
            : ""
        }
        ${
          state.deviceError
            ? `<p class="account-device-error">${escapeHtml(state.deviceError)}</p>`
            : ""
        }
        <div class="account-device-list">
          ${
            deviceCards ||
            `<p class="account-device-empty">${
              state.devicesLoaded ? "还没有已绑定设备" : "正在读取设备…"
            }</p>`
          }
        </div>
        ${renderAccountDevicePermissions()}
        ${renderAccountDeviceTasks()}
        <a class="account-device-download" data-open-connectors href="${escapeHtml(
          connectorPageUrl(),
        )}">${icon("download")}下载千变设备连接</a>
      </section>
    `;
    accountDialogHost.innerHTML = `
      <div class="account-dialog-layer">
        <button class="account-dialog-backdrop" data-close-account type="button" aria-label="关闭账号设置"></button>
        <section class="account-dialog ${accountDialogEntering ? "is-entering is-measuring" : "is-stable"}" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
          <header class="account-dialog-head">
            <div>
              <span class="eyebrow">账号</span>
              <h2 id="account-dialog-title">账号设置</h2>
            </div>
            <button class="icon-button account-dialog-close" data-close-account type="button" aria-label="关闭账号设置">${icon("x")}</button>
          </header>
          <div class="account-dialog-body">
            <div class="account-profile-hero">
              <button class="account-avatar-button" id="account-avatar-button" type="button" aria-label="编辑头像">
                <img src="${escapeHtml(state.accountAvatar)}" alt="账号头像" />
                <span class="account-avatar-edit">编辑头像</span>
              </button>
              <input id="account-avatar-upload" type="file" accept="image/*" hidden />
              <div class="account-profile-copy">
                <strong>${escapeHtml(state.accountName)}</strong>
                <small>${escapeHtml(state.accountRole)} · ${escapeHtml(state.accountCompany)}</small>
                <span>${escapeHtml(state.accountEmail)}</span>
              </div>
            </div>
            ${
              state.loggedIn
                ? `
                  <section class="account-section">
                    <div class="account-section-head"><strong>个人资料</strong><span>本地账号</span></div>
                    <div class="account-form account-form-grid">
                      <label><span>显示名称</span><input id="account-display-name" value="${escapeHtml(state.accountName)}" /></label>
                      <label><span>邮箱</span><input id="account-email" type="email" value="${escapeHtml(state.accountEmail)}" /></label>
                      <label><span>手机号</span><input id="account-phone" value="${escapeHtml(state.accountPhone)}" /></label>
                      <label><span>职位</span><input id="account-role" value="${escapeHtml(state.accountRole)}" /></label>
                      <label><span>公司 / 团队</span><input id="account-company" value="${escapeHtml(state.accountCompany)}" /></label>
                      <label><span>所在地</span><input id="account-location" value="${escapeHtml(state.accountLocation)}" /></label>
                      <label><span>时区</span><select id="account-timezone"><option value="Asia/Shanghai" ${state.accountTimezone === "Asia/Shanghai" ? "selected" : ""}>Asia/Shanghai</option><option value="Asia/Tokyo" ${state.accountTimezone === "Asia/Tokyo" ? "selected" : ""}>Asia/Tokyo</option><option value="Europe/London" ${state.accountTimezone === "Europe/London" ? "selected" : ""}>Europe/London</option><option value="America/Los_Angeles" ${state.accountTimezone === "America/Los_Angeles" ? "selected" : ""}>America/Los_Angeles</option></select></label>
                      <label><span>界面语言</span><select id="account-language"><option ${state.accountLanguage === "简体中文" ? "selected" : ""}>简体中文</option><option ${state.accountLanguage === "English" ? "selected" : ""}>English</option></select></label>
                      <label class="account-form-wide"><span>个人简介</span><textarea id="account-bio" rows="4">${escapeHtml(state.accountBio)}</textarea></label>
                      <button class="workspace-primary-button" data-save-account-profile type="button">${icon("check")}保存资料</button>
                    </div>
                  </section>
                  ${deviceSection}
                  <section class="account-section">
                    <div class="account-section-head"><strong>账号操作</strong><span>${ACCOUNTS.length} 个账号</span></div>
                    <div class="account-action-row">
                      <button class="account-action-button" data-toggle-account-switch type="button">${icon("users-round")}切换账号</button>
                      <button class="account-action-button" data-action="open-mobile-version" type="button">${icon("smartphone")}手机版</button>
                      <button class="account-action-button is-danger" data-account-logout type="button">${icon("log-out")}退出登录</button>
                    </div>
                    ${
                      state.accountSwitchOpen
                        ? `
                          <div class="account-switch-list">
                            ${ACCOUNTS.map(
                              (account) => `
                                <button class="account-switch-item ${account.id === state.currentAccountId ? "is-active" : ""}" data-switch-account="${account.id}" type="button" aria-pressed="${account.id === state.currentAccountId}">
                                  <span class="account-avatar">${escapeHtml(account.avatar)}</span>
                                  <span><strong>${escapeHtml(account.name)}</strong><small>${escapeHtml(account.email)}</small></span>
                                  ${account.id === state.currentAccountId ? icon("check") : icon("chevron-right")}
                                </button>
                              `,
                            ).join("")}
                          </div>
                        `
                        : ""
                    }
                  </section>
                `
                : `
                  <div class="account-logged-out">
                    ${icon("log-out")}
                    <strong>已退出登录</strong>
                    <span>本地资料仍会保留，可以随时重新登录。</span>
                    <button class="workspace-primary-button" data-account-login type="button">${icon("log-in")}重新登录</button>
                  </div>
                `
            }
          </div>
        </section>
      </div>
    `;
    updateIcons(accountDialogHost);
    const pairingQr = accountDialogHost.querySelector(".device-pair-qr");
    if (pairingQr && window.QianbianQR) {
      window.QianbianQR.render(pairingQr.dataset.qrPayload, pairingQr).catch(
        () => {
          pairingQr.hidden = true;
        },
      );
    }
    if (accountDialogEntering) {
      const dialog = accountDialogHost.querySelector(".account-dialog");
      const trigger = document.getElementById("account-menu-button");
      if (dialog && trigger) {
        const dialogRect = dialog.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        dialog.style.setProperty(
          "--account-panel-origin-x",
          `${triggerRect.left + triggerRect.width / 2 - dialogRect.left}px`,
        );
        dialog.style.setProperty(
          "--account-panel-origin-y",
          `${triggerRect.top + triggerRect.height / 2 - dialogRect.top}px`,
        );
        dialog.classList.remove("is-measuring");
      }
      accountDialogEntering = false;
    }
  }

  function openAccountDialog() {
    state.accountDialogOpen = true;
    state.accountSwitchOpen = false;
    accountDialogEntering = true;
    renderAccountDialog();
    if (api && state.apiAvailable) {
      refreshBackendDeviceTasks();
      startBackendDeviceTaskPolling();
    }
    window.requestAnimationFrame(() =>
      accountDialogHost.querySelector(".account-dialog-close")?.focus(),
    );
  }

  function closeAccountDialog() {
    stopBackendDeviceTaskPolling();
    state.accountDialogOpen = false;
    state.accountSwitchOpen = false;
    accountDialogEntering = false;
    renderAccountDialog();
    document.getElementById("account-menu-button")?.focus();
  }

  function saveAccountProfileFromDialog() {
    state.accountName =
      document.getElementById("account-display-name")?.value.trim() ||
      state.accountName;
    state.accountEmail =
      document.getElementById("account-email")?.value.trim() ||
      state.accountEmail;
    state.accountBio =
      document.getElementById("account-bio")?.value.trim() || state.accountBio;
    state.accountPhone =
      document.getElementById("account-phone")?.value.trim() || "";
    state.accountRole =
      document.getElementById("account-role")?.value.trim() || state.accountRole;
    state.accountCompany =
      document.getElementById("account-company")?.value.trim() ||
      state.accountCompany;
    const locationInput =
      document.getElementById("account-location")?.value.trim() || "";
    if (locationInput && locationInput !== state.accountLocation) {
      state.accountLocationAuto = false;
    }
    state.accountLocation = locationInput || state.accountLocation;
    state.accountTimezone =
      document.getElementById("account-timezone")?.value ||
      state.accountTimezone;
    state.accountLanguage =
      document.getElementById("account-language")?.value ||
      state.accountLanguage;
    persistAccountProfile();
    renderAccountDialog();
    renderContext();
    showToast("账号资料已更新", "user-round-check");
  }

  function uploadAccountAvatar(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("请选择图片文件", "circle-alert");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("头像图片不能超过 2 MB", "circle-alert");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.accountAvatar = String(reader.result || "");
      persistAccountProfile();
      renderAccountDialog();
      showToast("头像已更新", "image");
    });
    reader.readAsDataURL(file);
  }

  function isRealAuthEnvironment() {
    return (
      /^https?:$/.test(location.protocol) &&
      !location.hostname.endsWith("github.io") &&
      !["localhost", "127.0.0.1"].includes(location.hostname)
    );
  }

  function switchAccount(id) {
    if (isRealAuthEnvironment()) {
      localStorage.removeItem("qianbian-desktop-auth");
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      state.loggedIn = false;
      state.accountDialogOpen = false;
      state.accountSwitchOpen = false;
      persistAccountProfile();
      renderAccountDialog();
      render();
      window.dispatchEvent(new Event("qianbian:auth-required"));
      showToast("请登录另一个账号", "users-round");
      return;
    }
    const account = ACCOUNTS.find((item) => item.id === id);
    if (!account) return;
    state.currentAccountId = account.id;
    state.accountName = account.name;
    state.accountEmail = account.email;
    state.accountBio = account.description;
    state.accountSwitchOpen = false;
    state.accountAvatar = "assets/brand/qianbian-tile.png";
    state.accountPhone = "";
    state.accountRole = account.name;
    state.accountCompany = "千变实验室";
    state.accountLocation = "";
    state.accountLocationAuto = true;
    state.accountTimezone = "Asia/Shanghai";
    state.accountLanguage = "简体中文";
    const workspace =
      WORKSPACES.find((item) => item.id === account.id) || WORKSPACES[0];
    state.workspaceId = workspace.id;
    state.workspaceName = workspace.name;
    localStorage.setItem("qianbian-desktop-workspace", workspace.id);
    persistAccountProfile();
    renderAccountDialog();
    syncChrome();
    showToast(`已切换到${account.name}`, "users-round");
  }

  function openRailDialog(root, options = {}) {
    if (root === "settings") {
      openSettingsSheet();
      return;
    }
    skillMarketEntering = root === "skill-market";
    state.railDialog = { root };
    state.detail = null;
    state.actionDialog = null;
    state.workspaceMenuOpen = false;
    state.composerOpen = false;
    state.composerOpening = false;
    state.composerClosing = false;
    render();
    if (root === "skill-market") {
      const dialog = railDialogHost.querySelector(
        ".rail-dialog-skill-market",
      );
      if (dialog) {
        const originTrigger =
          options.trigger ||
          document.querySelector("[data-open-skill-market]:not([hidden])");
        if (originTrigger) {
          const dialogRect = dialog.getBoundingClientRect();
          const triggerRect = originTrigger.getBoundingClientRect();
          dialog.style.setProperty(
            "--skill-market-origin-x",
            `${triggerRect.left + triggerRect.width / 2 - dialogRect.left}px`,
          );
          dialog.style.setProperty(
            "--skill-market-origin-y",
            `${triggerRect.top + triggerRect.height / 2 - dialogRect.top}px`,
          );
        }
        dialog.classList.remove("is-measuring");
        skillMarketEntering = false;
      }
    }
    window.requestAnimationFrame(() => {
      railDialogHost.querySelector("[data-close-rail-dialog]")?.focus();
    });
  }

  function openRightDetail(type, id) {
    state.rightDetail = { type, id };
    openRailDialog("right-detail");
  }

  function closeRailDialog() {
    const restoreTarget = document.activeElement;
    skillMarketEntering = false;
    if (state.railDialog?.root === "ui-widget") stopUiWidgetRefresh();
    state.uiWidgetActiveId = null;
    state.railDialog = null;
    state.detail = null;
    render();
    window.requestAnimationFrame(() => {
      if (
        restoreTarget instanceof HTMLElement &&
        !restoreTarget.closest("#rail-dialog-host")
      ) {
        restoreTarget.focus();
      } else {
        document.querySelector(".primary-nav .nav-item.is-active")?.focus();
      }
    });
  }

  function openActionDialog(id) {
    state.actionDialog = id;
    state.composerOpen = false;
    state.composerOpening = false;
    state.composerClosing = false;
    render();
    window.requestAnimationFrame(() => {
      actionDialogHost.querySelector("[data-close-action-dialog]")?.focus();
    });
  }

  function closeActionDialog() {
    state.actionDialog = null;
    renderActionDialog();
    window.requestAnimationFrame(() => {
      document.getElementById("composer-plus")?.focus();
    });
  }

  function renderView() {
    const view = state.view;
    const meta = VIEW_META[view] || VIEW_META.chat;
    const detailInfo =
      state.detail && !state.railDialog ? getDetailInfo(state.detail) : null;
    pageTitle.textContent = detailInfo
      ? detailInfo.title
      : view === "chat" && state.activeSession
        ? SESSIONS.find((session) => session.id === state.activeSession)?.title ||
          meta.title
        : meta.title;
    breadcrumbCurrent.textContent = detailInfo
      ? `${meta.breadcrumb} / ${detailInfo.label}`
      : meta.breadcrumb;
    document.querySelectorAll("[data-view]").forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const environment = currentEnvironment();
    const environmentBadge = document.getElementById("header-environment");
    if (environmentBadge) {
      environmentBadge.innerHTML = `${icon(
        environment.kind === "cloud" ? "cloud" : "monitor",
      )}${escapeHtml(environment.name)}`;
    }

    let content = "";
    if (detailInfo) content = renderDetailView();
    else if (view === "skills") content = renderSkillsView();
    else if (view === "automation") content = renderAutomationView();
    else if (view === "settings") content = renderSettingsView();
    else content = renderChatView();
    viewScroll.innerHTML = content;
    updateIcons(viewScroll);
    if (view === "chat" && (state.messages.length || state.typing)) {
      window.requestAnimationFrame(syncChatAlignment);
    }
    if (view === "chat" && (state.messages.length || state.typing)) {
      scheduleThreadScrollToBottom();
    }
  }

  function renderComposer() {
    const visible = state.view === "chat" && !state.detail;
    composerZone.hidden = !visible;
    if (!visible) {
      composerHost.innerHTML = "";
      return;
    }
    const open = state.composerOpen;
    composerHost.innerHTML = `
      <div class="desktop-composer-stack ${open ? "is-open" : ""} ${open && state.composerOpening ? "is-opening" : ""}">
        ${
          state.quotedMessage
            ? `
              <div class="desktop-quote-preview">
                <span class="desktop-quote-icon">${icon("quote")}</span>
                <span class="desktop-quote-copy">
                  <strong>${escapeHtml(state.quotedMessage.author || "千变")}</strong>
                  <span>${escapeHtml(state.quotedMessage.text)}</span>
                </span>
                <button data-clear-quote type="button" aria-label="取消引用">${icon("x")}</button>
              </div>
            `
            : ""
        }
        <div class="desktop-composer-surface">
          <button class="composer-plus ${open ? "is-open" : ""}" id="composer-plus" type="button" aria-label="${open ? "关闭添加内容" : "添加内容"}" aria-expanded="${open}">
            ${icon(open ? "x" : "plus")}
          </button>
          <textarea class="desktop-composer-input" id="desktop-composer-input" rows="1" placeholder="${state.voiceRecording ? "正在录音，点击麦克风结束" : "发消息给千变"}">${escapeHtml(
            state.draft,
          )}</textarea>
          <button class="composer-mic ${state.voiceRecording ? "is-recording" : ""}" type="button" data-toggle-voice aria-label="${state.voiceRecording ? "结束录音" : "开始录音"}" aria-pressed="${state.voiceRecording}">${icon(state.voiceRecording ? "square" : "mic")}</button>
          <button class="composer-send" id="composer-send" type="button" aria-label="${state.typing && state.apiAvailable ? "停止生成" : "发送"}">${icon(state.typing && state.apiAvailable ? "square" : "arrow-up")}</button>
        </div>
        ${
          state.voiceRecording
            ? `
              <div class="composer-recording-bar">
                <span class="recording-pulse"></span>
                <strong>正在录音</strong>
                <span class="recording-time">${String(Math.floor(state.voiceSeconds / 60)).padStart(2, "0")}:${String(
                  state.voiceSeconds % 60,
                ).padStart(2, "0")}</span>
                <span>点击麦克风结束录音</span>
              </div>
            `
            : ""
        }
        ${
          open
            ? `
              <div class="composer-extension-wrap ${state.composerClosing ? "is-closing" : ""}">
                <div class="composer-extension-panel">
                  <div class="compose-action-grid">
                    ${COMPOSE_ACTIONS.map(
                      (action) => `
                        <button class="compose-action-tile" data-action-detail="${action.id}" type="button" title="${escapeHtml(action.description)}" ${action.disabled ? "disabled" : ""}>
                          <span class="compose-action-icon">${icon(action.icon)}</span>
                          <span class="compose-action-label">${escapeHtml(action.label)}</span>
                        </button>
                      `,
                    ).join("")}
                  </div>
                </div>
              </div>
            `
            : ""
        }
      </div>
    `;
    state.composerOpening = false;
    updateIcons(composerHost);
    bindComposerInput();
  }

  function renderContextOverview() {
    const active = state.activeSession
      ? SESSIONS.find((session) => session.id === state.activeSession)
      : null;
    return `
      <section class="context-section">
        <div class="context-section-title"><span>当前工作</span><span>${active ? "进行中" : "就绪"}</span></div>
        <button class="workspace-card" data-detail-type="workspace" type="button">
          <div class="workspace-card-head">
            <span class="workspace-card-icon">${icon(active?.icon || "message-square")}</span>
            <div class="workspace-card-copy">
              <strong>${escapeHtml(active?.title || "新对话")}</strong>
              <span>${active ? "已载入历史上下文" : "等待第一条消息"}</span>
            </div>
          </div>
          <div class="progress-track"><span style="width:${active ? "68%" : "18%"}"></span></div>
        </button>
      </section>
      <section class="context-section">
        <div class="context-section-title"><span>运行方式</span><span>${escapeHtml(currentEnvironment().name)}</span></div>
        <div class="detail-list">
          <div class="detail-row">${icon("brain")}<span>模型</span><strong>${escapeHtml(state.model || "未选择模型")}</strong></div>
          <div class="detail-row">${icon("folder")}<span>工作区</span><strong>${escapeHtml(state.workspaceName)}</strong></div>
          <div class="detail-row">${icon("shield-check")}<span>权限</span><strong>工作区内修改</strong></div>
        </div>
      </section>
      <section class="context-section">
        <div class="context-section-title"><span>可用能力</span><span>${getActiveSkills().length}</span></div>
        <div class="tag-row">
          ${getActiveSkills().slice(0, 4).map((skill) => `<span class="soft-tag">${escapeHtml(skill.title)}</span>`).join("")}
        </div>
      </section>
      <section class="context-section">
        <div class="context-section-title"><span>上下文用量</span><span>1.24 万 / 12.8 万</span></div>
        <div class="progress-track"><span style="width:19%"></span></div>
      </section>
    `;
  }

  function renderContextFiles() {
    return `
      <section class="context-section">
        <div class="context-section-title"><span>当前文件</span><span>3 个</span></div>
        <button class="file-row" data-detail-type="file" data-detail-id="desktop.html" type="button">${icon("file-code-2")}<span class="file-copy"><strong>desktop.html</strong><small>页面结构</small></span><span>18 KB</span></button>
        <button class="file-row" data-detail-type="file" data-detail-id="desktop.css" type="button">${icon("file-code-2")}<span class="file-copy"><strong>desktop.css</strong><small>桌面端样式</small></span><span>42 KB</span></button>
        <button class="file-row" data-detail-type="file" data-detail-id="desktop-app.js" type="button">${icon("file-code-2")}<span class="file-copy"><strong>desktop-app.js</strong><small>工作区交互</small></span><span>31 KB</span></button>
      </section>
      <section class="context-section">
        <div class="context-section-title"><span>资源</span><span>已就绪</span></div>
        <div class="detail-list">
          <div class="detail-row">${icon("image")}<span>品牌素材</span><strong>8 个</strong></div>
          <div class="detail-row">${icon("type")}<span>字体</span><strong>JetBrains Mono</strong></div>
        </div>
      </section>
    `;
  }

  function renderContextActivity() {
    return `
      <section class="context-section">
        <div class="context-section-title"><span>本轮执行</span><span>完成</span></div>
        <div class="activity-row">${icon("file-search")}<span class="file-copy"><strong>读取工作区结构</strong><small>页面与资源清单</small></span><span>0.8s</span></div>
        <div class="activity-row">${icon("layout-dashboard")}<span class="file-copy"><strong>建立桌面布局</strong><small>三栏工作区</small></span><span>1.4s</span></div>
        <div class="activity-row">${icon("scan-search")}<span class="file-copy"><strong>检查交互状态</strong><small>导航、输入、面板</small></span><span>2.1s</span></div>
      </section>
      <section class="context-section">
        <div class="context-section-title"><span>状态</span><span>正常</span></div>
        <div class="detail-list">
          <div class="detail-row">${icon("circle-check")}<span>界面加载</span><strong>完成</strong></div>
          <div class="detail-row">${icon("wifi")}<span>网络</span><strong>在线</strong></div>
          <div class="detail-row">${icon("timer")}<span>总耗时</span><strong>4.3 秒</strong></div>
        </div>
      </section>
    `;
  }

  function renderContext() {
    const progress = Math.round(state.agentTraining);
    affinityValue.textContent = `${progress}%`;
    affinityRing.style.setProperty("--agent-progress", `${progress}%`);
    affinityRing.setAttribute("aria-valuenow", String(progress));
    const profileButton = document.getElementById("profile-button");
    if (profileButton) {
      profileButton.style.setProperty("--agent-progress", `${progress}%`);
      profileButton.title = `用户与 Agent 契合度 ${progress}%`;
    }
    renderInsightPanel();
  }

  function renderInsightPanel() {
    if (!insightPanelContent) return;
    document.querySelectorAll("[data-insight-tab]").forEach((button) => {
      const active = button.dataset.insightTab === state.insightTab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (skillMarketLauncher) {
      skillMarketLauncher.hidden = state.insightTab !== "skill-config";
    }

    const skillFilter = state.panelFilters.skillConfig;
    const activeSkills = getActiveSkills();
    const visibleSkills = activeSkills.filter((skill) => {
      const enabled = !state.disabledSkills.has(skill.id);
      if (skillFilter === "enabled") return enabled;
      if (skillFilter === "disabled") return !enabled;
      return true;
    });
    const allReminders = getAllReminders();
    const visibleReminders = allReminders.filter((reminder) => {
      const enabled = Boolean(state.reminderState[reminder.id]);
      if (state.reminderFilter === "enabled") return enabled;
      if (state.reminderFilter === "disabled") return !enabled;
      return true;
    });
    const allMemories = getAllMemories();
    const memoryCategories = [
      "全部",
      "沟通风格",
      "工作习惯",
      "长期偏好",
    ];
    const visibleMemories = allMemories.filter(
      (memory) =>
        state.memoryFilter === "all" || memory.category === state.memoryFilter,
    );
    const content = {
      "task-activity": `
        <section class="insight-detail right-feature-detail">
          <span class="eyebrow">运行记录</span>
          <h3>任务动态</h3>
          <p>后台任务、自动化和资源处理的最近状态。</p>
          <div class="right-feature-list">
            ${TASK_ACTIVITIES.map(
              (task) => `
                <article class="right-feature-card" data-task-id="${task.id}" data-right-detail="task" data-right-detail-id="${task.id}">
                  <div class="right-feature-head">
                    <span class="right-feature-icon">${icon(task.icon)}</span>
                    <div><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.meta)}</small></div>
                    <span class="task-status task-status-${task.tone}">${escapeHtml(task.status)}</span>
                  </div>
                  <p>${escapeHtml(task.description)}</p>
                </article>
              `,
            ).join("")}
          </div>
        </section>
      `,
      reminders: `
        <section class="insight-detail right-feature-detail">
          <span class="eyebrow">提醒任务</span>
          <div class="right-feature-title-row">
            <h3>提醒任务</h3>
            <button class="right-feature-add" data-toggle-reminder-form type="button" aria-label="新建提醒">${icon("plus")}</button>
          </div>
          <p>按固定节奏提醒复盘、整理和重要节点。</p>
          <div class="right-feature-summary">
            <div><strong>${allReminders.filter((reminder) => state.reminderState[reminder.id]).length}</strong><span>已开启</span></div>
            <div><strong>${allReminders.length}</strong><span>全部提醒</span></div>
          </div>
          <div class="workspace-filter-row right-feature-filters" aria-label="提醒状态筛选">
            ${[
              ["all", "全部"],
              ["enabled", "已开启"],
              ["disabled", "已关闭"],
            ]
              .map(
                ([value, label]) => `
                  <button class="workspace-filter ${state.reminderFilter === value ? "is-active" : ""}" data-insight-filter="reminders" data-filter-value="${value}" type="button" aria-pressed="${state.reminderFilter === value}">${label}</button>
                `,
              )
              .join("")}
          </div>
          ${
            state.reminderFormOpen
              ? `
                <div class="right-inline-form">
                  <label><span>提醒内容</span><input id="reminder-title" placeholder="例如：喝水提醒" /></label>
                  <label><span>提醒时间</span><select id="reminder-time">${renderTimeOptions("10:00")}</select></label>
                  <label><span>重复节奏</span>${renderCadencePicker("create", "每天")}</label>
                  <div><button class="workspace-primary-button" data-save-reminder type="button">${icon("check")}保存提醒</button><button class="secondary-button" data-cancel-reminder-form type="button">取消</button></div>
                </div>
              `
              : ""
          }
          <div class="right-feature-list">
            ${visibleReminders.map((reminder) => {
              const enabled = Boolean(state.reminderState[reminder.id]);
              return `
                <article class="right-feature-card" data-right-detail="reminder" data-right-detail-id="${reminder.id}">
                  <div class="right-feature-head">
                    <span class="right-feature-icon">${icon(reminder.icon)}</span>
                    <div><strong>${escapeHtml(reminder.title)}</strong><small>${escapeHtml(reminder.time)} · ${escapeHtml(reminder.cadence)}</small></div>
                    <button class="switch ${enabled ? "is-on" : ""}" data-reminder-toggle="${reminder.id}" type="button" aria-label="${enabled ? "关闭" : "开启"}${escapeHtml(reminder.title)}" aria-pressed="${enabled}"></button>
                  </div>
                  <p>${escapeHtml(reminder.description)}</p>
                </article>
              `;
            }).join("")}
          </div>
        </section>
      `,
      memory: `
        <section class="insight-detail right-feature-detail">
          <span class="eyebrow">长期上下文</span>
          <div class="right-feature-title-row">
            <h3>记忆与个性</h3>
            <button class="right-feature-add" data-toggle-memory-form type="button" aria-label="新增记忆">${icon("plus")}</button>
          </div>
          <p>千变对你工作方式、偏好和表达习惯的理解。</p>
          <div class="right-feature-summary">
            <div><strong>${state.memoryPins.size}</strong><span>已置顶</span></div>
            <div><strong>${allMemories.length}</strong><span>长期记忆</span></div>
          </div>
          <div class="workspace-filter-row right-feature-filters" aria-label="记忆分类">
            ${memoryCategories
              .map(
                (category) => `
                  <button class="workspace-filter ${state.memoryFilter === (category === "全部" ? "all" : category) ? "is-active" : ""}" data-insight-filter="memory" data-filter-value="${category === "全部" ? "all" : category}" type="button" aria-pressed="${state.memoryFilter === (category === "全部" ? "all" : category)}">${category.replace("风格", "").replace("长期", "")}</button>
                `,
              )
              .join("")}
          </div>
          ${
            state.memoryFormOpen
              ? `
                <div class="right-inline-form">
                  <label><span>记忆标题</span><input id="memory-title" placeholder="例如：偏好短会" /></label>
                  <label><span>说明</span><textarea id="memory-description" rows="3" placeholder="写下希望千变长期记住的内容"></textarea></label>
                  <label><span>分类</span><select id="memory-category"><option>沟通风格</option><option>工作习惯</option><option>长期偏好</option></select></label>
                  <div><button class="workspace-primary-button" data-save-memory type="button">${icon("check")}保存记忆</button><button class="secondary-button" data-cancel-memory-form type="button">取消</button></div>
                </div>
              `
              : ""
          }
          <div class="right-feature-list">
            ${visibleMemories.map((memory) => {
              const pinned = state.memoryPins.has(memory.id);
              return `
                <article class="right-feature-card ${pinned ? "is-pinned" : ""}" data-right-detail="memory" data-right-detail-id="${memory.id}">
                  <div class="right-feature-head">
                    <span class="right-feature-icon">${icon(memory.icon)}</span>
                    <div><strong>${escapeHtml(memory.title)}</strong><small>${escapeHtml(memory.category)}</small></div>
                    <button class="workspace-icon-button ${pinned ? "is-active" : ""}" data-memory-pin="${memory.id}" type="button" aria-label="${pinned ? "取消置顶" : "置顶记忆"}" aria-pressed="${pinned}">${icon(pinned ? "pin" : "pin-off")}</button>
                  </div>
                  <p>${escapeHtml(memory.description)}</p>
                </article>
              `;
            }).join("")}
          </div>
        </section>
      `,
      "skill-config": `
        <section class="insight-detail right-feature-detail">
          <span class="eyebrow">能力管理</span>
          <div class="right-feature-title-row">
            <h3>技能配置</h3>
          </div>
          <p>${activeSkills.length - [...state.disabledSkills].filter((id) => activeSkills.some((skill) => skill.id === id)).length} 个技能已启用。</p>
          <div class="skill-config-controls">
            <div class="workspace-filter-row right-feature-filters" aria-label="技能状态筛选">
              ${renderWorkspaceFilters(
                "skillConfig",
                [
                  ["all", "全部"],
                  ["enabled", "已启用"],
                  ["disabled", "已停用"],
                ],
                skillFilter,
              )}
            </div>
            <div class="skill-config-actions">
              ${
                state.skillDeleteMode
                  ? `
                    <span class="skill-delete-count" aria-live="polite">已选 ${state.selectedSkills.size}</span>
                    <button class="skill-delete-confirm" data-delete-selected-skills type="button" title="删除所选" aria-label="删除所选" ${state.selectedSkills.size ? "" : "disabled"}>
                      ${icon("trash-2")}
                    </button>
                  `
                  : ""
              }
              <button class="skill-delete-toggle ${state.skillDeleteMode ? "is-active" : ""}" data-toggle-skill-delete type="button" title="${state.skillDeleteMode ? "退出多选删除" : "多选删除技能"}" aria-label="${state.skillDeleteMode ? "退出多选删除" : "多选删除技能"}" aria-pressed="${state.skillDeleteMode}">
                ${icon("list-checks")}
              </button>
            </div>
          </div>
          <div class="skill-config-grid">
            ${visibleSkills
              .map((skill) => {
                const enabled = !state.disabledSkills.has(skill.id);
                return `
                  <article class="right-feature-card skill-config-card ${enabled ? "is-enabled" : "is-disabled"} ${state.selectedSkills.has(skill.id) ? "is-selected" : ""}" data-skill-id="${skill.id}" data-right-detail="skill" data-right-detail-id="${skill.id}">
                    <div class="right-feature-head">
                      ${
                        state.skillDeleteMode
                          ? `<input class="skill-select-checkbox" type="checkbox" data-skill-select="${skill.id}" aria-label="选择${escapeHtml(skill.title)}" ${state.selectedSkills.has(skill.id) ? "checked" : ""} />`
                          : `<span class="right-feature-icon">${icon(skill.icon)}</span>`
                      }
                      <div><strong>${escapeHtml(skill.title)}</strong><small>${escapeHtml(skill.tags.join(" · "))}</small></div>
                    </div>
                    <p>${escapeHtml(skill.description)}</p>
                    <div class="skill-card-footer">
                      <span>${enabled ? "已开启" : "已关闭"}</span>
                      ${
                        state.skillDeleteMode
                          ? ""
                          : `<button class="switch ${enabled ? "is-on" : ""}" data-skill-config-toggle="${skill.id}" type="button" aria-label="${enabled ? "停用" : "启用"}${escapeHtml(skill.title)}" aria-pressed="${enabled}"></button>`
                      }
                    </div>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `,
    }[state.insightTab];
    insightPanelContent.innerHTML = content || "";
    updateIcons(insightPanelContent);
  }

  function getSearchItems(queryValue) {
    const query = queryValue.trim().toLowerCase();
    return [
      { type: "action", id: "new", label: "新建对话", icon: "square-pen", hint: "操作" },
      { type: "view", id: "skills", label: "打开技能空间", icon: "sparkles", hint: "页面" },
      { type: "view", id: "automation", label: "打开自动化", icon: "workflow", hint: "页面" },
      { type: "view", id: "settings", label: "打开设置", icon: "settings-2", hint: "页面" },
      ...SESSIONS.map((session) => ({
        type: "session",
        id: session.id,
        label: session.title,
        icon: session.icon,
        hint: session.meta,
      })),
      ...getActiveSkills().map((skill) => ({
        type: "skill",
        id: skill.id,
        label: skill.title,
        icon: skill.icon,
        hint: "技能",
      })),
    ].filter((item) => !query || item.label.toLowerCase().includes(query));
  }

  function searchItemsMarkup(items) {
    return items.length > 0
      ? items
          .slice(0, 12)
          .map(
            (item) => `
              <button class="command-item" data-command-type="${item.type}" data-command-id="${item.id}" type="button">
                ${icon(item.icon)}
                <span>${escapeHtml(item.label)}</span>
                <small>${escapeHtml(item.hint)}</small>
              </button>
            `,
          )
          .join("")
      : `<div class="command-item">${icon("search-x")}<span>没有匹配结果</span></div>`;
  }

  function renderPaletteResults() {
    const items = getSearchItems(state.paletteQuery);

    commandResults.innerHTML = searchItemsMarkup(items);
    updateIcons(commandResults);
  }

  function renderSideSearchResults() {
    if (!sideSearchResults) return;
    const query = state.sideSearchQuery.trim().toLowerCase();
    const include = (value) =>
      !query || String(value || "").toLowerCase().includes(query);
    const groups = [
      {
        id: "chat",
        label: "聊天记录",
        items: SESSIONS.filter(
          (session) =>
            include(session.title) ||
            session.messages.some((message) => include(message.text)),
        ).map((session) => ({
          id: session.id,
          title: session.title,
          meta: session.meta,
          icon: session.icon,
          kind: "session",
        })),
      },
      {
        id: "file",
        label: "文件",
        items: [...LIBRARY_ITEMS, ...DOCUMENT_ITEMS]
          .filter(
            (item) =>
              include(item.title) ||
              include(item.typeLabel) ||
              include(item.meta),
          )
          .map((item) => ({
            id: item.id,
            title: item.title,
            meta: item.typeLabel,
            icon: item.icon,
            kind: "file",
          })),
      },
      {
        id: "goal",
        label: "目标",
        items: state.goals
          .filter(
            (goal) =>
              include(goal.title) ||
              include(goal.description) ||
              include(goal.cadence),
          )
          .map((goal) => ({
            id: goal.id,
            title: goal.title,
            meta: `${goal.progress}% · ${goal.cadence}`,
            icon: "target",
            kind: "goal",
          })),
      },
    ].filter(
      (group) =>
        state.searchFilter === "all" || group.id === state.searchFilter,
    );
    const total = groups.reduce((count, group) => count + group.items.length, 0);

    sideSearchResults.innerHTML =
      total > 0
        ? groups
            .filter((group) => group.items.length)
            .map(
              (group) => `
                <section class="workspace-result-group" data-search-group="${group.id}">
                  <div class="workspace-result-head">
                    <span>${group.label}</span>
                    <small>${group.items.length}</small>
                  </div>
                  ${group.items
                    .map(
                      (item) => `
                        <button
                          class="workspace-result-row"
                          type="button"
                          data-search-result="${item.kind}"
                          ${item.kind === "session" ? `data-session="${item.id}"` : ""}
                          ${item.kind === "file" ? `data-detail-type="file" data-detail-id="${item.id}"` : ""}
                          ${item.kind === "goal" ? `data-search-goal="${item.id}"` : ""}
                        >
                          ${icon(item.icon)}
                          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span>
                          ${icon("chevron-right")}
                        </button>
                      `,
                    )
                    .join("")}
                </section>
              `,
            )
            .join("")
        : `<div class="workspace-panel-empty">${icon("search-x")}<strong>没有找到相关内容</strong><span>试试会话标题、文件名或目标关键词。</span></div>`;
    updateIcons(sideSearchResults);
  }

  function renderWorkspaceFilters(scope, filters, active) {
    return filters
      .map(
        ([value, label]) => `
          <button
            class="workspace-filter ${active === value ? "is-active" : ""}"
            data-panel-filter="${scope}"
            data-filter-value="${value}"
            type="button"
            aria-pressed="${active === value}"
          >${label}</button>
        `,
      )
      .join("");
  }

  function renderWorkspacePanelHead({
    title,
    eyebrow,
    count,
    action = "",
  }) {
    return `
      <header class="workspace-panel-head">
        <div>
          <span class="eyebrow">${escapeHtml(eyebrow)}</span>
          <h2>${escapeHtml(title)}</h2>
        </div>
        ${action || `<span class="workspace-panel-count">${escapeHtml(count)}</span>`}
      </header>
    `;
  }

  function renderIdeasPanel() {
    if (!ideasPanelHost) return;
    ideasPanelHost.innerHTML = `
      <div class="workspace-panel-shell">
        ${renderWorkspacePanelHead({
          title: "想法",
          eyebrow: "千变主动建议",
          count: `${IDEAS.length} 条`,
        })}
        <p class="workspace-panel-intro">基于近期会话、目标和浏览内容，挑出值得继续推进的方向。</p>
        <div class="workspace-panel-scroll">
          ${IDEAS.map((idea) => {
            const saved = state.savedIdeas.has(idea.id);
            return `
              <article class="workspace-card idea-card" data-idea-id="${idea.id}">
                <div class="workspace-card-top">
                  <span class="workspace-card-icon">${icon(idea.icon)}</span>
                  <span class="workspace-tag">${escapeHtml(idea.tag)}</span>
                </div>
                <h3>${escapeHtml(idea.title)}</h3>
                <p>${escapeHtml(idea.description)}</p>
                <div class="workspace-card-actions">
                  <button class="workspace-text-button" data-idea-prompt="${idea.id}" type="button">${icon("arrow-up-right")}开始探索</button>
                  <button class="workspace-icon-button ${saved ? "is-active" : ""}" data-save-idea="${idea.id}" type="button" aria-label="${saved ? "取消收藏" : "收藏想法"}" aria-pressed="${saved}">${icon(saved ? "bookmark-check" : "bookmark")}</button>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    `;
    updateIcons(ideasPanelHost);
  }

  function renderGoalsPanel() {
    if (!goalsPanelHost) return;
    const active = state.panelFilters.goals;
    const visibleGoals = state.goals.filter((goal) => {
      if (active === "completed") return goal.progress >= 100;
      if (active === "active") return goal.progress < 100;
      return true;
    });
    goalsPanelHost.innerHTML = `
      <div class="workspace-panel-shell">
        ${renderWorkspacePanelHead({
          title: "目标",
          eyebrow: "长期推进",
          count: `${visibleGoals.length} 个`,
          action: `<button class="workspace-icon-button" data-add-goal type="button" aria-label="新建目标">${icon("plus")}</button>`,
        })}
        <div class="workspace-filter-row" aria-label="目标筛选">
          ${renderWorkspaceFilters(
            "goals",
            [
              ["active", "进行中"],
              ["completed", "已完成"],
              ["all", "全部"],
            ],
            active,
          )}
        </div>
        ${
          state.goalFormOpen
            ? `
              <div class="goal-create-form">
                <label><span>目标</span><input id="goal-title" placeholder="例如：每天阅读 20 分钟" /></label>
                <div class="goal-form-row">
                  <label><span>节奏</span><select id="goal-cadence"><option>每天</option><option>每周</option><option>每月</option><option>本季度</option></select></label>
                  <button class="workspace-primary-button" data-save-goal type="button">${icon("check")}创建</button>
                </div>
              </div>
            `
            : ""
        }
        <div class="workspace-panel-scroll">
          ${
            visibleGoals.length
              ? visibleGoals
                  .map(
                    (goal) => `
                      <article class="workspace-card goal-card" data-goal-id="${goal.id}" data-goal-progress="${goal.progress}">
                        <div class="goal-card-head">
                          <span class="workspace-card-icon">${icon(goal.icon)}</span>
                          <div><strong>${escapeHtml(goal.title)}</strong><small>${escapeHtml(goal.cadence)} · 连续 ${goal.streak} 次</small></div>
                          <span class="workspace-goal-value">${goal.progress}%</span>
                        </div>
                        <p>${escapeHtml(goal.description)}</p>
                        <div class="goal-progress-track"><span style="width:${goal.progress}%"></span></div>
                        <div class="goal-card-foot">
                          <span>${goal.progress >= 100 ? "目标已完成" : "下一次推进"}</span>
                          <button class="workspace-text-button" data-goal-checkin="${goal.id}" type="button">${icon(goal.progress >= 100 ? "check-check" : "plus")}${goal.progress >= 100 ? "已完成" : "打卡"}</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `<div class="workspace-panel-empty">${icon("target")}<strong>没有符合筛选的目标</strong><span>切换筛选条件，或创建一个新的长期目标。</span></div>`
          }
        </div>
      </div>
    `;
    updateIcons(goalsPanelHost);
  }

  function renderFeedPanel() {
    if (!feedPanelHost) return;
    const active = state.panelFilters.feed;
    const visible = FEED_ITEMS.filter(
      (item) => active === "all" || item.category === active,
    );
    feedPanelHost.innerHTML = `
      <div class="workspace-panel-shell">
        ${renderWorkspacePanelHead({
          title: "动态",
          eyebrow: "为你筛选",
          count: `${visible.length} 条`,
        })}
        <div class="workspace-filter-row" aria-label="动态分类">
          ${renderWorkspaceFilters(
            "feed",
            [
              ["all", "全部"],
              ["产品", "产品"],
              ["AI", "AI"],
              ["行业", "行业"],
            ],
            active,
          )}
        </div>
        <div class="workspace-panel-scroll">
          ${visible
            .map((item) => {
              const read = state.readFeed.has(item.id);
              return `
                <article class="workspace-card feed-card ${read ? "is-read" : ""}" data-feed-id="${item.id}">
                  <div class="feed-source">
                    <span>${icon(item.icon)}${escapeHtml(item.source)}</span>
                    <small>${escapeHtml(item.time)}</small>
                  </div>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description)}</p>
                  <div class="workspace-card-actions">
                    <span class="workspace-tag">${escapeHtml(item.category)}</span>
                    <div>
                      <button class="workspace-text-button" data-feed-prompt="${item.id}" type="button">讨论</button>
                      <button class="workspace-text-button ${read ? "is-active" : ""}" data-feed-read="${item.id}" type="button" aria-pressed="${read}">${read ? "已读" : "标记已读"}</button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
    updateIcons(feedPanelHost);
  }

  function renderLibraryPanel() {
    if (!libraryPanelHost) return;
    const active = state.panelFilters.library;
    const visible = LIBRARY_ITEMS.filter(
      (item) => active === "all" || item.type === active,
    );
    libraryPanelHost.innerHTML = `
      <div class="workspace-panel-shell">
        ${renderWorkspacePanelHead({
          title: "资源库",
          eyebrow: "生成内容",
          count: `${visible.length} 项`,
        })}
        <p class="workspace-panel-intro">图片、代码、文件和其他生成结果集中保存在这里。</p>
        <div class="workspace-filter-row" aria-label="资源库筛选">
          ${renderWorkspaceFilters(
            "library",
            [
              ["all", "全部"],
              ["image", "图片"],
              ["file", "文件"],
              ["code", "代码"],
            ],
            active,
          )}
        </div>
        <div class="workspace-panel-scroll">
          ${visible
            .map(
              (item) => `
                <button class="workspace-list-card" data-library-open="${item.id}" data-detail-type="file" data-detail-id="${item.id}" type="button">
                  <span class="workspace-list-icon">${icon(item.icon)}</span>
                  <span class="workspace-list-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span>
                  <span class="workspace-tag">${escapeHtml(item.typeLabel)}</span>
                  ${icon("chevron-right")}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
    updateIcons(libraryPanelHost);
  }

  function renderDocumentsPanel() {
    if (!documentsPanelHost) return;
    const active = state.panelFilters.documents;
    const visible = DOCUMENT_ITEMS.filter(
      (item) => active === "all" || item.type === active,
    );
    documentsPanelHost.innerHTML = `
      <div class="workspace-panel-shell">
        ${renderWorkspacePanelHead({
          title: "文档",
          eyebrow: "报告与产出",
          count: `${visible.length} 份`,
        })}
        <p class="workspace-panel-intro">报告、表格和长文档都从这里打开与继续编辑。</p>
        <div class="workspace-filter-row" aria-label="文档筛选">
          ${renderWorkspaceFilters(
            "documents",
            [
              ["all", "全部"],
              ["report", "报告"],
              ["sheet", "表格"],
              ["document", "文档"],
            ],
            active,
          )}
        </div>
        <div class="workspace-panel-scroll">
          ${visible
            .map(
              (item) => `
                <button class="workspace-list-card" data-library-open="${item.id}" data-detail-type="file" data-detail-id="${item.id}" type="button">
                  <span class="workspace-list-icon">${icon(item.icon)}</span>
                  <span class="workspace-list-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span>
                  <span class="workspace-tag">${escapeHtml(item.typeLabel)}</span>
                  ${icon("chevron-right")}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
    updateIcons(documentsPanelHost);
  }

  function getUiWidget(widgetId) {
    return state.uiWidgets.find(
      (widget) => String(widget.id) === String(widgetId),
    );
  }

  function renderUiWidgetNav() {
    if (!desktopUiWidgetHost) return;
    const widgets = state.uiWidgets.filter(
      (widget) => widget.slot === "sidebar" && widget.enabled,
    );
    desktopUiWidgetHost.hidden = !widgets.length;
    desktopUiWidgetHost.innerHTML = widgets
      .map(
        (widget) => `
          <button class="nav-item rail-expand ui-widget-nav-button" data-ui-widget-open="${escapeHtml(
            widget.id,
          )}" data-tooltip="${escapeHtml(widget.title)}" type="button">
            ${icon(widget.icon)}
            <span>${escapeHtml(widget.title)}</span>
          </button>
        `,
      )
      .join("");
    updateIcons(desktopUiWidgetHost);
  }

  async function refreshUiWidgets({ silent = false } = {}) {
    if (!api || !state.apiAvailable) {
      state.uiWidgets = [];
      state.uiWidgetsStatus = state.apiAvailable ? "ready" : "unavailable";
      state.uiWidgetsError = "";
      renderUiWidgetNav();
      return;
    }
    if (!silent) {
      state.uiWidgetsStatus = "loading";
      renderUiWidgetNav();
    }
    try {
      const renderer = window.QianbianAgentWorkspace;
      const payload = await api.ui();
      state.uiWidgets = renderer
        ? renderer.normalizeWidgetList(payload)
        : Array.isArray(payload?.widgets)
          ? payload.widgets
          : [];
      state.uiWidgetsStatus = "ready";
      state.uiWidgetsError = "";
      if (
        state.railDialog?.root === "ui-widget" &&
        !getUiWidget(state.railDialog.widgetId)
      ) {
        state.railDialog = null;
        stopUiWidgetRefresh();
      }
    } catch (error) {
      state.uiWidgetsStatus = "error";
      state.uiWidgetsError = error.message || "模块读取失败";
    }
    renderUiWidgetNav();
    if (state.railDialog?.root === "ui-widget") renderRailDialog();
  }

  function stopUiWidgetRefresh(widgetId = state.uiWidgetActiveId) {
    if (widgetId == null) return;
    const key = String(widgetId);
    const timer = state.uiWidgetRefreshTimers.get(key);
    if (timer) window.clearTimeout(timer);
    state.uiWidgetRefreshTimers.delete(key);
  }

  function scheduleUiWidgetRefresh(widget) {
    stopUiWidgetRefresh(widget.id);
    const minutes = Number(widget.config?.source?.refreshMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    const delay = Math.max(60_000, minutes * 60_000);
    const timer = window.setTimeout(() => {
      state.uiWidgetRefreshTimers.delete(String(widget.id));
      if (
        document.visibilityState === "visible" &&
        state.railDialog?.root === "ui-widget" &&
        String(state.railDialog.widgetId) === String(widget.id)
      ) {
        loadUiWidgetData(widget.id, { force: true, silent: true });
      } else {
        scheduleUiWidgetRefresh(widget);
      }
    }, delay);
    state.uiWidgetRefreshTimers.set(String(widget.id), timer);
  }

  async function loadUiWidgetData(widgetId, { force = false, silent = false } = {}) {
    const widget = getUiWidget(widgetId);
    if (!widget) return;
    const key = String(widget.id);
    const previous = state.uiWidgetData.get(key);
    stopUiWidgetRefresh(widget.id);
    state.uiWidgetData.set(key, {
      ...(previous || {}),
      status: previous?.payload && !force ? "ready" : "loading",
      error: "",
    });
    if (!silent) render();
    if (!api || !state.apiAvailable) {
      state.uiWidgetData.set(key, {
        status: "error",
        error: "服务未连接，暂时无法读取模块数据",
      });
      render();
      return;
    }
    try {
      const renderer = window.QianbianAgentWorkspace;
      const payload = renderer
        ? renderer.normalizeData(await api.uiData(widget.id))
        : await api.uiData(widget.id);
      const status = payload?.error && !payload?.items?.length ? "error" : "ready";
      state.uiWidgetData.set(key, {
        status,
        payload,
        error: payload?.error || "",
      });
      scheduleUiWidgetRefresh(widget);
    } catch (error) {
      state.uiWidgetData.set(key, {
        status: "error",
        error: error.message || "模块数据读取失败",
      });
    }
    render();
  }

  function openUiWidget(widgetId) {
    const widget = getUiWidget(widgetId);
    if (!widget) return;
    state.railDialog = { root: "ui-widget", widgetId: String(widget.id) };
    state.detail = null;
    state.uiWidgetActiveId = String(widget.id);
    render();
    loadUiWidgetData(widget.id);
  }

  function renderUiWidgetPanel() {
    const widget = getUiWidget(state.railDialog?.widgetId);
    if (!widget) return "";
    const dataState =
      state.uiWidgetData.get(String(widget.id)) || { status: "loading" };
    const renderer = window.QianbianAgentWorkspace;
    const data = dataState.payload || {};
    return `
      <section class="ui-widget-panel" data-ui-widget-panel="${escapeHtml(
        widget.id,
      )}">
        <div class="ui-widget-toolbar">
          <span>${data.updatedAt ? "更新于 " + escapeHtml(renderer?.formatPublishedAt(data.updatedAt) || "") : "通用模块"}</span>
          <button class="icon-button" data-ui-widget-refresh type="button" aria-label="刷新模块">${icon(
            "refresh-cw",
          )}</button>
        </div>
        ${
          renderer
            ? renderer.renderWidgetBody(widget, dataState, { escapeHtml, icon })
            : `<div class="ui-widget-state ui-widget-error">${icon(
                "circle-alert",
              )}<strong>模块渲染器未加载</strong></div>`
        }
      </section>
    `;
  }

  function renderSidePanel() {
    document.querySelectorAll("[data-side-panel-view]").forEach((view) => {
      view.hidden = view.dataset.sidePanelView !== state.sidePanel;
    });
    document.querySelectorAll("[data-side-panel]").forEach((button) => {
      const active = button.dataset.sidePanel === state.sidePanel;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    if (state.sidePanel === "search" && sideSearchInput) {
      sideSearchInput.value = state.sideSearchQuery;
      if (sideSearchFilters) {
        sideSearchFilters.innerHTML = renderWorkspaceFilters(
          "search",
          [
            ["all", "全部"],
            ["chat", "聊天"],
            ["file", "文件"],
            ["goal", "目标"],
          ],
          state.searchFilter,
        );
        updateIcons(sideSearchFilters);
      }
      renderSideSearchResults();
    }
    if (state.sidePanel === "ideas") renderIdeasPanel();
    if (state.sidePanel === "goals") renderGoalsPanel();
    if (state.sidePanel === "feed") renderFeedPanel();
    if (state.sidePanel === "library") renderLibraryPanel();
    if (state.sidePanel === "documents") renderDocumentsPanel();
  }

  function setSidePanel(panel) {
    if (
      ![
        "sessions",
        "search",
        "ideas",
        "goals",
        "feed",
        "library",
        "documents",
      ].includes(panel)
    ) {
      return;
    }
    if (state.sidePanelOpen && state.sidePanel === panel) {
      closeWorkspacePanel();
      announce("侧边面板已收起");
      return;
    }
    state.sidePanelOpen = true;
    state.sidePanel = panel;
    if (panel === "search") state.sideSearchQuery = "";
    if (panel === "goals") state.goalFormOpen = false;
    render();
    closeMobileSidebar();
    if (window.innerWidth <= 900) mobileScrim.hidden = false;
    window.requestAnimationFrame(() => {
      if (panel === "search") sideSearchInput?.focus();
      else if (panel === "sessions") historyFilter?.focus();
    });
    const labels = {
      sessions: "会话",
      search: "搜索",
      ideas: "想法",
      goals: "目标",
      feed: "动态",
      library: "资源库",
      documents: "文档",
    };
    announce(`${labels[panel]}面板已显示`);
  }

  function openPalette(query = "") {
    state.paletteOpen = true;
    state.paletteQuery = query;
    commandPalette.hidden = false;
    commandInput.value = query;
    renderPaletteResults();
    window.requestAnimationFrame(() => commandInput.focus());
  }

  function closePalette() {
    state.paletteOpen = false;
    commandPalette.hidden = true;
    state.paletteQuery = "";
  }

  function render() {
    syncChrome();
    renderWorkspaceSwitcher();
    renderSessions();
    renderUiWidgetNav();
    renderSidePanel();
    renderView();
    renderComposer();
    renderContext();
    renderRailDialog();
    renderActionDialog();
    renderSettingsSheet();
    renderAccountDialog();
    if (state.paletteOpen) renderPaletteResults();
    updateIcons();
  }

  function setView(view) {
    if (!VIEW_META[view]) return;
    state.view = view;
    state.detail = null;
    state.railDialog = null;
    state.actionDialog = null;
    state.composerOpen = false;
    state.composerClosing = false;
    render();
    announce(`${VIEW_META[view].title} 已打开`);
  }

  function startNewChat() {
    state.activeSession = null;
    state.messages = [];
    state.typing = false;
    state.draft = "";
    state.quotedMessage = null;
    state.detail = null;
    state.railDialog = null;
    state.actionDialog = null;
    state.composerOpen = false;
    state.composerOpening = false;
    state.composerClosing = false;
    localStorage.removeItem("qianbian-desktop-draft");
    localStorage.removeItem("qianbian-desktop-active-session");
    setView("chat");
    window.requestAnimationFrame(() => {
      document.getElementById("desktop-composer-input")?.focus();
    });
  }

  async function selectSession(id) {
    const session = SESSIONS.find((item) => item.id === id);
    if (!session) return;
    state.activeSession = id;
    localStorage.setItem("qianbian-desktop-active-session", id);
    state.messages = session.messages.map((message) => ({
      ...message,
      role: message.role || "assistant",
      kind:
        message.kind ||
        (message.role === "user" ? "userMessage" : "agentMessage"),
    }));
    state.typing = Boolean(api && state.apiAvailable);
    state.sessionLoading = state.typing;
    state.view = "chat";
    state.detail = null;
    state.railDialog = null;
    state.actionDialog = null;
    state.composerOpen = false;
    render();
    if (api && state.apiAvailable) {
      try {
        const payload = await api.resumeSession(id);
        if (payload?.session?.title) {
          session.title = payload.session.title;
        }
        state.messages = hydrateTimelineFromBackend(payload);
        const pending = Array.isArray(payload?.pendingRequests)
          ? payload.pendingRequests
          : [];
        state.pendingApprovals = pending.filter(
          (request) => request.approvalId,
        );
        state.pendingInputs = pending.filter(
          (request) => request.userInputId,
        );
        renderBackendPrompts();
      } catch (error) {
        showToast(error.message || "会话打开失败", "circle-alert");
      } finally {
        state.typing = false;
        state.sessionLoading = false;
        render();
      }
    }
    closeMobileSidebar();
    announce(`${session.title} 已打开`);
  }

  async function startBackendSession() {
    if (!api || !state.apiAvailable) return null;
    const payload = await api.startSession({
      modelId: state.modelId,
      approvalMode: state.approvalMode || "onRequest",
      workspaceRoot: state.workspaceRoot,
      executionTarget: state.executionTarget,
    });
    const session = payload?.session;
    if (!session?.sessionId) {
      throw new Error("后端未返回会话 ID");
    }
    const mapped = mapBackendSession(session);
    SESSIONS.unshift(mapped);
    state.activeSession = mapped.id;
    state.modelId = payload.modelId || state.modelId;
    state.messages = preserveLocalUserMessages(
      hydrateTimelineFromBackend(payload),
      state.messages,
    );
    return mapped;
  }

  async function cancelBackendTurn() {
    if (!api || !state.activeSession || !state.apiAvailable) return;
    try {
      await api.cancelTurn(state.activeSession);
      showToast("已请求停止生成", "square");
    } catch (error) {
      showToast(error.message || "停止生成失败", "circle-alert");
    }
  }

  function bindComposerInput() {
    const input = document.getElementById("desktop-composer-input");
    if (!input) return;
    const resize = () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
    };
    input.addEventListener("input", () => {
      state.draft = input.value;
      localStorage.setItem("qianbian-desktop-draft", state.draft);
      resize();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
    resize();
  }

  async function copyMessageText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {}
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.append(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = Boolean(document.execCommand("copy"));
    } catch {}
    textarea.remove();
    return copied;
  }

  async function handleMessageAction(action, index) {
    const message = state.messages[index];
    if (!message) return;
    if (action === "copy") {
      const copied = await copyMessageText(message.text);
      showToast(
        copied ? "消息已复制" : "复制失败，请手动选择文本",
        copied ? "copy" : "circle-alert",
      );
      return;
    }
    if (action === "quote") {
      state.quotedMessage = {
        text: message.text,
        author: message.role === "user" ? "你" : "千变",
      };
      state.composerOpen = false;
      state.composerClosing = false;
      render();
      window.requestAnimationFrame(() => {
        const input = document.getElementById("desktop-composer-input");
        input?.focus();
        input?.setSelectionRange(input.value.length, input.value.length);
      });
      showToast("消息已引用", "quote");
      return;
    }
  }

  async function sendMessage() {
    if (state.voiceRecording) stopVoiceRecording();
    if (state.typing && api && state.apiAvailable) {
      await cancelBackendTurn();
      return;
    }
    const draftText = state.draft.trim();
    if (!draftText) {
      showToast("先输入一条消息", "info");
      document.getElementById("desktop-composer-input")?.focus();
      return;
    }
    const quotedText = state.quotedMessage?.text.trim();
    const text = quotedText
      ? `> ${quotedText.replaceAll("\n", "\n> ")}\n\n${draftText}`
      : draftText;
    const localTurnId = `pending-${Date.now()}`;
    state.messages.push({
      kind: "userMessage",
      role: "user",
      text,
      turnId: localTurnId,
    });
    renderContext();
    state.draft = "";
    state.quotedMessage = null;
    state.composerOpen = false;
    state.composerClosing = false;
    localStorage.removeItem("qianbian-desktop-draft");
    state.typing = true;
    state.view = "chat";
    render();
    if (api && state.apiAvailable) {
      try {
        if (!state.activeSession) await startBackendSession();
        const payload = await api.sendTurn({
          sessionId: state.activeSession,
          text,
          modelId: state.modelId,
          images: [],
          executionTarget: state.executionTarget,
        });
        state.activeTurnId = payload?.turnId || null;
      } catch (error) {
        state.typing = false;
        render();
        showToast(error.message || "消息发送失败", "circle-alert");
      }
      return;
    }
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
      state.typing = false;
      const lower = text.toLowerCase();
      let reply =
        "我已经接住这条需求。下一步可以把它拆成目标、执行步骤和可检查的结果，再逐步完成。";
      if (lower.includes("产品") || lower.includes("方案")) {
        reply =
          "我会先确认目标用户和核心场景，再补齐流程、边界、数据与验收条件。需要我直接整理成第一版方案吗？";
      } else if (
        lower.includes("网页") ||
        lower.includes("页面") ||
        lower.includes("代码")
      ) {
        reply =
          "可以从页面结构、视觉层级、交互状态和响应式四个部分推进。我会先建立可运行版本，再逐项检查实际效果。";
      } else if (lower.includes("先") || lower.includes("下一个")) {
        reply = "可以。我先处理最关键的一步，并把结果整理成可以直接确认的状态。";
      }
      state.messages.push({
        kind: "agentMessage",
        role: "assistant",
        text: reply,
        turnId: localTurnId,
      });
      render();
    }, 720);
  }

  function toggleComposer(force) {
    const next =
      typeof force === "boolean" ? force : !(state.composerOpen || state.composerClosing);
    if (next) {
      window.clearTimeout(closeTimer);
      state.composerClosing = false;
      state.composerOpen = true;
      state.composerOpening = true;
      render();
      window.requestAnimationFrame(() => {
        const input = document.getElementById("desktop-composer-input");
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
      return;
    }
    state.composerClosing = true;
    renderComposer();
    closeTimer = window.setTimeout(() => {
      state.composerOpen = false;
      state.composerClosing = false;
      renderComposer();
    }, 170);
  }

  function formatRecordingTime(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60,
    ).padStart(2, "0")}`;
  }

  async function startVoiceRecording() {
    if (state.voiceRecording) {
      stopVoiceRecording();
      return;
    }
    state.voiceRecording = true;
    state.voiceSeconds = 0;
    state.composerOpen = false;
    state.composerOpening = false;
    state.composerClosing = false;
    renderComposer();
    voiceTimer = window.setInterval(() => {
      state.voiceSeconds += 1;
      const timer = document.querySelector(".recording-time");
      if (timer) timer.textContent = formatRecordingTime(state.voiceSeconds);
    }, 1000);

    if (navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (!state.voiceRecording) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        voiceStream = stream;
        mediaRecorder = new MediaRecorder(voiceStream);
        mediaRecorder.start();
      } catch {
        voiceStream = null;
        mediaRecorder = null;
        showToast("未获得麦克风权限，当前显示演示录音状态", "mic");
      }
    }
  }

  function stopVoiceRecording() {
    window.clearInterval(voiceTimer);
    voiceTimer = null;
    if (mediaRecorder?.state === "recording") mediaRecorder.stop();
    mediaRecorder = null;
    voiceStream?.getTracks().forEach((track) => track.stop());
    voiceStream = null;
    state.voiceRecording = false;
    state.voiceStarting = false;
    renderComposer();
    showToast(
      `录音已结束 · ${formatRecordingTime(state.voiceSeconds)}`,
      "circle-check",
    );
    document.getElementById("desktop-composer-input")?.focus();
  }

  function setTheme(theme) {
    state.theme = theme === "dark" ? "dark" : "light";
    localStorage.setItem("qianbian-desktop-theme", state.theme);
    render();
    showToast(state.theme === "dark" ? "已切换到深色" : "已切换到浅色", "sun-moon");
  }

  function toggleContext() {
    if (window.innerWidth > 1280) return;
    state.contextOpen = !state.contextOpen;
    mobileScrim.hidden = !state.contextOpen;
    render();
  }

  function closeMobileSidebar() {
    body.classList.remove("sidebar-open");
    if (!body.classList.contains("workspace-panel-open")) {
      mobileScrim.hidden = true;
    }
  }

  function closeWorkspacePanel({ renderNow = true, resetPanel = true } = {}) {
    state.sidePanelOpen = false;
    if (resetPanel) state.sidePanel = "sessions";
    body.classList.remove("workspace-panel-open");
    mobileScrim.hidden = true;
    if (renderNow) render();
  }

  function openMobileSidebar() {
    closeWorkspacePanel({ renderNow: false });
    body.classList.add("sidebar-open");
    mobileScrim.hidden = false;
    document.getElementById("sidebar-close").focus();
  }

  function toggleWorkspaceMenu(force) {
    if (!workspaceSwitcher) return;
    state.workspaceMenuOpen =
      typeof force === "boolean" ? force : !state.workspaceMenuOpen;
    renderWorkspaceSwitcher();
    if (state.workspaceMenuOpen) {
      window.requestAnimationFrame(() => {
        workspaceSwitcher
          .querySelector(".workspace-option.is-active")
          ?.focus();
      });
    }
  }

  function selectWorkspace(id) {
    const workspace = WORKSPACES.find((item) => item.id === id);
    if (!workspace) return;
    state.workspaceId = workspace.id;
    state.workspaceName = workspace.name;
    state.workspaceMenuOpen = false;
    localStorage.setItem("qianbian-desktop-workspace", workspace.id);
    const account = ACCOUNTS.find((item) => item.id === workspace.id);
    if (account) {
      state.currentAccountId = account.id;
      state.accountName = account.name;
      state.accountEmail = account.email;
      state.accountBio = account.description;
      state.accountAvatar = "assets/brand/qianbian-tile.png";
      persistAccountProfile();
    }
    render();
    showToast(`已切换到${workspace.name}`, "layers");
  }

  function openSkill(id) {
    const skill = getActiveSkills().find((item) => item.id === id);
    if (!skill) return;
    state.view = "chat";
    state.detail = null;
    state.railDialog = null;
    state.actionDialog = null;
    state.activeSession = null;
    state.messages = [];
    state.draft = `请使用「${skill.title}」能力，帮我处理下面的任务：`;
    localStorage.setItem("qianbian-desktop-draft", state.draft);
    render();
    window.requestAnimationFrame(() => {
      const input = document.getElementById("desktop-composer-input");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  function useWorkspacePrompt(prompt) {
    closeWorkspacePanel({ renderNow: false });
    state.view = "chat";
    state.detail = null;
    state.railDialog = null;
    state.actionDialog = null;
    state.draft = prompt;
    state.composerOpen = false;
    state.composerOpening = false;
    state.composerClosing = false;
    localStorage.setItem("qianbian-desktop-draft", state.draft);
    render();
    window.requestAnimationFrame(() => {
      const input = document.getElementById("desktop-composer-input");
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  function toggleSavedIdea(id) {
    if (state.savedIdeas.has(id)) state.savedIdeas.delete(id);
    else state.savedIdeas.add(id);
    localStorage.setItem(
      "qianbian-desktop-saved-ideas",
      JSON.stringify([...state.savedIdeas]),
    );
    renderSidePanel();
    showToast(
      state.savedIdeas.has(id) ? "想法已收藏" : "已取消收藏",
      state.savedIdeas.has(id) ? "bookmark-check" : "bookmark",
    );
  }

  function persistGoalState() {
    const progress = Object.fromEntries(
      state.goals.map((goal) => [
        goal.id,
        { progress: goal.progress, streak: goal.streak },
      ]),
    );
    localStorage.setItem("qianbian-desktop-goals", JSON.stringify(progress));
    localStorage.setItem(
      "qianbian-desktop-goal-definitions",
      JSON.stringify(state.customGoals),
    );
  }

  function checkInGoal(id) {
    const goal = state.goals.find((item) => item.id === id);
    if (!goal) return;
    if (goal.progress >= 100) {
      showToast("这个目标已经完成", "circle-check");
      return;
    }
    goal.progress = Math.min(100, goal.progress + 7);
    goal.streak += 1;
    persistGoalState();
    renderSidePanel();
    showToast(
      goal.progress >= 100
        ? `已完成「${goal.title}」`
        : `已推进「${goal.title}」`,
      "target",
    );
  }

  function createGoalFromForm() {
    const titleInput = document.getElementById("goal-title");
    const cadenceInput = document.getElementById("goal-cadence");
    const title = titleInput?.value.trim();
    if (!title) {
      showToast("请先填写目标名称", "circle-alert");
      titleInput?.focus();
      return;
    }
    const goal = {
      id: `custom-${Date.now().toString(36)}`,
      title,
      description: "由你创建并持续跟进的长期目标。",
      cadence: cadenceInput?.value || "每天",
      progress: 0,
      streak: 0,
      icon: "flag",
      custom: true,
    };
    state.goals.unshift(goal);
    state.customGoals.unshift(goal);
    state.goalFormOpen = false;
    persistGoalState();
    renderSidePanel();
    showToast("新目标已创建", "target");
  }

  function toggleFeedRead(id) {
    if (state.readFeed.has(id)) state.readFeed.delete(id);
    else state.readFeed.add(id);
    localStorage.setItem(
      "qianbian-desktop-read-feed",
      JSON.stringify([...state.readFeed]),
    );
    renderSidePanel();
  }

  function toggleReminder(id) {
    state.reminderState[id] = !state.reminderState[id];
    localStorage.setItem(
      "qianbian-desktop-reminder-state",
      JSON.stringify(state.reminderState),
    );
    renderInsightPanel();
    showToast(
      state.reminderState[id] ? "提醒已开启" : "提醒已关闭",
      state.reminderState[id] ? "bell-ring" : "bell-off",
    );
  }

  function createReminder() {
    const title = document.getElementById("reminder-title")?.value.trim();
    const cadence =
      document.getElementById("reminder-cadence")?.value || "每天";
    const timeValue = document.getElementById("reminder-time")?.value;
    if (!title || !timeValue) {
      showToast("请填写提醒内容和时间", "circle-alert");
      return;
    }
    const reminder = {
      id: `custom-reminder-${Date.now().toString(36)}`,
      title,
      description: "由你创建的自定义提醒。",
      time: `${cadence} ${timeValue}`,
      cadence,
      enabled: true,
      icon: "alarm-clock",
    };
    state.customReminders.push(reminder);
    state.reminderState[reminder.id] = true;
    localStorage.setItem(
      "qianbian-desktop-custom-reminders",
      JSON.stringify(state.customReminders),
    );
    localStorage.setItem(
      "qianbian-desktop-reminder-state",
      JSON.stringify(state.reminderState),
    );
    state.reminderFormOpen = false;
    renderInsightPanel();
    showToast("提醒已创建", "bell-ring");
  }

  function createMemory() {
    const title = document.getElementById("memory-title")?.value.trim();
    const description = document
      .getElementById("memory-description")
      ?.value.trim();
    const category =
      document.getElementById("memory-category")?.value || "长期偏好";
    if (!title || !description) {
      showToast("请填写记忆标题和说明", "circle-alert");
      return;
    }
    const memory = {
      id: `custom-memory-${Date.now().toString(36)}`,
      title,
      description,
      category,
      icon: "notebook-pen",
    };
    state.customMemories.push(memory);
    localStorage.setItem(
      "qianbian-desktop-custom-memories",
      JSON.stringify(state.customMemories),
    );
    state.memoryFormOpen = false;
    renderInsightPanel();
    showToast("记忆已保存", "notebook-pen");
  }

  function toggleMemoryPin(id) {
    if (state.memoryPins.has(id)) state.memoryPins.delete(id);
    else state.memoryPins.add(id);
    localStorage.setItem(
      "qianbian-desktop-memory-pins",
      JSON.stringify([...state.memoryPins]),
    );
    renderInsightPanel();
    showToast(
      state.memoryPins.has(id) ? "记忆已置顶" : "已取消置顶",
      state.memoryPins.has(id) ? "pin" : "pin-off",
    );
  }

  async function toggleSkillConfig(id) {
    const wasDisabled = state.disabledSkills.has(id);
    if (wasDisabled) state.disabledSkills.delete(id);
    else state.disabledSkills.add(id);
    localStorage.setItem(
      "qianbian-desktop-disabled-skills",
      JSON.stringify([...state.disabledSkills]),
    );
    if (api && state.apiAvailable) {
      try {
        if (wasDisabled) await api.enableSkill(id);
        else await api.disableSkill(id);
      } catch (error) {
        if (wasDisabled) state.disabledSkills.add(id);
        else state.disabledSkills.delete(id);
        showToast(error.message || "技能状态更新失败", "circle-alert");
        renderInsightPanel();
        return;
      }
    }
    renderInsightPanel();
    showToast(
      state.disabledSkills.has(id) ? "技能已停用" : "技能已启用",
      state.disabledSkills.has(id) ? "circle-pause" : "circle-check",
    );
  }

  function toggleSkillDeleteMode() {
    state.skillDeleteMode = !state.skillDeleteMode;
    state.selectedSkills.clear();
    renderInsightPanel();
  }

  function toggleSkillSelection(id, selected) {
    if (selected) state.selectedSkills.add(id);
    else state.selectedSkills.delete(id);
    renderInsightPanel();
  }

  async function deleteSelectedSkills() {
    if (!state.selectedSkills.size) return;
    const deletedCount = state.selectedSkills.size;
    const ids = [...state.selectedSkills];
    if (api && state.apiAvailable) {
      const results = await Promise.allSettled(
        ids.map((id) => api.deleteSkill(id)),
      );
      if (results.some((result) => result.status === "rejected")) {
        showToast("部分技能删除失败", "circle-alert");
      }
    }
    state.selectedSkills.forEach((id) => {
      state.deletedSkills.add(id);
      state.disabledSkills.delete(id);
    });
    localStorage.setItem(
      "qianbian-desktop-deleted-skills",
      JSON.stringify([...state.deletedSkills]),
    );
    localStorage.setItem(
      "qianbian-desktop-disabled-skills",
      JSON.stringify([...state.disabledSkills]),
    );
    state.selectedSkills.clear();
    state.skillDeleteMode = false;
    render();
    showToast(`已删除 ${deletedCount} 个技能`, "trash-2");
  }

  function saveRightReminder() {
    if (state.rightDetail?.type !== "reminder") return;
    const id = state.rightDetail.id;
    const cadence =
      document.getElementById("detail-reminder-cadence")?.value || "每天";
    const timeValue =
      document.getElementById("detail-reminder-time")?.value || "09:00";
    state.reminderOverrides[id] = {
      title:
        document.getElementById("detail-reminder-title")?.value.trim() ||
        "未命名提醒",
      time: `${cadence} ${timeValue}`,
      cadence,
      description:
        document.getElementById("detail-reminder-description")?.value.trim() ||
        "",
    };
    state.reminderState[id] = Boolean(
      document.getElementById("detail-reminder-enabled")?.checked,
    );
    localStorage.setItem(
      "qianbian-desktop-reminder-overrides",
      JSON.stringify(state.reminderOverrides),
    );
    localStorage.setItem(
      "qianbian-desktop-reminder-state",
      JSON.stringify(state.reminderState),
    );
    renderRailDialog();
    renderInsightPanel();
    showToast("提醒已更新", "bell-ring");
  }

  function deleteRightItem() {
    if (!state.rightDetail) return;
    const { type, id } = state.rightDetail;
    if (type === "skill") {
      state.deletedSkills.add(id);
      state.disabledSkills.delete(id);
      localStorage.setItem(
        "qianbian-desktop-deleted-skills",
        JSON.stringify([...state.deletedSkills]),
      );
      localStorage.setItem(
        "qianbian-desktop-disabled-skills",
        JSON.stringify([...state.disabledSkills]),
      );
    } else if (type === "reminder") {
      state.deletedReminders.add(id);
      state.customReminders = state.customReminders.filter(
        (reminder) => reminder.id !== id,
      );
      delete state.reminderOverrides[id];
      delete state.reminderState[id];
      localStorage.setItem(
        "qianbian-desktop-deleted-reminders",
        JSON.stringify([...state.deletedReminders]),
      );
      localStorage.setItem(
        "qianbian-desktop-custom-reminders",
        JSON.stringify(state.customReminders),
      );
      localStorage.setItem(
        "qianbian-desktop-reminder-overrides",
        JSON.stringify(state.reminderOverrides),
      );
      localStorage.setItem(
        "qianbian-desktop-reminder-state",
        JSON.stringify(state.reminderState),
      );
    } else if (type === "memory") {
      state.deletedMemories.add(id);
      state.customMemories = state.customMemories.filter(
        (memory) => memory.id !== id,
      );
      state.memoryPins.delete(id);
      localStorage.setItem(
        "qianbian-desktop-deleted-memories",
        JSON.stringify([...state.deletedMemories]),
      );
      localStorage.setItem(
        "qianbian-desktop-custom-memories",
        JSON.stringify(state.customMemories),
      );
      localStorage.setItem(
        "qianbian-desktop-memory-pins",
        JSON.stringify([...state.memoryPins]),
      );
    }
    state.rightDetail = null;
    state.railDialog = null;
    render();
    showToast("已删除", "trash-2");
  }

  function setPanelFilter(scope, value) {
    if (scope === "search") {
      state.searchFilter = value;
      renderSidePanel();
      return;
    }
    if (!(scope in state.panelFilters)) return;
    state.panelFilters[scope] = value;
    if (scope === "skillConfig") {
      localStorage.setItem("qianbian-desktop-skill-filter", value);
      renderInsightPanel();
      return;
    }
    renderSidePanel();
  }

  function execCommand(type, id) {
    closePalette();
    if (type === "action" && id === "new") startNewChat();
    else if (type === "view") {
      if (id === "chat") setView("chat");
      else if (id === "settings") openSettingsSheet();
      else openRailDialog(id);
    }
    else if (type === "session") selectSession(id);
    else if (type === "skill") openSkill(id);
  }

  async function selectModel(value) {
    const selected =
      state.models.find((model) => model.modelId === String(value)) ||
      state.models.find((model) => model.label === value);
    const name = selected?.label || String(value);
    if (selected) {
      state.modelId = selected.modelId;
      state.model = selected.label;
    } else {
      state.model = name;
    }
    if (api && state.apiAvailable && state.activeSession) {
      try {
        await api.setSessionModel({
          sessionId: state.activeSession,
          modelId: state.modelId,
        });
      } catch (error) {
        showToast(error.message || "模型切换失败", "circle-alert");
        return;
      }
    }
    render();
    showToast(`已切换到${name}`, "brain");
  }

  async function setBackendApprovalMode(mode) {
    state.approvalMode = mode;
    if (api && state.apiAvailable && state.activeSession) {
      try {
        await api.setApprovalMode({
          sessionId: state.activeSession,
          mode,
        });
        showToast("审批模式已更新", "shield-check");
      } catch (error) {
        showToast(error.message || "审批模式更新失败", "circle-alert");
      }
    }
    render();
  }

  function handleViewportChange() {
    const wide = window.innerWidth > 1280;
    const layoutChanged = wide !== lastWideLayout;
    if (layoutChanged) {
      state.contextOpen = true;
      lastWideLayout = wide;
      if (wide) mobileScrim.hidden = true;
    }
    if (window.innerWidth > 800) closeMobileSidebar();
    if (window.innerWidth > 900) mobileScrim.hidden = true;
    syncChrome();
    if (layoutChanged) {
      window.cancelAnimationFrame(viewportRenderFrame);
      viewportRenderFrame = window.requestAnimationFrame(() => {
        viewportRenderFrame = 0;
        render();
      });
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      if (!state.sidePanelOpen) return;
      if (!event.target.closest(".main-workspace")) return;
      state.sidePanelOpen = false;
      state.sidePanel = "sessions";
      body.classList.remove("workspace-panel-open");
      mobileScrim.hidden = true;
      window.requestAnimationFrame(() => {
        if (!state.sidePanelOpen) render();
      });
    },
    true,
  );

  document.addEventListener("click", async (event) => {
    const approvalChoice = event.target.closest("[data-approval-choice]");
    if (approvalChoice && api && state.apiAvailable) {
      try {
        const approval = state.pendingApprovals.find(
          (item) =>
            String(item.approvalId) === approvalChoice.dataset.approvalId,
        );
        const requirementId =
          approval?.requirementId || approval?.currentRequirementId;
        await api.decideApproval({
          sessionId: state.activeSession,
          approvalId: approvalChoice.dataset.approvalId,
          choiceId: approvalChoice.dataset.approvalChoice,
          requirementId,
        });
      } catch (error) {
        showToast(error.message || "审批操作失败", "circle-alert");
      }
      return;
    }
    const inputSubmit = event.target.closest("[data-input-submit]");
    if (inputSubmit && api && state.apiAvailable) {
      const card = inputSubmit.closest("[data-backend-input]");
      const answers = [...(card?.querySelectorAll("[data-backend-question]") || [])]
        .map((select) => ({
          questionId: select.dataset.backendQuestion,
          value: select.value,
        }));
      try {
        await api.answerInput({
          sessionId: state.activeSession,
          userInputId: inputSubmit.dataset.inputSubmit,
          answers,
        });
      } catch (error) {
        showToast(error.message || "回答提交失败", "circle-alert");
      }
      return;
    }
    const inputCancel = event.target.closest("[data-input-cancel]");
    if (inputCancel && api && state.apiAvailable) {
      try {
        await api.cancelInput({
          sessionId: state.activeSession,
          userInputId: inputCancel.dataset.inputCancel,
        });
      } catch (error) {
        showToast(error.message || "取消提问失败", "circle-alert");
      }
      return;
    }
    if (event.target.closest("#account-menu-button")) {
      openAccountDialog();
      return;
    }
    if (event.target.closest("#account-avatar-button")) {
      document.getElementById("account-avatar-upload")?.click();
      return;
    }
    if (event.target.closest("[data-close-account]")) {
      closeAccountDialog();
      return;
    }
    if (event.target.closest("[data-save-account-profile]")) {
      saveAccountProfileFromDialog();
      return;
    }
    if (event.target.closest("[data-toggle-account-switch]")) {
      state.accountSwitchOpen = !state.accountSwitchOpen;
      renderAccountDialog();
      return;
    }
    const showPermissionsButton = event.target.closest(
      "[data-show-device-permissions]",
    );
    if (showPermissionsButton) {
      openBackendDevicePermissions(
        showPermissionsButton.dataset.showDevicePermissions,
      );
      return;
    }
    if (event.target.closest("[data-close-device-permissions]")) {
      state.devicePermissionId = null;
      state.devicePermissions = null;
      state.deviceAudit = [];
      state.devicePermissionsError = "";
      renderAccountDialog();
      return;
    }
    if (event.target.closest("[data-save-device-permissions]")) {
      saveBackendDevicePermissions();
      return;
    }
    const editDeviceButton = event.target.closest("[data-edit-device]");
    if (editDeviceButton) {
      state.deviceEditingId = editDeviceButton.dataset.editDevice;
      state.deviceError = "";
      renderAccountDialog();
      window.requestAnimationFrame(() => {
        accountDialogHost
          .querySelector(
            `[data-device-name-input="${CSS.escape(
              state.deviceEditingId || "",
            )}"]`,
          )
          ?.focus();
      });
      return;
    }
    if (event.target.closest("[data-cancel-device-name]")) {
      state.deviceEditingId = null;
      renderAccountDialog();
      return;
    }
    const saveDeviceNameButton = event.target.closest(
      "[data-save-device-name]",
    );
    if (saveDeviceNameButton) {
      const deviceId = saveDeviceNameButton.dataset.saveDeviceName;
      const input = accountDialogHost.querySelector(
        `[data-device-name-input="${CSS.escape(deviceId || "")}"]`,
      );
      const name = input?.value.trim() || "";
      if (!deviceId || !name || !api) return;
      updateBackendDevice(deviceId, { name }, "设备名称已更新");
      return;
    }
    const pauseDeviceButton = event.target.closest(
      "[data-toggle-device-pause]",
    );
    if (pauseDeviceButton) {
      const deviceId = pauseDeviceButton.dataset.toggleDevicePause;
      const device = state.devices.find((item) => item.id === deviceId);
      if (!device || !api) return;
      updateBackendDevice(
        deviceId,
        { paused: !device.paused },
        device.paused ? "设备已恢复" : "设备已暂停",
      );
      return;
    }
    if (event.target.closest("[data-copy-device-pair]")) {
      const code = state.devicePairing?.pairingCode || "";
      if (code) {
        copyMessageText(code).then((copied) => {
          showToast(copied ? "配对码已复制" : `配对码：${code}`, "copy");
        });
      }
      return;
    }
    if (event.target.closest("[data-refresh-device-tasks]")) {
      refreshBackendDeviceTasks();
      return;
    }
    if (event.target.closest("[data-cancel-device-pair]")) {
      state.devicePairingFormOpen = false;
      state.deviceError = "";
      renderAccountDialog();
      return;
    }
    if (event.target.closest("[data-submit-device-pair]")) {
      if (!api || !state.apiAvailable) {
        showToast("登录后可以添加设备", "circle-alert");
        return;
      }
      const form = accountDialogHost.querySelector("[data-device-pair-form]");
      const type =
        form?.querySelector("[data-device-pair-type]")?.value === "android"
          ? "android"
          : "windows";
      const name =
        form?.querySelector("[data-device-pair-name]")?.value.trim() || "";
      const payload = { type };
      if (name) payload.name = name;
      state.deviceError = "";
      api
        .startDevicePairing(payload)
        .then((pairing) => {
          state.devicePairing = {
            ...pairing,
            type: pairing?.type || type,
          };
          state.devicePairingFormOpen = false;
          state.devicePairName = "";
          renderAccountDialog();
        })
        .catch((error) => {
          state.deviceError = error.message || "配对码生成失败";
          renderAccountDialog();
        });
      return;
    }
    if (event.target.closest("[data-start-device-pair]")) {
      if (!api || !state.apiAvailable) {
        showToast("登录后可以添加设备", "circle-alert");
        return;
      }
      state.devicePairingFormOpen = !state.devicePairingFormOpen;
      state.deviceError = "";
      if (state.devicePairingFormOpen) {
        state.devicePairing = null;
        state.devicePairName = "";
        state.devicePairType = "windows";
      }
      renderAccountDialog();
      if (state.devicePairingFormOpen) {
        window.requestAnimationFrame(() =>
          accountDialogHost.querySelector("[data-device-pair-name]")?.focus(),
        );
      }
      return;
    }
    const deleteDeviceButton = event.target.closest("[data-delete-device]");
    if (deleteDeviceButton) {
      const deviceId = deleteDeviceButton.dataset.deleteDevice;
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
          if (state.devicePermissionId === deviceId) {
            state.devicePermissionId = null;
            state.devicePermissions = null;
            state.deviceAudit = [];
          }
          applyBackendDevices({ devices: state.devices });
          renderAccountDialog();
          renderComposer();
          syncChrome();
        })
        .catch((error) => {
          showToast(error.message || "解绑失败", "circle-alert");
        });
      return;
    }
    if (event.target.closest('[data-action="open-mobile-version"]')) {
      localStorage.setItem("qianbian-view-preference", "mobile");
      location.replace(new URL("./?mobile=1", location.href).href);
      return;
    }
    const accountSwitch = event.target.closest("[data-switch-account]");
    if (accountSwitch) {
      switchAccount(accountSwitch.dataset.switchAccount);
      return;
    }
    if (event.target.closest("[data-account-logout]")) {
      state.loggedIn = false;
      localStorage.removeItem("qianbian-desktop-auth");
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      persistAccountProfile();
      state.accountDialogOpen = false;
      state.accountSwitchOpen = false;
      renderAccountDialog();
      render();
      window.dispatchEvent(new Event("qianbian:auth-required"));
      return;
    }
    if (event.target.closest("[data-account-login]")) {
      state.loggedIn = false;
      localStorage.removeItem("qianbian-desktop-auth");
      persistAccountProfile();
      state.accountDialogOpen = false;
      state.accountSwitchOpen = false;
      renderAccountDialog();
      render();
      window.dispatchEvent(new Event("qianbian:auth-required"));
      return;
    }
    if (event.target.closest("[data-open-settings]")) {
      openSettingsSheet();
      return;
    }
    if (event.target.closest("[data-close-settings]")) {
      closeSettingsSheet();
      return;
    }
    const sidePanelTarget = event.target.closest("[data-side-panel]");
    if (sidePanelTarget) {
      setSidePanel(sidePanelTarget.dataset.sidePanel);
      return;
    }
    const panelFilter = event.target.closest("[data-panel-filter]");
    if (panelFilter) {
      setPanelFilter(
        panelFilter.dataset.panelFilter,
        panelFilter.dataset.filterValue,
      );
      return;
    }
    const reminderToggle = event.target.closest("[data-reminder-toggle]");
    if (reminderToggle) {
      toggleReminder(reminderToggle.dataset.reminderToggle);
      return;
    }
    const memoryPin = event.target.closest("[data-memory-pin]");
    if (memoryPin) {
      toggleMemoryPin(memoryPin.dataset.memoryPin);
      return;
    }
    const skillConfigToggle = event.target.closest(
      "[data-skill-config-toggle]",
    );
    if (skillConfigToggle) {
      toggleSkillConfig(skillConfigToggle.dataset.skillConfigToggle);
      return;
    }
    if (event.target.closest("[data-toggle-skill-delete]")) {
      toggleSkillDeleteMode();
      return;
    }
    if (event.target.closest("[data-delete-selected-skills]")) {
      deleteSelectedSkills();
      return;
    }
    if (event.target.closest("[data-save-right-reminder]")) {
      saveRightReminder();
      return;
    }
    if (event.target.closest("[data-delete-right-item]")) {
      deleteRightItem();
      return;
    }
    const rightDetailTarget = event.target.closest("[data-right-detail]");
    if (
      rightDetailTarget &&
      !event.target.closest("button, input, textarea, select, a")
    ) {
      openRightDetail(
        rightDetailTarget.dataset.rightDetail,
        rightDetailTarget.dataset.rightDetailId,
      );
      return;
    }
    if (event.target.closest("[data-clear-quote]")) {
      state.quotedMessage = null;
      renderComposer();
      document.getElementById("desktop-composer-input")?.focus();
      return;
    }
    const messageAction = event.target.closest("[data-message-action]");
    if (messageAction) {
      handleMessageAction(
        messageAction.dataset.messageAction,
        Number(messageAction.dataset.messageIndex),
      );
      return;
    }
    const saveIdea = event.target.closest("[data-save-idea]");
    if (saveIdea) {
      toggleSavedIdea(saveIdea.dataset.saveIdea);
      return;
    }
    const ideaPrompt = event.target.closest("[data-idea-prompt]");
    if (ideaPrompt) {
      const idea = IDEAS.find(
        (item) => item.id === ideaPrompt.dataset.ideaPrompt,
      );
      if (idea) useWorkspacePrompt(idea.prompt);
      return;
    }
    const goalCheckin = event.target.closest("[data-goal-checkin]");
    if (goalCheckin) {
      checkInGoal(goalCheckin.dataset.goalCheckin);
      return;
    }
    if (event.target.closest("[data-add-goal]")) {
      state.goalFormOpen = !state.goalFormOpen;
      renderSidePanel();
      if (state.goalFormOpen) {
        window.requestAnimationFrame(() =>
          document.getElementById("goal-title")?.focus(),
        );
      }
      return;
    }
    if (event.target.closest("[data-save-goal]")) {
      createGoalFromForm();
      return;
    }
    const feedRead = event.target.closest("[data-feed-read]");
    if (feedRead) {
      toggleFeedRead(feedRead.dataset.feedRead);
      return;
    }
    const feedPrompt = event.target.closest("[data-feed-prompt]");
    if (feedPrompt) {
      const item = FEED_ITEMS.find(
        (feedItem) => feedItem.id === feedPrompt.dataset.feedPrompt,
      );
      if (item) {
        if (!state.readFeed.has(item.id)) {
          state.readFeed.add(item.id);
          localStorage.setItem(
            "qianbian-desktop-read-feed",
            JSON.stringify([...state.readFeed]),
          );
        }
        useWorkspacePrompt(item.prompt);
      }
      return;
    }
    const searchGoal = event.target.closest("[data-search-goal]");
    if (searchGoal) {
      state.sidePanel = "goals";
      state.panelFilters.goals = "all";
      renderSidePanel();
      announce("目标面板已显示");
      return;
    }
    const viewTarget = event.target.closest("[data-view]");
    if (viewTarget) {
      if (viewTarget.tagName === "A") return;
      const nextView = viewTarget.dataset.view;
      closeMobileSidebar();
      if (nextView === "chat") setView("chat");
      else if (nextView === "settings") openSettingsSheet();
      else openRailDialog(nextView);
      return;
    }
    const detailTarget = event.target.closest("[data-detail-type]");
    if (detailTarget) {
      const root = detailTarget.closest(
        '[data-side-panel-view="settings"]',
      )
        ? "side-settings"
        : null;
      openDetail(
        detailTarget.dataset.detailType,
        detailTarget.dataset.detailId || null,
        root,
      );
      return;
    }
    if (event.target.closest("[data-close-detail]")) {
      closeDetail();
      return;
    }
    if (event.target.closest("[data-rail-dialog-back]")) {
      closeDetail();
      return;
    }
    const uiWidgetOpen = event.target.closest("[data-ui-widget-open]");
    if (uiWidgetOpen) {
      openUiWidget(uiWidgetOpen.dataset.uiWidgetOpen);
      return;
    }
    if (event.target.closest("[data-ui-widget-refresh]")) {
      if (state.uiWidgetActiveId) {
        loadUiWidgetData(state.uiWidgetActiveId, { force: true });
      }
      return;
    }
    if (event.target.closest("[data-ui-widget-retry]")) {
      if (state.uiWidgetActiveId) {
        loadUiWidgetData(state.uiWidgetActiveId, { force: true });
      }
      return;
    }
    if (event.target.closest("[data-close-rail-dialog]")) {
      closeRailDialog();
      return;
    }
    if (event.target.closest("[data-close-action-dialog]")) {
      closeActionDialog();
      return;
    }
    const actionDetail = event.target.closest("[data-action-detail]");
    if (actionDetail) {
      openActionDialog(actionDetail.dataset.actionDetail);
      return;
    }
    const skillDetail = event.target.closest("[data-skill-detail]");
    if (skillDetail) {
      openDetail("skillDetail", skillDetail.dataset.skillDetail);
      return;
    }
    const automationDetail = event.target.closest("[data-automation-detail]");
    if (automationDetail) {
      openDetail(
        "automationDetail",
        automationDetail.dataset.automationDetail,
      );
      return;
    }
    const modelTarget = event.target.closest("[data-select-model]");
    if (modelTarget) {
      selectModel(modelTarget.dataset.selectModel);
      return;
    }
    const marketSkill = event.target.closest("[data-install-market-skill]");
    if (marketSkill) {
      const id = marketSkill.dataset.installMarketSkill;
      state.marketInstalled.add(id);
      localStorage.setItem(
        "qianbian-desktop-market-installed",
        JSON.stringify([...state.marketInstalled]),
      );
      if (api && state.apiAvailable) {
        try {
          await api.installSkill(id);
          await refreshBackendSkills(state.skillMarketQuery);
        } catch (error) {
          showToast(error.message || "技能安装失败", "circle-alert");
          return;
        }
      }
      render();
      showToast("技能已安装", "circle-check");
      return;
    }
    const skillMarketTab = event.target.closest("[data-skill-market-tab]");
    if (skillMarketTab) {
      setSkillMarketTab(skillMarketTab.dataset.skillMarketTab);
      return;
    }
    if (event.target.closest("[data-open-desktop-publish]")) {
      openDesktopPublish();
      return;
    }
    if (event.target.closest("[data-desktop-publish-cancel]")) {
      state.skillMarketTab = "mine";
      renderRailDialog();
      return;
    }
    const desktopPublishMode = event.target.closest(
      "[data-desktop-publish-mode]",
    );
    if (desktopPublishMode) {
      state.desktopPublishDraft.mode =
        desktopPublishMode.dataset.desktopPublishMode;
      renderRailDialog();
      return;
    }
    if (event.target.closest("[data-desktop-choose-package]")) {
      railDialogHost
        .querySelector("[data-desktop-package-input]")
        ?.click();
      return;
    }
    if (event.target.closest("[data-desktop-dropzone]")) {
      railDialogHost
        .querySelector("[data-desktop-package-input]")
        ?.click();
      return;
    }
    if (event.target.closest("[data-desktop-select-package]")) {
      state.desktopPublishDraft.packageName = "家庭生活技能包.zip";
      renderRailDialog();
      showToast("技能包已添加", "package-check");
      return;
    }
    if (event.target.closest("[data-desktop-generate-ai]")) {
      generateDesktopAiDraft();
      return;
    }
    if (event.target.closest("[data-desktop-confirm-publish]")) {
      confirmDesktopPublish();
      return;
    }
    if (event.target.closest("[data-open-skill-market]")) {
      state.skillMarketQuery = "";
      state.skillMarketFilter = "all";
      state.skillMarketTab = "market";
      state.reminderFormOpen = false;
      state.memoryFormOpen = false;
      state.settingsSheetOpen = false;
      state.accountDialogOpen = false;
      state.accountSwitchOpen = false;
      openRailDialog("skill-market", {
        trigger: event.target.closest("[data-open-skill-market]"),
      });
      return;
    }
    const marketFilter = event.target.closest("[data-skill-market-filter]");
    if (marketFilter) {
      state.skillMarketFilter = marketFilter.dataset.skillMarketFilter;
      renderRailDialog();
      return;
    }
    if (event.target.closest("[data-save-skill]")) {
      closeDetail();
      showToast("技能已保存", "circle-check");
      return;
    }
    if (event.target.closest("[data-create-automation]")) {
      closeDetail();
      showToast("自动化已创建", "workflow");
      return;
    }
    if (event.target.closest("[data-voice-start]")) {
      showToast("语音输入演示已开始", "mic");
      return;
    }
    const quoteSession = event.target.closest("[data-quote-session]");
    if (quoteSession) {
      selectSession(quoteSession.dataset.quoteSession);
      showToast("对话已加入引用", "quote");
      return;
    }
    const sessionTarget = event.target.closest("[data-session]");
    if (sessionTarget) {
      selectSession(sessionTarget.dataset.session);
      return;
    }
    if (event.target.closest(".skill-market-refresh")) {
      const refreshButton = event.target.closest(".skill-market-refresh");
      if (refreshButton.dataset.refreshing === "true") return;
      refreshButton.dataset.refreshing = "true";
      refreshButton.disabled = true;
      refreshButton.classList.add("is-refreshing");
      refreshButton.setAttribute("aria-busy", "true");
      if (api && state.apiAvailable) {
        try {
          await refreshBackendSkills(state.skillMarketQuery);
          showToast("技能市场已刷新", "refresh-cw");
        } catch (error) {
          showToast(error.message || "刷新失败", "circle-alert");
        } finally {
          if (refreshButton.isConnected) {
            refreshButton.dataset.refreshing = "false";
            refreshButton.disabled = false;
            refreshButton.classList.remove("is-refreshing");
            refreshButton.setAttribute("aria-busy", "false");
          }
        }
      } else {
        renderRailDialog();
        showToast("技能市场已刷新", "refresh-cw");
      }
      return;
    }
    const toastTarget = event.target.closest("[data-toast]");
    if (toastTarget) {
      showToast(toastTarget.dataset.toast, "circle-check");
      return;
    }
    const themeTarget = event.target.closest("[data-set-theme]");
    if (themeTarget) {
      setTheme(themeTarget.dataset.setTheme);
      return;
    }
    const insightFilter = event.target.closest("[data-insight-filter]");
    if (insightFilter) {
      const scope = insightFilter.dataset.insightFilter;
      if (scope === "reminders") {
        state.reminderFilter = insightFilter.dataset.filterValue;
      }
      if (scope === "memory") {
        state.memoryFilter = insightFilter.dataset.filterValue;
      }
      renderInsightPanel();
      return;
    }
    if (event.target.closest("[data-toggle-reminder-form]")) {
      state.reminderFormOpen = !state.reminderFormOpen;
      renderInsightPanel();
      if (state.reminderFormOpen) {
        window.requestAnimationFrame(() =>
          document.getElementById("reminder-title")?.focus(),
        );
      }
      return;
    }
    if (event.target.closest("[data-cancel-reminder-form]")) {
      state.reminderFormOpen = false;
      renderInsightPanel();
      return;
    }
    const cadenceOption = event.target.closest("[data-cadence-option]");
    if (cadenceOption) {
      const picker = cadenceOption.closest("[data-cadence-picker]");
      const input = picker.querySelector('input[type="hidden"]');
      const value = cadenceOption.dataset.cadenceOption;
      let values = input.value
        .split("、")
        .filter((item) => REMINDER_CADENCES.includes(item));
      if (value === "每天") {
        values = ["每天"];
      } else {
        values = values.filter((item) => item !== "每天");
        values = values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value];
        if (!values.length) values = ["每天"];
      }
      input.value = values.join("、");
      picker.querySelectorAll("[data-cadence-option]").forEach((button) => {
        const active = values.includes(button.dataset.cadenceOption);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      return;
    }
    if (event.target.closest("[data-save-reminder]")) {
      createReminder();
      return;
    }
    if (event.target.closest("[data-toggle-memory-form]")) {
      state.memoryFormOpen = !state.memoryFormOpen;
      renderInsightPanel();
      if (state.memoryFormOpen) {
        window.requestAnimationFrame(() =>
          document.getElementById("memory-title")?.focus(),
        );
      }
      return;
    }
    if (event.target.closest("[data-cancel-memory-form]")) {
      state.memoryFormOpen = false;
      renderInsightPanel();
      return;
    }
    if (event.target.closest("[data-save-memory]")) {
      createMemory();
      return;
    }
    const insightTarget = event.target.closest("[data-insight-tab]");
    if (insightTarget) {
      state.insightTab = insightTarget.dataset.insightTab;
      localStorage.setItem("qianbian-desktop-insight-tab", state.insightTab);
      if (state.insightTab !== "skill-config") {
        state.skillDeleteMode = false;
        state.selectedSkills.clear();
      }
      renderInsightPanel();
      return;
    }
    const contextTab = event.target.closest("[data-context-tab]");
    if (contextTab) {
      state.contextTab = contextTab.dataset.contextTab;
      if (state.railDialog?.root === "context") renderRailDialog();
      else renderContext();
      return;
    }
    const settingsTab = event.target.closest("[data-settings-tab]");
    if (settingsTab) {
      state.settingsTab =
        settingsTab.dataset.settingsTab === "account"
          ? "appearance"
          : settingsTab.dataset.settingsTab;
      persistSettingsState();
      render();
      return;
    }
    const careToggle = event.target.closest("[data-care-toggle]");
    if (careToggle) {
      saveDesktopCare({ enabled: !state.carePrefs?.enabled });
      return;
    }
    if (event.target.closest("[data-care-test]")) {
      testDesktopCare();
      return;
    }
    if (event.target.closest("[data-care-locate]")) {
      useDesktopLocationForCare();
      return;
    }
    if (event.target.closest("[data-care-retry]")) {
      retryDesktopCare();
      return;
    }
    const settingToggle = event.target.closest("[data-setting-toggle]");
    if (settingToggle) {
      const key = settingToggle.dataset.settingToggle;
      state.settings[key] = !Boolean(state.settings[key]);
      persistSettingsState();
      render();
      showToast(
        `${state.settings[key] ? "已开启" : "已关闭"}${settingToggle.getAttribute("aria-label")?.replace("切换", "") || "设置"}`,
        state.settings[key] ? "circle-check" : "circle-minus",
      );
      return;
    }
    if (event.target.closest("[data-clear-local]")) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("qianbian-desktop-"))
        .forEach((key) => localStorage.removeItem(key));
      state.theme = "light";
      state.draft = "";
      state.goals = GOALS.map((goal) => ({ ...goal }));
      state.customGoals = [];
      state.savedIdeas = new Set();
      state.readFeed = new Set();
      state.customReminders = [];
      state.customMemories = [];
      state.reminderOverrides = {};
      state.deletedReminders = new Set();
      state.deletedMemories = new Set();
      state.reminderState = Object.fromEntries(
        REMINDERS.map((reminder) => [reminder.id, reminder.enabled]),
      );
      state.memoryPins = new Set();
      state.disabledSkills = new Set();
      state.deletedSkills = new Set();
      state.skillDeleteMode = false;
      state.selectedSkills = new Set();
      state.skillMarketQuery = "";
      state.skillMarketFilter = "all";
      state.marketInstalled = new Set();
      state.settings = { ...DEFAULT_SETTINGS };
      state.settingOptions = { ...DEFAULT_SETTING_OPTIONS };
      state.settingsTab = "appearance";
      state.currentAccountId = "main";
      state.accountName = ACCOUNTS[0].name;
      state.accountEmail = ACCOUNTS[0].email;
      state.accountBio = ACCOUNTS[0].description;
      state.accountAvatar = "assets/brand/qianbian-tile.png";
      state.accountPhone = "";
      state.accountRole = "产品与设计";
      state.accountCompany = "千变实验室";
      state.accountLocation = "";
      state.accountLocationAuto = true;
      state.accountTimezone = "Asia/Shanghai";
      state.accountLanguage = "简体中文";
      state.loggedIn = true;
      state.searchFilter = "all";
      state.sidePanel = "sessions";
      state.sidePanelOpen = false;
      state.panelFilters = {
        goals: "active",
        feed: "all",
        library: "all",
        documents: "all",
        skillConfig: "all",
      };
      state.goalFormOpen = false;
      state.workspaceMenuOpen = false;
      render();
      showToast("本地界面数据已清除", "trash-2");
      return;
    }
    const workspaceOption = event.target.closest("[data-workspace]");
    if (workspaceOption) {
      selectWorkspace(workspaceOption.dataset.workspace);
      return;
    }
    const skillTarget = event.target.closest("[data-use-skill]");
    if (skillTarget) {
      openSkill(skillTarget.dataset.useSkill);
      return;
    }
    const skillFilter = event.target.closest("[data-skill-filter]");
    if (skillFilter) {
      state.skillFilter = skillFilter.dataset.skillFilter;
      render();
      return;
    }
    const automation = event.target.closest("[data-automation]");
    if (automation) {
      const id = automation.dataset.automation;
      const enabled = !Boolean(state.automationEnabled.get(id));
      state.automationEnabled.set(id, enabled);
      render();
      showToast(enabled ? "自动化已启用" : "自动化已停用", enabled ? "circle-check" : "circle-pause");
      return;
    }
    const command = event.target.closest("[data-command-type]");
    if (command) {
      execCommand(command.dataset.commandType, command.dataset.commandId);
      return;
    }
    if (event.target.closest("[data-close-palette]")) closePalette();
    if (
      state.workspaceMenuOpen &&
      !event.target.closest("#workspace-switcher") &&
      !event.target.closest("#profile-button")
    ) {
      toggleWorkspaceMenu(false);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-device-pair-name]")) {
      state.devicePairName = event.target.value;
      return;
    }
    const desktopPublishField = event.target.closest(
      "[data-desktop-publish-field]",
    );
    if (desktopPublishField) {
      const field = desktopPublishField.dataset.desktopPublishField;
      if (field in state.desktopPublishDraft) {
        state.desktopPublishDraft[field] = desktopPublishField.value;
        syncDesktopPublishPreview();
      }
      return;
    }
    if (event.target.id !== "skill-market-search") return;
    state.skillMarketQuery = event.target.value;
    renderRailDialog();
    if (api && state.apiAvailable) {
      window.clearTimeout(skillSearchTimer);
      skillSearchTimer = window.setTimeout(() => {
        refreshBackendSkills(state.skillMarketQuery);
      }, 260);
    }
    window.requestAnimationFrame(() => {
      const input = document.getElementById("skill-market-search");
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  document.addEventListener("dragover", (event) => {
    const dropzone = event.target.closest?.("[data-desktop-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });

  document.addEventListener("dragleave", (event) => {
    const dropzone = event.target.closest?.("[data-desktop-dropzone]");
    if (!dropzone) return;
    dropzone.classList.remove("is-dragging");
  });

  document.addEventListener("drop", (event) => {
    const dropzone = event.target.closest?.("[data-desktop-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    setDesktopPublishPackage(event.dataTransfer?.files?.[0] || "");
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-device-pair-type]")) {
      state.devicePairType =
        event.target.value === "android" ? "android" : "windows";
      return;
    }
    if (event.target.id === "approval-mode-select") {
      setBackendApprovalMode(event.target.value);
      return;
    }
    const desktopPublishSelect = event.target.closest(
      "[data-desktop-publish-select]",
    );
    if (desktopPublishSelect) {
      const field = desktopPublishSelect.dataset.desktopPublishSelect;
      if (field in state.desktopPublishDraft) {
        state.desktopPublishDraft[field] = desktopPublishSelect.value;
        syncDesktopPublishPreview();
      }
      return;
    }
    if (event.target.matches("[data-desktop-package-input]")) {
      setDesktopPublishPackage(event.target.files?.[0] || "");
      return;
    }
    if (event.target.id === "account-avatar-upload") {
      uploadAccountAvatar(event.target.files?.[0]);
      return;
    }
    const skillSelect = event.target.closest("[data-skill-select]");
    if (skillSelect) {
      toggleSkillSelection(skillSelect.dataset.skillSelect, skillSelect.checked);
      return;
    }
    if (event.target.matches("[data-care-frequency]")) {
      saveDesktopCare({ maxPerDay: Number(event.target.value) || 1 });
      return;
    }
    if (event.target.matches("[data-care-quiet-start]")) {
      saveDesktopCare({ quietStart: event.target.value });
      return;
    }
    if (event.target.matches("[data-care-quiet-end]")) {
      saveDesktopCare({ quietEnd: event.target.value });
      return;
    }
    const select = event.target.closest("[data-setting-select]");
    if (!select) return;
    state.settingOptions[select.dataset.settingSelect] = select.value;
    persistSettingsState();
    syncChrome();
    showToast(`设置已更新：${select.options[select.selectedIndex]?.text || ""}`, "sliders-horizontal");
  });

  document.getElementById("new-chat").addEventListener("click", startNewChat);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  });
  historyFilter.addEventListener("input", () => {
    state.historyPanelQuery = historyFilter.value;
    renderSessions();
  });
  sideSearchInput?.addEventListener("input", () => {
    state.sideSearchQuery = sideSearchInput.value;
    renderSideSearchResults();
  });
  document
    .getElementById("context-toggle")
    ?.addEventListener("click", toggleContext);
  document.getElementById("sidebar-open").addEventListener("click", openMobileSidebar);
  document.getElementById("sidebar-close").addEventListener("click", closeMobileSidebar);
  sidePanelClose?.addEventListener("click", () => closeWorkspacePanel());
  detailBack.addEventListener("click", closeDetail);
  mobileScrim.addEventListener("click", () => {
    closeMobileSidebar();
    closeWorkspacePanel();
    if (state.contextOpen && window.innerWidth <= 1280) {
      state.contextOpen = false;
      render();
    }
  });
  document.getElementById("engine-status")?.addEventListener("click", () => {
    openDetail("model");
  });
  document
    .getElementById("profile-button")
    ?.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleWorkspaceMenu();
    });
  commandInput.addEventListener("input", () => {
    state.paletteQuery = commandInput.value;
    renderPaletteResults();
  });
  commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePalette();
    if (event.key === "Enter") {
      const first = commandResults.querySelector("[data-command-type]");
      if (first) first.click();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (body.classList.contains("login-locked")) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setSidePanel("search");
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      startNewChat();
    }
    if (event.key === "Escape") {
      if (state.paletteOpen) {
        closePalette();
        return;
      }
      if (state.accountDialogOpen) {
        closeAccountDialog();
        return;
      }
      if (state.settingsSheetOpen) {
        closeSettingsSheet();
        return;
      }
      if (state.railDialog) {
        if (
          state.detail &&
          !["none", "model"].includes(state.railDialog.root)
        ) {
          closeDetail();
        } else {
          closeRailDialog();
        }
        return;
      }
      if (state.actionDialog) {
        closeActionDialog();
        return;
      }
      if (state.detail) {
        closeDetail();
        return;
      }
      if (state.workspaceMenuOpen) {
        toggleWorkspaceMenu(false);
        return;
      }
      if (state.voiceRecording) {
        stopVoiceRecording();
        return;
      }
      if (state.composerOpen || state.composerClosing) {
        toggleComposer(false);
        return;
      }
      if (body.classList.contains("workspace-panel-open")) {
        closeWorkspacePanel();
        return;
      }
      closeMobileSidebar();
      if (window.innerWidth <= 1280 && state.contextOpen) {
        state.contextOpen = false;
        render();
      }
    }
  });

  composerHost.addEventListener("click", (event) => {
    if (event.target.closest("#composer-plus")) {
      toggleComposer();
      return;
    }
    if (event.target.closest("[data-toggle-voice]")) {
      startVoiceRecording();
      return;
    }
    if (event.target.closest("#composer-send")) sendMessage();
  });

  window.addEventListener("resize", handleViewportChange);
  if ("ResizeObserver" in window) {
    const chatAlignmentObserver = new ResizeObserver(() => {
      syncChatAlignment();
    });
    chatAlignmentObserver.observe(document.querySelector(".main-workspace"));
    chatAlignmentObserver.observe(document.querySelector(".workspace-header"));
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== "dshgo-agent-training") return;
    const next = Number(event.newValue);
    if (!Number.isFinite(next)) return;
    state.agentTraining = Math.min(80, Math.max(0, next));
    renderContext();
  });
  window.addEventListener("qianbian:auth-success", (event) => {
    const detail = event.detail || {};
    state.loggedIn = true;
    state.accountDialogOpen = false;
    state.accountSwitchOpen = false;
    if (detail.email) state.accountEmail = detail.email;
    if (detail.phone) state.accountPhone = detail.phone;
    if (detail.name) state.accountName = detail.name;
    persistAccountProfile();
    renderAccountDialog();
    render();
    initializeBackend();
  });
  window.addEventListener("qianbian:auth-required", () => {
    api?.closeEvents?.();
    backendInitStarted = false;
    state.loggedIn = false;
    state.accountDialogOpen = false;
    state.accountSwitchOpen = false;
    persistAccountProfile();
    renderAccountDialog();
    render();
  });

  document.addEventListener("visibilitychange", () => {
    if (state.railDialog?.root !== "ui-widget") return;
    if (document.visibilityState === "hidden") {
      stopUiWidgetRefresh();
      return;
    }
    if (state.uiWidgetActiveId) {
      loadUiWidgetData(state.uiWidgetActiveId, { force: true, silent: true });
    }
  });

  handleViewportChange();
  render();
  initializeBackend();
  if (state.draft) {
    window.requestAnimationFrame(() => {
      const input = document.getElementById("desktop-composer-input");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }
})();
