const express = require('express')
const router = express.Router()
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { Course, Chapter, Section, Lecture, Quiz, LectureQuiz } = sequelize.models
const { buildCourseProgressState } = require('../utils/courseProgress')

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: Chapter }],
      order: [['id', 'ASC']],
    })
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get a course by ID (with chapters)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Chapter, include: [{ model: Section, include: [{ model: Lecture, include: [LectureQuiz] }] }, Quiz] }],
      order: [[Chapter, 'chapter_number', 'ASC'], [Chapter, Section, 'section_number', 'ASC']]
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const plain = course.toJSON()
    const progressState = await buildCourseProgressState(req.userId, course.id, { isAdmin: req.isAdmin })

    plain.Chapters = plain.Chapters.map((chapter) => {
      const state = progressState.chapterState.get(chapter.id) || {}

      return {
        ...chapter,
        progress: {
          completedLectures: state.completedLectures || 0,
          totalLectures: state.totalLectures || 0,
          completedSections: state.completedSections || 0,
          totalSections: state.totalSections || 0,
          attemptedQuizzes: state.attemptedQuizzes || 0,
          passedQuizzes: state.passedQuizzes || 0,
          totalQuizzes: state.totalQuizzes || 0,
          percent: state.percent || 0,
        },
        isLocked: !state.isUnlocked,
        lockMessage: state.isUnlocked ? '' : 'Complete previous chapter sections first.',
      }
    })

    res.json(plain)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
