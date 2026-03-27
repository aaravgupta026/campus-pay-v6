import { useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import './ScanQuickPayPage.css'

export default function ScanQuickPayPage() {
  const [form, setForm] = useState({
    upiId: '',
    name: '',
    amount: '',
    app: 'other',
  })
  const [status, setStatus] = useState('')

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePayNow = (event) => {
    event.preventDefault()

    const amount = Number(form.amount)
    if (!form.upiId || !form.name || Number.isNaN(amount) || amount <= 0) {
      setStatus('Enter valid UPI ID, name, and amount.')
      return
    }

    launchUpiIntent({
      upiId: form.upiId,
      name: form.name,
      amount,
      app: form.app,
      note: `Quick Pay to ${form.name}`,
    })

    setStatus('UPI app launched. If one app fails, chooser should open via generic UPI intent.')
  }

  return (
    <div className="scan-page">
      <h1>Scan / Quick Pay</h1>

      <GlassPanel>
        <h3>Scanner Placeholder</h3>
        <div className="scan-box">QR Scanner preview will be mounted here in next phase.</div>
      </GlassPanel>

      <GlassPanel>
        <h3>Manual Quick Pay</h3>
        <form className="quick-pay-form" onSubmit={handlePayNow}>
          <label>
            <span>Enter UPI ID</span>
            <input
              type="text"
              placeholder="merchant@upi"
              value={form.upiId}
              onChange={(e) => onChange('upiId', e.target.value)}
            />
          </label>

          <label>
            <span>Enter Name</span>
            <input
              type="text"
              placeholder="Shop name"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </label>

          <label>
            <span>Amount</span>
            <input
              type="number"
              min="1"
              placeholder="50"
              value={form.amount}
              onChange={(e) => onChange('amount', e.target.value)}
            />
          </label>

          <label>
            <span>Pay using</span>
            <select value={form.app} onChange={(e) => onChange('app', e.target.value)}>
              <option value="phonepe">PhonePe</option>
              <option value="gpay">GPay</option>
              <option value="paytm">Paytm</option>
              <option value="other">Other UPI Apps (Chooser)</option>
            </select>
          </label>

          <button type="submit" className="pay-now-btn">Pay Now</button>
        </form>

        {status ? <p className="scan-status">{status}</p> : null}
      </GlassPanel>
    </div>
  )
}
