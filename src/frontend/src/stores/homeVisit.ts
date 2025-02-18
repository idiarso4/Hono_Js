import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface HomeVisit {
  id: string
  studentId: string
  counselorId: string
  date: string
  purpose: string
  parentName: string
  address: string
  findings: string
  recommendations?: string
  followUpActions?: string
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  photos?: string
  documents?: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    class: string
    parentPhone?: string
  }
}

export const useHomeVisitStore = defineStore('homeVisit', () => {
  const visits = ref<HomeVisit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch home visits with filters
  const fetchVisits = async (filters?: {
    startDate?: string
    endDate?: string
    status?: string
    studentId?: string
  }) => {
    try {
      loading.value = true
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.studentId) params.append('studentId', filters.studentId)

      const response = await axios.get(`/api/home-visits?${params.toString()}`)
      visits.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch home visits'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new home visit
  const createVisit = async (data: Omit<HomeVisit, 'id' | 'counselorId' | 'createdAt' | 'updatedAt' | 'student'>) => {
    try {
      loading.value = true
      const response = await axios.post('/api/home-visits', data)
      visits.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create home visit'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update home visit
  const updateVisit = async (id: string, data: Partial<HomeVisit>) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/home-visits/${id}`, data)
      const index = visits.value.findIndex(v => v.id === id)
      if (index !== -1) {
        visits.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update home visit'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete home visit
  const deleteVisit = async (id: string) => {
    try {
      loading.value = true
      await axios.delete(`/api/home-visits/${id}`)
      visits.value = visits.value.filter(v => v.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete home visit'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Upload photos
  const uploadPhotos = async (id: string, files: File[]) => {
    try {
      loading.value = true
      const formData = new FormData()
      files.forEach(file => {
        formData.append('photos', file)
      })
      
      const response = await axios.post(`/api/home-visits/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const index = visits.value.findIndex(v => v.id === id)
      if (index !== -1) {
        visits.value[index].photos = response.data.photos
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to upload photos'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Upload documents
  const uploadDocuments = async (id: string, files: File[]) => {
    try {
      loading.value = true
      const formData = new FormData()
      files.forEach(file => {
        formData.append('documents', file)
      })
      
      const response = await axios.post(`/api/home-visits/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const index = visits.value.findIndex(v => v.id === id)
      if (index !== -1) {
        visits.value[index].documents = response.data.documents
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to upload documents'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get home visit statistics
  const getVisitStats = async (month: number, year: number) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/home-visits/stats?month=${month}&year=${year}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch home visit statistics'
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
    visits,
    loading,
    error,
    fetchVisits,
    createVisit,
    updateVisit,
    deleteVisit,
    uploadPhotos,
    uploadDocuments,
    getVisitStats,
    searchStudents
  }
})
