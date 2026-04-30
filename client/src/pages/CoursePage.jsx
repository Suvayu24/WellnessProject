import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'

function CoursePage() {
  const navigate = useNavigate()
  const { courseId } = useParams()

  // Dummy chapters
  const chapters = [
    { id: 1, title: 'Introduction to React', description: 'Learn the basics of React and JSX' },
    { id: 2, title: 'Components and Props', description: 'Understanding component architecture' },
    { id: 3, title: 'State Management', description: 'Working with useState and useEffect' },
    { id: 4, title: 'React Router', description: 'Navigation and routing in React apps' },
  ]

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />
      
      <div className="px-8 pt-10 pb-12 max-w-4xl">
        <button 
          onClick={() => navigate('/courses')}
          className="text-sm text-[#0f766e] font-medium mb-4 hover:underline"
        >
          ← Back to Courses
        </button>
        
        <h2 className="text-xl font-medium text-[#3b1f00] mb-6">
          <span 
            onClick={() => navigate('/courses')} 
            className="cursor-pointer hover:text-[#0f766e] transition-colors"
          >
            Courses
          </span>
          {' > '}
          <span 
            onClick={() => navigate(`/course/${courseId}`)} 
            className="cursor-pointer hover:text-[#0f766e] transition-colors"
          >
            Course {courseId}
          </span>
        </h2>
        
        <div className="space-y-4">
          {chapters.map(chapter => (
            <div
              key={chapter.id}
              onClick={() => navigate(`/course/${courseId}/chapter/${chapter.id}`)}
              className="bg-[#EEBD89] rounded-xl border border-[#d9a870] p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,118,110,0.1)] hover:border-[#0f766e]"
            >
              <div className="text-[15px] font-medium text-[#3b1f00] mb-1">
                Ch {chapter.id} {chapter.title}
              </div>
              <div className="text-sm text-[#7a4a10]">
                {chapter.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoursePage