# Campus Pay V6 - Status & Handoff Tracker

Project: Campus Pay V6 (Payment Assist + Expense Tracking PWA)
Current Phase: Phase 3 Finalization - QR + Confirmation + Analytics
Last Updated: 2026-03-28

## Current Snapshot

Phase 3 UX/data refinements are now implemented to make the app feel production-like even under auth bypass mode.

Completed now:
- QR-first flows added for Add Shop and Edit UPI actions.
- Real camera QR scanner integrated using html5-qrcode.
- Scanner cleanup implemented to stop and clear camera on scan/close/unmount.
- Preferred app behavior is now user-aware: most-used app default with manual override in Scan/Quick Pay.
- Dynamic quick amount chips now use top 3 most frequent confirmed amounts per shop.
- Pending payment confirmation flow added (Yes / No / Maybe Later).
- Persistent pending notification icon added in Pay tab.
- Feedback moved from Analytics to Profile.
- Profile now includes Account placeholders: Change Password, Update Email, Forward Account Details.
- Analytics rebuilt as data-only with totals, per-shop breakdown, and CSV export.
- Analytics now includes per-shop monthly transaction dropdowns (date/time and amount details).
- Advanced CSV export added with status and app-used metadata.
- Global pending bell added in header for all tabs.
- Transaction History page added with filters (shop/date/status) and Quick Re-pay action.
- Undo window added after Yes/No payment confirmation decisions (5 seconds).
- Scanner now supports camera fallback via QR image upload.

## Build Verification

Most recent build target:
- Command: npm run build
- Status: PASS
- Notes: Build succeeds; Vite still reports large chunk warning (>500 kB) due to app bundle size.

## Latest Feature Batch (Current)

- Per-shop analytics dropdown:
  - In Analytics, each shop row now has expandable `This Month Transactions` details.
  - Shows exact day/time and amount per monthly transaction.
- Global pending access:
  - Header bell displays pending count and opens pending center from any tab.
- Transaction history route:
  - New page with filters for shop, status, and time range.
  - Includes `Quick Re-pay` action that launches UPI and re-adds pending confirmation.
- Undo support:
  - After marking pending payment as Yes/No, an undo panel appears for 5 seconds.
  - Undo restores payment to pending queue.
- Scanner resilience and performance:
  - QR scanner now lazy-loads `html5-qrcode` to improve initial load behavior.
  - If camera access fails, users can upload a QR image and decode it.

## Compact Mode Toggle (New)

- Added a quick-access dual toggle on Pay screen: `Compact View` and `Default View`.
- Toggle state is persisted via localStorage key `campus_pay_v6_compact_view`.
- `Compact View` applies a dedicated `.v5-compact-mode` class path to Pay layout.
- V5 compact mode changes structure density (smaller spacing, fonts, chip size, tighter card actions) while preserving premium black/gold/red color language.
- Re-integrated per-shop tracker line in card header: `Total Spent Here: Rs X`.
- Files updated for this:
  - `src/pages/PayPage.jsx`
  - `src/pages/PayPage.css`

## Implemented in This Final Pass

1) QR-First Input Priority
- Files:
  - src/components/common/QrScannerPanel.jsx
  - src/components/common/QrScannerPanel.css
  - src/pages/PayPage.jsx
  - src/pages/ScanQuickPayPage.jsx
  - src/utils/upiQrParser.js
- Add and Edit flows now present Scan QR Code as primary, Enter Manually as secondary.

2) Payment Confirmation Workflow (New)
- Files:
  - src/pages/PayPage.jsx
  - src/utils/transactions.js
- Every payment attempt creates a pending confirmation record.
- On next open, users are asked: Did you pay {shop} Rs {amount}?
- Decisions:
  - Yes -> recorded as confirmed transaction
  - No -> recorded as declined transaction
  - Maybe Later -> remains in pending list
- Pending items remain available in a persistent pending notification panel.

3) Dynamic Quick Amount Recommendations
- Files:
  - src/pages/PayPage.jsx
  - src/utils/transactions.js
- Top 3 chips are computed from confirmed shop history.
- Fallback remains [10, 20, 50] when no history exists.

4) Analytics + CSV
- Files:
  - src/pages/AnalyticsPage.jsx
  - src/pages/AnalyticsPage.css
  - src/utils/transactions.js
- Added widgets:
  - Total Spent Overall
  - Total Spent This Month
  - Total Spent This Year
  - Transactions count
- Added Total Spent per Shop list with overall/month/year values.
- CSV export includes raw columns:
  - Date, Time, Shop Name, UPI ID, Amount

5) Profile Restructure
- Files:
  - src/pages/ProfilePage.jsx
  - src/pages/ProfilePage.css
- Removed Preferred UPI App selector.
- Added Account action placeholders.
- Moved feedback form into Profile.

6) UPI Deep Link Simplification
- File: src/utils/upiDeepLink.js
- Transactions now always trigger generic upi://pay intent for OS-level app chooser behavior.

## Notes

- Auth bypass remains intentional for current phase.
- QR parsing supports UPI payload links and direct UPI IDs.
- Confirmed transactions drive analytics and recommendation chips.

## Next Recommended Steps

1. Re-enable Firebase auth once console config is stable.
2. Add optional camera permission education UI when scanner access is denied.
3. Add strict input validation for shop names and UPI IDs.
4. Add optional filters in analytics (today/week/month range picker).
