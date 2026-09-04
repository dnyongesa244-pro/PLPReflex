# Reflex Frontend

React + Vite progressive web app for Reflex delivery management.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Environment

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For production, point these at your deployed backend (no trailing slash on socket URL).

## Demo flow

1. Login as `retailer@reflex.com` / `password123` → create a delivery (note the QR code)
2. Login as `dispatcher@reflex.com` → assign a rider
3. Login as `rider@reflex.com` → Picked Up → Delivered → enter the QR code to confirm

## Deploy (Vercel)

1. Import the Frontend repo
2. Set env:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Ensure Backend `CLIENT_ORIGIN` includes your Vercel URL
