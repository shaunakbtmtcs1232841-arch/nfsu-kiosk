# NFSU Library Self-Check Kiosk — Frontend

Modern, accessible, AI-enabled self-service library kiosk frontend built for the National Forensic Sciences University (NFSU), Gandhinagar. Integrated with Koha 26 Integrated Library Management System via SIP2 backend protocol.

## Features

- **P0 Core Circulation Flow**:
  - **Patron Identification**: MIFARE smart cards, barcode scanner keyboard wedge, on-screen touch keypad modal.
  - **Borrowing (Checkout)**: Live scanned feed with Koha confirmation status, due dates, duplicate prevention.
  - **Returns (Check-in)**: Open-access material return, sort bin routing, hold shelf alerts.
  - **Receipt & Summary**: 80mm POS thermal receipt (`window.print`) and digital QR slip.
  - **Privacy & Safety**: In-memory session tokens only, 60s inactivity auto-wipe with 10s warning countdown.
  - **WebAudio Cues**: Synthesized affirmative chimes, barcode scan beeps, and warning buzzers.
- **P1 Institutional Enhancements**:
  - **i18n Multilingual**: English, Hindi (हिंदी), and Gujarati (ગુજરાતી).
  - **Voice Guidance**: Web Speech API audio assistance in selected language.
  - **Staff Circulation Console (`/staff`)**: Real-time Koha latency, statistics, live SSE recent transactions feed, RFID tag broadcasting.
  - **Security Gate Simulator (`/gate`)**: 13.56 MHz RFID AFI / EAS security gate simulator with visual pedestals and alarm / clear verification.
- **P2 AI Face Liveness**:
  - **MediaPipe Tasks Vision**: Real-time face landmarker challenge-response (blink twice + head turn) anti-spoofing verification with zero image storage.

## Run Commands

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Run with Mock Mode (Self-Contained Demo)
```bash
# In ./web
npm run dev
# Or with explicit mock environment variable:
# VITE_MOCK=true npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 3. Run against Real Backend on Port 4000
Start your backend server on `http://127.0.0.1:4000`, then:
```bash
cd web
npm run dev
```
The Vite proxy automatically forwards:
- `/api` → `http://127.0.0.1:4000/api`
- `/api/events` (SSE) → `http://127.0.0.1:4000/api/events`

### 4. Build for Production
```bash
npm run build
npm run preview
```

## Demo Configuration
Demo patron IDs and book barcodes can be configured in a single place:
[`web/src/demoIds.js`](src/demoIds.js)
Defaults:
- Patrons: `NFSU2026001` (Aarav), `NFSU2026002` (Dr. Priya), `NFSU2026099` (Blocked)
- Items: `NFSU-B-0001` … `NFSU-B-0005`
