# SecureMart

**SecureMart** is a smart AI-powered security system for convenience stores. It combines motion detection, suspicious activity monitoring, smart door control, and owner alerts in a single web dashboard.

Live demo:
[https://securemart.onrender.com](https://securemart.onrender.com)

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
- Motion event simulation
- AI suspicious behavior alerts
- Remote door lock and unlock
- Alarm control
- Owner notification action
- Store open and closed mode
- Automatic demo cycle
- Resettable presentation state
- Public deployment on Render

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Render
- GitHub

## Project Structure

```text
SecureMart/
|-- index.html
|-- server.js
|-- package.json
|-- render.yaml
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

SecureMart is configured for deployment on Render using [render.yaml](C:\Users\MOYIN\Desktop\SecureMart\render.yaml).

Deployment steps:

1. Push the repo to GitHub.
2. Open [Render Dashboard](https://render.com/).
3. Click `New` then `Blueprint`.
4. Select the SecureMart repository.
5. Deploy using the generated service configuration.

Health check endpoint:

- `/healthz`

## API Endpoints

- `GET /`
- `GET /healthz`
- `GET /api/status`
- `GET /api/alerts`
- `POST /api/door`
- `POST /api/alarm`
- `POST /api/notify`
- `POST /api/incidents`
- `POST /api/store-mode`
- `POST /api/reset`
- `POST /api/demo-cycle`

## Quick Demo Flow

1. Open the live dashboard.
2. Confirm the API shows `Connected`.
3. Click `Reset Demo`.
4. Click `Trigger Demo Incident` or `Run Demo Cycle`.
5. Show the alert timeline and metric updates.
6. Show door lock, alarm, and lockdown actions.
7. Explain how the owner can respond remotely.

## Additional Project Assets

- Full technical documentation: [PROJECT_DOCUMENTATION.md](C:\Users\MOYIN\Desktop\SecureMart\PROJECT_DOCUMENTATION.md)
- One-page report: [ONE_PAGE_REPORT.md](C:\Users\MOYIN\Desktop\SecureMart\ONE_PAGE_REPORT.md)
- Presentation script and slide flow: [PRESENTATION_OUTLINE.md](C:\Users\MOYIN\Desktop\SecureMart\PRESENTATION_OUTLINE.md)

## Author

Developed by Ezekiel Moyinoluwa / Moyin-max.
