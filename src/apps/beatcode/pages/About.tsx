import Card from '../../../shared/components/common/Card'

const SRS_TABLE = [
  { outcome: 'Solved', first: '4-day gap', subsequent: 'interval x ease', ease: '+0.05', color: '#22c55e' },
  { outcome: 'Too Easy', first: '7-day gap', subsequent: 'interval x ease x 1.3', ease: '+0.15', color: '#6366f1' },
  { outcome: "Couldn't Solve", first: '3-day gap', subsequent: '3-day gap (reset)', ease: '-0.20', color: '#ef4444' },
]

export default function About() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>About</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        How Beatcode works and the methodology behind it
      </p>

      {/* What is this */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>What is Beatcode?</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Beatcode is a spaced-repetition study tool built around the{' '}
          <a href="https://neetcode.io/practice?tab=neetcode250" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)' }}>NeetCode 250</a> &mdash;
          a curated list of 250 LeetCode problems (60 Easy, 155 Medium, 35 Hard) organized
          across 18 topics that cover the core patterns needed for coding interviews. Beatcode turns that list
          into a spaced-repetition system so you practice the right problems at the right time.
        </p>
      </Card>

      {/* How studying works */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>How Studying Works</h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            When you start a study session, Beatcode picks problems for you in a specific priority order:
          </p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-danger)' }}>1</span>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>Due problems first</p>
                <p>Problems you've already seen whose review date has arrived. Sorted by most overdue first,
                then by difficulty (ones you struggled with come first).</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-warning)' }}>2</span>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>New problems next</p>
                <p>Problems you've never seen before. Introduced in order: Easy first, then Medium, then Hard &mdash;
                following the list order within each difficulty tier. This builds fundamentals before tackling harder patterns.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>3</span>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>Capped to your session limit</p>
                <p>The combined list is capped to your configured cards-per-session (default 10, adjustable in Settings).
                If you're studying from a scheduled session, it uses that session's card count instead.</p>
              </div>
            </div>
          </div>
          <p>
            If you filter by specific topics or difficulty, the same priority order applies within that filtered subset.
            Beatcode never picks randomly &mdash; it always prioritizes overdue reviews, then introduces new problems
            in a structured order.
          </p>
        </div>
      </Card>

      {/* SRS Algorithm */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Spaced Repetition (SM-2)</h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            After you attempt a problem on LeetCode, you rate how it went. Beatcode uses a modified SM-2 algorithm
            (the same one behind Anki) to decide when you'll see it again:
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text)' }}>Outcome</th>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text)' }}>First time</th>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text)' }}>After that</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text)' }}>Ease change</th>
                </tr>
              </thead>
              <tbody>
                {SRS_TABLE.map(row => (
                  <tr key={row.outcome} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td className="py-2 pr-3 font-medium" style={{ color: row.color }}>{row.outcome}</td>
                    <td className="py-2 pr-3">{row.first}</td>
                    <td className="py-2 pr-3">{row.subsequent}</td>
                    <td className="py-2">{row.ease}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <p><strong style={{ color: 'var(--color-text)' }}>Ease factor</strong> starts at 2.5 and ranges from 1.3 to 2.8.
            It controls how fast intervals grow. Solving consistently pushes ease up (longer intervals),
            while failing drops it (shorter intervals, more frequent review).</p>
            <p><strong style={{ color: 'var(--color-text)' }}>Skip</strong> pushes a problem to tomorrow with no change to its state &mdash;
            useful when you don't have time for a particular problem right now.</p>
          </div>
        </div>
      </Card>

      {/* Problem States */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Problem States</h2>
        <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center gap-3">
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#94a3b820', color: '#94a3b8' }}>New</span>
            <span>Never attempted. 250 problems start here.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>Learning</span>
            <span>Attempted but fewer than 2 consecutive correct answers. Still building confidence.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>Mature</span>
            <span>2+ consecutive correct answers. Intervals grow exponentially from here.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>Due</span>
            <span>Review date has arrived. These get top priority in your next session.</span>
          </div>
        </div>
      </Card>

      {/* Sessions */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Scheduled Sessions</h2>
        <div className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            You can create study sessions with specific topics, difficulties, and card counts, then schedule them
            for particular dates. Sessions can be one-time or recurring (daily or specific days of the week).
          </p>
          <p>
            Clicking <strong style={{ color: 'var(--color-text)' }}>Start</strong> on a session in the Dashboard or Schedule page
            opens the study page pre-configured with that session's topics, difficulty, and card count.
            When you finish all the cards, the session is automatically marked done for the day.
          </p>
          <p>
            Recurring sessions track completion per day &mdash; finishing a daily session today won't skip tomorrow's.
          </p>
        </div>
      </Card>

      {/* The 18 Topics */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>18 Topics</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Curated from the NeetCode 250 problem list
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Arrays & Hashing (22)', 'Two Pointers (13)', 'Sliding Window (9)',
            'Stack (14)', 'Binary Search (14)', 'Linked List (14)',
            'Trees (23)', 'Tries (4)', 'Heap / Priority Queue (12)',
            'Backtracking (17)', 'Graphs (21)', 'Advanced Graphs (10)',
            '1-D Dynamic Programming (17)', '2-D Dynamic Programming (16)', 'Greedy (14)',
            'Intervals (7)', 'Math & Geometry (13)', 'Bit Manipulation (10)',
          ].map(item => (
            <p key={item} className="text-sm py-1" style={{ color: 'var(--color-text-secondary)' }}>{item}</p>
          ))}
        </div>
      </Card>

      {/* Data */}
      <Card>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Your Data</h2>
        <div className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            All progress, sessions, and settings are stored locally in your browser's localStorage.
            Nothing is sent to any server. Clearing your browser data will erase your progress.
          </p>
          <p>
            You can reset everything from <strong style={{ color: 'var(--color-text)' }}>Settings &gt; Clear All Data</strong>.
          </p>
        </div>
      </Card>
    </div>
  )
}
