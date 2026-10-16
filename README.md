# nfsu-kiosk
AI-enabled self-service library kiosk integrated with Koha 26 ILMS for National Forensic Sciences University (NFSU).

## Frontend

The frontend is a touch-friendly React + Vite + Tailwind application located in `./web`.

### Run Steps
```bash
cd web
npm install
npm run dev
```

- Accessible at: `http://localhost:5173`
- Configurable demo IDs: `web/src/demoIds.js`
- Supports `VITE_MOCK=true` or live backend on `http://127.0.0.1:4000`.
- Routes:
  - `/` — Self-Check Kiosk
  - `/?screen=staff` or header Staff pill — Staff Diagnostics Dashboard
  - `/?screen=gate` or header Gate Sim pill — Security Gate Simulator
  - `/?screen=face` or Face Login button — AI Face Liveness Detection

