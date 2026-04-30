require('dotenv').config()
const express = require('express')
const cors = require('cors')
const courseRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const noteRoutes = require('./routes/notes')
const userRoutes = require('./routes/user')
const createTables = require('./models/init')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/courses', courseRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/user', userRoutes)

app.listen(PORT, async () => {
  await createTables()
  console.log(`Server running on port ${PORT}`)
})
