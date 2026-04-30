const express = require('express')
const verifyToken = require('../middleware/auth')
const { getUserById, updateUserProfile } = require('../models/userModel')

const router = express.Router()

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, address, phone_number, profile_pic } = req.body
    const user = await updateUserProfile(req.userId, name, address, phone_number, profile_pic)
    res.json(user)
  } catch (err) {
    console.error('Error updating profile:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

module.exports = router
