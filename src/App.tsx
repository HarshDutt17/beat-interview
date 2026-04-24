import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import HomePage from './apps/home/pages/HomePage'
import BeatCodeApp from './apps/beatcode/BeatCodeApp'
import BeatDesignApp from './apps/beatdesign/BeatDesignApp'
import { initializeTheme } from './shared/services/settings'

export default function App() {
  useEffect(() => {
    initializeTheme()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/beatcode/*" element={<BeatCodeApp />} />
        <Route path="/beatdesign/*" element={<BeatDesignApp />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}
