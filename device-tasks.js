(function () {
  "use strict";

  const TYPE_LABELS = {
    "fs.list": "列目录",
    "fs.read": "读取文件",
    "fs.write": "写入文件",
    "fs.mkdir": "创建目录",
    "fs.edit": "编辑文件",
    "fs.delete": "删除文件",
    "fs.grep": "搜索文件",
    "terminal.exec": "执行命令",
  };

  const TYPE_ICONS = {
    "fs.list": "folder",
    "fs.read": "file-search",
    "fs.write": "file-plus",
    "fs.mkdir": "folder-plus",
    "fs.edit": "file-code-2",
    "fs.delete": "trash-2",
    "fs.grep": "search",
    "terminal.exec": "terminal",
  };

  const STATUS_ALIASES = {
    queued: ["scheduled", "等待中"],
    pending: ["scheduled", "等待中"],
    waiting: ["scheduled", "等待中"],
    created: ["scheduled", "等待中"],
    running: ["running", "执行中"],
    executing: ["running", "执行中"],
    in_progress: ["running", "执行中"],
    started: ["running", "执行中"],
    completed: ["done", "已完成"],
    succeeded: ["done", "已完成"],
    success: ["done", "已完成"],
    done: ["done", "已完成"],
    finished: ["done", "已完成"],
    failed: ["failed", "失败"],
    error: ["failed", "失败"],
    timeout: ["failed", "超时"],
    timed_out: ["failed", "超时"],
    cancelled: ["scheduled", "已取消"],
    canceled: ["scheduled", "已取消"],
  };

  function firstValue(...values) {
    return values.find(
      (value) => value !== undefined && value !== null && value !== "",
    );
  }

  function parseJson(value, fallback) {
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

  function taskList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.tasks)) return payload.tasks;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (payload?.task && typeof payload.task === "object") {
      return [payload.task];
    }
    return [];
  }

  function normalizeStatus(value) {
    const key = String(value ?? "").toLowerCase();
    const mapped = STATUS_ALIASES[key];
    if (mapped) return { tone: mapped[0], label: mapped[1] };
    return {
      tone: "scheduled",
      label: key ? String(value) : "状态未知",
    };
  }

  function normalizeTask(task, fallbackDeviceId = "") {
    if (!task || typeof task !== "object") return null;
    const status = normalizeStatus(firstValue(task.status, task.state));
    const type = String(firstValue(task.type, task.taskType, "unknown"));
    const payload = parseJson(
      firstValue(task.payloadJson, task.payload),
      {},
    );
    return {
      id: String(firstValue(task.id, task.taskId, task.task_id, "")),
      deviceId: String(
        firstValue(task.deviceId, task.device_id, fallbackDeviceId),
      ),
      type,
      typeLabel: TYPE_LABELS[type] || type,
      statusKey: String(firstValue(task.status, task.state, "")),
      statusLabel: status.label,
      tone: status.tone,
      payload,
      createdAt: String(firstValue(task.createdAt, task.created_at, "")),
      startedAt: String(firstValue(task.startedAt, task.started_at, "")),
      completedAt: String(
        firstValue(task.completedAt, task.completed_at, ""),
      ),
      durationMs: Number(
        firstValue(task.durationMs, task.duration_ms, task.elapsedMs, NaN),
      ),
      error:
        typeof task.error === "string"
          ? task.error
          : task.error?.message || "",
    };
  }

  function normalizeTasks(payload, fallbackDeviceId = "") {
    return taskList(payload)
      .map((task) => normalizeTask(task, fallbackDeviceId))
      .filter(Boolean);
  }

  function orderTasks(tasks) {
    const active = new Set(["running", "scheduled"]);
    return [...tasks].sort((left, right) => {
      const leftActive = active.has(left.tone) ? 1 : 0;
      const rightActive = active.has(right.tone) ? 1 : 0;
      if (leftActive !== rightActive) return rightActive - leftActive;
      return String(right.createdAt).localeCompare(String(left.createdAt));
    });
  }

  function formatDuration(task, now = Date.now()) {
    let milliseconds = Number(task?.durationMs);
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      const started = Date.parse(task?.startedAt || "");
      const completed = Date.parse(task?.completedAt || "");
      if (Number.isFinite(started)) {
        milliseconds = (Number.isFinite(completed) ? completed : now) - started;
      }
    }
    if (!Number.isFinite(milliseconds) || milliseconds < 0) return "";
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    return `${Math.floor(milliseconds / 60000)}m ${Math.round(
      (milliseconds % 60000) / 1000,
    )}s`;
  }

  window.QianbianDeviceTasks = Object.freeze({
    formatDuration,
    normalizeTask,
    normalizeTasks,
    orderTasks,
    taskList,
    iconName(type) {
      return TYPE_ICONS[type] || "file-search";
    },
    typeLabel(type) {
      return TYPE_LABELS[type] || type || "未知任务";
    },
  });
})();
