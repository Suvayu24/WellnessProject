const pool = require('../config/db')

const getAllCourses = async () => {
  const result = await pool.query(`
    SELECT 
      c.id, c.title, c.category, c.subtitle, c.description,
      COUNT(DISTINCT ch.id) as chapter_count
    FROM courses c
    LEFT JOIN chapters ch ON c.id = ch.course_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `)
  return result.rows
}

const getCourseById = async (courseId) => {
  const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId])
  const course = courseResult.rows[0]

  if (!course) return null

  const chaptersResult = await pool.query(
    `SELECT id, title, description, chapter_order FROM chapters WHERE course_id = $1 ORDER BY chapter_order`,
    [courseId]
  )

  const chapters = await Promise.all(
    chaptersResult.rows.map(async (chapter) => {
      const lecturesResult = await pool.query(
        `SELECT id, title, video_id, thumbnail, description, lecture_order FROM lectures WHERE chapter_id = $1 ORDER BY lecture_order`,
        [chapter.id]
      )
      return { ...chapter, lectures: lecturesResult.rows }
    })
  )

  return { ...course, chapters }
}

const createCourse = async (title, category, subtitle, description) => {
  const result = await pool.query(
    'INSERT INTO courses (title, category, subtitle, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, category, subtitle, description]
  )
  return result.rows[0]
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
}
