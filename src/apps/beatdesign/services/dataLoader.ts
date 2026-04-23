import designCoreData from '../data/design-core.json'
import designStudiesData from '../data/design-studies.json'
import designQuestionsData from '../data/design-questions.json'

// Simple interfaces matching our JSON structure
export interface StudyItem {
  id: string
  title: string
  type: 'concept' | 'case_study' | 'interview'
  description: string
  estimatedMinutes: number
  difficulty: string
  orderIndex: number
  resources: Resource[]
  [key: string]: any
}

export interface Resource {
  title: string
  link: string
  type: string
  depth: 'just-enough' | 'deep-dive'
  estimatedMinutes: number
}

export interface Concept extends StudyItem {
  type: 'concept'
  category: string
  tags: string[]
  prerequisites: string[]
  relatedConcepts: string[]
}

export interface CaseStudy extends StudyItem {
  type: 'case_study'
  company: string
  focus: string
  overview: string
  keyConcepts: string[]
  tags: string[]
  category: string
}

export interface InterviewQuestion extends StudyItem {
  type: 'interview'
  prompt: string
  constraints: {
    text: string
    metrics?: Record<string, string>
  }
  coreTopics: string[]
  requiredConcepts: string[]
  tags: string[]
  category: string
}

export interface SystemDesignData {
  concepts: Concept[]
  studies: CaseStudy[]
  questions: InterviewQuestion[]
}

class DataLoader {
  private static instance: DataLoader
  private data: SystemDesignData | null = null

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader()
    }
    return DataLoader.instance
  }

  async loadData(): Promise<SystemDesignData> {
    if (this.data) {
      return this.data
    }

    try {
      // Load and transform the three JSON files
      const concepts = this.transformConcepts((designCoreData as any)?.concepts || [])
      const studies = this.transformStudies((designStudiesData as any)?.studies || [])
      const questions = this.transformQuestions((designQuestionsData as any)?.questions || [])

      this.data = {
        concepts,
        studies,
        questions
      }

      console.log('📚 System Design data loaded:', {
        concepts: concepts.length,
        studies: studies.length,
        questions: questions.length
      })

      return this.data
    } catch (error) {
      console.error('Failed to load system design data:', error)
      throw new Error('Failed to load system design data')
    }
  }

  private transformConcepts(rawConcepts: any[]): Concept[] {
    return rawConcepts.map((concept, index) => ({
      id: concept.id || `concept-${index}`,
      title: concept.title || 'Untitled Concept',
      type: 'concept' as const,
      description: concept.description || '',
      estimatedMinutes: concept.estimatedMinutes || 60,
      difficulty: concept.difficulty || 'Intermediate',
      category: concept.category || 'Core Fundamentals',
      orderIndex: concept.orderIndex ?? index,
      resources: concept.resources || [],
      tags: concept.tags || [],
      prerequisites: concept.prerequisites || [],
      relatedConcepts: concept.relatedConcepts || []
    }))
  }

  private transformStudies(rawStudies: any[]): CaseStudy[] {
    return rawStudies.map((study, index) => ({
      id: study.id || `study-${index}`,
      title: study.title || 'Untitled Study',
      type: 'case_study' as const,
      description: study.overview || study.description || '',
      company: study.company || 'Unknown',
      focus: study.focus || 'System Architecture',
      overview: study.overview || study.description || '',
      estimatedMinutes: study.estimatedMinutes || 40,
      difficulty: study.difficulty || 'Medium',
      orderIndex: study.orderIndex ?? index,
      keyConcepts: study.keyConcepts || [],
      resources: study.resources || [],
      tags: study.tags || [],
      category: study.category || 'Case Studies'
    }))
  }

  private transformQuestions(rawQuestions: any[]): InterviewQuestion[] {
    return rawQuestions.map((question, index) => ({
      id: question.id || `question-${index}`,
      title: question.title || 'Untitled Question',
      type: 'interview' as const,
      description: question.description || question.prompt || question.title,
      prompt: question.prompt || question.title,
      difficulty: question.difficulty || 'Medium',
      estimatedMinutes: question.estimatedMinutes || 45,
      orderIndex: question.orderIndex ?? index,
      constraints: question.constraints || { text: 'No constraints specified' },
      coreTopics: question.coreTopics || [],
      resources: question.resources || [],
      tags: question.tags || [],
      category: question.category || 'Interview Questions',
      requiredConcepts: question.requiredConcepts || []
    }))
  }

  // Helper methods for accessing data
  getConcepts(): Concept[] {
    return this.data?.concepts || []
  }

  getStudies(): CaseStudy[] {
    return this.data?.studies || []
  }

  getQuestions(): InterviewQuestion[] {
    return this.data?.questions || []
  }

  getAllContent(): StudyItem[] {
    if (!this.data) return []
    return [...this.data.concepts, ...this.data.studies, ...this.data.questions]
  }

  // Search functionality
  search(query: string, type?: 'concept' | 'case_study' | 'interview'): StudyItem[] {
    if (!this.data || !query.trim()) return []

    const searchTerm = query.toLowerCase()
    let items = this.getAllContent()

    if (type) {
      items = items.filter(item => item.type === type)
    }

    return items.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      ('overview' in item && item.overview?.toLowerCase().includes(searchTerm)) ||
      ('prompt' in item && item.prompt?.toLowerCase().includes(searchTerm))
    )
  }

  // Filter by difficulty
  filterByDifficulty(difficulty: string, type?: 'concept' | 'case_study' | 'interview'): StudyItem[] {
    if (!this.data) return []

    let items = this.getAllContent()

    if (type) {
      items = items.filter(item => item.type === type)
    }

    return items.filter(item => item.difficulty === difficulty)
  }

  // Get resource depth stats
  getResourceStats() {
    if (!this.data) return { justEnough: 0, deepDive: 0, total: 0 }

    const allResources = this.getAllContent().flatMap(item => item.resources || [])
    const justEnough = allResources.filter(resource => resource.depth === 'just-enough').length
    const deepDive = allResources.filter(resource => resource.depth === 'deep-dive').length

    return {
      justEnough,
      deepDive,
      total: allResources.length
    }
  }
}

export default DataLoader.getInstance()