// Node.js script to generate optimized JSON
const fs = require('fs')
const path = require('path')

// Import the raw data
const rawData = require('./systemDesign.json')

// Helper functions (copied from transform.ts)
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 60

  const match = timeStr.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?.*hours?/)
  if (match) {
    const min = parseFloat(match[1])
    const max = match[2] ? parseFloat(match[2]) : min
    return Math.round((min + max) / 2 * 60)
  }

  const minutesMatch = timeStr.match(/(\d+)\s*minutes?/)
  if (minutesMatch) {
    return parseInt(minutesMatch[1])
  }

  return 60
}

function extractMetrics(constraintText) {
  const metrics = {}

  const patterns = {
    dau: /(\d+[KMB]?)\s+DAU/i,
    users: /(\d+[KMB]?)\s+(active\s+)?users/i,
    qps: /(\d+[KMB]?)\s+QPS/i,
    requests: /(\d+[KMB]?)\s+requests/i,
    ratio: /(\d+:\d+)/,
    storage: /(\d+[KMGT]?B)/i,
    latency: /(\d+\s*ms)/i,
    throughput: /(\d+[KMB]?\s+ops\/sec)/i
  }

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = constraintText.match(pattern)
    if (match) metrics[key] = match[1]
  })

  return metrics
}

function tagResourceDepth(resource, index) {
  if (index === 0) return 'just-enough'
  if (resource.type === 'video') return 'just-enough'
  if (resource.type === 'course' || resource.type === 'paper') return 'deep-dive'

  const title = resource.title.toLowerCase()
  if (title.includes('deep') || title.includes('comprehensive') ||
      title.includes('advanced') || title.includes('complete') ||
      title.includes('mastering') || title.includes('in-depth')) {
    return 'deep-dive'
  }

  if (resource.type === 'official doc') return 'deep-dive'
  if (index === 1 && (resource.type === 'article' || resource.type === 'blog')) {
    return 'just-enough'
  }

  return 'deep-dive'
}

function estimateResourceTime(resource) {
  const estimates = {
    'article': 12,
    'video': 18,
    'blog': 10,
    'course': 75,
    'paper': 50,
    'official doc': 25,
    'discussion': 8,
    'presentation': 30
  }

  return estimates[resource.type] || 15
}

function generateId(name, type) {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${type}-${slug}`
}

// Transform the data
console.log('Transforming systemDesign.json...')

// Extract concepts
const concepts = rawData.sections[0].topics.map((topic, index) => ({
  id: generateId(topic.name, 'concept'),
  title: topic.name,
  description: topic.description,
  estimatedMinutes: parseTimeToMinutes(topic.study_time),
  difficulty: index < 7 ? 'Beginner' : index < 14 ? 'Intermediate' : 'Advanced',
  prerequisites: [],
  orderIndex: index,
  resources: topic.resources.map((resource, resIndex) => ({
    ...resource,
    depth: tagResourceDepth(resource, resIndex),
    estimatedMinutes: estimateResourceTime(resource)
  })),
  studyPlanWeeks: [],
  relatedQuestions: [],
  relatedCases: []
}))

// Extract case studies
const caseStudies = rawData.sections[1].topics.map((caseStudy, index) => ({
  id: generateId(caseStudy.name, 'case'),
  title: caseStudy.name,
  overview: caseStudy.overview,
  estimatedMinutes: 45,
  difficulty: index < 4 ? 'Medium' : 'Hard',
  keyConcepts: caseStudy.key_concepts,
  orderIndex: index,
  resources: caseStudy.resources.map((resource, resIndex) => ({
    ...resource,
    depth: tagResourceDepth(resource, resIndex),
    estimatedMinutes: estimateResourceTime(resource)
  })),
  relatedConcepts: []
}))

// Extract interview questions
const interviews = rawData.sections[2].questions.map((question, index) => ({
  id: generateId(question.prompt.split(' ').slice(0, 3).join(' '), 'interview'),
  title: question.prompt,
  prompt: question.prompt,
  difficulty: question.difficulty,
  constraints: {
    text: question.constraints,
    metrics: extractMetrics(question.constraints)
  },
  estimatedMinutes: question.difficulty === 'Easy' ? 30 :
                    question.difficulty === 'Medium' ? 45 : 60,
  orderIndex: index,
  resources: question.resources.map((resource, resIndex) => ({
    ...resource,
    depth: tagResourceDepth(resource, resIndex),
    estimatedMinutes: estimateResourceTime(resource)
  })),
  studyPlanWeeks: [],
  requiredConcepts: []
}))

// Process study plan
rawData.sections[3].study_plan.forEach(week => {
  week.topics.forEach(topicName => {
    const concept = concepts.find(c => c.title === topicName)
    if (concept) {
      concept.studyPlanWeeks.push(week.week)
    }
  })

  week.questions.forEach(questionName => {
    const interview = interviews.find(i =>
      i.title.toLowerCase().includes(questionName.toLowerCase()) ||
      questionName.toLowerCase().includes(i.title.toLowerCase().split(' ')[2] || ''))
    if (interview) {
      interview.studyPlanWeeks.push(week.week)
    }
  })
})

// Create cross-references
const conceptsByName = new Map()
concepts.forEach(concept => {
  conceptsByName.set(concept.title, concept.id)
})

interviews.forEach(interview => {
  const searchText = (interview.prompt + ' ' + interview.constraints.text).toLowerCase()
  concepts.forEach(concept => {
    const conceptName = concept.title.toLowerCase()
    if (searchText.includes(conceptName.split(' ')[0]) || searchText.includes(conceptName)) {
      interview.requiredConcepts.push(concept.id)
    }
  })
})

caseStudies.forEach(caseStudy => {
  caseStudy.keyConcepts.forEach(keyConceptName => {
    const conceptId = conceptsByName.get(keyConceptName)
    if (conceptId) {
      caseStudy.relatedConcepts.push(conceptId)
    }
  })
})

concepts.forEach(concept => {
  interviews.forEach(interview => {
    if (interview.requiredConcepts.includes(concept.id)) {
      concept.relatedQuestions.push(interview.id)
    }
  })

  caseStudies.forEach(caseStudy => {
    if (caseStudy.relatedConcepts.includes(concept.id)) {
      concept.relatedCases.push(caseStudy.id)
    }
  })
})

// Build final structure
const optimizedData = {
  metadata: {
    lastUpdated: rawData.metadata.last_updated,
    estimatedStudyHours: rawData.metadata.estimated_study_hours,
    totalContent: {
      concepts: concepts.length,
      caseStudies: caseStudies.length,
      interviews: interviews.length
    }
  },
  content: {
    concepts,
    caseStudies,
    interviews
  },
  curriculum: {
    weeks: rawData.sections[3].study_plan.map(week => ({
      week: week.week,
      theme: `Week ${week.week}: ${week.topics[0]} Focus`,
      concepts: week.topics.map(topicName => {
        const concept = concepts.find(c => c.title === topicName)
        return concept ? concept.id : null
      }).filter(Boolean),
      interviews: week.questions.map(questionName => {
        const interview = interviews.find(i =>
          i.title.toLowerCase().includes(questionName.toLowerCase()) ||
          questionName.toLowerCase().includes(i.title.toLowerCase().split(' ')[2] || ''))
        return interview ? interview.id : null
      }).filter(Boolean),
      estimatedHours: 10
    }))
  },
  taxonomy: {
    categories: rawData.sections[4].index_by_topic,
    difficulties: {
      Beginner: concepts.filter(c => c.difficulty === 'Beginner').map(c => c.id),
      Intermediate: concepts.filter(c => c.difficulty === 'Intermediate').map(c => c.id),
      Advanced: concepts.filter(c => c.difficulty === 'Advanced').map(c => c.id),
      Easy: interviews.filter(i => i.difficulty === 'Easy').map(i => i.id),
      Medium: [...interviews.filter(i => i.difficulty === 'Medium').map(i => i.id),
               ...caseStudies.filter(c => c.difficulty === 'Medium').map(c => c.id)],
      Hard: [...interviews.filter(i => i.difficulty === 'Hard').map(i => i.id),
              ...caseStudies.filter(c => c.difficulty === 'Hard').map(c => c.id)]
    }
  }
}

// Write the optimized JSON
fs.writeFileSync(
  path.join(__dirname, 'systemDesign.optimized.json'),
  JSON.stringify(optimizedData, null, 2)
)

console.log('✅ Created systemDesign.optimized.json')
console.log(`📊 Stats: ${concepts.length} concepts, ${caseStudies.length} case studies, ${interviews.length} interviews`)
console.log(`🏷️  Depth tags: Just Enough resources and Deep Dive resources added to all content`)
console.log(`🔗 Cross-references created between concepts, interviews, and case studies`)