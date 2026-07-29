import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Video, Film } from 'lucide-react'
import { useGetAllSessionsQuery, useGetSessionsByExpertQuery } from '../../services/serviceService'
import { useGetExpertsQuery } from '../../services/expertService'
import { PageHeader, inputCls } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import { meta, currency } from '../../utils/status'

const tabs = [
  { key: 'ALL', label: 'All' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export default function Services() {
  const [selectedExpert, setSelectedExpert] = useState('')
  const { data: experts = [] } = useGetExpertsQuery()
  
  const { data: allSessions = [], isLoading: loadingAll } = useGetAllSessionsQuery(undefined, { skip: !!selectedExpert })
  const { data: expertSessions = [], isLoading: loadingExpert } = useGetSessionsByExpertQuery(selectedExpert, { skip: !selectedExpert })
  
  const services = selectedExpert ? expertSessions : allSessions
  const isLoading = loadingAll || loadingExpert

  const [tab, setTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    return services
      .filter((s) => (tab === 'ALL' ? true : s.status === tab))
      .filter((s) => s.title?.toLowerCase().includes(search.toLowerCase()))
  }, [services, tab, search])

  const columns = [
    {
      key: 'title', header: 'Session', render: (r) => (
        <div className="flex items-center gap-2">
          {r.session_type === 'LIVE' && <Video size={14} className="shrink-0 text-marigold-500" />}
          {r.video_url && <Film size={14} className="shrink-0 text-dusk-500" />}
          <div>
            <p className="max-w-xs truncate font-medium text-ink">{r.title}</p>
            <p className="text-xs text-ink-soft">{r.session_type === 'LIVE' ? 'Live Session' : 'Recorded'}</p>
          </div>
        </div>
      ),
    },
    { key: 'expert', header: 'Expert', render: (r) => `${r.expert_first_name || ''} ${r.expert_last_name || ''}`.trim() || '—' },
    { key: 'price', header: 'Price', render: (r) => currency(Number(r.price)) },
    { key: 'bookings', header: 'Max Seats', render: (r) => r.max_participants || '—' },
    { key: 'video', header: 'Video', render: (r) => r.video_url ? <a href={r.video_url} target="_blank" rel="noreferrer" className="text-xs text-dusk-600 hover:underline">Link</a> : <span className="text-xs text-ink-soft">—</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status?.toLowerCase()).tone}>{r.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Sessions" subtitle="Recorded sessions, courses, workshops, and consultations submitted by experts." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-canvas-alt p-1">
          {tabs.map((t) => {
            const count = t.key === 'ALL' ? services.length : services.filter((s) => s.status === t.key).length
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
        <div className="flex items-center gap-3">
          <select 
            value={selectedExpert} 
            onChange={(e) => setSelectedExpert(e.target.value)} 
            className={`${inputCls} w-48 text-sm`}
          >
            <option value="">All Experts</option>
            {experts.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} w-64 pl-8`} />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => navigate(`/admin/sessions/${r.id}`)} emptyMessage="No sessions match this view." />
    </div>
  )
}
