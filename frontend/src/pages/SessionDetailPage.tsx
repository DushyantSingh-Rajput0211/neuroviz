import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  Brain, 
  Clock, 
  Activity, 
  Play, 
  Pause, 
  Download,
  Settings,
  BarChart3,
  Zap,
  FileText
} from 'lucide-react'
import { sessionsApi, processingApi } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'
import type { Session } from '../types'

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'analytics' | 'ai'>('overview')

  const { data: session, isLoading } = useQuery(
    ['session', id],
    () => sessionsApi.getSession(Number(id)),
    {
      enabled: !!id,
    }
  )

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'signals', name: 'Signals', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'ai', name: 'AI Analysis', icon: Zap },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <Brain className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Session not found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The session you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {session.name}
          </h1>
          {session.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {session.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button className="btn btn-outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Duration
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.durationSeconds ? `${session.durationSeconds.toFixed(1)}s` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Channels
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.channelCount || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sample Rate
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.sampleRate ? `${session.sampleRate} Hz` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <OverviewTab session={session} />}
          {activeTab === 'signals' && <SignalsTab session={session} />}
          {activeTab === 'analytics' && <AnalyticsTab session={session} />}
          {activeTab === 'ai' && <AITab session={session} />}
        </div>
      </div>
    </div>
  )
}

// Tab Components
const OverviewTab: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Session Details
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Source Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {session.sourceType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              File Path
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
              {session.filePath || 'N/A'}
            </dd>
          </div>
          {session.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Notes
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {session.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {session.processingJobs && session.processingJobs.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Processing Jobs
          </h3>
          <div className="space-y-3">
            {session.processingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.jobType}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  job.status === 'COMPLETED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : job.status === 'FAILED'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : job.status === 'RUNNING'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const SignalsTab: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        EEG Signals
      </h3>
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Signal Visualization
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Interactive EEG signal viewer will be implemented here.
        </p>
        <div className="mt-6">
          <button className="btn btn-primary">
            <Play className="h-4 w-4 mr-2" />
            Start Visualization
          </button>
        </div>
      </div>
    </div>
  )
}

const AnalyticsTab: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Power Spectral Density
        </h3>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            PSD Analysis
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Power spectral density analysis will be displayed here.
          </p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Band Power Analysis
        </h3>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Band Power
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Delta, Theta, Alpha, Beta, and Gamma band powers will be shown here.
          </p>
        </div>
      </div>
    </div>
  )
}

const AITab: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        AI Classification
      </h3>
      <div className="text-center py-12">
        <Zap className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          AI Analysis
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          AI-powered classification results will be displayed here.
        </p>
        <div className="mt-6">
          <button className="btn btn-primary">
            <Zap className="h-4 w-4 mr-2" />
            Run AI Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
