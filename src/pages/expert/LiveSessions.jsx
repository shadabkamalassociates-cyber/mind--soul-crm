import { useSelector } from 'react-redux'
import { Video, ExternalLink, Users2, Clock } from 'lucide-react'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetBookingsQuery } from '../../services/bookingService'
import { PageHeader, EmptyState } from '../../components/Common'
import Badge from '../../components/Badge'
import { currency, formatDateTime } from '../../utils/status'

const NOW = new Date('2026-07-16T09:00:00+05:30')

export default function LiveSessions() {
  const user = useSelector((s) => s.auth.user)
  const { data: services = [], isLoading } = useGetServicesQuery()
  const { data: bookings = [] } = useGetBookingsQuery()

  const mySessions = services.filter((s) => s.expertId === user.id && s.hasLiveComponent && s.scheduledAt)
  const upcoming = mySessions.filter((s) => new Date(s.scheduledAt) >= NOW).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  const past = mySessions.filter((s) => new Date(s.scheduledAt) < NOW).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))

  const seatCount = (id) => bookings.filter((b) => b.serviceId === id && b.status !== 'refunded').length

  const Card = ({ s, isPast }) => (
    <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-ink">{s.title}</p>
        {!isPast ? <Badge tone="live" dot>Upcoming</Badge> : <Badge tone="neutral">Completed</Badge>}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5"><Clock size={14} /> {formatDateTime(s.scheduledAt)} · {s.duration} min</span>
        <span className="flex items-center gap-1.5"><Users2 size={14} /> {seatCount(s.id)}{s.maxSeats ? ` / ${s.maxSeats}` : ''} attendees</span>
        <span>{currency(s.price)} per seat</span>
      </div>
      {s.meetLink && !isPast && (
        <a href={s.meetLink} target="_blank" rel="noreferrer" className="mt-3 flex w-fit items-center gap-1.5 rounded-lg bg-marigold-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-marigold-700">
          <Video size={15} /> Join / Start on Google Meet <ExternalLink size={13} />
        </a>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader title="Live Sessions" subtitle="All your live sessions run on Google Meet — the link goes live once admin approves your service." />

      <h3 className="mb-3 font-display text-base font-semibold text-ink">Upcoming</h3>
      {upcoming.length === 0 && !isLoading ? (
        <EmptyState icon={Video} title="Nothing scheduled" message="Once a live session is approved and scheduled, it will show up here with its Meet link." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{upcoming.map((s) => <Card key={s.id} s={s} />)}</div>
      )}

      <h3 className="mb-3 mt-8 font-display text-base font-semibold text-ink">Past sessions</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{past.map((s) => <Card key={s.id} s={s} isPast />)}</div>
    </div>
  )
}
