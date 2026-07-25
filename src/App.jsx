import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginChooser from './pages/auth/LoginChooser'
import AdminLogin from './pages/auth/AdminLogin'
import ExpertLogin from './pages/auth/ExpertLogin'
import ExpertSignUp from './pages/auth/ExpertSignUp'

import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCategories from './pages/admin/Categories'
import AdminUsers from './pages/admin/Users'
import AdminExperts from './pages/admin/Experts'
import AdminExpertDetail from './pages/admin/ExpertDetail'
import AdminServices from './pages/admin/Services'
import AdminServiceDetail from './pages/admin/ServiceDetail'
import AdminBookings from './pages/admin/Bookings'
import AdminLiveSessions from './pages/admin/LiveSessions'
import AdminReviews from './pages/admin/Reviews'
import AdminCoupons from './pages/admin/Coupons'
import AdminPayouts from './pages/admin/Payouts'
import AdminSettings from './pages/admin/Settings'

import ExpertLayout from './layouts/ExpertLayout'
import ExpertDashboard from './pages/expert/Dashboard'
import ExpertProfile from './pages/expert/Profile'
import ExpertServices from './pages/expert/Services'
import ExpertLiveSessions from './pages/expert/LiveSessions'
import ExpertBookings from './pages/expert/Bookings'
import ExpertEarnings from './pages/expert/Earnings'
import ExpertReviews from './pages/expert/Reviews'

function RootRedirect() {
  const { user } = useSelector((s) => s.auth)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/expert'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginChooser />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/expert/login" element={<ExpertLogin />} />
      <Route path="/expert/signup" element={<ExpertSignUp />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="experts" element={<AdminExperts />} />
          <Route path="experts/:id" element={<AdminExpertDetail />} />
          <Route path="sessions" element={<AdminServices />} />
          <Route path="sessions/:id" element={<AdminServiceDetail />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="live-sessions" element={<AdminLiveSessions />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="expert" />}>
        <Route path="/expert" element={<ExpertLayout />}>
          <Route index element={<ExpertDashboard />} />
          <Route path="profile" element={<ExpertProfile />} />
          <Route path="sessions" element={<ExpertServices />} />
          <Route path="live-sessions" element={<ExpertLiveSessions />} />
          <Route path="bookings" element={<ExpertBookings />} />
          <Route path="earnings" element={<ExpertEarnings />} />
          <Route path="reviews" element={<ExpertReviews />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
