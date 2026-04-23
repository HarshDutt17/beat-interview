import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TrendingUp, Calendar, Target, CheckCircle } from 'lucide-react'
import Card from '../../../shared/components/common/Card'
import ProgressBar from '../../../shared/components/common/ProgressBar'

interface AppStats {
  total: number
  studied: number
  dueToday: number
  progressPercentage: number
}

interface AppCardProps {
  app: string
  title: string
  subtitle: string
  description: string
  icon: string
  stats: Record<string, number>
  appStats: AppStats | null
  basePath: string
}

function AppCard({ app, title, subtitle, description, icon, stats, appStats, basePath }: AppCardProps) {
  return (
    <Card className="p-8 hover:scale-[1.02] transition-transform cursor-pointer">
      <Link to={basePath} className="no-underline">
        <div className="text-6xl mb-4 text-center">{icon}</div>
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--color-text)' }}>
          {title}
        </h2>
        <p className="text-lg mb-3 text-center" style={{ color: 'var(--color-primary)' }}>
          {subtitle}
        </p>
        <p className="text-sm mb-6 text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>

        {/* Progress Bar */}
        {appStats && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Progress
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {appStats.progressPercentage}%
              </span>
            </div>
            <ProgressBar progress={appStats.progressPercentage} />
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm mb-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {value}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        {appStats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                Studied
              </span>
              <span style={{ color: 'var(--color-text)' }}>
                {appStats.studied} / {appStats.total}
              </span>
            </div>
            {appStats.dueToday > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
                  <Calendar className="h-3 w-3 mr-1 text-red-600" />
                  Due Today
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium dark:bg-red-900/20 dark:text-red-400">
                  {appStats.dueToday}
                </span>
              </div>
            )}
            {appStats.dueToday === 0 && appStats.studied > 0 && (
              <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                All caught up!
              </div>
            )}
          </div>
        )}
      </Link>
    </Card>
  )
}

export default function HomePage() {
  const [beatCodeStats, setBeatCodeStats] = useState<AppStats | null>(null)
  const [beatDesignStats, setBeatDesignStats] = useState<AppStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load BeatCode stats
        try {
          const beatCodeStorage = {
            get: (key: string) => {
              const item = localStorage.getItem(`beatcode_${key}`)
              return item ? JSON.parse(item) : null
            }
          }
          const beatCodeProgress = beatCodeStorage.get('user_progress') || { problemProgress: {} }
          const beatCodeProblemsCount = 250 // Known count
          const beatCodeStudied = Object.keys(beatCodeProgress.problemProgress || {}).length
          const beatCodeDue = Object.values(beatCodeProgress.problemProgress || {}).filter((p: any) =>
            p.nextDue && p.nextDue <= new Date().toISOString().split('T')[0]
          ).length

          setBeatCodeStats({
            total: beatCodeProblemsCount,
            studied: beatCodeStudied,
            dueToday: beatCodeDue,
            progressPercentage: Math.round((beatCodeStudied / beatCodeProblemsCount) * 100)
          })
        } catch (error) {
          console.error('Failed to load BeatCode stats:', error)
        }

        // Load BeatDesign stats
        try {
          const beatDesignStorage = {
            get: (key: string) => {
              const item = localStorage.getItem(`beatdesign_${key}`)
              return item ? JSON.parse(item) : null
            }
          }
          const beatDesignProgress = beatDesignStorage.get('user_progress') || { studyItemProgress: {} }
          const beatDesignTotal = 106 // Known count (22+34+50)
          const beatDesignStudied = Object.keys(beatDesignProgress.studyItemProgress || {}).length
          const beatDesignDue = Object.values(beatDesignProgress.studyItemProgress || {}).filter((p: any) =>
            p.nextDue && p.nextDue <= new Date().toISOString().split('T')[0]
          ).length

          setBeatDesignStats({
            total: beatDesignTotal,
            studied: beatDesignStudied,
            dueToday: beatDesignDue,
            progressPercentage: Math.round((beatDesignStudied / beatDesignTotal) * 100)
          })
        } catch (error) {
          console.error('Failed to load BeatDesign stats:', error)
        }
      } catch (error) {
        console.error('Failed to load app stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const totalDueItems = (beatCodeStats?.dueToday || 0) + (beatDesignStats?.dueToday || 0)

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Beat the Interviews
          </h1>
          <p className="text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Master coding interviews with spaced repetition
          </p>
          {!loading && totalDueItems > 0 && (
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg mt-4 dark:bg-red-900/20 dark:text-red-400">
              <Calendar className="h-4 w-4 mr-2" />
              {totalDueItems} items due today across your apps
            </div>
          )}
          {!loading && totalDueItems === 0 && (beatCodeStats?.studied || 0) + (beatDesignStats?.studied || 0) > 0 && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg mt-4 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4 mr-2" />
              All caught up! Great work maintaining your study schedule.
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <AppCard
            app="beatcode"
            title="BeatCode"
            subtitle="LeetCode Problems"
            description="250 curated problems with spaced repetition"
            icon="🎯"
            stats={{ problems: 250, topics: 18 }}
            appStats={beatCodeStats}
            basePath="/beatcode"
          />
          <AppCard
            app="beatdesign"
            title="BeatDesign"
            subtitle="System Design"
            description="Concepts, case studies, and interview questions"
            icon="🏗️"
            stats={{ concepts: 22, studies: 50, questions: 34 }}
            appStats={beatDesignStats}
            basePath="/beatdesign"
          />
        </div>

        {!loading && (
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--color-text)' }}>
                <TrendingUp className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
                Overall Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Total Items Studied
                  </span>
                  <span style={{ color: 'var(--color-text)' }}>
                    {(beatCodeStats?.studied || 0) + (beatDesignStats?.studied || 0)} / {(beatCodeStats?.total || 0) + (beatDesignStats?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Combined Progress
                  </span>
                  <span style={{ color: 'var(--color-text)' }}>
                    {Math.round(((beatCodeStats?.studied || 0) + (beatDesignStats?.studied || 0)) / ((beatCodeStats?.total || 1) + (beatDesignStats?.total || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--color-text)' }}>
                <Target className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
                Today's Focus
              </h3>
              <div className="space-y-2">
                {totalDueItems > 0 ? (
                  <>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      You have {totalDueItems} items due for review today
                    </p>
                    <div className="flex flex-col space-y-2">
                      {(beatCodeStats?.dueToday || 0) > 0 && (
                        <Link
                          to="/beatcode"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          🎯 BeatCode ({beatCodeStats?.dueToday} due)
                        </Link>
                      )}
                      {(beatDesignStats?.dueToday || 0) > 0 && (
                        <Link
                          to="/beatdesign"
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          🏗️ BeatDesign ({beatDesignStats?.dueToday} due)
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Perfect! You're all caught up with your reviews. Keep exploring new content or take a well-deserved break.
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Built with spaced repetition algorithm (SM-2) for optimal retention
          </p>
        </div>

        <footer className="text-center mt-8">
          <a
            href="https://github.com/HarshDutt17/beat-interview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}