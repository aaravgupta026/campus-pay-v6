import { useMemo, useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { launchUpiIntent } from '../utils/upiDeepLink'
import { addPendingPayment, getMostUsedUpiApp, getTransactionsSorted } from '../utils/transactions'
import './HistoryPage.css'

export default function HistoryPage() {
  const [shopFilter, setShopFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusText, setStatusText] = useState('')

  const transactions = useMemo(() => getTransactionsSorted(), [])

  const shops = useMemo(() => {
    return Array.from(new Set(transactions.map((tx) => tx.shopName).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return transactions.filter((tx) => {
      const txDate = new Date(tx.createdAt)
      const matchesShop = shopFilter === 'all' || tx.shopName === shopFilter
      const matchesStatus = statusFilter === 'all' || (tx.status || 'confirmed') === statusFilter

      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = txDate >= startOfToday
      } else if (dateFilter === 'week') {
        matchesDate = txDate >= startOfWeek
      } else if (dateFilter === 'month') {
        matchesDate = txDate >= startOfMonth
      }

      return matchesShop && matchesStatus && matchesDate
    })
  }, [transactions, shopFilter, statusFilter, dateFilter])

  const quickRepay = (tx) => {
    const preferredApp = getMostUsedUpiApp('gpay')
    launchUpiIntent({
      upiId: tx.upiId,
      name: tx.shopName,
      amount: Number(tx.amount || 0),
      note: `Repay to ${tx.shopName}`,
      app: preferredApp,
    })

    addPendingPayment({
      shopId: tx.shopName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `history-${Date.now()}`,
      shopName: tx.shopName || 'Merchant',
      upiId: tx.upiId,
      amount: Number(tx.amount || 0),
      intentApp: preferredApp,
    })

    setStatusText(`Repay intent launched for ${tx.shopName || 'merchant'}. Confirm from pending panel later.`)
  }

  return (
    <div className="history-page">
      <h1>Transaction History</h1>

      <GlassPanel className="history-filters">
        <h3>Filters</h3>
        <div className="history-filter-grid">
          <label>
            <span>Shop</span>
            <select value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
              <option value="all">All Shops</option>
              {shops.map((shop) => (
                <option key={shop} value={shop}>{shop}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </label>

          <label>
            <span>Date</span>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </label>
        </div>
      </GlassPanel>

      <GlassPanel className="history-list-panel">
        <h3>Transactions ({filteredTransactions.length})</h3>
        {filteredTransactions.length === 0 ? <p className="history-empty">No transactions for selected filters.</p> : null}

        {filteredTransactions.map((tx) => {
          const txDate = new Date(tx.createdAt)
          return (
            <div className="history-item" key={tx.id}>
              <div>
                <strong>{tx.shopName || 'Merchant'}</strong>
                <p>{tx.upiId || 'No UPI ID'}</p>
                <p>{txDate.toLocaleDateString('en-IN')} {txDate.toLocaleTimeString('en-IN')}</p>
                <p>Status: {tx.status || 'confirmed'} • App: {tx.appUsed || 'other'}</p>
              </div>
              <div className="history-actions">
                <span className="history-amount">Rs {Number(tx.amount || 0).toFixed(0)}</span>
                <button type="button" className="history-repay" onClick={() => quickRepay(tx)}>Quick Re-pay</button>
              </div>
            </div>
          )
        })}
      </GlassPanel>

      {statusText ? <p className="history-status">{statusText}</p> : null}
    </div>
  )
}
