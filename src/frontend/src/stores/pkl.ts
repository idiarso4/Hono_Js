import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface PklJournal {
  id: string
  studentId: string
  date: string
  activity: string
  description: string
  documentation?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  feedback?: string
  createdAt: string
  updatedAt: string
}

export const usePklStore = defineStore('pkl', () => {
  const journals = ref<PklJournal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch student's PKL journals
  async function fetchJournals() {
    try {
      loading.value = true
      const response = await axios.get('/api/pkl/journals')
      journals.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch journals'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new journal entry
  async function createJournal(data: Omit<PklJournal, 'id' | 'studentId' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const response = await axios.post('/api/pkl/journals', data)
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
  async function updateJournal(id: string, data: Partial<PklJournal>) {
    try {
      loading.value = true
      const response = await axios.put(`/api/pkl/journals/${id}`, data)
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

  // Upload journal documentation
  async function uploadDocumentation(id: string, file: File) {
    try {
      loading.value = true
      const formData = new FormData()
      formData.append('documentation', file)
      
      const response = await axios.post(`/api/pkl/journals/${id}/documentation`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const index = journals.value.findIndex(j => j.id === id)
      if (index !== -1) {
        journals.value[index].documentation = response.data.documentation
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to upload documentation'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete journal entry
  async function deleteJournal(id: string) {
    try {
      loading.value = true
      await axios.delete(`/api/pkl/journals/${id}`)
      journals.value = journals.value.filter(j => j.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete journal'
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
    uploadDocumentation,
    deleteJournal
  }
})
