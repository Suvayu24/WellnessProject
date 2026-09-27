import { useNavigate } from 'react-router-dom'

function CourseCard({ course }) {
  const navigate = useNavigate()

  return (
    <div
      className="h-full bg-[#EEBD89] rounded-2xl border border-[#d9a870] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,118,110,0.16),0_2px_8px_rgba(60,30,0,0.08)] hover:border-[#0f766e] flex flex-col"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div className="w-full h-48 bg-[#d9a870] relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#d9a870,#d9a870_10px,#c99660_10px,#c99660_20px)] flex items-center justify-center">
            <span className="bg-[rgba(243,212,165,0.85)] px-3 py-1 rounded-full text-xs text-[#3b1f00] font-medium">
              Thumbnail
            </span>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-[#0f766e] px-3 py-1 text-xs font-bold text-white shadow-sm">
          {course.category || 'Course'}
        </span>
      </div>

      <div className="p-5 flex flex-1 flex-col">
        <div className="mb-2 text-xl font-bold leading-tight tracking-tight text-[#4f2f0d]">{course.title || `Course ${course.id}`}</div>
        <div className="mb-5 text-[15px] leading-6 text-[#684214] line-clamp-3">{course.subtitle || course.description || 'Start learning'}</div>

        <div className="mt-auto flex items-center justify-between">
          <span className="rounded-full border border-[#d9a870] bg-white/35 px-3 py-1.5 text-xs font-bold text-[#0f766e]">{course.Chapters?.length || 0} chapters</span>
          <div className="w-9 h-9 rounded-full bg-[#0f766e] flex items-center justify-center transition-colors hover:bg-[#085044] shadow-sm">
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
