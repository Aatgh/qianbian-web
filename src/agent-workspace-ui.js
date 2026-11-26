(function () {
  "use strict";

  const SUPPORTED_KINDS = new Set(["feed", "markdown", "table"]);

  function asObject(value, fallback = {}) {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function normalizeWidget(raw) {
    if (!raw || (raw.id === undefined && raw.widgetId === undefined)) {
      return null;
    }
    const id = String(raw.id ?? raw.widgetId);
    return {
      ...raw,
      id,
      title: String(raw.title || "未命名模块"),
      icon: String(raw.icon || "layout-grid"),
      kind: String(raw.kind || "unsupported"),
      slot: String(raw.slot || "sidebar"),
      enabled: raw.enabled !== false && raw.status !== "disabled",
      sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
      version: Number(raw.version || 0),
      config: asObject(raw.config ?? raw.configJson, {}),
    };
  }

  function normalizeWidgetList(payload) {
    const raw = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.widgets)
        ? payload.widgets
        : [];
    return raw
      .map(normalizeWidget)
      .filter(Boolean)
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }

  function normalizeData(payload) {
    const source = asObject(payload, {});
    return {
      ...source,
      items: Array.isArray(source.items) ? source.items : [],
      error: source.error ? String(source.error) : "",
      stale: Boolean(source.stale),
      updatedAt: source.updatedAt || "",
    };
  }

  function safeHttpUrl(value) {
    try {
      const url = new URL(String(value || ""));
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function formatPublishedAt(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "";
    return new Date(timestamp).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function stateMarkup(className, iconMarkup, title, description, action = "") {
    return `
      <div class="ui-widget-state ${className}">
        ${iconMarkup}
        <strong>${title}</strong>
        ${description ? `<span>${description}</span>` : ""}
        ${action}
      </div>
    `;
  }

  function renderFeed(widget, payload, helpers) {
    const escapeHtml = helpers.escapeHtml;
    const items = payload.items || [];
    const errorBanner = payload.error
      ? `
        <div class="ui-widget-inline-error" role="status">
          ${helpers.icon("triangle-alert")}
          <span>${escapeHtml(payload.error)}</span>
          <button data-ui-widget-retry type="button">重试</button>
        </div>
      `
      : "";
    if (!items.length) {
      return `
        ${errorBanner}
        <div class="ui-widget-state ui-widget-empty">
          ${helpers.icon("inbox")}
          <strong>暂时没有内容</strong>
          <span>数据源当前没有返回条目。</span>
        </div>
      `;
    }
    return `
      ${errorBanner}
      <div class="ui-widget-feed-list" aria-label="${escapeHtml(
        widget.title,
      )}">
        ${items
          .map((item) => {
            const title = escapeHtml(item.title || "未命名条目");
            const summary = escapeHtml(item.summary || "");
            const source = escapeHtml(item.source || "");
            const time = escapeHtml(
              formatPublishedAt(item.publishedAt || item.time),
            );
            const url = safeHttpUrl(item.url);
            const startTag = url
              ? `<a class="ui-widget-feed-item" href="${escapeHtml(
                  url,
                )}" target="_blank" rel="noopener noreferrer">`
              : `<article class="ui-widget-feed-item">`;
            const endTag = url ? "</a>" : "</article>";
            return `
              ${startTag}
                <span class="ui-widget-feed-copy">
                  <strong>${title}</strong>
                  ${summary ? `<span>${summary}</span>` : ""}
                </span>
                <span class="ui-widget-feed-meta">
                  ${source ? `<span>${source}</span>` : ""}
                  ${time ? `<time>${time}</time>` : ""}
                </span>
              ${endTag}
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderMarkdown(widget, payload, helpers) {
    const content =
      payload.content ||
      widget.config?.content ||
      payload.items
        ?.map((item) => item.content || item.summary || "")
        .filter(Boolean)
        .join("\n\n") ||
      "";
    if (!content) {
      return stateMarkup(
        "ui-widget-empty",
        helpers.icon("file-text"),
        "暂无内容",
        "模块没有可展示的 Markdown。",
      );
    }
    const rendered = window.QianbianMarkdown?.render
      ? window.QianbianMarkdown.render(content)
      : `<p>${helpers.escapeHtml(content).replaceAll("\n", "<br>")}</p>`;
    return `<div class="ui-widget-markdown">${rendered}</div>`;
  }

  function renderTable(payload, helpers) {
    const items = payload.items || [];
    const columns = Array.isArray(payload.columns)
      ? payload.columns.map(String)
      : Object.keys(items[0] || {});
    if (!items.length || !columns.length) {
      return stateMarkup(
        "ui-widget-empty",
        helpers.icon("table-2"),
        "暂无表格数据",
        "数据源当前没有返回可展示的记录。",
      );
    }
    return `
      <div class="ui-widget-table-wrap">
        <table class="ui-widget-table">
          <thead><tr>${columns
            .map((column) => `<th>${helpers.escapeHtml(column)}</th>`)
            .join("")}</tr></thead>
          <tbody>
            ${items
              .map(
                (row) =>
                  `<tr>${columns
                    .map(
                      (column) =>
                        `<td>${helpers.escapeHtml(
                          row?.[column] == null ? "" : String(row[column]),
                        )}</td>`,
                    )
                    .join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderWidgetBody(widget, dataState, helpers = {}) {
    const escapeHtml = helpers.escapeHtml || ((value) => String(value ?? ""));
    const icon = helpers.icon || (() => "");
    const normalizedHelpers = { ...helpers, escapeHtml, icon };
    if (!SUPPORTED_KINDS.has(widget.kind)) {
      return stateMarkup(
        "ui-widget-unsupported",
        icon("construction"),
        "暂不支持的类型",
        `当前版本还不能渲染「${escapeHtml(widget.kind)}」模块。`,
      );
    }
    if (dataState?.status === "loading") {
      return stateMarkup(
        "ui-widget-loading",
        `<span class="ui-widget-spinner" aria-hidden="true"></span>`,
        "正在加载",
        "正在读取模块数据。",
      );
    }
    if (dataState?.status === "error") {
      return stateMarkup(
        "ui-widget-error",
        icon("circle-alert"),
        "数据暂时不可用",
        escapeHtml(dataState.error || "请稍后重试"),
        `<button data-ui-widget-retry type="button">重试</button>`,
      );
    }
    const payload = normalizeData(dataState?.payload || {});
    if (widget.kind === "feed") {
      return renderFeed(widget, payload, normalizedHelpers);
    }
    if (widget.kind === "markdown") {
      return renderMarkdown(widget, payload, normalizedHelpers);
    }
    return renderTable(payload, normalizedHelpers);
  }

  window.QianbianAgentWorkspace = Object.freeze({
    SUPPORTED_KINDS,
    formatPublishedAt,
    normalizeData,
    normalizeWidget,
    normalizeWidgetList,
    renderWidgetBody,
    safeHttpUrl,
  });
})();
