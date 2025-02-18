import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface DamageReport {
  id: string
  itemName: string
  itemCode?: string
  location: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'REPORTED' | 'UNDER_REVIEW' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  reportedBy: {
    id: string
    name: string
    role: string
  }
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  estimatedCost?: number
  actualCost?: number
  photos?: string[]
  repairNotes?: string
  createdAt: string
  updatedAt: string
}

interface CreateDamageReportDTO {
  itemName: string
  itemCode?: string
  location: string
  description: string
  priority: DamageReport['priority']
  photos?: File[]
}

interface UpdateDamageReportDTO {
  status?: DamageReport['status']
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
  repairNotes?: string
  priority?: DamageReport['priority']
}

export const useDamageReportStore = defineStore('damageReport', () => {
  const reports = ref<DamageReport[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch damage reports with filters
  const fetchReports = async (filters?: {
    status?: string
    priority?: string
    startDate?: string
    endDate?: string
    location?: string
  }) => {
    try {
      loading.value = true
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.location) params.append('location', filters.location)

      const response = await axios.get(`/api/damage-reports?${params.toString()}`)
      reports.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch damage reports'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new damage report
  const createReport = async (data: CreateDamageReportDTO) => {
    try {
      loading.value = true
      const formData = new FormData()
      
      // Append basic data
      formData.append('itemName', data.itemName)
      if (data.itemCode) formData.append('itemCode', data.itemCode)
      formData.append('location', data.location)
      formData.append('description', data.description)
      formData.append('priority', data.priority)

      // Append photos if any
      if (data.photos) {
        data.photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo)
        })
      }

      const response = await axios.post('/api/damage-reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      reports.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create damage report'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update damage report
  const updateReport = async (id: string, data: UpdateDamageReportDTO) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/damage-reports/${id}`, data)
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update damage report'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete damage report
  const deleteReport = async (id: string) => {
    try {
      loading.value = true
      await axios.delete(`/api/damage-reports/${id}`)
      reports.value = reports.value.filter(r => r.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete damage report'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Upload additional photos
  const uploadPhotos = async (id: string, photos: File[]) => {
    try {
      loading.value = true
      const formData = new FormData()
      photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo)
      })

      const response = await axios.post(`/api/damage-reports/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to upload photos'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get damage report statistics
  const getReportStats = async (filters?: {
    startDate?: string
    endDate?: string
    location?: string
  }) => {
    try {
      loading.value = true
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.location) params.append('location', filters.location)

      const response = await axios.get(`/api/damage-reports/stats?${params.toString()}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch damage report statistics'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    uploadPhotos,
    getReportStats
  }
})
