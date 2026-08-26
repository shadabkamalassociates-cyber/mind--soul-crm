import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { IndianRupee, Star, CalendarClock, Video, ArrowUpRight } from 'lucide-react'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetBookingsQuery } from '../../services/bookingService'
import { useGetExpertQuery } from '../../services/expertService'
import { PageHeader } from '../../components/Common'
import StatCard from '../../components/StatCard'
import Badge from '../../components/Badge'
import { meta, currency, formatDateTime } from '../../utils/status'

const NOW = new Date('2026-07-16T09:00:00+05:30')

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user)
  const { data: expert } = useGetExpertQuery(user.id)
  const { data: services = [] } = useGetServicesQuery()
  const { data: bookings = [] } = useGetBookingsQuery()

  const mine = services.filter((s) => s.expertId === user.id)
  const myBookings = bookings.filter((b) => b.expertId === user.id)
  const upcoming = myBookings.filter((b) => new Date(b.sessionAt) >= NOW && b.status === 'confirmed').sort((a, b) => new Date(a.sessionAt) - new Date(b.sessionAt))
  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const needsAttention = mine.filter((s) => s.status === 'needs_changes' || s.status === 'rejected')

  return (
    <div>
      <PageHeader title={`Welcome back, ${expert?.name?.split(' ')[0] || ''}`} subtitle="Here's what's happening with your Cosmicguruji practice." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime Earnings" value={currency(expert?.earningsLifetime)} icon={IndianRupee} accent="dusk" />
        <StatCard label="Rating" value={expert?.rating ? `${expert.rating} ★` : '—'} icon={Star} accent="marigold" />
        <StatCard label="Sessions Completed" value={expert?.totalSessions ?? 0} icon={CalendarClock} accent="sage" />
        <StatCard label="Live Sessions" value={mine.filter((s) => s.status === 'live').length} icon={Video} accent="rose" />
      </div>

      {needsAttention.length > 0 && (
        <div className="mt-5 rounded-2xl border border-marigold-300 bg-marigold-100/50 p-4">
          <p className="text-sm font-medium text-marigold-700">{needsAttention.length} session(s) need your attention</p>
          <div className="mt-2 space-y-1.5">
            {needsAttention.map((s) => (
              <Link to="/expert/sessions" key={s.id} className="flex items-center justify-between text-sm text-ink hover:underline">
                <span>{s.title}</span>
                <Badge tone={meta(s.status).tone}>{meta(s.status).label}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">Upcoming sessions</h3>
          <Link to="/expert/bookings" className="flex items-center gap-1 text-xs font-medium text-dusk-500 hover:text-dusk-700">View all <ArrowUpRight size={13} /></Link>
        </div>
        <div className="space-y-3">
          {upcoming.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl p-2">
              <div>
                <p className="text-sm font-medium text-ink">{serviceById[b.serviceId]?.title}</p>
                <p className="text-xs text-ink-soft">{formatDateTime(b.sessionAt)}</p>
              </div>
              <span className="text-sm font-semibold text-ink">{currency(b.amount)}</span>
            </div>
          ))}
          {upcoming.length === 0 && <p className="py-4 text-center text-sm text-ink-soft">No upcoming sessions scheduled.</p>}
        </div>
      </div>
    </div>
  )
}
