interface ProgressBarProps {
  progress: number // 0-100 percentage
  color?: string
  height?: number
  className?: string
  // Legacy props for backwards compatibility
  value?: number
  max?: number
}

export default function ProgressBar({
  progress,
  value,
  max = 100,
  color = 'var(--color-primary)',
  height = 8,
  className = ''
}: ProgressBarProps) {
  // Support both new (progress) and legacy (value/max) prop patterns
  const percentage = progress !== undefined ? Math.min(100, Math.max(0, progress)) :
                    (value !== undefined && max > 0) ? Math.min(100, (value / max) * 100) : 0

  return (
    <div
      className={`w-full rounded-full overflow-hidden ${className}`}
      style={{ height, backgroundColor: 'var(--color-border)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  )
}
