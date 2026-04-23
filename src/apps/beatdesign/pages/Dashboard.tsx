import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import dataLoader from '../services/dataLoader'
import { getStats, getDueItems, getNewItems } from '../services/progress'
import Card from '../../../shared/components/common/Card'
import Badge from '../../../shared/components/common/Badge'
import ProgressBar from '../../../shared/components/common/ProgressBar'
import {
  BookOpen,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Brain,
  Flame,
  BarChart3,
  Play,
  SkipForward,
  CheckSquare,
  Square
} from 'lucide-react'
import type { Stats } from '../services/progress'
import type { StudyItem } from '../services/dataLoader'

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [dueItems, setDueItems] = useState<StudyItem[]>([])
  const [newItems, setNewItems] = useState<StudyItem[]>([])
  const [selectedDueItems, setSelectedDueItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        await dataLoader.loadData()
        const allItems = dataLoader.getAllContent()
        const currentStats = getStats(allItems)
        const currentDueItems = getDueItems(allItems)
        const currentNewItems = getNewItems(allItems).slice(0, 10) // Show top 10 new items

        setStats(currentStats)
        setDueItems(currentDueItems)
        setNewItems(currentNewItems)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSkipDueItem = (itemId: string) => {
    // Skip this due item (move to tomorrow)
    import('../services/progress').then(({ skipItem }) => {
      skipItem(itemId)
      // Refresh the dashboard
      window.location.reload()
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    )
  }

  const progressPercentage = stats.total > 0 ? Math.round(((stats.total - stats.new) / stats.total) * 100) : 0
  const studiedItems = stats.total - stats.new

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Design Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Master system design with spaced repetition
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Overall Progress
            </h2>
            <Badge variant={progressPercentage >= 50 ? 'success' : 'info'}>
              {progressPercentage}% Complete
            </Badge>
          </div>
          <ProgressBar progress={progressPercentage} />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <BarChart3 className="h-4 w-4 text-gray-600 mr-1" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <Target className="h-4 w-4 text-blue-600 mr-1" />
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">New</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <Brain className="h-4 w-4 text-yellow-600 mr-1" />
                <div className="text-2xl font-bold text-yellow-600">{stats.learning}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Learning</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <div className="text-2xl font-bold text-green-600">{stats.mature}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mature</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Due Today */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              Due Today
            </h2>
            <Badge variant={stats.dueToday > 0 ? 'danger' : 'success'} className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {stats.dueToday} items
            </Badge>
          </div>
          {stats.dueToday > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                You have {stats.dueToday} items due for review today. Start studying to maintain your progress!
              </p>

              {/* Due Items List */}
              {dueItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Due Items:</h4>
                  {dueItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {item.type.replace('_', ' ')} • {item.difficulty}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSkipDueItem(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Skip to tomorrow"
                        >
                          <SkipForward className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/beatdesign/study?item=${item.id}`}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Study Now
                        </Link>
                      </div>
                    </div>
                  ))}
                  {dueItems.length > 5 && (
                    <p className="text-sm text-gray-500">
                      And {dueItems.length - 5} more items...
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <Link
                  to="/beatdesign/study"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Studying ({stats.dueToday} due)
                </Link>
                <Link
                  to="/beatdesign/schedule"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Excellent! No items due for review today. 🎉
              </p>
              {newItems.length > 0 && (
                <Link
                  to="/beatdesign/study"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study New Content
                </Link>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Content Type Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Concepts
              </h3>
              <Link
                to="/beatdesign/concepts"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Browse →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-medium">{stats.byType.concept.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Studied
                </span>
                <span className="font-medium">{stats.byType.concept.seen}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1 text-red-600" />
                  Due Today
                </span>
                <Badge variant={stats.byType.concept.due > 0 ? 'danger' : 'success'} className="text-xs">
                  {stats.byType.concept.due}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Questions
              </h3>
              <Link
                to="/beatdesign/questions"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Browse →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-medium">{stats.byType.interview.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Practiced
                </span>
                <span className="font-medium">{stats.byType.interview.seen}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1 text-red-600" />
                  Due Today
                </span>
                <Badge variant={stats.byType.interview.due > 0 ? 'danger' : 'success'} className="text-xs">
                  {stats.byType.interview.due}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Case Studies
              </h3>
              <Link
                to="/beatdesign/studies"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Browse →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-medium">{stats.byType.case_study.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Reviewed
                </span>
                <span className="font-medium">{stats.byType.case_study.seen}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1 text-red-600" />
                  Due Today
                </span>
                <Badge variant={stats.byType.case_study.due > 0 ? 'danger' : 'success'} className="text-xs">
                  {stats.byType.case_study.due}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* New Items Preview */}
      {newItems.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Ready to Learn
              </h2>
              <Badge variant="info">
                {newItems.length} new items
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start learning these new system design topics:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {newItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {item.type.replace('_', ' ')} • {item.difficulty}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/beatdesign/study?item=${item.id}`}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Learn
                  </Link>
                </div>
              ))}
            </div>
            {newItems.length > 6 && (
              <p className="text-sm text-gray-500 mt-3">
                And {newItems.length - 6} more new items...
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Difficulty Breakdown */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progress by Difficulty
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(stats.byDifficulty)
              .filter(([_, data]) => data.total > 0)
              .map(([difficulty, data]) => {
                const percentage = data.total > 0 ? Math.round((data.seen / data.total) * 100) : 0
                return (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {difficulty}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {data.seen}/{data.total}
                      </span>
                    </div>
                    <ProgressBar
                      progress={percentage}
                      variant={difficulty.includes('Easy') || difficulty.includes('Beginner') ? 'success' :
                               difficulty.includes('Medium') || difficulty.includes('Intermediate') ? 'warning' : 'danger'}
                    />
                  </div>
                )
              })}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 text-center">
            <Flame className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keep Your Streak!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {stats.dueToday > 0
                ? `${stats.dueToday} items due today - don't break your streak!`
                : 'Great job staying on track!'
              }
            </p>
            <Link
              to="/beatdesign/study"
              className="inline-flex items-center px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              Continue Studying
            </Link>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Plan Your Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Schedule custom study sessions and track your progress
            </p>
            <Link
              to="/beatdesign/schedule"
              className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}