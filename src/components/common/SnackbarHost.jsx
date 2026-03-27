import './SnackbarHost.css'

export default function SnackbarHost({ snackbar }) {
  if (!snackbar.open) return null

  return (
    <div className={`snackbar snackbar-${snackbar.type}`}>
      {snackbar.message}
    </div>
  )
}
