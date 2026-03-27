import { useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [feedback, setFeedback] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState('')

  const handleLogout = async () => {
    await logout()
  }

  const submitFeedback = () => {
    const cleanText = feedback.trim()
    if (!cleanText) {
      setFeedbackStatus('Write feedback before submitting.')
      return
    }

    const key = 'campus_pay_v6_feedback'
    const prev = JSON.parse(localStorage.getItem(key) || '[]')
    prev.push({ text: cleanText, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(prev))

    setFeedback('')
    setFeedbackStatus('Feedback saved. Thanks for improving Campus Pay.')
  }

  return (
    <div className="profile-page">
      <h1>Profile & Settings</h1>
      
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

      <GlassPanel className="account-actions-container">
        <h3>Account</h3>
        <div className="account-action-grid">
          <button type="button" className="action-btn">Change Password</button>
          <button type="button" className="action-btn">Update Email</button>
          <button type="button" className="action-btn muted">Forward Account Details</button>
        </div>
      </GlassPanel>

      <GlassPanel className="feedback-container">
        <h3>Feedback</h3>
        <div className="feedback-form">
          <label>
            <span>How can we improve your payment flow?</span>
            <textarea
              placeholder="Write your feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </label>
          <button type="button" className="action-btn" onClick={submitFeedback}>Submit Feedback</button>
          {feedbackStatus ? <p className="feedback-status">{feedbackStatus}</p> : null}
        </div>
      </GlassPanel>

      <GlassPanel className="actions-container">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </GlassPanel>
    </div>
  )
}
