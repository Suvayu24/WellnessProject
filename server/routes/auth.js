const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { ADMIN_EMAIL, publicUser } = require('../utils/userAccess')
const { User } = sequelize.models

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'
const ADMIN_PASSWORD = 'admin123'

const ensureAdminUser = async () => {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const [admin] = await User.findOrCreate({
    where: { email: ADMIN_EMAIL },
    defaults: {
      name: 'Admin',
      username: 'Admin',
      email: ADMIN_EMAIL,
      password: hash,
      password_hash: hash,
      admin_access: true,
    },
  })

  await admin.update({
    name: admin.name || 'Admin',
    username: admin.username || 'Admin',
    password: hash,
    password_hash: hash,
    admin_access: true,
  })

  return admin
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const normalizedEmail = email.toLowerCase().trim()
    const displayName = username.trim()
    if (!displayName) return res.status(400).json({ error: 'Username is required' })
    if (normalizedEmail === ADMIN_EMAIL) return res.status(400).json({ error: 'This email is reserved for admin access' })
    const existingEmail = await User.findOne({ where: { email: normalizedEmail } })
    if (existingEmail) return res.status(400).json({ error: 'Email already taken' })

    const existingUsername = await User.findOne({ where: { username: displayName } })
    if (existingUsername) return res.status(400).json({ error: 'Username already taken' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: displayName,
      username: displayName,
      email: normalizedEmail,
      password: hash,
      password_hash: hash,
    })
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: publicUser(user) })
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const fields = err.errors?.map((error) => error.path) || []
      if (fields.includes('email')) return res.status(400).json({ error: 'Email already taken' })
      if (fields.includes('username')) return res.status(400).json({ error: 'Username already taken' })
    }

    res.status(500).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const normalizedEmail = email.toLowerCase().trim()
    if (normalizedEmail === ADMIN_EMAIL) await ensureAdminUser()

    const user = await User.findOne({ where: { email: normalizedEmail } })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const passwordHash = user.password_hash || user.password
    const match = await bcrypt.compare(password, passwordHash)
    if (!match) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
