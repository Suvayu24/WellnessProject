const session = require('express-session')

const setupAdmin = async (app, sequelize) => {
  const [{ AdminJS }, AdminJSExpress, { Database, Resource }] = await Promise.all([
    import('adminjs'),
    import('@adminjs/express'),
    import('@adminjs/sequelize'),
  ])

  AdminJS.registerAdapter({ Database, Resource })

const {
  User,
  Course,
  Book,
  Chapter,
  Section,
  Lecture,
  Attachment,
  LectureQuiz,
  LectureQuizQuestion,
  QuizAttempt,
    QuizAnswer,
    Note,
    Notebook,
    NotebookPage,
    UserProgress,
    Notification,
} = sequelize.models


  const admin = new AdminJS({
    rootPath: '/admin',
    branding: {
      companyName: 'Wellness Admin',
      softwareBrothers: false,
    },
    resources: [
      { resource: Course, options: { navigation: { name: 'Learning' } } },
      { resource: Chapter, options: { navigation: { name: 'Learning' } } },
      { resource: Section, options: { navigation: { name: 'Learning' } } },
      { resource: Lecture, options: { navigation: { name: 'Learning' } } },
      { resource: Attachment, options: { navigation: { name: 'Learning' } } },
      { resource: Book, options: { navigation: { name: 'Library' } } },
      { resource: LectureQuiz, options: { navigation: { name: 'Quizzes' } } },
      {
        resource: LectureQuizQuestion,
        options: {
          navigation: { name: 'Quizzes' },
          properties: {
            options: {
              type: 'mixed',
              props: {
                placeholder: '[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]',
              },
            },
            correct_option_ids: {
              type: 'mixed',
              props: {
                placeholder: '["a"]',
              },
            },
          },
        },
      },
      { resource: QuizAttempt, options: { navigation: { name: 'Quizzes' }, actions: { new: { isAccessible: false }, edit: { isAccessible: false } } } },
      { resource: QuizAnswer, options: { navigation: { name: 'Quizzes' }, actions: { new: { isAccessible: false }, edit: { isAccessible: false } } } },
      {
        resource: User,
        options: {
          navigation: { name: 'Users' },
          properties: {
            password: { isVisible: false },
            password_hash: { isVisible: false },
          },
          actions: {
            new: { isAccessible: false },
            edit: {
              before: async (request) => {
                if (request.payload) {
                  delete request.payload.password
                  delete request.payload.password_hash
                }
                return request
              },
            },
          },
        },
      },
      { resource: Note, options: { navigation: { name: 'Users' } } },
      { resource: Notebook, options: { navigation: { name: 'Users' } } },
      { resource: NotebookPage, options: { navigation: { name: 'Users' } } },
      { resource: UserProgress, options: { navigation: { name: 'Users' } } },
      { resource: Notification, options: { navigation: { name: 'Users' }, actions: { new: { isAccessible: false } } } },
    ],
  })

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const cookiePassword = process.env.ADMIN_COOKIE_SECRET || 'replace-this-admin-cookie-secret'

  const router = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      cookieName: 'wellness_admin',
      cookiePassword,
      authenticate: async (email, password) => {
        if (email === adminEmail && password === adminPassword) {
          return { email }
        }
        return null
      },
    },
    null,
    {
      resave: false,
      saveUninitialized: false,
      secret: cookiePassword,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
      },
    }
  )

  app.use(admin.options.rootPath, router)
  return admin
}

module.exports = setupAdmin
