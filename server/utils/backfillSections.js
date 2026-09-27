const sequelize = require('../config/db')

const { Chapter, Section, Lecture } = sequelize.models

const backfillSections = async () => {
  const chapters = await Chapter.findAll()

  for (const chapter of chapters) {
    const [section] = await Section.findOrCreate({
      where: {
        chapter_id: chapter.id,
        section_number: 1,
      },
      defaults: {
        chapter_id: chapter.id,
        section_number: 1,
        title: `${chapter.title} Section`,
        description: chapter.description || 'Section content',
      },
    })

    await Lecture.update(
      { section_id: section.id },
      {
        where: {
          chapter_id: chapter.id,
          section_id: null,
        },
      }
    )
  }
}

module.exports = backfillSections
