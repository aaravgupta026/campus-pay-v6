import { useEffect, useMemo, useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { getLocalExpenses } from '../utils/localExpenses'
import './AnalyticsPage.css'

const sumAmount = (items) => items.reduce((total, item) => total + Number(item.amount || 0), 0)

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`

const getExpenseDate = (expense) => {
  const parsed = new Date(expense.createdAt || `${expense.date} ${expense.time}`)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState(() => getLocalExpenses())
  const now = new Date()

  useEffect(() => {
    const syncExpenses = () => setExpenses(getLocalExpenses())

    syncExpenses()
    window.addEventListener('storage', syncExpenses)
    window.addEventListener('focus', syncExpenses)

    return () => {
      window.removeEventListener('storage', syncExpenses)
      window.removeEventListener('focus', syncExpenses)
    }
  }, [])

  const monthTransactions = useMemo(() => {
    return expenses.filter((tx) => {
      const txDate = getExpenseDate(tx)
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
    })
  }, [expenses, now])

  const yearTransactions = useMemo(() => {
    return expenses.filter((tx) => getExpenseDate(tx).getFullYear() === now.getFullYear())
  }, [expenses, now])

  const byShop = useMemo(() => {
    const bucket = new Map()

    expenses.forEach((tx) => {
      const key = tx.shopName || 'Unknown Shop'
      if (!bucket.has(key)) {
        bucket.set(key, { shopName: key, overall: 0, month: 0, year: 0, count: 0, monthTransactions: [] })
      }

      const row = bucket.get(key)
      const amount = Number(tx.amount || 0)
      const txDate = getExpenseDate(tx)
      const sameYear = txDate.getFullYear() === now.getFullYear()
      const sameMonth = sameYear && txDate.getMonth() === now.getMonth()

      row.overall += amount
      row.count += 1
      if (sameYear) {
        row.year += amount
      }
      if (sameMonth) {
        row.month += amount
        row.monthTransactions.push(tx)
      }
    })

    return Array.from(bucket.values()).sort((a, b) => b.overall - a.overall)
  }, [expenses, now])

  const totalOverall = useMemo(() => sumAmount(expenses), [expenses])
  const totalMonth = useMemo(() => sumAmount(monthTransactions), [monthTransactions])
  const totalYear = useMemo(() => sumAmount(yearTransactions), [yearTransactions])

  const exportCsv = (advanced = false) => {
    const header = advanced
      ? ['Date', 'Time', 'Shop Name', 'UPI ID', 'Amount', 'Status', 'App Used']
      : ['Date', 'Time', 'Shop Name', 'UPI ID', 'Amount']

    const rows = expenses.map((tx) => {
      const date = getExpenseDate(tx)
      const dateLabel = date.toLocaleDateString('en-IN')
      const timeLabel = date.toLocaleTimeString('en-IN')
      if (!advanced) {
        return [dateLabel, timeLabel, tx.shopName || '', tx.upiId || '', String(Number(tx.amount || 0))]
      }

      return [
        dateLabel,
        timeLabel,
        tx.shopName || '',
        tx.upiId || '',
        String(Number(tx.amount || 0)),
        'confirmed',
        'upi',
      ]
    })

    const escaped = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([escaped], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `campus-pay-${advanced ? 'advanced-' : ''}transactions-${new Date().toISOString().slice(0, 10)}.csv`
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
            <span className="value">{expenses.length}</span>
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

            <details className="month-tx-dropdown">
              <summary>This Month Transactions ({item.monthTransactions.length})</summary>
              {item.monthTransactions.length === 0 ? <p>No transactions this month.</p> : null}
              {item.monthTransactions.map((tx) => {
                const txDate = new Date(tx.createdAt)
                return (
                  <div className="month-tx-item" key={tx.id}>
                    <span>{txDate.toLocaleDateString('en-IN')} {txDate.toLocaleTimeString('en-IN')}</span>
                    <strong>{formatCurrency(tx.amount)}</strong>
                  </div>
                )
              })}
            </details>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="export-container">
        <h3>Export</h3>
        <button type="button" className="export-btn" onClick={() => exportCsv(false)}>Download CSV</button>
        <button type="button" className="export-btn secondary" onClick={() => exportCsv(true)}>Download Advanced CSV</button>
      </GlassPanel>
    </div>
  )
}
