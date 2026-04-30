require('dotenv').config()
const pool = require('../config/db')

const seedDatabase = async () => {
  const client = await pool.connect()
  try {
    console.log('Seeding database...')

    // Insert courses
    const courseResult = await client.query(`
      INSERT INTO courses (title, category, subtitle, description)
      VALUES 
        ('Web Development', 'Development', 'React - Node.js - PostgreSQL', 'Build modern web applications with React and Node.js'),
        ('UI/UX Design', 'Design', 'Figma - Design Systems', 'Master interface and user experience design'),
        ('Data Science', 'Data', 'Python - ML - Analytics', 'Learn data analysis and machine learning')
      RETURNING id, title
    `)
    console.log('Inserted courses:', courseResult.rows)

    const [webDevCourse, designCourse, dataCourse] = courseResult.rows

    // Insert chapters for Web Development
    const chaptersResult = await client.query(`
      INSERT INTO chapters (course_id, title, description, chapter_order)
      VALUES 
        ($1, 'Introduction', 'Course overview and setup', 1),
        ($1, 'React Fundamentals', 'Learn JSX and components', 2),
        ($2, 'Design fundamentals', 'Principles of visual design', 1),
        ($3, 'Data fundamentals', 'Data cleaning and analysis', 1)
      RETURNING id, title, course_id
    `,
      [webDevCourse.id, designCourse.id, dataCourse.id]
    )
    console.log('Inserted chapters')

    // Insert lectures
    await client.query(`
      INSERT INTO lectures (chapter_id, title, video_id, thumbnail, description, lecture_order)
      VALUES 
        ($1, 'Welcome to the course', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg', 'Course introduction', 1),
        ($1, 'Setup and first app', '3fumBcKC6RE', 'https://img.youtube.com/vi/3fumBcKC6RE/0.jpg', 'Environment setup', 2),
        ($2, 'JSX and components', 'Ke90Tje7VS0', 'https://img.youtube.com/vi/Ke90Tje7VS0/0.jpg', 'React components', 1),
        ($2, 'State and lifecycle', '0riHps91AzE', 'https://img.youtube.com/vi/0riHps91AzE/0.jpg', 'State management', 2)
    `,
      [chaptersResult.rows[0].id, chaptersResult.rows[1].id, chaptersResult.rows[1].id]
    )
    console.log('Inserted lectures')

    console.log('Database seeded successfully!')
  } catch (err) {
    console.error('Error seeding database:', err)
  } finally {
    client.release()
    pool.end()
  }
}

seedDatabase()
