<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Database Backup & Restore</h1>
      <p class="text-gray-600">Manage your database backups and restore points</p>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Backup Section -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Create Backup</h2>
        <p class="text-gray-600 mb-4">
          Create a new backup of your current database state. This will include all tables and data.
        </p>
        <button 
          @click="createBackup"
          :disabled="isCreatingBackup"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
        >
          <span class="material-icons text-xl" v-if="isCreatingBackup">sync</span>
          <span>{{ isCreatingBackup ? 'Creating Backup...' : 'Create New Backup' }}</span>
        </button>
      </div>

      <!-- Restore Section -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Restore Database</h2>
        <p class="text-gray-600 mb-4">
          Upload a previous backup file to restore the database to that state.
        </p>
        <div class="flex items-center justify-center w-full">
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <span class="material-icons text-4xl text-gray-500 mb-2">cloud_upload</span>
              <p class="mb-2 text-sm text-gray-500">
                <span class="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p class="text-xs text-gray-500">SQL or JSON backup file</p>
            </div>
            <input 
              type="file" 
              class="hidden" 
              accept=".sql,.json"
              @change="handleFileUpload"
            >
          </label>
        </div>
      </div>
    </div>

    <!-- Backup History -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">Backup History</h2>
        <p class="text-gray-600">List of all database backups</p>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="backup in backups" :key="backup.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ backup.filename }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ new Date(backup.createdAt).toLocaleString() }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatFileSize(backup.size) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'px-2 py-1 text-xs font-medium rounded-full': true,
                  'bg-green-100 text-green-800': backup.status === 'COMPLETED',
                  'bg-yellow-100 text-yellow-800': backup.status === 'PENDING',
                  'bg-red-100 text-red-800': backup.status === 'FAILED'
                }">
                  {{ backup.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-4">
                  <button 
                    @click="downloadBackup(backup)"
                    class="text-blue-600 hover:text-blue-900"
                    :disabled="backup.status !== 'COMPLETED'"
                  >
                    Download
                  </button>
                  <button 
                    @click="deleteBackup(backup)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="backups.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No backups found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Confirm Action</h2>
        <p class="text-gray-600 mb-6">{{ confirmMessage }}</p>
        <div class="flex justify-end gap-4">
          <button 
            @click="showConfirmModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :class="{
              'px-4 py-2 rounded-md text-white': true,
              'bg-red-600 hover:bg-red-700': confirmAction === 'delete',
              'bg-blue-600 hover:bg-blue-700': confirmAction === 'restore'
            }"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

interface Backup {
  id: string
  filename: string
  createdAt: string
  size: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
}

const backups = ref<Backup[]>([])
const isCreatingBackup = ref(false)
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmAction = ref<'delete' | 'restore'>('delete')
const selectedBackup = ref<Backup | null>(null)
const selectedFile = ref<File | null>(null)

// Fetch backups
const fetchBackups = async () => {
  try {
    const response = await axios.get('/api/admin/backups', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    backups.value = response.data
  } catch (error) {
    console.error('Error fetching backups:', error)
  }
}

// Create new backup
const createBackup = async () => {
  try {
    isCreatingBackup.value = true
    await axios.post('/api/admin/backups', null, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    await fetchBackups()
  } catch (error) {
    console.error('Error creating backup:', error)
  } finally {
    isCreatingBackup.value = false
  }
}

// Handle file upload
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    confirmMessage.value = `Are you sure you want to restore the database using "${selectedFile.value.name}"? This action cannot be undone.`
    confirmAction.value = 'restore'
    showConfirmModal.value = true
  }
}

// Download backup
const downloadBackup = async (backup: Backup) => {
  try {
    const response = await axios.get(`/api/admin/backups/${backup.id}/download`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', backup.filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Error downloading backup:', error)
  }
}

// Delete backup
const deleteBackup = (backup: Backup) => {
  selectedBackup.value = backup
  confirmMessage.value = `Are you sure you want to delete "${backup.filename}"?`
  confirmAction.value = 'delete'
  showConfirmModal.value = true
}

// Handle confirmation
const handleConfirm = async () => {
  try {
    if (confirmAction.value === 'delete' && selectedBackup.value) {
      await axios.delete(`/api/admin/backups/${selectedBackup.value.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      await fetchBackups()
    } else if (confirmAction.value === 'restore' && selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      await axios.post('/api/admin/backups/restore', formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      // Optionally show success message or redirect
    }
  } catch (error) {
    console.error('Error handling confirmation:', error)
  } finally {
    showConfirmModal.value = false
    selectedBackup.value = null
    selectedFile.value = null
  }
}

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Fetch backups on component mount
onMounted(() => {
  fetchBackups()
})
</script>
