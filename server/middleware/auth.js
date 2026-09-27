const jwt = require('jsonwebtoken')
const sequelize = require('../config/db')
const { hasAdministratorAccess, isSuperuserEmail } = require('../utils/userAccess')

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await sequelize.models.User.findByPk(decoded.id)
    if (!user) return res.status(401).json({ error: 'Invalid token' })

    req.userId = user.id
    req.userEmail = user.email
    req.isSuperuser = isSuperuserEmail(user.email)
    req.isAdmin = hasAdministratorAccess(user)
    next()
  } catch (err) {
    console.error('Token verification error:', err)
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = verifyToken
