import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NotebookPanel from '../components/NotebookPanel'

function NotesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />
      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate('/profile')}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to profile
        </button>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#3b1f00]">Saved Notebooks</h2>
        <NotebookPanel spacious />
      </div>
    </div>
  )
}

export default NotesPage
