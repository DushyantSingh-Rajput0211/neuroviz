import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import type {
  User,
  LoginRequest,
  SignupRequest,
  LoginResponse,
  Session,
  ApiResponse,
  PaginatedResponse,
  PreprocessRequest,
  PreprocessResponse,
  PSDAnalysis,
  BandPowerAnalysis,
  ClassificationResult,
  CreateSessionForm,
} from '../types'

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
  })

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor to handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

const api = createApiInstance()

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  signup: async (userData: SignupRequest): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/signup', userData)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },
}

// Sessions API
export const sessionsApi = {
  getSessions: async (page = 0, size = 10): Promise<PaginatedResponse<Session>> => {
    const response = await api.get<PaginatedResponse<Session>>(
      `/sessions?page=${page}&size=${size}`
    )
    return response.data
  },

  getSession: async (id: number): Promise<Session> => {
    const response = await api.get<ApiResponse<Session>>(`/sessions/${id}`)
    return response.data.data
  },

  createSession: async (sessionData: CreateSessionForm): Promise<Session> => {
    const formData = new FormData()
    formData.append('name', sessionData.name)
    if (sessionData.description) formData.append('description', sessionData.description)
    if (sessionData.notes) formData.append('notes', sessionData.notes)
    if (sessionData.file) formData.append('file', sessionData.file)

    const response = await api.post<ApiResponse<Session>>('/sessions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  searchSessions: async (query: string): Promise<Session[]> => {
    const response = await api.get<ApiResponse<Session[]>>(
      `/sessions/search?name=${encodeURIComponent(query)}`
    )
    return response.data.data
  },
}

// Processing API
export const processingApi = {
  preprocessSession: async (sessionId: number, params: PreprocessRequest): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(
      `/sessions/${sessionId}/preprocess`,
      params
    )
    return response.data.data
  },

  getPSDAnalysis: async (sessionId: number, channel: string): Promise<PSDAnalysis> => {
    const response = await api.get<ApiResponse<PSDAnalysis>>(
      `/sessions/${sessionId}/analytics/psd?channel=${channel}`
    )
    return response.data.data
  },

  getBandPowerAnalysis: async (sessionId: number, channel: string): Promise<BandPowerAnalysis> => {
    const response = await api.get<ApiResponse<BandPowerAnalysis>>(
      `/sessions/${sessionId}/analytics/bandpower?channel=${channel}`
    )
    return response.data.data
  },

  classifySession: async (sessionId: number): Promise<ClassificationResult> => {
    const response = await api.post<ApiResponse<ClassificationResult>>(
      `/sessions/${sessionId}/classify`
    )
    return response.data.data
  },

  getJobStatus: async (jobId: number): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/jobs/${jobId}`)
    return response.data.data
  },
}

// Direct processing service API (for direct calls to Python service)
export const directProcessingApi = {
  preprocess: async (filePath: string, params: any): Promise<PreprocessResponse> => {
    const response = await api.post<PreprocessResponse>('/py/preprocess/', {
      file_path: filePath,
      params: JSON.stringify(params),
    })
    return response.data
  },

  getPSD: async (filePath: string, channel: string): Promise<PSDAnalysis> => {
    const response = await api.get<PSDAnalysis>(
      `/py/analytics/psd?file=${encodeURIComponent(filePath)}&channel=${channel}`
    )
    return response.data
  },

  getBandPower: async (filePath: string, channel: string): Promise<BandPowerAnalysis> => {
    const response = await api.get<BandPowerAnalysis>(
      `/py/analytics/bandpower?file=${encodeURIComponent(filePath)}&channel=${channel}`
    )
    return response.data
  },

  classify: async (filePath: string): Promise<ClassificationResult> => {
    const response = await api.post<ClassificationResult>('/py/classify/', {
      file_path: filePath,
    })
    return response.data
  },
}

export default api
