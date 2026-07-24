import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Video, Film } from 'lucide-react'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetExpertsQuery } from '../../services/expertService'
import { PageHeader, inputCls } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import { meta, currency } from '../../utils/status'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'live', label: 'Live' },
  { key: 'draft', label: 'Draft' },
  { key: 'rejected', label: 'Rejected' },
]

const typeLabels = {
  live_session: 'Live Session',
  course: 'Course',
  '1_1_consultation': '1:1 Consultation',
  workshop: 'Workshop',
  membership: 'Membership',
}

export default function Services() {
  const { data: services = [], isLoading } = useGetServicesQuery()
  const { data: experts = [] } = useGetExpertsQuery()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const expertById = Object.fromEntries(experts.map((e) => [e.id, e]))

  const filtered = useMemo(() => {
    return services
      .filter((s) => (tab === 'all' ? true : s.status === tab))
      .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
  }, [services, tab, search])

  const columns = [
    {
      key: 'title', header: 'Session', render: (r) => (
        <div className="flex items-center gap-2">
          {r.hasLiveComponent && <Video size={14} className="shrink-0 text-marigold-500" />}
          {r.videoUrl && <Film size={14} className="shrink-0 text-dusk-500" />}
          <div>
            <p className="max-w-xs truncate font-medium text-ink">{r.title}</p>
            <p className="text-xs text-ink-soft">{typeLabels[r.type]}</p>
          </div>
        </div>
      ),
    },
    { key: 'expert', header: 'Expert', render: (r) => expertById[r.expertId]?.name || '—' },
    { key: 'price', header: 'Price', render: (r) => currency(r.price) },
    { key: 'bookings', header: 'Bookings' },
    { key: 'video', header: 'Video', render: (r) => r.videoUrl ? <Badge tone={meta(r.videoStatus).tone}>{meta(r.videoStatus).label}</Badge> : <span className="text-xs text-ink-soft">—</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Sessions" subtitle="Recorded sessions, courses, workshops, and consultations submitted by experts." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-canvas-alt p-1">
          {tabs.map((t) => {
            const count = t.key === 'all' ? services.length : services.filter((s) => s.status === t.key).length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                {t.label} <span className="text-xs text-ink-soft">({count})</span>
              </button>
            )
          })}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} w-64 pl-8`} />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => navigate(`/admin/sessions/${r.id}`)} emptyMessage="No sessions match this view." />
    </div>
  )
}
