# Campus Pay V6 - Status & Handoff Tracker

Project: Campus Pay V6 (Payment Assist + Expense Tracking PWA)
Current Phase: Phase 3 - Core Payment UI & Temporary Auth Bypass
Last Updated: 2026-03-28

## Current Snapshot

Phase 3 pivot was implemented to unblock product testing and demos without waiting for Firebase console fixes.

Completed now:
- Temporary auth bypass is active via mock user flow in AuthContext.
- Main app routes render directly in bypass mode.
- Bottom nav now uses: Pay, Scan, Analytics, Profile.
- New Scan / Quick Pay tab added.
- Pay tab rebuilt with localStorage-backed shops and in-app payment triggers.
- UPI deep-link utility added with app-specific scheme support and generic fallback.
- Premium black-gold theme applied across shell, nav, glass surfaces, and key pages.
- Production build validated successfully with npm run build.

## Build Verification

Most recent build result:
- Command: npm run build
- Status: PASS
- Output artifact summary:
  - dist/index.html generated
  - dist/assets CSS + JS bundles generated

## Implemented in Phase 3

1) Temporary Auth Bypass
- File: src/context/AuthContext.jsx
- Added bypass mode constants and mock authenticated user.
- Startup now resolves immediately in bypass mode.
- Login/logout actions become non-blocking no-op style when bypass is on.

2) Routing + Navigation
- Files: src/App.jsx, src/router/routes.jsx, src/components/layout/BottomNav.jsx
- Added /scan route and Scan tab.
- App shell remains accessible under bypass mode.

3) Pay Tab Local Shops Flow
- File: src/pages/PayPage.jsx
- Local storage key added for persistent shop data.
- Exact seeded defaults included:
  - Ram Canteen -> ramcanteen@oksbi
  - Blue Store -> bluestore@upi
  - Hostel Snacks -> hostelsnacks@ybl
  - Nescafe Corner -> nescafe@paytm
- Features added:
  - Per-shop preferred app selector
  - Amount quick chips
  - Custom amount input + pay
  - Edit UPI ID action
  - Delete shop action
  - Add new shop form

4) Scan / Quick Pay Page
- Files: src/pages/ScanQuickPayPage.jsx, src/pages/ScanQuickPayPage.css
- Added scanner placeholder UI.
- Added manual quick-pay form (merchant name, UPI ID, amount, app).

5) UPI Deep Link Launcher
- File: src/utils/upiDeepLink.js
- Added app mapping:
  - phonepe://pay
  - tez://upi/pay
  - paytmmp://pay
  - generic upi://pay fallback
- Added launch helper with preferred-app first attempt + fallback behavior.

6) Premium Black-Gold Theme Pass
- Updated files:
  - src/styles/index.css
  - src/components/common/GlassPanel.css
  - src/components/layout/AppShell.css
  - src/components/layout/BottomNav.css
  - src/pages/PayPage.css
  - src/pages/ScanQuickPayPage.css
  - src/pages/AnalyticsPage.css
  - src/pages/ProfilePage.css
  - src/pages/LoginPage.css
  - src/pages/AdminPage.css
  - src/pages/PlaygroundPage.css

## Known Tradeoffs (Intentional)

- Firebase auth remains temporarily bypassed by design.
- Scanner is currently placeholder UI (camera scanning integration pending).
- UPI deep-link launch behavior can vary by browser/device policy.

## Next Recommended Steps

1. Replace temporary bypass with real Firebase auth once console config is fixed.
2. Add QR camera scanning integration in Scan tab (html5-qrcode or equivalent).
3. Add form validation and stronger UPI ID checks before launch.
4. Add role-based admin guarding tied to profile/claims.
5. Add device-level test pass for deep links on Android/iOS.

## Quick Commands

- npm install
- npm run dev
- npm run build
- npm run preview
