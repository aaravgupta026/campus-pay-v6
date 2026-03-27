import { useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import QrScannerPanel from '../components/common/QrScannerPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import { parseUpiQrPayload } from '../utils/upiQrParser'
import { addPendingPayment } from '../utils/transactions'
import './ScanQuickPayPage.css'

export default function ScanQuickPayPage() {
  const [form, setForm] = useState({
    upiId: '',
    name: '',
    amount: '',
  })
  const [status, setStatus] = useState('')

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleQrScan = (rawText) => {
    const parsed = parseUpiQrPayload(rawText)
    if (!parsed.upiId) {
      setStatus('QR scanned but UPI ID could not be extracted. Please enter manually.')
      return
    }

    setForm((prev) => ({
      ...prev,
      upiId: parsed.upiId,
      name: parsed.name || prev.name,
    }))
    setStatus('QR captured successfully. Verify amount and tap Pay Now.')
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
      note: `Quick Pay to ${form.name}`,
    })

    addPendingPayment({
      shopId: `quick-${Date.now()}`,
      shopName: form.name,
      upiId: form.upiId,
      amount,
    })

    setStatus('UPI app launched. Please confirm this payment later from the Pay tab pending icon.')
  }

  return (
    <div className="scan-page">
      <h1>Scan / Quick Pay</h1>

      <GlassPanel>
        <QrScannerPanel
          onScan={handleQrScan}
          title="Scan UPI QR"
          helperText="Scan first to auto-fill merchant name and UPI ID in the quick pay form."
        />
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

          <button type="submit" className="pay-now-btn">Pay Now</button>
        </form>

        {status ? <p className="scan-status">{status}</p> : null}
      </GlassPanel>
    </div>
  )
}
