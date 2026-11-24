(function () {
  "use strict";

  const messageKinds = new Set(["userMessage", "agentMessage"]);
  const activityKinds = new Set(["reasoning", "toolCall"]);

  function itemKind(item) {
    if (item?.kind) return item.kind;
    return item?.role === "user" ? "userMessage" : "agentMessage";
  }

  function group(items) {
    const turns = [];
    let current = null;
    let fallbackIndex = 0;
    for (const item of Array.isArray(items) ? items : []) {
      if (!item) continue;
      const kind = itemKind(item);
      if (!messageKinds.has(kind) && !activityKinds.has(kind)) continue;
      const startsTurn = kind === "userMessage";
      let turnId = item.turnId ? String(item.turnId) : "";
      if (!turnId) {
        if (startsTurn || !current) {
          fallbackIndex += 1;
          turnId = `local-turn-${fallbackIndex}`;
        } else {
          turnId = current.id;
        }
      }
      let turn = turns.find((candidate) => candidate.id === turnId);
      if (!turn) {
        turn = { id: turnId, items: [] };
        turns.push(turn);
      }
      turn.items.push(item);
      current = turn;
    }
    return turns;
  }

  function activities(turn) {
    return (turn?.items || []).filter((item) =>
      activityKinds.has(itemKind(item)),
    );
  }

  function messages(turn) {
    return (turn?.items || []).filter((item) =>
      messageKinds.has(itemKind(item)),
    );
  }

  function isFailed(item) {
    return /fail|error|cancel|abort/i.test(String(item?.status || ""));
  }

  function isSuccessful(item) {
    if (isFailed(item)) return false;
    return (
      item?.done === true ||
      /completed|succeed|success|done/i.test(String(item?.status || ""))
    );
  }

  function summarize(items) {
    const activityItems = (items || []).filter((item) =>
      activityKinds.has(itemKind(item)),
    );
    const toolCalls = activityItems.filter(
      (item) => itemKind(item) === "toolCall",
    );
    const reasoning = activityItems.filter(
      (item) => itemKind(item) === "reasoning",
    );
    const failedCount = toolCalls.filter(isFailed).length;
    const successCount = toolCalls.filter(isSuccessful).length;
    const toolCount = toolCalls.length;
    let text = "";
    if (toolCount) {
      text =
        failedCount > 0
          ? `尝试 ${toolCount} 次 · ${successCount} 次成功`
          : `调用 ${toolCount} 个工具 · ${successCount} 次成功`;
    } else if (reasoning.length) {
      text = `思考过程 ${reasoning.length} 条`;
    }
    return {
      text,
      toolCount,
      successCount,
      failedCount,
      reasoningCount: reasoning.length,
      total: activityItems.length,
    };
  }

  function activityText(item) {
    if (itemKind(item) === "reasoning") {
      if (Array.isArray(item.summary)) return item.summary.join("\n");
      return item.summaryText || item.text || "";
    }
    return item.visibleOutput || item.summaryText || item.text || "";
  }

  window.QianbianTimeline = Object.freeze({
    activityText,
    activities,
    group,
    isFailed,
    itemKind,
    messages,
    summarize,
  });
})();
