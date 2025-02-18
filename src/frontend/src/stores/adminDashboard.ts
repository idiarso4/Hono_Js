import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface DashboardStats {
  users: {
    total: number
    students: number
    teachers: number
    staff: number
    newThisMonth: number
  }
  attendance: {
    presentToday: number
    absentToday: number
    lateToday: number
    averageAttendance: number
  }
  inventory: {
    totalItems: number
    damagedItems: number
    pendingRepairs: number
    repairCosts: number
  }
  activities: {
    totalActivities: number
    upcomingEvents: number
    ongoingPKL: number
    activeClubs: number
  }
  prayer: {
    attendanceToday: number
    averageAttendance: number
  }
  counseling: {
    activeCase: number
    resolvedThisMonth: number
    pendingHomeVisits: number
  }
}

interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
  ipAddress: string
  userAgent: string
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  lastBackup: string
  databaseSize: number
  storageUsed: number
  totalStorage: number
  activeUsers: number
  serverLoad: number
}

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const activityLogs = ref<ActivityLog[]>([])
  const systemHealth = ref<SystemHealth | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/admin/dashboard/stats')
      stats.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch dashboard statistics'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Fetch activity logs with pagination and filters
  const fetchActivityLogs = async (params: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    userId?: string
    action?: string
  }) => {
    try {
      loading.value = true
      const response = await axios.get('/api/admin/activity-logs', { params })
      activityLogs.value = response.data.logs
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch activity logs'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Fetch system health metrics
  const fetchSystemHealth = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/admin/system-health')
      systemHealth.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch system health'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Trigger system backup
  const triggerBackup = async () => {
    try {
      loading.value = true
      const response = await axios.post('/api/admin/backup')
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to trigger backup'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get performance metrics
  const getPerformanceMetrics = async (timeRange: 'day' | 'week' | 'month') => {
    try {
      loading.value = true
      const response = await axios.get(`/api/admin/performance-metrics/${timeRange}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch performance metrics'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    activityLogs,
    systemHealth,
    loading,
    error,
    fetchStats,
    fetchActivityLogs,
    fetchSystemHealth,
    triggerBackup,
    getPerformanceMetrics
  }
})
