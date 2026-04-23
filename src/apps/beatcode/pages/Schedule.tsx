import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, createSession, deleteSession, completeSession, isSessionCompletedToday } from '../services/scheduler'
import { BeatCodeTopic, Difficulty, TOPIC_LABELS, type StudySession } from '../models/types'
import Card from '../../../shared/components/common/Card'
import Badge from '../../../shared/components/common/Badge'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Schedule() {
  const [sessions, setSessions] = useState(() => getSessions())
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [difficulties, setDifficulties] = useState<Difficulty[]>([])
  const [cardCount, setCardCount] = useState(10)
  const [scheduledFor, setScheduledFor] = useState(() => new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly'>('Daily')
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  const reload = useCallback(() => setSessions(getSessions()), [])

  const handleCreate = () => {
    if (!title.trim()) return
    createSession({
      title: title.trim(),
      topics: topics.length > 0 ? topics : Object.values(BeatCodeTopic),
      difficulties: difficulties.length > 0 ? difficulties : Object.values(Difficulty),
      cardCount,
      scheduledFor,
      isRecurring,
      recurrencePattern: isRecurring ? { frequency, interval: 1, daysOfWeek: frequency === 'Weekly' ? selectedDays : undefined } : undefined,
    })
    setTitle('')
    setTopics([])
    setDifficulties([])
    setCardCount(10)
    setIsRecurring(false)
    setShowForm(false)
    reload()
  }

  const handleDelete = (id: string) => { deleteSession(id); reload() }
  const handleComplete = (id: string) => { completeSession(id); reload() }

  const toggleTopic = (t: string) => {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  const toggleDifficulty = (d: Difficulty) => {
    setDifficulties(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }
  const toggleDay = (d: number) => {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const today = useMemo(() => new Date(), [])
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [calMonth, calYear])

  const sessionsByDate = useMemo(() => {
    const map: Record<string, StudySession[]> = {}
    for (const s of sessions) {
      const key = s.scheduledFor
      if (!map[key]) map[key] = []
      map[key].push(s)
    }
    return map
  }, [sessions])

  const monthLabel = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Schedule</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Plan your study sessions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl font-medium text-sm text-white border-0 cursor-pointer"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {showForm ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>New Study Session</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text)' }}>Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Morning DP Practice"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text)' }}>Topics</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(BeatCodeTopic).map(t => (
                  <button
                    key={t}
                    onClick={() => toggleTopic(t)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer"
                    style={{
                      borderColor: topics.includes(t) ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: topics.includes(t) ? 'var(--color-primary)' : 'transparent',
                      color: topics.includes(t) ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {TOPIC_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text)' }}>Difficulty</label>
              <div className="flex gap-2">
                {Object.values(Difficulty).map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDifficulty(d)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer"
                    style={{
                      borderColor: difficulties.includes(d) ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: difficulties.includes(d) ? 'var(--color-primary)' : 'transparent',
                      color: difficulties.includes(d) ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text)' }}>Cards</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={cardCount}
                  onChange={e => setCardCount(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text)' }}>Date</label>
                <input
                  type="date"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded" />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Recurring session</span>
              </label>
              {isRecurring && (
                <div className="mt-3 pl-6 space-y-2">
                  <div className="flex gap-2">
                    {(['Daily', 'Weekly'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer"
                        style={{
                          borderColor: frequency === f ? 'var(--color-primary)' : 'var(--color-border)',
                          backgroundColor: frequency === f ? 'var(--color-primary)' : 'transparent',
                          color: frequency === f ? '#fff' : 'var(--color-text-secondary)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {frequency === 'Weekly' && (
                    <div className="flex gap-1.5">
                      {DAYS.map((day, i) => (
                        <button
                          key={i}
                          onClick={() => toggleDay(i)}
                          className="w-9 h-9 rounded-full text-xs font-medium border cursor-pointer"
                          style={{
                            borderColor: selectedDays.includes(i) ? 'var(--color-primary)' : 'var(--color-border)',
                            backgroundColor: selectedDays.includes(i) ? 'var(--color-primary)' : 'transparent',
                            color: selectedDays.includes(i) ? '#fff' : 'var(--color-text-secondary)',
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-white border-0 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Create Session
            </button>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}
            className="p-1.5 rounded-lg border cursor-pointer text-sm"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            &#9664;
          </button>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{monthLabel}</h2>
          <button
            onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}
            className="p-1.5 rounded-lg border cursor-pointer text-sm"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            &#9654;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--color-text-secondary)' }}>{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const daySessions = sessionsByDate[dateStr] || []
            const isToday = dateStr === today.toISOString().split('T')[0]
            return (
              <div
                key={i}
                className="relative text-center py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: isToday ? 'var(--color-primary)' + '15' : 'transparent',
                  color: isToday ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {day}
                {daySessions.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {daySessions.slice(0, 3).map((_, j) => (
                      <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Session List */}
      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>All Sessions</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
          <p className="text-lg">No sessions scheduled</p>
          <p className="text-sm mt-1">Create your first study session above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const doneToday = isSessionCompletedToday(session)
            const completedCount = session.completedDates?.length ?? 0
            return (
              <Card key={session.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{session.title}</p>
                      {session.isRecurring && <Badge variant="info" className="text-xs">{session.recurrencePattern?.frequency ?? 'Recurring'}</Badge>}
                      {doneToday && <Badge variant="success" className="text-xs">Done today</Badge>}
                      {!session.isRecurring && session.completed && <Badge variant="success" className="text-xs">Completed</Badge>}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {session.scheduledFor} &middot; {session.cardCount} cards &middot;{' '}
                      {session.topics.slice(0, 3).join(', ')}
                      {session.topics.length > 3 && ` +${session.topics.length - 3} more`}
                      {session.isRecurring && completedCount > 0 && (
                        <span> &middot; {completedCount} day{completedCount !== 1 ? 's' : ''} completed</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {!doneToday && !session.completed && (
                      <Link
                        to={`/beatcode/study?session=${session.id}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium no-underline text-white"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        Start
                      </Link>
                    )}
                    {!doneToday && !session.completed && (
                      <button
                        onClick={() => handleComplete(session.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer"
                        style={{ backgroundColor: 'var(--color-success)' + '20', color: 'var(--color-success)' }}
                      >
                        Mark Done
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)' + '20', color: 'var(--color-danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
