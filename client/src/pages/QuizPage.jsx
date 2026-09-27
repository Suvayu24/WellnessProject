import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuizPanel from '../components/QuizPanel'
import { apiFetch } from '../lib/api'

function QuizPage() {
  const navigate = useNavigate()
  const { courseId, chapterId, sectionId, lectureId } = useParams()
  const [lecture, setLecture] = useState(null)
  const [section, setSection] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const [lectureData, quizData, sectionData] = await Promise.all([
          apiFetch(`/lectures/${lectureId}`),
          apiFetch(`/quizzes/lecture/${lectureId}`),
          sectionId ? apiFetch(`/sections/${sectionId}`) : Promise.resolve(null),
        ])
        setLecture(lectureData)
        setSection(sectionData || lectureData.Section || null)
        setQuiz(quizData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [lectureId, sectionId])

  const handleQuizSubmit = async (answers) => {
    const attempt = await apiFetch(`/quizzes/${quiz.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    })
    setQuiz({
      ...quiz,
      latestAttempt: attempt,
      attempts: [attempt, ...(quiz.attempts || [])],
      attemptCount: (quiz.attemptCount || 0) + 1,
    })
  }

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate(sectionId ? `/course/${courseId}/chapter/${chapterId}/section/${sectionId}/lecture/${lectureId}` : `/course/${courseId}/chapter/${chapterId}/lecture/${lectureId}`)}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Lecture
        </button>

        <h2 className="text-base font-semibold tracking-tight text-[#7a4a10] mb-6">
          <span onClick={() => navigate('/courses')} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            Courses
          </span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            Course {courseId}
          </span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            Chapter {chapterId}
          </span>
          {' > '}
          <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/section/${sectionId || section?.id}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            {section?.title || `Section ${sectionId || section?.id || ''}`}
          </span>
          {' > '}
          <span onClick={() => navigate(sectionId ? `/course/${courseId}/chapter/${chapterId}/section/${sectionId}/lecture/${lectureId}` : `/course/${courseId}/chapter/${chapterId}/lecture/${lectureId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
            {lecture?.title || `Lecture ${lectureId}`}
          </span>
          {' > Quiz'}
        </h2>

        {loading && <div className="text-sm text-[#7a4a10]">Loading quiz...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}

        {!loading && !error && !quiz && (
          <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center text-[#3b1f00]">
            No quiz is available for this lecture yet.
          </div>
        )}

        {!loading && !error && quiz && (
          <QuizPanel quiz={quiz} onSubmit={handleQuizSubmit} />
        )}
      </div>
    </div>
  )
}

export default QuizPage
