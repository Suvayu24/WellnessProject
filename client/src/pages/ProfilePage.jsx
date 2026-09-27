import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

function ProfilePage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [adminAccessSaving, setAdminAccessSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const profilePath = userId ? `/admin/users/${userId}/profile` : '/user/profile'
        const progressPath = userId ? `/admin/users/${userId}/progress-summary` : '/user/progress-summary'
        const [profileData, progressData] = await Promise.all([
          apiFetch(profilePath),
          apiFetch(progressPath),
        ])
        setProfile(profileData)
        setProgress(progressData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  const handleChange = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value })
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    try {
      const data = await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          phone_number: profile.phone_number,
          address: profile.address,
          profile_pic: profile.profile_pic,
        }),
      })
      setProfile(data)
      updateUser({ ...user, username: data.username, email: data.email })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleAdminAccess = async () => {
    const nextAdminAccess = !profile.admin_access
    const action = nextAdminAccess ? 'grant administrator access to' : 'revoke administrator access from'
    if (!window.confirm(`Are you sure you want to ${action} ${profile.username}?`)) return

    setAdminAccessSaving(true)
    setError('')
    try {
      const data = await apiFetch(`/admin/users/${profile.id}/admin-access`, {
        method: 'PATCH',
        body: JSON.stringify({ adminAccess: nextAdminAccess }),
      })
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setAdminAccessSaving(false)
    }
  }

  const isAdminView = Boolean(userId)
  const isSuperuser = user?.is_superuser || user?.role === 'superuser' || user?.email?.toLowerCase() === 'admin@example.com'
  const canManageAdminAccess = isAdminView && isSuperuser && profile && !profile.is_superuser
  const avatar = profile?.profile_pic

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12 max-w-6xl">
        <button
          onClick={() => navigate(isAdminView ? '/admin-centre' : '/')}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          {isAdminView ? 'Back to Admin Centre' : 'Back to Home'}
        </button>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#3b1f00] mb-1">
              {isAdminView ? `${profile?.username || 'User'}'s Profile` : 'My Profile'}
            </h2>
            <p className="text-sm leading-6 text-[#7a4a10]">Account details and learning progress</p>
          </div>
          {!isAdminView && (
            <button
              onClick={() => navigate('/notes')}
              className="bg-[#0f766e] hover:bg-[#085044] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Saved Notebooks
            </button>
          )}
        </div>

        {loading && <div className="text-sm text-[#7a4a10]">Loading profile...</div>}
        {error && <div className="text-sm text-red-700 mb-4">{error}</div>}

        {!loading && profile && (
          <>
            <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-6 mb-8 shadow-[0_10px_28px_rgba(59,31,0,0.06)]">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-28 h-28 rounded-full bg-[#0f766e] border-4 border-[#d9a870] overflow-hidden flex items-center justify-center text-white text-4xl font-semibold shadow-sm">
                    {avatar ? <img src={avatar} alt={profile.name} className="w-full h-full object-cover" /> : (profile.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  {editing && (
                    <input
                      name="profile_pic"
                      value={profile.profile_pic || ''}
                      onChange={handleChange}
                      placeholder="Profile image URL"
                      className="w-64 rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2 text-sm text-[#3b1f00] focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                    />
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-[#7a4a10]">Name</span>
                    <input
                      name="name"
                      value={profile.name || ''}
                      onChange={handleChange}
                      readOnly={!editing}
                      className="mt-1 w-full rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2.5 text-[#3b1f00] read-only:bg-white/25 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#7a4a10]">Email Address</span>
                    <input
                      value={profile.email || ''}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-[#d9a870] bg-white/25 px-3 py-2.5 text-[#3b1f00] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#7a4a10]">Access Level</span>
                    <input
                      value={profile.is_superuser ? 'Superuser' : profile.admin_access ? 'Administrator' : 'User'}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-[#d9a870] bg-white/25 px-3 py-2.5 text-[#3b1f00] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#7a4a10]">Phone Number</span>
                    <input
                      name="phone_number"
                      value={profile.phone_number || ''}
                      onChange={handleChange}
                      readOnly={!editing}
                      className="mt-1 w-full rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2.5 text-[#3b1f00] read-only:bg-white/25 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-xs font-semibold text-[#7a4a10]">Address</span>
                    <textarea
                      name="address"
                      value={profile.address || ''}
                      onChange={handleChange}
                      readOnly={!editing}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2.5 text-[#3b1f00] read-only:bg-white/25 resize-none focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-5 justify-end">
                {canManageAdminAccess && (
                  <button
                    onClick={toggleAdminAccess}
                    disabled={adminAccessSaving}
                    className={`font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-70 ${
                      profile.admin_access
                        ? 'bg-red-700 text-white hover:bg-red-800'
                        : 'bg-[#0f766e] text-white hover:bg-[#085044]'
                    }`}
                  >
                    {adminAccessSaving
                      ? 'Updating...'
                      : profile.admin_access
                        ? 'Revoke Administrator Access'
                        : 'Grant Administrator Access'}
                  </button>
                )}

                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="bg-[#EEBD89] border-2 border-[#d9a870] text-[#3b1f00] font-semibold px-4 py-2 rounded-lg">
                      Cancel
                    </button>
                    <button onClick={saveProfile} disabled={saving} className="bg-[#0f766e] hover:bg-[#085044] disabled:opacity-70 text-white font-semibold px-4 py-2 rounded-lg">
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </>
                ) : (
                  !isAdminView && (
                    <button onClick={() => setEditing(true)} className="bg-[#0f766e] hover:bg-[#085044] text-white font-semibold px-4 py-2 rounded-lg">
                      Edit Profile
                    </button>
                  )
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-[#3b1f00] mb-4">Progress</h3>
            {progress.length === 0 ? (
              <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center text-[#3b1f00]">
                Start a lecture or submit a quiz to see course progress here.
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map((course) => (
                  <div key={course.id} className="bg-[#EEBD89] rounded-xl border border-[#d9a870] p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                      <div className="flex-1">
                        <div className="text-[15px] font-medium text-[#3b1f00]">{course.title}</div>
                        <div className="text-sm text-[#7a4a10]">{course.category}</div>
                      </div>
                      <div className="w-full lg:w-[480px]">
                        <div className="flex justify-between text-xs text-[#7a4a10] mb-2">
                          <span>Progress</span>
                          <span className="font-medium text-[#0f766e]">{course.percent}%</span>
                        </div>
                        <div className="h-2.5 bg-white/45 rounded-full border border-[#d9a870] overflow-hidden mb-3">
                          <div className="h-full bg-[#0f766e] rounded-full" style={{ width: `${course.percent}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/35 border border-[#d9a870] rounded-lg px-3 py-2 text-[#3b1f00]">
                            Lectures: <span className="font-medium">{course.completedLectures}/{course.totalLectures}</span>
                          </div>
                          <div className="bg-white/35 border border-[#d9a870] rounded-lg px-3 py-2 text-[#3b1f00]">
                            Quizzes: <span className="font-medium">{course.attemptedQuizzes}/{course.totalQuizzes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
