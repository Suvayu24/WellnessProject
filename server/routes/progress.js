const express = require('express')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { buildCourseProgressState } = require('../utils/courseProgress')
const { generateProgressNotifications } = require('../utils/notifications')

const { UserProgress, Lecture, Chapter, Section } = sequelize.models
const router = express.Router()

router.get('/lecture/:lectureId', verifyToken, async (req, res) => {
  try {
    const [progress] = await UserProgress.findOrCreate({
      where: { user_id: req.userId, lecture_id: req.params.lectureId },
      defaults: {
        user_id: req.userId,
        lecture_id: req.params.lectureId,
        watched_seconds: 0,
        last_watched_time: 0,
        completed: false,
      },
    })

    res.json(progress)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/lecture/:lectureId', verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.lectureId, {
      include: [Chapter, { model: Section, include: [Chapter] }],
    })
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' })

    const watchedSeconds = Math.max(0, Number(req.body.watchedSeconds || 0))
    const lastWatchedTime = Math.max(0, Number(req.body.lastWatchedTime || 0))
    const duration = Math.max(0, Number(req.body.duration || 0))
    const completed = Boolean(req.body.completed || (duration > 0 && watchedSeconds >= duration * 0.85))
    const parentChapter = lecture.Section?.Chapter || lecture.Chapter

    const [progress] = await UserProgress.findOrCreate({
      where: { user_id: req.userId, lecture_id: req.params.lectureId },
      defaults: {
        user_id: req.userId,
        lecture_id: req.params.lectureId,
      },
    })

    const beforeState = parentChapter && !progress.completed && completed
      ? await buildCourseProgressState(req.userId, parentChapter.course_id)
      : null

    await progress.update({
      watched_seconds: Math.max(progress.watched_seconds || 0, watchedSeconds),
      last_watched_time: lastWatchedTime,
      completed: progress.completed || completed,
      last_watched_at: new Date(),
    })

    if (beforeState) {
      await generateProgressNotifications({
        userId: req.userId,
        courseId: parentChapter.course_id,
        beforeState,
      })
    }

    res.json(progress)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
