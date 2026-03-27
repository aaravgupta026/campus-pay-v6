import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import BottomNav from './components/layout/BottomNav'
import PayPage from './pages/PayPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import PlaygroundPage from './pages/PlaygroundPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import SnackbarHost from './components/common/SnackbarHost'
import { useAuth } from './context/AuthContext.jsx'

function AuthedRoutes() {
  const { user } = useAuth()
  const userLabel = user?.displayName || user?.email || (user?.isAnonymous ? 'Guest User' : 'User')

  return (
    <AppShell userLabel={userLabel}>
      <Routes>
        <Route path="/" element={<Navigate to="/pay" replace />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/pay" replace />} />
      </Routes>
      <BottomNav />
    </AppShell>
  )
}

function App() {
  const { user, loading } = useAuth()

  return (
    <Router>
      {loading ? <div className="boot-loader">Loading Campus Pay...</div> : null}
      {!loading ? (
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/pay" replace />} />
          <Route path="/*" element={user ? <AuthedRoutes /> : <Navigate to="/login" replace />} />
        </Routes>
      ) : null}
      <SnackbarHost snackbar={{ open: false, message: '', type: 'info' }} />
    </Router>
  )
}

export default App
