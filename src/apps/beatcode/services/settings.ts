import { storage } from './storage'
import type { UserSettings } from '../models/types'

const SETTINGS_KEY = 'user_settings'

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  cardsPerSession: 10,
  newCardsPerDay: 5,
}

export function getSettings(): UserSettings {
  return storage.get<UserSettings>(SETTINGS_KEY) ?? { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: UserSettings): void {
  storage.set(SETTINGS_KEY, settings)
  applyTheme(settings.theme)
}

export function applyTheme(theme: UserSettings['theme']): void {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }
}
