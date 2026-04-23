import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Trash2, Download, Upload, AlertTriangle } from 'lucide-react'
import { getTheme, setTheme } from '../../../shared/services/settings'
import { getProgress, saveProgress } from '../services/progress'
import { storage } from '../services/storage'
import dataLoader from '../services/dataLoader'
import Card from '../../../shared/components/common/Card'
import Badge from '../../../shared/components/common/Badge'

export default function Settings() {
  const [currentTheme, setCurrentTheme] = useState(getTheme())
  const [defaultResourceDepth, setDefaultResourceDepth] = useState('mixed')
  const [studySessionSize, setStudySessionSize] = useState(15)
  const [showDifficultyFirst, setShowDifficultyFirst] = useState(true)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(0)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load user preferences from localStorage
    const prefs = localStorage.getItem('beatdesign_preferences')
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs)
        setDefaultResourceDepth(parsed.defaultResourceDepth || 'mixed')
        setStudySessionSize(parsed.studySessionSize || 15)
        setShowDifficultyFirst(parsed.showDifficultyFirst !== false)
        setAutoAdvanceTimer(parsed.autoAdvanceTimer || 0)
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }
  }, [])

  const savePreferences = () => {
    const preferences = {
      defaultResourceDepth,
      studySessionSize,
      showDifficultyFirst,
      autoAdvanceTimer
    }

    localStorage.setItem('beatdesign_preferences', JSON.stringify(preferences))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
    setCurrentTheme(theme)
  }

  const exportProgress = async () => {
    try {
      const progress = getProgress()
      await dataLoader.loadData()
      const stats = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        app: 'BeatDesign',
        totalItems: dataLoader.getAllContent().length,
        studiedItems: Object.keys(progress.studyItemProgress).length,
        studyStreak: progress.studyStreak,
        totalReviews: progress.totalReviews
      }

      const exportData = {
        stats,
        progress: progress.studyItemProgress,
        preferences: {
          defaultResourceDepth,
          studySessionSize,
          showDifficultyFirst,
          autoAdvanceTimer
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beatdesign-progress-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export progress:', error)
      alert('Failed to export progress. Please try again.')
    }
  }

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)

        // Check if this is BeatDesign data
        if (importData.stats?.app && importData.stats.app !== 'BeatDesign') {
          alert(`This appears to be data from ${importData.stats.app}, not BeatDesign. Please use the correct export file.`)
          return
        }

        if (importData.progress) {
          const currentProgress = getProgress()
          const newProgress = {
            ...currentProgress,
            studyItemProgress: { ...currentProgress.studyItemProgress, ...importData.progress }
          }
          saveProgress(newProgress)
        }

        if (importData.preferences) {
          const prefs = importData.preferences
          setDefaultResourceDepth(prefs.defaultResourceDepth || 'mixed')
          setStudySessionSize(prefs.studySessionSize || 15)
          setShowDifficultyFirst(prefs.showDifficultyFirst !== false)
          setAutoAdvanceTimer(prefs.autoAdvanceTimer || 0)
          localStorage.setItem('beatdesign_preferences', JSON.stringify(prefs))
        }

        alert('BeatDesign progress imported successfully!')
      } catch (error) {
        console.error('Failed to import progress:', error)
        alert('Failed to import progress. Please check the file format.')
      }
    }
    reader.readAsText(file)

    // Clear the input
    event.target.value = ''
  }

  const resetBeatDesignData = () => {
    if (window.confirm('This will delete ALL your BeatDesign progress, sessions, and settings. This action cannot be undone. Are you sure?')) {
      // Clear only BeatDesign-specific data
      storage.clear()
      localStorage.removeItem('beatdesign_preferences')

      // Reset progress
      const emptyProgress = {
        studyItemProgress: {},
        studyStreak: 0,
        lastStudiedDate: '',
        totalReviews: 0
      }
      saveProgress(emptyProgress)

      alert('BeatDesign data cleared successfully!')
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
          Customize your BeatDesign experience
        </p>
      </div>

      {/* Theme Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme (Shared with BeatCode)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`p-3 text-sm rounded-md border-2 transition-colors ${
                  currentTheme === theme
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
              Default Resource Depth
            </label>
            <select
              value={defaultResourceDepth}
              onChange={(e) => setDefaultResourceDepth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="just-enough">Just Enough (Quick Learning)</option>
              <option value="deep-dive">Deep Dive (Comprehensive)</option>
              <option value="mixed">Mixed (Both Types)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Default resource depth for new study sessions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Session Size
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={studySessionSize}
              onChange={(e) => setStudySessionSize(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default number of items per study session
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDifficultyFirst}
                onChange={(e) => setShowDifficultyFirst(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show difficulty badges prominently
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-advance Timer (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={autoAdvanceTimer}
              onChange={(e) => setAutoAdvanceTimer(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-advance to next item (0 = disabled)
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={savePreferences}
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

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Backup & Restore
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Export your BeatDesign progress and settings for backup or transfer.
            </p>
            <div className="space-y-2">
              <button
                onClick={exportProgress}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export BeatDesign Data
              </button>
              <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import BeatDesign Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importProgress}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Clear BeatDesign Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Delete ALL BeatDesign progress, settings, and sessions. BeatCode data will remain unchanged.
            </p>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear BeatDesign Data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-1 ml-4">
                    <li>• All study progress & spaced repetition data</li>
                    <li>• Study streaks and statistics</li>
                    <li>• Preferences and settings</li>
                    <li>• Scheduled study sessions</li>
                  </ul>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                    BeatCode data will NOT be affected.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={resetBeatDesignData}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  >
                    Yes, Clear BeatDesign
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