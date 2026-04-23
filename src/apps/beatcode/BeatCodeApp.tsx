import { Routes, Route } from 'react-router-dom'
import Layout from '../../shared/components/layout/Layout'
import Header from './components/Header'

// Import BeatCode pages
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import StudySession from './pages/StudySession'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import About from './pages/About'

export default function BeatCodeApp() {
  return (
    <Layout header={<Header />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/study" element={<StudySession />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  )
}