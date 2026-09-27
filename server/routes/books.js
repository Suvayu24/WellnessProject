const express = require('express')
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')

const { Book } = sequelize.models
const router = express.Router()

router.get('/', verifyToken, async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['id', 'ASC']],
    })
    res.json(books)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
