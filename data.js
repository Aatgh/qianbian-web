(function () {
  "use strict";

  const groups = [];
  const pages = {};
  let ordinal = 0;

  function addGroup(id, title, icon, description) {
    const group = { id, title, icon, description, pages: [] };
    groups.push(group);
    return group;
  }

  function addPage(group, config) {
    const page = {
      ordinal: ordinal++,
      id: config.id,
      group: group.id,
      groupTitle: group.title,
      title: config.title,
      summary: config.summary || "",
      icon: config.icon || group.icon,
      kind: config.kind || "generic",
      path: config.path || ["千变", group.title, config.title],
      overlay: Boolean(config.overlay),
      state: config.state || "",
      ...config,
    };
    pages[page.id] = page;
    group.pages.push(page.id);
    return page;
  }

  function row(label, options = {}) {
    return {
      label,
      icon: options.icon || "circle",
      description: options.description || "",
      value: options.value || "",
      badge: options.badge || "",
      tone: options.tone || "",
      nav: options.nav || "",
      action: options.action || "",
      control: options.control || "",
      checked: Boolean(options.checked),
      options: options.options || [],
      values: options.values || [],
      key: options.key || "",
      selected: options.selected || 0,
      buttonLabel: options.buttonLabel || "",
      meta: options.meta || "",
      danger: Boolean(options.danger),
    };
  }

  function section(title, rows, note) {
    return { title, rows, note: note || "" };
  }

  function generic(id, title, options = {}) {
    return {
      ...options,
      id,
      title,
      summary: options.summary || "",
      icon: options.icon || "panel-top",
      kind: options.kind || "generic",
      path: options.path,
      hero: options.hero || options.summary || "",
      heroTitle: options.heroTitle || title,
      metrics: options.metrics || [],
      status: options.status || null,
      tabs: options.tabs || [],
      activeTab: options.activeTab || 0,
      sections: options.sections || [],
      actions: options.actions || [],
      note: options.note || "",
      state: options.state || "",
      overlay: options.overlay || false,
    };
  }

  function settings(id, title, sections, options = {}) {
    return generic(id, title, {
      ...options,
      icon: options.icon || "settings-2",
      kind: "settings",
      sections,
    });
  }

  const start = addGroup(
    "start",
    "启动与引导",
    "rocket",
    "首次启动、运行环境、权限与模型接入"
  );
  const conversation = addGroup(
    "conversation",
    "对话与工作台",
    "message-circle",
    "聊天、会话、会话详情和对话内工具"
  );
  const workspace = addGroup(
    "workspace",
    "文件、终端与产物",
    "folder-open",
    "工作区浏览、文件预览、终端和交付物"
  );
  const ai = addGroup(
    "ai",
    "模型与 AI 能力",
    "sparkles",
    "模型渠道、权限、个性化、搜索和媒体"
  );
  const phone = addGroup(
    "phone",
    "手机操控与系统",
    "smartphone",
    "屏幕、辅助功能、系统权限和后台运行"
  );
  const plugins = addGroup(
    "plugins",
    "技能板块",
    "puzzle",
    "热门技能、我发布的技能、已安装技能与技能发布"
  );
  const community = addGroup(
    "community",
    "社区与分享",
    "users",
    "社区、论坛与分享"
  );
  const companion = addGroup(
    "companion",
    "伙伴与创意工坊",
    "heart-handshake",
    "Deepy、鲸娘、宠物包和创意工坊"
  );
  const tavern = addGroup(
    "tavern",
    "酒馆模式",
    "book-open",
    "角色、故事、世界书、预设和草稿"
  );
  const appearance = addGroup(
    "appearance",
    "外观与界面",
    "palette",
    "主题、壁纸、图标、语言和动效"
  );
  const hosts = addGroup(
    "hosts",
    "设置与帮助",
    "server",
    "账号、设置与通知"
  );
  const overlays = addGroup(
    "overlays",
    "可触达弹层与状态",
    "layers",
    "移动端底部面板、对话框和关键状态"
  );

  addPage(
    start,
    generic("welcome", "欢迎使用 千变", {
      kind: "welcome",
      icon: "sparkles",
      summary: "把 AI Agent 装进口袋",
      path: ["千变", "首次启动", "欢迎"],
      state: "first-run",
    })
  );

  addPage(
    start,
    generic("setup-runtime", "准备运行环境", {
      kind: "onboarding",
      icon: "server-cog",
      summary: "在手机上安装运行环境，完成后直接开始对话。",
      path: ["首次启动", "运行方式"],
      step: 1,
      steps: 6,
      eyebrow: "SETUP 01",
      heroTitle: "准备手机运行环境",
      hero: "无需电脑，安装后即可直接开始对话。",
      choices: [
        {
          icon: "smartphone",
          title: "在这台手机上运行",
          description: "内置 Linux、Node.js 与 千变 运行环境，约需 1 GB 空间。",
          selected: true,
          nav: "setup-appearance",
        },
      ],
      cta: "继续",
      ctaNav: "setup-appearance",
      secondary: "稍后配置",
      secondaryNav: "setup-connect",
    })
  );

  addPage(
    start,
    generic("setup-appearance", "选择外观", {
      kind: "onboarding",
      icon: "palette",
      summary: "先选一个顺眼的主题，后面的设置随时可以改。",
      path: ["首次启动", "外观"],
      step: 2,
      steps: 6,
      eyebrow: "SETUP 02",
      heroTitle: "让界面先合你心意",
      hero: "跟随系统是最稳妥的选择；也可以直接选定浅色或深色。",
      choices: [
        {
          icon: "monitor-smartphone",
          title: "跟随系统",
          description: "系统切换深浅色时自动跟随。",
          selected: true,
        },
        {
          icon: "sun",
          title: "浅色",
          description: "明亮、清晰的日间界面。",
        },
        {
          icon: "moon-star",
          title: "深色",
          description: "降低亮度，适合夜间使用。",
        },
      ],
      swatches: ["a62466"],
      cta: "继续",
      ctaNav: "setup-access",
      secondary: "暂时跳过",
      secondaryNav: "setup-access",
    })
  );

  addPage(
    start,
    generic("setup-access", "按功能开启权限", {
      kind: "onboarding",
      icon: "shield-check",
      summary: "权限只在你明确开启的功能上生效。",
      path: ["首次启动", "系统权限"],
      step: 3,
      steps: 6,
      eyebrow: "SETUP 03",
      heroTitle: "只给需要的权限",
      hero: "现在可以跳过，之后在设置中按需开启。手机操控等敏感能力始终需要单独确认。",
      sections: [
        section("建议开启", [
          row("通知", {
            icon: "bell",
            description: "任务完成、失败或等待确认时提醒你。",
            control: "switch",
            checked: true,
          }),
          row("存储访问", {
            icon: "folder",
            description: "让本机运行时访问共享存储中的文件。",
            control: "switch",
            checked: true,
          }),
          row("后台运行", {
            icon: "battery-plus",
            description: "减少系统在回复中途结束 App 的概率。",
            control: "switch",
            checked: false,
          }),
        ]),
      ],
      cta: "继续",
      ctaNav: "setup-api",
      secondary: "稍后设置",
      secondaryNav: "setup-api",
    })
  );

  addPage(
    start,
    generic("setup-api", "连接模型", {
      kind: "onboarding",
      icon: "key-round",
      summary: "使用 模型 API Key，或配置其他兼容的模型提供方。",
      path: ["首次启动", "模型接入"],
      step: 4,
      steps: 6,
      eyebrow: "SETUP 04",
      heroTitle: "给 千变 一把钥匙",
      hero: "密钥只保存在这台设备的安全存储中。演示页不会发送任何请求。",
      tabs: ["模型 API", "自定义提供方"],
      form: [
        {
          label: "API Key",
          value: "sk-demo-••••••••••••••••",
          type: "password",
          hint: "仅保存在本机",
        },
      ],
      sections: [
        section("余额与验证", [
          row("连接测试", {
            icon: "badge-check",
            description: "只验证密钥格式与主机连通性。",
            value: "未测试",
            badge: "可选",
          }),
        ]),
      ],
      cta: "保存并继续",
      ctaNav: "setup-connect",
      secondary: "稍后设置",
      secondaryNav: "setup-connect",
    })
  );

  addPage(
    start,
    generic("setup-connect", "完成连接", {
      kind: "onboarding",
      icon: "plug-zap",
      summary: "正在准备本机引擎与默认对话设置。",
      path: ["首次启动", "完成设置"],
      step: 5,
      steps: 6,
      eyebrow: "SETUP 05",
      heroTitle: "最后确认一下",
      hero: "安装完成后可以直接开始新对话；所有选择都能在设置中修改。",
      sections: [
        section("当前选择", [
          row("运行方式", { icon: "server", value: "这台手机" }),
          row("主题", { icon: "palette", value: "跟随系统" }),
          row("模型", { icon: "sparkles", value: "模型 API" }),
          row("权限", { icon: "shield", value: "按需开启" }),
        ]),
      ],
      status: {
        title: "运行环境准备完成",
        description: "Node.js、千变 0.1.1-rc.2 与默认技能已就绪。",
        tone: "success",
      },
      cta: "开始使用",
      ctaNav: "home",
    })
  );

  addPage(
    start,
    generic("setup-finish", "等待安装完成", {
      kind: "onboarding",
      icon: "loader-circle",
      summary: "安装运行环境时可以先继续配置，完成后会自动切换。",
      path: ["首次启动", "安装进度"],
      step: 5,
      steps: 6,
      eyebrow: "SETUP 05",
      heroTitle: "正在解开运行环境",
      hero: "解压与校验期间请保持 App 在前台；完成后会自动启动本机引擎。",
      metrics: [
        { value: "86%", label: "安装进度" },
        { value: "742 MB", label: "已写入" },
        { value: "约 1 分钟", label: "预计剩余" },
        { value: "arm64", label: "目标架构" },
      ],
      status: {
        title: "正在校验运行时",
        description: "校验完成后会启动 千变 引擎。",
        tone: "success",
      },
      cta: "开始使用",
      ctaNav: "home",
    })
  );

  addPage(
    start,
    generic("launch-screen", "启动画面", {
      kind: "launch",
      icon: "panel-top",
      summary: "冷启动时的品牌标记、自定义图片与动画。",
      path: ["设置", "外观", "启动画面"],
      heroTitle: "千变",
      hero: "干净的品牌启动画面，支持自定义图片、视频与动效。",
    })
  );

  addPage(
    start,
    generic("launch-editor", "编辑启动画面", {
      icon: "image-play",
      summary: "选择背景、缩放方式、动效时长和显示位置。",
      path: ["设置", "外观", "启动画面", "编辑"],
      heroTitle: "启动画面编辑器",
      hero: "预览区域使用当前主题与品牌标识。",
      sections: [
        section("素材", [
          row("背景图片", { icon: "image", value: "深海渐变", nav: "file-preview" }),
          row("品牌标记", { icon: "badge", control: "switch", checked: true }),
          row("自动淡出", { icon: "timer", control: "switch", checked: true }),
        ]),
        section("动效", [
          row("入场", {
            icon: "sparkles",
            control: "segment",
            options: ["淡入", "推进", "无"],
            selected: 0,
          }),
          row("保持时长", { icon: "clock-3", value: "1.2 秒" }),
        ]),
      ],
      actions: [{ label: "保存预览", icon: "check" }],
    })
  );

  addPage(
    start,
    generic("startup-failure", "启动失败恢复", {
      icon: "triangle-alert",
      summary: "安全模式、日志与重新安装入口。",
      path: ["本机引擎", "启动失败"],
      status: {
        title: "运行环境未能启动",
        description: "连续启动失败后已自动进入安全模式，可先查看日志或恢复工作区。",
        tone: "error",
      },
      sections: [
        section("恢复操作", [
          row("重新启动引擎", { icon: "rotate-cw", badge: "建议" }),
          row("查看启动日志", { icon: "file-clock", nav: "job-output" }),
          row("安全模式", {
            icon: "shield-plus",
            description: "禁用部分技能与自动化能力。",
            control: "switch",
            checked: true,
          }),
          row("重置运行环境", {
            icon: "trash-2",
            description: "对话记录默认保留，已安装软件会被移除。",
            tone: "danger",
          }),
        ]),
      ],
    })
  );

  addPage(
    conversation,
    generic("home", "新对话", {
      kind: "chat",
      icon: "message-circle",
      summary: "空会话、快捷能力和输入区。",
      path: ["对话"],
      mode: "empty",
    })
  );

  addPage(
    conversation,
    generic("chat", "对话", {
      kind: "chat",
      icon: "message-circle",
      summary: "完整消息流、工具调用与玻璃输入条。",
      path: ["对话", "千变 界面复刻"],
      mode: "active",
    })
  );

  addPage(
    conversation,
    generic("chat-running", "生成中", {
      kind: "chat",
      icon: "loader-circle",
      summary: "思考中、工具执行、排队消息和停止操作。",
      path: ["对话", "生成中"],
      mode: "running",
    })
  );

  addPage(
    conversation,
    generic("chat-approval", "等待审批", {
      kind: "chat",
      icon: "shield-alert",
      summary: "命令执行前的确认卡与权限状态。",
      path: ["对话", "等待审批"],
      mode: "approval",
    })
  );

  addPage(
    conversation,
    generic("chat-question", "等待回答", {
      kind: "chat",
      icon: "circle-help",
      summary: "Agent 向用户提问并提供选项。",
      path: ["对话", "等待回答"],
      mode: "question",
    })
  );

  addPage(
    conversation,
    generic("drawer", "对话目录", {
      kind: "drawer",
      icon: "panel-left",
      summary: "会话列表、搜索、工作区和主机状态。",
      path: ["对话", "对话目录"],
      overlay: true,
    })
  );

  addPage(
    conversation,
    generic("session-search", "搜索对话", {
      kind: "search",
      icon: "search",
      summary: "跨会话检索标题与内容。",
      path: ["全部功能", "搜索对话"],
      searchTitle: "搜索对话",
      searchHint: "搜索标题、消息或文件",
      searchResults: [
        {
          title: "千变 界面复刻",
          subtitle: "正在整理全部页面与交互入口",
          icon: "message-circle",
          nav: "chat",
        },
        {
          title: "设计稿差异检查",
          subtitle: "检查玻璃顶栏、输入条与消息间距",
          icon: "scan-search",
          nav: "chat",
        },
        {
          title: "远程主机连接",
          subtitle: "SSH 配置与 千变 Remote 配对",
          icon: "server",
          nav: "remote",
        },
      ],
    })
  );

  addPage(
    conversation,
    generic("session-workbench", "会话工作台", {
      kind: "session-workbench",
      icon: "panels-top-left",
      summary: "会话、执行、上下文与运行方式的综合视图。",
      path: ["对话", "会话工作台"],
      workbench: {
        sessionTitle: "千变 界面复刻",
        sessionMeta: "通用模型 V4 · 这台手机",
        status: "运行中",
        metrics: [
          { value: "12.4k", label: "已用 Tokens" },
          { value: "41%", label: "窗口占用" },
          { value: "3", label: "工具调用" },
          { value: "18m", label: "本轮耗时" },
        ],
        trajectory: [
          {
            title: "读取页面源码",
            detail: "扫描页面路由、组件与交互入口。",
            time: "3.2s",
            icon: "file-search",
            state: "完成",
          },
          {
            title: "整理页面树",
            detail: "按引导、对话、技能、设置和帮助分组。",
            time: "5.9s",
            icon: "list-tree",
            state: "完成",
          },
          {
            title: "生成综合工作台",
            detail: "合并会话详情、轨迹、上下文与网页模式。",
            time: "进行中",
            icon: "layout-dashboard",
            state: "进行中",
          },
        ],
        usage: {
          percent: 41,
          used: "12.4k",
          window: "128k",
          parts: [
            { label: "系统与工具", value: "4.1k", icon: "wrench" },
            { label: "对话消息", value: "6.8k", icon: "messages-square" },
            { label: "附件与文件", value: "1.5k", icon: "paperclip" },
          ],
        },
        modes: [
          {
            id: "native",
            label: "原生",
            title: "原生会话",
            detail: "当前设备上的完整对话体验。",
            endpoint: "千变 App",
          },
          {
            id: "web",
            label: "网页",
            title: "网页模式",
            detail: "在浏览器中继续同一段会话。",
            endpoint: "web.lingjing.local",
          },
          {
            id: "local",
            label: "本机网页",
            title: "本机网页版",
            detail: "网页会话不离开设备网络。",
            endpoint: "127.0.0.1:4173",
          },
        ],
        actions: [
          { label: "文件与产物", detail: "交付物与工作区", icon: "folder-open" },
          { label: "终端", detail: "命令与运行输出", icon: "terminal" },
          { label: "后台任务", detail: "队列与执行状态", icon: "list-checks" },
          { label: "技能", detail: "已安装与技能市场", icon: "puzzle" },
          { label: "模型与工具", detail: "提供方与能力", icon: "sparkles" },
          { label: "会话设置", detail: "权限与上下文", icon: "settings-2" },
        ],
      },
    })
  );

  addPage(
    conversation,
    generic("session-detail", "对话详情", {
      kind: "session-detail",
      icon: "chart-no-axes-combined",
      summary: "轨迹、改动、文件、进度、上下文和子代理。",
      path: ["对话", "对话详情"],
      metrics: [
        { value: "12.4k", label: "上下文 Tokens" },
        { value: "3", label: "工具调用" },
        { value: "2", label: "子代理" },
        { value: "18m", label: "本轮耗时" },
      ],
      tabs: ["轨迹", "改动", "文件", "进度", "上下文", "子代理"],
      sections: [
        section("执行轨迹", [
          row("读取页面源码", {
            icon: "file-search",
            description: "扫描 Flutter 路由、页面类与设置索引。",
            badge: "完成",
            tone: "success",
          }),
          row("整理页面树", {
            icon: "list-tree",
            description: "按启动、对话、能力、设置和帮助分组。",
            badge: "完成",
            tone: "success",
          }),
          row("生成交互原型", {
            icon: "code-xml",
            description: "创建 HTML、CSS、页面数据与前端状态。",
            badge: "进行中",
          }),
        ]),
      ],
    })
  );

  addPage(
    conversation,
    generic("trajectory", "执行轨迹", {
      kind: "timeline",
      icon: "route",
      summary: "本轮思考、工具调用、耗时和结果。",
      path: ["对话详情", "轨迹"],
      timeline: [
        {
          title: "理解请求",
          detail: "识别全部 UI 页面、前端演示和无后端依赖三个约束。",
          time: "0.8s",
          icon: "brain",
        },
        {
          title: "读取项目证据",
          detail: "提取主导航、设置索引、页面路由和设计规范。",
          time: "3.2s",
          icon: "file-search",
        },
        {
          title: "生成页面目录",
          detail: "将可触达页面与状态按功能分组。",
          time: "5.9s",
          icon: "list-tree",
        },
        {
          title: "运行浏览器检查",
          detail: "检查页面跳转、弹层、尺寸和文字溢出。",
          time: "待执行",
          icon: "scan-search",
        },
      ],
    })
  );

  addPage(
    conversation,
    generic("usage", "上下文与用量", {
      kind: "usage",
      icon: "gauge",
      summary: "上下文占比、模型、费用与本轮统计。",
      path: ["对话", "上下文"],
      metrics: [
        { value: "41%", label: "上下文占用" },
        { value: "12.4k", label: "已用 Tokens" },
        { value: "¥0.18", label: "本轮费用" },
        { value: "AI 平台", label: "当前模型" },
      ],
      sections: [
        section("上下文构成", [
          row("系统指令与工具", { icon: "wrench", value: "4.1k" }),
          row("对话消息", { icon: "messages-square", value: "6.8k" }),
          row("附件与文件", { icon: "paperclip", value: "1.5k" }),
        ]),
      ],
    })
  );

  addPage(
    conversation,
    generic("quick-panel", "快捷面板", {
      kind: "quick-panel",
      icon: "zap",
      summary: "最近对话、快捷动作和主机切换。",
      path: ["对话", "快捷面板"],
      overlay: true,
    })
  );

  addPage(
    conversation,
    generic("all-features", "全部功能", {
      kind: "all-features",
      icon: "layout-grid",
      summary: "当前对话、技能、社区、工具和设置。",
      path: ["对话目录", "全部功能"],
      featureSections: [
        {
          title: "当前对话",
          items: [
            { title: "对话详情", summary: "轨迹、改动、文件与进度", icon: "chart-no-axes-combined", nav: "session-detail" },
            { title: "产出的文件", summary: "预览、分享和保存交付物", icon: "package-open", nav: "artifacts" },
            { title: "文件", summary: "浏览这段对话的工作区", icon: "folder-open", nav: "files" },
            { title: "终端", summary: "在当前工作区运行命令", icon: "terminal", nav: "terminal" },
            { title: "后台任务", summary: "查看输出或停止运行", icon: "list-checks", nav: "jobs" },
            { title: "计划与目标", summary: "查看待办、目标和执行状态", icon: "flag", nav: "trajectory" },
            { title: "技能", summary: "浏览、安装和调用技能", icon: "book-open", nav: "skills" },
            { title: "子代理", summary: "查看并行代理与协作结果", icon: "network", nav: "session-detail" },
          ],
        },
        {
          title: "技能",
          items: [
            { title: "技能", summary: "已安装与技能市场", icon: "puzzle", nav: "plugins" },
            { title: "Agent 团队", summary: "并行代理与角色协作", icon: "users-round", nav: "agent-team" },
          ],
        },
        {
          title: "社区与分享",
          items: [
            { title: "论坛", summary: "教程、技能、经验与问答", icon: "messages-square", nav: "forum" },
            { title: "社区", summary: "官方渠道与交流群", icon: "users", nav: "community" },
            { title: "DS Bot", summary: "机器人、群聊和提醒", icon: "bot", nav: "bots" },
            { title: "分享配置", summary: "生成链接、二维码或文件", icon: "share-2", nav: "share-config" },
          ],
        },
        {
          title: "工具",
          items: [
            { title: "搜索对话", summary: "跨会话检索", icon: "search", nav: "session-search" },
            { title: "工作区", summary: "管理工作区与会话归属", icon: "folders", nav: "workspaces" },
            { title: "网页版", summary: "切换到官方 千变 Web 界面", icon: "globe", nav: "web-mode" },
          ],
        },
        {
          title: "设置",
          items: [
            { title: "模型", summary: "提供方、模型和路由", icon: "sparkles", nav: "providers" },
            { title: "权限", summary: "命令、文件和手机操作默认值", icon: "shield", nav: "permission" },
            { title: "手机操控", summary: "屏幕、点按和无障碍", icon: "hand-pointer", nav: "phone-control" },
            { title: "全部设置", summary: "查看完整设置页面树", icon: "settings-2", nav: "settings" },
          ],
        },
      ],
    })
  );

  addPage(
    conversation,
    generic("web-mode", "网页模式", {
      kind: "web",
      icon: "globe",
      summary: "在原生界面与官方 千变 Web 之间切换。",
      path: ["全部功能", "网页版"],
      webTitle: "AI Agent",
      webSubtitle: "工作区 / 默认项目",
    })
  );

  addPage(
    conversation,
    generic("local-web", "本机网页版", {
      kind: "web",
      icon: "globe-lock",
      summary: "本机引擎提供的网页版会话，不离开设备网络。",
      path: ["本机引擎", "网页版"],
      webTitle: "本机 千变",
      webSubtitle: "127.0.0.1 · 已连接",
    })
  );

  addPage(
    workspace,
    generic("files", "文件", {
      kind: "files",
      icon: "folder-open",
      summary: "当前对话工作区的文件浏览与操作。",
      path: ["全部功能", "文件"],
      filesPath: "~/workspace/千变",
      files: [
        { name: "app", type: "folder", meta: "12 项" },
        { name: "docs", type: "folder", meta: "8 项" },
        { name: "site", type: "folder", meta: "5 项" },
        { name: "README.md", type: "markdown", meta: "24 KB", nav: "file-preview" },
        { name: "slides.html", type: "html", meta: "18 KB", nav: "file-preview" },
        { name: "ui-map.json", type: "code", meta: "9 KB", nav: "file-preview" },
        { name: "release.apk", type: "package", meta: "84 MB" },
      ],
    })
  );

  addPage(
    workspace,
    generic("workspace-browser", "工作区浏览器", {
      kind: "files",
      icon: "folder-tree",
      summary: "跨工作区浏览、切换与管理目录。",
      path: ["全部功能", "工作区", "浏览"],
      filesPath: "/workspaces",
      files: [
        { name: "千变", type: "folder", meta: "当前" },
        { name: "design-lab", type: "folder", meta: "3 个会话" },
        { name: "shared", type: "folder", meta: "只读" },
        { name: "AGENTS.md", type: "markdown", meta: "6 KB", nav: "file-preview" },
      ],
    })
  );

  addPage(
    workspace,
    generic("file-preview", "文件预览", {
      kind: "file-preview",
      icon: "file-text",
      summary: "Markdown、代码、图片、PDF 与表格预览。",
      path: ["文件", "README.md"],
      fileName: "README.md",
      fileContent:
        "# 千变\n\n把 AI Agent 装进口袋。\n\n## 本机运行\n\n内置 Linux 环境，无需 Root 或 Termux。\n\n## 远程连接\n\n通过 SSH 或 千变 Remote 连接电脑与服务器。\n\n## 全部功能\n\n- 对话与工具调用\n- 文件、终端和产物\n- 技能、自动化与社区\n- 主题、宠物和手机操控",
    })
  );

  addPage(
    workspace,
    generic("artifacts", "产出的文件", {
      kind: "files",
      icon: "package-open",
      summary: "本段对话生成和交付的文件。",
      path: ["全部功能", "产出的文件"],
      filesPath: "~/artifacts/UI 组件",
      files: [
        { name: "ui-demo", type: "folder", meta: "HTML 原型" },
        { name: "ui-inventory.md", type: "markdown", meta: "32 KB", nav: "file-preview" },
        { name: "screen-catalog.json", type: "code", meta: "18 KB", nav: "artifact-preview" },
        { name: "preview.png", type: "image", meta: "1440 × 900", nav: "image-viewer" },
      ],
    })
  );

  addPage(
    workspace,
    generic("artifact-preview", "产物预览", {
      kind: "artifact-preview",
      icon: "panels-top-left",
      summary: "在 App 内预览 HTML、图表和交互产物。",
      path: ["产出的文件", "HTML 演示"],
      artifactTitle: "千变 UI Atlas",
      artifactSubtitle: "本地 HTML 交互原型 · 390 × 844",
    })
  );

  addPage(
    workspace,
    generic("image-viewer", "图片查看器", {
      kind: "image-viewer",
      icon: "image",
      summary: "缩放、分享、保存和查看图片详情。",
      path: ["文件", "preview.png"],
      imageSrc: "assets/feature/remote-demo.webp",
    })
  );

  addPage(
    workspace,
    generic("terminal", "终端", {
      kind: "terminal",
      icon: "terminal",
      summary: "工作区内的完整终端，支持键盘与快捷按键。",
      path: ["全部功能", "终端"],
      terminalPath: "~/workspace/千变",
      terminalLines: [
        { type: "prompt", text: "npm run check" },
        { type: "out", text: "> UI 组件@1.0.0 check" },
        { type: "out", text: "> node scripts/check-pages.mjs" },
        { type: "out", text: "✓ 页面引用完整" },
        { type: "out", text: "✓ 所有入口可达" },
        { type: "out", text: "✓ 前端状态无外部请求" },
        { type: "out", text: "完成，用时 0.84s" },
        { type: "prompt", text: "git status --short" },
        { type: "out", text: "A  index.html" },
        { type: "out", text: "A  styles.css" },
        { type: "out", text: "A  data.js" },
        { type: "out", text: "A  app.js" },
      ],
    })
  );

  addPage(
    workspace,
    generic("diff", "改动详情", {
      kind: "diff",
      icon: "git-diff",
      summary: "文件改动、差异与行级操作。",
      path: ["对话详情", "改动", "app.js"],
    })
  );

  addPage(
    workspace,
    generic("jobs", "后台任务", {
      kind: "jobs",
      icon: "list-checks",
      summary: "运行中、已结束和失败的后台任务。",
      path: ["全部功能", "后台任务"],
      jobs: [
        {
          title: "构建 HTML 演示",
          description: "生成静态页面与离线资源",
          status: "运行中",
          tone: "running",
          progress: 78,
          nav: "job-output",
        },
        {
          title: "页面覆盖检查",
          description: "核对所有导航引用与交互入口",
          status: "完成",
          tone: "success",
          progress: 100,
          nav: "job-output",
        },
        {
          title: "Playwright 截图",
          description: "桌面、窄屏和移动端快照",
          status: "排队中",
          tone: "idle",
          progress: 0,
          nav: "job-output",
        },
      ],
    })
  );

  addPage(
    workspace,
    generic("job-output", "任务输出", {
      kind: "output",
      icon: "square-terminal",
      summary: "任务实时日志、退出码与操作。",
      path: ["后台任务", "构建 HTML 演示"],
      terminalLines: [
        { type: "prompt", text: "npm run build:demo" },
        { type: "out", text: "读取页面目录..." },
        { type: "out", text: "生成 160 个可触达页面" },
        { type: "out", text: "校验 328 个导航引用" },
        { type: "out", text: "复制品牌、图标和宠物资源" },
        { type: "prompt", text: "node scripts/check-pages.mjs" },
        { type: "out", text: "all pages reachable" },
      ],
    })
  );

  addPage(
    workspace,
    generic("export", "导出对话日志", {
      kind: "export",
      icon: "archive",
      summary: "把对话、附件与元信息打包成 ZIP。",
      path: ["全部功能", "导出对话日志"],
      sections: [
        section("导出内容", [
          row("完整消息", { icon: "messages-square", control: "switch", checked: true }),
          row("工具调用与结果", { icon: "wrench", control: "switch", checked: true }),
          row("附件", { icon: "paperclip", control: "switch", checked: true }),
          row("遮蔽敏感信息", { icon: "eye-off", control: "switch", checked: true }),
        ]),
        section("格式", [
          row("Markdown + 附件", {
            icon: "file-archive",
            control: "segment",
            options: ["Markdown", "JSON", "HTML"],
            selected: 0,
          }),
        ]),
      ],
      actions: [{ label: "生成 ZIP", icon: "download" }],
    })
  );

  addPage(
    workspace,
    generic("workspaces", "工作区", {
      kind: "workspaces",
      icon: "folders",
      summary: "工作区列表、会话归属和目录设置。",
      path: ["全部功能", "工作区"],
      workspaces: [
        {
          title: "千变",
          description: "~/workspace/千变",
          meta: "8 个会话",
          icon: "folder-code",
          active: true,
          nav: "workspace-browser",
        },
        {
          title: "design-lab",
          description: "~/workspace/design-lab",
          meta: "3 个会话",
          icon: "folder-pen",
          nav: "workspace-browser",
        },
        {
          title: "shared",
          description: "/mnt/shared",
          meta: "只读",
          icon: "folder-lock",
          nav: "workspace-browser",
        },
      ],
    })
  );

  addPage(
    workspace,
    generic("directory-picker", "选择目录", {
      kind: "files",
      icon: "folder-search",
      summary: "浏览运行环境中的目录并选择工作区。",
      path: ["工作区", "选择目录"],
      filesPath: "/root",
      files: [
        { name: "workspace", type: "folder", meta: "打开" },
        { name: "projects", type: "folder", meta: "打开" },
        { name: "downloads", type: "folder", meta: "打开" },
        { name: "AGENTS.md", type: "markdown", meta: "4 KB", nav: "file-preview" },
      ],
      actions: [{ label: "使用此目录", icon: "check" }],
    })
  );

  addPage(
    workspace,
    generic("share-file", "分享文件", {
      kind: "share",
      icon: "file-up",
      summary: "通过链接、二维码或系统分享发送文件。",
      path: ["文件", "分享"],
      shareTitle: "分享文件",
      shareDescription: "README.md · 24 KB",
      shareKind: "file",
    })
  );

  addPage(
    ai,
    generic("providers", "模型", {
      kind: "providers",
      icon: "sparkles",
      summary: "提供方、模型、余额和默认路由。",
      path: ["设置", "AI", "模型"],
      providers: [
        {
          name: "AI 平台",
          description: "官方 API · 默认提供方",
          icon: "sparkles",
          badge: "已连接",
          active: true,
          nav: "provider-detail",
        },
        {
          name: "OpenAI Compatible",
          description: "自定义 Base URL",
          icon: "server",
          badge: "已配置",
          nav: "provider-detail",
        },
        {
          name: "Ollama (LAN)",
          description: "192.168.1.20:11434",
          icon: "house-plug",
          badge: "离线",
          nav: "provider-detail",
        },
      ],
      sections: [
        section("新对话默认", [
          row("默认模型", { icon: "brain", value: "通用模型 V4" }),
          row("备用模型", { icon: "shuffle", value: "Qwen3 Coder" }),
          row("失败时自动切换", { icon: "route", control: "switch", checked: true }),
        ]),
      ],
      actions: [{ label: "添加提供方", icon: "plus", nav: "provider-form" }],
    })
  );

  addPage(
    ai,
    generic("provider-detail", "AI 平台", {
      kind: "providers",
      icon: "sparkles",
      summary: "提供方状态、模型列表、余额和测试。",
      path: ["设置", "模型", "AI 平台"],
      providers: [
        {
          name: "通用模型 V4",
          description: "128k 上下文 · 工具调用",
          icon: "brain",
          badge: "默认",
          active: true,
        },
        {
          name: "推理模型",
          description: "深度推理 · 64k 上下文",
          icon: "lightbulb",
          badge: "可用",
        },
        {
          name: "对话模型",
          description: "快速响应 · 32k 上下文",
          icon: "zap",
          badge: "可用",
        },
      ],
      metrics: [
        { value: "¥42.80", label: "账户余额" },
        { value: "3", label: "可用模型" },
        { value: "246ms", label: "最近延迟" },
        { value: "正常", label: "连接状态" },
      ],
      sections: [
        section("提供方设置", [
          row("API Key", { icon: "key-round", value: "sk-demo-••••" }),
          row("Base URL", { icon: "link", value: "api.example.com" }),
          row("测试连接", { icon: "badge-check", value: "正常" }),
          row("编辑提供方", { icon: "pencil", nav: "provider-form" }),
        ]),
      ],
    })
  );

  addPage(
    ai,
    generic("provider-form", "编辑提供方", {
      kind: "form",
      icon: "square-pen",
      summary: "名称、Base URL、API Key 与模型发现。",
      path: ["设置", "模型", "编辑提供方"],
      form: [
        { label: "名称", value: "AI 平台" },
        { label: "Base URL", value: "https://api.example.com/v1" },
        { label: "API Key", value: "sk-demo-••••••••••••", type: "password" },
      ],
      sections: [
        section("高级", [
          row("自动获取模型", { icon: "refresh-cw", control: "switch", checked: true }),
          row("作为新对话默认", { icon: "star", control: "switch", checked: true }),
          row("请求超时", { icon: "timer", value: "60 秒" }),
        ]),
      ],
      actions: [
        { label: "测试连接", icon: "badge-check", secondary: true },
        { label: "保存", icon: "check", nav: "providers" },
      ],
    })
  );

  addPage(
    ai,
    generic("model-context", "模型上下文", {
      icon: "panel-top-open",
      summary: "上下文窗口、压缩阈值和 Token 统计。",
      path: ["设置", "模型", "上下文"],
      metrics: [
        { value: "128k", label: "模型窗口" },
        { value: "76%", label: "压缩阈值" },
        { value: "12.4k", label: "当前占用" },
        { value: "8k", label: "保留余量" },
      ],
      sections: [
        section("压缩策略", [
          row("自动压缩", { icon: "minimize-2", control: "switch", checked: true }),
          row("保留最近消息", { icon: "messages-square", value: "24 条" }),
          row("压缩时保留工具结果", { icon: "wrench", control: "switch", checked: false }),
        ]),
      ],
    })
  );

  addPage(
    ai,
    generic("subscription", "套餐与用量", {
      kind: "subscription",
      icon: "wallet-cards",
      summary: "订阅、余额、钱包和用量明细。",
      path: ["设置", "账号", "套餐"],
      metrics: [
        { value: "¥42.80", label: "API 余额" },
        { value: "¥18.20", label: "本月用量" },
        { value: "3", label: "已用提供方" },
        { value: "18.6M", label: "本月 Tokens" },
      ],
      sections: [
        section("用量明细", [
          row("通用模型 V4", { icon: "sparkles", value: "¥12.40" }),
          row("推理模型", { icon: "brain", value: "¥4.20" }),
          row("语音识别", { icon: "mic", value: "¥1.60" }),
        ]),
      ],
    })
  );

  addPage(
    ai,
    settings("permission", "权限", [
      section("对话权限", [
        row("当前对话", {
          icon: "message-circle",
          description: "只在当前对话中生效。",
          value: "工作区内修改",
        }),
        row("新对话默认", {
          icon: "shield",
          description: "完全权限会减少命令和文件改动前的确认。",
          control: "segment",
          options: ["仅查看", "工作区修改", "完全权限"],
          selected: 1,
        }),
      ]),
      section("本机能力", [
        row("访问手机文件", {
          icon: "folder-mobile",
          description: "把手机共享存储映射到运行环境。",
          control: "switch",
          checked: true,
        }),
        row("手机操控确认", {
          icon: "hand-pointer",
          description: "调整读取屏幕与点按前的确认方式。",
          nav: "phone-control",
        }),
      ]),
    ], {
      icon: "shield",
      summary: "命令、文件和手机操作在执行前的确认方式。",
      path: ["设置", "AI", "权限"],
    })
  );

  addPage(
    ai,
    settings("personalization", "个性化", [
      section("偏好", [
        row("个人偏好", {
          icon: "user-round-cog",
          description: "让新对话遵循的名字、语气和工作方式。",
          nav: "reply-prefs",
        }),
        row("可视化回复", {
          icon: "chart-no-axes-combined",
          description: "允许模型用图表、对比卡和可点选项回答。",
          control: "switch",
          checked: true,
        }),
        row("Agent 预设", {
          icon: "workflow",
          description: "决定新对话可用的工具与工作模式。",
          nav: "agent-presets",
        }),
      ]),
    ], {
      icon: "user-round-cog",
      summary: "个人偏好、可视化回复和 Agent 预设。",
      path: ["设置", "AI", "个性化"],
    })
  );

  addPage(
    ai,
    generic("reply-prefs", "个人偏好", {
      kind: "form",
      icon: "notebook-pen",
      summary: "希望 AI 在新对话中遵循的长期要求。",
      path: ["设置", "AI", "个性化", "个人偏好"],
      form: [
        {
          label: "偏好内容",
          type: "textarea",
          value:
            "回答保持简洁但给足依据。\n中文界面默认使用简体中文。\n修改代码时优先沿用现有模式，运行相关验证。",
          hint: "清空并保存即可删除",
        },
      ],
      actions: [{ label: "保存偏好", icon: "check" }],
    })
  );

  addPage(
    ai,
    generic("agent-presets", "Agent 预设", {
      kind: "presets",
      icon: "workflow",
      summary: "标准、PTC 和自定义工作方式。",
      path: ["设置", "AI", "个性化", "Agent 预设"],
      presets: [
        {
          title: "标准模式",
          description: "完整工具集，适合日常开发与自动化。",
          icon: "wrench",
          badge: "默认",
          active: true,
          nav: "preset-editor",
        },
        {
          title: "PTC 模式",
          description: "面向编程任务，强调结构化工具调用。",
          icon: "blocks",
          badge: "内置",
          nav: "preset-editor",
        },
        {
          title: "纯对话",
          description: "不启用文件与终端工具。",
          icon: "message-circle",
          badge: "自定义",
          nav: "preset-editor",
        },
      ],
      actions: [{ label: "新建预设", icon: "plus", nav: "preset-editor" }],
    })
  );

  addPage(
    ai,
    generic("preset-editor", "编辑 Agent 预设", {
      kind: "form",
      icon: "workflow",
      summary: "名称、系统提示、工具集和默认权限。",
      path: ["Agent 预设", "标准模式"],
      form: [
        { label: "预设名称", value: "标准模式" },
        {
          label: "系统提示",
          type: "textarea",
          value: "你是一名严谨的工程助手。先理解现有代码，再以最小改动完成任务，并运行必要验证。",
        },
      ],
      sections: [
        section("工具", [
          row("命令执行", { icon: "terminal", control: "switch", checked: true }),
          row("文件修改", { icon: "file-pen", control: "switch", checked: true }),
          row("浏览器", { icon: "globe", control: "switch", checked: true }),
          row("子代理", { icon: "network", control: "switch", checked: true }),
          row("手机操控", { icon: "hand-pointer", control: "switch", checked: false }),
        ]),
      ],
      actions: [{ label: "保存预设", icon: "check", nav: "agent-presets" }],
    })
  );

  addPage(
    ai,
    settings("subagent-settings", "子代理", [
      section("并行能力", [
        row("启用子代理", { icon: "network", control: "switch", checked: true }),
        row("最大深度", { icon: "git-branch", value: "3 层" }),
        row("最大并行数", { icon: "split", value: "4" }),
        row("空闲超时", { icon: "timer", value: "10 分钟" }),
      ]),
      section("默认行为", [
        row("允许写入工作区", { icon: "file-pen", control: "switch", checked: true }),
        row("完成后自动汇总", { icon: "combine", control: "switch", checked: true }),
      ]),
    ], {
      icon: "network",
      summary: "代理深度、并行数量和完成后如何汇总。",
      path: ["设置", "主机", "引擎参数", "子代理"],
    })
  );

  addPage(
    ai,
    settings("agent-loop", "Agent 循环", [
      section("执行", [
        row("最大并行工具调用", { icon: "split", value: "8" }),
        row("单轮最大步骤", { icon: "list-ordered", value: "48" }),
        row("工具失败后重试", { icon: "rotate-cw", control: "switch", checked: true }),
        row("达到上限后暂停", { icon: "pause", control: "switch", checked: true }),
      ]),
      section("模型", [
        row("自动压缩上下文", { icon: "minimize-2", control: "switch", checked: true }),
        row("推理强度", { icon: "brain", control: "segment", options: ["低", "中", "高"], selected: 1 }),
      ]),
    ], {
      icon: "iteration-ccw",
      summary: "Agent 单轮步骤、并行工具和上下文循环。",
      path: ["设置", "主机", "引擎参数", "Agent 循环"],
    })
  );

  addPage(
    ai,
    settings("web-search", "联网搜索", [
      section("搜索服务", [
        row("搜索提供方", {
          icon: "globe-2",
          control: "segment",
          options: ["内置", "模型 API"],
          selected: 1,
        }),
        row("API Key", { icon: "key-round", value: "sk-demo-••••" }),
        row("测试搜索", { icon: "badge-check", value: "可用", badge: "正常", tone: "success" }),
      ]),
      section("行为", [
        row("需要时自动搜索", { icon: "search-check", control: "switch", checked: true }),
        row("显示引用来源", { icon: "link", control: "switch", checked: true }),
        row("默认结果数量", { icon: "list-filter", value: "8 条" }),
      ]),
    ], {
      icon: "globe-2",
      summary: "当前主机的联网搜索提供方、密钥和引用行为。",
      path: ["设置", "能力", "联网搜索"],
    })
  );

  addPage(
    ai,
    generic("media-settings", "图像与视频", {
      kind: "media-settings",
      icon: "wand-sparkles",
      summary: "生成服务、API Key 和默认模型。",
      path: ["设置", "能力", "图像与视频"],
      services: [
        {
          name: "图像生成服务",
          description: "图像生成 · 默认服务",
          icon: "image",
          badge: "已保存",
          nav: "media-service",
        },
        {
          name: "Video Studio",
          description: "视频生成 · 1080p",
          icon: "film",
          badge: "可用",
          nav: "media-service",
        },
      ],
      sections: [
        section("默认参数", [
          row("默认比例", { icon: "ratio", control: "segment", options: ["1:1", "4:3", "16:9"], selected: 2 }),
          row("每次生成数量", { icon: "copy-plus", value: "2" }),
          row("自动保存到工作区", { icon: "folder-down", control: "switch", checked: true }),
        ]),
      ],
    })
  );

  addPage(
    ai,
    generic("media-service", "图像生成服务", {
      kind: "form",
      icon: "image",
      summary: "服务地址、密钥、默认模型和共享关系。",
      path: ["设置", "图像与视频", "图像生成服务"],
      form: [
        { label: "API 地址", value: "https://api.example.com/v1" },
        { label: "API Key", value: "sk-demo-••••••••", type: "password" },
        { label: "默认模型", value: "imagine-v3" },
      ],
      sections: [
        section("服务状态", [
          row("检查已保存配置", { icon: "badge-check", value: "格式正常", badge: "已保存" }),
          row("图片与视频共用 Key", { icon: "link-2", control: "switch", checked: true }),
        ]),
      ],
      actions: [{ label: "保存服务", icon: "check", nav: "media-settings" }],
    })
  );

  addPage(
    phone,
    generic("phone-control", "手机操控", {
      kind: "phone-control",
      icon: "hand-pointer",
      summary: "读取屏幕、点按、输入、确认方式和安全规则。",
      path: ["设置", "能力", "手机操控"],
      metrics: [
        { value: "正常", label: "无障碍服务" },
        { value: "按任务", label: "确认方式" },
        { value: "12", label: "已记录操作" },
        { value: "关闭", label: "解除限制" },
      ],
      sections: [
        section("核心能力", [
          row("启用手机操控", { icon: "scan-eye", control: "switch", checked: true }),
          row("确认方式", {
            icon: "shield-question",
            description: "读取屏幕和点按之前怎样确认。",
            control: "segment",
            options: ["逐次", "按任务", "不确认"],
            selected: 1,
          }),
          row("查看屏幕文字", { icon: "scan-text", nav: "action-log" }),
          row("操作日志", { icon: "history", nav: "action-log" }),
          row("自检", { icon: "badge-check", nav: "self-check" }),
        ]),
        section("保护", [
          row("应用规则", { icon: "list-checks", nav: "app-rules" }),
          row("始终允许", { icon: "check-check", nav: "always-allow" }),
          row("不打扰模式", { icon: "moon", nav: "dnd" }),
          row("解除限制", {
            icon: "lock-open",
            description: "放宽系统、密钥和应用自身页面保护。",
            tone: "danger",
            nav: "unlocks",
          }),
        ]),
      ],
    })
  );

  addPage(
    phone,
    settings("app-rules", "应用规则", [
      section("应用", [
        row("微信", { icon: "message-circle", value: "每次确认", badge: "敏感" }),
        row("浏览器", { icon: "globe", value: "自动允许", badge: "允许" }),
        row("文件管理", { icon: "folder", value: "按任务", badge: "默认" }),
        row("设置", { icon: "settings-2", value: "禁止", badge: "保护", tone: "warning" }),
      ]),
    ], {
      icon: "list-checks",
      summary: "为不同 App 设置读取与操作的确认规则。",
      path: ["手机操控", "应用规则"],
    })
  );

  addPage(
    phone,
    settings("always-allow", "始终允许", [
      section("已允许的操作", [
        row("打开浏览器", { icon: "external-link", value: "仅当前任务" }),
        row("读取当前页面文字", { icon: "scan-text", value: "浏览器" }),
        row("返回主屏幕", { icon: "house", value: "系统操作" }),
      ]),
      section("撤销", [
        row("清除所有始终允许", {
          icon: "eraser",
          description: "下次执行这些操作时会重新询问。",
          tone: "danger",
        }),
      ]),
    ], {
      icon: "check-check",
      summary: "当前会话中已经允许手机操控执行的操作。",
      path: ["手机操控", "始终允许"],
    })
  );

  addPage(
    phone,
    generic("android-shell", "Android Shell", {
      kind: "terminal",
      icon: "square-terminal",
      summary: "通过 Shizuku 或已配对 ADB 执行系统级 Shell。",
      path: ["手机操控", "Android Shell"],
      terminalPath: "adb shell",
      terminalLines: [
        { type: "prompt", text: "id" },
        { type: "out", text: "uid=2000(shell) gid=2000(shell)" },
        { type: "prompt", text: "wm size" },
        { type: "out", text: "Physical size: 1260x2800" },
        { type: "prompt", text: "dumpsys battery | head -n 4" },
        { type: "out", text: "AC powered: false" },
        { type: "out", text: "status: 2" },
        { type: "out", text: "health: 2" },
        { type: "out", text: "level: 78" },
      ],
    })
  );

  addPage(
    phone,
    settings("dnd", "不打扰模式", [
      section("运行方式", [
        row("启用不打扰", { icon: "moon", control: "switch", checked: true }),
        row("使用 Shizuku", { icon: "badge-check", value: "已授权" }),
        row("保持屏幕关闭", { icon: "monitor-off", control: "switch", checked: true }),
        row("完成后恢复状态", { icon: "rotate-ccw", control: "switch", checked: true }),
      ]),
    ], {
      icon: "moon",
      summary: "在后台读取和操作应用，减少弹窗与切前台。",
      path: ["手机操控", "不打扰模式"],
    })
  );

  addPage(
    phone,
    generic("unlocks", "解除限制", {
      kind: "danger",
      icon: "lock-open",
      summary: "放宽系统保护、支付应用和 App 自身页面限制。",
      path: ["手机操控", "解除限制"],
      status: {
        title: "当前未解除限制",
        description: "敏感页面、系统设置、密钥页面和应用自身页面仍受保护。",
        tone: "warning",
      },
      sections: [
        section("规则", [
          row("系统设置与应用管理", {
            icon: "settings-2",
            description: "允许进入系统设置、卸载或修改应用。",
            badge: "高风险",
            tone: "danger",
          }),
          row("密钥与支付页面", {
            icon: "key-round",
            description: "仍建议保持保护，避免泄露凭据和资金风险。",
            badge: "保护中",
            tone: "success",
          }),
          row("千变 自身页面", {
            icon: "app-window",
            description: "保留给自己操作的入口。",
            badge: "保护中",
            tone: "success",
          }),
        ]),
      ],
      actions: [{ label: "阅读风险并继续", icon: "shield-alert", danger: true }],
    })
  );

  addPage(
    phone,
    generic("action-log", "操作日志", {
      kind: "timeline",
      icon: "history",
      summary: "读取屏幕、点按、输入和返回操作记录。",
      path: ["手机操控", "操作日志"],
      timeline: [
        { title: "读取屏幕文字", detail: "浏览器 · 当前页面 18 个可交互节点", time: "10:42" },
        { title: "点按“搜索”", detail: "坐标 (986, 286) · 已确认", time: "10:42" },
        { title: "输入关键词", detail: "千变 UI", time: "10:43" },
        { title: "返回 千变", detail: "任务完成 · 屏幕锁定恢复", time: "10:44" },
      ],
    })
  );

  addPage(
    phone,
    generic("self-check", "手机操控自检", {
      kind: "diagnostics",
      icon: "badge-check",
      summary: "逐项检查屏幕读取、节点、点按和输入能力。",
      path: ["手机操控", "自检"],
      checks: [
        { title: "无障碍服务", description: "已连接且正在运行", status: "通过" },
        { title: "读取当前窗口", description: "识别到 24 个节点", status: "通过" },
        { title: "全局返回", description: "可执行系统返回", status: "通过" },
        { title: "文字输入", description: "输入法聚焦正常", status: "通过" },
        { title: "屏幕截图", description: "已获得预览权限", status: "通过" },
      ],
    })
  );

  addPage(
    phone,
    settings("system-actions", "系统操作", [
      section("能力", [
        row("返回主屏幕", { icon: "house", value: "允许" }),
        row("打开通知面板", { icon: "panel-top", value: "每次确认" }),
        row("调整亮度", { icon: "sun-medium", value: "按任务" }),
        row("打开系统设置", { icon: "settings-2", value: "禁止", tone: "warning" }),
      ]),
    ], {
      icon: "mouse-pointer-2",
      summary: "HarmonyOS 和不支持完整手机操控时的系统替代能力。",
      path: ["设置", "能力", "系统操作"],
    })
  );

  addPage(
    phone,
    generic("linux-env", "Linux 环境", {
      kind: "engine",
      icon: "container",
      summary: "运行环境组件、空间、启动方式和安装状态。",
      path: ["设置", "能力", "Linux 环境"],
      metrics: [
        { value: "1.8 GB", label: "已用空间" },
        { value: "Ubuntu 24", label: "系统版本" },
        { value: "Node 22", label: "Node.js" },
        { value: "运行中", label: "状态" },
      ],
      sections: [
        section("运行环境", [
          row("PRoot 兼容启动", { icon: "container", control: "switch", checked: true }),
          row("直接启动", { icon: "bolt", description: "兼容性更低但开销更小。", control: "switch", checked: false }),
          row("组件更新", { icon: "refresh-cw", value: "已是最新" }),
          row("清理缓存", { icon: "broom", value: "可释放 186 MB" }),
        ]),
      ],
    })
  );

  addPage(
    phone,
    generic("system-access", "系统权限", {
      kind: "access",
      icon: "shield-check",
      summary: "按功能查看通知、存储、无障碍、悬浮窗和后台权限。",
      path: ["设置", "通用", "系统权限"],
      accessItems: [
        { title: "通知", description: "任务完成、失败与等待确认提醒。", status: "已开启", tone: "success", icon: "bell" },
        { title: "存储", description: "访问共享文件与下载目录。", status: "已开启", tone: "success", icon: "folder" },
        { title: "无障碍", description: "读取屏幕并执行点按。", status: "已开启", tone: "success", icon: "scan-eye" },
        { title: "悬浮窗", description: "宠物和手机操控浮层。", status: "需设置", tone: "warning", icon: "app-window" },
        { title: "后台运行", description: "保持引擎和远程连接。", status: "需设置", tone: "warning", icon: "battery-plus" },
      ],
    })
  );

  addPage(
    phone,
    generic("access-pick", "按功能开启", {
      kind: "access",
      icon: "list-checks",
      summary: "从功能出发选择性开启系统权限。",
      path: ["系统权限", "按功能开启"],
      accessItems: [
        { title: "后台完成任务", description: "通知与电池优化放行。", status: "推荐", tone: "warning", icon: "battery-charging" },
        { title: "操作手机", description: "无障碍、截图与悬浮窗。", status: "可选", tone: "", icon: "hand-pointer" },
        { title: "处理文件", description: "共享存储和所有文件访问。", status: "可选", tone: "", icon: "folder-open" },
      ],
    })
  );

  addPage(
    phone,
    settings("access-summary", "权限总览", [
      section("已开启", [
        row("通知", { icon: "bell", value: "已开启", badge: "正常", tone: "success" }),
        row("存储", { icon: "folder", value: "已开启", badge: "正常", tone: "success" }),
        row("无障碍", { icon: "scan-eye", value: "已开启", badge: "正常", tone: "success" }),
      ]),
      section("待设置", [
        row("悬浮窗", { icon: "app-window", value: "需设置", tone: "warning" }),
        row("后台运行", { icon: "battery-plus", value: "需设置", tone: "warning" }),
      ]),
    ], {
      icon: "clipboard-check",
      summary: "所有与 千变 功能相关的系统权限。",
      path: ["系统权限", "总览"],
    })
  );

  addPage(
    phone,
    settings("background", "后台运行", [
      section("厂商设置", [
        row("电池优化", { icon: "battery-charging", value: "需放行", tone: "warning" }),
        row("自启动", { icon: "power", value: "已允许", badge: "正常", tone: "success" }),
        row("后台弹窗", { icon: "app-window", value: "已允许" }),
        row("最近任务锁定", { icon: "lock-keyhole", value: "建议开启" }),
      ]),
      section("检查", [
        row("后台连接自检", { icon: "activity", nav: "diagnostics" }),
      ]),
    ], {
      icon: "battery-plus",
      summary: "减少系统在任务运行中途结束 App。",
      path: ["设置", "通用", "后台运行"],
    })
  );

  addPage(
    hosts,
    settings("notifications", "通知", [
      section("手机提醒", [
        row("允许通知", { icon: "bell", control: "switch", checked: true }),
        row("一轮完成", { icon: "circle-check", control: "switch", checked: true }),
        row("出错或被停下", { icon: "triangle-alert", control: "switch", checked: true }),
        row("等你确认", { icon: "shield-alert", control: "switch", checked: true }),
        row("向你提问", { icon: "circle-help", control: "switch", checked: true }),
        row("实时活动", { icon: "radio", control: "switch", checked: true }),
      ]),
      section("系统", [
        row("声音", { icon: "volume-2", value: "跟随系统" }),
        row("横幅与锁屏", { icon: "panel-top", value: "系统设置" }),
      ]),
    ], {
      icon: "bell",
      summary: "任务完成、失败、审批和提问时的提醒方式。",
      path: ["设置", "通用", "通知"],
    })
  );

  addPage(
    phone,
    settings("privacy", "隐私与分享", [
      section("数据", [
        row("我的分享链接", { icon: "link", value: "3 个", nav: "hosted-links" }),
        row("发送匿名使用统计", { icon: "chart-spline", control: "switch", checked: true }),
        row("向 AI 平台 上传对话日志", { icon: "cloud-upload", control: "switch", checked: false }),
      ]),
      section("分享", [
        row("分享配置", {
          icon: "share-2",
          description: "选择设置、技能、技能和偏好生成分享包。",
          nav: "share-config",
        }),
      ]),
    ], {
      icon: "lock-keyhole",
      summary: "匿名统计、日志上传与分享链接。",
      path: ["设置", "通用", "隐私与分享"],
    })
  );

  addPage(
    phone,
    generic("diagnostics", "诊断", {
      kind: "diagnostics",
      icon: "stethoscope",
      summary: "环境状态、自动故障分析与诊断包。",
      path: ["设置", "帮助与关于", "诊断"],
      checks: [
        { title: "应用版本", description: "0.9.2 · build 10251234", status: "正常" },
        { title: "本机运行环境", description: "Ubuntu 24 · arm64 · PRoot", status: "正常" },
        { title: "千变 引擎", description: "0.1.1-rc.2 · 运行中", status: "正常" },
        { title: "网络", description: "Wi-Fi 5 GHz · 延迟 28ms", status: "正常" },
        { title: "安全模式", description: "未启用", status: "正常" },
        { title: "自动故障分析", description: "默认关闭", status: "关闭" },
      ],
      actions: [
        { label: "导出诊断包", icon: "file-archive", nav: "share-file" },
        { label: "刷新状态", icon: "refresh-cw", secondary: true },
      ],
    })
  );

  addPage(
    phone,
    settings("performance", "性能", [
      section("模式", [
        row("性能配置", {
          icon: "gauge",
          control: "segment",
          options: ["自动", "完整", "轻量"],
          selected: 0,
        }),
        row("刷新率", { icon: "monitor-up", control: "segment", options: ["自动", "最高", "系统"], selected: 0 }),
      ]),
      section("效果", [
        row("玻璃模糊", { icon: "sparkles", control: "switch", checked: true }),
        row("界面动效", { icon: "play", control: "switch", checked: true }),
        row("灵动动效", { icon: "waves", control: "switch", checked: true }),
      ]),
    ], {
      icon: "gauge",
      summary: "完整、轻量与自动模式，以及模糊和动效。",
      path: ["设置", "通用", "性能"],
    })
  );

  addPage(
    plugins,
    generic("skill-repository", "技能空间", {
      kind: "skill-repository-link",
      icon: "puzzle",
      summary: "热门、我的与已安装生活技能。",
      path: ["技能板块", "技能空间"],
      actions: [{ label: "打开技能空间", icon: "puzzle", action: "open-main-nav" }],
    })
  );

  addPage(
    plugins,
    generic("plugins", "技能", {
      kind: "plugins",
      icon: "puzzle",
      summary: "已安装技能、技能市场、运行状态和配置。",
      path: ["全部功能", "技能"],
      pluginTabs: ["已安装", "技能市场"],
      pluginList: [
        {
          name: "每日餐单",
          description: "按冰箱食材生成一周食谱",
          icon: "utensils",
          group: "life-scenes",
          subcategory: "cooking",
          value: "启用",
          nav: "plugin-detail",
        },
        {
          name: "睡眠节律",
          description: "记录作息并给出睡前建议",
          icon: "moon-star",
          group: "wellness",
          subcategory: "sleep",
          value: "启用",
          nav: "plugin-detail",
        },
        {
          name: "家庭清单",
          description: "管理采购、清洁和家庭待办",
          icon: "list-checks",
          group: "life-scenes",
          subcategory: "home",
          value: "启用",
          nav: "plugin-detail",
        },
        {
          name: "心情手账",
          description: "用简短记录整理情绪与触发因素",
          icon: "notebook-pen",
          group: "wellness",
          subcategory: "mood",
          value: "停用",
          nav: "plugin-detail",
        },
      ],
      mySkills: [
        {
          name: "一周买菜计划",
          description: "按人数与预算生成采购清单",
          icon: "shopping-basket",
          group: "life-scenes",
          subcategory: "cooking",
          badge: "草稿",
        },
        {
          name: "家庭整理清单",
          description: "按房间拆分清洁与收纳任务",
          icon: "sparkles",
          group: "life-scenes",
          subcategory: "home",
          badge: "已发布",
        },
      ],
      skillConflicts: [
        {
          id: "meal-planning",
          title: "餐单规划职责重叠",
          severity: "warning",
          skills: [
            {
              name: "每日餐单",
              source: "已安装技能",
              recommended: true,
            },
            {
              name: "一周买菜计划",
              source: "我发布的技能",
            },
          ],
          suggestion:
            "两个技能都会生成采购清单，建议保留“每日餐单”，删除重复的买菜计划。",
        },
        {
          id: "home-lists",
          title: "家庭清单职责重叠",
          severity: "notice",
          skills: [
            {
              name: "家庭清单",
              source: "已安装技能",
              recommended: true,
            },
            {
              name: "家庭整理清单",
              source: "我发布的技能",
            },
          ],
          suggestion:
            "如果采购与清洁都从主清单管理，可以删除“家庭整理清单”避免重复提醒。",
        },
      ],
      actions: [{ label: "打开技能市场", icon: "store", nav: "plugin-market" }],
    })
  );

  addPage(
    plugins,
    generic("plugin-market", "技能市场", {
      kind: "market",
      icon: "store",
      summary: "搜索、查看风险和安装社区技能。",
      path: ["技能", "技能市场"],
      marketItems: [
        {
          name: "每日餐单",
          description: "按冰箱食材生成一周食谱",
          icon: "utensils",
          badge: "官方",
          group: "life-scenes",
          subcategory: "cooking",
          nav: "plugin-detail",
        },
        {
          name: "冰箱管家",
          description: "记录食材保质期并提醒消耗",
          icon: "refrigerator",
          badge: "已审查",
          group: "life-scenes",
          subcategory: "home",
          nav: "plugin-detail",
        },
        {
          name: "旅行打包",
          description: "按天气与行程生成行李清单",
          icon: "luggage",
          badge: "社区",
          group: "life-scenes",
          subcategory: "travel",
          nav: "plugin-detail",
        },
        {
          name: "睡眠节律",
          description: "记录作息并给出睡前建议",
          icon: "moon-star",
          badge: "社区",
          group: "wellness",
          subcategory: "sleep",
          nav: "plugin-detail",
        },
        {
          name: "居家拉伸",
          description: "生成适合房间空间的运动计划",
          icon: "stretch-horizontal",
          badge: "已审查",
          group: "wellness",
          subcategory: "fitness",
          nav: "plugin-detail",
        },
        {
          name: "心情手账",
          description: "用简短记录整理情绪与触发因素",
          icon: "notebook-pen",
          badge: "社区",
          group: "wellness",
          subcategory: "mood",
          nav: "plugin-detail",
        },
        {
          name: "阅读清单",
          description: "整理想读、在读和读书笔记",
          icon: "book-open",
          badge: "官方",
          group: "growth",
          subcategory: "reading",
          nav: "plugin-detail",
        },
        {
          name: "专注番茄",
          description: "按任务拆解专注时段并记录干扰",
          icon: "timer",
          badge: "社区",
          group: "growth",
          subcategory: "focus",
          nav: "plugin-detail",
        },
      ],
    })
  );

  addPage(
    plugins,
    generic("plugin-detail", "UI 组件", {
      kind: "plugin-detail",
      icon: "panels-top-left",
      summary: "技能权限、版本、配置和卸载入口。",
      path: ["技能", "UI 组件"],
      plugin: {
        name: "UI 组件",
        version: "1.4.0",
        description: "为 千变 提供原生工具卡、交互表单、面板和图表。",
        author: "CikeSeven",
        badge: "已安装",
      },
      sections: [
        section("能力", [
          row("原生工具卡", { icon: "panel-top", value: "已启用" }),
          row("聊天表单", { icon: "list-todo", value: "已启用" }),
          row("技能面板", { icon: "layout-panel-left", value: "已启用" }),
          row("图表", { icon: "chart-column", value: "已启用" }),
        ]),
        section("权限与风险", [
          row("提供 UI 视图", { icon: "eye", value: "是" }),
          row("保存临时状态", { icon: "database", value: "是" }),
          row("访问文件系统", { icon: "folder", value: "否", tone: "success" }),
          row("网络访问", { icon: "globe", value: "否", tone: "success" }),
        ]),
      ],
      actions: [
        { label: "打开设置", icon: "sliders-horizontal", nav: "plugin-settings" },
        { label: "停用技能", icon: "pause", secondary: true },
      ],
    })
  );

  addPage(
    plugins,
    settings("plugin-settings", "技能设置", [
      section("界面", [
        row("启用原生卡片", { icon: "panels-top-left", control: "switch", checked: true }),
        row("允许交互表单", { icon: "list-todo", control: "switch", checked: true }),
        row("图表动画", { icon: "chart-spline", control: "switch", checked: true }),
      ]),
      section("安全", [
        row("最大面板高度", { icon: "panel-top", value: "640 dp" }),
        row("允许外部链接", { icon: "external-link", control: "switch", checked: false }),
      ]),
    ], {
      icon: "sliders-horizontal",
      summary: "原生技能面板的行为、尺寸与安全边界。",
      path: ["技能", "UI 组件", "设置"],
    })
  );

  addPage(
    plugins,
    generic("plugin-inventory", "技能清单", {
      kind: "plugins",
      icon: "list-tree",
      summary: "当前主机加载的技能、槽位和冲突。",
      path: ["设置", "主机", "引擎参数", "技能清单"],
      pluginList: [
        { name: "ui-settings", description: "界面设置贡献", icon: "panel-top", value: "已加载" },
        { name: "ui-chat", description: "聊天交互贡献", icon: "message-circle", value: "已加载" },
        { name: "web-search", description: "联网搜索贡献", icon: "globe-2", value: "已加载" },
        { name: "media-render", description: "媒体渲染贡献", icon: "image-play", value: "已加载" },
        { name: "unknown-skill", description: "版本不兼容，已隔离", icon: "triangle-alert", value: "冲突" },
      ],
    })
  );

  addPage(
    plugins,
    generic("agent-team", "Agent 团队", {
      kind: "team",
      icon: "users-round",
      summary: "主代理、探索者、实现者和审查者的协作状态。",
      path: ["全部功能", "技能", "Agent 团队"],
      team: [
        { title: "主代理", role: "规划与汇总", status: "工作中", icon: "brain", tone: "running" },
        { title: "探索者", role: "读取代码与证据", status: "完成", icon: "search", tone: "success" },
        { title: "实现者", role: "生成 HTML 与样式", status: "工作中", icon: "code-xml", tone: "running" },
        { title: "审查者", role: "页面与交互检查", status: "等待", icon: "scan-search", tone: "idle" },
      ],
      sections: [
        section("协作", [
          row("最大并行子代理", { icon: "split", value: "4" }),
          row("完成后自动汇总", { icon: "combine", control: "switch", checked: true }),
          row("允许修改工作区", { icon: "file-pen", control: "switch", checked: true }),
        ]),
      ],
    })
  );

  addPage(
    plugins,
    generic("publish-skill", "发布技能", {
      kind: "publish-skill",
      icon: "upload-cloud",
      summary: "用一个想法创建 Skill，自动生成可编辑脚本。",
      path: ["技能板块", "发布技能"],
    })
  );

  addPage(
    plugins,
    generic("skills", "技能", {
      kind: "skills",
      icon: "book-open",
      summary: "已安装技能、使用方式与调用入口。",
      path: ["全部功能", "技能"],
      skills: [
        { title: "使用指南", description: "按 App 使用指南回答功能问题", icon: "book-open-check", badge: "内置" },
        { title: "技能开发", description: "创建、检查和调试原生技能", icon: "puzzle", badge: "内置" },
        { title: "pet-theme", description: "生成与验证宠物包素材", icon: "paw-print", badge: "已安装" },
        { title: "security-review", description: "检查输入边界、密钥与权限风险", icon: "shield-check", badge: "可调用" },
      ],
      sections: [
        section("使用", [
          row("在对话里用", { icon: "message-circle", value: "/skill" }),
          row("新对话里用", { icon: "message-square-plus", value: "插入输入框" }),
        ]),
      ],
    })
  );

  addPage(
    community,
    generic("community", "社区", {
      kind: "community",
      icon: "users",
      summary: "论坛、QQ 群、微信群和项目主页。",
      path: ["全部功能", "社区与分享", "社区"],
      communityItems: [
        { title: "论坛", description: "教程、技能、经验与问答", icon: "messages-square", nav: "forum" },
        { title: "QQ 群", description: "1132118290", icon: "users-round" },
        { title: "微信群", description: "扫二维码加入", icon: "qr-code" },
      ],
    })
  );

  addPage(
    community,
    generic("forum", "论坛", {
      kind: "forum",
      icon: "messages-square",
      summary: "论坛首页、分类、热门主题和发帖入口。",
      path: ["社区", "论坛"],
      topics: [
        {
          title: "千变 0.9.2 使用反馈集中帖",
          excerpt: "新版本手机操控、分享卡与平板布局集中反馈。",
          avatar: "DS",
          replies: 42,
          time: "12 分钟前",
          nav: "forum-topic",
        },
        {
          title: "原生技能 UI 的最佳实践",
          excerpt: "如何让 UI 组件 的卡片、表格和表单在窄屏也清楚。",
          avatar: "UI",
          replies: 18,
          time: "1 小时前",
          nav: "forum-topic",
        },
        {
          title: "Android 后台保活各厂商实测",
          excerpt: "小米、vivo、华为、荣耀和 OPPO 的设置路径汇总。",
          avatar: "BG",
          replies: 67,
          time: "昨天",
          nav: "forum-topic",
        },
      ],
    })
  );

  addPage(
    community,
    generic("forum-topic", "千变 0.9.2 使用反馈集中帖", {
      kind: "forum-topic",
      icon: "message-square-text",
      summary: "主题正文、回复、点赞、收藏和举报。",
      path: ["论坛", "使用反馈"],
      topic: {
        author: "CikeSeven",
        avatar: "CS",
        time: "今天 09:24",
        title: "千变 0.9.2 使用反馈集中帖",
        body:
          "这一版重点调整了手机操控、分享卡和横屏布局。遇到页面溢出、权限回退或远程主机断连时，请附上设备型号与复现步骤。",
        replies: 42,
      },
      posts: [
        {
          author: "鲸鱼用户",
          avatar: "W",
          time: "09:41",
          body: "平板横屏下侧栏常驻很好用，弹出键盘后对话区也没有被挤压。",
        },
        {
          author: "Mira",
          avatar: "M",
          time: "09:56",
          body: "希望能把分享卡里的模型名称隐藏掉，给外部看的时候更干净。",
        },
      ],
    })
  );

  addPage(
    community,
    generic("forum-compose", "发布主题", {
      kind: "form",
      icon: "square-pen",
      summary: "选择分类、填写标题与正文并发布。",
      path: ["论坛", "发布主题"],
      form: [
        { label: "标题", value: "" , placeholder: "写一个清楚的标题" },
        { label: "正文", type: "textarea", value: "", placeholder: "描述问题、经验或建议" },
      ],
      sections: [
        section("发布设置", [
          row("分类", { icon: "tags", value: "使用反馈" }),
          row("通知回复", { icon: "bell", control: "switch", checked: true }),
        ]),
      ],
      actions: [{ label: "发布", icon: "send", nav: "forum" }],
    })
  );

  addPage(
    community,
    generic("forum-search", "搜索论坛", {
      kind: "search",
      icon: "search",
      summary: "搜索主题、作者、标签与正文。",
      path: ["论坛", "搜索"],
      searchTitle: "搜索论坛",
      searchHint: "搜索技能、手机操控或更新",
      searchResults: [
        { title: "技能 UI 指南", subtitle: "标签：技能 · UI · 教程", icon: "puzzle", nav: "forum-topic" },
        { title: "手机操控无法点按", subtitle: "标签：Android · 无障碍", icon: "hand-pointer", nav: "forum-topic" },
        { title: "远程主机重连策略", subtitle: "标签：SSH · Remote", icon: "server", nav: "forum-topic" },
      ],
    })
  );

  addPage(
    community,
    generic("forum-notifications", "论坛通知", {
      kind: "notifications",
      icon: "bell-ring",
      summary: "回复、点赞、提及和系统通知。",
      path: ["论坛", "通知"],
      notifications: [
        { title: "CikeSeven 回复了你的主题", description: "“分享卡的红action可以单独设置。”", time: "10 分钟前", icon: "message-circle" },
        { title: "你的回复收到了 5 个赞", description: "手机操控使用反馈", time: "1 小时前", icon: "heart" },
        { title: "系统通知", description: "论坛将于今晚 02:00 进行短时维护。", time: "昨天", icon: "megaphone" },
      ],
    })
  );

  addPage(
    community,
    generic("bots", "DS Bot", {
      kind: "bots",
      icon: "bot",
      summary: "机器人、群聊、频道和未读消息。",
      path: ["全部功能", "社区与分享", "DS Bot"],
      bots: [
        {
          name: "Deepy",
          description: "默认助手 · 在线",
          icon: "sparkles",
          badge: "2",
          tone: "success",
          nav: "bot-chat",
        },
        {
          name: "代码审查员",
          description: "审查改动、风险和测试",
          icon: "scan-search",
          badge: "在线",
          tone: "success",
          nav: "bot-chat",
        },
        {
          name: "设计搭档",
          description: "界面、文案与交互建议",
          icon: "palette",
          badge: "工作中",
          tone: "warning",
          nav: "bot-chat",
        },
        {
          name: "开发组",
          description: "群聊 · 4 位成员",
          icon: "users-round",
          badge: "1",
          tone: "success",
          nav: "room-chat",
        },
      ],
      actions: [
        { label: "新建 Bot", icon: "plus", nav: "new-bot" },
        { label: "新建群聊", icon: "users-round", secondary: true, nav: "new-room" },
      ],
    })
  );

  addPage(
    community,
    generic("bot-chat", "Deepy", {
      kind: "chat",
      icon: "bot",
      summary: "与 Bot 对话、查看状态和打开详情。",
      path: ["DS Bot", "Deepy"],
      mode: "bot",
      botName: "Deepy",
    })
  );

  addPage(
    community,
    generic("bot-detail", "Bot 详情", {
      kind: "bot-detail",
      icon: "bot",
      summary: "角色、模型、工具、记忆和房间设置。",
      path: ["DS Bot", "Deepy", "详情"],
      metrics: [
        { value: "通用模型 V4", label: "模型" },
        { value: "12", label: "记忆条目" },
        { value: "4", label: "可用工具" },
        { value: "在线", label: "状态" },
      ],
      sections: [
        section("角色", [
          row("名称", { icon: "badge", value: "Deepy" }),
          row("角色提示", { icon: "notebook-pen", value: "热心的工程搭档" }),
          row("头像颜色", { icon: "palette", value: "海蓝" }),
        ]),
        section("能力", [
          row("文件", { icon: "folder", control: "switch", checked: true }),
          row("终端", { icon: "terminal", control: "switch", checked: true }),
          row("网页搜索", { icon: "globe-2", control: "switch", checked: true }),
          row("长期记忆", { icon: "brain", control: "switch", checked: true }),
        ]),
      ],
    })
  );

  addPage(
    community,
    generic("new-bot", "新建 Bot", {
      kind: "form",
      icon: "bot-message-square",
      summary: "名称、角色、模型、工具与记忆。",
      path: ["DS Bot", "新建 Bot"],
      form: [
        { label: "名称", value: "", placeholder: "给 Bot 起个名字" },
        { label: "角色提示", type: "textarea", value: "", placeholder: "它负责什么？应该怎样回答？" },
      ],
      sections: [
        section("默认配置", [
          row("模型", { icon: "sparkles", value: "通用模型 V4" }),
          row("工作区", { icon: "folder", value: "千变" }),
          row("允许工具", { icon: "wrench", control: "switch", checked: true }),
          row("启用记忆", { icon: "brain", control: "switch", checked: true }),
        ]),
      ],
      actions: [{ label: "创建 Bot", icon: "check", nav: "bots" }],
    })
  );

  addPage(
    community,
    generic("rooms", "群聊", {
      kind: "rooms",
      icon: "users-round",
      summary: "群组成员、角色、公告和共享会话。",
      path: ["DS Bot", "群聊"],
      rooms: [
        { title: "开发组", description: "4 位成员 · 正在工作", icon: "users-round", badge: "1", nav: "room-chat" },
        { title: "设计评审", description: "3 位成员 · 空闲", icon: "palette", badge: "0", nav: "room-chat" },
      ],
    })
  );

  addPage(
    community,
    generic("room-chat", "开发组", {
      kind: "chat",
      icon: "users-round",
      summary: "多 Bot 群聊，显示成员发言与协作状态。",
      path: ["DS Bot", "开发组"],
      mode: "room",
      botName: "开发组",
    })
  );

  addPage(
    community,
    generic("room-detail", "群聊详情", {
      kind: "team",
      icon: "users-round",
      summary: "成员、角色、公告和群聊规则。",
      path: ["DS Bot", "开发组", "详情"],
      team: [
        { title: "Deepy", role: "规划与总结", status: "在线", icon: "sparkles", tone: "success" },
        { title: "代码审查员", role: "审查与测试", status: "在线", icon: "scan-search", tone: "success" },
        { title: "设计搭档", role: "界面与文案", status: "工作中", icon: "palette", tone: "running" },
        { title: "你", role: "管理员", status: "在线", icon: "user-round", tone: "success" },
      ],
      sections: [
        section("群聊", [
          row("群公告", { icon: "megaphone", value: "已完成 UI 复刻前先跑检查。" }),
          row("允许成员互相对话", { icon: "messages-square", control: "switch", checked: true }),
          row("最大轮次", { icon: "repeat-2", value: "8" }),
        ]),
      ],
    })
  );

  addPage(
    community,
    generic("new-room", "新建群聊", {
      kind: "form",
      icon: "message-square-plus",
      summary: "选择 Bot 成员、名称和协作规则。",
      path: ["DS Bot", "新建群聊"],
      form: [{ label: "群聊名称", value: "", placeholder: "例如：界面评审组" }],
      sections: [
        section("成员", [
          row("Deepy", { icon: "sparkles", control: "switch", checked: true }),
          row("代码审查员", { icon: "scan-search", control: "switch", checked: true }),
          row("设计搭档", { icon: "palette", control: "switch", checked: true }),
        ]),
        section("规则", [
          row("管理员", { icon: "crown", value: "你" }),
          row("成员可以互相回复", { icon: "messages-square", control: "switch", checked: true }),
        ]),
      ],
      actions: [{ label: "创建群聊", icon: "check", nav: "rooms" }],
    })
  );

  addPage(
    community,
    generic("share-config", "分享配置", {
      kind: "share",
      icon: "share-2",
      summary: "选择设置、技能、技能和偏好并生成分享包。",
      path: ["设置", "隐私与分享", "分享配置"],
      shareTitle: "分享配置",
      shareDescription: "只选择需要分享的项目，生成链接、二维码或文件。",
      shareItems: [
        { title: "界面与主题", description: "主题色、壁纸、图标与动效", icon: "palette", checked: true },
        { title: "模型设置", description: "提供方名称与模型路由，不含密钥", icon: "sparkles", checked: true },
        { title: "Agent 预设", description: "工作模式、工具和系统提示", icon: "workflow", checked: true },
        { title: "技能列表", description: "技能名称与版本，不包含技能数据", icon: "puzzle", checked: false },
        { title: "个人偏好", description: "长期偏好与默认语言", icon: "user-round-cog", checked: true },
      ],
      actions: [{ label: "下一步", icon: "arrow-right", nav: "share-preview" }],
    })
  );

  addPage(
    community,
    generic("share-preview", "分享预览", {
      kind: "share",
      icon: "qr-code",
      summary: "检查分享内容，然后生成链接、二维码或文件。",
      path: ["分享配置", "预览"],
      shareTitle: "千变 配置",
      shareDescription: "4 项配置 · 已隐藏密钥与私人路径",
      shareKind: "config",
      actions: [
        { label: "复制链接", icon: "link" },
        { label: "显示二维码", icon: "qr-code", secondary: true, nav: "share-qr" },
        { label: "导出文件", icon: "download", secondary: true, nav: "share-file" },
      ],
    })
  );

  addPage(
    community,
    generic("share-link", "分享链接", {
      kind: "share",
      icon: "link-2",
      summary: "生成可回放的加密对话链接。",
      path: ["分享预览", "分享链接"],
      shareTitle: "千变 界面复刻",
      shareDescription: "端到端加密 · 密钥只包含在链接中",
      shareKind: "link",
      actions: [
        { label: "复制链接", icon: "copy" },
        { label: "显示二维码", icon: "qr-code", secondary: true, nav: "share-qr" },
      ],
    })
  );

  addPage(
    community,
    generic("share-qr", "二维码", {
      kind: "share",
      icon: "qr-code",
      summary: "用另一台设备扫码打开分享内容。",
      path: ["分享预览", "二维码"],
      shareTitle: "扫码打开",
      shareDescription: "千变 配置 · 已隐藏密钥与私人路径",
      shareKind: "qr",
      actions: [
        { label: "复制链接", icon: "link" },
        { label: "保存二维码", icon: "download", secondary: true },
      ],
    })
  );

  addPage(
    community,
    generic("share-image", "分享卡", {
      kind: "share",
      icon: "image",
      summary: "把回复或配置生成适合直接发送的图片。",
      path: ["分享预览", "分享卡"],
      shareTitle: "千变 全量界面",
      shareDescription: "144 个主流程页面 · 13 个可触达状态",
      shareKind: "image",
      actions: [
        { label: "保存图片", icon: "download" },
        { label: "系统分享", icon: "share-2", secondary: true },
      ],
    })
  );

  addPage(
    community,
    generic("hosted-links", "我的分享链接", {
      kind: "files",
      icon: "link-2",
      summary: "管理已创建的对话回放与配置分享链接。",
      path: ["设置", "隐私与分享", "我的分享链接"],
      filesPath: "分享链接",
      files: [
        { name: "千变 界面复刻", type: "link", meta: "2 天前 · 已加密", nav: "share-preview" },
        { name: "主题配置：深海蓝", type: "link", meta: "5 天前 · 12 次访问", nav: "share-preview" },
        { name: "Agent 预设：标准模式", type: "link", meta: "上周 · 4 次访问", nav: "share-preview" },
      ],
    })
  );

  addPage(
    companion,
    generic("companion", "伙伴小屋", {
      kind: "companion",
      icon: "heart-handshake",
      summary: "Deepy 和鲸娘的陪伴、语音、记忆与动作。",
      path: ["伙伴小屋"],
      pet: "whale-girl",
    })
  );

  addPage(
    companion,
    generic("companion-persona", "伙伴性格", {
      kind: "form",
      icon: "user-round-cog",
      summary: "名字、称呼、性格、说话方式和主动程度。",
      path: ["伙伴小屋", "性格"],
      form: [
        { label: "伙伴名字", value: "鲸娘" },
        { label: "怎么称呼你", value: "船长" },
        {
          label: "性格与说话方式",
          type: "textarea",
          value: "安静、敏锐、有一点俏皮。回答简短，偶尔用海洋意象，但不影响信息清晰度。",
        },
      ],
      sections: [
        section("主动行为", [
          row("完成时庆祝", { icon: "party-popper", control: "switch", checked: true }),
          row("长时间工作后提醒休息", { icon: "coffee", control: "switch", checked: true }),
          row("主动程度", { icon: "activity", control: "segment", options: ["安静", "适中", "活跃"], selected: 1 }),
        ]),
      ],
      actions: [{ label: "保存", icon: "check", nav: "companion" }],
    })
  );

  addPage(
    companion,
    generic("companion-memory", "伙伴记忆", {
      kind: "memory",
      icon: "brain",
      summary: "伙伴记住的偏好、约定和重要上下文。",
      path: ["伙伴小屋", "记忆"],
      memories: [
        { title: "工作偏好", detail: "喜欢先看现有代码，再做最小范围修改。", time: "今天", icon: "wrench" },
        { title: "界面审美", detail: "偏好克制、清晰、有层次的中文界面。", time: "昨天", icon: "palette" },
        { title: "休息提醒", detail: "长时间专注后接受轻量提醒。", time: "上周", icon: "coffee" },
        { title: "宠物", detail: "喜欢 Deepy 小鲸鱼和鲸娘。", time: "上周", icon: "heart" },
      ],
      actions: [{ label: "添加记忆", icon: "plus" }],
    })
  );

  addPage(
    companion,
    generic("companion-voice", "伙伴声音", {
      kind: "voice-settings",
      icon: "audio-lines",
      summary: "声音、语速、音调、音量与朗读范围。",
      path: ["伙伴小屋", "声音"],
      metrics: [
        { value: "云海", label: "声音" },
        { value: "1.0×", label: "语速" },
        { value: "自然", label: "音调" },
        { value: "自动", label: "朗读" },
      ],
      sections: [
        section("声音", [
          row("声音角色", { icon: "mic-vocal", value: "云海" }),
          row("语速", { icon: "gauge", value: "1.0×" }),
          row("音调", { icon: "audio-waveform", value: "自然" }),
          row("试听", { icon: "play", value: "播放示例" }),
        ]),
        section("朗读", [
          row("回复朗读", { icon: "volume-2", control: "switch", checked: false }),
          row("伙伴语音", { icon: "heart", control: "switch", checked: true }),
        ]),
      ],
    })
  );

  addPage(
    companion,
    generic("pets", "宠物", {
      kind: "pets",
      icon: "paw-print",
      summary: "管理宠物显示行为。",
      path: ["设置", "外观", "宠物"],
      sections: [
        section("显示", [
          row("安静模式", { icon: "moon", control: "switch", checked: false }),
        ]),
      ],
    })
  );

  addPage(
    companion,
    generic("pet-picker", "选择宠物", {
      kind: "pets",
      icon: "paw-print",
      summary: "预览动作、切换宠物和检查资源。",
      path: ["设置", "宠物", "选择宠物"],
      pets: [
        { title: "Deepy", description: "打字、完成、等待确认与睡觉动作", icon: "sparkles", active: true },
        { title: "鲸娘", description: "Live2D 互动与伙伴语音", icon: "heart" },
        { title: "深海信使", description: "社区宠物包 · 22 个动作", icon: "waves" },
      ],
      actions: [{ label: "导入宠物包", icon: "package-plus" }],
    })
  );

  addPage(
    companion,
    generic("pet-custom", "制作宠物", {
      kind: "form",
      icon: "package-plus",
      summary: "从图片、角色图或 Codex 宠物包生成可用素材。",
      path: ["设置", "宠物", "制作宠物"],
      form: [
        { label: "宠物名称", value: "", placeholder: "例如：深海信使" },
        { label: "角色描述", type: "textarea", value: "", placeholder: "外形、颜色、性格和动作风格" },
      ],
      sections: [
        section("生成方式", [
          row("上传角色图", { icon: "image-up", nav: "file-preview" }),
          row("导入宠物包", { icon: "package-open" }),
          row("动作数量", { icon: "list-video", value: "22" }),
        ]),
      ],
      actions: [{ label: "开始生成", icon: "wand-sparkles" }],
    })
  );

  addPage(
    companion,
    generic("workshop", "创意工坊", {
      kind: "workshop",
      icon: "blocks",
      summary: "浏览、安装、发布宠物包、主题和技能。",
      path: ["设置", "宠物", "创意工坊"],
      workshopItems: [
        { title: "深海终端主题", description: "低对比深色 · 1.2k 下载", icon: "terminal", badge: "主题" },
        { title: "鲸娘冬季服装", description: "伙伴外观 · 846 下载", icon: "heart", badge: "宠物" },
        { title: "项目看板技能", description: "原生面板 · 632 下载", icon: "layout-dashboard", badge: "技能" },
        { title: "纸张启动画面", description: "启动视觉 · 311 下载", icon: "image", badge: "外观" },
      ],
      actions: [{ label: "发布作品", icon: "upload", nav: "workshop-publish" }],
    })
  );

  addPage(
    companion,
    generic("workshop-publish", "发布到创意工坊", {
      kind: "form",
      icon: "upload",
      summary: "填写作品信息、选择资源、风险检查并提交。",
      path: ["创意工坊", "发布"],
      form: [
        { label: "作品名称", value: "", placeholder: "例如：深海终端主题" },
        { label: "简介", type: "textarea", value: "", placeholder: "说明内容、适用版本和使用方法" },
      ],
      sections: [
        section("资源", [
          row("作品类型", { icon: "tags", value: "主题" }),
          row("上传文件", { icon: "upload-cloud", nav: "file-preview" }),
          row("封面图片", { icon: "image-plus", nav: "image-viewer" }),
        ]),
        section("发布", [
          row("公开可见", { icon: "globe", control: "switch", checked: true }),
          row("允许安装", { icon: "download", control: "switch", checked: true }),
          row("风险说明", { icon: "shield-check", value: "已检查" }),
        ]),
      ],
      actions: [{ label: "提交审核", icon: "send", nav: "workshop" }],
    })
  );

  addPage(
    tavern,
    generic("tavern-home", "酒馆", {
      kind: "tavern",
      icon: "book-open",
      summary: "角色、故事、世界书和互动叙事入口。",
      path: ["酒馆"],
      tavernTitle: "雾港来信",
      tavernSubtitle: "一段发生在潮汐与灯塔之间的故事",
    })
  );

  addPage(
    tavern,
    generic("tavern-chat", "雾港来信", {
      kind: "tavern-chat",
      icon: "message-square-text",
      summary: "角色对话、旁白、选项和故事状态。",
      path: ["酒馆", "雾港来信"],
      tavernTitle: "雾港来信",
      tavernSubtitle: "潮汐酒吧 · 22:14",
    })
  );

  addPage(
    tavern,
    generic("tavern-character", "角色卡", {
      kind: "tavern-character",
      icon: "user-round",
      summary: "角色设定、开场白、示例对话和资源。",
      path: ["酒馆", "角色"],
      characterName: "林雾",
      characterRole: "雾港的灯塔看守人",
      sections: [
        section("角色", [
          row("名字", { icon: "badge", value: "林雾" }),
          row("身份", { icon: "briefcase", value: "灯塔看守人" }),
          row("性格", { icon: "heart", value: "冷静、克制、对海面异象保持警觉" }),
          row("开场白", { icon: "message-circle", value: "“今晚的雾，比往常来得早。”" }),
        ]),
        section("互动", [
          row("编辑角色", { icon: "pencil", nav: "tavern-character" }),
          row("查看世界书", { icon: "book-marked", nav: "tavern-lorebooks" }),
          row("开始故事", { icon: "play", nav: "tavern-chat" }),
        ]),
      ],
    })
  );

  addPage(
    tavern,
    generic("tavern-storybook", "故事书", {
      kind: "tavern-storybook",
      icon: "book-heart",
      summary: "按章节整理剧情、分支和回放。",
      path: ["酒馆", "故事书"],
      chapters: [
        { title: "第一章：雾潮", description: "抵达雾港，第一次见到灯塔", icon: "anchor", badge: "已完成" },
        { title: "第二章：失约的信号", description: "灯塔熄灭，海面出现陌生船只", icon: "sailboat", badge: "进行中" },
        { title: "第三章：潮下回声", description: "尚未解锁", icon: "waves", badge: "未解锁" },
      ],
    })
  );

  addPage(
    tavern,
    generic("tavern-lorebooks", "世界书", {
      kind: "list",
      icon: "book-marked",
      summary: "世界设定、角色关系和触发条目。",
      path: ["酒馆", "世界书"],
      listItems: [
        { title: "雾港世界书", description: "地理、势力、潮汐规则 · 42 条", icon: "globe-2", nav: "tavern-lorebook" },
        { title: "林雾", description: "角色背景与关系 · 18 条", icon: "user-round", nav: "tavern-lorebook" },
        { title: "灯塔与潮汐", description: "核心谜题与触发条件 · 26 条", icon: "lighthouse", nav: "tavern-lorebook" },
      ],
    })
  );

  addPage(
    tavern,
    generic("tavern-lorebook", "雾港世界书", {
      kind: "list",
      icon: "book-marked",
      summary: "条目、关键词、触发方式和内容。",
      path: ["世界书", "雾港世界书"],
      listItems: [
        { title: "雾港", description: "关键词：雾港、潮汐、港口 · 常驻", icon: "anchor" },
        { title: "灯塔", description: "关键词：灯塔、林雾、信号 · 常驻", icon: "lighthouse" },
        { title: "潮下回声", description: "关键词：海面、歌声、旧船 · 条件触发", icon: "waves" },
        { title: "禁航区", description: "关键词：北岸、封锁、军舰 · 条件触发", icon: "shield-alert" },
      ],
      actions: [{ label: "新增条目", icon: "plus" }],
    })
  );

  addPage(
    tavern,
    generic("tavern-personas", "扮演身份", {
      kind: "list",
      icon: "venetian-mask",
      summary: "玩家在故事中的身份、背景与说话方式。",
      path: ["酒馆", "扮演身份"],
      listItems: [
        { title: "外来调查员", description: "当前身份 · 观察力强", icon: "search", badge: "使用中" },
        { title: "雾港旅人", description: "普通旅客 · 对本地一无所知", icon: "backpack" },
        { title: "灯塔学徒", description: "与林雾有旧交", icon: "lighthouse" },
      ],
      actions: [{ label: "新建身份", icon: "plus" }],
    })
  );

  addPage(
    tavern,
    generic("tavern-presets", "酒馆预设", {
      kind: "presets",
      icon: "sliders-horizontal",
      summary: "提示词、上下文、回复长度和随机性。",
      path: ["酒馆", "预设"],
      presets: [
        { title: "叙事沉浸", description: "强调场景、动作和角色对话", icon: "book-open", badge: "默认", active: true },
        { title: "快速推进", description: "减少描写，更主动推动剧情", icon: "fast-forward", badge: "可用" },
        { title: "角色对话", description: "以对白为主，旁白更少", icon: "messages-square", badge: "可用" },
      ],
    })
  );

  addPage(
    tavern,
    generic("tavern-regex", "正则与替换", {
      kind: "list",
      icon: "regex",
      summary: "清理输出、替换变量与隐藏格式。",
      path: ["酒馆", "正则与替换"],
      listItems: [
        { title: "隐藏状态栏", description: "从正文中移除 <status>…</status>", icon: "eye-off", badge: "启用" },
        { title: "代词替换", description: "替换 {{user}} 与 {{char}}", icon: "replace", badge: "启用" },
        { title: "清理多余空行", description: "合并连续空行", icon: "pilcrow", badge: "启用" },
      ],
      actions: [{ label: "新增正则", icon: "plus" }],
    })
  );

  addPage(
    tavern,
    generic("tavern-drafts", "故事草稿", {
      kind: "list",
      icon: "notebook-pen",
      summary: "分支草稿、历史版本和测试运行。",
      path: ["酒馆", "草稿"],
      listItems: [
        { title: "第二章：灯塔熄灭", description: "刚刚编辑 · 4 个分支", icon: "file-pen", badge: "草稿" },
        { title: "林雾的旧信", description: "昨天 · 2 个分支", icon: "mail", badge: "草稿" },
        { title: "潮下回声开场", description: "上周 · 已测试", icon: "waves", badge: "完成" },
      ],
      actions: [{ label: "新建草稿", icon: "plus" }],
    })
  );

  addPage(
    tavern,
    generic("tavern-settings", "酒馆设置", {
      kind: "settings",
      icon: "settings-2",
      summary: "默认模型、上下文、显示方式和导入导出。",
      path: ["设置", "酒馆"],
      sections: [
        section("故事", [
          row("默认预设", { icon: "sliders-horizontal", value: "叙事沉浸", nav: "tavern-presets" }),
          row("默认身份", { icon: "venetian-mask", value: "外来调查员", nav: "tavern-personas" }),
          row("上下文预算", { icon: "gauge", value: "24k Tokens" }),
        ]),
        section("显示", [
          row("显示旁白", { icon: "quote", control: "switch", checked: true }),
          row("显示角色头像", { icon: "user-round", control: "switch", checked: true }),
          row("选项按钮", { icon: "list-ordered", control: "switch", checked: true }),
        ]),
      ],
    })
  );

  addPage(
    appearance,
    generic("appearance", "主题与外观", {
      kind: "appearance",
      icon: "palette",
      summary: "选择喜欢的主题配色，并管理桌面图标与壁纸。",
      path: ["设置", "外观", "主题"],
      sections: [
        section("主题", [
          row("配色模式", {
            icon: "sun-moon",
            control: "segment",
            options: ["选择配色", "浅色", "深色"],
            selected: 0,
          }),
        ]),
        section("视觉", [
          row("桌面图标", { icon: "app-window", value: "默认 Logo", nav: "app-icon" }),
          row("壁纸", { icon: "image", value: "无", nav: "wallpaper" }),
        ]),
      ],
    })
  );

  addPage(
    appearance,
    generic("wallpaper", "壁纸", {
      kind: "wallpaper",
      icon: "image",
      summary: "选择内建壁纸、系统图片或跟随主题色。",
      path: ["设置", "外观", "壁纸"],
      wallpapers: ["深海雾", "纸面", "潮汐线", "纯色"],
      actions: [{ label: "编辑壁纸", icon: "pencil", nav: "wallpaper-editor" }],
    })
  );

  addPage(
    appearance,
    generic("wallpaper-editor", "编辑壁纸", {
      kind: "form",
      icon: "image-pen",
      summary: "模糊、亮度、遮罩和主题色提取。",
      path: ["壁纸", "编辑"],
      form: [{ label: "来源", value: "系统图片 / 深海.jpg" }],
      sections: [
        section("画面", [
          row("模糊", { icon: "scan", value: "18 px" }),
          row("亮度", { icon: "sun-medium", value: "72%" }),
          row("遮罩", { icon: "layers", value: "深色 28%" }),
          row("从壁纸提取主题色", { icon: "pipette", control: "switch", checked: true }),
        ]),
      ],
      actions: [{ label: "应用壁纸", icon: "check" }],
    })
  );

  addPage(
    appearance,
    generic("app-icon", "桌面图标", {
      kind: "icons",
      icon: "app-window",
      summary: "默认使用千变品牌 Logo。",
      path: ["设置", "外观", "桌面图标"],
      iconOptions: [
        {
          title: "默认 Logo",
          description: "千变品牌图标",
          icon: "panels-top-left",
          image: "assets/brand/qianbian-tile.png",
          active: true,
        },
      ],
    })
  );

  addPage(
    appearance,
    generic("icons", "功能图标", {
      kind: "icons",
      icon: "shapes",
      summary: "双色、几何、玻璃三种功能磁贴风格。",
      path: ["设置", "外观", "功能图标"],
      iconOptions: [
        { title: "双色", description: "轻量线条与主题色填充", icon: "layers", active: true },
        { title: "几何", description: "更抽象的几何构成", icon: "shapes" },
        { title: "玻璃", description: "带材质的半透明磁贴", icon: "gem" },
      ],
    })
  );

  addPage(
    appearance,
    settings("text-size", "对话字号", [
      section("聊天内容", [
        row("字号", {
          icon: "text",
          control: "select",
          options: ["小", "标准", "大", "特大"],
          values: ["small", "standard", "large", "xlarge"],
          key: "font-size",
          selected: 1,
        }),
      ]),
    ], {
      icon: "text-cursor-input",
      summary: "选择聊天正文的显示字号。",
      path: ["设置", "外观", "对话字号"],
    })
  );

  addPage(
    appearance,
    settings("interface", "界面", [
      section("首页", [
        row("启动时进入", {
          icon: "panel-left",
          control: "segment",
          options: ["工作", "伙伴", "酒馆"],
          selected: 0,
        }),
        row("首页界面", {
          icon: "app-window",
          control: "segment",
          options: ["原生", "网页"],
          selected: 0,
        }),
      ]),
      section("输入", [
        row("回车发送", { icon: "corner-down-left", control: "switch", checked: true }),
        row("聊天建议", { icon: "sparkles", control: "switch", checked: true }),
        row("快捷面板", { icon: "zap", control: "switch", checked: true }),
        row("表格着色", { icon: "table-2", control: "switch", checked: true }),
      ]),
      section("网页版", [
        row("打开网页版", { icon: "globe", nav: "web-mode" }),
        row("手机布局", { icon: "smartphone", control: "switch", checked: true }),
        row("网页编程视图", { icon: "code", control: "switch", checked: true }),
      ]),
    ], {
      icon: "panel-left",
      summary: "启动页、原生与网页模式、输入和快捷面板。",
      path: ["设置", "通用", "界面"],
    })
  );

  addPage(
    appearance,
    generic("language", "语言", {
      kind: "list",
      icon: "languages",
      summary: "跟随系统、简体中文或 English。",
      path: ["设置", "通用", "语言"],
      listItems: [
        { title: "跟随系统", description: "按系统语言自动切换", icon: "monitor-smartphone", badge: "默认" },
        { title: "简体中文", description: "所有界面使用简体中文", icon: "languages" },
        { title: "English", description: "Use English throughout the interface", icon: "languages" },
      ],
      actions: [{ label: "打开界面语言选择", icon: "check", action: "locale" }],
    })
  );

  addPage(
    hosts,
    settings("settings", "设置", [
      section("账号", [
        row("账号与个人资料", {
          icon: "circle-user-round",
          description: "查看和编辑头像、昵称、邮箱、手机号与地区。",
          value: "已登录",
          nav: "account",
        }),
      ]),
      section("技能", [
        row("技能空间", {
          icon: "puzzle",
          description: "查看热门技能、我发布的技能、已安装技能和冲突设置。",
          value: "打开",
          action: "open-main-nav",
        }),
        row("发布技能", {
          icon: "upload-cloud",
          description: "填写技能资料与资源包，发布到技能空间。",
          nav: "publish-skill",
        }),
      ]),
      section("外观", [
        row("主题与外观", { icon: "palette", description: "设置浅色、深色、主题色和玻璃效果。", value: "选择配色", nav: "appearance" }),
        row("壁纸", {
          icon: "image",
          description: "选择或编辑对话页背景。",
          nav: "wallpaper",
        }),
        row("桌面图标", {
          icon: "app-window",
          description: "使用千变默认品牌 Logo。",
          value: "默认 Logo",
          nav: "app-icon",
        }),
        row("对话字号", {
          icon: "text-cursor-input",
          description: "选择消息正文的显示字号。",
          control: "select",
          options: ["小", "标准", "大", "特大"],
          values: ["small", "standard", "large", "xlarge"],
          key: "font-size",
          selected: 1,
        }),
      ]),
      section("通用", [
        row("语言", {
          icon: "languages",
          description: "选择界面显示语言。",
          control: "select",
          options: ["简体中文", "English"],
          values: ["zh", "en"],
          key: "locale",
          selected: 0,
        }),
        row("通知", { icon: "bell", description: "设置完成、错误、审批和提问时的提醒方式。", value: "已开启", nav: "notifications" }),
      ]),
      section("社区与分享", [
        row("社区", { icon: "users", description: "查看交流渠道与社区入口。", nav: "community" }),
        row("论坛", { icon: "messages-square", description: "查看论坛内容与讨论。", nav: "forum" }),
        row("分享配置", { icon: "share-2", description: "生成分享链接、二维码或分享卡。", nav: "share-config" }),
      ]),
    ], {
      icon: "settings-2",
      summary: "账号、技能、外观、通用和社区与分享。",
      path: ["设置"],
    })
  );

  addPage(
    hosts,
    generic("account", "账号", {
      kind: "account",
      icon: "circle-user-round",
      summary: "个人资料、登录状态与账号切换。",
      path: ["设置", "账号"],
      profile: {
        nickname: "林澈",
        accountId: "lj_20261117",
        email: "lin@example.com",
        phone: "138****8021",
        region: "中国 · 上海",
      },
      actions: [
        { label: "切换账号", icon: "users-round", action: "switch-account" },
      ],
    })
  );

  addPage(
    hosts,
    generic("engine", "本机引擎", {
      kind: "engine",
      icon: "cpu",
      summary: "运行状态、版本、启动方式和维护操作。",
      path: ["设置", "主机", "本机引擎"],
      metrics: [
        { value: "98%", label: "健康度" },
        { value: "1.8 GB", label: "占用空间" },
        { value: "28ms", label: "本地延迟" },
        { value: "0.9.2", label: "应用版本" },
      ],
      status: {
        title: "本机 千变 正在运行",
        description: "千变 0.1.1-rc.2 · Node.js 22 · Ubuntu 24 PRoot",
        tone: "success",
      },
      sections: [
        section("启动", [
          row("打开 App 时自动启动", { icon: "power", control: "switch", checked: true }),
          row("安全模式", { icon: "shield-plus", control: "switch", checked: false }),
          row("工作区恢复", { icon: "history", control: "switch", checked: true }),
        ]),
        section("维护", [
          row("查看日志", { icon: "file-clock", nav: "job-output" }),
          row("重启引擎", { icon: "rotate-cw" }),
          row("重置运行环境", { icon: "refresh-ccw", tone: "danger" }),
          row("卸载运行环境", { icon: "trash-2", tone: "danger" }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    generic("engine-settings", "引擎参数", {
      kind: "settings",
      icon: "sliders-horizontal",
      summary: "从当前主机的 Schema 生成的运行、Agent 和技能设置。",
      path: ["设置", "主机", "引擎参数"],
      sections: [
        section("运行", [
          row("子代理", { icon: "network", description: "并发、深度与超时", nav: "subagent-settings" }),
          row("Agent 循环", { icon: "iteration-ccw", description: "步骤、并行和上下文", nav: "agent-loop" }),
          row("命令执行", { icon: "terminal", description: "Shell、超时和沙箱", nav: "shell-settings" }),
        ]),
        section("技能", [
          row("技能清单", { icon: "list-tree", nav: "plugin-inventory" }),
          row("网页搜索", { icon: "globe-2", nav: "web-search" }),
          row("界面设置", { icon: "panel-top", nav: "interface" }),
        ]),
        section("高级", [
          row("查看 Schema", { icon: "file-json", nav: "engine-schema" }),
          row("重置为默认", { icon: "rotate-ccw", tone: "danger" }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    generic("engine-schema", "引擎 Schema", {
      kind: "schema",
      icon: "file-json",
      summary: "查看当前主机支持的全部配置字段。",
      path: ["引擎参数", "Schema"],
      sections: [
        section("agent-loop", [
          row("maxParallelToolCalls", { icon: "split", value: "number · 8" }),
          row("maxSteps", { icon: "list-ordered", value: "number · 48" }),
          row("retryFailedTools", { icon: "rotate-cw", value: "boolean · true" }),
        ]),
        section("bash-sandbox", [
          row("timeoutMs", { icon: "timer", value: "number · 120000" }),
          row("enabled", { icon: "terminal", value: "boolean · true" }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    settings("shell-settings", "命令执行", [
      section("Shell", [
        row("默认 Shell", { icon: "terminal", control: "segment", options: ["Bash", "PowerShell"], selected: 0 }),
        row("命令超时", { icon: "timer", value: "120 秒" }),
        row("最大输出", { icon: "text", value: "64 KB" }),
      ]),
      section("沙箱", [
        row("工作区内修改", { icon: "folder-lock", value: "默认" }),
        row("允许网络", { icon: "globe", control: "switch", checked: true }),
        row("环境变量", { icon: "braces", value: "4 项" }),
      ]),
    ], {
      icon: "square-terminal",
      summary: "默认 Shell、超时、输出和命令沙箱。",
      path: ["设置", "主机", "引擎参数", "命令执行"],
    })
  );

  addPage(
    hosts,
    generic("remote", "远程主机", {
      kind: "remote",
      icon: "server",
      summary: "SSH、千变 Remote 和局域网主机。",
      path: ["设置", "主机", "远程主机"],
      hosts: [
        {
          name: "工作室电脑",
          description: "SSH · 192.168.1.20 · 在线",
          icon: "monitor",
          badge: "已连接",
          active: true,
          tone: "success",
          nav: "network-details",
        },
        {
          name: "开发服务器",
          description: "千变 Remote · 东京 · 在线",
          icon: "server",
          badge: "可切换",
          tone: "success",
          nav: "network-details",
        },
        {
          name: "家里的小主机",
          description: "SSH · 10.0.0.8 · 离线",
          icon: "house",
          badge: "离线",
          tone: "idle",
          nav: "network-details",
        },
      ],
      sections: [
        section("远程", [
          row("启动时自动连接", { icon: "plug-zap", control: "switch", checked: true }),
          row("精简远程历史", { icon: "list-filter", control: "switch", checked: false }),
          row("配对码", { icon: "qr-code", nav: "remote-pairing" }),
        ]),
      ],
      actions: [{ label: "添加 SSH 主机", icon: "plus", nav: "ssh-form" }],
    })
  );

  addPage(
    hosts,
    generic("ssh-form", "添加 SSH 主机", {
      kind: "form",
      icon: "square-terminal",
      summary: "地址、端口、用户名、密钥与主机验证。",
      path: ["远程主机", "添加 SSH 主机"],
      form: [
        { label: "主机地址", value: "", placeholder: "192.168.1.20" },
        { label: "端口", value: "22" },
        { label: "用户名", value: "", placeholder: "root" },
        { label: "SSH 私钥", type: "password", value: "已选择 ~/.ssh/id_ed25519" },
      ],
      sections: [
        section("连接", [
          row("保存后自动连接", { icon: "plug-zap", control: "switch", checked: true }),
          row("记住主机指纹", { icon: "fingerprint", control: "switch", checked: true }),
        ]),
      ],
      actions: [
        { label: "测试连接", icon: "badge-check", secondary: true },
        { label: "保存主机", icon: "check", nav: "remote" },
      ],
    })
  );

  addPage(
    hosts,
    generic("remote-pairing", "远程配对", {
      kind: "pairing",
      icon: "qr-code",
      summary: "扫码或输入配对码，建立加密连接。",
      path: ["远程主机", "配对"],
      pairingCode: "千变7-42KQ",
      metrics: [
        { value: "端到端", label: "加密" },
        { value: "2 分钟", label: "配对码有效期" },
        { value: "局域网", label: "发现方式" },
        { value: "等待", label: "主机确认" },
      ],
    })
  );

  addPage(
    hosts,
    generic("network-details", "网络详情", {
      kind: "diagnostics",
      icon: "network",
      summary: "远程连接路径、延迟、流量和重连状态。",
      path: ["远程主机", "工作室电脑", "网络"],
      checks: [
        { title: "连接路径", description: "局域网直连 · 192.168.1.20", status: "正常" },
        { title: "延迟", description: "平均 18 ms · 最近 24 ms", status: "优秀" },
        { title: "加密", description: "SSH Ed25519 · 已验证主机", status: "正常" },
        { title: "流量", description: "上行 1.8 MB · 下行 6.4 MB", status: "正常" },
        { title: "自动重连", description: "每 3 秒退避，最多 5 次", status: "启用" },
      ],
    })
  );

  addPage(
    hosts,
    generic("voice", "语音", {
      kind: "voice-settings",
      icon: "audio-lines",
      summary: "语音输入、朗读声音、语音模型和通话行为。",
      path: ["设置", "通用", "语音"],
      metrics: [
        { value: "自动", label: "输入识别" },
        { value: "云海", label: "朗读声音" },
        { value: "已下载", label: "语音模型" },
        { value: "免提", label: "默认通话" },
      ],
      sections: [
        section("输入", [
          row("识别方式", { icon: "mic", control: "segment", options: ["自动", "AI 平台", "系统"], selected: 0 }),
          row("实时字幕", { icon: "captions", control: "switch", checked: true }),
          row("语音模型", { icon: "brain", value: "已下载 · 186 MB", nav: "voice-reading" }),
        ]),
        section("朗读与通话", [
          row("朗读的声音", { icon: "volume-2", value: "云海", nav: "voice-reading" }),
          row("通话背景", { icon: "image", value: "深海" }),
          row("插话打断", { icon: "message-square-dashed", control: "switch", checked: true }),
          row("口语回答", { icon: "quote", control: "switch", checked: true }),
          row("默认免提", { icon: "speaker", control: "switch", checked: false }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    generic("voice-reading", "朗读与语音模型", {
      kind: "voice-settings",
      icon: "mic-vocal",
      summary: "声音角色、语速、音调、模型下载和试听。",
      path: ["设置", "语音", "声音"],
      metrics: [
        { value: "云海", label: "当前声音" },
        { value: "1.0×", label: "语速" },
        { value: "186 MB", label: "模型大小" },
        { value: "已就绪", label: "状态" },
      ],
      sections: [
        section("声音", [
          row("声音角色", { icon: "mic-vocal", value: "云海" }),
          row("试听", { icon: "play", value: "播放示例" }),
          row("语速", { icon: "gauge", value: "1.0×" }),
          row("音调", { icon: "audio-waveform", value: "自然" }),
        ]),
        section("模型", [
          row("本地语音模型", { icon: "brain-circuit", value: "已下载" }),
          row("检查更新", { icon: "refresh-cw", value: "已是最新" }),
          row("删除模型", { icon: "trash-2", tone: "danger" }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    generic("about", "关于 千变", {
      kind: "about",
      icon: "info",
      summary: "版本、更新、项目主页、开源许可与致谢。",
      path: ["设置", "帮助与关于", "关于 千变"],
      metrics: [
        { value: "0.9.2", label: "版本" },
        { value: "10251234", label: "构建号" },
        { value: "Android", label: "平台" },
        { value: "AGPL-3.0", label: "许可证" },
      ],
      sections: [
        section("更新", [
          row("检查更新", { icon: "arrow-circle-up", value: "已是最新" }),
          row("自动检查更新", { icon: "refresh-cw", control: "switch", checked: true }),
          row("安装路线", { icon: "route", value: "正常安装", nav: "updates" }),
        ]),
        section("项目", [
          row("给 千变 点个 star", { icon: "star", value: "GitHub" }),
          row("开源许可", { icon: "scale", nav: "licenses" }),
          row("第三方致谢", { icon: "heart-handshake", nav: "licenses" }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    generic("updates", "检查更新", {
      kind: "update",
      icon: "download",
      summary: "更新内容、安装路线、跳过版本和导出安装包。",
      path: ["关于 千变", "检查更新"],
      status: {
        title: "当前已是最新版本",
        description: "0.9.2 · build 10251234",
        tone: "success",
      },
      sections: [
        section("安装", [
          row("正常安装", { icon: "download", value: "默认" }),
          row("Shizuku 安装", { icon: "smartphone", value: "已授权" }),
          row("本机 ADB 安装", { icon: "terminal", value: "需配对" }),
        ]),
        section("维护", [
          row("导出安装包", { icon: "package-down", value: "下载 / 千变" }),
          row("跳过此版本", { icon: "skip-forward", value: "无" }),
        ]),
      ],
    })
  );

  addPage(
    hosts,
    generic("licenses", "开源许可", {
      kind: "licenses",
      icon: "scale",
      summary: "AGPL-3.0、MIT、字体和第三方组件许可。",
      path: ["关于 千变", "开源许可"],
      licenses: [
        { title: "千变", description: "AGPL-3.0 · 主项目", icon: "scale" },
        { title: "千变 SDK / Examples", description: "MIT", icon: "braces" },
        { title: "Phosphor Icons", description: "MIT · 图标", icon: "shapes" },
        { title: "JetBrains Mono", description: "OFL-1.1 · 字体", icon: "type" },
        { title: "AI Agent", description: "第三方开源组件", icon: "sparkles" },
      ],
    })
  );

  addPage(
    overlays,
    generic("model-sheet", "模型选择面板", {
      kind: "sheet",
      icon: "sparkles",
      summary: "聊天输入条上的模型切换。",
      path: ["对话", "模型选择"],
      overlay: true,
      basePage: "chat",
      sheetType: "model",
    })
  );

  addPage(
    overlays,
    generic("plus-panel", "添加内容面板", {
      kind: "sheet",
      icon: "plus",
      summary: "图片、文件、生成、工作区和快捷能力。",
      path: ["对话", "添加内容"],
      overlay: true,
      basePage: "chat",
      sheetType: "plus",
    })
  );

  addPage(
    overlays,
    generic("permission-sheet", "会话权限面板", {
      kind: "sheet",
      icon: "shield",
      summary: "切换当前对话的权限档位。",
      path: ["对话", "权限"],
      overlay: true,
      basePage: "chat",
      sheetType: "permission",
    })
  );

  addPage(
    overlays,
    generic("host-switch", "切换主机", {
      kind: "sheet",
      icon: "server",
      summary: "在本机和远程主机之间切换。",
      path: ["对话", "切换主机"],
      overlay: true,
      basePage: "chat",
      sheetType: "host",
    })
  );

  addPage(
    overlays,
    generic("generate-sheet", "图像与视频参数", {
      kind: "sheet",
      icon: "wand-sparkles",
      summary: "生成模式、比例、数量和模型。",
      path: ["对话", "生成参数"],
      overlay: true,
      basePage: "chat",
      sheetType: "generate",
    })
  );

  addPage(
    overlays,
    generic("session-menu", "会话操作", {
      kind: "sheet",
      icon: "ellipsis",
      summary: "置顶、重命名、分享、移动和删除。",
      path: ["对话目录", "会话操作"],
      overlay: true,
      basePage: "home",
      sheetType: "session",
    })
  );

  addPage(
    overlays,
    generic("share-panel", "分享对话", {
      kind: "sheet",
      icon: "share-2",
      summary: "分享卡、链接、二维码、文件和文字。",
      path: ["对话", "分享"],
      overlay: true,
      basePage: "chat",
      sheetType: "share",
    })
  );

  addPage(
    overlays,
    generic("image-actions", "图片操作", {
      kind: "sheet",
      icon: "image",
      summary: "查看、保存、分享、变体和继续编辑。",
      path: ["对话", "图片操作"],
      overlay: true,
      basePage: "chat",
      sheetType: "image",
    })
  );

  addPage(
    overlays,
    generic("reasoning-sheet", "本轮执行过程", {
      kind: "sheet",
      icon: "route",
      summary: "查看思考、工具和耗时。",
      path: ["对话", "执行过程"],
      overlay: true,
      basePage: "chat",
      sheetType: "trajectory",
    })
  );

  addPage(
    overlays,
    generic("composer-actions", "发送方式", {
      kind: "sheet",
      icon: "send",
      summary: "排队、插话或打断本轮后发送。",
      path: ["对话", "发送方式"],
      overlay: true,
      basePage: "chat",
      sheetType: "send",
    })
  );

  addPage(
    overlays,
    generic("context-sheet", "上下文用量", {
      kind: "sheet",
      icon: "gauge",
      summary: "Token 占用、压缩和模型窗口。",
      path: ["对话", "上下文"],
      overlay: true,
      basePage: "chat",
      sheetType: "context",
    })
  );

  addPage(
    overlays,
    generic("error-state", "连接中断", {
      kind: "error",
      icon: "plug-zap",
      summary: "引擎或远程主机中断时的恢复状态。",
      path: ["对话", "连接中断"],
      status: {
        title: "与远程主机断开连接",
        description: "工作区与对话已保留。网络恢复后可以继续，或立即重试。",
        tone: "error",
      },
      sections: [
        section("恢复", [
          row("立即重连", { icon: "refresh-cw" }),
          row("切换主机", { icon: "server", nav: "remote" }),
          row("查看网络详情", { icon: "network", nav: "network-details" }),
        ]),
      ],
    })
  );

  addPage(
    overlays,
    generic("empty-state", "空状态", {
      kind: "empty",
      icon: "inbox",
      summary: "没有会话、文件或搜索结果时的空状态。",
      path: ["千变", "空状态"],
      emptyTitle: "这里还很安静",
      emptyDescription: "新建一个对话，或从全部功能里选择要打开的工具。",
      actions: [
        { label: "新对话", icon: "message-square-plus", nav: "home" },
        { label: "会话工作台", icon: "panels-top-left", secondary: true, nav: "session-workbench" },
      ],
    })
  );

  const flatPages = Object.values(pages);
  const pageGroups = groups.map((group) => ({
    id: group.id,
    title: group.title,
    icon: group.icon,
    description: group.description,
    pageIds: group.pages.slice(),
  }));

  window.APP_DATA = {
    groups: pageGroups,
    pages,
    flatPages,
    total: flatPages.length,
    version: "UI 组件-atlas-1",
  };
})();
