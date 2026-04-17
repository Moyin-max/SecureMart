# SecureMart Presentation Outline

## Slide 1: Title

**SecureMart - Smart AI Security System for Convenience Stores**

Talking point:

> SecureMart is a smart security platform built to help convenience stores detect threats, automate responses, and give the owner full remote visibility and control.

## Slide 2: Problem Statement

Points to mention:

- convenience stores are vulnerable to theft and unauthorized access
- many stores only have passive CCTV
- owners need real-time monitoring and faster response

Talking point:

> Traditional security systems mostly record events, but they do not actively detect, alert, and respond in real time.

## Slide 3: Proposed Solution

Points to mention:

- motion detection
- AI suspicious behavior monitoring
- smart door control
- owner alerts
- remote dashboard response

Talking point:

> SecureMart combines monitoring and automation so the store can react immediately when a suspicious event happens.

## Slide 4: System Architecture

Architecture flow:

Motion Sensor -> Microcontroller -> Cloud API -> Web Dashboard -> Door Lock / Camera / Owner Alert

Talking point:

> The hardware layer detects activity, the API processes the event, and the dashboard allows the owner to monitor and control the system remotely.

## Slide 5: Core Features

- live security dashboard
- alerts timeline
- door lock and unlock
- alarm control
- lockdown mode
- automatic demo cycle
- reset demo state

## Slide 6: Technology Stack

- HTML, CSS, JavaScript
- Node.js backend
- Fly.io deployment
- GitHub version control

Talking point:

> The solution uses lightweight web technologies to keep it simple, accessible, and easy to deploy.

## Slide 7: Live Demo Flow

Demo order:

1. Open the live dashboard
2. Select `Free Demo` plan for a no-payment safe path
3. Show API connected state
4. Click `Reset Demo`
5. Click `Trigger Demo Incident`
6. Show alerts and metric updates
7. Show door lock response
8. Click `Lockdown` or `Send Alert`

Talking point:

> This demo shows how the system detects an event, updates the dashboard, locks the door when needed, and allows the owner to respond instantly.

## Slide 8: API Endpoints

Mention:

- `GET /api/status`
- `GET /api/alerts`
- `POST /api/door`
- `POST /api/alarm`
- `POST /api/notify`
- `POST /api/incidents`
- `POST /api/payments/interswitch/initiate`
- `POST /api/payments/interswitch/card/purchase`
- `POST /api/payments/interswitch/card/otp-auth`

Talking point:

> The dashboard is not static. It is connected to a working backend API that updates system state and powers the live interactions.

## Slide 9: Impact

Points to mention:

- improves store security awareness
- shortens response time
- demonstrates real IoT application potential
- can be extended with real hardware and AI models

## Slide 10: Future Improvements

- connect real sensors and Raspberry Pi
- integrate real camera streaming
- add SMS or push notifications
- use OpenCV or TensorFlow for real detection
- add staff face recognition

## Closing Statement

> SecureMart shows how AI and IoT concepts can be applied to solve real retail security problems in an affordable and scalable way.

## Live URL

[https://securemart-nova-demo.fly.dev/](https://securemart-nova-demo.fly.dev/)
