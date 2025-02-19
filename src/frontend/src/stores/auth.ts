import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'COUNSELOR'
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: User['role']
}

interface DecodedToken {
  id: string
  email: string
  role: User['role']
  exp: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Computed properties for role checks
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isTeacher = computed(() => user.value?.role === 'TEACHER')
  const isStudent = computed(() => user.value?.role === 'STUDENT')
  const isCounselor = computed(() => user.value?.role === 'COUNSELOR')

  // Helper function to set auth data
  const setAuthData = (userData: User, tokenValue: string) => {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
  }

  // Helper function to clear auth data
  const clearAuthData = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // Check if token is expired
  const isTokenExpired = (decodedToken: DecodedToken): boolean => {
    if (!decodedToken.exp) return true
    const currentTime = Date.now() / 1000
    return decodedToken.exp < currentTime
  }

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      const { token: newToken, user: userData } = response.data
      setAuthData(userData, newToken)
      return userData
    } catch (error) {
      clearAuthData()
      throw error
    }
  }

  // Register
  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/api/auth/register', data)
      const { token: newToken, user: userData } = response.data
      setAuthData(userData, newToken)
      return userData
    } catch (error) {
      clearAuthData()
      throw error
    }
  }

  // Logout
  const logout = () => {
    clearAuthData()
  }

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('token')
    
    if (!storedToken) {
      clearAuthData()
      return false
    }

    try {
      const decoded = jwtDecode<DecodedToken>(storedToken)
      
      if (isTokenExpired(decoded)) {
        clearAuthData()
        return false
      }

      // Verify token with backend
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
      
      const { user: userData } = response.data
      setAuthData(userData, storedToken)
      return true
    } catch (error) {
      clearAuthData()
      return false
    }
  }

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put('/api/protected/profile', data)
      const { user: userData } = response.data
      user.value = userData
      return userData
    } catch (error) {
      throw error
    }
  }

  // Change password
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await axios.put('/api/protected/change-password', {
        oldPassword,
        newPassword
      })
    } catch (error) {
      throw error
    }
  }

  // Role check helper
  const hasRole = (role: User['role']): boolean => {
    return user.value?.role === role
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    isCounselor,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    hasRole
  }
})
