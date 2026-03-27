import GlassPanel from '../components/common/GlassPanel'
import './AnalyticsPage.css'

export default function AnalyticsPage({ onMessage }) {
  return (
    <div className="analytics-page">
      <h1>📊 Analytics & Feedback</h1>
      
      <GlassPanel className="totals-container">
        <h2>Totals</h2>
        <div className="totals-grid">
          <div className="total-card">
            <span className="label">Total Spent</span>
            <span className="value">₹0</span>
          </div>
          <div className="total-card">
            <span className="label">Transactions</span>
            <span className="value">0</span>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="chart-container">
        <h3>UPI Split</h3>
        <p className="placeholder-text">Chart will be rendered here</p>
      </GlassPanel>

      <GlassPanel className="export-container">
        <h3>Export</h3>
        <button className="export-btn">📥 Download CSV</button>
      </GlassPanel>

      <GlassPanel className="feedback-container">
        <h3>Feedback</h3>
        <div className="feedback-form">
          <label>
            <span>What do you think?</span>
            <textarea placeholder="Your feedback..."></textarea>
          </label>
          <button className="submit-btn">Submit</button>
        </div>
      </GlassPanel>
    </div>
  )
}
