# REFLEX — DAY 1 FREEZE DECISIONS (COMPLETED)

Week 3 — The Readiness Sprint | Individual Project  
**STATUS: SCOPE & DESIGN HARD-FROZEN**

This document completes the remaining Day 1 decisions from *Reflex Day 1 Project Documentation*.  
Decisions below match the implemented Frontend (React + Vite PWA) and Backend (Node.js + Express + MySQL + Socket.IO).

---

## 1. Technology Stack — LOCKED

| Layer | Technology | Status | Why |
|-------|------------|--------|-----|
| Application | Progressive Web App | LOCKED | One app for retailer, dispatcher, and rider on phone/tablet/desktop |
| Frontend | React + Vite | LOCKED | Fast SPA workflow; component model fits role-based dashboards |
| Styling | Tailwind CSS | LOCKED | Rapid responsive UI without separate design system |
| Backend | Node.js + Express | LOCKED | Same language as frontend; simple REST + Socket.IO host |
| API | REST API | LOCKED | Clear CRUD/workflow actions; easy to demo and test |
| Real-time | Socket.IO | LOCKED | Live delivery updates without constant polling |
| Database | MySQL | LOCKED | Relational delivery lifecycle, history, and confirmations |
| Confirmation | QR code (manual entry MVP) | LOCKED | Proof of delivery without requiring camera SDK in Week 3 |
| Deployment | Local demo for presentation; Render (API) + Vercel (PWA) intended | LOCKED for intent | Reliable student demo first; cloud deploy after freeze |

---

## 2. Exact Database Schema & Relationships — LOCKED

### Tables

1. **users** — retailers, dispatchers, riders  
2. **deliveries** — delivery requests and current status  
3. **delivery_status_history** — audit trail of status changes  
4. **confirmations** — proof-of-delivery records

### Relationships

- `deliveries.retailer_id` → `users.id` (RESTRICT delete)
- `deliveries.rider_id` → `users.id` (SET NULL on delete; nullable until assigned)
- `delivery_status_history.delivery_id` → `deliveries.id` (CASCADE delete)
- `delivery_status_history.changed_by` → `users.id`
- `confirmations.delivery_id` → `deliveries.id` (UNIQUE: one confirmation per delivery)
- `confirmations.confirmed_by` → `users.id`

### Status lifecycle (ENUM)

`PENDING` → `ASSIGNED` → `PICKED_UP` → `DELIVERED`

### Roles (ENUM)

`RETAILER` | `DISPATCHER` | `RIDER`

---

## 3. Authentication & Role Permissions — LOCKED

### Approach

- Email + password login
- Passwords hashed with **bcrypt**
- Stateless **JWT** (`Bearer` token, expires in **1 day**)
- Token stored client-side as `reflex_token`
- Protected routes on frontend by role; protected endpoints on backend by middleware

### Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | Public | Login, return JWT + user |
| GET | `/api/auth/me` | JWT | Restore session / current user |

### Permissions matrix

| Action | Retailer | Dispatcher | Rider |
|--------|----------|------------|-------|
| Login | Yes | Yes | Yes |
| Create delivery | Yes | No | No |
| View pending / assign rider | No | Yes | No |
| View assigned deliveries | No | No | Yes |
| Update status (PICKED_UP / DELIVERED) | No | No | Yes |
| Confirm delivery (QR code) | No | No | Yes |

Frontend route guards use uppercase roles: `RETAILER`, `DISPATCHER`, `RIDER`.

---

## 4. Exact API Endpoints — LOCKED

Base URL: `http://localhost:5000/api`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Health check |
| POST | `/auth/login` | Public | Authenticate |
| GET | `/auth/me` | Any authenticated | Current user |
| POST | `/deliveries` | RETAILER | Create delivery request |
| GET | `/deliveries/pending` | DISPATCHER | List open (PENDING) requests |
| PATCH | `/deliveries/:id/assign` | DISPATCHER | Assign rider (`{ riderId }`) |
| GET | `/deliveries/my-deliveries` | RIDER | List rider’s assigned deliveries |
| PATCH | `/deliveries/:id/status` | RIDER | Update status (`PICKED_UP` or `DELIVERED`) |
| POST | `/deliveries/:id/confirm` | RIDER | Confirm with `{ confirmationCode }` |

No additional endpoints will be added for the Week 3 MVP.

---

## 5. Socket.IO Events & Sync Rules — LOCKED

### Connection

- Server attaches Socket.IO to the same HTTP server as Express
- Client connects to `http://localhost:5000`
- CORS origin for sockets: Vite app (`http://localhost:5173`)

### Events

| Event | Direction | When emitted | Payload |
|-------|-----------|--------------|---------|
| `delivery:updated` | Server → clients | After create, assign, status update, or confirm | Delivery object (or confirmation summary) |

### Sync rules

1. REST remains the source of truth for writes.
2. After a successful write, the server emits `delivery:updated`.
3. Connected clients refresh relevant UI from the event (or re-fetch).
4. MVP uses broadcast to connected clients (no private rooms yet).
5. Offline clients do not receive missed events; they re-sync on next successful REST load / reconnect.

---

## 6. QR Scanning / Order Confirmation Workflow — LOCKED

### MVP workflow (implemented)

1. Rider advances delivery to **DELIVERED**.
2. Rider enters the **QR confirmation code** for that order (manual entry representing a scanned QR payload).
3. Backend validates:
   - Rider owns the delivery
   - Status is `DELIVERED`
   - Delivery is not already confirmed
4. Backend inserts into `confirmations` with `confirmation_type = 'QR'`.
5. Server emits `delivery:updated` with confirmation details.
6. Retailer/dispatcher/rider UIs can show confirmation state.

### Explicit non-goals for freeze

- No camera QR library required for Week 3 demo
- No customer-facing confirmation app
- No SMS/WhatsApp confirmation channel

Camera-based scanning remains a **post-presentation roadmap** item; the data model already supports `QR`.

---

## 7. Delivery Confirmation Rules — LOCKED

1. Confirmation is allowed **only** when status is `DELIVERED`.
2. Only the **assigned rider** may confirm.
3. **One confirmation per delivery** (unique `delivery_id`).
4. `confirmation_code` is required and stored for proof/audit.
5. Status history already records who moved the delivery to `DELIVERED`; confirmation is separate proof-of-delivery evidence.
6. Re-confirmation returns conflict (already confirmed).

---

## 8. Deployment Platform — LOCKED (INTENT)

| Component | Presentation week | Intended hosting |
|-----------|-------------------|------------------|
| Frontend PWA | Local Vite (`5173`) | Vercel |
| Backend API + Socket.IO | Local Node (`5000`) | Render |
| MySQL | Local MySQL | Managed MySQL (e.g. Railway / Render MySQL) |

Presentation demo runs locally for reliability. Cloud deployment is planned, not a Week 3 feature expansion.

---

## 9. Offline / PWA Behavior — LOCKED

| Behavior | Decision |
|----------|----------|
| Installable PWA shell | In scope as progressive enhancement |
| Core delivery operations offline | **Out of scope** — create/assign/status/confirm require network |
| Cached static assets | Allowed via service worker when added |
| Offline queue / sync replay | **Deferred** to roadmap |
| Real-time while offline | Not available; user re-syncs when online |

Acceptable because small retailers and riders in the MVP are expected to have mobile data during active deliveries; reliability of the online workflow matters more than offline complexity for Week 3.

---

## 10. Documented Trade-offs (≥3) — LOCKED

### Trade-off 1 — One PWA instead of native apps

- **Chose:** Single responsive PWA for all roles/devices  
- **Rejected:** Separate Android/iOS apps + web  
- **Acceptable because:** One codebase fits an individual developer, covers phones and desktops, and still meets the brief’s device-agnostic requirement

### Trade-off 2 — Manual QR code entry instead of live camera scan

- **Chose:** Rider enters confirmation code after delivery  
- **Rejected:** Full camera QR scanning in MVP  
- **Acceptable because:** Schema and API already model QR confirmation; camera UX adds library/device complexity without changing the accountability story for the demo

### Trade-off 3 — Broadcast Socket.IO events instead of private rooms

- **Chose:** Emit `delivery:updated` to connected clients  
- **Rejected:** Per-role/per-user rooms and fine-grained ACLs on socket payloads  
- **Acceptable because:** MVP user count is small; REST auth still protects writes; rooms can be added later without changing the delivery model

### Trade-off 4 — JWT in browser storage instead of httpOnly cookies

- **Chose:** JWT in `localStorage` for SPA simplicity  
- **Rejected:** Cookie session flow with CSRF setup  
- **Acceptable because:** Faster to ship role-based SPA auth for Week 3; token lifetime is limited (1 day)

### Trade-off 5 — Online-required operations instead of offline-first

- **Chose:** Network required for workflow actions  
- **Rejected:** Offline queue with conflict resolution  
- **Acceptable because:** Offline sync is a large subsystem; Week 3 value is visibility and proof of delivery when connected

---

## 11. Scope Freeze Statement — LOCKED

**HARD FREEZE is now in effect.**

In scope for presentation:
- Role-based login
- Retailer creates delivery
- Dispatcher assigns rider
- Rider updates status and confirms delivery
- MySQL persistence + status history
- REST API + Socket.IO real-time updates
- Responsive PWA UI

Out of scope (do not add before presentation):
- Payments, maps/GPS tracking, chat, notifications marketplace
- Multi-branch inventory, analytics dashboards, admin CMS
- Native apps, camera QR SDK, offline write queue
- New roles beyond retailer / dispatcher / rider

Post-freeze work is limited to: bug fixes, reliability, testing, documentation, evidence, presentation, and rehearsal.

---

## 12. Presentation Storyboard (unchanged structure)

Narrative: **Problem → Solution → Architecture → Trade-offs → Roadmap**  
One key takeaway per slide (see original Day 1 document slides 1–10).

Use the locked decisions above for slides:
- Architecture / stack
- Delivery lifecycle
- Real-time sync & confirmation
- Trade-offs
- Roadmap (camera QR, rooms, offline queue, cloud deploy)

---

## 13. Day 1 Review Checklist — COMPLETE

- [x] Problem statement represented accurately
- [x] Three personas covered
- [x] Device-agnostic approach confirmed
- [x] PWA direction confirmed
- [x] Stack selected and defended
- [x] MVP scope minimized and frozen
- [x] Presentation follows Problem → Solution → Architecture → Trade-offs → Roadmap
- [x] Database schema locked
- [x] Auth & permissions locked
- [x] API endpoints locked
- [x] Socket.IO events locked
- [x] QR confirmation workflow locked
- [x] Confirmation rules locked
- [x] Deployment intent locked
- [x] Offline/PWA behavior locked
- [x] At least three trade-offs documented with acceptable-because justification

---

## 14. Reference

- Primary brief: “Reflex, The Readiness Sprint” — Week 3 project brief  
- Companion draft: `Reflex_Day_1_Project_Documentation.docx`  
- Implementation sources of truth: `Backend/database/schema.sql`, `Backend/src/routes/*`, `Frontend/src/routes/AppRoutes.jsx`
