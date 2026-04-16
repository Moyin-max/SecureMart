# SecureMart Project Documentation

## 1. Project Title

**SecureMart - Smart AI Security System for Convenience Stores**

Live demo:
[https://securemart.onrender.com](https://securemart.onrender.com)

## 2. Project Overview

SecureMart is a smart security dashboard designed for convenience stores. It helps store owners monitor activity, detect suspicious behavior, control door access remotely, and respond quickly to security events.

The system combines:

- motion detection
- smart camera monitoring
- door lock automation
- AI-based suspicious activity alerts
- owner notification and remote response

This project was built as a hackathon-style demo to show how IoT devices and cloud software can work together to protect a physical retail store.

## 3. Problem Statement

Many small convenience stores face security challenges such as:

- shoplifting and theft
- unauthorized access after store closing time
- lack of real-time monitoring
- delayed response to incidents
- limited affordable security automation

Traditional CCTV systems only record footage. They do not actively detect threats, alert the owner, or trigger automatic responses.

## 4. Proposed Solution

SecureMart provides a smart, connected security system that:

- detects movement inside the store
- records and monitors suspicious activity
- changes system behavior based on whether the store is open or closed
- automatically locks the door after unauthorized movement
- sends alerts to the owner
- allows remote control from a dashboard

## 5. Objectives

- Build a working smart security dashboard
- Simulate a real IoT security workflow for a convenience store
- Provide a usable API for frontend-to-backend communication
- Demonstrate automation, remote monitoring, and incident response
- Present a polished project suitable for demo and judging

## 6. Key Features

- Live security dashboard
- Motion event simulation
- AI suspicious-behavior detection simulation
- Door lock and unlock control
- Alarm arm and disarm control
- Owner notification trigger
- Lockdown mode
- Store open and closed mode
- Automatic demo cycle for presentation
- Reset demo state for repeat presentations
- Public deployment on Render

## 7. System Architecture

### Conceptual IoT Architecture

Motion Sensor -> Microcontroller -> Cloud API -> Web Dashboard -> Door Lock / Camera / Alerts

### Software Architecture

- **Frontend:** single-page HTML, CSS, and JavaScript dashboard
- **Backend:** Node.js HTTP server
- **Persistence:** JSON file state storage
- **Hosting:** Render

## 8. Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Render for deployment
- GitHub for version control

## 9. Hardware Components in Real-World Version

The current project is a software simulation of a smart security environment. In a real physical deployment, the following hardware would be connected:

- PIR motion sensor
- smart camera
- smart door lock
- Raspberry Pi or Arduino
- network/Wi-Fi module
- alarm or buzzer

## 10. Project Workflow

### Normal Security Flow

1. Motion is detected in the store.
2. The event is sent to the backend.
3. The system checks whether the store is closed.
4. If the event is suspicious, the dashboard updates immediately.
5. The owner can view alerts and take action.

### After-Hours Intrusion Flow

1. Motion is detected after store closing time.
2. The AI logic flags suspicious activity.
3. The system updates the incident timeline.
4. The smart door locks automatically.
5. The alarm remains armed.
6. The owner receives a notification.
7. The owner can trigger lockdown or respond remotely.

## 11. Dashboard Modules

### Security Status

Shows:

- current security state
- door state
- API connection state

### Live Metrics

Shows:

- motion event count
- AI flag count
- door command count
- response time

### Camera View

Displays a simulated smart camera section used in the presentation to represent active monitoring.

### Alerts Timeline

Displays recent system events such as:

- motion detection
- AI suspicious activity
- automatic door locking
- owner notifications

### Remote Controls

Allows the owner to:

- lock or unlock the door
- arm or disarm the alarm
- send alerts
- trigger lockdown
- switch store mode
- start an automatic demo cycle
- reset the demo

## 12. Backend API Documentation

Base URL:

- Local: `http://localhost:3000`
- Live: `https://securemart.onrender.com`

### `GET /`

Returns the main dashboard page.

### `GET /healthz`

Checks if the backend service is running.

Example response:

```json
{
  "ok": true,
  "service": "securemart"
}
```

### `GET /api/status`

Returns the current system state.

Example response:

```json
{
  "securityState": "Armed",
  "doorLocked": true,
  "alarmArmed": true,
  "storeClosed": true,
  "motionCount": 12,
  "aiCount": 4,
  "doorCount": 8,
  "responseTime": "3.2s",
  "ownerContact": "owner@securemart.ai"
}
```

### `GET /api/alerts`

Returns the recent alert list.

### `POST /api/door`

Locks or unlocks the smart door.

Request body:

```json
{
  "locked": true
}
```

### `POST /api/alarm`

Arms or disarms the alarm.

Request body:

```json
{
  "armed": true
}
```

### `POST /api/notify`

Sends a notification to the owner.

Request body:

```json
{
  "to": "owner@securemart.ai",
  "message": "ALERT: Motion detected in SecureMart."
}
```

### `POST /api/incidents`

Creates a security incident and updates the dashboard state.

Request body:

```json
{
  "type": "ai_suspicious_behavior",
  "severity": "high",
  "location": "Checkout Aisle",
  "storeClosed": true
}
```

### `POST /api/store-mode`

Switches the store between open and closed mode.

Request body:

```json
{
  "storeClosed": false
}
```

### `POST /api/reset`

Resets the demo data to the default starting state.

### `POST /api/demo-cycle`

Starts or stops automatic demo events for presentation mode.

Request body:

```json
{
  "enabled": true
}
```

## 13. File Structure

```text
SecureMart/
|-- index.html
|-- server.js
|-- package.json
|-- render.yaml
|-- README.md
|-- PROJECT_DOCUMENTATION.md
|-- start-securemart.bat
|-- .gitignore
```

## 14. How to Run the Project Locally

### Requirements

- Node.js installed
- npm installed

### Steps

```powershell
cd "C:\Users\MOYIN\Desktop\SecureMart"
npm start
```

Then open:

`http://localhost:3000`

You can also run:

- `start-securemart.bat`

## 15. How to Test the API

Check these URLs in a browser:

- `https://securemart.onrender.com/healthz`
- `https://securemart.onrender.com/api/status`
- `https://securemart.onrender.com/api/alerts`

You can also test from the dashboard:

1. Open the live site.
2. Confirm the API card shows `Connected`.
3. Click `Trigger Demo Incident`.
4. Confirm the metrics and alerts change.
5. Click `Reset Demo` to restore the original state.

## 16. Deployment

The project is deployed on Render using:

- `render.yaml` for service configuration
- GitHub for source control
- Node runtime

Live URL:

[https://securemart.onrender.com](https://securemart.onrender.com)

## 17. Limitations

- The current version simulates IoT and AI events rather than using real hardware
- Camera feed is a presentation-friendly visual, not a real stream
- Notifications are simulated through dashboard updates and backend state
- Data is stored in a simple JSON file instead of a production database

## 18. Future Improvements

- Connect real motion sensors and Raspberry Pi devices
- Integrate live CCTV or WebRTC streaming
- Add actual SMS, email, or push notifications
- Add database storage for logs and reports
- Add user authentication for store owners
- Add face recognition for authorized staff
- Add real AI detection using OpenCV or TensorFlow

## 19. Demo Presentation Script

You can explain the project like this:

> SecureMart is a smart AI security system for convenience stores. It detects motion, analyzes suspicious activity, locks the door automatically after hours, and sends alerts to the owner. The owner can also monitor events and control the system remotely through the dashboard.

Suggested demo order:

1. Show the dashboard and system status.
2. Explain the problem SecureMart solves.
3. Trigger a demo incident.
4. Show the alerts timeline update.
5. Show the door lock and alarm response.
6. Trigger lockdown or send an owner alert.
7. Reset the system and explain scalability.

## 20. Conclusion

SecureMart demonstrates how AI, IoT concepts, and web technologies can be combined into a practical retail security solution. Even as a demo system, it clearly shows how small businesses can improve safety, monitoring, and response time with smart automation.
