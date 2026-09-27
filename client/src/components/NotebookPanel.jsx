import { useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

const colors = ['#0f766e', '#7B2CCB', '#F01823', '#d97706', '#2563eb', '#16a34a']
const highlightColors = ['#fef08a', '#fde047', '#fb7185', '#fdba74', '#86efac', '#93c5fd']
const blankPage = (pageNumber) => ({ id: null, page_number: pageNumber, content: '' })
const bulletPrefix = '\u2022\u00a0'
const blankNoteContent = `<div>${bulletPrefix}</div>`

const isBlankHtml = (content = '') => {
  const textOnly = content
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
  return !textOnly
}

function NotebookPanel({ spacious = false }) {
  const [notebooks, setNotebooks] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [pages, setPages] = useState([blankPage(1)])
  const [pageIndex, setPageIndex] = useState(0)
  const [draft, setDraft] = useState({ name: '', description: '', color: colors[0] })
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState('Saved')
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false)
  const [canHighlightSelection, setCanHighlightSelection] = useState(false)
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, strikeThrough: false })
  const editorRef = useRef(null)
  const saveTimer = useRef(null)

  const selectedNotebook = notebooks.find((notebook) => notebook.id === selectedId)
  const currentPage = pages[pageIndex] || blankPage(pageIndex + 1)
  const visiblePageCount = pages.length
  const editorSizeClass = spacious
    ? 'h-[calc(100vh-330px)] min-h-[320px]'
    : 'min-h-[520px]'

  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        const data = await apiFetch('/notebooks')
        setNotebooks(data)
        if (data[0]) setSelectedId(data[0].id)
      } finally {
        setLoading(false)
      }
    }

    loadNotebooks()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setPages([blankPage(1)])
      setPageIndex(0)
      return
    }

    const loadPages = async () => {
      const data = await apiFetch(`/notebooks/${selectedId}/pages`)
      setPages(data.length ? data : [blankPage(1)])
      setPageIndex(0)
      setSavedLabel('Saved')
    }

    loadPages()
  }, [selectedId])

  useEffect(() => {
    if (!editorRef.current) return
    const nextContent = isBlankHtml(currentPage.content) ? blankNoteContent : currentPage.content
    if (editorRef.current.innerHTML !== nextContent) editorRef.current.innerHTML = nextContent
    setHighlightMenuOpen(false)
    setCanHighlightSelection(false)
    setActiveFormats({ bold: false, italic: false, underline: false, strikeThrough: false })
  }, [selectedId, pageIndex, currentPage.id])

  const getEditorSelection = () => {
    const selection = window.getSelection()
    const editor = editorRef.current
    if (
      !selection?.rangeCount ||
      selection.isCollapsed ||
      !selection.anchorNode ||
      !selection.focusNode ||
      !editor?.contains(selection.anchorNode) ||
      !editor.contains(selection.focusNode)
    ) {
      return null
    }

    const selectedText = selection.toString().replace(/\u2022/g, '').replace(/\u00a0/g, ' ').trim()
    return selectedText ? selection : null
  }

  const clearEditorSelection = () => {
    const selection = window.getSelection()
    selection.removeAllRanges()
  }

  const restoreCaretAfterRange = (range) => {
    const selection = window.getSelection()
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const refreshActiveFormats = () => {
    const hasSelection = Boolean(getEditorSelection())
    setCanHighlightSelection(hasSelection)
    if (!hasSelection) setHighlightMenuOpen(false)
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
    })
  }

  const refreshNotebookCount = (notebookId, count) => {
    setNotebooks((current) => current.map((notebook) =>
      notebook.id === notebookId ? { ...notebook, pageCount: count } : notebook
    ))
  }

  const savePage = async (pageToSave = currentPage) => {
    if (!selectedId || !pageToSave.content.trim()) return
    setSaving(true)
    setSavedLabel('Saving...')
    try {
      const saved = pageToSave.id
        ? await apiFetch(`/notebooks/pages/${pageToSave.id}`, {
            method: 'PUT',
            body: JSON.stringify({ content: pageToSave.content }),
          })
        : await apiFetch(`/notebooks/${selectedId}/pages`, {
            method: 'POST',
            body: JSON.stringify({ pageNumber: pageToSave.page_number, content: pageToSave.content }),
          })

      setPages((current) => current.map((page) => page.page_number === saved.page_number ? saved : page))
      refreshNotebookCount(selectedId, Math.max(pages.filter((page) => page.id).length, saved.page_number))
      setSavedLabel('Saved')
    } catch (err) {
      setSavedLabel(err.message)
    } finally {
      setSaving(false)
    }
  }

  const scheduleSave = (nextPages, nextIndex) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    const pageToSave = nextPages[nextIndex]
    if (!pageToSave?.content.trim()) {
      setSavedLabel('Unsaved blank page')
      return
    }
    setSavedLabel('Waiting...')
    saveTimer.current = setTimeout(() => savePage(pageToSave), 900)
  }

  const updateContent = (content) => {
    const nextPages = pages.map((page, index) => index === pageIndex ? { ...page, content } : page)
    setPages(nextPages)
    scheduleSave(nextPages, pageIndex)
  }

  const placeCaretAtEnd = () => {
    const editor = editorRef.current
    if (!editor) return
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const updateFromEditor = () => {
    const editor = editorRef.current
    if (!editor) return

    if (isBlankHtml(editor.innerHTML)) {
      editor.innerHTML = blankNoteContent
      placeCaretAtEnd()
    }

    refreshActiveFormats()
    updateContent(editor.innerHTML)
  }

  const createNotebook = async () => {
    if (!draft.name.trim()) return
    const notebook = await apiFetch('/notebooks', {
      method: 'POST',
      body: JSON.stringify(draft),
    })
    setNotebooks((current) => [notebook, ...current])
    setSelectedId(notebook.id)
    setDraft({ name: '', description: '', color: colors[0] })
    setCreating(false)
  }

  const deleteNotebook = async (event, notebookId) => {
    event.stopPropagation()
    if (saveTimer.current) clearTimeout(saveTimer.current)
    try {
      await apiFetch(`/notebooks/${notebookId}`, { method: 'DELETE' })
      const nextNotebooks = notebooks.filter((notebook) => notebook.id !== notebookId)
      setNotebooks(nextNotebooks)
      setSavedLabel('Saved')
      if (selectedId === notebookId) {
        setSelectedId(nextNotebooks[0]?.id || null)
        setMenuOpen(false)
      }
    } catch (err) {
      setSavedLabel(err.message)
    }
  }

  const movePage = (direction) => {
    if (direction === 'next') {
      if (pageIndex >= 49) return
      if (pageIndex === pages.length - 1) setPages([...pages, blankPage(pages.length + 1)])
      setPageIndex(pageIndex + 1)
      return
    }

    if (pageIndex === 0) return
    const targetIndex = pageIndex - 1
    const trimmed = pages
      .slice(0, targetIndex + 1)
      .concat(pages.slice(targetIndex + 1).filter((page) => page.id || page.content.trim()))
      .map((page, index) => ({ ...page, page_number: index + 1 }))
    setPages(trimmed.length ? trimmed : [blankPage(1)])
    setPageIndex(targetIndex)
  }

  const runCommand = (command, value = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    refreshActiveFormats()
    updateFromEditor()
  }

  const toggleHighlightMenu = () => {
    if (!getEditorSelection()) {
      setCanHighlightSelection(false)
      setHighlightMenuOpen(false)
      return
    }

    setCanHighlightSelection(true)
    setHighlightMenuOpen((open) => !open)
  }

  const applyHighlight = (color) => {
    if (!getEditorSelection()) {
      setCanHighlightSelection(false)
      setHighlightMenuOpen(false)
      return
    }

    editorRef.current?.focus()
    document.execCommand('hiliteColor', false, color)
    clearEditorSelection()
    document.execCommand('hiliteColor', false, 'transparent')
    document.execCommand('backColor', false, 'transparent')
    stripTransparentHighlights(editorRef.current)

    setCanHighlightSelection(false)
    setHighlightMenuOpen(false)
    updateFromEditor()
  }

  const stripHighlightStyles = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return

    node.removeAttribute('bgcolor')
    node.style.backgroundColor = ''
    node.style.background = ''
    if (!node.getAttribute('style')) node.removeAttribute('style')
    Array.from(node.childNodes).forEach(stripHighlightStyles)
  }

  const stripTransparentHighlights = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const background = node.style.backgroundColor || node.style.background
    if (background === 'transparent' || background === 'rgba(0, 0, 0, 0)') {
      stripHighlightStyles(node)
    }
    Array.from(node.childNodes).forEach(stripTransparentHighlights)
  }

  const removeHighlight = () => {
    if (!getEditorSelection()) {
      setCanHighlightSelection(false)
      setHighlightMenuOpen(false)
      return
    }

    editorRef.current?.focus()
    document.execCommand('hiliteColor', false, 'transparent')
    document.execCommand('backColor', false, 'transparent')
    stripTransparentHighlights(editorRef.current)
    clearEditorSelection()
    setCanHighlightSelection(false)
    setHighlightMenuOpen(false)
    updateFromEditor()
  }

  const removeHighlightFromTypedSpace = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection?.rangeCount || !selection.isCollapsed) return

    const range = selection.getRangeAt(0)
    const container = range.startContainer
    const offset = range.startOffset

    if (container.nodeType !== Node.TEXT_NODE || offset < 1) return
    if (!/[\s\u00a0]/.test(container.textContent[offset - 1])) return

    const spaceRange = document.createRange()
    spaceRange.setStart(container, offset - 1)
    spaceRange.setEnd(container, offset)
    selection.removeAllRanges()
    selection.addRange(spaceRange)

    document.execCommand('hiliteColor', false, 'transparent')
    document.execCommand('backColor', false, 'transparent')
    stripTransparentHighlights(editor)
    restoreCaretAfterRange(spaceRange)
    updateFromEditor()
  }

  const insertHtml = (html) => {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    updateFromEditor()
  }

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      setHighlightMenuOpen(false)
      setCanHighlightSelection(false)
      requestAnimationFrame(removeHighlightFromTypedSpace)
      return
    }

    if (event.key !== 'Enter') return
    setHighlightMenuOpen(false)
    setCanHighlightSelection(false)
    event.preventDefault()
    editorRef.current?.focus()

    if (event.ctrlKey) {
      document.execCommand('insertLineBreak')
      updateFromEditor()
      return
    }

    document.execCommand('insertParagraph')
    document.execCommand('insertText', false, bulletPrefix)
    updateFromEditor()
  }

  const pageLabel = useMemo(() => `Page ${pageIndex + 1} of ${visiblePageCount}`, [pageIndex, visiblePageCount])
  const formatPageCount = (count = 0) => `${count} ${count === 1 ? 'page' : 'pages'}`

  return (
    <div className={`bg-[#EEBD89] rounded-lg border border-[#d9a870] shadow-[0_12px_30px_rgba(59,31,0,0.08)] ${spacious ? 'p-6' : 'p-4 sm:p-5'}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-[#3b1f00]">{selectedNotebook?.name || 'Notebooks'}</h3>
          <p className="text-xs font-semibold text-[#7a4a10]">{selectedNotebook ? pageLabel : 'Create a notebook to start'}</p>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close notebooks menu' : 'Open notebooks menu'}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-[#d9a870] bg-white/35 hover:border-[#0f766e]"
        >
          <span className="h-0.5 w-5 rounded bg-[#3b1f00]" />
          <span className="h-0.5 w-5 rounded bg-[#3b1f00]" />
          <span className="h-0.5 w-5 rounded bg-[#3b1f00]" />
        </button>
      </div>

      <div className={`relative overflow-hidden ${!selectedNotebook ? spacious ? 'min-h-[700px]' : 'min-h-[580px]' : ''}`}>
        <div className="relative min-w-0">
          {selectedNotebook ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#7a4a10]">
                <span />
                <span>{saving ? 'Saving...' : savedLabel}</span>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateFromEditor}
                onKeyDown={handleKeyDown}
                onKeyUp={refreshActiveFormats}
                onMouseUp={refreshActiveFormats}
                className={`${editorSizeClass} max-h-[72vh] w-full overflow-y-auto rounded-md border border-[#d9a870] bg-white/45 p-5 text-[18px] leading-8 text-[#3b1f00] [overflow-wrap:anywhere] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 [&_*]:max-w-full`}
              />
              {menuOpen && (
                <button
                  type="button"
                  aria-label="Close notebooks menu"
                  onClick={() => setMenuOpen(false)}
                  className="absolute inset-0 z-10 rounded-md bg-[#3b1f00]/40"
                />
              )}
              <div className="mt-3 flex flex-nowrap items-center gap-1">
                <button onClick={() => runCommand('bold')} className={`h-9 w-[26px] rounded border border-[#d9a870] text-sm font-bold ${activeFormats.bold ? 'bg-[#3b1f00] text-white' : 'bg-white/35 text-[#3b1f00]'}`}>B</button>
                <button onClick={() => runCommand('italic')} className={`h-9 w-[26px] rounded border border-[#d9a870] text-sm italic ${activeFormats.italic ? 'bg-[#3b1f00] text-white' : 'bg-white/35 text-[#3b1f00]'}`}>I</button>
                <button onClick={() => runCommand('underline')} className={`h-9 w-[26px] rounded border border-[#d9a870] text-sm underline ${activeFormats.underline ? 'bg-[#3b1f00] text-white' : 'bg-white/35 text-[#3b1f00]'}`}>U</button>
                <button onClick={() => runCommand('strikeThrough')} className={`h-9 w-[26px] rounded border border-[#d9a870] text-sm line-through ${activeFormats.strikeThrough ? 'bg-[#3b1f00] text-white' : 'bg-white/35 text-[#3b1f00]'}`}>S</button>
                {/* <button
                  onClick={() => {
                    const url = window.prompt('Add link URL')
                    if (url) runCommand('createLink', url)
                  }}
                  className="h-9 rounded-md border border-[#d9a870] bg-white/35 text-xs font-semibold"
                >
                  Link
                </button>
                <select onChange={(event) => runCommand('fontSize', event.target.value)} className="h-9 rounded-md border border-[#d9a870] bg-white/35 px-1 text-xs">
                  <option value="3">18</option>
                  <option value="4">22</option>
                  <option value="5">26</option>
                  <option value="6">32</option>
                </select> */}
                <div className="relative">
                  <button
                    type="button"
                    title="Highlight"
                    aria-label="Highlight menu"
                    aria-expanded={highlightMenuOpen}
                    aria-disabled={!canHighlightSelection}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={toggleHighlightMenu}
                    className={`flex h-9 w-9 items-center justify-center rounded border border-[#d9a870] text-sm font-bold hover:border-[#0f766e] ${canHighlightSelection ? 'bg-white/35 text-[#3b1f00]' : 'bg-white/20 text-[#7a4a10] opacity-50'}`}
                  >
                    H
                  </button>
                  {highlightMenuOpen && (
                    <div className="absolute bottom-11 left-0 z-30 grid w-[116px] grid-cols-3 gap-1 rounded-md border border-[#d9a870] bg-[#f7d2a7] p-2 shadow-[0_10px_24px_rgba(59,31,0,0.18)]">
                      {highlightColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={`Highlight ${color}`}
                          aria-label={`Highlight ${color}`}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            applyHighlight(color)
                          }}
                          className="h-8 w-8 rounded border border-[#3b1f00]/20 hover:border-[#0f766e]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <button
                        type="button"
                        title="Remove highlight"
                        aria-label="Remove highlight"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          removeHighlight()
                        }}
                        className="col-span-3 h-8 rounded border border-[#d9a870] bg-white/70 text-xs font-semibold text-[#3b1f00] hover:border-[#0f766e]"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                {/* <button onClick={() => insertHtml('<div>&#9744;&nbsp;Task item</div>')} className="h-9 rounded-md border border-[#d9a870] bg-white/35 text-xs font-semibold">Task</button> */}
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => movePage('prev')} className="h-9 w-14 rounded border border-[#d9a870] bg-white/35 text-xs font-semibold">Prev</button>
                  <button onClick={() => movePage('next')} disabled={pageIndex >= 49} className="h-9 w-14 rounded bg-[#0f766e] text-xs font-semibold text-white disabled:opacity-50">Next</button>
                </div>
              </div>
            </>
          ) : (
            <div className={`${spacious ? 'min-h-[640px]' : 'min-h-[520px]'} flex items-center justify-center rounded-md border border-[#d9a870] bg-white/30 px-4 py-5 text-center text-sm font-semibold text-[#7a4a10]`}>No notebooks yet.</div>
          )}
        </div>

        <div className={`absolute bottom-0 right-0 top-0 z-20 ${spacious ? 'w-[280px]' : 'w-[220px]'} max-w-[85%] overflow-y-auto rounded-md border border-[#d9a870] bg-[#eab47b] p-2 shadow-[0_14px_28px_rgba(59,31,0,0.16)] transition-all duration-300 ease-out ${menuOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}>
          <button onClick={() => setCreating(!creating)} className="mb-3 w-full rounded-md bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#085044]">
            Create Notebook
          </button>
          {creating && (
            <div className="mb-3 rounded-md border border-[#d9a870] bg-white/60 p-3">
              <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Notebook name" className="mb-2 w-full rounded-md border border-[#d9a870] bg-white/70 px-3 py-2 text-sm text-[#3b1f00] focus:outline-none" />
              <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Description" className="mb-2 h-14 w-full resize-none rounded-md border border-[#d9a870] bg-white/70 px-3 py-2 text-sm text-[#3b1f00] focus:outline-none" />
              <div className="mb-3 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use notebook color ${color}`}
                    onClick={() => setDraft({ ...draft, color })}
                    className={`h-7 w-7 rounded-full border-2 ${draft.color === color ? 'border-[#172033]' : 'border-white/70'}`}
                    style={{ backgroundColor: color, borderColor: draft.color === color ? '#172033' : 'rgba(255, 255, 255, 0.72)' }}
                  />
                ))}
              </div>
              <button onClick={createNotebook} className="w-full rounded-md bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#085044]">Create</button>
            </div>
          )}
          <div className="space-y-2 pr-1">
            {loading && <div className="text-sm text-[#7a4a10]">Loading notebooks...</div>}
            {!loading && notebooks.map((notebook) => (
              <div
                key={notebook.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedId(notebook.id)
                  setMenuOpen(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedId(notebook.id)
                    setMenuOpen(false)
                  }
                }}
                className={`group relative w-full overflow-hidden rounded-md border py-3 pl-3 pr-12 text-left transition-colors ${selectedId === notebook.id ? 'border-[#0f766e] bg-white/70' : 'border-[#d9a870] bg-white/40 hover:border-[#0f766e]'}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-2"
                  style={{ backgroundColor: notebook.color || colors[0] }}
                />
                <div className="min-w-0 truncate text-sm font-bold text-[#3b1f00]">{notebook.name}</div>
                {notebook.description && <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#7a4a10]">{notebook.description}</div>}
                <div className="mt-1 text-xs font-semibold leading-5 text-[#7a4a10]">{formatPageCount(notebook.pageCount || 0)}</div>
                <button
                  type="button"
                  aria-label={`Delete ${notebook.name}`}
                  onClick={(event) => deleteNotebook(event, notebook.id)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded border border-red-500/40 bg-white/80 text-red-700 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 14h10l1-14" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotebookPanel
