import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NotebookPanel from '../components/NotebookPanel'
import NoticeModal from '../components/NoticeModal'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

const toNonNegativeSeconds = (value) => {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 0
}

const getSegmentBounds = (lecture, actualDuration = 0) => {
  const start = toNonNegativeSeconds(lecture?.start_timestamp)
  const rawEnd = Number(lecture?.end_timestamp)
  const hasEnd = Number.isFinite(rawEnd) && rawEnd > start
  const end = hasEnd ? Math.floor(rawEnd) : null
  const effectiveEnd = actualDuration > 0
    ? Math.min(end || actualDuration, actualDuration)
    : end
  const duration = effectiveEnd && effectiveEnd > start
    ? effectiveEnd - start
    : actualDuration > start
      ? actualDuration - start
      : 0

  return { start, end, effectiveEnd, duration }
}

const clampToSegment = (time, segment) => {
  const seconds = Number(time)
  const currentTime = Number.isFinite(seconds) && seconds >= 0 ? seconds : segment.start
  if (segment.effectiveEnd && currentTime >= segment.effectiveEnd) return segment.effectiveEnd
  return Math.max(segment.start, currentTime)
}

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function LecturePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { courseId, chapterId, sectionId, lectureId } = useParams()
  const [lecture, setLecture] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [section, setSection] = useState(null)
  const [watchedSecondsDisplay, setWatchedSecondsDisplay] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [notice, setNotice] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [sliderTime, setSliderTime] = useState(0)
  const [segmentBounds, setSegmentBounds] = useState({ start: 0, end: null, effectiveEnd: null, duration: 0 })
  const playerRef = useRef(null)
  const intervalRef = useRef(null)
  const lastTimeRef = useRef(0)
  const watchedSecondsRef = useRef(0)
  const actualDurationRef = useRef(0)
  const isSeekingRef = useRef(false)
  const playerElementId = `youtube-player-${lectureId}`

  useEffect(() => {
    const loadLecture = async () => {
      try {
        const [lectureData, progressData, courseData, chapterData, sectionData] = await Promise.all([
          apiFetch(`/lectures/${lectureId}`),
          apiFetch(`/progress/lecture/${lectureId}`),
          apiFetch(`/courses/${courseId}`),
          apiFetch(`/chapters/${chapterId}`),
          sectionId ? apiFetch(`/sections/${sectionId}`) : Promise.resolve(null),
        ])
        setLecture(lectureData)
        setProgress(progressData)
        setCourse(courseData)
        setChapter(chapterData)
        setSection(sectionData || lectureData.Section || null)
        watchedSecondsRef.current = progressData?.watched_seconds || 0
        lastTimeRef.current = progressData?.last_watched_time || 0
        setWatchedSecondsDisplay(progressData?.watched_seconds || 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadLecture()
  }, [lectureId, courseId, chapterId, sectionId])

  useEffect(() => {
    if (!lecture?.video_id) return undefined
    const initialSegment = getSegmentBounds(lecture)
    const resumeTime = progress?.completed
      ? initialSegment.start
      : clampToSegment(progress?.last_watched_time || initialSegment.start, initialSegment)
    const playerVars = {
      start: resumeTime,
      rel: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
    }
    if (initialSegment.end) {
      playerVars.end = initialSegment.end
    }

    // Reset player-UI state for the incoming lecture/video.
    setPlayerReady(false)
    setIsPlaying(false)
    setIsMuted(false)
    setSegmentBounds(initialSegment)
    setSliderTime(resumeTime)
    isSeekingRef.current = false

    const loadYouTubeApi = () => new Promise((resolve) => {
      if (window.YT?.Player) {
        resolve(window.YT)
        return
      }

      const existingScript = document.getElementById('youtube-iframe-api')
      window.onYouTubeIframeAPIReady = () => resolve(window.YT)

      if (!existingScript) {
        const script = document.createElement('script')
        script.id = 'youtube-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(script)
      }
    })

    const saveProgress = async () => {
      if (!playerRef.current) return
      const segment = getSegmentBounds(lecture, playerRef.current.getDuration?.() || actualDurationRef.current || 0)
      const currentTime = clampToSegment(playerRef.current.getCurrentTime?.() || segment.start, segment)
      const duration = segment.duration
      const watchedSeconds = duration > 0
        ? Math.min(watchedSecondsRef.current, duration)
        : watchedSecondsRef.current
      const completed = duration > 0 && watchedSeconds >= duration * 0.85
      try {
        const data = await apiFetch(`/progress/lecture/${lectureId}`, {
          method: 'PUT',
          body: JSON.stringify({
            watchedSeconds,
            lastWatchedTime: currentTime,
            duration,
            completed,
          }),
        })
        setProgress(data)
      } catch {
        // Progress saving is best-effort so playback is never interrupted.
      }
    }

    const startTracking = () => {
      if (intervalRef.current) return
      const segment = getSegmentBounds(lecture, playerRef.current?.getDuration?.() || actualDurationRef.current || 0)
      lastTimeRef.current = clampToSegment(playerRef.current?.getCurrentTime?.() || segment.start, segment)
      intervalRef.current = setInterval(() => {
        const player = playerRef.current
        if (!player || player.getPlayerState?.() !== window.YT.PlayerState.PLAYING) return

        const segment = getSegmentBounds(lecture, player.getDuration?.() || actualDurationRef.current || 0)
        const rawCurrentTime = player.getCurrentTime()
        if (rawCurrentTime < segment.start) {
          player.seekTo(segment.start, true)
          lastTimeRef.current = segment.start
          return
        }

        const currentTime = clampToSegment(rawCurrentTime, segment)
        const delta = currentTime - lastTimeRef.current
        if (delta > 0 && delta <= 1.5) {
          watchedSecondsRef.current = segment.duration > 0
            ? Math.min(watchedSecondsRef.current + delta, segment.duration)
            : watchedSecondsRef.current + delta
          setWatchedSecondsDisplay(watchedSecondsRef.current)
        }
        lastTimeRef.current = currentTime

        if (segment.effectiveEnd && rawCurrentTime >= segment.effectiveEnd) {
          player.pauseVideo()
          stopTracking()
        }
      }, 1000)
    }

    const stopTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      saveProgress()
    }

    loadYouTubeApi().then((YT) => {
      playerRef.current = new YT.Player(playerElementId, {
        videoId: lecture.video_id,
        playerVars,
        events: {
          onReady: (event) => {
            const actualDuration = event.target.getDuration()
            actualDurationRef.current = actualDuration
            const segment = getSegmentBounds(lecture, actualDuration)
            setVideoDuration(segment.duration)
            setSegmentBounds(segment)
            setSliderTime(resumeTime)
            lastTimeRef.current = resumeTime
            if (resumeTime > segment.start || segment.start > 0) {
              event.target.seekTo(resumeTime, true)
            }
            if (event.target.isMuted?.()) setIsMuted(true)
            setPlayerReady(true)
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              startTracking()
              setIsPlaying(true)
            }
            if ([YT.PlayerState.PAUSED, YT.PlayerState.ENDED].includes(event.data)) {
              stopTracking()
              setIsPlaying(false)
            }
          },
        },
      })
    })

    return () => {
      stopTracking()
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [lecture?.video_id, lecture?.start_timestamp, lecture?.end_timestamp, lectureId])

  // Drives the custom slider while playing and is the last line of defence
  // against ever showing footage outside the lecture's [start, end] segment.
  useEffect(() => {
    if (!isPlaying) return undefined

    const tick = () => {
      const player = playerRef.current
      if (!player?.getCurrentTime || isSeekingRef.current) return
      const time = player.getCurrentTime()

      if (segmentBounds.effectiveEnd && time >= segmentBounds.effectiveEnd) {
        player.seekTo(segmentBounds.effectiveEnd, true)
        player.pauseVideo()
        setSliderTime(segmentBounds.effectiveEnd)
        return
      }
      if (time < segmentBounds.start) {
        player.seekTo(segmentBounds.start, true)
        setSliderTime(segmentBounds.start)
        return
      }
      setSliderTime(time)
    }

    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [isPlaying, segmentBounds.start, segmentBounds.effectiveEnd])

  const handlePlayPause = () => {
    const player = playerRef.current
    if (!player || !playerReady) return
    const state = player.getPlayerState?.()
    if (state === window.YT?.PlayerState.PLAYING) {
      player.pauseVideo()
      return
    }
    const current = player.getCurrentTime?.() || segmentBounds.start
    if (segmentBounds.effectiveEnd && current >= segmentBounds.effectiveEnd) {
      player.seekTo(segmentBounds.start, true)
    }
    player.playVideo()
  }

  const handleSliderChange = (event) => {
    isSeekingRef.current = true
    const relative = Number(event.target.value)
    setSliderTime(segmentBounds.start + relative)
  }

  const commitSlider = (event) => {
    const relative = Number(event.target.value)
    const maxRelative = segmentBounds.duration || 0
    const clampedRelative = Math.min(Math.max(relative, 0), maxRelative)
    const absoluteTime = segmentBounds.start + clampedRelative
    playerRef.current?.seekTo(absoluteTime, true)
    lastTimeRef.current = absoluteTime
    setSliderTime(absoluteTime)
    isSeekingRef.current = false
  }

  const handleMuteToggle = () => {
    const player = playerRef.current
    if (!player) return
    if (player.isMuted?.()) {
      player.unMute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }

  const handleFullscreen = () => {
    const iframe = playerRef.current?.getIframe?.()
    if (!iframe) return
    if (iframe.requestFullscreen) iframe.requestFullscreen()
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen()
  }

  const attachments = lecture?.Attachments || []
  const isAdmin = user?.admin_access || user?.is_superuser || user?.role === 'admin' || user?.role === 'superuser' || user?.email?.toLowerCase() === 'admin@example.com'
  const watchedMinutes = Math.floor(watchedSecondsDisplay / 60)
  const progressPercent = progress?.completed
    ? 100
    : videoDuration > 0
      ? Math.min(100, Math.round((watchedSecondsDisplay / videoDuration) * 100))
      : 0

  const sliderMax = segmentBounds.duration || 0
  const relativeElapsed = Math.min(Math.max(sliderTime - segmentBounds.start, 0), sliderMax)

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-8 pb-12">
        <button
          onClick={() => navigate(sectionId ? `/course/${courseId}/chapter/${chapterId}/section/${sectionId}` : `/course/${courseId}/chapter/${chapterId}`)}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Section
        </button>

        {loading && <div className="text-sm text-[#7a4a10]">Loading lecture...</div>}
        {error && <div className="text-sm text-red-700 mb-4">{error}</div>}
        <NoticeModal message={notice} onClose={() => setNotice('')} />

        {!loading && lecture && (
          <div>
            <div className="mb-7">
              <div className="mb-4 text-base font-semibold tracking-tight text-[#7a4a10]">
                <span onClick={() => navigate('/courses')} className="cursor-pointer hover:text-[#0f766e] transition-colors">
                  Courses
                </span>
                {' > '}
                <span onClick={() => navigate(`/course/${courseId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
                  {course?.title ? course.title : `Course ${courseId}`}
                </span>
                {' > '}
                <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
                  {chapter?.title ? chapter.title : `Chapter ${chapterId}`}
                </span>
                {' > '}
                <span onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/section/${sectionId || section?.id}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
                  {section?.title || `Section ${sectionId || section?.id || ''}`}
                </span>
                {' > '}
                <span onClick={() => navigate(sectionId ? `/course/${courseId}/chapter/${chapterId}/section/${sectionId}/lecture/${lectureId}` : `/course/${courseId}/chapter/${chapterId}/lecture/${lectureId}`)} className="cursor-pointer hover:text-[#0f766e] transition-colors">
                  {lecture?.title || `Lecture ${lectureId}`}
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_240px] lg:items-end">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase text-[#0f766e]">Lecture</p>
                  <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#2b1700] sm:text-4xl">
                    {lecture.title}
                  </h1>
                  {lecture.description && (
                    <p className="mt-3 max-w-3xl text-base leading-7 text-[#684214]">
                      {lecture.description}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#d9a870] bg-[#EEBD89]/55 p-4 shadow-[0_8px_22px_rgba(59,31,0,0.06)]">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#3b1f00]">
                    <span>Progress</span>
                    <span>{progress?.completed ? 'Complete' : `${progressPercent}%`}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#3b1f00]/15">
                    <div className="h-full rounded-full bg-[#0f766e]" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#7a4a10]">{watchedMinutes} min watched</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-[#EEBD89] rounded-3xl border border-[#d9a870] overflow-hidden mb-6 shadow-[0_16px_38px_rgba(59,31,0,0.12)]">
                <div className="relative aspect-video bg-black">
                  <div id={playerElementId} className="w-full h-full" />

                  {playerReady && !isPlaying && (
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      aria-label="Play video"
                      className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#0f766e] shadow-lg transition-transform hover:scale-105">
                        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>

                {/* Custom controls: replaces the native YouTube seekbar so playback
                    can never be scrubbed outside this lecture's start/end segment. */}
                <div className="flex items-center gap-3 border-t border-[#d9a870] bg-[#EEBD89] px-4 py-3">
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    disabled={!playerReady}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-white transition-colors hover:bg-[#085044] disabled:opacity-40"
                  >
                    {isPlaying ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-[#3b1f00]">
                    {formatTime(relativeElapsed)}
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={sliderMax || 1}
                    step={1}
                    value={Math.min(relativeElapsed, sliderMax || 0)}
                    onChange={handleSliderChange}
                    onMouseUp={commitSlider}
                    onTouchEnd={commitSlider}
                    onKeyUp={commitSlider}
                    disabled={!playerReady || sliderMax <= 0}
                    aria-label="Seek within lecture segment"
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#3b1f00]/15 accent-[#0f766e] disabled:cursor-not-allowed"
                  />

                  <span className="w-10 shrink-0 text-xs font-semibold tabular-nums text-[#3b1f00]">
                    {formatTime(sliderMax)}
                  </span>

                  <button
                    type="button"
                    onClick={handleMuteToggle}
                    disabled={!playerReady}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9a870] text-[#3b1f00] transition-colors hover:border-[#0f766e] hover:text-[#0f766e] disabled:opacity-40"
                  >
                    {isMuted ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M16.5 12A4.5 4.5 0 0 0 14 8v1.8l2.48 2.48c.01-.09.02-.18.02-.28zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    disabled={!playerReady}
                    aria-label="Fullscreen"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9a870] text-[#3b1f00] transition-colors hover:border-[#0f766e] hover:text-[#0f766e] disabled:opacity-40"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={() => {
                    if (!isAdmin && !progress?.completed) {
                      setNotice('Complete lecture first')
                      return
                    }
                    navigate(sectionId ? `/course/${courseId}/chapter/${chapterId}/section/${sectionId}/lecture/${lectureId}/quiz` : `/course/${courseId}/chapter/${chapterId}/lecture/${lectureId}/quiz`)
                  }}
                  className="rounded-2xl bg-[#0f766e] px-6 py-4 text-base font-semibold text-white shadow-[0_10px_22px_rgba(15,118,110,0.18)] transition-all hover:bg-[#085044]"
                >
                  Take Quiz
                </button>
                {/* <button
                  onClick={() => document.getElementById('attachments-panel')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#EEBD89] hover:bg-[#0f766e] hover:text-white border-2 border-[#d9a870] hover:border-[#0f766e] text-[#3b1f00] font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Attachments
                </button> */}
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${lecture.video_id}`, '_blank', 'noreferrer')}
                  className="rounded-2xl border border-[#d9a870] bg-[#EEBD89] px-6 py-4 text-base font-semibold text-[#3b1f00] transition-all hover:border-[#0f766e] hover:bg-white/35"
                >
                  Open on YouTube
                </button>
              </div>

              <div id="attachments-panel" className="mt-6 rounded-3xl border border-[#d9a870] bg-[#EEBD89] p-5 shadow-[0_12px_30px_rgba(59,31,0,0.08)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#3b1f00]">Attachments</h3>
                    <p className="mt-1 text-sm leading-6 text-[#7a4a10]">Lecture resources and supporting files.</p>
                  </div>
                  <span className="rounded-full bg-[#F3D4A5]/65 px-3 py-1 text-xs font-bold text-[#7a4a10]">
                    {attachments.length}
                  </span>
                </div>
                {attachments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d9a870] bg-white/25 p-5 text-sm font-medium text-[#7a4a10]">No attachments for this lecture yet.</div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-[#d9a870] bg-white/35 p-4 transition-colors hover:border-[#0f766e] hover:bg-white/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold leading-6 text-[#3b1f00]">{attachment.file_name}</div>
                            
                          </div>
                          <span className="shrink-0 rounded-full bg-[#0f766e]/10 px-3 py-1 text-xs font-medium text-[#0f766e]">{attachment.file_type || 'Open'}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full xl:w-[430px]">
              <div className="xl:sticky xl:top-6">
                <NotebookPanel />
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LecturePage