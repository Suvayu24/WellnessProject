const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const { Attachment } = sequelize.models;

// Get all attachments for a lecture
router.get('/lecture/:lectureId', async (req, res) => {
  try {
    const attachments = await Attachment.findAll({
      where: { lecture_id: req.params.lectureId }
    });
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
