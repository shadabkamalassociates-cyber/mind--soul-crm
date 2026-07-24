export default function StatCard({ label, value, icon: Icon, accent = 'dusk', trend }) {
  const accentBg = {
    dusk: 'bg-dusk-700 text-white',
    marigold: 'bg-marigold-500 text-white',
    sage: 'bg-sage-500 text-white',
    rose: 'bg-rose-500 text-white',
  }[accent]

  return (
    <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
          {trend && <p className="mt-1 text-xs text-sage-700">{trend}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
