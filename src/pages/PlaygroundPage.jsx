import GlassPanel from '../components/common/GlassPanel'
import './PlaygroundPage.css'

export default function PlaygroundPage({ onMessage }) {
  return (
    <div className="playground-page">
      <h1>🎮 Playground</h1>
      
      <GlassPanel className="playground-container">
        <p className="placeholder-text">Future features will be tested here</p>
        <div className="placeholder-content">
          {/* Intentionally empty for future development */}
        </div>
      </GlassPanel>
    </div>
  )
}
