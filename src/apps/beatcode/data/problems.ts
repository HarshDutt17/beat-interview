import rawProblems from './neetcode250.json'
import type { Problem } from '../models/types'

export const problems: Problem[] = (rawProblems as Array<{
  id: string
  title: string
  difficulty: string
  topics: string[]
  leetcode_url: string
}>).map((p, index) => ({
  id: p.id,
  title: p.title,
  difficulty: p.difficulty as Problem['difficulty'],
  topic: p.topics[0] as Problem['topic'],
  leetcodeUrl: p.leetcode_url,
  orderIndex: index,
}))
