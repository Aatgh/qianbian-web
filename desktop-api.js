(function () {
  "use strict";

  class ApiError extends Error {
    constructor(message, status = 0, payload = null) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.payload = payload;
    }
  }

  function normalizeBase(value) {
    if (!value) return "";
    return value.replace(/\/+$/, "");
  }

  function defaultBase() {
    if (location.protocol === "http:" || location.protocol === "https:") {
      return new URL("/api", location.href).toString().replace(/\/+$/, "");
    }
    return "http://192.168.1.10:3101/api";
  }

  function readConfiguredBase() {
    try {
      const queryBase = new URL(location.href).searchParams.get("api");
      if (queryBase) return normalizeBase(queryBase);
      return normalizeBase(
        localStorage.getItem("qianbian-api-base") || "",
      );
    } catch {
      return "";
    }
  }

  const configuredBase = readConfiguredBase();
  let explicitBase = Boolean(configuredBase);
  let apiBase = configuredBase || defaultBase();

  function apiUrl(path) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${apiBase}/${String(path).replace(/^\/+/, "")}`;
  }

  async function parseResponse(response, responseType) {
    if (!response.ok) {
      let payload = null;
      try {
        payload = await response.json();
      } catch {}
      throw new ApiError(
        payload?.error || `接口请求失败（${response.status}）`,
        response.status,
        payload,
      );
    }
    if (responseType === "blob") return response.blob();
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async function request(path, options = {}) {
    const {
      method = "GET",
      body,
      headers = {},
      responseType = "json",
      signal,
    } = options;
    const requestHeaders = { ...headers };
    let requestBody = body;
    if (
      body !== undefined &&
      body !== null &&
      !(body instanceof FormData) &&
      typeof body !== "string"
    ) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
    const response = await fetch(apiUrl(path), {
      method,
      body: requestBody,
      headers: requestHeaders,
      signal,
      credentials: "same-origin",
    });
    return parseResponse(response, responseType);
  }

  function query(params) {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    });
    const text = search.toString();
    return text ? `?${text}` : "";
  }

  let eventsSource = null;

  function connectEvents(handlers = {}) {
    if (eventsSource) eventsSource.close();
    const eventUrl = apiUrl("/events");
    let sameOrigin = false;
    try {
      sameOrigin = new URL(eventUrl).origin === location.origin;
    } catch {}
    const source = new EventSource(eventUrl, {
      withCredentials: sameOrigin,
    });
    eventsSource = source;

    source.addEventListener("status", (event) => {
      try {
        handlers.onStatus?.(JSON.parse(event.data));
      } catch (error) {
        handlers.onError?.(error);
      }
    });

    source.addEventListener("msp", (event) => {
      try {
        const payload = JSON.parse(event.data);
        handlers.onEvent?.(payload.method, payload.params || {});
      } catch (error) {
        handlers.onError?.(error);
      }
    });

    source.addEventListener("device/status", (event) => {
      try {
        handlers.onEvent?.("device/status", JSON.parse(event.data));
      } catch (error) {
        handlers.onError?.(error);
      }
    });

    source.onerror = (event) => handlers.onError?.(event);
    return source;
  }

  function closeEvents() {
    eventsSource?.close();
    eventsSource = null;
  }

  const api = {
    ApiError,
    get base() {
      return apiBase;
    },
    get explicit() {
      return explicitBase;
    },
    setBase(value) {
      apiBase = normalizeBase(value) || defaultBase();
      explicitBase = true;
      try {
        localStorage.setItem("qianbian-api-base", apiBase);
      } catch {}
      return apiBase;
    },
    url: apiUrl,
    request,
    health(signal) {
      return request("/health", { signal });
    },
    environments(signal) {
      return request("/environments", { signal });
    },
    affinity(signal) {
      return request("/affinity", { signal });
    },
    authMe(signal) {
      return request("/auth/me", { signal });
    },
    sendSmsCode(phone, signal) {
      return request("/auth/sms-code", {
        method: "POST",
        body: { phone },
        signal,
      });
    },
    loginPhone(payload, signal) {
      return request("/auth/login/phone", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    logout(signal) {
      return request("/auth/logout", { method: "POST", signal });
    },
    devices(signal) {
      return request("/devices", { signal });
    },
    startDevicePairing(payload = {}, signal) {
      return request("/devices/pair/start", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    updateDevice(id, payload, signal) {
      return request(`/devices/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: payload,
        signal,
      });
    },
    deleteDevice(id, signal) {
      return request(`/devices/${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal,
      });
    },
    createDeviceTask(id, payload, signal) {
      return request(`/devices/${encodeURIComponent(id)}/tasks`, {
        method: "POST",
        body: payload,
        signal,
      });
    },
    deviceTasks(id, params = {}, signal) {
      return request(
        `/devices/${encodeURIComponent(id)}/tasks${query(params)}`,
        { signal },
      );
    },
    connectorReleases(signal) {
      return request("/connectors/releases", { signal });
    },
    sessions(params = {}, signal) {
      return request(`/sessions${query(params)}`, { signal });
    },
    startSession(payload, signal) {
      return request("/session/start", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    resumeSession(sessionId, signal) {
      return request("/session/resume", {
        method: "POST",
        body: { sessionId: String(sessionId) },
        signal,
      });
    },
    transcript(sessionId, signal) {
      return request(
        `/transcript${query({ sessionId: String(sessionId) })}`,
        { signal },
      );
    },
    sendTurn(payload, signal) {
      return request("/turn", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    cancelTurn(sessionId, signal) {
      return request("/turn/cancel", {
        method: "POST",
        body: { sessionId: String(sessionId) },
        signal,
      });
    },
    decideApproval(payload, signal) {
      return request("/approval/decide", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    answerInput(payload, signal) {
      return request("/input/answer", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    cancelInput(payload, signal) {
      return request("/input/cancel", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    models(signal) {
      return request("/models", { signal });
    },
    setSessionModel(payload, signal) {
      return request("/session/model", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    setApprovalMode(payload, signal) {
      return request("/session/approval-mode", {
        method: "POST",
        body: payload,
        signal,
      });
    },
    skills({ scope = "market", q = "" } = {}, signal) {
      return request(`/skills${query({ scope, q })}`, { signal });
    },
    mineSkills(signal) {
      return request("/skills/mine", { signal });
    },
    installSkill(id, signal) {
      return request(`/skills/${encodeURIComponent(id)}/install`, {
        method: "POST",
        signal,
      });
    },
    enableSkill(id, signal) {
      return request(`/skills/${encodeURIComponent(id)}/enable`, {
        method: "POST",
        signal,
      });
    },
    disableSkill(id, signal) {
      return request(`/skills/${encodeURIComponent(id)}/disable`, {
        method: "POST",
        signal,
      });
    },
    deleteSkill(id, signal) {
      return request(`/skills/${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal,
      });
    },
    unpublishSkill(id, signal) {
      return request(`/skills/${encodeURIComponent(id)}/unpublish`, {
        method: "POST",
        signal,
      });
    },
    publishSkill(formData, signal) {
      return request("/skills/publish", {
        method: "POST",
        body: formData,
        signal,
      });
    },
    dirs(path = "~", signal) {
      return request(`/dirs${query({ path })}`, { signal });
    },
    view(sessionId, signal) {
      return request(
        `/view${query({ sessionId: String(sessionId) })}`,
        { signal },
      );
    },
    exportSession(sessionId, signal) {
      return request(
        `/session/export${query({ sessionId: String(sessionId) })}`,
        { responseType: "blob", signal },
      );
    },
    automations(signal) {
      return request("/automations", { signal });
    },
    git(path = "", signal) {
      return request(`/git${path ? `/${path.replace(/^\/+/, "")}` : ""}`, {
        signal,
      });
    },
    connectEvents,
    closeEvents,
  };

  window.QianbianApi = api;
})();
