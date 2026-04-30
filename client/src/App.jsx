import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CoursesPage from './pages/CoursesPage'
import CoursePage from './pages/CoursePage'
import ChapterPage from './pages/ChapterPage'
import LecturePage from './pages/LecturePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/course/:courseId/chapter/:chapterId" element={<ChapterPage />} />
        <Route path="/course/:courseId/chapter/:chapterId/lecture/:lectureId" element={<LecturePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App