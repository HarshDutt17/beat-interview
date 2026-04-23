// System Design Topics (20 core concepts)
export const SystemDesignTopic = {
  Scalability: 'Scalability',
  LoadBalancing: 'Load Balancing',
  Caching: 'Caching',
  CDN: 'Content Delivery Networks (CDNs)',
  Databases: 'Databases (SQL vs NoSQL)',
  CAPTheorem: 'CAP Theorem & Consistency Models',
  Replication: 'Replication',
  Sharding: 'Sharding',
  Indexing: 'Indexing',
  MessageQueues: 'Message Queues',
  PubSub: 'Pub/Sub',
  RateLimiting: 'Rate Limiting',
  Microservices: 'Microservices',
  ServiceDiscovery: 'Service Discovery',
  Monitoring: 'Monitoring & Observability',
  DistributedTracing: 'Distributed Tracing',
  Security: 'Security',
  Idempotency: 'Idempotency',
  Transactions: 'Transactions',
  ConsensusAlgorithms: 'Consensus Algorithms',
} as const

export type SystemDesignTopicType = typeof SystemDesignTopic[keyof typeof SystemDesignTopic]

// Content Types
export const ContentType = {
  Concept: 'concept',
  CaseStudy: 'case_study',
  Interview: 'interview'
} as const

export type ContentTypeType = typeof ContentType[keyof typeof ContentType]

// Difficulty levels
export const Difficulty = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced'
} as const

export type DifficultyType = typeof Difficulty[keyof typeof Difficulty]

// Resource depth tags
export const ResourceDepth = {
  JustEnough: 'just-enough',
  DeepDive: 'deep-dive'
} as const

export type ResourceDepthType = typeof ResourceDepth[keyof typeof ResourceDepth]

// Resource types
export type ResourceType = 'article' | 'video' | 'blog' | 'course' | 'paper' | 'official doc' | 'discussion' | 'presentation'

// Study outcomes for spaced repetition
export const Outcome = {
  Understood: 'understood',
  NeedReview: 'need_review',
  Mastered: 'mastered'
} as const

export type OutcomeType = typeof Outcome[keyof typeof Outcome]

// Base interfaces
export interface Resource {
  title: string
  link: string
  type: ResourceType
  depth: ResourceDepthType
  estimatedMinutes: number
}

export interface StudyItem {
  id: string
  title: string
  description?: string
  estimatedMinutes: number
  difficulty: DifficultyType
  orderIndex: number
  resources: Resource[]
}

// Concept (20 core system design topics)
export interface Concept extends StudyItem {
  studyPlanWeeks: number[]
  relatedQuestions: string[] // IDs of related interview questions
  relatedCases: string[] // IDs of related case studies
  prerequisites?: string[] // IDs of prerequisite concepts
}

// Case Study (real-world system architectures)
export interface CaseStudy extends StudyItem {
  overview: string
  keyConcepts: string[] // Names of key concepts used
  relatedConcepts: string[] // IDs of related concept items
}

// Interview Question (system design problems)
export interface InterviewQuestion extends StudyItem {
  prompt: string
  constraints: {
    text: string
    metrics: Record<string, string> // Extracted structured metrics
  }
  studyPlanWeeks: number[]
  requiredConcepts: string[] // IDs of prerequisite concepts
}

// Progress tracking for spaced repetition
export interface StudyProgress {
  id: string // concept/case/interview ID
  attempts: number
  lastReviewed: string // ISO date string
  nextDue: string // ISO date string
  easeFactor: number // SM-2 ease factor
  interval: number // Days until next review
  state: 'new' | 'learning' | 'mature'
  outcome?: OutcomeType
}

// User's overall progress
export interface UserProgress {
  [itemId: string]: StudyProgress
}

// Study session for scheduling
export interface StudySession {
  id: string
  title: string
  contentTypes: ContentTypeType[] // What types to include
  topics: string[] // Topic filter (empty = all)
  difficulties: DifficultyType[] // Difficulty filter (empty = all)
  resourceDepth?: ResourceDepthType // Filter by resource depth
  cardCount: number
  scheduledFor: string // Date string YYYY-MM-DD
  isRecurring: boolean
  recurrencePattern?: {
    frequency: 'Daily' | 'Weekly'
    interval: number
    daysOfWeek?: number[] // 0-6 for weekly
  }
  completed?: boolean
  completedDates?: string[] // For recurring sessions
}

// Week in the 12-week study curriculum
export interface CurriculumWeek {
  week: number
  theme: string
  concepts: string[] // Concept IDs to study this week
  interviews: string[] // Interview IDs to practice this week
  estimatedHours: number
}

// Complete system design data structure
export interface SystemDesignData {
  metadata: {
    lastUpdated: string
    estimatedStudyHours: number
    totalContent: {
      concepts: number
      caseStudies: number
      interviews: number
    }
    version: string
    description: string
  }
  content: {
    concepts: Concept[]
    caseStudies: CaseStudy[]
    interviews: InterviewQuestion[]
  }
  curriculum: {
    weeks: CurriculumWeek[]
  }
  taxonomy: {
    categories: Record<string, string[]> // Category name -> item IDs
    difficulties: Record<string, string[]> // Difficulty -> item IDs
    resourceDepths: Record<string, string> // Depth tag descriptions
  }
}

// Topic color mappings for UI
export const SYSTEM_DESIGN_TOPIC_COLORS: Record<string, string> = {
  [SystemDesignTopic.Scalability]: '#3b82f6', // blue
  [SystemDesignTopic.LoadBalancing]: '#8b5cf6', // purple
  [SystemDesignTopic.Caching]: '#ef4444', // red
  [SystemDesignTopic.CDN]: '#f97316', // orange
  [SystemDesignTopic.Databases]: '#84cc16', // lime
  [SystemDesignTopic.CAPTheorem]: '#06b6d4', // cyan
  [SystemDesignTopic.MessageQueues]: '#ec4899', // pink
  [SystemDesignTopic.Microservices]: '#10b981', // emerald
  [SystemDesignTopic.Monitoring]: '#6366f1', // indigo
  [SystemDesignTopic.Security]: '#dc2626', // red-600
}

// Difficulty color mappings
export const DIFFICULTY_COLORS_DESIGN: Record<DifficultyType, string> = {
  [Difficulty.Easy]: '#22c55e', // green
  [Difficulty.Medium]: '#f59e0b', // amber
  [Difficulty.Hard]: '#ef4444', // red
  [Difficulty.Beginner]: '#84cc16', // lime
  [Difficulty.Intermediate]: '#f59e0b', // amber
  [Difficulty.Advanced]: '#dc2626', // red-600
}

// Resource depth color mappings
export const RESOURCE_DEPTH_COLORS: Record<ResourceDepthType, string> = {
  [ResourceDepth.JustEnough]: '#06b6d4', // cyan - quick/surface
  [ResourceDepth.DeepDive]: '#6366f1', // indigo - comprehensive
}

// Content type icons
export const CONTENT_TYPE_ICONS: Record<ContentTypeType, string> = {
  [ContentType.Concept]: '📚', // books for concepts
  [ContentType.CaseStudy]: '🏗️', // building for case studies
  [ContentType.Interview]: '💭', // thought bubble for interviews
}