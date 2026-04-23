import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { problems } from '../data/problems'
import { getCardProgress, getProgress } from '../services/progress'
import { BeatCodeTopic, Difficulty, TOPIC_LABELS, TOPIC_COLORS, DIFFICULTY_COLORS, getDifficultyVariant } from '../models/types'
import Card from '../../../shared/components/common/Card'
import Badge from '../../../shared/components/common/Badge'

function getStatusInfo(cardId: string, progress: ReturnType<typeof getProgress>): { label: string; color: string } {
  const pp = progress.problemProgress[cardId]
  if (!pp || pp.nextDue === null) return { label: 'New', color: '#94a3b8' }
  const today = new Date().toISOString().split('T')[0]
  if (pp.nextDue <= today) return { label: 'Due', color: '#ef4444' }
  if (pp.reps >= 2) return { label: 'Mature', color: '#22c55e' }
  return { label: 'Learning', color: '#f59e0b' }
}

export default function Browse() {
  const [searchParams] = useSearchParams()
  const initialTopic = searchParams.get('topic') ?? 'all'

  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const progress = useMemo(() => getProgress(), [])

  const filtered = useMemo(() => {
    return problems.filter(p => {
      if (selectedTopic !== 'all' && p.topic !== selectedTopic) return false
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false
      if (searchQuery) {
        return p.title.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
  }, [selectedTopic, selectedDifficulty, searchQuery])

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Browse Problems</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {filtered.length} of {problems.length} problems
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-lg border text-sm flex-1 min-w-[200px] outline-none"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
        <select
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        >
          <option value="all">All Topics</option>
          {Object.values(BeatCodeTopic).map(topic => (
            <option key={topic} value={topic}>{TOPIC_LABELS[topic]}</option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        >
          <option value="all">All Difficulties</option>
          {Object.values(Difficulty).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Problem List */}
      <div className="grid gap-3">
        {filtered.map(p => {
          const status = getStatusInfo(p.id, progress)
          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="info" className="text-xs">{p.topic}</Badge>
                    <Badge variant={getDifficultyVariant(p.difficulty)} className="text-xs">{p.difficulty}</Badge>
                    <Badge variant="info" className="text-xs">{status.label}</Badge>
                  </div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={p.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium no-underline whitespace-nowrap"
                    style={{ backgroundColor: '#ffa1161a', color: '#ffa116' }}
                  >
                    LeetCode
                  </a>
                  <Link
                    to={`/beatcode/study?card=${p.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium no-underline whitespace-nowrap text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Study
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-lg">No problems found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
