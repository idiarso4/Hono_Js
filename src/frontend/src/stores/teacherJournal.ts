import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface TeacherJournal {
  id: string
  teacherId: string
  subjectId: string
  date: string
  topic: string
  description: string
  materials?: string
  notes?: string
  createdAt: string
  updatedAt: string
  subject: {
    id: string
    name: string
    description?: string
  }
}

export const useTeacherJournalStore = defineStore('teacherJournal', () => {
  const journals = ref<TeacherJournal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch teacher's journals
  const fetchJournals = async (filters?: { 
    startDate?: string
    endDate?: string
    subjectId?: string 
  }) => {
    try {
      loading.value = true
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.subjectId) params.append('subjectId', filters.subjectId)

      const response = await axios.get(`/api/teacher/journals?${params.toString()}`)
      journals.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch journals'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new journal entry
  const createJournal = async (data: Omit<TeacherJournal, 'id' | 'teacherId' | 'createdAt' | 'updatedAt' | 'subject'>) => {
    try {
      loading.value = true
      const response = await axios.post('/api/teacher/journals', data)
      journals.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create journal'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update journal entry
  const updateJournal = async (id: string, data: Partial<TeacherJournal>) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/teacher/journals/${id}`, data)
      const index = journals.value.findIndex(j => j.id === id)
      if (index !== -1) {
        journals.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update journal'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete journal entry
  const deleteJournal = async (id: string) => {
    try {
      loading.value = true
      await axios.delete(`/api/teacher/journals/${id}`)
      journals.value = journals.value.filter(j => j.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete journal'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Upload materials
  const uploadMaterials = async (id: string, files: File[]) => {
    try {
      loading.value = true
      const formData = new FormData()
      files.forEach(file => {
        formData.append('materials', file)
      })
      
      const response = await axios.post(`/api/teacher/journals/${id}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const index = journals.value.findIndex(j => j.id === id)
      if (index !== -1) {
        journals.value[index].materials = response.data.materials
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to upload materials'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get journal statistics
  const getJournalStats = async (month: number, year: number) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/teacher/journals/stats?month=${month}&year=${year}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch journal statistics'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    journals,
    loading,
    error,
    fetchJournals,
    createJournal,
    updateJournal,
    deleteJournal,
    uploadMaterials,
    getJournalStats
  }
})
