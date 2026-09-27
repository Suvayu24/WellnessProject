const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const verifyToken = require('../middleware/auth');
const { Chapter, Section, Lecture, Quiz, LectureQuiz, Attachment } = sequelize.models;
const { buildCourseProgressState } = require('../utils/courseProgress');

// Get all chapters for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { course_id: req.params.courseId },
      include: [{ model: Section, include: [{ model: Lecture, include: [Attachment] }] }, Quiz],
      order: [['chapter_number', 'ASC'], [Section, 'section_number', 'ASC'], [Section, Lecture, 'lecture_number', 'ASC']]
    });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a chapter by ID (with sections)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id, {
      include: [{ model: Section, include: [{ model: Lecture, include: [Attachment, LectureQuiz] }] }, Quiz],
      order: [[Section, 'section_number', 'ASC'], [Section, Lecture, 'lecture_number', 'ASC']]
    });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    const plain = chapter.toJSON();
    const progressState = await buildCourseProgressState(req.userId, chapter.course_id, { isAdmin: req.isAdmin });
    const chapterState = progressState.chapterState.get(chapter.id);

    plain.Sections = (plain.Sections || []).map((section) => {
      const state = progressState.sectionState.get(section.id);
      return {
        ...section,
        progress: {
          completedLectures: state?.completedLectures || 0,
          totalLectures: state?.totalLectures || 0,
          attemptedQuizzes: state?.attemptedQuizzes || 0,
          passedQuizzes: state?.passedQuizzes || 0,
          totalQuizzes: state?.totalQuizzes || 0,
          percent: state?.percent || 0,
        },
        isLocked: !state?.isUnlocked,
        lockMessage: state?.isUnlocked ? '' : 'Complete previous sections first.',
      };
    });
    plain.isLocked = !chapterState?.isUnlocked;
    plain.lockMessage = chapterState?.isUnlocked ? '' : 'Complete previous chapter sections first.';

    res.json(plain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
