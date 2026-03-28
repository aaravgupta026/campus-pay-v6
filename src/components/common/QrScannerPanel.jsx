import { useEffect, useMemo, useRef, useState } from 'react'
import './QrScannerPanel.css'

export default function QrScannerPanel({
  onScan,
  title = 'Scan QR Code',
  helperText = 'Point camera to the shop UPI QR code.',
}) {
  const scannerRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [cameraFailed, setCameraFailed] = useState(false)
  const [isFileScanning, setIsFileScanning] = useState(false)
  const elementId = useMemo(() => `qr-reader-${Math.random().toString(36).slice(2, 9)}`, [])

  const stopScanner = async () => {
    const scanner = scannerRef.current
    if (!scanner) {
      setIsRunning(false)
      return
    }

    try {
      await scanner.stop()
    } catch {
      // Scanner may already be stopped.
    }

    try {
      await scanner.clear()
    } catch {
      // Safe to ignore clear errors on teardown.
    }

    scannerRef.current = null
    setIsRunning(false)
  }

  const startScanner = async () => {
    setError('')
    if (isRunning) {
      return
    }

    setCameraFailed(false)

    const { Html5Qrcode } = await import('html5-qrcode')

    const scanner = new Html5Qrcode(elementId)
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          onScan?.(decodedText)
          await stopScanner()
        },
        () => {
          // Avoid noisy UI updates while camera is scanning frames.
        }
      )
      setIsRunning(true)
    } catch {
      setError('Could not access camera. Please allow permission and try again.')
      setCameraFailed(true)
      await stopScanner()
    }
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setError('')
    setIsFileScanning(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(elementId)
      const decodedText = await scanner.scanFile(file, true)
      await scanner.clear().catch(() => {})
      onScan?.(decodedText)
    } catch {
      setError('Could not read QR from image. Try a clearer image.')
    } finally {
      setIsFileScanning(false)
      event.target.value = ''
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="qr-panel">
      <div className="qr-panel-head">
        <h4>{title}</h4>
        <p>{helperText}</p>
      </div>

      <div id={elementId} className="qr-reader" />

      <div className="qr-actions">
        {!isRunning ? (
          <button type="button" className="qr-btn qr-primary" onClick={startScanner}>
            Scan QR Code
          </button>
        ) : (
          <button type="button" className="qr-btn qr-secondary" onClick={stopScanner}>
            Stop Scanner
          </button>
        )}

        {cameraFailed ? (
          <button type="button" className="qr-btn qr-secondary qr-upload" onClick={handlePickImage} disabled={isFileScanning}>
            {isFileScanning ? 'Reading Image...' : 'Upload QR Image'}
          </button>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="qr-file-input"
          onChange={onFileChange}
        />
      </div>

      {error ? <p className="qr-error">{error}</p> : null}
    </div>
  )
}
