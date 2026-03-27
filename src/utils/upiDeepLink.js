const APP_SCHEMES = {
  phonepe: 'phonepe://pay',
  gpay: 'tez://upi/pay',
  paytm: 'paytmmp://pay',
  upi: 'upi://pay',
  other: 'upi://pay',
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

export const buildUpiDeepLink = ({ upiId, name, amount, app = 'upi', note }) => {
  const scheme = APP_SCHEMES[app] || APP_SCHEMES.upi
  const query = buildQuery({ upiId, name, amount, note })
  return `${scheme}?${query}`
}

export const launchUpiIntent = ({ upiId, name, amount, app = 'upi', note }) => {
  const selectedAppLink = buildUpiDeepLink({ upiId, name, amount, app, note })
  const genericLink = buildUpiDeepLink({ upiId, name, amount, app: 'upi', note })

  // Try preferred app first, then fall back to generic UPI chooser.
  window.location.href = selectedAppLink
  if (app !== 'upi' && app !== 'other') {
    setTimeout(() => {
      window.location.href = genericLink
    }, 900)
  }

  return selectedAppLink
}
