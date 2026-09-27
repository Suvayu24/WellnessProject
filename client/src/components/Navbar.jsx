import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [hidden, setHidden] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const lastScrollY = useRef(0)

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const distance = Math.abs(currentScrollY - lastScrollY.current)

      if (distance < 8) return

      setHidden(currentScrollY > lastScrollY.current && currentScrollY > 80)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let active = true

    const loadUnreadNotifications = async () => {
      try {
        const data = await apiFetch('/notifications/unread-count')
        if (active) setUnreadNotifications(data.count || 0)
      } catch {
        if (active) setUnreadNotifications(0)
      }
    }

    loadUnreadNotifications()
    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isSuperuser = user?.is_superuser || user?.role === 'superuser' || user?.email?.toLowerCase() === 'admin@example.com'
  const iconClass = 'h-[19px] w-[19px]'
  const iconButtonClass = 'h-10 w-10 rounded-full border border-[#d9a870] bg-white/70 text-[#3b1f00] shadow-sm hover:bg-[#d9a870]/80 hover:border-[#bfc9d6] transition-colors flex items-center justify-center'

  return (
    <nav className={`bg-[#EEBD89]/95 px-5 sm:px-8 h-16 flex items-center justify-between border-b border-[#d9a870] shadow-[0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-300 ease-out ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <button onClick={() => navigate('/profile')} className="flex items-center gap-3 rounded-xl pr-3 hover:bg-[#d9a870]/80 transition-colors">
        <div className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
          {(user?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-[15px] font-semibold text-[#3b1f00]">Welcome, {user?.username || 'User'}</span>
      </button>
      
      <div className="flex items-center gap-2 sm:gap-2.5">
        {isSuperuser && (
          <button
            onClick={() => navigate('/admin-centre')}
            className="inline-flex h-10 items-center rounded-full border border-[#0f766e]/30 bg-[#0f766e] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#085044] sm:px-4 sm:text-sm"
          >
            Admin Centre
          </button>
        )}

        <button onClick={() => navigate('/')} className={iconButtonClass} title="Home" aria-label="Home">
          <svg className={iconClass} fill="none" stroke="#1a0a00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="m3 10.5 9-7 9 7"/>
            <path d="M5 10v10h14V10"/>
            <path d="M9 20v-6h6v6"/>
          </svg>
        </button>

        <button onClick={() => navigate('/notifications')} className={`${iconButtonClass} relative`} title="Notifications" aria-label="Notifications">
          <svg className={iconClass} fill="none" stroke="#1a0a00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
            <path d="M10 21h4"/>
          </svg>
          {unreadNotifications > 0 && (
            <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-600 ring-1 ring-[#EEBD89]" />
          )}
        </button>

        <div className="relative group">
          <button className={iconButtonClass} title="Menu" aria-label="Menu">
            <svg className={iconClass} fill="none" stroke="#1a0a00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 6h16"/>
              <path d="M4 12h16"/>
              <path d="M4 18h16"/>
            </svg>
          </button>

          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 absolute right-0 top-[calc(100%+8px)] z-20 w-44 rounded-xl border border-[#d9a870] bg-[#f8e8bd] p-2 shadow-[0_18px_36px_rgba(59,31,0,0.16)] transition-all">
            {[
              { label: 'Courses', path: '/courses' },
              { label: 'Books', path: '/books' },
              { label: 'Others', path: '/others' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#3b1f00] hover:bg-[#EEBD89] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        <button onClick={handleLogout} className={`${iconButtonClass} text-red-700 hover:bg-red-50 hover:border-red-200`} title="Logout" aria-label="Logout">
          <svg className={iconClass} fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
