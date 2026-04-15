# SecureMart Demo Guide

## Start the app

Option 1:

```powershell
cd "C:\Users\MOYIN\Desktop\SecureMart"
npm start
```

Option 2:

Double-click `start-securemart.bat`

Then open:

`http://localhost:3000`

## Deploy publicly on Render

1. Push this repo to GitHub.
2. Go to [Render Dashboard](https://render.com/).
3. Click `New` then `Blueprint`.
4. Connect your GitHub account if prompted.
5. Select the `SecureMart` repo.
6. Render will detect [render.yaml](C:\Users\MOYIN\Desktop\SecureMart\render.yaml).
7. Click `Deploy Blueprint`.
8. Wait for the deploy to finish and open the generated public URL.

Render uses:

- Build command: `npm install`
- Start command: `npm start`
- Health check: `/healthz`

## What the demo can do

- Detect and log motion events
- Simulate AI suspicious-behavior alerts
- Lock and unlock the smart door
- Arm and disarm the alarm
- Send owner notifications
- Trigger full lockdown
- Reset the dashboard between demo attempts
- Run an automatic demo cycle for judges

## Best demo flow for presentation

1. Open the dashboard and show that the API is connected.
2. Point to the live metrics and alerts timeline.
3. Click `Run Demo Cycle` or `Trigger Demo Incident`.
4. Show the alert timeline update immediately.
5. Show that the door auto-locks when the store is closed.
6. Use `Send Alert` or `Lockdown` to show owner control.
7. Click `Reset Demo` so judges can see the full flow again.

## Talking points

- Motion sensor sends activity to the microcontroller.
- The microcontroller forwards event data to the cloud API.
- The API updates the dashboard and security state in real time.
- AI analysis flags suspicious behavior.
- If the store is closed, the system locks the door and alerts the owner.
- The owner can remotely respond from phone or laptop.

## API routes

- `GET /api/status`
- `GET /api/alerts`
- `POST /api/door`
- `POST /api/alarm`
- `POST /api/notify`
- `POST /api/incidents`
- `POST /api/store-mode`
- `POST /api/reset`
- `POST /api/demo-cycle`
