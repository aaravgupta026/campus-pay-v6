import GlassPanel from '../components/common/GlassPanel'
import './AdminPage.css'

export default function AdminPage({ onMessage }) {
  // TODO: Add role-based access guard here
  
  return (
    <div className="admin-page">
      <h1>⚙️ Admin Dashboard</h1>
      
      <GlassPanel className="admin-welcome">
        <h2>Welcome to Admin Dashboard</h2>
        <p className="placeholder-text">Admin features will be available here</p>
      </GlassPanel>

      <GlassPanel className="catalog-container">
        <h3>Shop Catalog Management</h3>
        <div className="placeholder-content">
          <p>Manage shops and categories here</p>
        </div>
      </GlassPanel>

      <GlassPanel className="feedback-review-container">
        <h3>User Feedback</h3>
        <div className="placeholder-content">
          <p>Review user feedback here</p>
        </div>
      </GlassPanel>

      <GlassPanel className="analytics-dashboard-container">
        <h3>Platform Analytics</h3>
        <div className="placeholder-content">
          <p>View platform analytics here</p>
        </div>
      </GlassPanel>
    </div>
  )
}
