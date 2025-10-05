import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'

import { authApi } from '../services/api'
import type { User, LoginRequest, SignupRequest, LoginResponse } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const queryClient = useQueryClient()

  // Get current user
  const { data: user, isLoading } = useQuery(
    ['user', token],
    () => authApi.getCurrentUser(),
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        setToken(null)
        localStorage.removeItem('token')
      },
    }
  )

  // Login mutation
  const loginMutation = useMutation(authApi.login, {
    onSuccess: (data: LoginResponse) => {
      setToken(data.token)
      localStorage.setItem('token', data.token)
      queryClient.setQueryData(['user', data.token], data.user)
      toast.success('Login successful!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    },
  })

  // Signup mutation
  const signupMutation = useMutation(authApi.signup, {
    onSuccess: () => {
      toast.success('Account created successfully! Please log in.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Signup failed')
    },
  })

  const login = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials)
  }

  const signup = async (userData: SignupRequest) => {
    await signupMutation.mutateAsync(userData)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    queryClient.clear()
    toast.success('Logged out successfully')
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || loginMutation.isLoading || signupMutation.isLoading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
