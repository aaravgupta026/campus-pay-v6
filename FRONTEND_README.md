# Campus Pay V6 - Frontend README

## Overview
Campus Pay V6 is a mobile-first PWA (Progressive Web App) serving as a payment-assist and expense-tracking platform for Indian college students. This frontend is built with React 18 + Vite, featuring a glassmorphism design aesthetic, fixed bottom navigation with 4 tabs, and full PWA capabilities including installability on iOS/Android.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **Styling**: CSS3 (Glassmorphism, Backdrop Filter)
- **Backend**: Google Cloud Console (GCP) + Firestore (not Firebase SDK)
- **PWA**: Service Worker, Web Manifest, Offline support
- **QR Scanner**: html5-qrcode (5 FPS max, immediate teardown)
- **Deployment**: Vercel

## Project Structure
```
.
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx          # Mobile container + desktop framing
│   │   │   ├── AppShell.css
│   │   │   ├── BottomNav.jsx         # Fixed 4-tab navigation
│   │   │   └── BottomNav.css
│   │   └── common/
│   │       ├── GlassPanel.jsx        # Reusable frosted surface
│   │       ├── GlassPanel.css
│   │       ├── SnackbarHost.jsx      # Global toast/status host
│   │       └── SnackbarHost.css
│   ├── pages/
│   │   ├── PayPage.jsx               # Tab 1: Shop + amounts + QR scanner
│   │   ├── PayPage.css
│   │   ├── AnalyticsPage.jsx         # Tab 2: Totals + charts + export + feedback
│   │   ├── AnalyticsPage.css
│   │   ├── ProfilePage.jsx           # Tab 3: User info + UPI app selector + logout
│   │   ├── ProfilePage.css
│   │   ├── PlaygroundPage.jsx        # Tab 4: Translucent empty
│   │   ├── PlaygroundPage.css
│   │   ├── AdminPage.jsx             # Admin-only dashboard
│   │   └── AdminPage.css
│   ├── services/
│   │   ├── authService.js            # Auth + session hydration (GCP)
│   │   └── firestoreService.js       # Firestore collection wrappers
│   ├── router/
│   │   └── routes.jsx                # Route table + guards
│   ├── styles/
│   │   └── index.css                 # Global + design tokens
│   ├── App.jsx                       # Route composition + snackbar state
│   └── main.jsx                      # Bootstrap + PWA registration
├── public/
│   ├── manifest.webmanifest          # PWA metadata + install icons
│   └── sw.js                         # Service Worker (cache + offline)
├── index.html                        # Entry point + PWA headers
├── vite.config.js                    # Build + dev config
├── package.json
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn

### Installation
```bash
# Navigate to project directory
cd Campus_pay_v6

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## UI/UX Architecture

### Glassmorphism Design System
- **Glass Panel** (`GlassPanel.jsx`): Reusable component with blur + transparency
  - Background: `rgba(255, 255, 255, 0.05)`
  - Backdrop: `backdrop-filter: blur(20px)`
  - Border: `rgba(255, 255, 255, 0.1)`
  - Border Radius: `20px`

### Mobile-First Responsiveness
- **Phone Viewport**: Full-width, all content accessible
- **Tablet/Desktop** (>480px): Centered frame with max-width 480px, rounded corners
- **Safe Area**: Handles notches on iOS (env(safe-area-inset-*))

### Fixed Bottom Navigation
- **4 Tabs**: Pay, Analytics, Profile, Playground
- **Active State**: Underline accent + color change
- **Admin**: Separate route with role guard (placeholder)
- **Position**: Fixed over content, safe-area-inset-bottom on mobile

## Component Usage

### GlassPanel
```jsx
import GlassPanel from '@/components/common/GlassPanel'

<GlassPanel className="custom-class">
  <h2>Title</h2>
  <p>Content goes here</p>
</GlassPanel>
```

### BottomNav
Automatically handled by App.jsx with route integration.

### SnackbarHost
Show status messages:
```jsx
showSnackbar('Payment pending...', 'info')
showSnackbar('Transaction complete!', 'success')
showSnackbar('Error occurred', 'error')
```

## PWA Features

### Installability
- Supported on iOS (via Web App) and Android (Chrome)
- Install icon + splash screen from manifest
- Standalone mode (no browser UI)

### Service Worker
- **Cache Strategy**: Cache-first for static assets, network-first for API
- **Offline Fallback**: 503 page when network unavailable
- **Background Sync**: Queues failed requests for retry

### Web Manifest
Located at `public/manifest.webmanifest`:
- App name, icons, colors
- Start URL, display mode, orientation
- Shortcuts for quick access

## Environment Variables
**None required for Phase 1** (placeholders only)

For Phase 2+ add:
```
VITE_GCP_PROJECT_ID=your_project_id
VITE_GCP_API_KEY=your_api_key
VITE_FIRESTORE_DB=your_database_id
```

**Never commit secrets** — use `.env.local` (already in .gitignore)

## Development Tips
1. **Hot Module Reload (HMR)**: Changes auto-refresh in browser
2. **Mobile Testing**: Use Chrome DevTools device emulation
3. **PWA Testing**: DevTools → Application → Service Workers
4. **Offline Testing**: DevTools → Network → Offline checkbox

## Known Limitations (Phase 1)
- ❌ No real payment processing yet
- ❌ No QR scanner integration
- ❌ No auth UI (auth service stubbed)
- ❌ No Firestore queries (data service stubbed)
- ❌ Admin route not role-gated
- ❌ Charts/export not functional

## Next Steps (Phase 2+)
1. Google Cloud Console + Firestore authentication
2. QR scanner with html5-qrcode
3. Payment pending UX + undo toast
4. Deep link routing (phonepe://, tez://, etc.)
5. Analytics calculations + CSV export
6. Admin catalog management
7. Feedback collection + review

## Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
```

### PWA Not Installing
- Check manifest at: http://localhost:3000/manifest.webmanifest
- Ensure HTTPS in production (required by PWA spec)
- Test in DevTools → Application → Manifest

### Service Worker Issues
- Check DevTools → Service Workers
- Press "Unregister" and refresh if stuck
- View logs in DevTools → Console

## Performance Notes
- Bundle size optimized with Vite tree-shaking
- Critical CSS inlined in index.html
- Images lazyload via browser native loading
- Mock data prevents Firestore overages during development

## Resources
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [PWA Checklist](https://web.dev/pwa-checklist)
- [Glassmorphism Design](https://glassmorphism.com)
- [React Router v6](https://reactrouter.com)
