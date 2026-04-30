import { useNavigate } from 'react-router-dom'

function CourseCard({ course }) {
  const navigate = useNavigate()

  return (
    <div 
      className="bg-[#EEBD89] rounded-2xl border border-[#d9a870] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,118,110,0.13),0_2px_8px_rgba(60,30,0,0.08)] hover:border-[#0f766e]"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div className="w-full h-[148px] bg-[#d9a870] relative overflow-hidden">
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#d9a870,#d9a870_10px,#c99660_10px,#c99660_20px)] flex items-center justify-center">
          <span className="bg-[rgba(243,212,165,0.85)] px-3 py-1 rounded-full text-xs text-[#3b1f00] font-medium">
            Thumbnail
          </span>
        </div>
        <span className="absolute top-2.5 left-2.5 bg-[#0f766e] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
          Category
        </span>
      </div>
      
      <div className="p-4">
        <div className="text-[15px] font-medium text-[#3b1f00] mb-1">Course Title</div>
        <div className="text-xs text-[#7a4a10] mb-3">Subtitle · Topic · Tag</div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#0f766e] font-medium">N chapters</span>
          <div className="w-7 h-7 rounded-full bg-[#0f766e] flex items-center justify-center transition-colors hover:bg-[#085044]">
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCard