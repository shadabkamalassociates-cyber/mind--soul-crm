export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dusk-100 bg-white/60 py-14 text-center">
      {Icon && <Icon size={28} className="mb-3 text-dusk-300" />}
      <p className="font-medium text-ink">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-dusk-100 bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-dusk-500 focus:bg-white focus:outline-none'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-dusk-700 text-white hover:bg-dusk-900',
    accent: 'bg-marigold-500 text-white hover:bg-marigold-700',
    success: 'bg-sage-500 text-white hover:bg-sage-700',
    danger: 'bg-rose-500 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-ink hover:bg-dusk-50 border border-dusk-100',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Spinner({ className = '' }) {
  return (
    <div className={`h-5 w-5 animate-spin rounded-full border-2 border-dusk-100 border-t-dusk-700 ${className}`} />
  )
}
