import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import Navbar from '../components/Navbar'
import { apiFetch } from '../lib/api'

function CoursesPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await apiFetch('/courses')
        setCourses(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

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

        <h3 className="text-3xl tracking-tight text-[#4f2f0d] mb-2">All Courses</h3>
        <br></br><br></br>

        {loading && <div className="text-sm text-[#7a4a10]">Loading courses...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}

        {!loading && !error && courses.length === 0 && (
          <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center text-[#3b1f00]">
            No courses available yet.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoursesPage
