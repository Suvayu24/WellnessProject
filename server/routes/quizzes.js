const express = require('express')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { buildCourseProgressState } = require('../utils/courseProgress')
const { generateProgressNotifications } = require('../utils/notifications')

const { LectureQuiz, LectureQuizQuestion, QuizAttempt, QuizAnswer, UserProgress, Lecture, Chapter, Section } = sequelize.models
const router = express.Router()

const normalizeIds = (ids) => Array.isArray(ids) ? ids.map(String).sort() : []

const publicQuestion = (question) => ({
  id: question.id,
  quiz_id: question.quiz_id,
  question_order: question.question_order,
  type: question.type,
  question_text: question.question_text,
  question_image_url: question.question_image_url,
  options: question.options || [],
  correct_option_ids: question.correct_option_ids || [],
  marks: question.marks,
})

const publicAttempt = (attempt) => attempt ? attempt.toJSON ? attempt.toJSON() : attempt : null

router.get('/lecture/:lectureId', verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.lectureId, { include: [Chapter, { model: Section, include: [Chapter] }] })
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' })

    const parentChapter = lecture.Section?.Chapter || lecture.Chapter
    const progressState = await buildCourseProgressState(req.userId, parentChapter.course_id, { isAdmin: req.isAdmin })
    const lectureState = progressState.lectureState.get(lecture.id)
    if (!lectureState?.isUnlocked) {
      return res.status(403).json({ error: 'This quiz is locked. Complete previous sections first.' })
    }

    const progress = await UserProgress.findOne({ where: { user_id: req.userId, lecture_id: lecture.id } })
    if (!req.isAdmin && !progress?.completed) {
      return res.status(403).json({ error: 'Complete lecture first' })
    }

    const quiz = await LectureQuiz.findOne({
      where: { lecture_id: req.params.lectureId },
      include: [{ model: LectureQuizQuestion }],
    })

    if (!quiz) return res.json(null)

    const attempts = await QuizAttempt.findAll({
      where: { user_id: req.userId, quiz_id: quiz.id },
      include: [{ model: QuizAnswer }],
      order: [['attempt_number', 'DESC']],
    })

    res.json({
      id: quiz.id,
      lecture_id: quiz.lecture_id,
      title: quiz.title,
      questions: (quiz.LectureQuizQuestions || [])
        .sort((a, b) => a.question_order - b.question_order)
        .map(publicQuestion),
      attempts: attempts.map(publicAttempt),
      latestAttempt: attempts[0] || null,
      attemptCount: attempts.length,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:quizId/submit', verifyToken, async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const quiz = await LectureQuiz.findByPk(req.params.quizId, {
      include: [{ model: LectureQuizQuestion }],
      transaction,
    })
    if (!quiz) {
      await transaction.rollback()
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const lecture = await Lecture.findByPk(quiz.lecture_id, { include: [Chapter, { model: Section, include: [Chapter] }], transaction })
    const parentChapter = lecture.Section?.Chapter || lecture.Chapter
    const progressState = await buildCourseProgressState(req.userId, parentChapter.course_id, { isAdmin: req.isAdmin })
    const lectureState = progressState.lectureState.get(lecture.id)
    const progress = await UserProgress.findOne({ where: { user_id: req.userId, lecture_id: lecture.id }, transaction })
    if (!lectureState?.isUnlocked || (!req.isAdmin && !progress?.completed)) {
      await transaction.rollback()
      return res.status(403).json({ error: 'Complete lecture first' })
    }

    const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : []
    const existingAttempts = await QuizAttempt.count({
      where: { user_id: req.userId, quiz_id: quiz.id },
      transaction,
    })

    let score = 0
    let maxScore = 0
    const answerRows = []

    for (const question of quiz.LectureQuizQuestions || []) {
      const submitted = submittedAnswers.find((answer) => Number(answer.questionId) === question.id)
      const isMcq = question.type === 'mcq'
      const selectedOptionIds = normalizeIds(submitted?.selectedOptionIds)
      const correctOptionIds = normalizeIds(question.correct_option_ids)
      const textAnswer = submitted?.textAnswer || ''
      let isCorrect = null
      let marksAwarded = 0

      if (isMcq) {
        const marks = Number(question.marks) || 1
        maxScore += marks
        isCorrect = selectedOptionIds.length > 0 &&
          selectedOptionIds.length === correctOptionIds.length &&
          selectedOptionIds.every((id, index) => id === correctOptionIds[index])
        marksAwarded = isCorrect ? marks : 0
        score += marksAwarded
      }

      answerRows.push({
        question_id: question.id,
        selected_option_ids: selectedOptionIds,
        text_answer: textAnswer,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
      })
    }

    const attempt = await QuizAttempt.create({
      user_id: req.userId,
      quiz_id: quiz.id,
      score,
      max_score: maxScore,
      attempt_number: existingAttempts + 1,
      submitted_at: new Date(),
    }, { transaction })

    await QuizAnswer.bulkCreate(
      answerRows.map((answer) => ({ ...answer, attempt_id: attempt.id })),
      { transaction }
    )

    await transaction.commit()

    await generateProgressNotifications({
      userId: req.userId,
      courseId: parentChapter.course_id,
      beforeState: progressState,
    })

    const savedAttempt = await QuizAttempt.findByPk(attempt.id, {
      include: [{ model: QuizAnswer }],
    })

    res.status(201).json(savedAttempt)
  } catch (err) {
    await transaction.rollback()
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
