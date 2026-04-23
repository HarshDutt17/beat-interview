import { storage } from './storage'
import { Outcome, Difficulty, type ProblemProgress, type UserProgress, type Problem } from '../models/types'

const PROGRESS_KEY = 'user_progress'

// SM-2 constants — exact match to srs.py
const EASE_START = 2.5
const EASE_MIN = 1.3
const EASE_MAX = 2.8
const EASE_STEP_UP = 0.05
const EASE_STEP_UP_EASY = 0.15
const EASE_STEP_DOWN = 0.2
const WRONG_MIN_INTERVAL = 3
const FIRST_SHOT_Y_INTERVAL = 4
const FIRST_SHOT_E_INTERVAL = 7
const EASY_BONUS = 1.3

function getDefaultProgress(): UserProgress {
  return {
    problemProgress: {},
    studyStreak: 0,
    lastStudiedDate: '',
    totalReviews: 0,
  }
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function getProgress(): UserProgress {
  return storage.get<UserProgress>(PROGRESS_KEY) ?? getDefaultProgress()
}

export function saveProgress(progress: UserProgress): void {
  storage.set(PROGRESS_KEY, progress)
}

export function getCardProgress(cardId: string): ProblemProgress | null {
  const progress = getProgress()
  return progress.problemProgress[cardId] ?? null
}

function scheduleReview(
  current: { ease: number; intervalDays: number; reps: number } | null,
  outcome: Outcome,
  today: string,
): { ease: number; intervalDays: number; reps: number; nextDue: string } {
  const ease0 = current?.ease ?? EASE_START
  const interval0 = current?.intervalDays ?? 0
  const reps0 = current?.reps ?? 0

  let ease: number
  let interval: number
  let reps: number

  if (outcome === Outcome.Solved) {
    reps = reps0 + 1
    interval = reps0 === 0
      ? FIRST_SHOT_Y_INTERVAL
      : Math.max(1, Math.round(interval0 * ease0))
    ease = Math.min(ease0 + EASE_STEP_UP, EASE_MAX)
  } else if (outcome === Outcome.Easy) {
    reps = reps0 + 1
    interval = reps0 === 0
      ? FIRST_SHOT_E_INTERVAL
      : Math.max(1, Math.round(interval0 * ease0 * EASY_BONUS))
    ease = Math.min(ease0 + EASE_STEP_UP_EASY, EASE_MAX)
  } else {
    reps = 0
    interval = WRONG_MIN_INTERVAL
    ease = Math.max(ease0 - EASE_STEP_DOWN, EASE_MIN)
  }

  return { ease, intervalDays: interval, reps, nextDue: addDays(today, interval) }
}

export function reviewProblem(cardId: string, outcome: Outcome): void {
  const progress = getProgress()
  const existing = progress.problemProgress[cardId]
  const today = todayStr()

  const current = existing
    ? { ease: existing.ease, intervalDays: existing.intervalDays, reps: existing.reps }
    : null

  const result = scheduleReview(current, outcome, today)

  progress.problemProgress[cardId] = {
    cardId,
    ease: result.ease,
    intervalDays: result.intervalDays,
    reps: result.reps,
    nextDue: result.nextDue,
    lastReviewed: today,
    lastOutcome: outcome,
  }

  if (progress.lastStudiedDate !== today) {
    const yesterday = addDays(today, -1)
    progress.studyStreak = progress.lastStudiedDate === yesterday ? progress.studyStreak + 1 : 1
    progress.lastStudiedDate = today
  }

  progress.totalReviews += 1
  saveProgress(progress)
}

export function skipProblem(cardId: string): void {
  const progress = getProgress()
  const existing = progress.problemProgress[cardId]
  const today = todayStr()
  const tomorrow = addDays(today, 1)

  if (existing) {
    existing.nextDue = tomorrow
  } else {
    progress.problemProgress[cardId] = {
      cardId,
      ease: EASE_START,
      intervalDays: 0,
      reps: 0,
      nextDue: tomorrow,
      lastReviewed: null,
      lastOutcome: null,
    }
  }

  saveProgress(progress)
}

export function getDueProblems(allProblems: Problem[]): Problem[] {
  const progress = getProgress()
  const today = todayStr()
  return allProblems
    .filter(p => {
      const pp = progress.problemProgress[p.id]
      return pp && pp.nextDue && pp.nextDue <= today
    })
    .sort((a, b) => {
      const pa = progress.problemProgress[a.id]
      const pb = progress.problemProgress[b.id]
      const dueCmp = (pa.nextDue ?? '').localeCompare(pb.nextDue ?? '')
      if (dueCmp !== 0) return dueCmp
      const easeCmp = pa.ease - pb.ease
      if (easeCmp !== 0) return easeCmp
      return a.orderIndex - b.orderIndex
    })
}

const DIFF_ORDER: Record<string, number> = {
  [Difficulty.Easy]: 0,
  [Difficulty.Medium]: 1,
  [Difficulty.Hard]: 2,
}

export function getNewProblems(allProblems: Problem[]): Problem[] {
  const progress = getProgress()
  return allProblems
    .filter(p => !progress.problemProgress[p.id] || progress.problemProgress[p.id].nextDue === null)
    .sort((a, b) => {
      const da = DIFF_ORDER[a.difficulty] ?? 3
      const db = DIFF_ORDER[b.difficulty] ?? 3
      if (da !== db) return da - db
      return a.orderIndex - b.orderIndex
    })
}

export interface Stats {
  total: number
  new: number
  learning: number
  mature: number
  dueToday: number
  byDifficulty: Record<string, { total: number; seen: number }>
  byTopic: Record<string, { total: number; seen: number; due: number }>
}

export function getStats(allProblems: Problem[]): Stats {
  const progress = getProgress()
  const today = todayStr()

  let newCount = 0
  let learning = 0
  let mature = 0
  let dueToday = 0

  const byDifficulty: Record<string, { total: number; seen: number }> = {}
  const byTopic: Record<string, { total: number; seen: number; due: number }> = {}

  for (const d of Object.values(Difficulty)) {
    byDifficulty[d] = { total: 0, seen: 0 }
  }

  for (const p of allProblems) {
    const pp = progress.problemProgress[p.id]

    if (!byTopic[p.topic]) byTopic[p.topic] = { total: 0, seen: 0, due: 0 }
    byTopic[p.topic].total++
    byDifficulty[p.difficulty].total++

    if (!pp || pp.nextDue === null) {
      newCount++
    } else {
      byDifficulty[p.difficulty].seen++
      byTopic[p.topic].seen++

      if (pp.reps < 2) {
        learning++
      } else {
        mature++
      }

      if (pp.nextDue <= today) {
        dueToday++
        byTopic[p.topic].due++
      }
    }
  }

  return {
    total: allProblems.length,
    new: newCount,
    learning,
    mature,
    dueToday,
    byDifficulty,
    byTopic,
  }
}
