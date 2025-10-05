// User types
export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginResponse {
  token: string
  type: string
  user: User
}

// Session types
export interface Session {
  id: number
  name: string
  description?: string
  sourceType: 'UPLOAD' | 'STREAM'
  filePath?: string
  sampleRate?: number
  durationSeconds?: number
  channelCount?: number
  notes?: string
  createdAt: string
  updatedAt: string
  channelData?: ChannelData[]
  processingJobs?: ProcessingJob[]
}

export interface ChannelData {
  id: number
  channelName: string
  sampleRate: number
  dataLocation: string
  dataSizeBytes?: number
  createdAt: string
}

export interface ProcessingJob {
  id: number
  jobType: 'PREPROCESS' | 'ANALYTICS' | 'CLASSIFY'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  paramsJson?: string
  resultsJson?: string
  errorMessage?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
    }
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
}

// Processing types
export interface PreprocessRequest {
  bandpass?: [number, number]
  notch?: number
  artifact?: boolean
}

export interface PreprocessResponse {
  success: boolean
  processedFilePath: string
  summaryStats: any
  message: string
}

export interface PSDAnalysis {
  frequencies: number[]
  psdValues: number[]
  channel: string
  sampleRate: number
}

export interface BandPowerAnalysis {
  delta: number
  theta: number
  alpha: number
  beta: number
  gamma: number
  channel: string
}

export interface ClassificationResult {
  predictedClass: string
  probabilities: Record<string, number>
  confidence: number
  classes: string[]
}

// EEG Data types
export interface EEGDataPoint {
  timestamp: number
  sampleRate: number
  channels: string[]
  data: Record<string, number[]>
}

export interface EEGStreamData {
  type: 'eeg_data' | 'stream_started' | 'stream_stopped'
  timestamp: number
  sampleRate?: number
  channels?: string[]
  data?: Record<string, number[]>
  message?: string
}

// Chart types
export interface ChartData {
  time: number
  value: number
  channel: string
}

export interface BandPowerChartData {
  band: string
  value: number
  channel: string
}

// Form types
export interface CreateSessionForm {
  name: string
  description?: string
  notes?: string
  file?: File
}

// Error types
export interface ApiError {
  error: string
  message?: string
  status_code?: number
  detail?: string
}
