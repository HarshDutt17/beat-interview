import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

interface LayoutProps {
  header?: ReactNode
  children?: ReactNode
}

export default function Layout({ header, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {header}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6">
        {children || <Outlet />}
      </main>
    </div>
  )
}
