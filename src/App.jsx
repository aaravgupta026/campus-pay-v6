import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import BottomNav from './components/layout/BottomNav'
import PayPage from './pages/PayPage'
import ScanQuickPayPage from './pages/ScanQuickPayPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import SnackbarHost from './components/common/SnackbarHost'
import { useAuth } from './context/AuthContext.jsx'

function AuthedRoutes() {
  const { user } = useAuth()
  const userLabel = user?.displayName || user?.email || (user?.isAnonymous ? 'Guest User' : 'User')

  return (
    <AppShell userLabel={userLabel}>
      <Routes>
        <Route path="/" element={<Navigate to="/scan" replace />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/scan" element={<ScanQuickPayPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/scan" replace />} />
      </Routes>
      <BottomNav />
    </AppShell>
  )
}

function App() {
  const { user, loading, isBypassMode } = useAuth()

  return (
    <Router>
      {loading ? <div className="boot-loader">Loading Campus Pay...</div> : null}
      {!loading ? (
        <Routes>
          <Route path="/*" element={isBypassMode || user ? <AuthedRoutes /> : <Navigate to="/scan" replace />} />
        </Routes>
      ) : null}
      <SnackbarHost snackbar={{ open: false, message: '', type: 'info' }} />
    </Router>
  )
}

export default App
