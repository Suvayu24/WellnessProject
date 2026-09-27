import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../lib/api'

function AdminCentrePage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await apiFetch('/admin/users')
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="max-w-6xl px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate('/')}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Home
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#3b1f00] mb-1">Admin Centre</h2>
          <p className="text-sm leading-6 text-[#7a4a10]">Registered users and account access</p>
        </div>

        {loading && <div className="text-sm text-[#7a4a10]">Loading users...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}

        {!loading && !error && users.length === 0 && (
          <div className="rounded-2xl border border-[#d9a870] bg-[#EEBD89] p-8 text-center text-[#3b1f00]">
            No registered users found.
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((account) => (
              <button
                key={account.id}
                onClick={() => navigate(`/admin-centre/users/${account.id}`)}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-[#d9a870] bg-[#EEBD89] p-4 text-left shadow-[0_10px_28px_rgba(59,31,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#0f766e] hover:shadow-[0_12px_28px_rgba(15,118,110,0.12)]"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#d9a870] bg-[#0f766e] flex items-center justify-center text-lg font-semibold text-white">
                  {account.profile_pic ? (
                    <img src={account.profile_pic} alt={account.username} className="h-full w-full object-cover" />
                  ) : (
                    (account.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-[#3b1f00]">{account.username}</div>
                  <div className="truncate text-sm text-[#7a4a10]">{account.email}</div>
                  {(account.is_superuser || account.admin_access) && (
                    <span className="mt-2 inline-flex rounded-full border border-[#0f766e]/30 bg-white/35 px-2.5 py-1 text-[11px] font-bold text-[#0f766e]">
                      {account.is_superuser ? 'Superuser' : 'Administrator'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCentrePage
