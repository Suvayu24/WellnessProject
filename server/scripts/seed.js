require('dotenv').config()
const bcrypt = require('bcrypt')
const sequelize = require('../config/db')

const {
  User,
  Course,
  Book,
  Chapter,
  Section,
  Lecture,
  Attachment,
  Quiz,
  QuizQuestion,
  LectureQuiz,
  LectureQuizQuestion,
  QuizAttempt,
  QuizAnswer,
  Note,
  UserProgress,
} = sequelize.models

const youtubeThumb = (videoId) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
const dummyPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
const dummyReaderUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(dummyPdfUrl)}`

const findOrCreateCourse = async (course) => {
  const existing = await Course.findOne({ where: { title: course.title } })
  if (existing) {
    await existing.update(course)
    return existing
  }

  return Course.create(course)
}

const findOrCreateChapter = async (chapter) => {
  const existing = await Chapter.findOne({
    where: {
      course_id: chapter.course_id,
      chapter_number: chapter.chapter_number,
    },
  })

  if (existing) {
    await existing.update(chapter)
    return existing
  }

  return Chapter.create(chapter)
}

const findOrCreateSection = async (section) => {
  const existing = await Section.findOne({
    where: {
      chapter_id: section.chapter_id,
      section_number: section.section_number,
    },
  })

  if (existing) {
    await existing.update(section)
    return existing
  }

  return Section.create(section)
}

const findOrCreateLecture = async (lecture) => {
  const existing = await Lecture.findOne({
    where: {
      chapter_id: lecture.chapter_id,
      lecture_number: lecture.lecture_number,
    },
  })

  if (existing) {
    await existing.update(lecture)
    return existing
  }

  return Lecture.create(lecture)
}

const seedDatabase = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })

    console.log('Seeding dummy data...')

    const passwordHash = await bcrypt.hash('password123', 10)
    const adminPasswordHash = await bcrypt.hash('admin123', 10)
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin',
        username: 'Admin',
        email: 'admin@example.com',
        password: adminPasswordHash,
        password_hash: adminPasswordHash,
        admin_access: true,
      },
    })

    await adminUser.update({
      name: 'Admin',
      username: adminUser.username || 'Admin',
      password: adminPasswordHash,
      password_hash: adminPasswordHash,
      admin_access: true,
    })

    const [demoUser] = await User.findOrCreate({
      where: { email: 'student@example.com' },
      defaults: {
        name: 'Demo Student',
        username: 'Demo Student',
        email: 'student@example.com',
        password: passwordHash,
        password_hash: passwordHash,
        address: 'Learning Lane',
        phone_number: '9999999999',
      },
    })

    await demoUser.update({
      name: 'Demo Student',
      username: 'Demo Student',
      password: demoUser.password || passwordHash,
      password_hash: demoUser.password_hash || passwordHash,
    })

    const courses = [
      {
        title: 'Full Stack Web Development',
        category: 'Development',
        subtitle: 'React, Node, Express, PostgreSQL',
        description: 'Build practical web applications with a modern JavaScript stack.',
        thumbnail_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
        chapters: [
          {
            chapter_number: 1,
            title: 'Getting Started',
            description: 'Set up your tools and understand the project structure.',
            lectures: [
              {
                lecture_number: 1,
                title: 'Welcome and roadmap',
                description: 'A quick walkthrough of what you will build in this course.',
                video_id: 'dQw4w9WgXcQ',
              },
              {
                lecture_number: 2,
                title: 'Project setup',
                description: 'Install dependencies, start the dev servers, and connect the app.',
                video_id: '3fumBcKC6RE',
              },
            ],
          },
          {
            chapter_number: 2,
            title: 'React Fundamentals',
            description: 'Learn components, props, state, routing, and data fetching.',
            lectures: [
              {
                lecture_number: 1,
                title: 'Components and props',
                description: 'Break interfaces into reusable, focused components.',
                video_id: 'Ke90Tje7VS0',
              },
              {
                lecture_number: 2,
                title: 'State and effects',
                description: 'Use React state and effects to build interactive screens.',
                video_id: '0riHps91AzE',
              },
            ],
          },
        ],
      },
      {
        title: 'Mindful Wellness Foundations',
        category: 'Wellness',
        subtitle: 'Habits, reflection, practical routines',
        description: 'Learn simple mental wellness habits and reflective daily practices.',
        thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
        chapters: [
          {
            chapter_number: 1,
            title: 'Daily Practice',
            description: 'Build small routines that are easy to repeat.',
            lectures: [
              {
                lecture_number: 1,
                title: 'The two-minute reset',
                description: 'A short grounding practice for busy learning days.',
                video_id: 'inpok4MKVLM',
              },
              {
                lecture_number: 2,
                title: 'Design your habit loop',
                description: 'Create cues and rewards that make routines stick.',
                video_id: 'ZToicYcHIOU',
              },
            ],
          },
        ],
      },
      {
        title: 'UI UX Design Essentials',
        category: 'Design',
        subtitle: 'Layout, hierarchy, accessibility',
        description: 'Understand the foundations of clean and usable interface design.',
        thumbnail_url: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=900&q=80',
        chapters: [
          {
            chapter_number: 1,
            title: 'Visual Foundations',
            description: 'Use spacing, type, and contrast to make better screens.',
            lectures: [
              {
                lecture_number: 1,
                title: 'Hierarchy and spacing',
                description: 'Make content easier to scan with consistent visual rhythm.',
                video_id: 'wIuVvCuiJhU',
              },
            ],
          },
        ],
      },
    ]

    const books = [
      {
        title: 'The Wellness Workbook',
        author: 'Wellness Academy',
        category: 'Reflection',
        description: 'Short prompts and practices for building a steady daily routine.',
        cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80',
        pdf_url: dummyPdfUrl,
        reader_url: dummyReaderUrl,
      },
      {
        title: 'Mindful Habits',
        author: 'Wellness Academy',
        category: 'Habits',
        description: 'A practical reader for small habits, tracking, and reflection.',
        cover_url: 'https://images.unsplash.com/photo-1455885666463-9b1c0b5b01a1?auto=format&fit=crop&w=700&q=80',
        pdf_url: dummyPdfUrl,
        reader_url: dummyReaderUrl,
      },
      {
        title: 'Learning Notes',
        author: 'Wellness Academy',
        category: 'Study',
        description: 'A compact guide for reviewing lessons and turning notes into action.',
        cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=80',
        pdf_url: dummyPdfUrl,
        reader_url: dummyReaderUrl,
      },
    ]

    for (const book of books) {
      const existing = await Book.findOne({ where: { title: book.title } })
      if (existing) {
        await existing.update(book)
      } else {
        await Book.create(book)
      }
    }

    const seededLectures = []

    for (const courseData of courses) {
      const { chapters, ...courseFields } = courseData
      const course = await findOrCreateCourse(courseFields)

      for (const chapterData of chapters) {
        const { lectures, sections, ...chapterFields } = chapterData
        const chapter = await findOrCreateChapter({
          ...chapterFields,
          course_id: course.id,
        })

        const [chapterQuiz] = await Quiz.findOrCreate({
          where: { chapter_id: chapter.id },
          defaults: {
            chapter_id: chapter.id,
            title: `${chapter.title} Checkpoint`,
          },
        })
        await chapterQuiz.update({ title: `${chapter.title} Checkpoint` })
        await QuizQuestion.destroy({ where: { quiz_id: chapterQuiz.id } })
        await QuizQuestion.bulkCreate([
          {
            quiz_id: chapterQuiz.id,
            question_text: `What is the chapter "${chapter.title}" about?`,
            options: ['Learning the topic', 'Ignoring lectures', 'Deleting notes', 'Skipping all content'],
            correct_answer: 'Learning the topic',
          },
        ])

        const sectionDataList = sections || [{
          section_number: 1,
          title: `${chapter.title} Section`,
          description: chapter.description,
          lectures: lectures || [],
        }]

        for (const sectionData of sectionDataList) {
          const { lectures: sectionLectures, ...sectionFields } = sectionData
          const section = await findOrCreateSection({
            ...sectionFields,
            chapter_id: chapter.id,
          })

        for (const lectureData of sectionLectures || []) {
          const lecture = await findOrCreateLecture({
            ...lectureData,
            thumbnail: youtubeThumb(lectureData.video_id),
            chapter_id: chapter.id,
            section_id: section.id,
          })
          seededLectures.push(lecture)

          const [quiz] = await LectureQuiz.findOrCreate({
            where: { lecture_id: lecture.id },
            defaults: {
              lecture_id: lecture.id,
              title: `${lecture.title} Quiz`,
            },
          })
          await quiz.update({
            lecture_id: lecture.id,
            title: `${lecture.title} Quiz`,
          })

          await LectureQuizQuestion.destroy({ where: { quiz_id: quiz.id } })
          await LectureQuizQuestion.bulkCreate([
            {
              quiz_id: quiz.id,
              question_order: 1,
              type: 'mcq',
              question_text: `Which actions help you learn from "${lecture.title}"?`,
              options: [
                { id: 'a', text: 'Watch actively' },
                { id: 'b', text: 'Save useful notes' },
                { id: 'c', text: 'Skip every attachment' },
                { id: 'd', text: 'Review the key idea' },
              ],
              correct_option_ids: ['a', 'b', 'd'],
              marks: 2,
            },
            {
              quiz_id: quiz.id,
              question_order: 2,
              type: 'mcq',
              question_text: 'What does completed lecture progress mean in this platform?',
              question_image_url: lecture.thumbnail,
              options: [
                { id: 'a', text: 'You opened the lecture once' },
                { id: 'b', text: 'You watched at least 85% of the video' },
                { id: 'c', text: 'You downloaded a file' },
                { id: 'd', text: 'You wrote a profile note' },
              ],
              correct_option_ids: ['b'],
              marks: 1,
            },
            {
              quiz_id: quiz.id,
              question_order: 3,
              type: 'subjective',
              question_text: `Write one reflection or action item from "${lecture.title}".`,
              options: [],
              correct_option_ids: [],
              marks: 0,
            },
          ])

          await Attachment.destroy({ where: { lecture_id: lecture.id } })
          await Attachment.bulkCreate([
            {
              lecture_id: lecture.id,
              file_name: `${lecture.title} slides`,
              file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              file_type: 'PDF',
            },
            {
              lecture_id: lecture.id,
              file_name: `${lecture.title} resource checklist`,
              file_url: 'https://example.com/resources/checklist',
              file_type: 'Link',
            },
          ])
        }
        }
      }
    }

    await Note.destroy({ where: { user_id: demoUser.id } })
    await UserProgress.destroy({ where: { user_id: demoUser.id } })
    await QuizAttempt.destroy({ where: { user_id: demoUser.id } })

    await Note.bulkCreate(
      seededLectures.slice(0, 3).map((lecture, index) => ({
        user_id: demoUser.id,
        lecture_id: lecture.id,
        text: `Demo note ${index + 1}: Review **${lecture.title}** and revisit the attachment before the quiz.`,
      }))
    )

    await UserProgress.bulkCreate(
      seededLectures.map((lecture, index) => ({
        user_id: demoUser.id,
        lecture_id: lecture.id,
        watched_seconds: index < 2 ? 999 : index === 2 ? 120 : 0,
        last_watched_time: index < 2 ? 999 : index === 2 ? 120 : 0,
        completed: index < 2,
        last_watched_at: new Date(),
      }))
    )

    console.log('Dummy data seeded successfully.')
    console.log('Demo login: student@example.com / password123')
    console.log('Admin login: admin@example.com / admin123')
  } catch (err) {
    console.error('Error seeding database:', err)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

seedDatabase()
