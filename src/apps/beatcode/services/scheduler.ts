import { storage } from './storage'
import type { StudySession } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

const SESSIONS_KEY = 'study_sessions'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function getSessions(): StudySession[] {
  return storage.get<StudySession[]>(SESSIONS_KEY) ?? []
}

function saveSessions(sessions: StudySession[]): void {
  storage.set(SESSIONS_KEY, sessions)
}

export function getSession(id: string): StudySession | null {
  return getSessions().find(s => s.id === id) ?? null
}

export function createSession(session: Omit<StudySession, 'id' | 'completed'>): StudySession {
  const sessions = getSessions()
  const newSession: StudySession = { ...session, id: uuidv4(), completed: false, completedDates: [] }
  sessions.push(newSession)
  saveSessions(sessions)
  return newSession
}

export function updateSession(id: string, updates: Partial<StudySession>): void {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === id)
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], ...updates }
    saveSessions(sessions)
  }
}

export function deleteSession(id: string): void {
  saveSessions(getSessions().filter(s => s.id !== id))
}

export function completeSession(id: string): void {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === id)
  if (idx < 0) return

  const session = sessions[idx]
  const today = todayStr()

  if (session.isRecurring) {
    const dates = session.completedDates ?? []
    if (!dates.includes(today)) {
      dates.push(today)
    }
    sessions[idx] = { ...session, completedDates: dates, lastCompletedAt: Date.now() }
  } else {
    sessions[idx] = { ...session, completed: true, lastCompletedAt: Date.now() }
  }

  saveSessions(sessions)
}

export function isSessionCompletedToday(session: StudySession): boolean {
  const today = todayStr()
  if (session.isRecurring) {
    return (session.completedDates ?? []).includes(today)
  }
  return session.completed
}

function isSessionScheduledForToday(session: StudySession): boolean {
  const today = todayStr()
  if (session.scheduledFor === today) return true
  if (session.isRecurring && session.recurrencePattern) {
    const dayOfWeek = new Date().getDay()
    if (session.recurrencePattern.frequency === 'Daily') return true
    if (session.recurrencePattern.frequency === 'Weekly' && session.recurrencePattern.daysOfWeek?.includes(dayOfWeek)) return true
  }
  return false
}

export function getTodaySessions(): StudySession[] {
  return getSessions().filter(s => {
    if (!s.isRecurring && s.completed) return false
    return isSessionScheduledForToday(s)
  })
}

export function getUpcomingSessions(days: number = 7): StudySession[] {
  const sessions = getSessions().filter(s => !s.completed || s.isRecurring)
  const now = new Date()
  const upcoming: StudySession[] = []

  for (const session of sessions) {
    if (!session.isRecurring) {
      const d = new Date(session.scheduledFor)
      if (d >= now && d <= new Date(now.getTime() + days * 86400000)) {
        upcoming.push(session)
      }
    } else {
      upcoming.push(session)
    }
  }

  return upcoming
}
