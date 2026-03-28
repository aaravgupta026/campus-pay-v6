const EXPENSES_STORAGE_KEY = 'campus_pay_expenses'

const safeParse = (rawValue) => {
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const getLocalExpenses = () => {
  return safeParse(localStorage.getItem(EXPENSES_STORAGE_KEY)).sort((a, b) => {
    const aDate = new Date(a.createdAt || `${a.date} ${a.time}`)
    const bDate = new Date(b.createdAt || `${b.date} ${b.time}`)
    return bDate - aDate
  })
}

export const addLocalExpense = ({ shopName, upiId, amount }) => {
  const now = new Date()
  const entry = {
    id: `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: now.toLocaleDateString('en-IN'),
    time: now.toLocaleTimeString('en-IN'),
    shopName,
    upiId,
    amount: Number(amount),
    createdAt: now.toISOString(),
  }

  const next = [...getLocalExpenses(), entry]
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(next))
  return entry
}
