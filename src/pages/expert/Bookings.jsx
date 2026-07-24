import { useSelector } from 'react-redux'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useGetBookingsQuery } from '../../services/bookingService'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetUsersQuery } from '../../services/userService'
import { PageHeader, inputCls, EmptyState } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import { meta, currency, formatDateTime } from '../../utils/status'
import { CalendarClock } from 'lucide-react'

export default function Bookings() {
  const user = useSelector((s) => s.auth.user)
  const { data: bookings = [], isLoading } = useGetBookingsQuery()
  const { data: services = [] } = useGetServicesQuery()
  const { data: users = [] } = useGetUsersQuery()
  const [search, setSearch] = useState('')

  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const userById = Object.fromEntries(users.map((u) => [u.id, u]))

  const mine = useMemo(() => bookings
    .filter((b) => b.expertId === user.id)
    .filter((b) => (userById[b.userId]?.name || '').toLowerCase().includes(search.toLowerCase()))
    .slice().reverse(), [bookings, search, userById, user.id])

  const columns = [
    { key: 'user', header: 'User', render: (r) => userById[r.userId]?.name || '—' },
    { key: 'service', header: 'Service', render: (r) => <span className="max-w-[220px] truncate block">{serviceById[r.serviceId]?.title}</span> },
    { key: 'sessionAt', header: 'Session Time', render: (r) => formatDateTime(r.sessionAt) },
    { key: 'amount', header: 'Amount', render: (r) => currency(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Everyone who has booked one of your services." />
      <div className="mb-4 flex justify-end">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input placeholder="Search by user" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} w-64 pl-8`} />
        </div>
      </div>
      {!isLoading && mine.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No bookings yet" message="Once your services go live, bookings will appear here." />
      ) : (
        <DataTable columns={columns} data={mine} isLoading={isLoading} />
      )}
    </div>
  )
}
