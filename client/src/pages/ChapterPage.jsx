import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NoticeModal from '../components/NoticeModal'
import { apiFetch } from '../lib/api'

function ChapterPage() {
  const navigate = useNavigate()
  const { courseId, chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const loadChapterAndCourse = async () => {
      try {
        const data = await apiFetch(`/chapters/${chapterId}`)
        setChapter(data)
        const courseData = await apiFetch(`/courses/${courseId}`)
        setCourse(courseData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadChapterAndCourse()
  }, [chapterId, courseId])

  const sections = chapter?.Sections || []

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate(`/course/${courseId}`)}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Course
        </button>

        <h2 className="text-base font-semibold tracking-tight text-[#7a4a10] mb-6">
          <span onClick={() => navigate('/courses')} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            Courses
          </span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            {course?.title ? course.title : `Course ${courseId}`}
          </span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            {chapter?.title || `Chapter ${chapterId}`}
          </span>
        </h2>

        {loading && <div className="text-sm text-[#7a4a10]">Loading chapter...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}
        <NoticeModal message={notice} onClose={() => setNotice('')} />

        {!loading && !error && sections.length === 0 && (
          <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center text-[#3b1f00]">
            No sections available yet.
          </div>
        )}

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => {
                if (section.isLocked) {
                  setNotice(section.lockMessage || 'Complete previous sections first.')
                  return
                }
                navigate(`/course/${courseId}/chapter/${chapterId}/section/${section.id}`)
              }}
              className={`bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-5 transition-all duration-200 ${
                section.isLocked
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,118,110,0.12)] hover:border-[#0f766e]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-xl font-bold tracking-tight text-[#4f2f0d]">
                      {section.title}
                    </div>
                    {section.isLocked && (
                      <span className="rounded-full border border-[#d9a870] bg-white/35 px-2.5 py-1 text-[11px] font-semibold text-[#7a4a10]">
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="max-w-2xl text-[15px] leading-6 text-[#684214]">{section.description}</div>
                </div>

                <div className="w-full lg:w-[420px]">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#7a4a10] mb-2">
                    <span>Progress</span>
                    <span className="font-bold text-[#0f766e]">{section.progress?.percent || 0}%</span>
                  </div>
                  <div className="h-2.5 bg-white/45 rounded-full border border-[#d9a870] overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#0f766e] rounded-full transition-all"
                      style={{ width: `${section.progress?.percent || 0}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/35 border border-[#d9a870] rounded-lg px-3 py-2 font-semibold text-[#3b1f00]">
                      Lectures: <span className="font-bold">{section.progress?.completedLectures || 0}/{section.progress?.totalLectures || 0}</span>
                    </div>
                    <div className="bg-white/35 border border-[#d9a870] rounded-lg px-3 py-2 font-semibold text-[#3b1f00]">
                      Quizzes: <span className="font-bold">{section.progress?.attemptedQuizzes || 0}/{section.progress?.totalQuizzes || 0}</span>
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

export default ChapterPage
