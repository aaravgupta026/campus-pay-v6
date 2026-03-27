import './GlassPanel.css'

export default function GlassPanel({ children, className = '', ...rest }) {
  return (
    <div className={`glass-panel ${className}`} {...rest}>
      {children}
    </div>
  )
}
