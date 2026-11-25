(function () {
  "use strict";

  const ACTION_LABELS = {
    "device.paired": "设备已配对",
    "device.removed": "设备已解绑",
    "permission.update": "权限已更新",
    "task.created": "创建设备任务",
    "task.completed": "任务完成",
    "task.failed": "任务失败",
  };

  function firstValue(...values) {
    return values.find(
      (value) => value !== undefined && value !== null && value !== "",
    );
  }

  function normalizePermissions(payload) {
    const source =
      payload?.permissions && typeof payload.permissions === "object"
        ? payload.permissions
        : payload?.data && typeof payload.data === "object"
          ? payload.data
          : payload || {};
    const allowedRoots = Array.isArray(source.allowedRoots)
      ? source.allowedRoots.map(String).filter(Boolean)
      : [];
    return {
      allowedRoots,
      files: source.files !== false,
      terminal: source.terminal === true,
      screenshot: source.screenshot === true,
    };
  }

  function auditList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.audit)) return payload.audit;
    if (Array.isArray(payload?.records)) return payload.records;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }

  function normalizeAuditRecord(record) {
    if (!record || typeof record !== "object") return null;
    const action = String(
      firstValue(record.action, record.event, record.type, ""),
    );
    const status = String(firstValue(record.status, record.result, ""));
    const normalizedStatus = status.toLowerCase();
    return {
      id: String(firstValue(record.id, record.auditId, action)),
      action,
      actionLabel: ACTION_LABELS[action] || action || "设备操作",
      status,
      tone:
        normalizedStatus === "failed" || normalizedStatus === "error"
          ? "failed"
          : normalizedStatus === "success" ||
              normalizedStatus === "done" ||
              normalizedStatus === "completed"
            ? "done"
            : "scheduled",
      summary: String(
        firstValue(record.summary, record.detail, record.message, ""),
      ),
      createdAt: String(
        firstValue(record.createdAt, record.created_at, record.create_time, ""),
      ),
    };
  }

  function normalizeAudit(payload) {
    return auditList(payload)
      .map(normalizeAuditRecord)
      .filter(Boolean)
      .sort((left, right) =>
        String(right.createdAt).localeCompare(String(left.createdAt)),
      );
  }

  window.QianbianDeviceSettings = Object.freeze({
    normalizeAudit,
    normalizePermissions,
  });
})();
