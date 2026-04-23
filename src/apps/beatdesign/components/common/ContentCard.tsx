import { Link } from 'react-router-dom'
import { Clock, BookOpen, Users, Target, CheckCircle, AlertCircle, Brain, Circle } from 'lucide-react'
import Card from '../../../../shared/components/common/Card'
import Badge from '../../../../shared/components/common/Badge'
import type { StudyItem } from '../../services/dataLoader'

interface ContentCardProps {
  item: StudyItem
  showProgress?: boolean
  progress?: {
    status: 'new' | 'learning' | 'mature'
    nextDue?: string
    reps?: number
  }
}

const getProgressStatusDisplay = (progress: { status: 'new' | 'learning' | 'mature', nextDue?: string, reps?: number } | undefined) => {
  if (!progress) {
    return {
      icon: <Circle className="h-4 w-4" />,
      text: 'New',
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const isDue = progress.nextDue && progress.nextDue <= today

  if (progress.status === 'mature') {
    return {
      icon: isDue ? <AlertCircle className="h-4 w-4" /> : <Brain className="h-4 w-4" />,
      text: isDue ? 'Due Today' : 'Mastered',
      color: isDue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
      bgColor: isDue ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
    }
  }

  if (progress.status === 'learning') {
    return {
      icon: isDue ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />,
      text: isDue ? 'Due Review' : `Learning (${progress.reps || 0} reps)`,
      color: isDue ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400',
      bgColor: isDue ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
    }
  }

  return {
    icon: <Circle className="h-4 w-4" />,
    text: 'New',
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800'
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
    case 'beginner':
      return 'success'
    case 'medium':
    case 'intermediate':
      return 'warning'
    case 'hard':
    case 'advanced':
      return 'danger'
    default:
      return 'info'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'concept':
      return <BookOpen className="h-4 w-4" />
    case 'case_study':
      return <Users className="h-4 w-4" />
    case 'interview':
      return <Target className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'concept':
      return 'text-purple-600 dark:text-purple-400'
    case 'case_study':
      return 'text-blue-600 dark:text-blue-400'
    case 'interview':
      return 'text-green-600 dark:text-green-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

export default function ContentCard({ item, showProgress = false, progress }: ContentCardProps) {
  const justEnoughResources = item.resources?.filter(r => r.depth === 'just-enough').length || 0
  const deepDiveResources = item.resources?.filter(r => r.depth === 'deep-dive').length || 0
  const totalResources = item.resources?.length || 0
  const progressDisplay = showProgress ? getProgressStatusDisplay(progress) : null

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 ${progressDisplay ? 'border-l-4' : ''} ${
      progressDisplay?.color === 'text-red-600 dark:text-red-400' ? 'border-l-red-500' :
      progressDisplay?.color === 'text-orange-600 dark:text-orange-400' ? 'border-l-orange-500' :
      progressDisplay?.color === 'text-green-600 dark:text-green-400' ? 'border-l-green-500' :
      progressDisplay?.color === 'text-blue-600 dark:text-blue-400' ? 'border-l-blue-500' :
      'border-l-gray-300'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={getTypeColor(item.type)}>
              {getTypeIcon(item.type)}
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
              {item.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getDifficultyColor(item.difficulty)}>
              {item.difficulty}
            </Badge>
          </div>
        </div>

        {/* Progress Indicator - Prominent Display */}
        {showProgress && progressDisplay && (
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${progressDisplay.bgColor}`}>
            <div className={progressDisplay.color}>
              {progressDisplay.icon}
            </div>
            <span className={`text-sm font-medium ${progressDisplay.color}`}>
              {progressDisplay.text}
            </span>
          </div>
        )}

        {/* Content */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{item.estimatedMinutes}m</span>
            </div>
            {totalResources > 0 && (
              <div className="flex items-center space-x-1">
                <BookOpen className="h-3 w-3" />
                <span>{totalResources} resources</span>
              </div>
            )}
          </div>
        </div>

        {/* Resource depth breakdown */}
        {totalResources > 0 && (
          <div className="flex items-center space-x-4 text-xs">
            {justEnoughResources > 0 && (
              <div className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-400">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>{justEnoughResources} Just Enough</span>
              </div>
            )}
            {deepDiveResources > 0 && (
              <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>{deepDiveResources} Deep Dive</span>
              </div>
            )}
          </div>
        )}

        {/* Company info for case studies */}
        {'company' in item && item.company && (
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <span className="font-medium">{item.company}</span>
            {item.focus && <span className="text-gray-500 ml-2">• {item.focus}</span>}
          </div>
        )}

        {/* Core topics for interviews */}
        {'coreTopics' in item && item.coreTopics && item.coreTopics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.coreTopics.slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="info" className="text-xs">
                {topic}
              </Badge>
            ))}
            {item.coreTopics.length > 3 && (
              <Badge variant="info" className="text-xs">
                +{item.coreTopics.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="pt-2">
          {progressDisplay && (progressDisplay.text === 'Due Today' || progressDisplay.text === 'Due Review') ? (
            <Link
              to={`/beatdesign/study?item=${item.id}`}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Review Now
            </Link>
          ) : progressDisplay && progressDisplay.text === 'Mastered' ? (
            <Link
              to={`/beatdesign/study?item=${item.id}`}
              className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Review Again →
            </Link>
          ) : (
            <Link
              to={`/beatdesign/study?item=${item.id}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Study Now →
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}