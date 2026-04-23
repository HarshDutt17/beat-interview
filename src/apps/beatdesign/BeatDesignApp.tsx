import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BrowseConcepts from './pages/BrowseConcepts'
import BrowseQuestions from './pages/BrowseQuestions'
import BrowseStudies from './pages/BrowseStudies'
import StudySession from './pages/StudySession'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import About from './pages/About'
import Header from './components/Header'

export default function BeatDesignApp() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/concepts" element={<BrowseConcepts />} />
          <Route path="/questions" element={<BrowseQuestions />} />
          <Route path="/studies" element={<BrowseStudies />} />
          <Route path="/study" element={<StudySession />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}