import './AppShell.css'

export default function AppShell({ children, userLabel }) {
  return (
    <div className="app-container">
      <div className="app-frame">
        <header className="app-header-glass">
          <div className="brand-title">Campus Pay V6</div>
          <div className="brand-subtitle">Hello, {userLabel}</div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
