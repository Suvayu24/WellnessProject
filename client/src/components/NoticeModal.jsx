function NoticeModal({ message, onClose }) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1700]/45 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-[#d9a870] bg-[#F3D4A5] p-6 text-center shadow-[0_24px_70px_rgba(43,23,0,0.28)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEBD89] text-xl font-bold text-[#0f766e]">
          !
        </div>
        <p className="text-lg font-semibold leading-7 text-[#3b1f00]">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#0f766e] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#085044]"
        >
          Ok
        </button>
      </div>
    </div>
  )
}

export default NoticeModal
