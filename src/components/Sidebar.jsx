import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Sparkles, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { logout } from '../features/auth/authSlice'

export default function Sidebar({ items, roleLabel }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    const role = user?.role
    dispatch(logout())
    navigate(role === 'admin' ? '/admin/login' : '/expert/login')
  }

  return (
    <aside 
      className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-dusk-50 bg-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-dusk-100 bg-white text-ink-soft shadow-sm hover:bg-dusk-50 hover:text-ink transition-colors cursor-pointer z-40"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header Branding */}
      <div 
        className={`flex items-center gap-2.5 py-5 transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2' : 'px-5'
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dusk-700 text-marigold-300">
          <Sparkles size={18} />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 transition-opacity duration-300">
            <p className="truncate font-display text-base font-semibold leading-tight text-ink">SoulSensei</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-soft">{roleLabel}</p>
          </div>
        )}
      </div>

      {/* Nav Section */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `relative flex items-center rounded-lg transition-colors ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5 text-sm font-medium'
              } ${
                isActive ? 'bg-dusk-700 text-white' : 'text-ink-soft hover:bg-canvas-alt hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                  <item.icon size={17} className={isActive ? 'text-marigold-300' : ''} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </span>
                {!isCollapsed && item.badge > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${isActive ? 'bg-marigold-500 text-white' : 'bg-marigold-100 text-marigold-700'}`}>
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile Section */}
      <div className="border-t border-dusk-50 p-3">
        <div 
          className={`flex items-center rounded-lg transition-all duration-300 ${
            isCollapsed ? 'flex-col gap-3 py-2 px-1' : 'gap-2.5 px-2 py-2'
          }`}
        >
          <img src={user?.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ink-soft">{user?.mobile}</p>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700 shrink-0 transition-colors" 
            aria-label="Log out"
            title={isCollapsed ? "Log out" : undefined}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
