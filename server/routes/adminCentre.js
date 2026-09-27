const express = require('express')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')
const { getUserProgressSummary } = require('../utils/userProgressSummary')
const { publicProfile } = require('../utils/userAccess')

const { User } = sequelize.models
const router = express.Router()

const requireSuperuser = (req, res, next) => {
  if (!req.isSuperuser) return res.status(403).json({ error: 'Superuser access required' })
  next()
}

router.use(verifyToken, requireSuperuser)

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'username', 'email', 'profile_pic', 'admin_access'],
      order: [['username', 'ASC'], ['name', 'ASC']],
    })

    res.json(users.map(publicProfile))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/users/:userId/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(publicProfile(user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/users/:userId/progress-summary', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(await getUserProgressSummary(user.id))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/users/:userId/admin-access', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.email?.toLowerCase() === req.userEmail?.toLowerCase()) {
      return res.status(400).json({ error: 'The superuser account cannot be changed here' })
    }

    await user.update({ admin_access: Boolean(req.body.adminAccess) })
    res.json(publicProfile(user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
