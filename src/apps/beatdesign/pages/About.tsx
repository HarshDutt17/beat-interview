export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        About BeatDesign
      </h1>

      <div className="space-y-6 text-gray-600 dark:text-gray-400">
        <p className="text-lg">
          BeatDesign is your comprehensive system design learning companion, featuring:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              📚 22 Core Concepts
            </h2>
            <p>
              Master fundamental system design topics from scalability to consensus algorithms
              with curated resources tagged for optimal learning paths.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🏗️ 50+ Case Studies
            </h2>
            <p>
              Learn from real-world architectures of industry leaders like Uber, Netflix,
              and Twitter with engineering insights and best practices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              💭 34 Interview Questions
            </h2>
            <p>
              Practice with the most frequently asked system design interview questions,
              complete with constraints, solutions, and expert resources.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🧠 Spaced Repetition
            </h2>
            <p>
              Leverage the proven SM-2 algorithm to optimize retention and review
              system design concepts at the perfect intervals.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            🎯 Resource Depth Tagging
          </h2>
          <p>
            All resources are intelligently tagged as "Just Enough" for quick understanding
            or "Deep Dive" for comprehensive mastery, allowing you to customize your learning
            depth based on your goals and time constraints.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}