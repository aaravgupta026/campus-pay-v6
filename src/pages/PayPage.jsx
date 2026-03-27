import { useEffect, useMemo, useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import './PayPage.css'

const SHOPS_STORAGE_KEY = 'campus_pay_v6_shop_config'

const defaultShopConfig = [
  { id: 'ravechi', name: 'Ravechi', defaultUpi: '9724399962@okbizaxis', defaultApp: 'phonepe', defaultAmts: [10, 20, 30] },
  { id: 'lafresco', name: 'La Fresco', defaultUpi: 'paytmqr6clwnr@ptys', defaultApp: 'gpay', defaultAmts: [20, 30, 50] },
  { id: 'yewale', name: 'Yewale', defaultUpi: 'gpay-11254199960@okbizaxis', defaultApp: 'paytm', defaultAmts: [10, 15, 20] },
  { id: 'amul', name: 'Amul', defaultUpi: 'vyapar.171649456201@hdfcbank', defaultApp: 'phonepe', defaultAmts: [15, 25, 40] },
]

const appOptions = [
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'gpay', label: 'GPay' },
  { value: 'paytm', label: 'Paytm' },
  { value: 'other', label: 'Default UPI / Other Apps' },
]

const loadShopState = () => {
  const raw = localStorage.getItem(SHOPS_STORAGE_KEY)
  if (!raw) {
    return defaultShopConfig.map((shop) => ({ ...shop, selectedApp: shop.defaultApp }))
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultShopConfig.map((shop) => ({ ...shop, selectedApp: shop.defaultApp }))
    }
    return parsed
  } catch {
    return defaultShopConfig.map((shop) => ({ ...shop, selectedApp: shop.defaultApp }))
  }
}

export default function PayPage() {
  const [shops, setShops] = useState(loadShopState)
  const [customAmounts, setCustomAmounts] = useState({})
  const [statusText, setStatusText] = useState('')
  const [newShop, setNewShop] = useState({
    name: '',
    upi: '',
    defaultApp: 'other',
    defaultAmts: '10,20,30',
  })

  useEffect(() => {
    localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(shops))
  }, [shops])

  const totalShops = useMemo(() => shops.length, [shops])

  const updateShop = (shopId, patch) => {
    setShops((prev) => prev.map((shop) => (shop.id === shopId ? { ...shop, ...patch } : shop)))
  }

  const deleteShop = (shopId) => {
    setShops((prev) => prev.filter((shop) => shop.id !== shopId))
    setStatusText('Shop removed from local list.')
  }

  const handleEditUpi = (shop) => {
    const nextUpi = window.prompt(`Edit UPI for ${shop.name}`, shop.defaultUpi)
    if (nextUpi && nextUpi.trim()) {
      updateShop(shop.id, { defaultUpi: nextUpi.trim() })
      setStatusText(`${shop.name} UPI updated.`)
    }
  }

  const triggerPayment = (shop, amountValue) => {
    const amount = Number(amountValue)
    if (Number.isNaN(amount) || amount <= 0) {
      setStatusText('Enter a valid amount before paying.')
      return
    }

    launchUpiIntent({
      upiId: shop.defaultUpi,
      name: shop.name,
      amount,
      app: shop.selectedApp || shop.defaultApp || 'other',
      note: `${shop.name} payment`,
    })

    setStatusText(`Opening payment intent for ${shop.name} (Rs ${amount}).`)
  }

  const addCustomShop = () => {
    if (!newShop.name.trim() || !newShop.upi.trim()) {
      setStatusText('Shop name and UPI ID are required.')
      return
    }

    const parsedAmts = newShop.defaultAmts
      .split(',')
      .map((val) => Number(val.trim()))
      .filter((val) => !Number.isNaN(val) && val > 0)

    const generatedId = `${newShop.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
    const entry = {
      id: generatedId,
      name: newShop.name.trim(),
      defaultUpi: newShop.upi.trim(),
      defaultApp: newShop.defaultApp,
      selectedApp: newShop.defaultApp,
      defaultAmts: parsedAmts.length ? parsedAmts : [10, 20, 30],
    }

    setShops((prev) => [...prev, entry])
    setNewShop({ name: '', upi: '', defaultApp: 'other', defaultAmts: '10,20,30' })
    setStatusText(`${entry.name} added to Nearby shops.`)
  }

  return (
    <div className="pay-page">
      <h1>Nearby Payments</h1>
      <p className="pay-subtitle">{totalShops} shops ready for one-tap UPI payments.</p>

      {shops.map((shop) => (
        <GlassPanel className="shop-card" key={shop.id}>
          <div className="shop-header">
            <div>
              <h2>{shop.name}</h2>
              <p className="shop-upi">UPI: {shop.defaultUpi}</p>
            </div>
            <select
              value={shop.selectedApp || shop.defaultApp}
              onChange={(e) => updateShop(shop.id, { selectedApp: e.target.value })}
              className="shop-app-select"
            >
              {appOptions.map((app) => (
                <option key={app.value} value={app.value}>
                  {app.label}
                </option>
              ))}
            </select>
          </div>

          <div className="chips-grid">
            {shop.defaultAmts.map((amt) => (
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
            <button className="mini-btn muted" onClick={() => handleEditUpi(shop)}>Edit UPI</button>
            <button className="mini-btn danger" onClick={() => deleteShop(shop.id)}>Delete Shop</button>
          </div>
        </GlassPanel>
      ))}

      <GlassPanel className="add-shop-panel">
        <h3>Add New Shop</h3>
        <div className="add-shop-grid">
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
          <select
            value={newShop.defaultApp}
            onChange={(e) => setNewShop((prev) => ({ ...prev, defaultApp: e.target.value }))}
          >
            {appOptions.map((app) => (
              <option key={app.value} value={app.value}>{app.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Quick amounts (e.g. 20,30,50)"
            value={newShop.defaultAmts}
            onChange={(e) => setNewShop((prev) => ({ ...prev, defaultAmts: e.target.value }))}
          />
        </div>
        <button className="add-shop-btn" onClick={addCustomShop}>Add New Shop</button>
      </GlassPanel>

      {statusText ? <p className="pay-status">{statusText}</p> : null}
    </div>
  )
}
