import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useGetBookingsQuery, useUpdateBookingMutation } from '../../services/bookingService'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetUsersQuery } from '../../services/userService'
import { useGetExpertsQuery } from '../../services/expertService'
import { PageHeader, inputCls, Button } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import { meta, currency, formatDateTime } from '../../utils/status'

export default function Bookings() {
  const { data: bookings = [], isLoading } = useGetBookingsQuery()
  const { data: services = [] } = useGetServicesQuery()
  const { data: users = [] } = useGetUsersQuery()
  const { data: experts = [] } = useGetExpertsQuery()
  const [updateBooking] = useUpdateBookingMutation()
  const [search, setSearch] = useState('')

  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const expertById = Object.fromEntries(experts.map((e) => [e.id, e]))

  const filtered = useMemo(() => bookings
    .filter((b) => (serviceById[b.serviceId]?.title || '').toLowerCase().includes(search.toLowerCase()) || (userById[b.userId]?.name || '').toLowerCase().includes(search.toLowerCase()))
    .slice().reverse(), [bookings, search, serviceById, userById])

  const columns = [
    { key: 'user', header: 'User', render: (r) => userById[r.userId]?.name || '—' },
    { key: 'service', header: 'Session', render: (r) => <span className="max-w-[220px] truncate block">{serviceById[r.serviceId]?.title}</span> },
    { key: 'expert', header: 'Expert', render: (r) => expertById[r.expertId]?.name || '—' },
    { key: 'sessionAt', header: 'Session Time', render: (r) => formatDateTime(r.sessionAt) },
    { key: 'amount', header: 'Amount', render: (r) => currency(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
    {
      key: 'actions', header: '', render: (r) => r.status === 'confirmed' ? (
        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => updateBooking({ id: r.id, status: 'refunded' })}>Refund</Button>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Every order, payment, and session across the platform." />
      <div className="mb-4 flex justify-end">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input placeholder="Search by user or session" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} w-72 pl-8`} />
        </div>
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} />
    </div>
  )
}
