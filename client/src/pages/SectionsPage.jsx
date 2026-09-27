import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NoticeModal from '../components/NoticeModal'
import { apiFetch } from '../lib/api'

function SectionsPage() {
  const navigate = useNavigate()
  const { courseId, chapterId, sectionId } = useParams()
  const [section, setSection] = useState(null)
  const [course, setCourse] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [activeTab, setActiveTab] = useState('lectures')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const loadSection = async () => {
      try {
        const [sectionData, courseData, chapterData] = await Promise.all([
          apiFetch(`/sections/${sectionId}`),
          apiFetch(`/courses/${courseId}`),
          apiFetch(`/chapters/${chapterId}`),
        ])
        setSection(sectionData)
        setCourse(courseData)
        setChapter(chapterData)
        setAttachments((sectionData.Lectures || []).flatMap((lecture) =>
          (lecture.Attachments || []).map((attachment) => ({ ...attachment, lecture }))
        ))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSection()
  }, [courseId, chapterId, sectionId])

  const lectures = section?.Lectures || []
  const getLectureStatus = (lecture) => {
    if (lecture.isLocked) return { label: 'Locked', className: 'bg-white/35 text-[#7a4a10] border-[#d9a870]' }
    if (lecture.quizPassed) return { label: 'Completed', className: 'bg-[#0f766e] text-white border-[#0f766e]' }
    if (lecture.progress?.completed) return { label: 'Watched', className: 'bg-[#0f766e] text-white border-[#0f766e]' }
    if ((lecture.progress?.watched_seconds || 0) > 0) return { label: 'Continue watching', className: 'bg-[#f8e8bd] text-[#7a4a10] border-[#d9a870]' }
    return { label: 'Begin', className: 'bg-white/45 text-[#3b1f00] border-[#d9a870]' }
  }

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Chapter
        </button>

        <h2 className="text-base font-semibold tracking-tight text-[#7a4a10] mb-6">
          <span onClick={() => navigate('/courses')} className="cursor-pointer hover:text-[#0f766e] transition-colors">Courses</span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">{course?.title || `Course ${courseId}`}</span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">{chapter?.title || `Chapter ${chapterId}`}</span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/section/${sectionId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">{section?.title || `Section ${sectionId}`}</span>
        </h2>

        <div className="flex gap-3 mb-6">
          {['lectures', 'attachments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[#0f766e] text-white border-[#0f766e]'
                  : 'bg-[#EEBD89] text-[#3b1f00] border-[#d9a870] hover:border-[#0f766e]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <div className="text-sm text-[#7a4a10]">Loading section...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}
        <NoticeModal message={notice} onClose={() => setNotice('')} />

        {activeTab === 'lectures' && !loading && !error && (
          lectures.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
              {lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  onClick={() => {
                    if (lecture.isLocked) {
                      setNotice(lecture.lockMessage || 'Complete previous lectures first.')
                      return
                    }
                    navigate(`/course/${courseId}/chapter/${chapterId}/section/${sectionId}/lecture/${lecture.id}`)
                  }}
                  className={`h-full bg-[#EEBD89] rounded-2xl border border-[#d9a870] overflow-hidden transition-all duration-200 flex flex-col ${
                    lecture.isLocked
                      ? 'cursor-not-allowed opacity-70'
                      : 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,118,110,0.16)] hover:border-[#0f766e]'
                  }`}
                >
                  <div className="w-full h-52 bg-[#d9a870] overflow-hidden">
                    {lecture.thumbnail ? (
                      <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#d9a870,#d9a870_10px,#c99660_10px,#c99660_20px)] flex items-center justify-center">
                        <span className="bg-[rgba(243,212,165,0.85)] px-3 py-1 rounded-full text-xs text-[#3b1f00] font-medium">Lecture</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="text-lg font-bold leading-snug tracking-tight text-[#4f2f0d]">
                        {lecture.title || `Lecture ${lecture.id}`}
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getLectureStatus(lecture).className}`}>
                        {getLectureStatus(lecture).label}
                      </span>
                    </div>
                    <div className="text-[15px] leading-6 text-[#684214] line-clamp-4">{lecture.description}</div>
                    {lecture.progress?.completed && !lecture.quizPassed && !lecture.isLocked && (
                      <div className="mt-4 rounded-lg border border-[#d9a870] bg-white/30 px-3 py-2 text-xs font-semibold text-[#7a4a10]">
                        Pass the quiz to unlock the next lecture.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center text-[#3b1f00]">
              No lectures available yet.
            </div>
          )
        )}

        {activeTab === 'attachments' && !loading && !error && (
          attachments.length ? (
            <div className="space-y-3 max-w-3xl">
              {attachments.map((attachment) => (
                <a key={attachment.id} href={attachment.file_url} target="_blank" rel="noreferrer" className="bg-[#EEBD89] rounded-xl border border-[#d9a870] p-4 flex items-center justify-between hover:border-[#0f766e] transition-colors">
                  <div>
                    <div className="text-[15px] font-medium text-[#3b1f00]">{attachment.file_name}</div>
                    <div className="text-xs text-[#7a4a10]">{attachment.lecture?.title}</div>
                  </div>
                  <span className="text-sm text-[#0f766e] font-medium">{attachment.file_type || 'Open'}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center">
              <span className="text-[#3b1f00]">No attachments for this section yet.</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default SectionsPage

