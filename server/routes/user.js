const express = require('express')
const { Op } = require('sequelize')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { publicProfile } = require('../utils/userAccess')
const { getUserProgressSummary } = require('../utils/userProgressSummary')

const { User, Course, Chapter, Lecture, UserProgress } = sequelize.models
const router = express.Router()

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(publicProfile(user))
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, address, phone_number, profile_pic } = req.body
    const user = await User.findByPk(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    await user.update({
      name: name || user.name,
      username: name || user.username,
      address,
      phone_number,
      profile_pic,
    })

    res.json(publicProfile(user))
  } catch (err) {
    console.error('Error updating profile:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.get('/progress-summary', verifyToken, async (req, res) => {
  try {
    res.json(await getUserProgressSummary(req.userId))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/continue', verifyToken, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      where: {
        user_id: req.userId,
        [Op.or]: [
          { watched_seconds: { [Op.gt]: 0 } },
          { completed: true },
        ],
      },
      include: [{ model: Lecture, include: [{ model: Chapter, include: [Course] }] }],
      order: [['last_watched_at', 'DESC']],
    })

    if (!progress || !progress.Lecture) return res.json(null)

    const lecture = progress.Lecture
    const chapter = lecture.Chapter
    const course = chapter?.Course

    res.json({
      progress,
      lecture: {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        thumbnail: lecture.thumbnail,
        chapter_id: lecture.chapter_id,
      },
      chapter: chapter ? { id: chapter.id, title: chapter.title, course_id: chapter.course_id } : null,
      course: course ? { id: course.id, title: course.title } : null,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
