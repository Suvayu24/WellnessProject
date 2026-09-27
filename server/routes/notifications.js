const express = require('express')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { ensureCurrentProgressNotifications } = require('../utils/notifications')

const { Notification, Course, Chapter, Section } = sequelize.models
const router = express.Router()

router.get('/', verifyToken, async (req, res) => {
  try {
    await ensureCurrentProgressNotifications(req.userId)

    const notifications = await Notification.findAll({
      where: { user_id: req.userId },
      include: [Course, Chapter, Section],
      order: [
        ['read_at', 'ASC'],
        ['created_at', 'DESC'],
      ],
    })

    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    await ensureCurrentProgressNotifications(req.userId)

    const count = await Notification.count({
      where: {
        user_id: req.userId,
        read_at: null,
      },
    })

    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.update(
      { read_at: new Date() },
      { where: { user_id: req.userId, read_at: null } }
    )

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.userId },
      include: [Course, Chapter, Section],
    })

    if (!notification) return res.status(404).json({ error: 'Notification not found' })

    if (!notification.read_at) {
      await notification.update({ read_at: new Date() })
    }

    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.userId },
    })

    if (!notification) return res.status(404).json({ error: 'Notification not found' })

    await notification.update({ read_at: notification.read_at || new Date() })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
