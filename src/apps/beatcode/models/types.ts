export const BeatCodeTopic = {
  ArraysAndHashing: 'Arrays & Hashing',
  TwoPointers: 'Two Pointers',
  SlidingWindow: 'Sliding Window',
  Stack: 'Stack',
  BinarySearch: 'Binary Search',
  LinkedList: 'Linked List',
  Trees: 'Trees',
  Tries: 'Tries',
  HeapPriorityQueue: 'Heap / Priority Queue',
  Backtracking: 'Backtracking',
  Graphs: 'Graphs',
  AdvancedGraphs: 'Advanced Graphs',
  OneDDP: '1-D Dynamic Programming',
  TwoDDP: '2-D Dynamic Programming',
  Greedy: 'Greedy',
  Intervals: 'Intervals',
  MathAndGeometry: 'Math & Geometry',
  BitManipulation: 'Bit Manipulation',
} as const
export type BeatCodeTopic = (typeof BeatCodeTopic)[keyof typeof BeatCodeTopic]

export const Difficulty = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
} as const
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty]

export const Outcome = {
  Solved: 'y',
  Failed: 'n',
  Easy: 'e',
} as const
export type Outcome = (typeof Outcome)[keyof typeof Outcome]

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  topic: BeatCodeTopic
  leetcodeUrl: string
  orderIndex: number
}

export interface ProblemProgress {
  cardId: string
  ease: number
  intervalDays: number
  reps: number
  nextDue: string | null
  lastReviewed: string | null
  lastOutcome: Outcome | null
}

export interface UserProgress {
  problemProgress: Record<string, ProblemProgress>
  studyStreak: number
  lastStudiedDate: string
  totalReviews: number
}

export interface StudySession {
  id: string
  title: string
  topics: string[]
  difficulties: Difficulty[]
  cardCount: number
  scheduledFor: string
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  completed: boolean
  lastCompletedAt?: number
  completedDates?: string[]
}

export interface RecurrencePattern {
  frequency: 'Daily' | 'Weekly'
  interval: number
  daysOfWeek?: number[]
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  cardsPerSession: number
  newCardsPerDay: number
}

export const TOPIC_LABELS: Record<BeatCodeTopic, string> = {
  [BeatCodeTopic.ArraysAndHashing]: 'Arrays & Hashing',
  [BeatCodeTopic.TwoPointers]: 'Two Pointers',
  [BeatCodeTopic.SlidingWindow]: 'Sliding Window',
  [BeatCodeTopic.Stack]: 'Stack',
  [BeatCodeTopic.BinarySearch]: 'Binary Search',
  [BeatCodeTopic.LinkedList]: 'Linked List',
  [BeatCodeTopic.Trees]: 'Trees',
  [BeatCodeTopic.Tries]: 'Tries',
  [BeatCodeTopic.HeapPriorityQueue]: 'Heap / Priority Queue',
  [BeatCodeTopic.Backtracking]: 'Backtracking',
  [BeatCodeTopic.Graphs]: 'Graphs',
  [BeatCodeTopic.AdvancedGraphs]: 'Advanced Graphs',
  [BeatCodeTopic.OneDDP]: '1-D Dynamic Programming',
  [BeatCodeTopic.TwoDDP]: '2-D Dynamic Programming',
  [BeatCodeTopic.Greedy]: 'Greedy',
  [BeatCodeTopic.Intervals]: 'Intervals',
  [BeatCodeTopic.MathAndGeometry]: 'Math & Geometry',
  [BeatCodeTopic.BitManipulation]: 'Bit Manipulation',
}

export const TOPIC_COLORS: Record<BeatCodeTopic, string> = {
  [BeatCodeTopic.ArraysAndHashing]: '#6366f1',
  [BeatCodeTopic.TwoPointers]: '#8b5cf6',
  [BeatCodeTopic.SlidingWindow]: '#a855f7',
  [BeatCodeTopic.Stack]: '#d946ef',
  [BeatCodeTopic.BinarySearch]: '#ec4899',
  [BeatCodeTopic.LinkedList]: '#f43f5e',
  [BeatCodeTopic.Trees]: '#22c55e',
  [BeatCodeTopic.Tries]: '#10b981',
  [BeatCodeTopic.HeapPriorityQueue]: '#ef4444',
  [BeatCodeTopic.Backtracking]: '#f97316',
  [BeatCodeTopic.Graphs]: '#14b8a6',
  [BeatCodeTopic.AdvancedGraphs]: '#06b6d4',
  [BeatCodeTopic.OneDDP]: '#3b82f6',
  [BeatCodeTopic.TwoDDP]: '#2563eb',
  [BeatCodeTopic.Greedy]: '#84cc16',
  [BeatCodeTopic.Intervals]: '#f59e0b',
  [BeatCodeTopic.MathAndGeometry]: '#64748b',
  [BeatCodeTopic.BitManipulation]: '#78716c',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  [Difficulty.Easy]: '#22c55e',
  [Difficulty.Medium]: '#f59e0b',
  [Difficulty.Hard]: '#ef4444',
}

// Helper function to map difficulty to Badge variants
export const getDifficultyVariant = (difficulty: Difficulty): 'success' | 'warning' | 'danger' => {
  switch (difficulty) {
    case Difficulty.Easy:
      return 'success'
    case Difficulty.Medium:
      return 'warning'
    case Difficulty.Hard:
      return 'danger'
  }
}
