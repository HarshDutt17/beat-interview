import type { Problem, ProblemProgress } from '../../models/types'
import { Outcome, DIFFICULTY_COLORS, TOPIC_COLORS, getDifficultyVariant } from '../../models/types'
import Badge from '../../../../shared/components/common/Badge'

interface ProblemCardProps {
  problem: Problem
  progress: ProblemProgress | null
  onRate?: (outcome: Outcome) => void
  onSkip?: () => void
  showRating?: boolean
}

const OUTCOME_BUTTONS = [
  { value: Outcome.Failed, label: "Couldn't Solve", color: '#ef4444' },
  { value: Outcome.Solved, label: 'Solved', color: '#22c55e' },
  { value: Outcome.Easy, label: 'Too Easy', color: '#6366f1' },
]

export default function ProblemCard({ problem, progress, onRate, onSkip, showRating = true }: ProblemCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div
        className="rounded-2xl border p-8 flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="info" className="text-xs">{problem.topic}</Badge>
          <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-xs">{problem.difficulty}</Badge>
        </div>

        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          {problem.title}
        </h2>

        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm no-underline transition-transform hover:scale-[1.02] mb-6"
          style={{ backgroundColor: '#ffa1161a', color: '#ffa116', border: '1px solid #ffa11640' }}
        >
          <span>Open on LeetCode</span>
          <span style={{ fontSize: '0.75rem' }}>&#8599;</span>
        </a>

        {progress && progress.lastReviewed && (
          <div
            className="rounded-lg p-3 text-sm"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
          >
            <span>streak: {progress.reps}</span>
            <span className="mx-2">&middot;</span>
            <span>last interval: {progress.intervalDays}d</span>
            <span className="mx-2">&middot;</span>
            <span>ease: {progress.ease.toFixed(2)}</span>
          </div>
        )}
      </div>

      {showRating && onRate && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
            How did it go?
          </p>
          <div className="flex gap-3 justify-center">
            {OUTCOME_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => onRate(btn.value)}
                className="px-6 py-3 rounded-xl border font-medium text-sm transition-all hover:scale-105 cursor-pointer"
                style={{ borderColor: btn.color + '40', backgroundColor: btn.color + '10', color: btn.color }}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {onSkip && (
            <div className="text-center">
              <button
                onClick={onSkip}
                className="px-4 py-2 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors"
                style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)' }}
              >
                Skip (show tomorrow)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
