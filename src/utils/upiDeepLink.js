const UPI_SCHEME = 'upi://pay'

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

export const buildUpiDeepLink = ({ upiId, name, amount, note }) => {
  const query = buildQuery({ upiId, name, amount, note })
  return `${UPI_SCHEME}?${query}`
}

export const launchUpiIntent = ({ upiId, name, amount, note }) => {
  const upiLink = buildUpiDeepLink({ upiId, name, amount, note })
  window.location.href = upiLink
  return upiLink
}
