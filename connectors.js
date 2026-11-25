(function () {
  "use strict";

  const releaseList = document.getElementById("release-list");
  const releaseUpdated = document.getElementById("release-updated");
  const api = window.QianbianApi;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function platformMeta(platform) {
    if (platform === "android") {
      return {
        label: "千变 for Android",
        description: "手机连接服务",
        icon: "smartphone",
        note: "V1 支持配对、在线状态、能力上报与任务审批。",
      };
    }
    return {
      label: "千变 for Windows",
      description: "本机连接服务",
      icon: "laptop",
      note: "支持文件、终端、审批与托盘常驻。",
    };
  }

  function normalizeRelease(release, fallbackPlatform = "") {
    const platform = String(
      release?.platform || release?.os || fallbackPlatform || "windows",
    ).toLowerCase();
    const releaseNotes = Array.isArray(release?.releaseNotes)
      ? release.releaseNotes
      : Array.isArray(release?.notes)
        ? release.notes
        : release?.releaseNotes
          ? [release.releaseNotes]
          : [];
    return {
      platform,
      channel: release?.channel || "stable",
      version: String(release?.version || "—"),
      downloadUrl:
        release?.downloadUrl || release?.url || release?.download?.url || "",
      fileName: release?.fileName || release?.filename || "",
      sha256: release?.sha256 || release?.checksum?.sha256 || "",
      size:
        release?.size ||
        release?.fileSize ||
        release?.download?.size ||
        null,
      systemRequirements:
        release?.systemRequirements || release?.requirements || "",
      publishedAt: release?.publishedAt || release?.updatedAt || "",
      releaseNotes,
    };
  }

  function releaseItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.releases)) return payload.releases;
    if (Array.isArray(payload?.connectors)) return payload.connectors;
    if (payload?.releases && typeof payload.releases === "object") {
      return Object.entries(payload.releases).flatMap(
        ([platform, value]) =>
          Array.isArray(value)
            ? value.map((release) => ({ ...release, platform }))
            : [{ ...value, platform }],
      );
    }
    return [];
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  function formatDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function resolveDownloadUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function releaseMarkup(release) {
    const meta = platformMeta(release.platform);
    const downloadUrl = resolveDownloadUrl(release.downloadUrl);
    const size = formatBytes(release.size);
    const date = formatDate(release.publishedAt);
    const notes = release.releaseNotes.length
      ? release.releaseNotes
          .map((note) => `<li>${escapeHtml(note)}</li>`)
          .join("")
      : "<li>本次更新未提供说明。</li>";
    return `
      <article class="connector-release-card" data-platform="${escapeHtml(
        release.platform,
      )}">
        <header class="release-card-head">
          <span class="release-icon"><i data-lucide="${meta.icon}"></i></span>
          <div>
            <h3>${escapeHtml(meta.label)}</h3>
            <p>${escapeHtml(meta.description)}</p>
          </div>
          <span class="release-channel">${escapeHtml(release.channel)}</span>
        </header>
        <div class="release-version-row">
          <strong>${escapeHtml(release.version)}</strong>
          <span>${date ? `发布于 ${escapeHtml(date)}` : "最新可用版本"}</span>
        </div>
        <p class="release-system">${escapeHtml(
          release.systemRequirements || "系统要求以千变发布说明为准。",
        )}</p>
        <a class="release-download ${
          downloadUrl ? "" : "is-disabled"
        }" data-download-release href="${escapeHtml(downloadUrl || "#")}" ${
          downloadUrl ? "" : 'aria-disabled="true" tabindex="-1"'
        } download>
          <i data-lucide="download"></i>
          <span>下载 ${escapeHtml(release.fileName || meta.label)}</span>
          ${size ? `<small>${escapeHtml(size)}</small>` : ""}
        </a>
        <div class="release-details">
          ${
            release.sha256
              ? `<div class="release-checksum"><span>SHA256</span><code>${escapeHtml(
                  release.sha256,
                )}</code></div>`
              : ""
          }
          <div class="release-notes">
            <span>更新说明</span>
            <ul>${notes}</ul>
          </div>
        </div>
        <footer class="release-card-foot">${escapeHtml(meta.note)}</footer>
      </article>
    `;
  }

  function renderReleases(releases) {
    if (!releases.length) {
      releaseUpdated.textContent = "暂无可用版本";
      releaseList.setAttribute("aria-busy", "false");
      releaseList.innerHTML = `
        <div class="connectors-empty">
          <i data-lucide="package-open"></i>
          <strong>还没有可下载的安装包</strong>
          <span>发布流程上传 Windows 或 Android 安装包后，版本会显示在这里。</span>
        </div>
      `;
      window.lucide?.createIcons();
      return;
    }
    const platformOrder = { windows: 0, android: 1 };
    releases.sort((left, right) => {
      const platformDiff =
        (platformOrder[left.platform] ?? 9) -
        (platformOrder[right.platform] ?? 9);
      if (platformDiff) return platformDiff;
      return String(right.publishedAt).localeCompare(
        String(left.publishedAt),
      );
    });
    releaseUpdated.textContent = `${releases.length} 个可下载版本`;
    releaseList.setAttribute("aria-busy", "false");
    releaseList.innerHTML = releases.map(releaseMarkup).join("");
    window.lucide?.createIcons();
  }

  function renderError(message) {
    releaseUpdated.textContent = "版本读取失败";
    releaseList.setAttribute("aria-busy", "false");
    releaseList.innerHTML = `
      <div class="connectors-error" role="alert">
        <i data-lucide="circle-alert"></i>
        <strong>无法读取版本清单</strong>
        <span>${escapeHtml(message || "版本服务暂时不可用")}</span>
        <button data-retry-releases type="button">
          <i data-lucide="refresh-cw"></i>
          重新加载
        </button>
      </div>
    `;
    window.lucide?.createIcons();
  }

  function renderReleasePending() {
    releaseUpdated.textContent = "版本接口尚未开放";
    releaseList.setAttribute("aria-busy", "false");
    releaseList.innerHTML = `
      <div class="connectors-empty" data-release-pending role="status">
        <i data-lucide="package-open"></i>
        <strong>安装包版本接口尚未开放</strong>
        <span>设备连接能力已可使用。连接器安装包发布后，Windows 和 Android 版本会自动显示在这里。</span>
      </div>
    `;
    window.lucide?.createIcons();
  }

  async function loadReleases() {
    releaseList.setAttribute("aria-busy", "true");
    releaseUpdated.textContent = "正在读取版本清单";
    releaseList.innerHTML = `
      <div class="connectors-loading" role="status">
        <span class="loading-mark" aria-hidden="true"></span>
        <strong>正在获取最新版本</strong>
        <span>版本信息由千变发布服务提供。</span>
      </div>
    `;
    if (!api || (location.protocol === "file:" && !api.explicit)) {
      renderError("版本服务未连接，请通过千变站点打开此页面。");
      return;
    }
    try {
      const payload = await api.connectorReleases();
      renderReleases(releaseItems(payload).map((item) => normalizeRelease(item)));
    } catch (error) {
      if (error?.status === 404) {
        renderReleasePending();
        return;
      }
      renderError(error?.message || "版本服务暂时不可用");
    }
  }

  releaseList.addEventListener("click", (event) => {
    if (event.target.closest("[data-retry-releases]")) {
      loadReleases();
    }
  });

  loadReleases();
})();
