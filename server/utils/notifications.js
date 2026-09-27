const sequelize = require('../config/db')
const { buildCourseProgressState } = require('./courseProgress')

const { Course, Notification } = sequelize.models

const coursePercent = (state) => {
  const lectures = state?.lectures || []
  const quizzes = lectures.filter((lecture) => lecture.LectureQuiz)
  const totalItems = lectures.length + quizzes.length

  if (!totalItems) return 0

  const completedLectures = lectures.filter((lecture) => state.lectureState.get(lecture.id)?.progress?.completed).length
  const attemptedQuizzes = quizzes.filter((lecture) => state.lectureState.get(lecture.id)?.quizAttempted).length

  return Math.round(((completedLectures + attemptedQuizzes) / totalItems) * 100)
}

const createOnce = async (data) => {
  try {
    await Notification.findOrCreate({
      where: { notification_key: data.notification_key },
      defaults: data,
    })
  } catch (err) {
    if (err.name !== 'SequelizeUniqueConstraintError') throw err
  }
}

const createCurrentProgressNotifications = async ({ userId, course, state }) => {
  if (!userId || !course || !state) return

  const courseId = course.id
  const courseTitle = course.title || `course ${courseId}`
  const chaptersById = new Map((state.chapters || []).map((chapter) => [chapter.id, chapter]))

  for (const section of state.sections || []) {
    const completed = Boolean(state.sectionState.get(section.id)?.completed)
    if (!completed) continue

    const chapter = chaptersById.get(section.chapter_id)
    const chapterTitle = chapter?.title || `chapter ${section.chapter_id}`
    const sectionTitle = section.title || `section ${section.id}`

    await createOnce({
      user_id: userId,
      course_id: courseId,
      chapter_id: section.chapter_id,
      section_id: section.id,
      type: 'section_completed',
      notification_key: `user:${userId}:section:${section.id}:completed`,
      title: 'Section completed',
      message: `Congrats for completing section ${sectionTitle} of chapter ${chapterTitle} of course ${courseTitle}.`,
    })
  }

  for (const chapter of state.chapters || []) {
    const completed = Boolean(state.chapterState.get(chapter.id)?.completed)
    if (!completed) continue

    const chapterTitle = chapter.title || `chapter ${chapter.id}`

    await createOnce({
      user_id: userId,
      course_id: courseId,
      chapter_id: chapter.id,
      type: 'chapter_completed',
      notification_key: `user:${userId}:chapter:${chapter.id}:completed`,
      title: 'Chapter completed',
      message: `Congrats for completing chapter ${chapterTitle} of course ${courseTitle}.`,
    })
  }

  const percent = coursePercent(state)

  if (percent >= 50) {
    await createOnce({
      user_id: userId,
      course_id: courseId,
      type: 'course_half_completed',
      notification_key: `user:${userId}:course:${courseId}:50`,
      title: 'Halfway there',
      message: `Congrats for completing 50% of ${courseTitle}. Keep going.`,
      milestone_percent: 50,
    })
  }

  if (percent >= 100) {
    await createOnce({
      user_id: userId,
      course_id: courseId,
      type: 'course_completed',
      notification_key: `user:${userId}:course:${courseId}:100`,
      title: 'Course completed',
      message: `Congrats for completing 100% of ${courseTitle}.`,
      milestone_percent: 100,
    })
  }
}

const ensureCurrentProgressNotifications = async (userId) => {
  if (!userId) return

  const courses = await Course.findAll({
    attributes: ['id', 'title'],
    order: [['id', 'ASC']],
  })

  for (const course of courses) {
    const plainCourse = course.toJSON ? course.toJSON() : course
    const state = await buildCourseProgressState(userId, plainCourse.id)
    await createCurrentProgressNotifications({
      userId,
      course: plainCourse,
      state,
    })
  }
}

const generateProgressNotifications = async ({ userId, courseId, beforeState }) => {
  if (!userId || !courseId || !beforeState) return

  const [course, afterState] = await Promise.all([
    Course.findByPk(courseId),
    buildCourseProgressState(userId, courseId),
  ])

  if (!course) return

  const courseTitle = course.title || `course ${courseId}`
  const chaptersById = new Map((afterState.chapters || []).map((chapter) => [chapter.id, chapter]))

  for (const section of afterState.sections || []) {
    const beforeCompleted = Boolean(beforeState.sectionState.get(section.id)?.completed)
    const afterCompleted = Boolean(afterState.sectionState.get(section.id)?.completed)
    if (beforeCompleted || !afterCompleted) continue

    const chapter = chaptersById.get(section.chapter_id)
    const chapterTitle = chapter?.title || `chapter ${section.chapter_id}`
    const sectionTitle = section.title || `section ${section.id}`

    await createOnce({
      user_id: userId,
      course_id: courseId,
      chapter_id: section.chapter_id,
      section_id: section.id,
      type: 'section_completed',
      notification_key: `user:${userId}:section:${section.id}:completed`,
      title: 'Section completed',
      message: `Congrats for completing section ${sectionTitle} of chapter ${chapterTitle} of course ${courseTitle}.`,
    })
  }

  for (const chapter of afterState.chapters || []) {
    const beforeCompleted = Boolean(beforeState.chapterState.get(chapter.id)?.completed)
    const afterCompleted = Boolean(afterState.chapterState.get(chapter.id)?.completed)
    if (beforeCompleted || !afterCompleted) continue

    const chapterTitle = chapter.title || `chapter ${chapter.id}`

    await createOnce({
      user_id: userId,
      course_id: courseId,
      chapter_id: chapter.id,
      type: 'chapter_completed',
      notification_key: `user:${userId}:chapter:${chapter.id}:completed`,
      title: 'Chapter completed',
      message: `Congrats for completing chapter ${chapterTitle} of course ${courseTitle}.`,
    })
  }

  const afterPercent = coursePercent(afterState)

  if (afterPercent >= 50) {
    await createOnce({
      user_id: userId,
      course_id: courseId,
      type: 'course_half_completed',
      notification_key: `user:${userId}:course:${courseId}:50`,
      title: 'Halfway there',
      message: `Congrats for completing 50% of ${courseTitle}. Keep going.`,
      milestone_percent: 50,
    })
  }

  if (afterPercent >= 100) {
    await createOnce({
      user_id: userId,
      course_id: courseId,
      type: 'course_completed',
      notification_key: `user:${userId}:course:${courseId}:100`,
      title: 'Course completed',
      message: `Congrats for completing 100% of ${courseTitle}.`,
      milestone_percent: 100,
    })
  }
}

module.exports = {
  ensureCurrentProgressNotifications,
  generateProgressNotifications,
}
