import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import AdminCentrePage from './pages/AdminCentrePage'
import AuthPage from './pages/AuthPage'
import BooksPage from './pages/BooksPage'
import ChapterPage from './pages/ChapterPage'
import CoursePage from './pages/CoursePage'
import CoursesPage from './pages/CoursesPage'
import LecturePage from './pages/LecturePage'
import ProfilePage from './pages/ProfilePage'
import QuizPage from './pages/QuizPage'
import NotesPage from './pages/NotesPage'
import NotificationsPage from './pages/NotificationsPage'
import SectionsPage from './pages/SectionsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin-centre" element={<ProtectedRoute><AdminCentrePage /></ProtectedRoute>} />
          <Route path="/admin-centre/users/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/course/:courseId/chapter/:chapterId" element={<ProtectedRoute><ChapterPage /></ProtectedRoute>} />
          <Route path="/course/:courseId/chapter/:chapterId/section/:sectionId" element={<ProtectedRoute><SectionsPage /></ProtectedRoute>} />
          <Route path="/course/:courseId/chapter/:chapterId/lecture/:lectureId" element={<ProtectedRoute><LecturePage /></ProtectedRoute>} />
          <Route path="/course/:courseId/chapter/:chapterId/section/:sectionId/lecture/:lectureId" element={<ProtectedRoute><LecturePage /></ProtectedRoute>} />
          <Route path="/course/:courseId/chapter/:chapterId/lecture/:lectureId/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/course/:courseId/chapter/:chapterId/section/:sectionId/lecture/:lectureId/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
