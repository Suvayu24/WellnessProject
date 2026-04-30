import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

function LecturePage() {
  const navigate = useNavigate()
  const { courseId, chapterId, lectureId } = useParams()
  const [noteText, setNoteText] = useState('')
  const [savedNotes, setSavedNotes] = useState([
    { id: 1, text: 'ABCDEFGHAWNDNAWODNOadad awdasdasdedasda' },
    { id: 2, text: 'Another sample note here' }
  ])

  const lecture = {
    title: 'Lecture 1',
    description: 'This is the lecture description explaining what you will learn in this video.',
    videoId: 'dQw4w9WgXcQ'
  }

  const handleSaveNote = () => {
    if (noteText.trim()) {
      setSavedNotes([...savedNotes, { id: Date.now(), text: noteText }])
      setNoteText('')
    }
  }

  const handleDeleteNote = (id) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />
      
      <div className="px-8 pt-10 pb-12">
        <button 
          onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)}
          className="text-sm text-[#0f766e] font-medium mb-4 hover:underline"
        >
          ← Back to Chapter
        </button>
        
        {/* Breadcrumb Navigation */}
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
          {' > '}
          <span 
            onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/lecture/${lectureId}`)} 
            className="cursor-pointer hover:text-[#0f766e] transition-colors"
          >
            Lecture {lectureId}
          </span>
        </h2>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left Side - Video and Details */}
          <div className="flex-1">
            {/* Video Player */}
            <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] overflow-hidden mb-6">
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${lecture.videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Lecture Title and Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#3b1f00] mb-2">{lecture.title}</h3>
              <p className="text-sm text-[#7a4a10]">{lecture.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 bg-[#EEBD89] hover:bg-[#0f766e] hover:text-white border-2 border-[#d9a870] hover:border-[#0f766e] text-[#3b1f00] font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Take Quiz
              </button>
              <button className="flex-1 bg-[#EEBD89] hover:bg-[#0f766e] hover:text-white border-2 border-[#d9a870] hover:border-[#0f766e] text-[#3b1f00] font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                Attachments
              </button>
              <button className="flex-1 bg-[#EEBD89] hover:bg-[#0f766e] hover:text-white border-2 border-[#d9a870] hover:border-[#0f766e] text-[#3b1f00] font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Go to YT
              </button>
            </div>
          </div>

          {/* Right Side - Notes */}
          <div className="w-80">
            <div className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-5">
              <h3 className="text-base font-medium text-[#3b1f00] mb-4">Notes</h3>
              
              {/* Saved Notes List */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {savedNotes.map((note, index) => (
                  <div key={note.id} className="bg-white/40 rounded-lg p-3 border border-[#d9a870] group relative">
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-[#3b1f00] flex-shrink-0">{index + 1}.</span>
                      <p className="text-sm text-[#7a4a10] break-words flex-1">{note.text}</p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-red-600 hover:text-red-800" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note Input */}
              <div className="bg-white/30 rounded-lg border border-[#d9a870] mb-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type here..."
                  className="w-full h-32 bg-transparent p-3 text-sm text-[#3b1f00] placeholder-[#7a4a10] resize-none focus:outline-none"
                />
                {/* Toolbar */}
                <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[#d9a870] bg-[#3b1f00]/5">
                  <button className="p-1.5 hover:bg-[#d9a870] rounded text-xs font-bold text-[#3b1f00]">B</button>
                  <button className="p-1.5 hover:bg-[#d9a870] rounded text-xs italic text-[#3b1f00]">I</button>
                  <button className="p-1.5 hover:bg-[#d9a870] rounded text-xs underline text-[#3b1f00]">U</button>
                  <button className="p-1.5 hover:bg-[#d9a870] rounded text-xs line-through text-[#3b1f00]">S</button>
                  <div className="flex-1"></div>
                  <button className="p-1.5 hover:bg-[#d9a870] rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                  </button>
                  <button className="p-1.5 hover:bg-[#d9a870] rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button 
                onClick={handleSaveNote}
                className="w-full bg-[#0f766e] hover:bg-[#085044] text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturePage