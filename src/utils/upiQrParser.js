const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/

const cleanValue = (value) => (value || '').trim()

export const parseUpiQrPayload = (rawText) => {
  const value = cleanValue(rawText)
  if (!value) {
    return { upiId: '', name: '' }
  }

  const startAt = value.indexOf('upi://pay')
  if (startAt >= 0) {
    const link = value.slice(startAt)
    try {
      const url = new URL(link)
      const upiId = cleanValue(url.searchParams.get('pa'))
      const name = cleanValue(url.searchParams.get('pn'))
      return { upiId, name }
    } catch {
      // Fall through to plain-text parser.
    }
  }

  if (UPI_ID_PATTERN.test(value)) {
    return { upiId: value, name: '' }
  }

  return { upiId: '', name: '' }
}
