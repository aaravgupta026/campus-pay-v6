const TX_STORAGE_KEY = 'campus_pay_v6_transactions'
const PENDING_STORAGE_KEY = 'campus_pay_v6_pending_confirmations'

const safeParse = (rawValue, fallback = []) => {
  if (!rawValue) {
    return fallback
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const readList = (key) => safeParse(localStorage.getItem(key), [])
const writeList = (key, list) => localStorage.setItem(key, JSON.stringify(list))

export const getTransactions = () => readList(TX_STORAGE_KEY)

export const addTransaction = ({ shopName, upiId, amount, status = 'confirmed', createdAt = new Date().toISOString() }) => {
  const entry = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    shopName,
    upiId,
    amount: Number(amount),
    status,
  }

  const next = [...getTransactions(), entry]
  writeList(TX_STORAGE_KEY, next)
  return entry
}

export const getConfirmedTransactions = () => {
  return getTransactions().filter((tx) => tx.status === 'confirmed' || !tx.status)
}

export const getPendingPayments = () => {
  return readList(PENDING_STORAGE_KEY).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export const addPendingPayment = ({ shopId, shopName, upiId, amount }) => {
  const entry = {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    shopId,
    shopName,
    upiId,
    amount: Number(amount),
    createdAt: new Date().toISOString(),
    promptCount: 0,
  }

  const next = [...getPendingPayments(), entry]
  writeList(PENDING_STORAGE_KEY, next)
  return entry
}

export const markPendingAs = (pendingId, decision) => {
  const current = getPendingPayments()
  const target = current.find((pending) => pending.id === pendingId)
  const nextPending = current.filter((pending) => pending.id !== pendingId)
  writeList(PENDING_STORAGE_KEY, nextPending)

  if (!target) {
    return null
  }

  const status = decision === 'yes' ? 'confirmed' : 'declined'
  return addTransaction({
    shopName: target.shopName,
    upiId: target.upiId,
    amount: target.amount,
    status,
    createdAt: target.createdAt,
  })
}

export const deferPendingPayment = (pendingId) => {
  const next = getPendingPayments().map((pending) => {
    if (pending.id !== pendingId) {
      return pending
    }

    return {
      ...pending,
      promptCount: Number(pending.promptCount || 0) + 1,
      lastPromptedAt: new Date().toISOString(),
    }
  })

  writeList(PENDING_STORAGE_KEY, next)
  return next
}

export const getTopAmountsForShop = (shopName, fallback = [10, 20, 50]) => {
  const transactions = getConfirmedTransactions().filter((tx) => tx.shopName === shopName)
  if (transactions.length === 0) {
    return fallback
  }

  const amountMap = new Map()
  transactions.forEach((tx) => {
    const amount = Number(tx.amount)
    if (Number.isNaN(amount) || amount <= 0) {
      return
    }

    const prev = amountMap.get(amount) || { count: 0, lastAt: 0 }
    const timestamp = new Date(tx.createdAt).getTime()
    amountMap.set(amount, {
      count: prev.count + 1,
      lastAt: Math.max(prev.lastAt, Number.isNaN(timestamp) ? 0 : timestamp),
    })
  })

  const sorted = Array.from(amountMap.entries())
    .sort((a, b) => {
      if (b[1].count !== a[1].count) {
        return b[1].count - a[1].count
      }
      return b[1].lastAt - a[1].lastAt
    })
    .slice(0, 3)
    .map(([amount]) => amount)

  return sorted.length > 0 ? sorted : fallback
}
