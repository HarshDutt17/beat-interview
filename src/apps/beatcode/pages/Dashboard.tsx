import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { problems } from '../data/problems'
import { getProgress, getStats } from '../services/progress'
import { getTodaySessions, isSessionCompletedToday } from '../services/scheduler'
import { BeatCodeTopic, Difficulty, TOPIC_LABELS, TOPIC_COLORS, DIFFICULTY_COLORS } from '../models/types'
import Card from '../../../shared/components/common/Card'
import ProgressBar from '../../../shared/components/common/ProgressBar'
import Badge from '../../../shared/components/common/Badge'

export default function Dashboard() {
  const progress = useMemo(() => getProgress(), [])
  const stats = useMemo(() => getStats(problems), [])
  const todaySessions = useMemo(() => getTodaySessions(), [])
  const seenCount = stats.total - stats.new

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Beatcode &middot; Spaced Repetition Tracker
          </p>
        </div>
        {(stats.dueToday > 0 || stats.new > 0) && (
          <Link
            to="/beatcode/study"
            className="px-5 py-2.5 rounded-xl font-medium text-white no-underline text-sm transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {stats.dueToday > 0 ? `Study Now (${stats.dueToday} due)` : 'Start Studying'}
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>New</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-text-secondary)' }}>{stats.new}</p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Learning</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-warning)' }}>{stats.learning}</p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Mature</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-success)' }}>{stats.mature}</p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Due Today</p>
          <p className="text-3xl font-bold mt-1" style={{ color: stats.dueToday > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {stats.dueToday}
          </p>
        </Card>
      </div>

      {/* Overall Progress + Streak */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Overall Progress</h2>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {seenCount} / {stats.total} seen &middot; streak: {progress.studyStreak} &middot; {progress.totalReviews} reviews
          </span>
        </div>
        <ProgressBar progress={stats.total > 0 ? (seenCount / stats.total) * 100 : 0} />
      </Card>

      {/* Difficulty Breakdown */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>By Difficulty</h2>
        <div className="space-y-3">
          {Object.values(Difficulty).map(d => {
            const data = stats.byDifficulty[d]
            if (!data) return null
            return (
              <div key={d}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: DIFFICULTY_COLORS[d] }}>{d}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {data.seen}/{data.total} seen
                  </span>
                </div>
                <ProgressBar progress={data.total > 0 ? (data.seen / data.total) * 100 : 0} color={DIFFICULTY_COLORS[d]} height={6} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Today's Sessions</h2>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {todaySessions.filter(s => isSessionCompletedToday(s)).length}/{todaySessions.length} done
            </span>
          </div>
          <div className="space-y-2">
            {todaySessions.map(session => {
              const done = isSessionCompletedToday(session)
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg)', opacity: done ? 0.6 : 1 }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{session.title}</p>
                      {done && <Badge variant="success" className="text-xs">Done</Badge>}
                      {session.isRecurring && <Badge variant="info" className="text-xs">{session.recurrencePattern?.frequency ?? 'Recurring'}</Badge>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {session.cardCount} cards &middot; {session.topics.slice(0, 2).join(', ')}
                      {session.topics.length > 2 && ` +${session.topics.length - 2}`}
                    </p>
                  </div>
                  {done ? (
                    <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                      Completed
                    </span>
                  ) : (
                    <Link
                      to={`/beatcode/study?session=${session.id}`}
                      className="px-3 py-1 rounded-lg text-xs font-medium no-underline text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      Start
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Topic Breakdown */}
      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.values(BeatCodeTopic).map(topic => {
          const data = stats.byTopic[topic]
          if (!data || data.total === 0) return null
          return (
            <Link key={topic} to={`/beatcode/browse?topic=${encodeURIComponent(topic)}`} className="no-underline">
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm" style={{ color: TOPIC_COLORS[topic] }}>
                    {TOPIC_LABELS[topic]}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {data.seen}/{data.total}
                    {data.due > 0 && <span style={{ color: 'var(--color-danger)' }}> ({data.due} due)</span>}
                  </span>
                </div>
                <ProgressBar progress={data.total > 0 ? (data.seen / data.total) * 100 : 0} color={TOPIC_COLORS[topic]} height={6} />
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
