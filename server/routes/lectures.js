const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const verifyToken = require('../middleware/auth');
const { Lecture, Attachment, Chapter, Section, LectureQuiz, UserProgress } = sequelize.models;
const { buildCourseProgressState } = require('../utils/courseProgress');

// Get all lectures for a section
router.get('/section/:sectionId', async (req, res) => {
  try {
    const lectures = await Lecture.findAll({
      where: { section_id: req.params.sectionId },
      include: [Attachment],
      order: [['lecture_number', 'ASC']]
    });
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a lecture by ID (with attachments)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id, {
      include: [Attachment, { model: Section, include: [Chapter] }, Chapter, LectureQuiz]
    });
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

    const parentChapter = lecture.Section?.Chapter || lecture.Chapter;
    const progressState = await buildCourseProgressState(req.userId, parentChapter.course_id, { isAdmin: req.isAdmin });
    const lectureState = progressState.lectureState.get(lecture.id);
    if (!lectureState?.isUnlocked) {
      return res.status(403).json({ error: 'This lecture is locked. Complete previous sections first.' });
    }

    const progress = await UserProgress.findOne({
      where: { user_id: req.userId, lecture_id: lecture.id }
    });

    const plain = lecture.toJSON();
    plain.progress = progress;
    plain.quizPassed = lectureState.quizPassed;
    plain.quizPassThreshold = lectureState.quizPassThreshold;
    plain.parentChapter = parentChapter;
    res.json(plain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
