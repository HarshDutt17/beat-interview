import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Home } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/beatdesign', exact: true },
  { name: 'Concepts', href: '/beatdesign/concepts' },
  { name: 'Questions', href: '/beatdesign/questions' },
  { name: 'Studies', href: '/beatdesign/studies' },
  { name: 'Study', href: '/beatdesign/study' },
  { name: 'Schedule', href: '/beatdesign/schedule' },
  { name: 'Settings', href: '/beatdesign/settings' },
  { name: 'About', href: '/beatdesign/about' },
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Back to Home"
            >
              <Home className="h-6 w-6" />
            </Link>

            <Link to="/beatdesign" className="flex-shrink-0 flex items-center px-4">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                🏗️ BeatDesign
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8 ml-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}