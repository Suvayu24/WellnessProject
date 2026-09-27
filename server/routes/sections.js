const express = require('express')
const router = express.Router()
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { Section, Chapter, Lecture, LectureQuiz, Attachment } = sequelize.models
const { buildCourseProgressState } = require('../utils/courseProgress')

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id, {
      include: [
        { model: Chapter },
        { model: Lecture, include: [Attachment, LectureQuiz] },
      ],
      order: [[Lecture, 'lecture_number', 'ASC']],
    })
    if (!section) return res.status(404).json({ error: 'Section not found' })

    const progressState = await buildCourseProgressState(req.userId, section.Chapter.course_id, { isAdmin: req.isAdmin })
    const sectionState = progressState.sectionState.get(section.id)
    if (!sectionState?.isUnlocked) {
      return res.status(403).json({ error: 'This section is locked. Complete previous sections first.' })
    }

    const plain = section.toJSON()
    plain.Lectures = (plain.Lectures || []).map((lecture) => {
      const state = progressState.lectureState.get(lecture.id)
      return {
        ...lecture,
        progress: state?.progress || null,
        quizAttempted: state?.quizAttempted || false,
        quizPassed: state?.quizPassed || false,
        quizPassThreshold: state?.quizPassThreshold || 0,
        isLocked: !state?.isUnlocked,
        lockMessage: state?.isUnlocked ? '' : 'Complete previous lectures first.',
      }
    })
    plain.progress = {
      completedLectures: sectionState.completedLectures || 0,
      totalLectures: sectionState.totalLectures || 0,
      percent: sectionState.percent || 0,
    }
    plain.isLocked = false

    res.json(plain)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
