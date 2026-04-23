import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/beatcode', label: 'Dashboard' },
  { path: '/beatcode/browse', label: 'Browse' },
  { path: '/beatcode/study', label: 'Study' },
  { path: '/beatcode/schedule', label: 'Schedule' },
  { path: '/beatcode/settings', label: 'Settings' },
  { path: '/beatcode/about', label: 'About' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header
      className="border-b flex items-center justify-between px-6 py-3"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xs px-2 py-1 rounded-md border no-underline"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
          ← Home
        </Link>
        <Link to="/beatcode" className="flex items-center gap-2 no-underline" style={{ color: 'var(--color-text)' }}>
          <span className="text-2xl">🎯</span>
          <span className="text-lg font-bold tracking-tight">BeatCode</span>
        </Link>
      </div>

      <nav className="flex gap-1">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className="px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors"
              style={{
                backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
