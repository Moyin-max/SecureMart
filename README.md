# SecureMart

**SecureMart** is a smart AI-powered security system for convenience stores. It combines motion detection, suspicious activity monitoring, smart door control, and owner alerts in a single web dashboard.

Live demo:
[https://securemart-nova-demo.fly.dev/](https://securemart-nova-demo.fly.dev/)

Full documentation:
[PROJECT_DOCUMENTATION.md](C:\Users\MOYIN\Desktop\SecureMart\PROJECT_DOCUMENTATION.md)

## Overview

Small convenience stores often face theft, shoplifting, unauthorized access after closing, and limited real-time monitoring. SecureMart addresses this by simulating a smart security workflow where sensors, AI analysis, and remote controls work together to improve store protection.

The system allows a store owner to:

- monitor incidents from a dashboard
- detect motion and suspicious behavior
- lock and unlock the store remotely
- arm and disarm the alarm
- trigger lockdown
- receive security alerts
- reset and replay the demo flow

## Features

- Live dashboard UI
- API-connected backend
- Free Demo plan (no payment required)
- Motion event simulation
- AI suspicious behavior alerts
- Remote door lock and unlock
- Alarm control
- Owner notification action
- Store open and closed mode
- Automatic demo cycle
- Resettable presentation state
- Interswitch WebPAY integration (server-signed)
- Interswitch Card API demo flow (purchase + OTP simulation path)
- Public deployment on Fly.io

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Fly.io
- GitHub

## Project Structure

```text
SecureMart/
|-- index.html
|-- server.js
|-- package.json
|-- Dockerfile
|-- fly.toml
|-- README.md
|-- PROJECT_DOCUMENTATION.md
|-- ONE_PAGE_REPORT.md
|-- PRESENTATION_OUTLINE.md
|-- start-securemart.bat
|-- .gitignore
```

## Local Setup

Requirements:

- Node.js
- npm

Run locally:

```powershell
cd "C:\Users\MOYIN\Desktop\SecureMart"
npm start
```

Then open:

`http://localhost:3000`

Alternative:

- Double-click `start-securemart.bat`

## Deployment

SecureMart is deployed on Fly.io:

- App URL: [https://securemart-nova-demo.fly.dev/](https://securemart-nova-demo.fly.dev/)
- Health URL: [https://securemart-nova-demo.fly.dev/healthz](https://securemart-nova-demo.fly.dev/healthz)

Deploy command:

```bash
./.fly/bin/flyctl deploy --remote-only -a securemart-nova-demo
```

Health check endpoint:

- `/healthz`

## API Endpoints

- `GET /`
- `GET /healthz`
- `GET /api/status`
- `GET /api/alerts`
- `GET /api/payments/config`
- `GET /api/payments/interswitch/verify?txRef=...`
- `POST /api/payments/interswitch/card/purchase`
- `POST /api/payments/interswitch/card/otp-auth`
- `POST /api/door`
- `POST /api/alarm`
- `POST /api/notify`
- `POST /api/incidents`
- `POST /api/store-mode`
- `POST /api/reset`
- `POST /api/demo-cycle`
- `POST /api/payments/interswitch/initiate`

## Security + Payment Setup

Copy `.env.example` into `.env` and set real values:

- `SECUREMART_API_KEY` (required for protected POST endpoints and payment initiation)
- `ALLOWED_ORIGIN` (set to your exact frontend URL)
- `INTERSWITCH_MODE=sandbox` for test, `INTERSWITCH_MODE=live` for production
- `INTERSWITCH_MERCHANT_CODE`, `INTERSWITCH_PAY_ITEM_ID`, `INTERSWITCH_SECRET_KEY`
- `INTERSWITCH_REDIRECT_URL` (must match value configured in Interswitch)
- `INTERSWITCH_CLIENT_ID`, `INTERSWITCH_CLIENT_SECRET`
- `INTERSWITCH_AUTH_BASE_URL`, `INTERSWITCH_CARD_API_BASE_URL`
- `INTERSWITCH_CARD_DEMO_MODE=true` for reliable demo fallback

Request protected endpoints with header:

- `X-API-Key: <SECUREMART_API_KEY>`

The app now:

- generates Interswitch transaction hashes only on the server (no secret in browser)
- supports Card API OAuth token flow from backend
- supports Card API demo OTP flow for pitch-day fallback
- rate-limits requests
- checks allowed origin
- applies secure response headers

## Quick Demo Flow

1. Open the live dashboard.
2. Choose `Free Demo` plan (or paid plan if gateway is reachable).
3. Confirm the API shows `Connected`.
4. Click `Reset Demo`.
5. Click `Trigger Demo Incident` or `Run Demo Cycle`.
6. Show the alert timeline and metric updates.
7. Show door lock, alarm, and lockdown actions.
8. For payment/API integration, use `Use Card API Demo (No Redirect)` in modal.

## Additional Project Assets

- Full technical documentation: [PROJECT_DOCUMENTATION.md](C:\Users\MOYIN\Desktop\SecureMart\PROJECT_DOCUMENTATION.md)
- One-page report: [ONE_PAGE_REPORT.md](C:\Users\MOYIN\Desktop\SecureMart\ONE_PAGE_REPORT.md)
- Presentation script and slide flow: [PRESENTATION_OUTLINE.md](C:\Users\MOYIN\Desktop\SecureMart\PRESENTATION_OUTLINE.md)

## Author

Developed by Ezekiel Moyinoluwa / Moyin-max.
