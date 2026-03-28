import { useLocation, useNavigate } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { id: 'scan', label: 'Scan', icon: '📷', path: '/scan' },
    { id: 'pay', label: 'Pay', icon: '💳', path: '/pay' },
    { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
  ]

  const handleTabClick = (tab) => navigate(tab.path)

  const activeTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.id || 'scan'

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${tab.id === 'scan' ? 'scan-primary' : ''} ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
