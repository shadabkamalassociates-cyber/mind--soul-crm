import { Link } from 'react-router-dom'
import { IndianRupee, Users, BadgeCheck, Wallet, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useGetBookingsQuery } from '../../services/bookingService'
import { useGetExpertsQuery } from '../../services/expertService'
import { useGetAllSessionsQuery } from '../../services/serviceService'
import { useGetPayoutsQuery } from '../../services/payoutService'
import { PageHeader } from '../../components/Common'
import StatCard from '../../components/StatCard'
import Badge from '../../components/Badge'
import { meta, currency, formatDateTime } from '../../utils/status'

const revenueTrend = [
  { day: 'Mon', revenue: 42500 }, { day: 'Tue', revenue: 38900 }, { day: 'Wed', revenue: 51200 },
  { day: 'Thu', revenue: 61800 }, { day: 'Fri', revenue: 57200 }, { day: 'Sat', revenue: 72400 }, { day: 'Sun', revenue: 68300 },
]

export default function Dashboard() {
  const { data: bookings = [] } = useGetBookingsQuery()
  const { data: experts = [] } = useGetExpertsQuery()
  const { data: services = [] } = useGetAllSessionsQuery()
  const { data: payouts = [] } = useGetPayoutsQuery()

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status !== 'refunded' ? b.amount : 0), 0)
  const pendingExperts = experts.filter((e) => e.status === 'pending')
  const pendingServices = services.filter((s) => s.status === 'pending_review')
  const pendingPayoutTotal = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const expertById = Object.fromEntries(experts.map((e) => [e.id, e]))

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A pulse on approvals, bookings, and revenue across Cosmicguruji." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross Revenue (7d)" value={currency(totalRevenue)} icon={IndianRupee} accent="dusk" trend="+12.4% vs last week" />
        <StatCard label="Experts Pending Review" value={pendingExperts.length} icon={Users} accent="marigold" />
        <StatCard label="Sessions Pending Review" value={pendingServices.length} icon={BadgeCheck} accent="sage" />
        <StatCard label="Payouts Awaiting Approval" value={currency(pendingPayoutTotal)} icon={Wallet} accent="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-ink">Revenue trend</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D2A4A" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2D2A4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEDF5" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#57536E' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#57536E' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #EEEDF5', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="#2D2A4A" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">Experts awaiting review</h3>
            <Link to="/admin/experts" className="flex items-center gap-1 text-xs font-medium text-dusk-500 hover:text-dusk-700">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingExperts.slice(0, 4).map((e) => (
              <Link to={`/admin/experts/${e.id}`} key={e.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-canvas-alt/60">
                <img src={e.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                  <p className="truncate text-xs text-ink-soft">{e.skillTags.join(', ')}</p>
                </div>
                <Badge tone={meta(e.status).tone}>{meta(e.status).label}</Badge>
              </Link>
            ))}
            {pendingExperts.length === 0 && <p className="py-4 text-center text-sm text-ink-soft">All caught up 🎉</p>}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">Sessions awaiting approval</h3>
            <Link to="/admin/sessions" className="flex items-center gap-1 text-xs font-medium text-dusk-500 hover:text-dusk-700">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingServices.slice(0, 4).map((s) => (
              <Link to={`/admin/sessions/${s.id}`} key={s.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-canvas-alt/60">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{s.title}</p>
                  <p className="truncate text-xs text-ink-soft">by {expertById[s.expertId]?.name} · {currency(s.price)}</p>
                </div>
                <Badge tone="pending">Pending</Badge>
              </Link>
            ))}
            {pendingServices.length === 0 && <p className="py-4 text-center text-sm text-ink-soft">Nothing waiting on you</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-display text-base font-semibold text-ink">Recent bookings</h3>
          <div className="space-y-3">
            {bookings.slice(-4).reverse().map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{serviceById[b.serviceId]?.title}</p>
                  <p className="text-xs text-ink-soft">{formatDateTime(b.sessionAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{currency(b.amount)}</p>
                  <Badge tone={meta(b.status).tone}>{meta(b.status).label}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
