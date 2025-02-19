<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Profile Settings</h1>
      <p class="text-gray-600">Manage your account settings and preferences</p>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Profile Information -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>
        
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Profile Picture -->
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0">
              <div class="relative">
                <img 
                  :src="profileData.avatarUrl || '/default-avatar.png'" 
                  :alt="profileData.name"
                  class="w-32 h-32 rounded-lg object-cover"
                >
                <label 
                  class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50"
                >
                  <span class="material-icons text-gray-600">photo_camera</span>
                  <input 
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload"
                  >
                </label>
              </div>
            </div>
            
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-800">Profile Picture</h3>
              <p class="text-sm text-gray-600 mb-4">
                Upload a new profile picture. JPG, PNG or GIF, max 5MB.
              </p>
              <div v-if="uploadProgress > 0" class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  :style="{ width: `${uploadProgress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text"
                v-model="profileData.name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email"
                v-model="profileData.email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel"
                v-model="profileData.phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input 
                type="text"
                :value="formatRole(profileData.role)"
                disabled
                class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
              >
            </div>
          </div>

          <!-- Additional Information -->
          <div v-if="hasAdditionalFields" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="profileData.role === 'STUDENT'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input 
                type="text"
                v-model="profileData.studentId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div v-if="profileData.role === 'STUDENT'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input 
                type="text"
                v-model="profileData.class"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div v-if="profileData.role === 'TEACHER'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text"
                v-model="profileData.subject"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div v-if="profileData.role === 'COUNSELOR'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input 
                type="text"
                v-model="profileData.specialization"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea 
              v-model="profileData.bio"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Password Change -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
        
        <form @submit.prevent="updatePassword" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                type="password"
                v-model="passwordData.currentPassword"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div class="hidden md:block">
              <!-- Spacer for grid alignment -->
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input 
                type="password"
                v-model="passwordData.newPassword"
                required
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input 
                type="password"
                v-model="passwordData.confirmPassword"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              :disabled="isUpdatingPassword"
            >
              {{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Notification Settings -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-800">Email Notifications</h3>
              <p class="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                v-model="notificationSettings.email"
                class="sr-only peer"
                @change="updateNotificationSettings"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-800">Browser Notifications</h3>
              <p class="text-sm text-gray-600">Show desktop notifications</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                v-model="notificationSettings.browser"
                class="sr-only peer"
                @change="updateNotificationSettings"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

interface ProfileData {
  name: string
  email: string
  phone: string
  role: string
  avatarUrl?: string
  bio?: string
  studentId?: string
  class?: string
  subject?: string
  specialization?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationSettings {
  email: boolean
  browser: boolean
}

// State
const profileData = ref<ProfileData>({
  name: '',
  email: '',
  phone: '',
  role: '',
  bio: ''
})

const passwordData = ref<PasswordData>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = ref<NotificationSettings>({
  email: true,
  browser: true
})

const isUpdating = ref(false)
const isUpdatingPassword = ref(false)
const uploadProgress = ref(0)

// Computed
const hasAdditionalFields = computed(() => {
  return ['STUDENT', 'TEACHER', 'COUNSELOR'].includes(profileData.value.role)
})

// Methods
const formatRole = (role: string) => {
  return role.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await axios.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${auth.token}`
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    profileData.value.avatarUrl = response.data.avatarUrl
    uploadProgress.value = 0
  } catch (error) {
    console.error('Error uploading avatar:', error)
    uploadProgress.value = 0
  }
}

const updateProfile = async () => {
  isUpdating.value = true
  try {
    const response = await axios.put('/api/profile', profileData.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    profileData.value = response.data
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    isUpdating.value = false
  }
}

const updatePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    alert('New passwords do not match')
    return
  }

  isUpdatingPassword.value = true
  try {
    await axios.put('/api/profile/password', {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    }, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // Reset form
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Error updating password:', error)
  } finally {
    isUpdatingPassword.value = false
  }
}

const updateNotificationSettings = async () => {
  try {
    await axios.put('/api/profile/notifications', notificationSettings.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
  }
}

// Fetch initial data
const fetchProfile = async () => {
  try {
    const [profileResponse, settingsResponse] = await Promise.all([
      axios.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }),
      axios.get('/api/profile/notifications', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    ])

    profileData.value = profileResponse.data
    notificationSettings.value = settingsResponse.data
  } catch (error) {
    console.error('Error fetching profile data:', error)
  }
}

// Initialize
onMounted(() => {
  fetchProfile()
})
</script>
