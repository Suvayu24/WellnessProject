const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    req.userEmail = decoded.email
    next()
  } catch (err) {
    console.error('Token verification error:', err)
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = verifyToken
