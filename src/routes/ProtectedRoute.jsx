import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ role }) {
  const { user } = useSelector((s) => s.auth)

  if (!user) return <Navigate to={role ? `/${role}/login` : '/login'} replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/expert'} replace />
  }
  return <Outlet />
}
