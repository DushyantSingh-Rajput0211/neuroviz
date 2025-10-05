import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  Plus, 
  Search, 
  Upload, 
  Brain, 
  Clock, 
  Activity,
  Filter,
  Download,
  Eye,
  Trash2
} from 'lucide-react'
import { sessionsApi } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { Session, CreateSessionForm } from '../types'

export const SessionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery(
    ['sessions', searchQuery],
    () => searchQuery 
      ? sessionsApi.searchSessions(searchQuery)
      : sessionsApi.getSessions(0, 50),
    {
      keepPreviousData: true,
    }
  )

  const createSessionMutation = useMutation(sessionsApi.createSession, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions'])
      setShowUploadModal(false)
      toast.success('Session created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create session')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateSessionForm>()

  const selectedFile = watch('file')

  const onSubmit = async (data: CreateSessionForm) => {
    if (!data.file) {
      toast.error('Please select a file to upload')
      return
    }
    await createSessionMutation.mutateAsync(data)
    reset()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            EEG Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and analyze your neural signal recordings.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Session
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn btn-outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Sessions List */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : Array.isArray(sessions) ? (
          sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Brain className="h-10 w-10 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {session.name}
                      </h3>
                      {session.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </div>
                        {session.durationSeconds && (
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-1" />
                            {session.durationSeconds.toFixed(1)}s
                          </div>
                        )}
                        {session.channelCount && (
                          <div className="flex items-center">
                            <Brain className="h-4 w-4 mr-1" />
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
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No sessions found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by uploading your first EEG recording.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn btn-primary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload EEG Data
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No sessions found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by uploading your first EEG recording.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload EEG Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowUploadModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Upload EEG Session
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Session Name
                  </label>
                  <input
                    {...register('name', { required: 'Session name is required' })}
                    type="text"
                    className="mt-1 input"
                    placeholder="My EEG Recording"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 input"
                    placeholder="Optional description..."
                  />
                </div>
                
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    EEG Data File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                        >
                          <span>Upload a file</span>
                          <input
                            {...register('file', { required: 'File is required' })}
                            type="file"
                            accept=".csv,.edf,.bdf"
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        CSV, EDF, BDF up to 100MB
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.file.message}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSessionMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {createSessionMutation.isLoading ? 'Uploading...' : 'Upload Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
