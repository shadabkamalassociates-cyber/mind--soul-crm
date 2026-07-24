const styles = {
  neutral: 'bg-dusk-50 text-dusk-700',
  pending: 'bg-marigold-100 text-marigold-700',
  approved: 'bg-sage-100 text-sage-700',
  live: 'bg-sage-500 text-white',
  rejected: 'bg-rose-100 text-rose-700',
  info: 'bg-dusk-100 text-dusk-700',
}

export default function Badge({ tone = 'neutral', children, dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone] || styles.neutral}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${tone === 'live' ? 'bg-white live-dot' : 'bg-current'}`} />}
      {children}
    </span>
  )
}
