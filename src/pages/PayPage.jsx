import { useEffect, useMemo, useRef, useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import QrScannerPanel from '../components/common/QrScannerPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import { parseUpiQrPayload } from '../utils/upiQrParser'
import {
  addPendingPayment,
  deferPendingPayment,
  getConfirmedTransactions,
  getMostUsedUpiApp,
  getPendingPayments,
  getTopAmountsForShop,
  markPendingAs,
  removeTransactionById,
  requeuePendingPayment,
} from '../utils/transactions'
import './PayPage.css'

const SHOPS_STORAGE_KEY = 'campus_pay_v6_shop_config'
const COMPACT_VIEW_KEY = 'campus_pay_v6_compact_view'
const OPEN_PENDING_PANEL_KEY = 'campus_pay_v6_open_pending_panel'

const defaultShopConfig = [
  { id: 'ravechi', name: 'Ravechi', defaultUpi: '9724399962@okbizaxis' },
  { id: 'lafresco', name: 'La Fresco', defaultUpi: 'paytmqr6clwnr@ptys' },
  { id: 'yewale', name: 'Yewale', defaultUpi: 'gpay-11254199960@okbizaxis' },
  { id: 'amul', name: 'Amul', defaultUpi: 'vyapar.171649456201@hdfcbank' },
]

const loadShopState = () => {
  const raw = localStorage.getItem(SHOPS_STORAGE_KEY)
  if (!raw) {
    return defaultShopConfig
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultShopConfig
    }
    return parsed.map((shop) => ({
      id: shop.id,
      name: shop.name,
      defaultUpi: shop.defaultUpi,
    }))
  } catch {
    return defaultShopConfig
  }
}

export default function PayPage() {
  const [shops, setShops] = useState(loadShopState)
  const [customAmounts, setCustomAmounts] = useState({})
  const [statusText, setStatusText] = useState('')
  const [isCompactMode, setIsCompactMode] = useState(() => localStorage.getItem(COMPACT_VIEW_KEY) === 'true')
  const [historyVersion, setHistoryVersion] = useState(0)
  const undoTimerRef = useRef(null)
  const [undoInfo, setUndoInfo] = useState(null)
  const [pendingItems, setPendingItems] = useState([])
  const [activePendingPrompt, setActivePendingPrompt] = useState(null)
  const [showPendingCenter, setShowPendingCenter] = useState(false)
  const [addFlowStep, setAddFlowStep] = useState('closed')
  const [editFlow, setEditFlow] = useState({
    step: 'closed',
    shopId: '',
    shopName: '',
    upi: '',
  })
  const [newShop, setNewShop] = useState({
    name: '',
    upi: '',
  })

  useEffect(() => {
    localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(shops))
  }, [shops])

  useEffect(() => {
    localStorage.setItem(COMPACT_VIEW_KEY, String(isCompactMode))
  }, [isCompactMode])

  useEffect(() => {
    const nextPending = getPendingPayments()
    setPendingItems(nextPending)
    if (nextPending.length > 0) {
      setActivePendingPrompt(nextPending[0])
    }

    if (localStorage.getItem(OPEN_PENDING_PANEL_KEY) === 'true') {
      localStorage.removeItem(OPEN_PENDING_PANEL_KEY)
      setShowPendingCenter(true)
    }

    const openPendingHandler = () => setShowPendingCenter(true)
    window.addEventListener('campus-pay-open-pending', openPendingHandler)

    return () => {
      window.removeEventListener('campus-pay-open-pending', openPendingHandler)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }, [])

  const recommendedByShop = useMemo(() => {
    return shops.reduce((acc, shop) => {
      acc[shop.id] = getTopAmountsForShop(shop.name, [10, 20, 50])
      return acc
    }, {})
  }, [shops, historyVersion])

  const totalSpentByShop = useMemo(() => {
    return getConfirmedTransactions().reduce((acc, tx) => {
      const key = tx.shopName || ''
      if (!key) {
        return acc
      }
      acc[key] = (acc[key] || 0) + Number(tx.amount || 0)
      return acc
    }, {})
  }, [historyVersion, shops])

  const syncPendingUi = (focusFirst = false) => {
    const nextPending = getPendingPayments()
    setPendingItems(nextPending)
    if (focusFirst) {
      setActivePendingPrompt(nextPending[0] || null)
    }
  }

  const updateShop = (shopId, patch) => {
    setShops((prev) => prev.map((shop) => (shop.id === shopId ? { ...shop, ...patch } : shop)))
  }

  const deleteShop = (shopId) => {
    setShops((prev) => prev.filter((shop) => shop.id !== shopId))
    setStatusText('Shop removed from local list.')
  }

  const openEditFlow = (shop) => {
    setEditFlow({ step: 'choice', shopId: shop.id, shopName: shop.name, upi: shop.defaultUpi })
  }

  const onEditScan = (rawText) => {
    const parsed = parseUpiQrPayload(rawText)
    if (!parsed.upiId) {
      setStatusText('QR scanned, but UPI ID was not found in payload.')
      return
    }

    setEditFlow((prev) => ({ ...prev, step: 'manual', upi: parsed.upiId }))
    setStatusText('UPI pulled from QR. Review and save.')
  }

  const saveEditUpi = () => {
    if (!editFlow.upi.trim()) {
      setStatusText('UPI ID cannot be empty.')
      return
    }

    updateShop(editFlow.shopId, { defaultUpi: editFlow.upi.trim() })
    setEditFlow({ step: 'closed', shopId: '', shopName: '', upi: '' })
    setStatusText('UPI ID updated successfully.')
  }

  const triggerPayment = (shop, amountValue) => {
    const amount = Number(amountValue)
    if (Number.isNaN(amount) || amount <= 0) {
      setStatusText('Enter a valid amount before paying.')
      return
    }

    const preferredApp = getMostUsedUpiApp('other')

    launchUpiIntent({
      upiId: shop.defaultUpi,
      name: shop.name,
      amount,
      note: `${shop.name} payment`,
      app: preferredApp,
    })

    const pending = addPendingPayment({
      shopId: shop.id,
      shopName: shop.name,
      upiId: shop.defaultUpi,
      amount,
      intentApp: preferredApp,
    })

    syncPendingUi(false)
    setActivePendingPrompt((prev) => prev || pending)

    setStatusText(`Opening payment intent for ${shop.name} (Rs ${amount}). Please confirm later from pending icon.`)
  }

  const confirmPending = (decision, item) => {
    if (!item) {
      return
    }

    if (decision === 'later') {
      deferPendingPayment(item.id)
      syncPendingUi(false)
      setStatusText('Saved to pending confirmations. You can confirm it later.')
      if (activePendingPrompt?.id === item.id) {
        const latest = getPendingPayments()
        setActivePendingPrompt(latest[0] || null)
      }
      return
    }

    const recordedTx = markPendingAs(item.id, decision)
    syncPendingUi(false)
    setHistoryVersion((prev) => prev + 1)
    if (recordedTx) {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }

      setUndoInfo({
        txId: recordedTx.id,
        pendingSource: item,
      })

      undoTimerRef.current = setTimeout(() => {
        setUndoInfo(null)
      }, 5000)
    }

    setStatusText(decision === 'yes' ? 'Marked as paid. Undo available for 5s.' : 'Marked as not paid. Undo available for 5s.')
    if (activePendingPrompt?.id === item.id) {
      const latest = getPendingPayments()
      setActivePendingPrompt(latest[0] || null)
    }
  }

  const undoLastDecision = () => {
    if (!undoInfo) {
      return
    }

    removeTransactionById(undoInfo.txId)
    requeuePendingPayment({
      shopId: undoInfo.pendingSource.shopId,
      shopName: undoInfo.pendingSource.shopName,
      upiId: undoInfo.pendingSource.upiId,
      amount: undoInfo.pendingSource.amount,
      intentApp: undoInfo.pendingSource.intentApp || 'other',
    })

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
    }

    setUndoInfo(null)
    setHistoryVersion((prev) => prev + 1)
    syncPendingUi(true)
    setStatusText('Last decision reverted. Payment moved back to pending list.')
  }

  const onAddScan = (rawText) => {
    const parsed = parseUpiQrPayload(rawText)
    if (!parsed.upiId) {
      setStatusText('QR scanned, but UPI ID was not found.')
      return
    }

    setNewShop({ name: parsed.name || '', upi: parsed.upiId })
    setAddFlowStep('manual')
    setStatusText('QR parsed. Confirm details and save shop.')
  }

  const addCustomShop = () => {
    if (!newShop.name.trim() || !newShop.upi.trim()) {
      setStatusText('Shop name and UPI ID are required.')
      return
    }

    const generatedId = `${newShop.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
    const entry = {
      id: generatedId,
      name: newShop.name.trim(),
      defaultUpi: newShop.upi.trim(),
    }

    setShops((prev) => [...prev, entry])
    setNewShop({ name: '', upi: '' })
    setAddFlowStep('closed')
    setStatusText(`${entry.name} added to Nearby shops.`)
  }

  return (
    <div className={`pay-page ${isCompactMode ? 'v5-compact-mode' : ''}`}>
      <div className="pay-header-row">
        <h1>Nearby Payments</h1>
        <button type="button" className="pending-toggle" onClick={() => setShowPendingCenter((prev) => !prev)}>
          Pending
          {pendingItems.length > 0 ? <span className="pending-badge">{pendingItems.length}</span> : null}
        </button>
      </div>
      <p className="pay-subtitle">Nearby payments.</p>

      <div className="view-toggle-row">
        <button
          type="button"
          className={`view-toggle-btn ${isCompactMode ? 'active' : ''}`}
          onClick={() => setIsCompactMode(true)}
        >
          Compact View
        </button>
        <button
          type="button"
          className={`view-toggle-btn ${!isCompactMode ? 'active' : ''}`}
          onClick={() => setIsCompactMode(false)}
        >
          Default View
        </button>
      </div>

      {activePendingPrompt ? (
        <GlassPanel className="pending-prompt">
          <h3>Did you pay {activePendingPrompt.shopName} Rs {activePendingPrompt.amount}?</h3>
          <p>Confirm now or keep it in pending notifications.</p>
          <div className="pending-actions">
            <button type="button" className="mini-btn" onClick={() => confirmPending('yes', activePendingPrompt)}>Yes</button>
            <button type="button" className="mini-btn danger" onClick={() => confirmPending('no', activePendingPrompt)}>No</button>
            <button type="button" className="mini-btn muted" onClick={() => confirmPending('later', activePendingPrompt)}>Maybe Later</button>
          </div>
        </GlassPanel>
      ) : null}

      {undoInfo ? (
        <GlassPanel className="undo-panel">
          <p>Changed payment decision by mistake?</p>
          <button type="button" className="mini-btn" onClick={undoLastDecision}>Undo (5s)</button>
        </GlassPanel>
      ) : null}

      {showPendingCenter ? (
        <GlassPanel className="pending-center">
          <h3>Pending Payment Confirmations</h3>
          {pendingItems.length === 0 ? <p className="pending-empty">No pending confirmations.</p> : null}
          {pendingItems.map((item) => (
            <div className="pending-row" key={item.id}>
              <div>
                <strong>{item.shopName}</strong>
                <p>Rs {item.amount} • {new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="pending-actions compact">
                <button type="button" className="mini-btn" onClick={() => confirmPending('yes', item)}>Yes</button>
                <button type="button" className="mini-btn danger" onClick={() => confirmPending('no', item)}>No</button>
                <button type="button" className="mini-btn muted" onClick={() => confirmPending('later', item)}>Later</button>
              </div>
            </div>
          ))}
        </GlassPanel>
      ) : null}

      {shops.map((shop) => (
        <GlassPanel className="shop-card" key={shop.id}>
          <div className="shop-header">
            <div>
              <h2>{shop.name}</h2>
              <p className="shop-upi">UPI: {shop.defaultUpi}</p>
              <p className="shop-spent">Total Spent Here: Rs {Number(totalSpentByShop[shop.name] || 0).toFixed(0)}</p>
            </div>
          </div>

          <div className="chips-grid">
            {(recommendedByShop[shop.id] || [10, 20, 50]).map((amt) => (
              <button className="amount-chip" key={`${shop.id}-${amt}`} onClick={() => triggerPayment(shop, amt)}>
                Rs {amt}
              </button>
            ))}
          </div>

          <div className="custom-pay-row">
            <input
              type="number"
              min="1"
              placeholder="Custom amount"
              value={customAmounts[shop.id] || ''}
              onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [shop.id]: e.target.value }))}
              className="custom-input"
            />
            <button className="mini-btn" onClick={() => triggerPayment(shop, customAmounts[shop.id])}>
              Pay
            </button>
          </div>

          <div className="shop-actions">
            <button className="mini-btn muted" onClick={() => openEditFlow(shop)}>Edit UPI</button>
            <button className="mini-btn danger" onClick={() => deleteShop(shop.id)}>Delete Shop</button>
          </div>
        </GlassPanel>
      ))}

      <GlassPanel className="add-shop-panel">
        <h3>Add New Shop</h3>
        <button type="button" className="add-shop-btn" onClick={() => setAddFlowStep('choice')}>Add New Shop</button>
      </GlassPanel>

      {addFlowStep !== 'closed' ? (
        <div className="flow-modal-overlay" role="presentation" onClick={() => setAddFlowStep('closed')}>
          <GlassPanel className="flow-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Shop</h3>
            {addFlowStep === 'choice' ? (
              <div className="flow-options">
                <button type="button" className="add-shop-btn" onClick={() => setAddFlowStep('scan')}>Scan QR Code</button>
                <button type="button" className="mini-btn muted" onClick={() => setAddFlowStep('manual')}>Enter Manually</button>
              </div>
            ) : null}

            {addFlowStep === 'scan' ? (
              <div className="flow-section">
                <QrScannerPanel onScan={onAddScan} title="Scan Shop QR" helperText="Primary option: scan to auto-fill name and UPI." />
                <button type="button" className="mini-btn muted" onClick={() => setAddFlowStep('manual')}>Enter Manually Instead</button>
              </div>
            ) : null}

            {addFlowStep === 'manual' ? (
              <div className="flow-section add-shop-grid">
                <input
                  type="text"
                  placeholder="Shop Name"
                  value={newShop.name}
                  onChange={(e) => setNewShop((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="UPI ID"
                  value={newShop.upi}
                  onChange={(e) => setNewShop((prev) => ({ ...prev, upi: e.target.value }))}
                />
                <button type="button" className="add-shop-btn" onClick={addCustomShop}>Save Shop</button>
              </div>
            ) : null}

            <button type="button" className="mini-btn muted" onClick={() => setAddFlowStep('closed')}>Close</button>
          </GlassPanel>
        </div>
      ) : null}

      {editFlow.step !== 'closed' ? (
        <div className="flow-modal-overlay" role="presentation" onClick={() => setEditFlow({ step: 'closed', shopId: '', shopName: '', upi: '' })}>
          <GlassPanel className="flow-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit UPI: {editFlow.shopName}</h3>

            {editFlow.step === 'choice' ? (
              <div className="flow-options">
                <button type="button" className="add-shop-btn" onClick={() => setEditFlow((prev) => ({ ...prev, step: 'scan' }))}>Edit UPI Using QR Code</button>
                <button type="button" className="mini-btn muted" onClick={() => setEditFlow((prev) => ({ ...prev, step: 'manual' }))}>Edit UPI Manually</button>
              </div>
            ) : null}

            {editFlow.step === 'scan' ? (
              <div className="flow-section">
                <QrScannerPanel onScan={onEditScan} title="Scan Updated UPI QR" helperText="Primary option: scan QR to replace UPI ID." />
                <button type="button" className="mini-btn muted" onClick={() => setEditFlow((prev) => ({ ...prev, step: 'manual' }))}>Enter Manually Instead</button>
              </div>
            ) : null}

            {editFlow.step === 'manual' ? (
              <div className="flow-section add-shop-grid">
                <input
                  type="text"
                  placeholder="Updated UPI ID"
                  value={editFlow.upi}
                  onChange={(e) => setEditFlow((prev) => ({ ...prev, upi: e.target.value }))}
                />
                <button type="button" className="add-shop-btn" onClick={saveEditUpi}>Save UPI</button>
              </div>
            ) : null}

            <button type="button" className="mini-btn muted" onClick={() => setEditFlow({ step: 'closed', shopId: '', shopName: '', upi: '' })}>Close</button>
          </GlassPanel>
        </div>
      ) : null}

      {statusText ? <p className="pay-status">{statusText}</p> : null}
    </div>
  )
}
