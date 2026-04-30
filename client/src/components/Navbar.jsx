import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="bg-[#EEBD89] px-8 h-16 flex items-center justify-between border-b border-[#d9a870]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
        <span className="text-[15px] font-medium text-[#3b1f00]">Welcome, Username</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="w-12 h-12 rounded-lg hover:bg-[#d9a870] transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        
        <button className="w-12 h-12 rounded-lg hover:bg-[#d9a870] transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </button>
        
        <button className="w-12 h-12 rounded-lg hover:bg-[#d9a870] transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default Navbar