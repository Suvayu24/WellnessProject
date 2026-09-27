const express = require('express')
const router = express.Router()
const sequelize = require('../config/db')
const verifyToken = require('../middleware/auth')

const { Notebook, NotebookPage } = sequelize.models

router.get('/', verifyToken, async (req, res) => {
  try {
    const notebooks = await Notebook.findAll({
      where: { user_id: req.userId },
      include: [{ model: NotebookPage }],
      order: [['updated_at', 'DESC']],
    })

    res.json(notebooks.map((notebook) => {
      const plain = notebook.toJSON()
      plain.pageCount = plain.NotebookPages?.length || 0
      delete plain.NotebookPages
      return plain
    }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description = '', color = '#0f766e' } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Notebook name is required' })

    const notebook = await Notebook.create({
      user_id: req.userId,
      name: name.trim(),
      description: description.trim(),
      color,
      updated_at: new Date(),
    })
    res.status(201).json({ ...notebook.toJSON(), pageCount: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/pages', verifyToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!notebook) return res.status(404).json({ error: 'Notebook not found' })

    const pages = await NotebookPage.findAll({
      where: { notebook_id: notebook.id },
      order: [['page_number', 'ASC']],
    })
    res.json(pages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/pages', verifyToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!notebook) return res.status(404).json({ error: 'Notebook not found' })

    const pageNumber = Math.max(1, Math.min(50, Number(req.body.pageNumber || 1)))
    const content = req.body.content || ''
    if (!content.trim()) return res.status(400).json({ error: 'Page content is required' })

    const [page] = await NotebookPage.findOrCreate({
      where: { notebook_id: notebook.id, page_number: pageNumber },
      defaults: { notebook_id: notebook.id, page_number: pageNumber, content, updated_at: new Date() },
    })
    if (page.content !== content) await page.update({ content, updated_at: new Date() })
    await notebook.update({ updated_at: new Date() })
    res.status(201).json(page)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/pages/:pageId', verifyToken, async (req, res) => {
  try {
    const page = await NotebookPage.findByPk(req.params.pageId, { include: [Notebook] })
    if (!page || page.Notebook.user_id !== req.userId) return res.status(404).json({ error: 'Page not found' })

    await page.update({ content: req.body.content || '', updated_at: new Date() })
    await page.Notebook.update({ updated_at: new Date() })
    res.json(page)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ where: { id: req.params.id, user_id: req.userId } })

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' })
    }

    await NotebookPage.destroy({ where: { notebook_id: notebook.id } })
    await notebook.destroy()

    return res.json({ message: 'Notebook deleted' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

module.exports = router
