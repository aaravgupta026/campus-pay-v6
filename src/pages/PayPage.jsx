import GlassPanel from '../components/common/GlassPanel'
import './PayPage.css'

export default function PayPage({ onMessage }) {
  return (
    <div className="pay-page">
      <h1>💳 Pay</h1>
      
      <GlassPanel className="shops-container">
        <h2>Nearby Shops</h2>
        <p className="placeholder-text">Shop listings will appear here</p>
        <div className="shops-list">
          {/* Shop cards will be rendered here */}
        </div>
      </GlassPanel>

      <GlassPanel className="amounts-container">
        <h3>Quick Amounts</h3>
        <div className="amount-chips">
          <button className="amount-chip">₹10</button>
          <button className="amount-chip">₹20</button>
          <button className="amount-chip">₹30</button>
          <button className="amount-chip">Custom</button>
        </div>
      </GlassPanel>

      <GlassPanel className="scanner-container">
        <h3>QR Scanner</h3>
        <div className="scanner-mount">
          <p className="placeholder-text">Camera will be mounted here</p>
        </div>
      </GlassPanel>
    </div>
  )
}
