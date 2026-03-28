# Campus Pay V6 (Project Closure Snapshot)

Campus Pay V6 is a scan-first UPI utility PWA focused on fast QR-to-payment flow and local expense tracking.

## What Is Implemented

- Scan-first landing (`/scan`) and scan-priority bottom navigation.
- High-speed QR scanner flow with rear camera preference and high FPS.
- UPI QR parsing for merchant name (`pn`) and UPI ID (`pa`) auto-fill.
- One-tap UPI deep-link launch for payments.
- Local payment success logging to browser storage.
- Analytics powered by locally logged expenses.
- Premium black-gold UI system with compact mode toggle for Pay cards.
- New branded app logo integrated in favicon, header, and PWA manifest.

## Tech Stack and Tools Used

- React 18 + Vite 5: Frontend SPA framework and fast bundler.
- React Router v6: Route management and scan-first navigation.
- html5-qrcode: QR scanner integration (camera + parsing pipeline).
- Firebase SDK (present in project): Previously wired for auth scaffolding, but current closure mode is local-first.
- localStorage: Temporary persistence layer for shops, pending confirmations, and expense logs.
- Vercel config: SPA rewrite support for deployed routes.

## Why These Tools Were Used

- React + Vite: Fast development and production build performance.
- html5-qrcode: Practical browser-level QR camera support.
- localStorage: No backend dependency for closure build and quick testing.
- Router + PWA files: Mobile-like app behavior from web deployment.

## Backend Status

There is no active runtime backend server in this repository for current closure mode.

- `BACKEND_README.md` exists as architecture guidance and backend notes.
- Current running app behavior is frontend + browser storage driven.

## Important Limitation (UPI App Compatibility)

Some UPI apps may not reliably open or complete from web deep links due to platform and app-level restrictions.
This is generally controlled by:

- Android/iOS deep-link handling rules
- Browser security and intent policies
- UPI app anti-abuse/fraud checks for web-origin launches
- Device- or app-specific intent allowlists

Because of these restrictions, behavior can vary by app and device even when the same UPI link is correct.

## Run

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Docs Kept

- `FRONTEND_README.md`
- `BACKEND_README.md`
- `STATUS_HANDOFF.md`
- `README.md` (this closure summary)
