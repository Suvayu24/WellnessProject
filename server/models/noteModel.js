const pool = require('../config/db')

const getUserNotes = async (userId, lectureId) => {
  const result = await pool.query(
    'SELECT * FROM user_notes WHERE user_id = $1 AND lecture_id = $2',
    [userId, lectureId]
  )
  return result.rows[0]
}

const saveUserNote = async (userId, lectureId, noteContent) => {
  const existingNote = await getUserNotes(userId, lectureId)

  if (existingNote) {
    const result = await pool.query(
      'UPDATE user_notes SET note_content = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND lecture_id = $3 RETURNING *',
      [noteContent, userId, lectureId]
    )
    return result.rows[0]
  } else {
    const result = await pool.query(
      'INSERT INTO user_notes (user_id, lecture_id, note_content) VALUES ($1, $2, $3) RETURNING *',
      [userId, lectureId, noteContent]
    )
    return result.rows[0]
  }
}

const getAllUserNotes = async (userId) => {
  const result = await pool.query('SELECT * FROM user_notes WHERE user_id = $1 ORDER BY updated_at DESC', [userId])
  return result.rows
}

module.exports = {
  getUserNotes,
  saveUserNote,
  getAllUserNotes,
}
