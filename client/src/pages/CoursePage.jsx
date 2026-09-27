import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NoticeModal from '../components/NoticeModal'
import { apiFetch } from '../lib/api'

function CoursePage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await apiFetch(`/courses/${courseId}`)
        setCourse(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  const chapters = course?.Chapters || []

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate('/courses')}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Courses
        </button>

        <h2 className="text-base font-semibold tracking-tight text-[#7a4a10] mb-2">
          <span onClick={() => navigate('/courses')} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            Courses
          </span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            {course?.title || `Course ${courseId}`}
          </span>
        </h2>
        {course?.description && <p className="max-w-3xl text-base leading-7 text-[#7a4a10] mb-6">{course.description}</p>}
        {!course?.description && <div className="mb-6" />}

        {loading && <div className="text-sm text-[#7a4a10]">Loading course...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}
        <NoticeModal message={notice} onClose={() => setNotice('')} />

        {!loading && !error && chapters.length === 0 && (
          <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center text-[#3b1f00] shadow-[0_10px_28px_rgba(59,31,0,0.06)]">
            No chapters available yet.
          </div>
        )}

        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => {
                if (chapter.isLocked) {
                  setNotice(chapter.lockMessage || 'Complete previous chapter sections first.')
                  return
                }
                navigate(`/course/${courseId}/chapter/${chapter.id}`)
              }}
              className={`bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-5 transition-all duration-200 ${
                chapter.isLocked
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,118,110,0.12)] hover:border-[#0f766e]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-xl font-bold tracking-tight text-[#4f2f0d]">
                      {chapter.title}
                    </div>
                    {chapter.isLocked && (
                      <span className="rounded-full border border-[#d9a870] bg-white/35 px-2.5 py-1 text-[11px] font-semibold text-[#7a4a10]">
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="max-w-2xl text-[15px] leading-6 text-[#684214]">{chapter.description}</div>
                </div>

                <div className="w-full lg:w-[420px]">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#7a4a10] mb-2">
                    <span>Progress</span>
                    <span className="font-bold text-[#0f766e]">{chapter.progress?.percent || 0}%</span>
                  </div>
                  <div className="h-2.5 bg-white/45 rounded-full border border-[#d9a870] overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#0f766e] rounded-full transition-all"
                      style={{ width: `${chapter.progress?.percent || 0}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2 bg-white/35 border border-[#d9a870] rounded-lg px-3 py-2 font-semibold text-[#3b1f00]">
                      Sections: <span className="font-bold">{chapter.progress?.completedSections || 0}/{chapter.progress?.totalSections || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoursePage
