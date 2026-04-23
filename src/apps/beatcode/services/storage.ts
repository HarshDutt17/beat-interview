import { createStorage } from '../../../shared/services/storage'

// Create BeatCode-specific storage (migrating from 'dsa_flashcards' to 'beatcode' prefix)
export const storage = createStorage('beatcode')

// Migration helper to move data from old prefix to new prefix
function migrateOldData() {
  const oldPrefix = 'dsa_flashcards_'
  const oldKeys = Object.keys(localStorage).filter(key => key.startsWith(oldPrefix))

  if (oldKeys.length > 0) {
    console.log('Migrating BeatCode data to new storage format...')

    oldKeys.forEach(oldKey => {
      const newKey = oldKey.replace(oldPrefix, '')
      const value = localStorage.getItem(oldKey)

      if (value) {
        storage.set(newKey, JSON.parse(value))
        localStorage.removeItem(oldKey)
      }
    })

    console.log('Migration complete!')
  }
}

// Run migration on module load
migrateOldData()

export default storage
