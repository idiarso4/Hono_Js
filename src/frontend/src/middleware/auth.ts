import { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import jwt_decode from 'jwt-decode'

interface DecodedToken {
  sub: string
  role: string
  exp: number
  iat: number
}

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // Maximum requests per minute
const requestCounts = new Map<string, { count: number; timestamp: number }>()

// Rate limiting middleware
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now()
  const userRequests = requestCounts.get(userId)

  if (!userRequests || (now - userRequests.timestamp) > RATE_LIMIT_WINDOW) {
    requestCounts.set(userId, { count: 1, timestamp: now })
    return true
  }

  if (userRequests.count >= MAX_REQUESTS) {
    return false
  }

  userRequests.count++
  return true
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [userId, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      requestCounts.delete(userId)
    }
  }
}, 5 * 60 * 1000)

export const authGuard: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    try {
      // Verify and decode token
      const decoded = jwt_decode<DecodedToken>(token)
      
      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired')
      }

      // Apply rate limiting
      if (!checkRateLimit(decoded.sub)) {
        next({ name: 'error', params: { message: 'Too many requests. Please try again later.' } })
        return
      }

      // Check role-based access
      if (to.meta.role && decoded.role !== to.meta.role) {
        next({ name: 'unauthorized' })
        return
      }

      // Verify token with backend
      const isValid = await authStore.verifyToken(token)
      if (!isValid) {
        throw new Error('Invalid token')
      }

      next()
    } catch (error) {
      console.error('Authentication error:', error)
      localStorage.removeItem('token')
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  } else {
    next()
  }
}

// XSS Prevention middleware
export const xssGuard = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// CSRF Protection
export const csrfGuard = () => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token
  }
}

// Secure Headers middleware
export const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// Password validation
export const validatePassword = (password: string): boolean => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
}

// Session management
export const sessionManager = {
  maxInactiveDuration: 30 * 60 * 1000, // 30 minutes
  lastActivity: Date.now(),

  updateActivity() {
    this.lastActivity = Date.now()
  },

  checkSession(): boolean {
    const now = Date.now()
    return (now - this.lastActivity) < this.maxInactiveDuration
  },

  startSessionMonitoring() {
    document.addEventListener('mousemove', () => this.updateActivity())
    document.addEventListener('keypress', () => this.updateActivity())
    
    setInterval(() => {
      if (!this.checkSession()) {
        // Session timeout
        localStorage.removeItem('token')
        window.location.href = '/login?timeout=true'
      }
    }, 60000) // Check every minute
  }
}
