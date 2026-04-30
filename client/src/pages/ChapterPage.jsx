import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

function ChapterPage() {
  const navigate = useNavigate()
  const { courseId, chapterId } = useParams()
  const [activeTab, setActiveTab] = useState('lectures')

  // Dummy lectures
  const lectures = [
    { 
      id: 1, 
      title: 'Introduction to the Course', 
      description: 'Overview and setup',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
    { 
      id: 2, 
      title: 'Getting Started', 
      description: 'First steps and environment',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
    { 
      id: 3, 
      title: 'Core Concepts', 
      description: 'Understanding the fundamentals',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
  ]

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />
      
      <div className="px-8 pt-10 pb-12">
        <button 
          onClick={() => navigate(`/course/${courseId}`)}
          className="text-sm text-[#0f766e] font-medium mb-4 hover:underline"
        >
          ← Back to Course
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
          {' > '}
          <span 
            onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)} 
            className="cursor-pointer hover:text-[#0f766e] transition-colors"
          >
            Chapter {chapterId}
          </span>
        </h2>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('lectures')}
            className={`px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              activeTab === 'lectures'
                ? 'bg-[#0f766e] text-white border-[#0f766e]'
                : 'bg-[#EEBD89] text-[#3b1f00] border-[#d9a870] hover:border-[#0f766e]'
            }`}
          >
            Lectures
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              activeTab === 'quizzes'
                ? 'bg-[#0f766e] text-white border-[#0f766e]'
                : 'bg-[#EEBD89] text-[#3b1f00] border-[#d9a870] hover:border-[#0f766e]'
            }`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              activeTab === 'attachments'
                ? 'bg-[#0f766e] text-white border-[#0f766e]'
                : 'bg-[#EEBD89] text-[#3b1f00] border-[#d9a870] hover:border-[#0f766e]'
            }`}
          >
            Attachments
          </button>
        </div>

        {/* Lectures Grid */}
        {activeTab === 'lectures' && (
          <div className="grid grid-cols-3 gap-5">
            {lectures.map(lecture => (
              <div
                key={lecture.id}
                onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/lecture/${lecture.id}`)}
                className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,118,110,0.13)] hover:border-[#0f766e]"
              >
                {/* Thumbnail */}
                <div className="w-full h-40 bg-[#d9a870] overflow-hidden">
                  <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#d9a870,#d9a870_10px,#c99660_10px,#c99660_20px)] flex items-center justify-center">
                    <span className="bg-[rgba(243,212,165,0.85)] px-3 py-1 rounded-full text-xs text-[#3b1f00] font-medium">
                      YT Thumbnail
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="text-[15px] font-medium text-[#3b1f00] mb-1">
                    Lecture {lecture.id}
                  </div>
                  <div className="text-sm text-[#7a4a10]">
                    {lecture.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quizzes Placeholder */}
        {activeTab === 'quizzes' && (
          <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center">
            <span className="text-[#3b1f00]">Quizzes coming soon...</span>
          </div>
        )}

        {/* Attachments Placeholder */}
        {activeTab === 'attachments' && (
          <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-8 text-center">
            <span className="text-[#3b1f00]">Attachments coming soon...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChapterPage