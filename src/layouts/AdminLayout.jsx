import { Outlet } from 'react-router-dom'
import { LayoutGrid, Tag, Users, BadgeCheck, CalendarClock, Video, Star, Ticket, Wallet, Settings, GraduationCap, BookOpen, FolderOpen } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useGetExpertsQuery } from '../services/expertService'
import { useGetServicesQuery } from '../services/serviceService'
import { useGetPayoutsQuery } from '../services/payoutService'

export default function AdminLayout() {
  const { data: experts = [] } = useGetExpertsQuery()
  const { data: services = [] } = useGetServicesQuery()
  const { data: payouts = [] } = useGetPayoutsQuery()

  const pendingExperts = experts.filter((e) => e.status === 'pending').length
  const pendingServices = services.filter((s) => s.status === 'pending_review').length
  const pendingPayouts = payouts.filter((p) => p.status === 'pending').length

  const items = [
    { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/experts', label: 'Experts', icon: GraduationCap, badge: pendingExperts },
    { to: '/admin/sessions', label: 'Sessions', icon: BadgeCheck, badge: pendingServices },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarClock },
    { to: '/admin/live-sessions', label: 'Live Sessions', icon: Video },
    // { to: '/admin/reviews', label: 'Reviews', icon: Star },
    // { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
    // { to: '/admin/payouts', label: 'Payouts', icon: Wallet, badge: pendingPayouts },
    { to: '/admin/blogs', label: 'Blogs', icon: BookOpen },
    { to: '/admin/blog-categories', label: 'Blog Categories', icon: FolderOpen },
    // { to: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar items={items} roleLabel="Admin CRM" />
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <Outlet />
      </main>
    </div>
  )
}
