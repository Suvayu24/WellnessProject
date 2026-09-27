const sequelize = require('../config/db')

const { Chapter, Section, Lecture, LectureQuiz, LectureQuizQuestion, UserProgress, QuizAttempt } = sequelize.models

const PASS_PERCENT = 0.4

const quizTotalMarks = (quiz) => {
  const questions = quiz?.LectureQuizQuestions || []
  return questions
    .filter((question) => question.type === 'mcq')
    .reduce((total, question) => total + (Number(question.marks) || 1), 0)
}

const quizPassThreshold = (quiz) => Math.floor(quizTotalMarks(quiz) * PASS_PERCENT)

const getBestAttempt = (attemptsByQuiz, quizId) => {
  const attempts = attemptsByQuiz.get(quizId) || []
  return attempts.reduce((best, attempt) => {
    if (!best || Number(attempt.score || 0) > Number(best.score || 0)) return attempt
    return best
  }, null)
}

const buildCourseProgressState = async (userId, courseId, options = {}) => {
  const isAdmin = Boolean(options.isAdmin)
  const chapters = await Chapter.findAll({
    where: { course_id: courseId },
    include: [{
      model: Section,
      include: [{
        model: Lecture,
        include: [{
          model: LectureQuiz,
          include: [LectureQuizQuestion],
        }],
      }],
    }],
    order: [
      ['chapter_number', 'ASC'],
      [Section, 'section_number', 'ASC'],
      [Section, Lecture, 'lecture_number', 'ASC'],
      [Section, Lecture, LectureQuiz, LectureQuizQuestion, 'question_order', 'ASC'],
    ],
  })

  const plainChapters = chapters.map((chapter) => chapter.toJSON())
  const sections = plainChapters.flatMap((chapter) =>
    (chapter.Sections || [])
      .sort((a, b) => a.section_number - b.section_number)
      .map((section) => ({ ...section, chapter_id: chapter.id }))
  )
  const lectures = sections.flatMap((section) =>
    (section.Lectures || [])
      .sort((a, b) => a.lecture_number - b.lecture_number)
      .map((lecture) => ({ ...lecture, chapter_id: section.chapter_id, section_id: section.id }))
  )
  const lectureIds = lectures.map((lecture) => lecture.id)
  const quizIds = lectures.flatMap((lecture) => lecture.LectureQuiz ? [lecture.LectureQuiz.id] : [])

  const progressRows = lectureIds.length
    ? await UserProgress.findAll({ where: { user_id: userId, lecture_id: lectureIds } })
    : []
  const attempts = quizIds.length
    ? await QuizAttempt.findAll({ where: { user_id: userId, quiz_id: quizIds } })
    : []

  const progressByLecture = new Map(progressRows.map((progress) => [progress.lecture_id, progress.toJSON ? progress.toJSON() : progress]))
  const attemptsByQuiz = attempts.reduce((map, attempt) => {
    const list = map.get(attempt.quiz_id) || []
    list.push(attempt.toJSON ? attempt.toJSON() : attempt)
    map.set(attempt.quiz_id, list)
    return map
  }, new Map())

  const lectureState = new Map()

  for (const lecture of lectures) {
    const progress = progressByLecture.get(lecture.id) || null
    const quiz = lecture.LectureQuiz || null
    const bestAttempt = quiz ? getBestAttempt(attemptsByQuiz, quiz.id) : null
    const totalMarks = quizTotalMarks(quiz)
    const threshold = quiz ? quizPassThreshold(quiz) : 0
    const quizPassed = !quiz || totalMarks <= 0 || Boolean(bestAttempt && Number(bestAttempt.score || 0) >= threshold)
    const sectionCompleted = Boolean(progress?.completed) && quizPassed

    lectureState.set(lecture.id, {
      progress,
      quizPassed,
      quizAttempted: Boolean(bestAttempt),
      quizScore: bestAttempt?.score ?? null,
      quizMaxScore: bestAttempt?.max_score ?? totalMarks,
      quizPassThreshold: threshold,
      sectionCompleted,
      isUnlocked: false,
    })
  }

  let previousLecturesComplete = true
  for (const lecture of lectures) {
    const state = lectureState.get(lecture.id)
    state.isUnlocked = isAdmin || previousLecturesComplete
    previousLecturesComplete = previousLecturesComplete && state.sectionCompleted
  }

  const sectionState = new Map()
  let previousSectionsComplete = true
  for (const section of sections) {
    const sectionLectures = lectures.filter((lecture) => lecture.section_id === section.id)
    const completedLectures = sectionLectures.filter((lecture) => lectureState.get(lecture.id)?.sectionCompleted).length
    const completed = sectionLectures.length > 0 && completedLectures === sectionLectures.length

    sectionState.set(section.id, {
      isUnlocked: isAdmin || previousSectionsComplete,
      completedLectures,
      totalLectures: sectionLectures.length,
      attemptedQuizzes: sectionLectures.filter((lecture) => lectureState.get(lecture.id)?.quizAttempted).length,
      passedQuizzes: sectionLectures.filter((lecture) => lectureState.get(lecture.id)?.quizPassed).length,
      totalQuizzes: sectionLectures.filter((lecture) => lecture.LectureQuiz).length,
      percent: sectionLectures.length ? Math.round((completedLectures / sectionLectures.length) * 100) : 0,
      completed,
    })
    previousSectionsComplete = previousSectionsComplete && completed
  }

  const chapterState = new Map()
  for (const chapter of plainChapters) {
    const chapterSections = sections.filter((section) => section.chapter_id === chapter.id)
    const firstSection = chapterSections[0]
    const isUnlocked = isAdmin || (firstSection ? sectionState.get(firstSection.id)?.isUnlocked : true)
    const completedSections = chapterSections.filter((section) => sectionState.get(section.id)?.completed).length

    chapterState.set(chapter.id, {
      isUnlocked,
      completedSections,
      totalSections: chapterSections.length,
      completedLectures: chapterSections.reduce((total, section) => total + (sectionState.get(section.id)?.completedLectures || 0), 0),
      totalLectures: chapterSections.reduce((total, section) => total + (sectionState.get(section.id)?.totalLectures || 0), 0),
      attemptedQuizzes: chapterSections.reduce((total, section) => total + (sectionState.get(section.id)?.attemptedQuizzes || 0), 0),
      passedQuizzes: chapterSections.reduce((total, section) => total + (sectionState.get(section.id)?.passedQuizzes || 0), 0),
      totalQuizzes: chapterSections.reduce((total, section) => total + (sectionState.get(section.id)?.totalQuizzes || 0), 0),
      percent: chapterSections.length ? Math.round((completedSections / chapterSections.length) * 100) : 0,
      completed: chapterSections.length > 0 && completedSections === chapterSections.length,
    })
  }

  return { chapters: plainChapters, sections, lectures, chapterState, sectionState, lectureState }
}

module.exports = {
  buildCourseProgressState,
  quizPassThreshold,
  quizTotalMarks,
}
