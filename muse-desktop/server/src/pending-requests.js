"use strict";

function normalizeApproval(request) {
  if (!request || !request.approvalId) return null;
  const {
    currentRequirementId,
    requirementId = currentRequirementId,
    ...rest
  } = request;
  const normalized = { ...rest };
  if (requirementId) normalized.requirementId = requirementId;
  return normalized;
}

function normalizeUserInput(request) {
  if (!request || !request.userInputId) return null;
  return { ...request };
}

function extractPendingRequests(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  return [
    ...(Array.isArray(payload.approvals) ? payload.approvals : []),
    ...(Array.isArray(payload.userInputs) ? payload.userInputs : []),
  ];
}

function mergePendingRequests(base, listed) {
  const merged = [];
  const indexes = new Map();
  for (const request of [
    ...extractPendingRequests(base),
    ...extractPendingRequests(listed),
  ]) {
    const normalized = request.approvalId
      ? normalizeApproval(request)
      : normalizeUserInput(request);
    if (!normalized) continue;
    const key = normalized.approvalId
      ? `approval:${normalized.approvalId}`
      : `input:${normalized.userInputId}`;
    if (indexes.has(key)) {
      merged[indexes.get(key)] = normalized;
    } else {
      indexes.set(key, merged.length);
      merged.push(normalized);
    }
  }
  return merged;
}

module.exports = { mergePendingRequests };
