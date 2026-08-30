import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Video, ExternalLink, Users2, Clock, Sparkles } from 'lucide-react'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetBookingsQuery } from '../../services/bookingService'
import { PageHeader, EmptyState } from '../../components/Common'
import Badge from '../../components/Badge'
import { currency, formatDateTime } from '../../utils/status'

const NOW = new Date('2026-07-16T09:00:00+05:30')

export default function LiveSessions() {
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const { data: services = [], isLoading } = useGetServicesQuery()
  const { data: bookings = [] } = useGetBookingsQuery()

  const mySessions = services.filter((s) => s.expertId === user.id && s.hasLiveComponent && s.scheduledAt)
  const upcoming = mySessions.filter((s) => new Date(s.scheduledAt) >= NOW).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  const past = mySessions.filter((s) => new Date(s.scheduledAt) < NOW).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))

  const seatCount = (id) => bookings.filter((b) => b.serviceId === id && b.status !== 'refunded').length

  const handleStartAgoraMeeting = (session) => {
    const channel = `session-${session.id}`
    navigate(`/meeting/${channel}`, {
      state: { title: session.title },
    })
  }

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
      
      {!isPast && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleStartAgoraMeeting(s)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-marigold-500 to-marigold-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-marigold-600 hover:to-marigold-700 active:scale-95 transition-all"
          >
            <Sparkles size={14} /> Start Agora Live Room
          </button>

          {s.meetLink && (
            <a
              href={s.meetLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-dusk-100 bg-dusk-50 px-3 py-2 text-xs font-medium text-dusk-700 hover:bg-dusk-100"
            >
              <Video size={14} /> Google Meet <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Live Sessions"
        subtitle="Host high-definition interactive video sessions with attendees using built-in Agora RTC or Google Meet."
      />

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
