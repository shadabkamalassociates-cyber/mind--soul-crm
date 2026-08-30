import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LayoutGrid, UserCircle, BadgeCheck, Video, CalendarClock, Wallet, Star } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useGetServicesQuery } from '../services/serviceService'

export default function ExpertLayout() {
  const user = useSelector((s) => s.auth.user)
  const { data: services = [] } = useGetServicesQuery()
  const mine = services.filter((s) => s.expertId === user?.id)
  const needsAttention = mine.filter((s) => s.status === 'needs_changes' || s.status === 'rejected').length

  const items = [
    { to: '/expert', label: 'Dashboard', icon: LayoutGrid, end: true },
    { to: '/expert/profile', label: 'My Profile', icon: UserCircle },
    { to: '/expert/sessions', label: 'My Sessions', icon: BadgeCheck, badge: needsAttention },
    { to: '/expert/meetings', label: 'Meetings', icon: Video },
    { to: '/expert/live-sessions', label: 'Live Sessions', icon: Video },
    { to: '/expert/bookings', label: 'Bookings', icon: CalendarClock },
    { to: '/expert/earnings', label: 'Earnings & Payouts', icon: Wallet },
    { to: '/expert/reviews', label: 'Reviews', icon: Star },
  ]

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar items={items} roleLabel="Expert CRM" />
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <Outlet />
      </main>
    </div>
  )
}
