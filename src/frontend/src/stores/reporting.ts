import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface ReportConfig {
  id: string
  name: string
  description: string
  type: 'attendance' | 'academic' | 'financial' | 'inventory' | 'activity'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
  filters: Record<string, any>
  columns: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ReportData {
  id: string
  configId: string
  generatedAt: string
  fileUrl: string
  status: 'completed' | 'failed'
  error?: string
}

export const useReportingStore = defineStore('reporting', () => {
  const reportConfigs = ref<ReportConfig[]>([])
  const reportHistory = ref<ReportData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch report configurations
  const fetchReportConfigs = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/reports/configs')
      reportConfigs.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch report configurations'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new report configuration
  const createReportConfig = async (config: Omit<ReportConfig, 'id'>) => {
    try {
      loading.value = true
      const response = await axios.post('/api/reports/configs', config)
      reportConfigs.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create report configuration'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update report configuration
  const updateReportConfig = async (id: string, config: Partial<ReportConfig>) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/reports/configs/${id}`, config)
      const index = reportConfigs.value.findIndex(c => c.id === id)
      if (index !== -1) {
        reportConfigs.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update report configuration'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete report configuration
  const deleteReportConfig = async (id: string) => {
    try {
      loading.value = true
      await axios.delete(`/api/reports/configs/${id}`)
      reportConfigs.value = reportConfigs.value.filter(c => c.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete report configuration'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Generate report
  const generateReport = async (configId: string, params?: Record<string, any>) => {
    try {
      loading.value = true
      const response = await axios.post(`/api/reports/generate/${configId}`, params)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to generate report'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Fetch report history
  const fetchReportHistory = async (params?: {
    configId?: string
    startDate?: string
    endDate?: string
    status?: string
  }) => {
    try {
      loading.value = true
      const response = await axios.get('/api/reports/history', { params })
      reportHistory.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch report history'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Download report
  const downloadReport = async (reportId: string) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/reports/download/${reportId}`, {
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.pdf`) // or use the actual filename from response
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to download report'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Schedule report
  const scheduleReport = async (configId: string, schedule: ReportConfig['schedule']) => {
    try {
      loading.value = true
      const response = await axios.post(`/api/reports/schedule/${configId}`, schedule)
      const index = reportConfigs.value.findIndex(c => c.id === configId)
      if (index !== -1) {
        reportConfigs.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to schedule report'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    reportConfigs,
    reportHistory,
    loading,
    error,
    fetchReportConfigs,
    createReportConfig,
    updateReportConfig,
    deleteReportConfig,
    generateReport,
    fetchReportHistory,
    downloadReport,
    scheduleReport
  }
})
