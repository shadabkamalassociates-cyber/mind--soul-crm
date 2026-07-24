import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Sparkles, LogOut } from 'lucide-react'
import { logout } from '../features/auth/authSlice'

export default function Sidebar({ items, roleLabel }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)

  const handleLogout = () => {
    const role = user?.role
    dispatch(logout())
    navigate(role === 'admin' ? '/admin/login' : '/expert/login')
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-dusk-50 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dusk-700 text-marigold-300">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight text-ink">SoulSensei</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-dusk-700 text-white' : 'text-ink-soft hover:bg-canvas-alt hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-2.5">
                  <item.icon size={17} className={isActive ? 'text-marigold-300' : ''} />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${isActive ? 'bg-marigold-500 text-white' : 'bg-marigold-100 text-marigold-700'}`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-dusk-50 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <img src={user?.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-soft">{user?.mobile}</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
