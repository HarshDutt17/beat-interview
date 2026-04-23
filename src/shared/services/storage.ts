// Generic localStorage wrapper that can be used by both BeatCode and BeatDesign
export interface StorageInterface {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
  keys(): string[]
}

export function createStorage(appPrefix: string): StorageInterface {
  const prefixedKey = (key: string) => `${appPrefix}_${key}`

  return {
    get<T>(key: string): T | null {
      try {
        const raw = localStorage.getItem(prefixedKey(key))
        return raw ? JSON.parse(raw) : null
      } catch (error) {
        console.error(`Error getting ${key} from storage:`, error)
        return null
      }
    },

    set<T>(key: string, value: T): void {
      try {
        localStorage.setItem(prefixedKey(key), JSON.stringify(value))
      } catch (error) {
        console.error(`Error setting ${key} in storage:`, error)
      }
    },

    remove(key: string): void {
      try {
        localStorage.removeItem(prefixedKey(key))
      } catch (error) {
        console.error(`Error removing ${key} from storage:`, error)
      }
    },

    clear(): void {
      try {
        // Only clear keys with this app's prefix
        const keys = Object.keys(localStorage).filter(key => key.startsWith(`${appPrefix}_`))
        keys.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.error(`Error clearing ${appPrefix} storage:`, error)
      }
    },

    keys(): string[] {
      try {
        return Object.keys(localStorage)
          .filter(key => key.startsWith(`${appPrefix}_`))
          .map(key => key.replace(`${appPrefix}_`, ''))
      } catch (error) {
        console.error(`Error getting ${appPrefix} storage keys:`, error)
        return []
      }
    }
  }
}

// Shared settings that work across both apps
export interface SharedSettings {
  theme: 'light' | 'dark' | 'system'
  // Other shared preferences can be added here
}

// Global shared storage (no prefix - shared between apps)
export const sharedStorage = createStorage('beatapps_shared')

export function getSharedSettings(): SharedSettings {
  return sharedStorage.get<SharedSettings>('settings') || {
    theme: 'system'
  }
}

export function setSharedSettings(settings: SharedSettings): void {
  sharedStorage.set('settings', settings)
}