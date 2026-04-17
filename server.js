const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const crypto = require("crypto");

function loadDotEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex <= 0) continue;
    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile();

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const INDEX_PATH = path.join(ROOT, "index.html");
const DATA_PATH = path.join(ROOT, "securemart-data.json");
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || APP_BASE_URL;
const API_KEY = process.env.SECUREMART_API_KEY || "";

const INTERSWITCH_MODE = (process.env.INTERSWITCH_MODE || "sandbox").toLowerCase();
const INTERSWITCH_MERCHANT_CODE = process.env.INTERSWITCH_MERCHANT_CODE || "";
const INTERSWITCH_PAY_ITEM_ID = process.env.INTERSWITCH_PAY_ITEM_ID || "";
const INTERSWITCH_SECRET_KEY = process.env.INTERSWITCH_SECRET_KEY || "";
const INTERSWITCH_REDIRECT_URL = process.env.INTERSWITCH_REDIRECT_URL || `${APP_BASE_URL}/`;
const INTERSWITCH_CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID || "";
const INTERSWITCH_CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET || "";
const INTERSWITCH_API_BASE_URL = process.env.INTERSWITCH_API_BASE_URL || "";
const INTERSWITCH_AUTH_BASE_URL = process.env.INTERSWITCH_AUTH_BASE_URL || "";
const INTERSWITCH_CARD_API_BASE_URL =
  process.env.INTERSWITCH_CARD_API_BASE_URL || "https://qa.interswitchng.com";
const INTERSWITCH_CARD_DEMO_MODE =
  String(process.env.INTERSWITCH_CARD_DEMO_MODE || "true").toLowerCase() === "true";
const INTERSWITCH_SANDBOX_URL = "https://sandbox.interswitchng.com/webpay/v3/paydirect/";
const INTERSWITCH_LIVE_URL = "https://webpay.interswitchng.com/webpay/v3/paydirect/";
const INTERSWITCH_PAYMENT_URL =
  INTERSWITCH_MODE === "live" ? INTERSWITCH_LIVE_URL : INTERSWITCH_SANDBOX_URL;

const PAYMENT_PLANS = {
  starter: { name: "Starter", amountNgn: 4900 },
  pro: { name: "Professional", amountNgn: 12900 },
  enterprise: { name: "Enterprise", amountNgn: 39900 }
};

const rateLimitStore = new Map();
const tokenCache = {
  accessToken: null,
  expiresAt: 0
};

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
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-API-Key",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://sandbox.interswitchng.com https://webpay.interswitchng.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  };
  if (ALLOWED_ORIGIN !== "null") {
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  }
  res.writeHead(statusCode, {
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function text(res, statusCode, payload, contentType = "text/plain; charset=utf-8") {
  const headers = {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store"
  };
  if (ALLOWED_ORIGIN !== "null") {
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  }
  res.writeHead(statusCode, {
    ...headers
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

function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(req, windowMs = 60_000, maxRequests = 90) {
  const key = `${getClientIP(req)}:${req.method}:${req.url || ""}`;
  const now = Date.now();
  const hit = rateLimitStore.get(key);
  if (!hit || now - hit.windowStart > windowMs) {
    rateLimitStore.set(key, { windowStart: now, count: 1 });
    return false;
  }
  hit.count += 1;
  if (hit.count > maxRequests) return true;
  return false;
}

function requireApiKey(req) {
  if (!API_KEY) return true;
  return req.headers["x-api-key"] === API_KEY;
}

function getRequestOrigin(req) {
  const origin = req.headers.origin;
  if (typeof origin === "string" && origin) return origin;
  return null;
}

function isAllowedOrigin(req) {
  if (ALLOWED_ORIGIN === "null") return true;
  const origin = getRequestOrigin(req);
  return origin === null || origin === ALLOWED_ORIGIN;
}

function createInterswitchHash(merchantCode, payItemId, txRef, amountKobo, redirectUrl) {
  const payload = `${merchantCode}${payItemId}${txRef}${amountKobo}${redirectUrl}`;
  return crypto.createHmac("sha512", INTERSWITCH_SECRET_KEY).update(payload).digest("hex");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const textBody = await response.text();
  let jsonBody = {};
  try {
    jsonBody = textBody ? JSON.parse(textBody) : {};
  } catch {
    jsonBody = { raw: textBody };
  }
  return { ok: response.ok, status: response.status, data: jsonBody };
}

async function getInterswitchAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  if (!INTERSWITCH_CLIENT_ID || !INTERSWITCH_CLIENT_SECRET) {
    throw new Error("Missing INTERSWITCH_CLIENT_ID or INTERSWITCH_CLIENT_SECRET");
  }

  const oauthBase = INTERSWITCH_AUTH_BASE_URL || "https://qa.interswitchng.com/passport";
  const tokenUrl = `${oauthBase.replace(/\/$/, "")}/oauth/token?grant_type=client_credentials`;
  const basic = Buffer.from(`${INTERSWITCH_CLIENT_ID}:${INTERSWITCH_CLIENT_SECRET}`).toString("base64");

  const tokenResponse = await requestJson(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!tokenResponse.ok || !tokenResponse.data.access_token) {
    throw new Error(tokenResponse.data.error_description || "Failed to fetch Interswitch access token");
  }

  const expiresIn = Number(tokenResponse.data.expires_in || 3600);
  tokenCache.accessToken = tokenResponse.data.access_token;
  tokenCache.expiresAt = Date.now() + Math.max(expiresIn - 60, 60) * 1000;
  return tokenCache.accessToken;
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

  if (!isAllowedOrigin(req)) {
    json(res, 403, { error: "Origin not allowed" });
    return;
  }

  if (isRateLimited(req)) {
    json(res, 429, { error: "Too many requests. Please retry shortly." });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,X-API-Key"
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
      json(res, 200, {
        ok: true,
        service: "securemart",
        paymentConfigured: Boolean(
          INTERSWITCH_MERCHANT_CODE &&
            INTERSWITCH_PAY_ITEM_ID &&
            INTERSWITCH_SECRET_KEY
        ),
        passportCredentialsConfigured: Boolean(
          INTERSWITCH_CLIENT_ID &&
            INTERSWITCH_CLIENT_SECRET
        ),
        cardApiDemoMode: INTERSWITCH_CARD_DEMO_MODE,
        paymentMode: INTERSWITCH_MODE
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/payments/config") {
      json(res, 200, {
        provider: "interswitch",
        mode: INTERSWITCH_MODE,
        merchantCode: INTERSWITCH_MERCHANT_CODE ? `${INTERSWITCH_MERCHANT_CODE.slice(0, 2)}***` : "",
        payItemId: INTERSWITCH_PAY_ITEM_ID || "",
        redirectUrl: INTERSWITCH_REDIRECT_URL,
        authBaseUrl: INTERSWITCH_AUTH_BASE_URL || "",
        apiBaseUrl: INTERSWITCH_API_BASE_URL || "",
        cardApiBaseUrl: INTERSWITCH_CARD_API_BASE_URL || "",
        configured: Boolean(
          INTERSWITCH_MERCHANT_CODE &&
            INTERSWITCH_PAY_ITEM_ID &&
            INTERSWITCH_SECRET_KEY
        ),
        hasPassportCredentials: Boolean(
          INTERSWITCH_CLIENT_ID &&
            INTERSWITCH_CLIENT_SECRET
        ),
        cardApiDemoMode: INTERSWITCH_CARD_DEMO_MODE
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/alerts") {
      json(res, 200, state.alerts);
      return;
    }

    if (req.method === "POST" && pathname === "/api/payments/interswitch/initiate") {
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }

      if (!INTERSWITCH_MERCHANT_CODE || !INTERSWITCH_PAY_ITEM_ID || !INTERSWITCH_SECRET_KEY) {
        json(res, 500, {
          error: "Payment gateway is not configured on server. Add INTERSWITCH_* environment variables."
        });
        return;
      }

      const body = await parseBody(req);
      const planKey = String(body.plan || "").toLowerCase();
      const plan = PAYMENT_PLANS[planKey];
      if (!plan) {
        json(res, 400, { error: "Invalid plan key. Use starter, pro, or enterprise." });
        return;
      }

      const txRef = `SM-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      const amountKobo = plan.amountNgn * 100;
      const hash = createInterswitchHash(
        INTERSWITCH_MERCHANT_CODE,
        INTERSWITCH_PAY_ITEM_ID,
        txRef,
        amountKobo,
        INTERSWITCH_REDIRECT_URL
      );

      json(res, 200, {
        actionUrl: INTERSWITCH_PAYMENT_URL,
        fields: {
          merchantcode: INTERSWITCH_MERCHANT_CODE,
          payitemid: INTERSWITCH_PAY_ITEM_ID,
          amount: String(amountKobo),
          transactionreference: txRef,
          urlredirectpage: INTERSWITCH_REDIRECT_URL,
          hash
        },
        meta: {
          provider: "interswitch",
          mode: INTERSWITCH_MODE,
          plan: plan.name,
          amountNgn: plan.amountNgn
        }
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/payments/interswitch/verify") {
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
      const txRef = (url.searchParams.get("txRef") || "").trim();
      if (!txRef) {
        json(res, 400, { error: "txRef query param is required" });
        return;
      }
      // Keep the response deterministic for demo use. Replace with provider verification endpoint as needed.
      json(res, 200, {
        provider: "interswitch",
        txRef,
        status: "PENDING_VERIFICATION",
        note: "Hook this endpoint to Interswitch transaction verification API for production confirmation."
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/payments/interswitch/card/purchase") {
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }

      const body = await parseBody(req);
      const amount = Number(body.amount || 0);
      if (!amount || amount <= 0) {
        json(res, 400, { error: "amount is required and must be greater than 0" });
        return;
      }

      const transactionRef =
        String(body.transactionRef || "").trim() ||
        `SMCARD-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;
      const customerId = String(body.customerId || "1407002510");
      const currency = String(body.currency || "NGN");
      const authData = String(body.authData || "").trim();

      if (INTERSWITCH_CARD_DEMO_MODE) {
        json(res, 200, {
          provider: "interswitch",
          channel: "card-api",
          mode: "DEMO",
          transactionRef,
          paymentId: `${Date.now()}`.slice(-9),
          amount: amount.toFixed(2),
          responseCode: "T0",
          message: "Kindly enter the OTP sent to 234805***1111",
          nextAction: "otp_required"
        });
        return;
      }

      if (!authData) {
        json(res, 400, { error: "authData is required when demo mode is disabled" });
        return;
      }

      try {
        const accessToken = await getInterswitchAccessToken();
        const purchaseUrl = `${INTERSWITCH_CARD_API_BASE_URL.replace(/\/$/, "")}/api/v3/purchases`;
        const purchaseResponse = await requestJson(purchaseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customerId,
            amount: String(amount),
            currency,
            authData,
            transactionRef
          })
        });

        json(res, purchaseResponse.status, purchaseResponse.data);
      } catch (error) {
        json(res, 502, { error: error.message || "Card purchase request failed" });
      }
      return;
    }

    if (req.method === "POST" && pathname === "/api/payments/interswitch/card/otp-auth") {
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }

      const body = await parseBody(req);
      const paymentId = String(body.paymentId || "").trim();
      const otp = String(body.otp || "").trim();
      const transactionId = String(body.transactionId || body.transactionRef || "").trim();

      if (!paymentId || !otp || !transactionId) {
        json(res, 400, { error: "paymentId, otp and transactionId/transactionRef are required" });
        return;
      }

      if (INTERSWITCH_CARD_DEMO_MODE) {
        json(res, 200, {
          transactionRef: transactionId,
          message: "Approved by Financial Institution",
          amount: "10000.00",
          responseCode: "00",
          retrievalReferenceNumber: `${Date.now()}`.slice(-12),
          bankCode: "011"
        });
        return;
      }

      try {
        const accessToken = await getInterswitchAccessToken();
        const otpUrl = `${INTERSWITCH_CARD_API_BASE_URL.replace(/\/$/, "")}/api/v3/purchases/otps/auths`;
        const otpResponse = await requestJson(otpUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentId,
            otp,
            transactionId,
            eciFlag: body.eciFlag || ""
          })
        });
        json(res, otpResponse.status, otpResponse.data);
      } catch (error) {
        json(res, 502, { error: error.message || "OTP authentication failed" });
      }
      return;
    }

    if (req.method === "POST" && pathname === "/api/door") {
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
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
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
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
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
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
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
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
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
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
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
      stopDemoCycle();
      json(res, 200, resetState());
      return;
    }

    if (req.method === "POST" && pathname === "/api/demo-cycle") {
      if (!requireApiKey(req)) {
        json(res, 401, { error: "Missing or invalid API key" });
        return;
      }
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
