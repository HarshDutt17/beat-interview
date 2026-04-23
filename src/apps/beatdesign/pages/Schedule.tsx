import { useState } from 'react'
import { Calendar, Plus, Clock, BookOpen, Users, Target, CheckCircle, AlertCircle, Play, RotateCcw } from 'lucide-react'
import Card from '../../../shared/components/common/Card'
import Badge from '../../../shared/components/common/Badge'

interface StudySession {
  id: string
  title: string
  contentTypes: string[]
  topics: string[]
  difficulties: string[]
  resourceDepth?: string
  cardCount: number
  scheduledFor: string
  isRecurring: boolean
  recurrencePattern?: {
    frequency: 'Daily' | 'Weekly'
    interval: number
    daysOfWeek?: number[]
  }
  completed?: boolean
  completedDates?: string[]
}

const contentTypeOptions = [
  { value: 'concept', label: 'Concepts', icon: BookOpen, color: 'purple' },
  { value: 'case_study', label: 'Case Studies', icon: Users, color: 'blue' },
  { value: 'interview', label: 'Interview Questions', icon: Target, color: 'green' }
]

const difficultyOptions = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' }
]

const resourceDepthOptions = [
  { value: 'just-enough', label: 'Just Enough (Quick Learning)' },
  { value: 'deep-dive', label: 'Deep Dive (Comprehensive)' },
  { value: 'mixed', label: 'Mixed (Both Types)' }
]

export default function Schedule() {
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'Daily Core Concepts Review',
      contentTypes: ['concept'],
      topics: [],
      difficulties: ['Beginner', 'Intermediate'],
      resourceDepth: 'just-enough',
      cardCount: 10,
      scheduledFor: new Date().toISOString().split('T')[0],
      isRecurring: true,
      recurrencePattern: {
        frequency: 'Daily',
        interval: 1
      },
      completedDates: []
    },
    {
      id: '2',
      title: 'Weekend Deep Dive',
      contentTypes: ['concept', 'case_study'],
      topics: [],
      difficulties: ['Advanced'],
      resourceDepth: 'deep-dive',
      cardCount: 5,
      scheduledFor: getNextWeekend(),
      isRecurring: true,
      recurrencePattern: {
        frequency: 'Weekly',
        interval: 1,
        daysOfWeek: [0, 6] // Sunday and Saturday
      },
      completedDates: []
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    title: '',
    contentTypes: ['concept'],
    topics: [],
    difficulties: ['Medium'],
    resourceDepth: 'mixed',
    cardCount: 15,
    scheduledFor: new Date().toISOString().split('T')[0],
    isRecurring: false
  })

  function getNextWeekend() {
    const today = new Date()
    const daysUntilSaturday = 6 - today.getDay()
    const nextSaturday = new Date(today)
    nextSaturday.setDate(today.getDate() + daysUntilSaturday)
    return nextSaturday.toISOString().split('T')[0]
  }

  const handleCreateSession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      title: newSession.title || 'Untitled Session',
      contentTypes: newSession.contentTypes || ['concept'],
      topics: newSession.topics || [],
      difficulties: newSession.difficulties || ['Medium'],
      resourceDepth: newSession.resourceDepth,
      cardCount: newSession.cardCount || 15,
      scheduledFor: newSession.scheduledFor || new Date().toISOString().split('T')[0],
      isRecurring: newSession.isRecurring || false,
      recurrencePattern: newSession.recurrencePattern,
      completedDates: []
    }

    setSessions([...sessions, session])
    setShowCreateForm(false)
    setNewSession({
      title: '',
      contentTypes: ['concept'],
      topics: [],
      difficulties: ['Medium'],
      resourceDepth: 'mixed',
      cardCount: 15,
      scheduledFor: new Date().toISOString().split('T')[0],
      isRecurring: false
    })
  }

  const handleStartSession = (session: StudySession) => {
    // Mark session as started and redirect to study
    const today = new Date().toISOString().split('T')[0]
    const updatedSession = {
      ...session,
      completedDates: [...(session.completedDates || []), today]
    }

    const updatedSessions = sessions.map(s =>
      s.id === session.id ? updatedSession : s
    )
    setSessions(updatedSessions)

    // Store session preferences in localStorage for study page
    localStorage.setItem('beatdesign_session_config', JSON.stringify({
      contentTypes: session.contentTypes,
      cardCount: session.cardCount,
      resourceDepth: session.resourceDepth,
      difficulties: session.difficulties
    }))

    // Navigate to study
    window.location.href = '/beatdesign/study'
  }

  const handleSkipSession = (sessionId: string) => {
    if (window.confirm('Skip this session? It will be rescheduled for tomorrow.')) {
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return {
            ...session,
            scheduledFor: tomorrow.toISOString().split('T')[0]
          }
        }
        return session
      })
      setSessions(updatedSessions)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getContentTypeIcon = (type: string) => {
    const option = contentTypeOptions.find(opt => opt.value === type)
    if (!option) return BookOpen
    return option.icon
  }

  const getContentTypeColor = (type: string) => {
    const option = contentTypeOptions.find(opt => opt.value === type)
    return option?.color || 'gray'
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600" />
            Study Schedule
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Plan and track your system design learning sessions
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled Sessions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {sessions.filter(s => s.isRecurring).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Recurring Sessions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">
            {sessions.filter(s => s.scheduledFor === today).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Due Today</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sessions.reduce((sum, s) => sum + (s.completedDates?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed Sessions</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Study Sessions
        </h2>

        {sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sessions scheduled
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first study session to get started with structured learning.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Session
            </button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      {session.isRecurring && (
                        <Badge variant="info" className="text-xs">
                          {session.recurrencePattern?.frequency}
                        </Badge>
                      )}
                      {session.scheduledFor === today && (
                        <Badge variant="warning" className="text-xs">
                          Due Today
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.scheduledFor)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.cardCount} items</span>
                      </div>
                      {session.resourceDepth && (
                        <div className="flex items-center space-x-1">
                          <span className="capitalize">{session.resourceDepth.replace('-', ' ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Content:
                        </span>
                        <div className="flex space-x-1">
                          {session.contentTypes.map((type) => {
                            const Icon = getContentTypeIcon(type)
                            const color = getContentTypeColor(type)
                            return (
                              <Badge key={type} variant="info" className="text-xs">
                                <Icon className="h-3 w-3 mr-1" />
                                {type.replace('_', ' ')}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Difficulty:
                        </span>
                        <div className="flex space-x-1">
                          {session.difficulties.map((diff) => (
                            <Badge key={diff} variant="warning" className="text-xs">
                              {diff}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {session.completedDates && session.completedDates.length > 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Completed {session.completedDates.length} times
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Session Status Indicator */}
                    {session.scheduledFor === today && (
                      <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>Due Today</span>
                      </div>
                    )}
                    {(session.completedDates?.length || 0) > 0 && (
                      <div className="flex items-center space-x-1 text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>{session.completedDates?.length} completed</span>
                      </div>
                    )}

                    {session.scheduledFor === today ? (
                      <button
                        onClick={() => handleStartSession(session)}
                        className="flex items-center px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartSession(session)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start Session
                      </button>
                    )}

                    <button
                      onClick={() => handleSkipSession(session.id)}
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                      title="Skip this session"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Skip
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create Study Session
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={newSession.title || ''}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Morning Concepts Review"
                  />
                </div>

                {/* Content Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Types
                  </label>
                  <div className="space-y-2">
                    {contentTypeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newSession.contentTypes?.includes(option.value) || false}
                            onChange={(e) => {
                              const current = newSession.contentTypes || []
                              if (e.target.checked) {
                                setNewSession({
                                  ...newSession,
                                  contentTypes: [...current, option.value]
                                })
                              } else {
                                setNewSession({
                                  ...newSession,
                                  contentTypes: current.filter(t => t !== option.value)
                                })
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 mr-2"
                          />
                          <Icon className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {option.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Card Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Items
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newSession.cardCount || 15}
                    onChange={(e) => setNewSession({ ...newSession, cardCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Resource Depth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resource Depth
                  </label>
                  <select
                    value={newSession.resourceDepth || 'mixed'}
                    onChange={(e) => setNewSession({ ...newSession, resourceDepth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {resourceDepthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheduled Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={newSession.scheduledFor || ''}
                    onChange={(e) => setNewSession({ ...newSession, scheduledFor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Recurring */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.isRecurring || false}
                      onChange={(e) => setNewSession({ ...newSession, isRecurring: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Make this a recurring session
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}