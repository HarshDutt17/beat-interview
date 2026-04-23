import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
