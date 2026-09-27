require('dotenv').config()
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/wellness_academy', {
  dialect: 'postgres',
  logging: false,
})

// Import models
defineModels(sequelize)

function defineModels(sequelize) {
  const User = require('../models/user')(sequelize)
  const Course = require('../models/course')(sequelize)
  const Book = require('../models/book')(sequelize)
  const Chapter = require('../models/chapter')(sequelize)
  const Section = require('../models/section')(sequelize)
  const Lecture = require('../models/lecture')(sequelize)
  const Note = require('../models/note')(sequelize)
  const Notebook = require('../models/notebook')(sequelize)
  const NotebookPage = require('../models/notebookpage')(sequelize)
  const Quiz = require('../models/quiz')(sequelize)
  const QuizQuestion = require('../models/quizquestion')(sequelize)
  const LectureQuiz = require('../models/lecturequiz')(sequelize)
  const LectureQuizQuestion = require('../models/lecturequizquestion')(sequelize)
  const QuizAttempt = require('../models/quizattempt')(sequelize)
  const QuizAnswer = require('../models/quizanswer')(sequelize)
  const Attachment = require('../models/attachment')(sequelize)
  const UserProgress = require('../models/userprogress')(sequelize)
  const Notification = require('../models/notification')(sequelize)

  // Associations
  Course.hasMany(Chapter, { foreignKey: 'course_id' })
  Chapter.belongsTo(Course, { foreignKey: 'course_id' })

  Chapter.hasMany(Section, { foreignKey: 'chapter_id' })
  Section.belongsTo(Chapter, { foreignKey: 'chapter_id' })

  Chapter.hasMany(Lecture, { foreignKey: 'chapter_id' })
  Lecture.belongsTo(Chapter, { foreignKey: 'chapter_id' })

  Section.hasMany(Lecture, { foreignKey: 'section_id' })
  Lecture.belongsTo(Section, { foreignKey: 'section_id' })

  Lecture.hasMany(Note, { foreignKey: 'lecture_id' })
  Note.belongsTo(Lecture, { foreignKey: 'lecture_id' })

  User.hasMany(Note, { foreignKey: 'user_id' })
  Note.belongsTo(User, { foreignKey: 'user_id' })

  User.hasMany(Notebook, { foreignKey: 'user_id' })
  Notebook.belongsTo(User, { foreignKey: 'user_id' })

  Notebook.hasMany(NotebookPage, { foreignKey: 'notebook_id' })
  NotebookPage.belongsTo(Notebook, { foreignKey: 'notebook_id' })

  Lecture.hasMany(Attachment, { foreignKey: 'lecture_id' })
  Attachment.belongsTo(Lecture, { foreignKey: 'lecture_id' })

  Chapter.hasOne(Quiz, { foreignKey: 'chapter_id' })
  Quiz.belongsTo(Chapter, { foreignKey: 'chapter_id' })

  Lecture.hasOne(LectureQuiz, { foreignKey: 'lecture_id' })
  LectureQuiz.belongsTo(Lecture, { foreignKey: 'lecture_id' })

  Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id' })
  QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id' })

  LectureQuiz.hasMany(LectureQuizQuestion, { foreignKey: 'quiz_id' })
  LectureQuizQuestion.belongsTo(LectureQuiz, { foreignKey: 'quiz_id' })

  User.hasMany(QuizAttempt, { foreignKey: 'user_id' })
  QuizAttempt.belongsTo(User, { foreignKey: 'user_id' })

  LectureQuiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id' })
  QuizAttempt.belongsTo(LectureQuiz, { foreignKey: 'quiz_id' })

  QuizAttempt.hasMany(QuizAnswer, { foreignKey: 'attempt_id' })
  QuizAnswer.belongsTo(QuizAttempt, { foreignKey: 'attempt_id' })

  LectureQuizQuestion.hasMany(QuizAnswer, { foreignKey: 'question_id' })
  QuizAnswer.belongsTo(LectureQuizQuestion, { foreignKey: 'question_id' })

  User.hasMany(UserProgress, { foreignKey: 'user_id' })
  UserProgress.belongsTo(User, { foreignKey: 'user_id' })

  Lecture.hasMany(UserProgress, { foreignKey: 'lecture_id' })
  UserProgress.belongsTo(Lecture, { foreignKey: 'lecture_id' })

  User.hasMany(Notification, { foreignKey: 'user_id' })
  Notification.belongsTo(User, { foreignKey: 'user_id' })

  Course.hasMany(Notification, { foreignKey: 'course_id' })
  Notification.belongsTo(Course, { foreignKey: 'course_id' })

  Chapter.hasMany(Notification, { foreignKey: 'chapter_id' })
  Notification.belongsTo(Chapter, { foreignKey: 'chapter_id' })

  Section.hasMany(Notification, { foreignKey: 'section_id' })
  Notification.belongsTo(Section, { foreignKey: 'section_id' })

  // Export models
  sequelize.models = {
    User,
    Course,
    Book,
    Chapter,
    Section,
    Lecture,
    Note,
    Notebook,
    NotebookPage,
    Quiz,
    QuizQuestion,
    LectureQuiz,
    LectureQuizQuestion,
    QuizAttempt,
    QuizAnswer,
    Attachment,
    UserProgress,
    Notification,
  }
}

module.exports = sequelize
