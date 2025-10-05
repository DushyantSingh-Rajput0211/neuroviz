import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import App from '../App'

// Mock the API calls
jest.mock('../services/api', () => ({
  authApi: {
    getCurrentUser: jest.fn().mockResolvedValue({
      id: 1,
      email: 'demo@neuroviz.ai',
      firstName: 'Demo',
      lastName: 'User',
      fullName: 'Demo User',
      createdAt: '2024-01-01T00:00:00Z'
    })
  }
}))

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
  })

  it('shows login page when not authenticated', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Should redirect to login page
    expect(screen.getByText('Sign in to NeuroViz')).toBeInTheDocument()
  })
})
