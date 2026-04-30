import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const sections = [
    { id: 'courses', title: 'Courses', icon: '📚' },
    { id: 'books', title: 'Books', icon: '📖' },
    { id: 'others', title: 'Others', icon: '✨' },
  ]

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />
      
      <div className="px-8 pt-10 pb-12">
        <h2 className="text-xl font-medium text-[#3b1f00] mb-6">Explore</h2>
        
        <div className="grid grid-cols-3 gap-5">
          {sections.map(section => (
            <div
              key={section.id}
              onClick={() => navigate(`/${section.id}`)}
              className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,118,110,0.13),0_2px_8px_rgba(60,30,0,0.08)] hover:border-[#0f766e] flex flex-col items-center justify-center gap-4 h-48"
            >
              <span className="text-5xl">{section.icon}</span>
              <span className="text-xl font-medium text-[#3b1f00]">{section.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home