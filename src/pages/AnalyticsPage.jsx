import { useMemo } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { getConfirmedTransactions } from '../utils/transactions'
import './AnalyticsPage.css'

const sumAmount = (items) => items.reduce((total, item) => total + Number(item.amount || 0), 0)

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`

export default function AnalyticsPage() {
  const transactions = useMemo(() => getConfirmedTransactions(), [])
  const now = new Date()

  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.createdAt)
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
    })
  }, [transactions, now])

  const yearTransactions = useMemo(() => {
    return transactions.filter((tx) => new Date(tx.createdAt).getFullYear() === now.getFullYear())
  }, [transactions, now])

  const byShop = useMemo(() => {
    const bucket = new Map()

    transactions.forEach((tx) => {
      const key = tx.shopName || 'Unknown Shop'
      if (!bucket.has(key)) {
        bucket.set(key, { shopName: key, overall: 0, month: 0, year: 0, count: 0 })
      }

      const row = bucket.get(key)
      const amount = Number(tx.amount || 0)
      const txDate = new Date(tx.createdAt)
      const sameYear = txDate.getFullYear() === now.getFullYear()
      const sameMonth = sameYear && txDate.getMonth() === now.getMonth()

      row.overall += amount
      row.count += 1
      if (sameYear) {
        row.year += amount
      }
      if (sameMonth) {
        row.month += amount
      }
    })

    return Array.from(bucket.values()).sort((a, b) => b.overall - a.overall)
  }, [transactions, now])

  const totalOverall = useMemo(() => sumAmount(transactions), [transactions])
  const totalMonth = useMemo(() => sumAmount(monthTransactions), [monthTransactions])
  const totalYear = useMemo(() => sumAmount(yearTransactions), [yearTransactions])

  const exportCsv = () => {
    const header = ['Date', 'Time', 'Shop Name', 'UPI ID', 'Amount']
    const rows = transactions.map((tx) => {
      const date = new Date(tx.createdAt)
      const dateLabel = date.toLocaleDateString('en-IN')
      const timeLabel = date.toLocaleTimeString('en-IN')
      return [dateLabel, timeLabel, tx.shopName || '', tx.upiId || '', String(Number(tx.amount || 0))]
    })

    const escaped = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([escaped], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `campus-pay-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>
      
      <GlassPanel className="totals-container">
        <h2>Totals</h2>
        <div className="totals-grid">
          <div className="total-card">
            <span className="label">Total Spent Overall</span>
            <span className="value">{formatCurrency(totalOverall)}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Spent This Month</span>
            <span className="value">{formatCurrency(totalMonth)}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Spent This Year</span>
            <span className="value">{formatCurrency(totalYear)}</span>
          </div>
          <div className="total-card">
            <span className="label">Transactions</span>
            <span className="value">{transactions.length}</span>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="chart-container">
        <h3>Total Spent Per Shop</h3>
        {byShop.length === 0 ? <p className="placeholder-text">No confirmed transactions yet.</p> : null}
        {byShop.map((item) => (
          <div className="shop-breakdown-row" key={item.shopName}>
            <div>
              <strong>{item.shopName}</strong>
              <p>{item.count} txn</p>
            </div>
            <div className="shop-breakdown-values">
              <span>All: {formatCurrency(item.overall)}</span>
              <span>Month: {formatCurrency(item.month)}</span>
              <span>Year: {formatCurrency(item.year)}</span>
            </div>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="export-container">
        <h3>Export</h3>
        <button type="button" className="export-btn" onClick={exportCsv}>Download CSV</button>
      </GlassPanel>
    </div>
  )
}
