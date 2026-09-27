import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../lib/api'

const dummyPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
const dummyReaderUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(dummyPdfUrl)}`

const fallbackBooks = [
  {
    id: 'fallback-1',
    title: 'The Wellness Workbook',
    author: 'Wellness Academy',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80',
    pdf_url: dummyPdfUrl,
    reader_url: dummyReaderUrl,
  },
  {
    id: 'fallback-2',
    title: 'Mindful Habits',
    author: 'Wellness Academy',
    cover_url: 'https://images.unsplash.com/photo-1455885666463-9b1c0b5b01a1?auto=format&fit=crop&w=700&q=80',
    pdf_url: dummyPdfUrl,
    reader_url: dummyReaderUrl,
  },
  {
    id: 'fallback-3',
    title: 'Learning Notes',
    author: 'Wellness Academy',
    cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=80',
    pdf_url: dummyPdfUrl,
    reader_url: dummyReaderUrl,
  },
]

function BooksPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await apiFetch('/books')
        setBooks(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  const openUrl = (url) => {
    if (!url) return
    window.open(url, '_blank', 'noreferrer')
  }

  const visibleBooks = books.length ? books : fallbackBooks

  return (
    <div className="min-h-screen bg-[#F3D4A5]">
      <Navbar />

      <div className="px-5 sm:px-8 pt-10 pb-12">
        <button
          onClick={() => navigate('/')}
          className="mb-5 inline-flex items-center rounded-full border border-[#d9a870] bg-[#EEBD89]/70 px-4 py-2 text-sm font-semibold text-[#0f766e] transition-colors hover:border-[#0f766e] hover:bg-[#EEBD89]"
        >
          Back to Home
        </button>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-[#3b1f00] mb-1">Books</h2>
          <p className="text-sm leading-6 text-[#7a4a10]">Open the reader or use the attached PDF source for each book.</p>
        </div>

        {loading && <div className="text-sm text-[#7a4a10]">Loading books...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-12 xl:grid-cols-4 2xl:grid-cols-5">
          {!loading && !error && visibleBooks.map((book, index) => (
            <div key={book.id} className="group w-full max-w-[320px]">
              <button
                onClick={() => openUrl(book.reader_url)}
                className="block w-full max-w-[320px] overflow-hidden rounded-md border-2 border-[#3b1f00]/15 bg-[#EEBD89] shadow-[0_12px_28px_rgba(59,31,0,0.08)] transition-all duration-200 hover:border-[#0f766e] hover:shadow-[0_18px_36px_rgba(15,118,110,0.25)]"
                title={`Open ${book.title} in Reader`}
                style={{ aspectRatio: '320 / 508' }}
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="h-full w-full object-contain bg-white" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[repeating-linear-gradient(45deg,#EEBD89,#EEBD89_12px,#d9a870_12px,#d9a870_24px)] px-5 text-center">
                    <span className="text-sm font-semibold leading-6 text-[#3b1f00]">
                      Book image here. Clicking will open in reader.
                    </span>
                  </div>
                )}
              </button>

              <div className="px-2 pt-5 flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold leading-tight text-[#3b1f00]">{book.title || `Book ${index + 1}`}</h3>
                {/* <button
                  onClick={() => openUrl(book.reader_url)}
                  className="mt-2 text-sm font-semibold text-[#3b1f00] hover:text-[#0f766e] transition-colors"
                >
                  Open in reader
                </button> */}
                {book.pdf_url && (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-sm font-semibold text-[#0f766e] hover:text-[#085044] transition-colors"
                    onClick={(event) => event.stopPropagation()}
                  >
                  Open PDF
                  </a>
                )}
                {book.author && <p className="mt-1 text-xs font-medium text-[#7a4a10]">{book.author}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BooksPage
