import { storage } from './storage'

const PROGRESS_KEY = 'user_progress'

// Study outcomes for BeatDesign
export const Outcome = {
  Understood: 'understood',
  NeedReview: 'need_review',
  Mastered: 'mastered'
} as const
export type Outcome = (typeof Outcome)[keyof typeof Outcome]

// SM-2 constants — exact match to BeatCode's algorithm
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

// Study item progress for BeatDesign
export interface StudyItemProgress {
  itemId: string
  ease: number
  intervalDays: number
  reps: number
  nextDue: string | null
  lastReviewed: string | null
  lastOutcome: Outcome | null
}

// User progress for BeatDesign
export interface UserProgress {
  studyItemProgress: Record<string, StudyItemProgress>
  studyStreak: number
  lastStudiedDate: string
  totalReviews: number
}

type StudyItem = {
  id: string
  title: string
  type: 'concept' | 'case_study' | 'interview'
  difficulty: string
  orderIndex: number
  [key: string]: any
}

function getDefaultProgress(): UserProgress {
  return {
    studyItemProgress: {},
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

export function getItemProgress(itemId: string): StudyItemProgress | null {
  const progress = getProgress()
  return progress.studyItemProgress[itemId] ?? null
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

  if (outcome === Outcome.Understood) {
    reps = reps0 + 1
    interval = reps0 === 0
      ? FIRST_SHOT_Y_INTERVAL
      : Math.max(1, Math.round(interval0 * ease0))
    ease = Math.min(ease0 + EASE_STEP_UP, EASE_MAX)
  } else if (outcome === Outcome.Mastered) {
    reps = reps0 + 1
    interval = reps0 === 0
      ? FIRST_SHOT_E_INTERVAL
      : Math.max(1, Math.round(interval0 * ease0 * EASY_BONUS))
    ease = Math.min(ease0 + EASE_STEP_UP_EASY, EASE_MAX)
  } else {
    // Need Review
    reps = 0
    interval = WRONG_MIN_INTERVAL
    ease = Math.max(ease0 - EASE_STEP_DOWN, EASE_MIN)
  }

  return { ease, intervalDays: interval, reps, nextDue: addDays(today, interval) }
}

export function reviewItem(itemId: string, outcome: Outcome): void {
  const progress = getProgress()
  const existing = progress.studyItemProgress[itemId]
  const today = todayStr()

  const current = existing
    ? { ease: existing.ease, intervalDays: existing.intervalDays, reps: existing.reps }
    : null

  const result = scheduleReview(current, outcome, today)

  progress.studyItemProgress[itemId] = {
    itemId,
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

export function skipItem(itemId: string): void {
  const progress = getProgress()
  const existing = progress.studyItemProgress[itemId]
  const today = todayStr()
  const tomorrow = addDays(today, 1)

  if (existing) {
    existing.nextDue = tomorrow
  } else {
    progress.studyItemProgress[itemId] = {
      itemId,
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

export function getDueItems(allItems: StudyItem[]): StudyItem[] {
  const progress = getProgress()
  const today = todayStr()
  return allItems
    .filter(item => {
      const itemProgress = progress.studyItemProgress[item.id]
      return itemProgress && itemProgress.nextDue && itemProgress.nextDue <= today
    })
    .sort((a, b) => {
      const pa = progress.studyItemProgress[a.id]
      const pb = progress.studyItemProgress[b.id]
      const dueCmp = (pa.nextDue ?? '').localeCompare(pb.nextDue ?? '')
      if (dueCmp !== 0) return dueCmp
      const easeCmp = pa.ease - pb.ease
      if (easeCmp !== 0) return easeCmp
      return a.orderIndex - b.orderIndex
    })
}

// Difficulty order for concepts and questions
const DIFF_ORDER: Record<string, number> = {
  'Beginner': 0,
  'Easy': 0,
  'Intermediate': 1,
  'Medium': 1,
  'Advanced': 2,
  'Hard': 2,
}

export function getNewItems(allItems: StudyItem[]): StudyItem[] {
  const progress = getProgress()
  return allItems
    .filter(item => !progress.studyItemProgress[item.id] || progress.studyItemProgress[item.id].nextDue === null)
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
  byType: Record<string, { total: number; seen: number; due: number }>
}

export function getStats(allItems: StudyItem[]): Stats {
  const progress = getProgress()
  const today = todayStr()

  let newCount = 0
  let learning = 0
  let mature = 0
  let dueToday = 0

  const byDifficulty: Record<string, { total: number; seen: number }> = {}
  const byType: Record<string, { total: number; seen: number; due: number }> = {
    concept: { total: 0, seen: 0, due: 0 },
    case_study: { total: 0, seen: 0, due: 0 },
    interview: { total: 0, seen: 0, due: 0 }
  }

  // Initialize difficulty counters
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Easy', 'Medium', 'Hard']
  for (const d of difficulties) {
    byDifficulty[d] = { total: 0, seen: 0 }
  }

  for (const item of allItems) {
    const itemProgress = progress.studyItemProgress[item.id]

    byType[item.type].total++
    if (byDifficulty[item.difficulty]) {
      byDifficulty[item.difficulty].total++
    }

    if (!itemProgress || itemProgress.nextDue === null) {
      newCount++
    } else {
      if (byDifficulty[item.difficulty]) {
        byDifficulty[item.difficulty].seen++
      }
      byType[item.type].seen++

      if (itemProgress.reps < 2) {
        learning++
      } else {
        mature++
      }

      if (itemProgress.nextDue <= today) {
        dueToday++
        byType[item.type].due++
      }
    }
  }

  return {
    total: allItems.length,
    new: newCount,
    learning,
    mature,
    dueToday,
    byDifficulty,
    byType,
  }
}