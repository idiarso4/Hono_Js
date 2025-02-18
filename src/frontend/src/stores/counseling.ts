import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface CounselingSession {
  id: string
  studentId: string
  counselorId: string
  date: string
  type: 'ACADEMIC' | 'BEHAVIORAL' | 'CAREER' | 'PERSONAL' | 'OTHER'
  issue: string
  notes: string
  recommendations?: string
  followUpDate?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  attachments?: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    class: string
  }
}

export const useCounselingStore = defineStore('counseling', () => {
  const sessions = ref<CounselingSession[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch counseling sessions with filters
  const fetchSessions = async (filters?: {
    startDate?: string
    endDate?: string
    type?: string
    status?: string
    studentId?: string
  }) => {
    try {
      loading.value = true
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.studentId) params.append('studentId', filters.studentId)

      const response = await axios.get(`/api/counseling/sessions?${params.toString()}`)
      sessions.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch counseling sessions'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new counseling session
  const createSession = async (data: Omit<CounselingSession, 'id' | 'counselorId' | 'createdAt' | 'updatedAt' | 'student'>) => {
    try {
      loading.value = true
      const response = await axios.post('/api/counseling/sessions', data)
      sessions.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create counseling session'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update counseling session
  const updateSession = async (id: string, data: Partial<CounselingSession>) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/counseling/sessions/${id}`, data)
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update counseling session'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete counseling session
  const deleteSession = async (id: string) => {
    try {
      loading.value = true
      await axios.delete(`/api/counseling/sessions/${id}`)
      sessions.value = sessions.value.filter(s => s.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete counseling session'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Upload attachments
  const uploadAttachments = async (id: string, files: File[]) => {
    try {
      loading.value = true
      const formData = new FormData()
      files.forEach(file => {
        formData.append('attachments', file)
      })
      
      const response = await axios.post(`/api/counseling/sessions/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index].attachments = response.data.attachments
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to upload attachments'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get counseling statistics
  const getCounselingStats = async (month: number, year: number) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/counseling/stats?month=${month}&year=${year}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch counseling statistics'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Search students
  const searchStudents = async (query: string) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/students/search?q=${query}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to search students'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    uploadAttachments,
    getCounselingStats,
    searchStudents
  }
})
