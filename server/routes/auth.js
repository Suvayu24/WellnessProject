const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { createUser, getUserByEmail } = require('../models/userModel')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address, phone_number } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const user = await createUser(name, email, password, address, phone_number)
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    res.json({ user, token })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password

    res.json({ user: userWithoutPassword, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router
