import { useState } from 'react'
import { Settings as SettingsIcon, Save, Trash2, Download, Upload, AlertTriangle } from 'lucide-react'
import { getSettings, saveSettings } from '../services/settings'
import { storage } from '../services/storage'
import type { UserSettings } from '../models/types'
import Card from '../../../shared/components/common/Card'

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings())
  const [saved, setSaved] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  const update = (partial: Partial<UserSettings>) => {
    const next = { ...settings, ...partial }
    setSettings(next)
    saveSettings(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearBeatCodeData = () => {
    if (window.confirm('This will delete ALL your BeatCode progress, sessions, and settings. This action cannot be undone. Are you sure?')) {
      // Clear only BeatCode-specific data
      storage.clear()

      alert('BeatCode data cleared successfully!')
      setShowConfirmReset(false)

      // Refresh to show clean state
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-gray-600" />
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize your BeatCode experience
        </p>
      </div>

      {/* Theme Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme (Shared with BeatDesign)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => update({ theme })}
                className={`p-3 text-sm rounded-md border-2 transition-colors ${
                  settings.theme === theme
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="font-medium capitalize">{theme}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {theme === 'light' && 'Always light'}
                  {theme === 'dark' && 'Always dark'}
                  {theme === 'system' && 'Follow system'}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Theme changes apply to both BeatCode and BeatDesign
          </p>
        </div>
      </Card>

      {/* Study Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Study Preferences
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cards per session
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.cardsPerSession}
              onChange={e => update({ cardsPerSession: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings.cardsPerSession} cards per study session
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New cards per day
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={settings.newCardsPerDay}
              onChange={e => update({ newCardsPerDay: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings.newCardsPerDay} new problems per day
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setSaved(true)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>

        <div className="grid md:grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Clear BeatCode Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Delete ALL BeatCode progress, settings, and sessions. BeatDesign data will remain unchanged.
            </p>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear BeatCode Data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-1 ml-4">
                    <li>• All problem progress & spaced repetition data</li>
                    <li>• Study streaks and statistics</li>
                    <li>• Preferences and settings</li>
                    <li>• Scheduled study sessions</li>
                  </ul>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                    BeatDesign data will NOT be affected.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearBeatCodeData}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  >
                    Yes, Clear BeatCode
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
