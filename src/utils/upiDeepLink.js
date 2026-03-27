const APP_SCHEMES = {
  phonepe: 'phonepe://pay',
  gpay: 'tez://upi/pay',
  paytm: 'paytmmp://pay',
  other: 'upi://pay',
  upi: 'upi://pay',
}

const buildQuery = ({ upiId, name, amount, note = 'Campus Pay', currency = 'INR' }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name || 'Campus Pay Merchant',
    am: String(amount),
    cu: currency,
    tn: note,
  })

  return params.toString()
}

export const buildUpiDeepLink = ({ upiId, name, amount, note, app = 'other' }) => {
  const scheme = APP_SCHEMES[app] || APP_SCHEMES.other
  const query = buildQuery({ upiId, name, amount, note })
  return `${scheme}?${query}`
}

export const launchUpiIntent = ({ upiId, name, amount, note, app = 'other' }) => {
  const preferredLink = buildUpiDeepLink({ upiId, name, amount, note, app })
  const fallbackLink = buildUpiDeepLink({ upiId, name, amount, note, app: 'other' })

  window.location.href = preferredLink
  if (app !== 'other' && app !== 'upi') {
    setTimeout(() => {
      window.location.href = fallbackLink
    }, 900)
  }

  return preferredLink
}
