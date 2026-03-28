import { useEffect, useMemo, useRef, useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import { parseUpiQrPayload } from '../utils/upiQrParser'
import { addLocalExpense } from '../utils/localExpenses'
import { getMostUsedUpiApp } from '../utils/transactions'
import './ScanQuickPayPage.css'

const SCAN_APP_PREF_KEY = 'campus_pay_v6_scan_preferred_app'

const APP_LABELS = {
  phonepe: 'PhonePe',
  gpay: 'Google Pay',
  paytm: 'Paytm',
  other: 'UPI Chooser',
}

const APP_OPTIONS = [
  { value: 'auto', label: 'Auto (Most Used)' },
  { value: 'gpay', label: 'Google Pay' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'paytm', label: 'Paytm' },
]

export default function ScanQuickPayPage() {
  const scannerRef = useRef(null)
  const [form, setForm] = useState({
    upiId: '',
    name: '',
    amount: '',
  })
  const [isScanning, setIsScanning] = useState(false)
  const [status, setStatus] = useState('')
  const [scanPreferredApp, setScanPreferredApp] = useState(() => localStorage.getItem(SCAN_APP_PREF_KEY) || 'auto')
  const readerId = useMemo(() => `scan-fast-reader-${Math.random().toString(36).slice(2, 9)}`, [])

  useEffect(() => {
    localStorage.setItem(SCAN_APP_PREF_KEY, scanPreferredApp)
  }, [scanPreferredApp])

  const autoApp = useMemo(() => getMostUsedUpiApp('gpay'), [status])
  const preferredApp = scanPreferredApp === 'auto' ? autoApp : scanPreferredApp
  const preferredAppLabel = APP_LABELS[preferredApp] || APP_LABELS.gpay
  const preferredAppDisplay = scanPreferredApp === 'auto' ? `${preferredAppLabel} (Auto)` : preferredAppLabel

  const stopScanner = async () => {
    const scanner = scannerRef.current
    if (!scanner) {
      setIsScanning(false)
      return
    }

    try {
      await scanner.stop()
    } catch {
      // Scanner can already be stopped.
    }

    try {
      await scanner.clear()
    } catch {
      // Ignore clear failure on teardown.
    }

    scannerRef.current = null
    setIsScanning(false)
  }

  const startScanner = async () => {
    if (isScanning) {
      return
    }

    setStatus('Starting rear camera...')
    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode(readerId)
    scannerRef.current = scanner

    const onScanSuccess = async (decodedText) => {
      const parsed = parseUpiQrPayload(decodedText)
      if (!parsed.upiId) {
        setStatus('Scanned code has no valid UPI ID. Try scanning again.')
        return
      }

      setForm((prev) => ({
        ...prev,
        upiId: parsed.upiId,
        name: parsed.name || prev.name || 'Scanned Merchant',
      }))

      setStatus('QR scanned instantly. Enter amount and tap Pay Now.')
      await stopScanner()
    }

    const config = {
      fps: 20,
      qrbox: { width: 260, height: 260 },
      aspectRatio: 1,
    }

    try {
      await scanner.start({ facingMode: { exact: 'environment' } }, config, onScanSuccess)
      setIsScanning(true)
      setStatus('Camera ready. Point at UPI QR.')
    } catch {
      try {
        await scanner.start({ facingMode: 'environment' }, config, onScanSuccess)
        setIsScanning(true)
        setStatus('Camera ready. Point at UPI QR.')
      } catch {
        setStatus('Camera could not start. Please refresh and allow camera permission.')
        await stopScanner()
      }
    }
  }

  useEffect(() => {
    startScanner()

    return () => {
      stopScanner()
    }
  }, [])

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
      note: `Quick Pay to ${form.name}`,
      app: preferredApp,
    })

    setStatus('UPI app launched. Waiting for payment confirmation...')
    setTimeout(() => {
      const success = window.confirm(`Did payment succeed?\n${form.name}\nRs ${amount}`)
      if (success) {
        addLocalExpense({
          shopName: form.name,
          upiId: form.upiId,
          amount,
        })
        setStatus('Payment marked successful and logged locally.')
        setForm((prev) => ({ ...prev, amount: '' }))
      } else {
        setStatus('Payment not marked as successful. No expense logged.')
      }
    }, 600)
  }

  return (
    <div className="scan-page">
      <h1>Scan & Pay Fast</h1>

      <GlassPanel>
        <h3>Hyper-Fast Scanner</h3>
        <p className="scan-hint">Rear camera • 20 fps • Instant parse</p>
        <div id={readerId} className="fast-scanner-view" />
        <div className="scan-actions">
          {!isScanning ? (
            <button type="button" className="pay-now-btn" onClick={startScanner}>Start Camera</button>
          ) : (
            <button type="button" className="scan-stop-btn" onClick={stopScanner}>Pause Camera</button>
          )}
        </div>
      </GlassPanel>

      <GlassPanel>
        <h3>Manual Quick Pay</h3>
        <label className="quick-preferred-app">
          <span>Preferred App</span>
          <select value={scanPreferredApp} onChange={(e) => setScanPreferredApp(e.target.value)}>
            {APP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <p className="quick-preferred-hint">Current preferred app: {preferredAppDisplay}</p>

        <form className="quick-pay-form" onSubmit={handlePayNow}>
          <label>
            <span>UPI ID (auto-filled from scan)</span>
            <input
              type="text"
              placeholder="merchant@upi"
              value={form.upiId}
              onChange={(e) => onChange('upiId', e.target.value)}
              readOnly
            />
          </label>

          <label>
            <span>Merchant Name (auto-filled from scan)</span>
            <input
              type="text"
              placeholder="Shop name"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              readOnly
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
