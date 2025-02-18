import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface Extracurricular {
  id: string
  name: string
  description: string
  schedule: string
  location: string
}

interface ExtracurricularMember {
  id: string
  userId: string
  extracurricularId: string
  joinDate: string
  status: 'ACTIVE' | 'INACTIVE'
  achievements?: string
}

export const useExtracurricularStore = defineStore('extracurricular', () => {
  const extracurriculars = ref<Extracurricular[]>([])
  const memberships = ref<ExtracurricularMember[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all extracurriculars
  const getExtracurriculars = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/extracurriculars')
      extracurriculars.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch extracurriculars'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get extracurricular details
  const getExtracurricularDetails = async (id: string) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/extracurriculars/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch extracurricular details'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Create new extracurricular (admin only)
  const createExtracurricular = async (data: Omit<Extracurricular, 'id'>) => {
    try {
      loading.value = true
      const response = await axios.post('/api/extracurriculars', data)
      extracurriculars.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create extracurricular'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update extracurricular (admin only)
  const updateExtracurricular = async (id: string, data: Partial<Extracurricular>) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/extracurriculars/${id}`, data)
      const index = extracurriculars.value.findIndex(e => e.id === id)
      if (index !== -1) {
        extracurriculars.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update extracurricular'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Join extracurricular
  const joinExtracurricular = async (extracurricularId: string) => {
    try {
      loading.value = true
      const response = await axios.post(`/api/extracurriculars/${extracurricularId}/join`)
      memberships.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to join extracurricular'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Leave extracurricular
  const leaveExtracurricular = async (membershipId: string) => {
    try {
      loading.value = true
      await axios.post(`/api/extracurricular-members/${membershipId}/leave`)
      memberships.value = memberships.value.filter(m => m.id !== membershipId)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to leave extracurricular'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Add achievement
  const addAchievement = async (membershipId: string, achievement: string) => {
    try {
      loading.value = true
      const response = await axios.post(`/api/extracurricular-members/${membershipId}/achievements`, {
        achievement
      })
      const index = memberships.value.findIndex(m => m.id === membershipId)
      if (index !== -1) {
        memberships.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to add achievement'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get user's extracurricular memberships
  const getUserMemberships = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/extracurricular-members/me')
      memberships.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch memberships'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get extracurricular members
  const getExtracurricularMembers = async (extracurricularId: string) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/extracurriculars/${extracurricularId}/members`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch members'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    extracurriculars,
    memberships,
    loading,
    error,
    getExtracurriculars,
    getExtracurricularDetails,
    createExtracurricular,
    updateExtracurricular,
    joinExtracurricular,
    leaveExtracurricular,
    addAchievement,
    getUserMemberships,
    getExtracurricularMembers
  }
})
