import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../lib/api'

const formatDate = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await apiFetch('/notifications')
        setNotifications(data)
        setSelected(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const unread = useMemo(() => notifications.filter((notification) => !notification.read_at), [notifications])
  const read = useMemo(() => notifications.filter((notification) => notification.read_at), [notifications])

  const openNotification = async (notification) => {
    setSelected(notification)
    if (notification.read_at) return

    setOpening(true)
    try {
      const data = await apiFetch(`/notifications/${notification.id}`)
      setSelected(data)
      setNotifications((items) => items.map((item) => item.id === data.id ? data : item))
    } catch (err) {
      setError(err.message)
    } finally {
      setOpening(false)
    }
  }

  const renderNotification = (notification) => {
    const isSelected = selected?.id === notification.id
    const isUnread = !notification.read_at

    return (
      <button
        key={notification.id}
        onClick={() => openNotification(notification)}
        className={`w-full rounded-xl border p-4 text-left transition-all ${
          isSelected
            ? 'border-[#0f766e] bg-white shadow-[0_12px_28px_rgba(15,118,110,0.12)]'
            : isUnread
              ? 'border-[#0f766e]/40 bg-white'
              : 'border-[#d9a870] bg-[#EEBD89]'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" />}
              <h3 className="truncate text-[15px] font-semibold text-[#3b1f00]">{notification.title}</h3>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#7a4a10]">{notification.message}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-[#7a4a10]">{formatDate(notification.created_at)}</span>
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate('/')}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Home
        </button>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#3b1f00]">Notifications</h2>
            <p className="mt-1 text-sm leading-6 text-[#7a4a10]">{unread.length} unread, {read.length} read</p>
          </div>
        </div>

        {loading && <div className="text-sm text-[#7a4a10]">Loading notifications...</div>}
        {error && <div className="mb-4 text-sm text-red-700">{error}</div>}

        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-2xl border border-[#d9a870] bg-[#EEBD89] p-8 text-center text-[#3b1f00]">
            No notifications yet. Complete a section, chapter, or course milestone to see updates here.
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,520px)_1fr]">
            <div className="space-y-6">
              {unread.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#7a4a10]">Unread</h3>
                  <div className="space-y-3">{unread.map(renderNotification)}</div>
                </section>
              )}

              {read.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#7a4a10]">Read</h3>
                  <div className="space-y-3">{read.map(renderNotification)}</div>
                </section>
              )}
            </div>

            <article className="min-h-[360px] rounded-2xl border border-[#d9a870] bg-[#EEBD89] p-6 shadow-[0_10px_28px_rgba(59,31,0,0.06)]">
              {selected ? (
                <>
                  <div className="mb-5 flex flex-col gap-2 border-b border-[#d9a870] pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-[#3b1f00]">{selected.title}</h3>
                      <p className="mt-1 text-sm text-[#7a4a10]">{formatDate(selected.created_at)}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      selected.read_at
                        ? 'border-[#d9a870] bg-white/40 text-[#7a4a10]'
                        : 'border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]'
                    }`}>
                      {selected.read_at ? 'Read' : opening ? 'Opening...' : 'Unread'}
                    </span>
                  </div>

                  <p className="max-w-3xl text-base leading-8 text-[#3b1f00]">{selected.message}</p>

                  {(selected.Course || selected.Chapter || selected.Section) && (
                    <div className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                      {selected.Course && (
                        <div className="rounded-lg border border-[#d9a870] bg-white/35 px-3 py-2 text-[#3b1f00]">
                          Course: <span className="font-semibold">{selected.Course.title}</span>
                        </div>
                      )}
                      {selected.Chapter && (
                        <div className="rounded-lg border border-[#d9a870] bg-white/35 px-3 py-2 text-[#3b1f00]">
                          Chapter: <span className="font-semibold">{selected.Chapter.title}</span>
                        </div>
                      )}
                      {selected.Section && (
                        <div className="rounded-lg border border-[#d9a870] bg-white/35 px-3 py-2 text-[#3b1f00]">
                          Section: <span className="font-semibold">{selected.Section.title}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#7a4a10]">
                  Select a notification to read it.
                </div>
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
