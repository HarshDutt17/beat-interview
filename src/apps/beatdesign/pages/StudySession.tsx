import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Clock, ExternalLink, Lightbulb, CheckCircle, XCircle, Brain } from 'lucide-react'
import dataLoader from '../services/dataLoader'
import { getDueItems, getNewItems, reviewItem, skipItem, Outcome } from '../services/progress'
import Card from '../../../shared/components/common/Card'
import Badge from '../../../shared/components/common/Badge'
import type { StudyItem } from '../services/dataLoader'

interface SessionStats {
  total: number
  completed: number
  understood: number
  needReview: number
  mastered: number
}

export default function StudySession() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [allItems, setAllItems] = useState<StudyItem[]>([])
  const [studyQueue, setStudyQueue] = useState<StudyItem[]>([])
  const [currentItem, setCurrentItem] = useState<StudyItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total: 0,
    completed: 0,
    understood: 0,
    needReview: 0,
    mastered: 0
  })

  useEffect(() => {
    const loadSession = async () => {
      try {
        await dataLoader.loadData()
        const all = dataLoader.getAllContent()
        setAllItems(all)

        // Check if specific item requested
        const itemId = searchParams.get('item')
        if (itemId) {
          const specificItem = all.find(item => item.id === itemId)
          if (specificItem) {
            setStudyQueue([specificItem])
            setCurrentItem(specificItem)
            setCurrentIndex(0)
            setSessionStats(prev => ({ ...prev, total: 1 }))
            setLoading(false)
            return
          }
        }

        // Create study queue: due items first, then new items (limited to 20 total)
        const dueItems = getDueItems(all)
        const newItems = getNewItems(all).slice(0, Math.max(0, 20 - dueItems.length))
        const queue = [...dueItems, ...newItems].slice(0, 20)

        setStudyQueue(queue)
        setCurrentItem(queue[0] || null)
        setCurrentIndex(0)
        setSessionStats(prev => ({ ...prev, total: queue.length }))
      } catch (error) {
        console.error('Failed to load study session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [searchParams])

  const handleOutcome = (outcome: Outcome) => {
    if (!currentItem) return

    reviewItem(currentItem.id, outcome)

    setSessionStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      understood: prev.understood + (outcome === Outcome.Understood ? 1 : 0),
      needReview: prev.needReview + (outcome === Outcome.NeedReview ? 1 : 0),
      mastered: prev.mastered + (outcome === Outcome.Mastered ? 1 : 0)
    }))

    nextItem()
  }

  const handleSkip = () => {
    if (!currentItem) return

    skipItem(currentItem.id)
    nextItem()
  }

  const nextItem = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < studyQueue.length) {
      setCurrentIndex(nextIndex)
      setCurrentItem(studyQueue[nextIndex])
      setShowAnswer(false)
    } else {
      // Session completed
      setCurrentItem(null)
    }
  }

  const previousItem = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentItem(studyQueue[prevIndex])
      setShowAnswer(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading study session...</p>
        </div>
      </div>
    )
  }

  if (studyQueue.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No Items to Study
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Great job! You're all caught up. Check back later for more items due for review.
        </p>
        <div className="space-x-4">
          <Link
            to="/beatdesign/concepts"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Browse Concepts
          </Link>
          <Link
            to="/beatdesign/questions"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Browse Questions
          </Link>
        </div>
      </div>
    )
  }

  // Session completed
  if (!currentItem) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Session Complete! 🎉
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto mb-8">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Items studied:</span>
              <span className="font-medium">{sessionStats.completed}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Mastered:</span>
              <span className="font-medium">{sessionStats.mastered}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Understood:</span>
              <span className="font-medium">{sessionStats.understood}</span>
            </div>
            <div className="flex justify-between text-yellow-600">
              <span>Need Review:</span>
              <span className="font-medium">{sessionStats.needReview}</span>
            </div>
          </div>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/beatdesign')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Start New Session
          </button>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.round((currentIndex / studyQueue.length) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/beatdesign')}
          className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex items-center space-x-4">
          <Badge variant="info" className="text-sm">
            {currentIndex + 1} / {studyQueue.length}
          </Badge>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {progressPercentage}% complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Current Item */}
      <Card className="p-6">
        {/* Item Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <Badge variant="info" className="mb-2">
                {currentItem.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentItem.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{currentItem.estimatedMinutes}m</span>
            <Badge variant="warning">{currentItem.difficulty}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {currentItem.description}
            </p>

            {/* Additional content for different types */}
            {'company' in currentItem && currentItem.company && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">{currentItem.company}</span>
                  <span>•</span>
                  <span>{currentItem.focus}</span>
                </div>
                {currentItem.overview && (
                  <p className="mt-2 text-blue-700 dark:text-blue-300">
                    {currentItem.overview}
                  </p>
                )}
              </div>
            )}

            {'prompt' in currentItem && currentItem.prompt && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Interview Question:
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {currentItem.prompt}
                </p>
                {currentItem.constraints && (
                  <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                    <strong>Constraints:</strong> {currentItem.constraints.text}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resources */}
          {showAnswer && currentItem.resources && currentItem.resources.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Study Resources
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {currentItem.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {resource.title}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge
                            variant={resource.depth === 'just-enough' ? 'info' : 'warning'}
                            className="text-xs"
                          >
                            {resource.depth.replace('-', ' ')}
                          </Badge>
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.estimatedMinutes}m</span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousItem}
          disabled={currentIndex === 0}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-4">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Show Resources & Next Steps
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleOutcome(Outcome.NeedReview)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Need Review
              </button>
              <button
                onClick={() => handleOutcome(Outcome.Understood)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Understood
              </button>
              <button
                onClick={() => handleOutcome(Outcome.Mastered)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Mastered
              </button>
            </div>
          )}

          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip
          </button>
        </div>

        <button
          onClick={nextItem}
          disabled={currentIndex === studyQueue.length - 1}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  )
}