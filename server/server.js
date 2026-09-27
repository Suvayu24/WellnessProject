require('dotenv').config()
const express = require('express')
const cors = require('cors')
const courseRoutes = require('./routes/courses')
const bookRoutes = require('./routes/books')
const chapterRoutes = require('./routes/chapters')
const sectionRoutes = require('./routes/sections')
const lectureRoutes = require('./routes/lectures')
const noteRoutes = require('./routes/notes')
const notebookRoutes = require('./routes/notebooks')
const attachmentRoutes = require('./routes/attachments')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const progressRoutes = require('./routes/progress')
const quizRoutes = require('./routes/quizzes')
const notificationRoutes = require('./routes/notifications')
const adminCentreRoutes = require('./routes/adminCentre')
const sequelize = require('./config/db')
const setupAdmin = require('./admin')
const backfillSections = require('./utils/backfillSections')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true })
    await backfillSections()
    await setupAdmin(app, sequelize)
    console.log('Database synced!')
  } catch (err) {
    console.error('DB sync error:', err)
  }

  app.use('/api/courses', courseRoutes)
  app.use('/api/books', bookRoutes)
  app.use('/api/chapters', chapterRoutes)
  app.use('/api/sections', sectionRoutes)
  app.use('/api/lectures', lectureRoutes)
  app.use('/api/notes', noteRoutes)
  app.use('/api/notebooks', notebookRoutes)
  app.use('/api/attachments', attachmentRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/user', userRoutes)
  app.use('/api/progress', progressRoutes)
  app.use('/api/quizzes', quizRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/admin', adminCentreRoutes)

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`AdminJS available at http://localhost:${PORT}/admin`)
  })
}

startServer()
