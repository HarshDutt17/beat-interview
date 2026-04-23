import { getSharedSettings, setSharedSettings, type SharedSettings } from './storage'

// Theme application function that can be used by both apps
export function applyTheme(theme: SharedSettings['theme']): void {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

// Get shared theme setting
export function getTheme(): SharedSettings['theme'] {
  return getSharedSettings().theme
}

// Set shared theme setting
export function setTheme(theme: SharedSettings['theme']): void {
  const settings = getSharedSettings()
  settings.theme = theme
  setSharedSettings(settings)
  applyTheme(theme)
}

// Initialize theme on app load
export function initializeTheme(): void {
  applyTheme(getTheme())
}