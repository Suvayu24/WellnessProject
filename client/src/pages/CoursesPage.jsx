import Navbar from '../components/Navbar'
import CourseCard from '../components/CourseCard'
import { useNavigate } from 'react-router-dom'

function CoursesPage() {
  const navigate = useNavigate()

  // Dummy data
  const courses = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
  ]

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />
      
      <div className="px-8 pt-10 pb-12">
        <button 
          onClick={() => navigate('/')}
          className="text-sm text-[#0f766e] font-medium mb-4 hover:underline"
        >
          ← Back to Home
        </button>
        
        <h2 className="text-xl font-medium text-[#3b1f00] mb-6">All Courses</h2>
        
        <div className="grid grid-cols-3 gap-5">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoursesPage