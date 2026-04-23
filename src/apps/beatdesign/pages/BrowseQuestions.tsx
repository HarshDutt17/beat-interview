import { useEffect, useState } from 'react'
import { Search, Filter, MessageSquare, Target } from 'lucide-react'
import dataLoader from '../services/dataLoader'
import { getProgress } from '../services/progress'
import ContentCard from '../components/common/ContentCard'
import Badge from '../../../shared/components/common/Badge'
import type { InterviewQuestion } from '../services/dataLoader'

const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const categories = ['All', 'System Design Interview', 'Top 20 Interview Questions']

export default function BrowseQuestions() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        await dataLoader.loadData()
        const allQuestions = dataLoader.getQuestions()
        setQuestions(allQuestions)
        setFilteredQuestions(allQuestions)
      } catch (error) {
        console.error('Failed to load questions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [])

  useEffect(() => {
    let filtered = questions

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(term) ||
        question.description.toLowerCase().includes(term) ||
        question.prompt.toLowerCase().includes(term) ||
        question.coreTopics.some(topic => topic.toLowerCase().includes(term)) ||
        question.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(question => question.difficulty === selectedDifficulty)
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(question => question.category === selectedCategory)
    }

    setFilteredQuestions(filtered)
  }, [questions, searchTerm, selectedDifficulty, selectedCategory])

  const getQuestionProgress = (questionId: string) => {
    const progress = getProgress()
    const questionProgress = progress.studyItemProgress[questionId]

    if (!questionProgress || questionProgress.nextDue === null) {
      return { status: 'new' as const }
    }

    if (questionProgress.reps < 2) {
      return {
        status: 'learning' as const,
        nextDue: questionProgress.nextDue,
        reps: questionProgress.reps
      }
    }

    return {
      status: 'mature' as const,
      nextDue: questionProgress.nextDue,
      reps: questionProgress.reps
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    )
  }

  const top20Questions = questions.filter(q => q.category === 'Top 20 Interview Questions')
  const standardQuestions = questions.filter(q => q.category === 'System Design Interview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-green-600" />
            Interview Questions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Practice system design interview questions with detailed solutions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="info" className="text-sm">
            {filteredQuestions.length} of {questions.length} questions
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search questions, topics, or constraints..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">{questions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{top20Questions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Top 20 Questions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-red-600">
            {questions.filter(q => q.difficulty === 'Hard').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Hard Questions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(questions.reduce((sum, q) => sum + (q.estimatedMinutes || 0), 0) / 60)}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Practice Time</div>
        </div>
      </div>

      {/* Category Sections */}
      {selectedCategory === 'All' ? (
        <div className="space-y-8">
          {/* Top 20 Questions */}
          {top20Questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Top 20 Most Asked Questions
                </h2>
                <Badge variant="warning" className="text-xs">
                  High Frequency
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {top20Questions
                  .filter(q => !searchTerm.trim() ||
                    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.coreTopics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .filter(q => selectedDifficulty === 'All' || q.difficulty === selectedDifficulty)
                  .map((question) => (
                    <ContentCard
                      key={question.id}
                      item={question}
                      showProgress={true}
                      progress={getQuestionProgress(question.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Standard Questions */}
          {standardQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  System Design Questions
                </h2>
                <Badge variant="info" className="text-xs">
                  Comprehensive Practice
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardQuestions
                  .filter(q => !searchTerm.trim() ||
                    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.coreTopics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .filter(q => selectedDifficulty === 'All' || q.difficulty === selectedDifficulty)
                  .map((question) => (
                    <ContentCard
                      key={question.id}
                      item={question}
                      showProgress={true}
                      progress={getQuestionProgress(question.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Filtered Questions Grid */
        filteredQuestions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <ContentCard
                key={question.id}
                item={question}
                showProgress={true}
                progress={getQuestionProgress(question.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No questions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )
      )}
    </div>
  )
}