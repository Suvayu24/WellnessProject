const pool = require('../config/db')
const bcrypt = require('bcrypt')

const createUser = async (name, email, password, address, phone_number, profile_pic) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await pool.query(
    'INSERT INTO users (name, email, password, address, phone_number, profile_pic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, address, phone_number, profile_pic',
    [name, email, hashedPassword, address, phone_number, profile_pic]
  )
  return result.rows[0]
}

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0]
}

const getUserById = async (userId) => {
  const result = await pool.query(
    'SELECT id, name, email, address, phone_number, profile_pic FROM users WHERE id = $1',
    [userId]
  )
  return result.rows[0]
}

const updateUserProfile = async (userId, name, address, phone_number, profile_pic) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, address = $2, phone_number = $3, profile_pic = $4 WHERE id = $5 RETURNING id, name, email, address, phone_number, profile_pic',
    [name, address, phone_number, profile_pic, userId]
  )
  return result.rows[0]
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile,
}
