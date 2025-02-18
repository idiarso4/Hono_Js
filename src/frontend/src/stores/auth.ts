import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  nip?: string
  nis?: string
  class?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Initialize from localStorage
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  if (storedToken) token.value = storedToken
  if (storedUser) user.value = JSON.parse(storedUser)

  // Setup axios defaults
  axios.defaults.baseURL = 'http://localhost:3000/api'
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      
      // Save to localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  const registerTeacher = async (data: { email: string; password: string; name: string; nip: string }) => {
    try {
      const response = await axios.post('/auth/register/teacher', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const registerStudent = async (data: { email: string; password: string; name: string; nis: string; class: string }) => {
    try {
      const response = await axios.post('/auth/register/student', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const isAuthenticated = () => !!token.value

  const isTeacher = () => user.value?.role === 'TEACHER'
  const isStudent = () => user.value?.role === 'STUDENT'
  const isAdmin = () => user.value?.role === 'ADMIN'

  return {
    user,
    token,
    login,
    registerTeacher,
    registerStudent,
    logout,
    isAuthenticated,
    isTeacher,
    isStudent,
    isAdmin
  }
})
