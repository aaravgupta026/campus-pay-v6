import { useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import QrScannerPanel from '../components/common/QrScannerPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import { parseUpiQrPayload } from '../utils/upiQrParser'
import { addPendingPayment, getMostUsedUpiApp } from '../utils/transactions'
import './ScanQuickPayPage.css'

const APP_LABELS = {
  phonepe: 'PhonePe',
  gpay: 'Google Pay',
  paytm: 'Paytm',
  other: 'Default UPI Chooser',
}

export default function ScanQuickPayPage() {
  const [form, setForm] = useState({
    upiId: '',
    name: '',
    amount: '',
  })
  const [status, setStatus] = useState('')
  const [scanDialog, setScanDialog] = useState({
    open: false,
    upiId: '',
    name: '',
    amount: '',
  })
  const preferredApp = getMostUsedUpiApp('other')
  const preferredAppLabel = APP_LABELS[preferredApp] || APP_LABELS.other

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
    setScanDialog({
      open: true,
      upiId: parsed.upiId,
      name: parsed.name || 'Scanned Merchant',
      amount: '',
    })
    setStatus('QR captured. Enter amount in popup to continue.')
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
      app: preferredApp,
    })

    addPendingPayment({
      shopId: `quick-${Date.now()}`,
      shopName: form.name,
      upiId: form.upiId,
      amount,
      intentApp: preferredApp,
    })

    setStatus('UPI app launched with your most-used app. Confirm later from Pay tab pending icon.')
  }

  const handleScanDialogPay = () => {
    const amount = Number(scanDialog.amount)
    if (Number.isNaN(amount) || amount <= 0) {
      setStatus('Enter a valid amount in the scan popup.')
      return
    }

    launchUpiIntent({
      upiId: scanDialog.upiId,
      name: scanDialog.name,
      amount,
      note: `Quick Pay to ${scanDialog.name}`,
      app: preferredApp,
    })

    addPendingPayment({
      shopId: `quick-scan-${Date.now()}`,
      shopName: scanDialog.name,
      upiId: scanDialog.upiId,
      amount,
      intentApp: preferredApp,
    })

    setForm((prev) => ({
      ...prev,
      upiId: scanDialog.upiId,
      name: scanDialog.name,
      amount: String(amount),
    }))
    setScanDialog({ open: false, upiId: '', name: '', amount: '' })
    setStatus('UPI app launched from scanned QR. Confirm later from Pay tab pending icon.')
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

      {scanDialog.open ? (
        <div className="scan-dialog-overlay" role="presentation" onClick={() => setScanDialog({ open: false, upiId: '', name: '', amount: '' })}>
          <GlassPanel className="scan-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Pay Scanned Merchant</h3>
            <p className="scan-dialog-line"><strong>Name:</strong> {scanDialog.name}</p>
            <p className="scan-dialog-line"><strong>UPI:</strong> {scanDialog.upiId}</p>
            <p className="scan-dialog-preferred"><strong>Preferred App:</strong> {preferredAppLabel}</p>

            <label className="scan-dialog-field">
              <span>Enter Amount</span>
              <input
                type="number"
                min="1"
                placeholder="20"
                value={scanDialog.amount}
                onChange={(e) => setScanDialog((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </label>

            <button type="button" className="pay-now-btn" onClick={handleScanDialogPay}>Pay Now</button>
            <button type="button" className="scan-dialog-cancel" onClick={() => setScanDialog({ open: false, upiId: '', name: '', amount: '' })}>Cancel</button>
          </GlassPanel>
        </div>
      ) : null}
    </div>
  )
}
