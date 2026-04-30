const express = require('express')
const { saveUserNote, getUserNotes, getAllUserNotes } = require('../models/noteModel')
const verifyToken = require('../middleware/auth')

const router = express.Router()

router.post('/save', verifyToken, async (req, res) => {
  try {
    const { lectureId, noteContent } = req.body
    const userId = req.userId

    const note = await saveUserNote(userId, lectureId, noteContent)
    res.json(note)
  } catch (err) {
    console.error('Error saving note:', err)
    res.status(500).json({ error: 'Failed to save note' })
  }
})

router.get('/:lectureId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    const lectureId = req.params.lectureId

    const note = await getUserNotes(userId, lectureId)
    res.json(note || {})
  } catch (err) {
    console.error('Error fetching note:', err)
    res.status(500).json({ error: 'Failed to fetch note' })
  }
})

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    const notes = await getAllUserNotes(userId)
    res.json(notes)
  } catch (err) {
    console.error('Error fetching notes:', err)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

module.exports = router
