const express = require('express')
const { getAllCourses, getCourseById } = require('../models/courseModel')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const courses = await getAllCourses()
    res.json(courses)
  } catch (err) {
    console.error('Error fetching courses:', err)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await getCourseById(req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    res.json(course)
  } catch (err) {
    console.error('Error fetching course:', err)
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

module.exports = router
