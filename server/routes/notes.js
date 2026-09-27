const express = require('express')
const router = express.Router()
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { Note, Lecture, Chapter, Course } = sequelize.models

router.get('/me', verifyToken, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Lecture,
          include: [{ model: Chapter, include: [Course] }],
        },
      ],
      order: [['created_at', 'DESC']],
    })

    res.json(notes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all notes for the logged-in user on a lecture
router.get('/lecture/:lectureId', verifyToken, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { lecture_id: req.params.lectureId, user_id: req.userId },
      order: [['created_at', 'DESC']],
    })
    res.json(notes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create a note
router.post('/', verifyToken, async (req, res) => {
  try {
    const { lecture_id, text } = req.body
    if (!lecture_id || !text?.trim()) return res.status(400).json({ error: 'Lecture and note text are required' })

    const lecture = await Lecture.findByPk(lecture_id)
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' })

    const note = await Note.create({ lecture_id, text: text.trim(), user_id: req.userId })
    res.status(201).json(note)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a note
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.id, user_id: req.userId } })
    if (!deleted) return res.status(404).json({ error: 'Note not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
