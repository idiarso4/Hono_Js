import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface Prayer {
  id: string
  userId: string
  date: string
  prayerTime: 'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA'
  status: 'PRESENT' | 'ABSENT'
  location?: string
}

export const usePrayerStore = defineStore('prayer', () => {
  const prayers = ref<Prayer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get prayer schedule
  const getPrayerSchedule = async (date: string) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/prayers/schedule?date=${date}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch prayer schedule'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Record prayer attendance
  const recordPrayer = async (data: Omit<Prayer, 'id' | 'userId'>) => {
    try {
      loading.value = true
      const response = await axios.post('/api/prayers', data)
      prayers.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to record prayer'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get user's prayer history
  const getPrayerHistory = async (startDate: string, endDate: string) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/prayers/history?startDate=${startDate}&endDate=${endDate}`)
      prayers.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch prayer history'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get prayer statistics
  const getPrayerStats = async (month: number, year: number) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/prayers/stats?month=${month}&year=${year}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch prayer statistics'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update prayer record (for admin/teacher)
  const updatePrayerRecord = async (id: string, data: Partial<Prayer>) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/prayers/${id}`, data)
      const index = prayers.value.findIndex(p => p.id === id)
      if (index !== -1) {
        prayers.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update prayer record'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get congregation prayer attendance
  const getCongregationAttendance = async (date: string, prayerTime: Prayer['prayerTime']) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/prayers/congregation?date=${date}&prayerTime=${prayerTime}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch congregation attendance'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    prayers,
    loading,
    error,
    getPrayerSchedule,
    recordPrayer,
    getPrayerHistory,
    getPrayerStats,
    updatePrayerRecord,
    getCongregationAttendance
  }
})
