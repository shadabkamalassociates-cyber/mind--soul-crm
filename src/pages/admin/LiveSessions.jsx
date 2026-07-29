import { Video, ExternalLink, Users2, Clock } from 'lucide-react'
import { useGetAllSessionsQuery } from '../../services/serviceService'
import { useGetExpertsQuery } from '../../services/expertService'
import { useGetBookingsQuery } from '../../services/bookingService'
import { PageHeader, EmptyState } from '../../components/Common'
import Badge from '../../components/Badge'
import { currency, formatDateTime } from '../../utils/status'

const NOW = new Date('2026-07-16T09:00:00+05:30')

export default function LiveSessions() {
  const { data: services = [], isLoading } = useGetAllSessionsQuery()
  const { data: experts = [] } = useGetExpertsQuery()
  const { data: bookings = [] } = useGetBookingsQuery()
  const expertById = Object.fromEntries(experts.map((e) => [e.id, e]))

  const liveSessions = services.filter((s) => s.hasLiveComponent && s.status === 'live' && s.scheduledAt)
  const upcoming = liveSessions.filter((s) => new Date(s.scheduledAt) >= NOW).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  const past = liveSessions.filter((s) => new Date(s.scheduledAt) < NOW).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))

  const seatCount = (serviceId) => bookings.filter((b) => b.serviceId === serviceId && b.status !== 'refunded').length

  const Card = ({ s, isPast }) => (
    <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={expertById[s.expertId]?.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-medium text-ink">{s.title}</p>
            <p className="text-xs text-ink-soft">{expertById[s.expertId]?.name}</p>
          </div>
        </div>
        {!isPast && <Badge tone="live" dot>Upcoming</Badge>}
        {isPast && <Badge tone="neutral">Completed</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5"><Clock size={14} /> {formatDateTime(s.scheduledAt)} · {s.duration} min</span>
        <span className="flex items-center gap-1.5"><Users2 size={14} /> {seatCount(s.id)}{s.maxSeats ? ` / ${s.maxSeats}` : ''} seats</span>
        <span>{currency(s.price)} per seat</span>
      </div>

      {s.meetLink && (
        <a href={s.meetLink} target="_blank" rel="noreferrer" className="mt-3 flex w-fit items-center gap-1.5 rounded-lg bg-dusk-50 px-3 py-1.5 text-xs font-medium text-dusk-700 hover:bg-dusk-100">
          <Video size={14} /> {s.meetLink} <ExternalLink size={12} />
        </a>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader title="Live Sessions" subtitle="Every scheduled session runs on Google Meet — monitor upcoming and completed sessions here." />

      <h3 className="mb-3 font-display text-base font-semibold text-ink">Upcoming ({upcoming.length})</h3>
      {upcoming.length === 0 && !isLoading ? (
        <EmptyState icon={Video} title="No upcoming live sessions" message="Approved live sessions with a scheduled time will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {upcoming.map((s) => <Card key={s.id} s={s} />)}
        </div>
      )}

      <h3 className="mb-3 mt-8 font-display text-base font-semibold text-ink">Recently completed</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {past.map((s) => <Card key={s.id} s={s} isPast />)}
      </div>
    </div>
  )
}
