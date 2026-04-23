import { useEffect, useState } from 'react'
import { Search, Filter, BookOpen, Clock } from 'lucide-react'
import dataLoader from '../services/dataLoader'
import { getProgress } from '../services/progress'
import ContentCard from '../components/common/ContentCard'
import Badge from '../../../shared/components/common/Badge'
import type { Concept } from '../services/dataLoader'

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']
const categories = ['All', 'Core Fundamentals', 'Advanced Concepts']

export default function BrowseConcepts() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [filteredConcepts, setFilteredConcepts] = useState<Concept[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadConcepts = async () => {
      try {
        await dataLoader.loadData()
        const allConcepts = dataLoader.getConcepts()
        setConcepts(allConcepts)
        setFilteredConcepts(allConcepts)
      } catch (error) {
        console.error('Failed to load concepts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConcepts()
  }, [])

  useEffect(() => {
    let filtered = concepts

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(concept =>
        concept.title.toLowerCase().includes(term) ||
        concept.description.toLowerCase().includes(term) ||
        concept.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(concept => concept.difficulty === selectedDifficulty)
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(concept => concept.category === selectedCategory)
    }

    setFilteredConcepts(filtered)
  }, [concepts, searchTerm, selectedDifficulty, selectedCategory])

  const getConceptProgress = (conceptId: string) => {
    const progress = getProgress()
    const conceptProgress = progress.studyItemProgress[conceptId]

    if (!conceptProgress || conceptProgress.nextDue === null) {
      return { status: 'new' as const }
    }

    if (conceptProgress.reps < 2) {
      return {
        status: 'learning' as const,
        nextDue: conceptProgress.nextDue,
        reps: conceptProgress.reps
      }
    }

    return {
      status: 'mature' as const,
      nextDue: conceptProgress.nextDue,
      reps: conceptProgress.reps
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading concepts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="h-8 w-8 mr-3 text-purple-600" />
            System Design Concepts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Master the fundamental building blocks of system design
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="info" className="text-sm">
            {filteredConcepts.length} of {concepts.length} concepts
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
              placeholder="Search concepts, descriptions, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
          <div className="text-2xl font-bold text-purple-600">{concepts.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Concepts</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {concepts.reduce((sum, c) => sum + (c.resources?.filter(r => r.depth === 'just-enough').length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Just Enough Resources</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {concepts.reduce((sum, c) => sum + (c.resources?.filter(r => r.depth === 'deep-dive').length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Deep Dive Resources</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(concepts.reduce((sum, c) => sum + (c.estimatedMinutes || 0), 0) / 60)}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</div>
        </div>
      </div>

      {/* Concepts Grid */}
      {filteredConcepts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcepts.map((concept) => (
            <ContentCard
              key={concept.id}
              item={concept}
              showProgress={true}
              progress={getConceptProgress(concept.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No concepts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}