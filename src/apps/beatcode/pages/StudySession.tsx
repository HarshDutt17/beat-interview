import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { problems } from '../data/problems'
import { getDueProblems, getNewProblems, getCardProgress, reviewProblem, skipProblem } from '../services/progress'
import { getSession, completeSession } from '../services/scheduler'
import { getSettings } from '../services/settings'
import { Outcome, BeatCodeTopic, Difficulty, TOPIC_LABELS, type StudySession } from '../models/types'
import ProblemCard from '../components/problem/ProblemCard'
import ProgressBar from '../../../shared/components/common/ProgressBar'

export default function StudySessionPage() {
  const [searchParams] = useSearchParams()
  const specificCardId = searchParams.get('card')
  const sessionId = searchParams.get('session')

  const linkedSession = useMemo<StudySession | null>(() => {
    if (!sessionId) return null
    return getSession(sessionId)
  }, [sessionId])

  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => {
    if (linkedSession) {
      const allTopics = Object.values(BeatCodeTopic) as string[]
      if (linkedSession.topics.length === allTopics.length) return []
      return linkedSession.topics
    }
    return []
  })

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>(() => {
    if (linkedSession) {
      const allDiffs = Object.values(Difficulty)
      if (linkedSession.difficulties.length === 1) return linkedSession.difficulties[0]
      if (linkedSession.difficulties.length < allDiffs.length) return 'all'
    }
    return 'all'
  })

  const [started, setStarted] = useState(!!specificCardId || !!linkedSession)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [outcomes, setOutcomes] = useState<(Outcome | 'skip')[]>([])
  const [sessionMarkedDone, setSessionMarkedDone] = useState(false)

  const settings = useMemo(() => getSettings(), [])

  const cardLimit = linkedSession?.cardCount ?? settings.cardsPerSession

  const studyCards = useMemo(() => {
    if (specificCardId) {
      const p = problems.find(p => p.id === specificCardId)
      return p ? [p] : []
    }

    let pool = problems

    if (linkedSession) {
      const allTopics = Object.values(BeatCodeTopic) as string[]
      if (linkedSession.topics.length < allTopics.length) {
        pool = pool.filter(p => linkedSession.topics.includes(p.topic))
      }
      const allDiffs = Object.values(Difficulty)
      if (linkedSession.difficulties.length < allDiffs.length) {
        pool = pool.filter(p => linkedSession.difficulties.includes(p.difficulty))
      }
    } else {
      if (selectedTopics.length > 0) {
        pool = pool.filter(p => selectedTopics.includes(p.topic))
      }
      if (selectedDifficulty !== 'all') {
        pool = pool.filter(p => p.difficulty === selectedDifficulty)
      }
    }

    const due = getDueProblems(pool)
    const newCards = getNewProblems(pool)
    const combined = [...due, ...newCards]

    return combined.slice(0, cardLimit)
  }, [specificCardId, linkedSession, selectedTopics, selectedDifficulty, cardLimit])

  useEffect(() => {
    if (completed && linkedSession && !sessionMarkedDone) {
      completeSession(linkedSession.id)
      setSessionMarkedDone(true)
    }
  }, [completed, linkedSession, sessionMarkedDone])

  const handleRate = useCallback((outcome: Outcome) => {
    const card = studyCards[currentIndex]
    if (!card) return
    reviewProblem(card.id, outcome)
    setOutcomes(prev => [...prev, outcome])

    if (currentIndex + 1 >= studyCards.length) {
      setCompleted(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, studyCards])

  const handleSkip = useCallback(() => {
    const card = studyCards[currentIndex]
    if (!card) return
    skipProblem(card.id)
    setOutcomes(prev => [...prev, 'skip'])

    if (currentIndex + 1 >= studyCards.length) {
      setCompleted(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, studyCards])

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  if (completed) {
    const solvedCount = outcomes.filter(o => o === Outcome.Solved).length
    const failedCount = outcomes.filter(o => o === Outcome.Failed).length
    const easyCount = outcomes.filter(o => o === Outcome.Easy).length
    const skipCount = outcomes.filter(o => o === 'skip').length

    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Session Complete!</h1>
        {linkedSession && (
          <p className="text-sm mb-1" style={{ color: 'var(--color-primary)' }}>
            {linkedSession.title}
          </p>
        )}
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          You worked through {outcomes.length} problem{outcomes.length !== 1 ? 's' : ''}
          {linkedSession && sessionMarkedDone && ' — session marked done'}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{solvedCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Solved</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{failedCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Failed</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <p className="text-2xl font-bold" style={{ color: '#6366f1' }}>{easyCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Too Easy</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <p className="text-2xl font-bold" style={{ color: '#94a3b8' }}>{skipCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Skipped</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl font-medium text-sm no-underline border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            Dashboard
          </Link>
          <button
            onClick={() => { setCurrentIndex(0); setCompleted(false); setOutcomes([]); setSessionMarkedDone(false) }}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-white border-0 cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Study Again
          </button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Start Study Session</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Choose topics and difficulty to practice
        </p>

        <div className="mb-6">
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text)' }}>Topics</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(BeatCodeTopic).map(topic => {
              const active = selectedTopics.includes(topic)
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all"
                  style={{
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {TOPIC_LABELS[topic]}
                </button>
              )
            })}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {selectedTopics.length === 0 ? 'All topics selected' : `${selectedTopics.length} selected`}
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text)' }}>Difficulty</label>
          <div className="flex gap-2">
            {(['all', ...Object.values(Difficulty)] as const).map(d => {
              const active = selectedDifficulty === d
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d as Difficulty | 'all')}
                  className="px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all"
                  style={{
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {d === 'all' ? 'All' : d}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="p-4 rounded-xl border mb-6"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text)' }}>{studyCards.length}</strong> problems available
            &middot; Showing up to {cardLimit} per session
          </p>
        </div>

        <button
          onClick={() => studyCards.length > 0 && setStarted(true)}
          disabled={studyCards.length === 0}
          className="w-full py-3 rounded-xl font-medium text-white text-sm border-0 cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Start Session ({studyCards.length} problems)
        </button>
      </div>
    )
  }

  const currentCard = studyCards[currentIndex]
  if (!currentCard) return null

  const currentProgress = getCardProgress(currentCard.id)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          {linkedSession && (
            <p className="text-xs mb-1" style={{ color: 'var(--color-primary)' }}>{linkedSession.title}</p>
          )}
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            Problem {currentIndex + 1} of {studyCards.length}
          </h1>
        </div>
        <button
          onClick={() => setCompleted(true)}
          className="px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
        >
          End Session
        </button>
      </div>
      <ProgressBar progress={studyCards.length > 0 ? (currentIndex / studyCards.length) * 100 : 0} height={4} />
      <div className="mt-8">
        <ProblemCard
          key={currentCard.id}
          problem={currentCard}
          progress={currentProgress}
          onRate={handleRate}
          onSkip={handleSkip}
        />
      </div>
    </div>
  )
}
