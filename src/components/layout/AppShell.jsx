import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPendingPayments } from '../../utils/transactions'
import './AppShell.css'

const OPEN_PENDING_PANEL_KEY = 'campus_pay_v6_open_pending_panel'

export default function AppShell({ children, userLabel }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const syncCount = () => setPendingCount(getPendingPayments().length)

    syncCount()
    const intervalId = setInterval(syncCount, 1500)
    window.addEventListener('storage', syncCount)
    window.addEventListener('focus', syncCount)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('storage', syncCount)
      window.removeEventListener('focus', syncCount)
    }
  }, [location.pathname])

  const openPendingCenter = () => {
    localStorage.setItem(OPEN_PENDING_PANEL_KEY, 'true')
    if (location.pathname.startsWith('/pay')) {
      window.dispatchEvent(new Event('campus-pay-open-pending'))
      return
    }
    navigate('/pay')
  }

  return (
    <div className="app-container">
      <div className="app-frame">
        <header className="app-header-glass">
          <div className="header-row">
            <div>
              <div className="brand-title">Campus Pay V6</div>
              <div className="brand-subtitle">Hello, {userLabel}</div>
            </div>
            <button type="button" className="header-bell" onClick={openPendingCenter}>
              Pending
              {pendingCount > 0 ? <span className="header-bell-badge">{pendingCount}</span> : null}
            </button>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
