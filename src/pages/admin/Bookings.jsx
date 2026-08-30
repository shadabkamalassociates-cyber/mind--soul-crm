import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Video } from 'lucide-react'
import { useGetBookingsQuery, useUpdateBookingMutation, useGetCommunityPaymentsQuery, useVerifyPaymentMutation } from '../../services/bookingService'
import { useGetAllSessionsQuery } from '../../services/serviceService'
import { useGetUsersQuery } from '../../services/userService'
import { useGetExpertsQuery } from '../../services/expertService'
import { PageHeader, inputCls, Button } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import { meta, currency, formatDateTime } from '../../utils/status'

const tabCls = (active) =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    active
      ? 'bg-dusk-700 text-white shadow-sm'
      : 'text-ink-soft hover:bg-dusk-50 hover:text-ink'
  }`

export default function Bookings() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('community')
  const [search, setSearch] = useState('')

  // Session bookings data
  const { data: bookings = [], isLoading: bookingsLoading } = useGetBookingsQuery()
  const { data: services = [] } = useGetAllSessionsQuery()
  const { data: users = [] } = useGetUsersQuery()
  const { data: experts = [] } = useGetExpertsQuery()
  const [updateBooking] = useUpdateBookingMutation()
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation()

  const handleStartConsultation = (booking) => {
    const channel = `consultation-${booking.id}`
    const serviceName = serviceById[booking.serviceId]?.title || 'Consultation'
    const userName = userById[booking.userId]?.name || 'Client'
    navigate(`/meeting/${channel}`, {
      state: { title: `${serviceName} (with ${userName})` },
    })
  }

  const handleVerify = async (row) => {
    try {
      console.log(row.razorpay_order_id,"22222222222");
      console.log(row.razorpay_payment_id,"3333333333");
      console.log(row.razorpay_signature,"444444444444");
      const res = await verifyPayment({
        razorpayOrderId: row.razorpay_order_id,
        razorpayPaymentId: row.razorpay_payment_id,
        razorpaySignature: row.razorpay_signature,
      }).unwrap()
      alert(res.message || 'Payment verified successfully!')
    } catch (err) {
      alert(err?.data?.message || 'Verification failed.')
    }
  }

  // Community payments data
  const { data: payments = [], isLoading: paymentsLoading } = useGetCommunityPaymentsQuery()

  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const expertById = Object.fromEntries(experts.map((e) => [e.id, e]))

  // Filtered session bookings
  const filteredBookings = useMemo(() => bookings
    .filter((b) => (serviceById[b.serviceId]?.title || '').toLowerCase().includes(search.toLowerCase()) || (userById[b.userId]?.name || '').toLowerCase().includes(search.toLowerCase()))
    .slice().reverse(), [bookings, search, serviceById, userById])

  // Filtered community payments
  const filteredPayments = useMemo(() => payments
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.purchase_id?.toLowerCase().includes(search.toLowerCase())
    )
    .slice().reverse(), [payments, search])

  // Session bookings columns
  const bookingColumns = [
    { key: 'user', header: 'User', render: (r) => userById[r.userId]?.name || '—' },
    { key: 'service', header: 'Session', render: (r) => <span className="max-w-[220px] truncate block">{serviceById[r.serviceId]?.title}</span> },
    { key: 'expert', header: 'Expert', render: (r) => expertById[r.expertId]?.name || '—' },
    { key: 'sessionAt', header: 'Session Time', render: (r) => formatDateTime(r.sessionAt) },
    { key: 'amount', header: 'Amount', render: (r) => currency(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleStartConsultation(r)}
            className="flex items-center gap-1 rounded-lg bg-marigold-500/10 px-2 py-1 text-xs font-semibold text-marigold-600 hover:bg-marigold-500 hover:text-white transition-all"
            title="Join / Monitor Consultation"
          >
            <Video size={12} /> Call
          </button>
          {r.status === 'confirmed' && (
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              onClick={() => updateBooking({ id: r.id, status: 'refunded' })}
            >
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ]

  // Community payments columns
  const paymentColumns = [
    { key: 'purchase_id', header: 'Purchase ID', render: (r) => <span className="font-mono text-xs">{r.purchase_id}</span> },
    { key: 'name', header: 'Name', render: (r) => r.name || '—' },
    { key: 'email', header: 'Email', render: (r) => <span className="max-w-[200px] truncate block text-ink-soft">{r.email}</span> },
    { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
    { key: 'amount', header: 'Amount', render: (r) => currency(r.amount) },
    { key: 'source', header: 'Source', render: (r) => <Badge tone="info">{(r.source || '').replace(/_/g, ' ')}</Badge> },
    { key: 'payment_status', header: 'Payment', render: (r) => <Badge tone={meta(r.payment_status).tone}>{meta(r.payment_status).label}</Badge> },
    { key: 'purchase_status', header: 'Purchase', render: (r) => <Badge tone={meta(r.purchase_status).tone}>{meta(r.purchase_status).label}</Badge> },
    { key: 'created_at', header: 'Date', render: (r) => formatDateTime(r.created_at) },
    {
      key: 'actions', header: '', render: (r) => r.payment_status === 'pending' && r.razorpay_order_id ? (
        <Button
          variant="accent"
          className="!px-2.5 !py-1 text-xs"
          disabled={isVerifying}
          onClick={() => handleVerify(r)}
        >
          {isVerifying ? 'Verifying…' : 'Verify'}
        </Button>
      ) : null,
    },
  ]

  const isLoading = tab === 'bookings' ? bookingsLoading : paymentsLoading
  const columns = tab === 'bookings' ? bookingColumns : paymentColumns
  const data = tab === 'bookings' ? filteredBookings : filteredPayments

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Every order, payment, and session across the platform." />

      {/* Tab bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 rounded-xl bg-dusk-50/60 p-1">
          <button className={tabCls(tab === 'community')} onClick={() => { setTab('community'); setSearch('') }}>
            Community Payments
            {payments.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-dusk-700 shadow-sm">
                {payments.length}
              </span>
            )}
          </button>
          <button className={tabCls(tab === 'bookings')} onClick={() => { setTab('bookings'); setSearch('') }}>
            Session Bookings
            {bookings.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-dusk-700 shadow-sm">
                {bookings.length}
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            placeholder={tab === 'bookings' ? 'Search by user or session' : 'Search by name, email, phone, or ID'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-72 pl-8`}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </div>
  )
}
