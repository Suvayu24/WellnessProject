import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../lib/api'

function Home() {
  const navigate = useNavigate()
  const [continueItem, setContinueItem] = useState(null)

  useEffect(() => {
    const loadContinue = async () => {
      try {
        const data = await apiFetch('/user/continue')
        setContinueItem(data)
      } catch {
        setContinueItem(null)
      }
    }

    loadContinue()
  }, [])

  const sections = [
    { id: 'courses', title: 'Courses', subtitle: 'Structured wellness lessons', accent: '#0f766e' },
    { id: 'books', title: 'Books', subtitle: 'Saved reading resources', accent: '#7c3aed' },
    { id: 'others', title: 'Others', subtitle: 'More tools and material', accent: '#b45309' },
  ]

  const openContinue = () => {
    if (!continueItem?.course || !continueItem?.chapter || !continueItem?.lecture) return
    navigate(`/course/${continueItem.course.id}/chapter/${continueItem.chapter.id}/lecture/${continueItem.lecture.id}`)
  }

  const renderSectionIcon = (id) => {
    const shared = {
      className: 'w-8 h-8',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.9',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      viewBox: '0 0 24 24',
    }

    if (id === 'courses') {
      return (
        <svg {...shared}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>
        </svg>
      )
    }

    if (id === 'books') {
      return (
        <svg {...shared}>
          <path d="M12 6.5A6 6 0 0 0 6 4H3v15h3a6 6 0 0 1 6 2"/>
          <path d="M12 6.5A6 6 0 0 1 18 4h3v15h-3a6 6 0 0 0-6 2"/>
          <path d="M12 6.5V21"/>
        </svg>
      )
    }

    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="19" cy="12" r="1"/>
        <circle cx="5" cy="12" r="1"/>
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <div className="mb-7">
          <h2 className="text-2xl font-semibold tracking-tight text-[#3b1f00] mb-1">Explore</h2>
          <p className="text-sm text-[#7a4a10]">Pick up where you left off or browse the library.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => navigate(`/${section.id}`)}
              className="group bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,118,110,0.14),0_2px_8px_rgba(60,30,0,0.08)] hover:border-[#0f766e] min-h-56 flex flex-col justify-between"
            >
              <span className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: section.accent }}>
                {renderSectionIcon(section.id)}
              </span>
              <div>
                <span className="block text-xl font-semibold text-[#3b1f00] mb-1">{section.title}</span>
                
              </div>
            </div>
          ))}
        </div>

        {continueItem && (
          <div>
            <h3 className="text-lg font-semibold text-[#3b1f00] mb-4">Continue Learning</h3>
            <div
              onClick={openContinue}
              className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,118,110,0.14)] hover:border-[#0f766e] max-w-4xl"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-40 bg-[#d9a870] overflow-hidden">
                  {continueItem.lecture?.thumbnail ? (
                    <img src={continueItem.lecture.thumbnail} alt={continueItem.lecture.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#d9a870,#d9a870_10px,#c99660_10px,#c99660_20px)]" />
                  )}
                </div>
                <div className="p-5 flex-1">
                  <div className="text-xs text-[#0f766e] font-semibold mb-1">
                    {continueItem.course?.title} &gt; {continueItem.chapter?.title}
                  </div>
                  <div className="text-lg font-semibold text-[#3b1f00] mb-2">{continueItem.lecture?.title}</div>
                  <p className="text-sm leading-6 text-[#7a4a10] mb-4">{continueItem.lecture?.description}</p>
                  <button className="bg-[#0f766e] hover:bg-[#085044] text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                    Continue Lecture
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
