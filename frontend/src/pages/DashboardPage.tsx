import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Activity, 
  Database, 
  Upload, 
  TrendingUp,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react'
import { sessionsApi } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  
  const { data: sessions, isLoading } = useQuery(
    ['sessions', 'recent'],
    () => sessionsApi.getSessions(0, 5),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  const stats = [
    {
      name: 'Total Sessions',
      value: sessions?.totalElements || 0,
      icon: Database,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Processing Jobs',
      value: sessions?.content?.reduce((acc, session) => acc + (session.processingJobs?.length || 0), 0) || 0,
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Active Streams',
      value: 0, // This would be dynamic in a real app
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Data Processed',
      value: `${(sessions?.content?.reduce((acc, session) => acc + (session.durationSeconds || 0), 0) / 3600).toFixed(1)}h`,
      icon: BarChart3,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  const quickActions = [
    {
      name: 'Upload EEG Data',
      description: 'Upload and process new EEG recordings',
      icon: Upload,
      href: '/sessions',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Live Stream',
      description: 'Monitor real-time neural signals',
      icon: Activity,
      href: '/stream',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'View Sessions',
      description: 'Browse and analyze your data',
      icon: Database,
      href: '/sessions',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName || user?.email}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here's what's happening with your neural signal analysis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${action.bgColor}`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Sessions
          </h2>
          <Link
            to="/sessions"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View all
          </Link>
        </div>
        
        <div className="card">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : sessions?.content?.length ? (
            <div className="space-y-4">
              {sessions.content.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Brain className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </div>
                        {session.durationSeconds && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {session.durationSeconds.toFixed(1)}s
                          </div>
                        )}
                        {session.channelCount && (
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-1" />
                            {session.channelCount} channels
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.sourceType === 'UPLOAD' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {session.sourceType.toLowerCase()}
                    </span>
                    <Link
                      to={`/sessions/${session.id}`}
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No sessions yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by uploading your first EEG recording.
              </p>
              <div className="mt-6">
                <Link
                  to="/sessions"
                  className="btn btn-primary"
                >
                  Upload EEG Data
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
