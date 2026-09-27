const sequelize = require('../config/db')

const { Course, Chapter, Lecture, LectureQuiz, QuizAttempt, UserProgress } = sequelize.models

const getUserProgressSummary = async (userId) => {
  const courses = await Course.findAll({
    include: [{ model: Chapter, include: [{ model: Lecture, include: [LectureQuiz] }] }],
    order: [['id', 'ASC']],
  })

  const progressRows = await UserProgress.findAll({
    where: { user_id: userId },
  })
  const attemptRows = await QuizAttempt.findAll({
    where: { user_id: userId },
  })

  const completedLectureIds = new Set(progressRows.filter((row) => row.completed).map((row) => row.lecture_id))
  const touchedLectureIds = new Set(progressRows.filter((row) => (row.watched_seconds || 0) > 0 || row.completed).map((row) => row.lecture_id))
  const attemptedQuizIds = new Set(attemptRows.map((row) => row.quiz_id))

  return courses.map((course) => {
    const plain = course.toJSON()
    const lectures = (plain.Chapters || []).flatMap((chapter) => chapter.Lectures || [])
    const quizzes = lectures.flatMap((lecture) => lecture.LectureQuiz ? [lecture.LectureQuiz] : [])
    const hasAnyProgress = lectures.some((lecture) => touchedLectureIds.has(lecture.id)) ||
      quizzes.some((quiz) => attemptedQuizIds.has(quiz.id))
    const completedLectures = lectures.filter((lecture) => completedLectureIds.has(lecture.id)).length
    const attemptedQuizzes = quizzes.filter((quiz) => attemptedQuizIds.has(quiz.id)).length
    const totalItems = lectures.length + quizzes.length
    const completedItems = completedLectures + attemptedQuizzes

    return {
      id: plain.id,
      title: plain.title,
      category: plain.category,
      completedLectures,
      totalLectures: lectures.length,
      attemptedQuizzes,
      totalQuizzes: quizzes.length,
      percent: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
      hasAnyProgress,
    }
  }).filter((summary) => summary.hasAnyProgress)
}

module.exports = {
  getUserProgressSummary,
}
