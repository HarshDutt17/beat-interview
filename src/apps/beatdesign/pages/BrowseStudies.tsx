import { useEffect, useState } from 'react'
import { Search, Filter, Users, Building2 } from 'lucide-react'
import dataLoader from '../services/dataLoader'
import { getProgress } from '../services/progress'
import ContentCard from '../components/common/ContentCard'
import Badge from '../../../shared/components/common/Badge'
import type { CaseStudy } from '../services/dataLoader'

const difficulties = ['All', 'Medium', 'Hard']
const categories = ['All', 'Industry Case Studies', 'Top Company Studies']

// Extract unique companies and focus areas from the data
const getUniqueCompanies = (studies: CaseStudy[]) => {
  const companies = Array.from(new Set(studies.map(s => s.company))).sort()
  return ['All', ...companies]
}

const getUniqueFocusAreas = (studies: CaseStudy[]) => {
  const focuses = Array.from(new Set(studies.map(s => s.focus))).sort()
  return ['All', ...focuses]
}

export default function BrowseStudies() {
  const [studies, setStudies] = useState<CaseStudy[]>([])
  const [filteredStudies, setFilteredStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [selectedFocus, setSelectedFocus] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadStudies = async () => {
      try {
        await dataLoader.loadData()
        const allStudies = dataLoader.getStudies()
        setStudies(allStudies)
        setFilteredStudies(allStudies)
      } catch (error) {
        console.error('Failed to load studies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStudies()
  }, [])

  useEffect(() => {
    let filtered = studies

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(study =>
        study.title.toLowerCase().includes(term) ||
        study.company.toLowerCase().includes(term) ||
        study.focus.toLowerCase().includes(term) ||
        study.overview.toLowerCase().includes(term) ||
        study.keyConcepts.some(concept => concept.toLowerCase().includes(term)) ||
        study.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(study => study.difficulty === selectedDifficulty)
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(study => study.category === selectedCategory)
    }

    // Filter by company
    if (selectedCompany !== 'All') {
      filtered = filtered.filter(study => study.company === selectedCompany)
    }

    // Filter by focus area
    if (selectedFocus !== 'All') {
      filtered = filtered.filter(study => study.focus === selectedFocus)
    }

    setFilteredStudies(filtered)
  }, [studies, searchTerm, selectedDifficulty, selectedCategory, selectedCompany, selectedFocus])

  const getStudyProgress = (studyId: string) => {
    const progress = getProgress()
    const studyProgress = progress.studyItemProgress[studyId]

    if (!studyProgress || studyProgress.nextDue === null) {
      return { status: 'new' as const }
    }

    if (studyProgress.reps < 2) {
      return {
        status: 'learning' as const,
        nextDue: studyProgress.nextDue,
        reps: studyProgress.reps
      }
    }

    return {
      status: 'mature' as const,
      nextDue: studyProgress.nextDue,
      reps: studyProgress.reps
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading case studies...</p>
        </div>
      </div>
    )
  }

  const companies = getUniqueCompanies(studies)
  const focusAreas = getUniqueFocusAreas(studies)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-blue-600" />
            Real-World Case Studies
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Learn from industry leaders and their system architectures
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="info" className="text-sm">
            {filteredStudies.length} of {studies.length} studies
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
              placeholder="Search companies, focus areas, or concepts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map(company => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Focus Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus Area
                </label>
                <select
                  value={selectedFocus}
                  onChange={(e) => setSelectedFocus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {focusAreas.map(focus => (
                    <option key={focus} value={focus}>
                      {focus}
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
          <div className="text-2xl font-bold text-blue-600">{studies.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Studies</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">{companies.length - 1}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Companies</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">{focusAreas.length - 1}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Focus Areas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(studies.reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0) / 60)}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</div>
        </div>
      </div>

      {/* Studies Grid */}
      {filteredStudies.length > 0 ? (
        <div className="space-y-6">
          {/* Group by category for better organization */}
          {categories.slice(1).map(category => {
            const categoryStudies = filteredStudies.filter(study => study.category === category)
            if (categoryStudies.length === 0) return null

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {category}
                  </h2>
                  <Badge variant="info" className="text-xs">
                    {categoryStudies.length} studies
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryStudies.map((study) => (
                    <ContentCard
                      key={study.id}
                      item={study}
                      showProgress={true}
                      progress={getStudyProgress(study.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* If filtered by search or specific filters, show all in one grid */}
          {(searchTerm.trim() || selectedDifficulty !== 'All' || selectedCompany !== 'All' || selectedFocus !== 'All') && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudies.map((study) => (
                <ContentCard
                  key={study.id}
                  item={study}
                  showProgress={true}
                  progress={getStudyProgress(study.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No case studies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}