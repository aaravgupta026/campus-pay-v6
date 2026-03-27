import GlassPanel from '../components/common/GlassPanel'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="profile-page">
      <h1>👤 Profile & Settings</h1>
      
      <GlassPanel className="user-info-container">
        <h2>User Information</h2>
        <div className="info-form">
          <label>
            <span>Name</span>
            <input type="text" value={user?.displayName || ''} placeholder="Your name" readOnly />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={user?.email || (user?.isAnonymous ? 'Guest' : '')} placeholder="your@email.com" readOnly />
          </label>
          <label>
            <span>City</span>
            <input type="text" placeholder="Your city" />
          </label>
          <label>
            <span>State</span>
            <input type="text" placeholder="Your state" />
          </label>
        </div>
      </GlassPanel>

      <GlassPanel className="upi-selector-container">
        <h3>Preferred UPI App</h3>
        <select className="upi-select">
          <option>Select UPI App</option>
          <option>Google Pay</option>
          <option>PhonePe</option>
          <option>Paytm</option>
          <option>BHIM</option>
        </select>
      </GlassPanel>

      <GlassPanel className="actions-container">
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </GlassPanel>
    </div>
  )
}
