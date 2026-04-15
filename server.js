const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const INDEX_PATH = path.join(ROOT, "index.html");
const DATA_PATH = path.join(ROOT, "securemart-data.json");

const defaultState = () => ({
  securityState: "Armed",
  doorLocked: true,
  alarmArmed: true,
  storeClosed: true,
  motionCount: 12,
  aiCount: 4,
  doorCount: 8,
  responseTime: "3.2s",
  ownerContact: "owner@securemart.ai",
  alerts: [
    {
      title: "Motion detected near entrance",
      detail: "Sensor 01 flagged movement after closing time. Owner notified.",
      type: "motion",
      time: new Date(Date.now() - 180000).toLocaleTimeString()
    },
    {
      title: "AI detected suspicious loitering",
      detail: "Camera model found prolonged presence around the drinks aisle.",
      type: "ai",
      time: new Date(Date.now() - 420000).toLocaleTimeString()
    },
    {
      title: "Door auto-locked",
      detail: "Smart lock engaged because unauthorized motion occurred after hours.",
      type: "critical",
      time: new Date(Date.now() - 720000).toLocaleTimeString()
    }
  ]
});

function loadState() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    const state = defaultState();
    saveState(state);
    return state;
  }
}

function saveState(state) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
}

let state = loadState();
let demoTimer = null;

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function text(res, statusCode, payload, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*"
  });
  res.end(payload);
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function addAlert(title, detail, type = "motion") {
  state.alerts.unshift({
    title,
    detail,
    type,
    time: new Date().toLocaleTimeString()
  });
  state.alerts = state.alerts.slice(0, 12);
}

function syncSecurityState() {
  if (!state.alarmArmed) {
    state.securityState = "Standby";
    return;
  }
  if (state.securityState === "Threat Detected" || state.securityState === "Lockdown") {
    return;
  }
  state.securityState = "Armed";
}

function resetState() {
  state = defaultState();
  saveState(state);
  return state;
}

function stopDemoCycle() {
  if (demoTimer) {
    clearInterval(demoTimer);
    demoTimer = null;
  }
}

function runDemoStep() {
  const steps = [
    () => {
      state.motionCount += 1;
      state.responseTime = `${(1.4 + Math.random() * 0.8).toFixed(1)}s`;
      addAlert("Motion detected in aisle 2", "PIR sensor triggered near beverages section.", "motion");
    },
    () => {
      state.motionCount += 1;
      state.aiCount += 1;
      state.responseTime = `${(1.1 + Math.random() * 0.6).toFixed(1)}s`;
      addAlert("AI flagged concealment behavior", "Vision model detected suspicious hand movement near shelf.", "ai");
    },
    () => {
      state.doorLocked = true;
      state.doorCount += 1;
      state.alarmArmed = true;
      state.securityState = "Threat Detected";
      addAlert("Door auto-locked", "Unauthorized movement after closing triggered smart lock.", "critical");
    }
  ];
  steps[Math.floor(Math.random() * steps.length)]();
  saveState(state);
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    notFound(res);
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  try {
    if (req.method === "GET" && pathname === "/") {
      text(res, 200, fs.readFileSync(INDEX_PATH, "utf8"), "text/html; charset=utf-8");
      return;
    }

    if (req.method === "GET" && pathname === "/api/status") {
      syncSecurityState();
      saveState(state);
      json(res, 200, {
        securityState: state.securityState,
        doorLocked: state.doorLocked,
        alarmArmed: state.alarmArmed,
        storeClosed: state.storeClosed,
        motionCount: state.motionCount,
        aiCount: state.aiCount,
        doorCount: state.doorCount,
        responseTime: state.responseTime,
        ownerContact: state.ownerContact
      });
      return;
    }

    if (req.method === "GET" && pathname === "/healthz") {
      json(res, 200, { ok: true, service: "securemart" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/alerts") {
      json(res, 200, state.alerts);
      return;
    }

    if (req.method === "POST" && pathname === "/api/door") {
      const body = await parseBody(req);
      state.doorLocked = body.locked !== false;
      state.doorCount += 1;
      addAlert(
        state.doorLocked ? "Door locked remotely" : "Door unlocked remotely",
        "Door controller updated through SecureMart API.",
        "critical"
      );
      state.responseTime = `${(1.8 + Math.random() * 1.4).toFixed(1)}s`;
      saveState(state);
      json(res, 200, { locked: state.doorLocked, doorCount: state.doorCount });
      return;
    }

    if (req.method === "POST" && pathname === "/api/alarm") {
      const body = await parseBody(req);
      state.alarmArmed = body.armed !== false;
      syncSecurityState();
      addAlert(
        state.alarmArmed ? "Alarm re-armed" : "Alarm disarmed by owner",
        "Alarm controller updated through SecureMart API.",
        "motion"
      );
      state.responseTime = `${(1.6 + Math.random() * 1.1).toFixed(1)}s`;
      saveState(state);
      json(res, 200, { alarmArmed: state.alarmArmed, securityState: state.securityState });
      return;
    }

    if (req.method === "POST" && pathname === "/api/notify") {
      const body = await parseBody(req);
      state.ownerContact = body.to || state.ownerContact;
      addAlert(
        "Owner alert dispatched",
        `Notification sent to ${state.ownerContact}.`,
        "critical"
      );
      state.responseTime = `${(1.2 + Math.random() * 0.9).toFixed(1)}s`;
      saveState(state);
      json(res, 200, { sent: true, to: state.ownerContact });
      return;
    }

    if (req.method === "POST" && pathname === "/api/incidents") {
      const body = await parseBody(req);
      const severity = body.severity || "medium";
      const location = body.location || "Store zone";
      const type = body.type || "motion";
      state.storeClosed = body.storeClosed !== false;

      state.motionCount += 1;
      if (String(type).includes("ai")) {
        state.aiCount += 1;
      }
      if (state.storeClosed) {
        state.doorLocked = true;
        state.alarmArmed = true;
      }
      state.securityState = severity === "high" ? "Threat Detected" : "Armed";
      state.responseTime = `${(1.0 + Math.random() * 0.8).toFixed(1)}s`;

      addAlert(
        severity === "high" ? "Simulated intrusion detected" : "Suspicious activity logged",
        `${location} flagged as ${severity} severity. Camera activated and evidence saved.`,
        severity === "high" ? "critical" : "ai"
      );

      if (state.storeClosed) {
        addAlert(
          "Door auto-locked",
          "Store was closed, so the smart lock was secured automatically.",
          "critical"
        );
      }

      saveState(state);
      json(res, 201, {
        accepted: true,
        securityState: state.securityState,
        doorLocked: state.doorLocked,
        motionCount: state.motionCount,
        aiCount: state.aiCount
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/store-mode") {
      const body = await parseBody(req);
      state.storeClosed = body.storeClosed !== false;
      state.securityState = state.storeClosed ? "Armed" : "Open Hours";
      addAlert(
        state.storeClosed ? "Store switched to closed mode" : "Store switched to open mode",
        state.storeClosed
          ? "After-hours monitoring is active."
          : "Access control relaxed for business hours.",
        "motion"
      );
      saveState(state);
      json(res, 200, { storeClosed: state.storeClosed, securityState: state.securityState });
      return;
    }

    if (req.method === "POST" && pathname === "/api/reset") {
      stopDemoCycle();
      json(res, 200, resetState());
      return;
    }

    if (req.method === "POST" && pathname === "/api/demo-cycle") {
      const body = await parseBody(req);
      const enabled = body.enabled !== false;
      stopDemoCycle();
      if (enabled) {
        runDemoStep();
        demoTimer = setInterval(runDemoStep, 9000);
      }
      json(res, 200, { running: enabled });
      return;
    }

    notFound(res);
  } catch (error) {
    json(res, 400, { error: error.message || "Request failed" });
  }
});

server.listen(PORT, () => {
  console.log(`SecureMart server running at http://localhost:${PORT}`);
});
