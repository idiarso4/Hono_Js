<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Counseling Sessions</h1>
      <p class="text-gray-600">Manage and track student counseling sessions</p>
    </div>

    <!-- Action Bar -->
    <div class="mb-6 flex flex-wrap gap-4 justify-between items-center">
      <div class="flex gap-4">
        <div class="relative">
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Search sessions..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <span class="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
        </div>
        <select 
          v-model="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <button 
        @click="openNewSessionModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <span class="material-icons">add</span>
        New Session
      </button>
    </div>

    <!-- Sessions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="session in filteredSessions" 
           :key="session.id" 
           class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ session.student.name }}</h3>
              <p class="text-sm text-gray-600">Class: {{ session.student.class }}</p>
            </div>
            <span :class="{
              'px-2 py-1 text-xs font-medium rounded-full': true,
              'bg-blue-100 text-blue-800': session.status === 'SCHEDULED',
              'bg-yellow-100 text-yellow-800': session.status === 'IN_PROGRESS',
              'bg-green-100 text-green-800': session.status === 'COMPLETED',
              'bg-red-100 text-red-800': session.status === 'CANCELLED'
            }">
              {{ formatStatus(session.status) }}
            </span>
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-2">
              <span class="material-icons text-gray-400">event</span>
              <div>
                <p class="text-sm font-medium text-gray-800">
                  {{ new Date(session.scheduledAt).toLocaleDateString() }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ new Date(session.scheduledAt).toLocaleTimeString() }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="material-icons text-gray-400">category</span>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ session.type }}</p>
                <p class="text-xs text-gray-600">Session Type</p>
              </div>
            </div>

            <div v-if="session.notes" class="flex items-start gap-2">
              <span class="material-icons text-gray-400">description</span>
              <p class="text-sm text-gray-600 line-clamp-2">{{ session.notes }}</p>
            </div>
          </div>

          <div class="mt-6 flex gap-2">
            <button 
              @click="viewSession(session)"
              class="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-1"
            >
              <span class="material-icons text-sm">visibility</span>
              View
            </button>
            <button 
              v-if="session.status === 'SCHEDULED'"
              @click="startSession(session)"
              class="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 flex items-center justify-center gap-1"
            >
              <span class="material-icons text-sm">play_arrow</span>
              Start
            </button>
            <button 
              v-if="session.status === 'IN_PROGRESS'"
              @click="completeSession(session)"
              class="flex-1 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 flex items-center justify-center gap-1"
            >
              <span class="material-icons text-sm">check</span>
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Session Modal -->
    <div v-if="showNewSessionModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-bold text-gray-800">New Counseling Session</h2>
          <button 
            @click="showNewSessionModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="createSession" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select 
              v-model="newSession.studentId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a student</option>
              <option v-for="student in students" 
                      :key="student.id" 
                      :value="student.id"
              >
                {{ student.name }} ({{ student.class }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
            <select 
              v-model="newSession.type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="ACADEMIC">Academic</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="CAREER">Career</option>
              <option value="PERSONAL">Personal</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input 
              type="datetime-local"
              v-model="newSession.scheduledAt"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              v-model="newSession.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Initial session notes..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button 
              type="button"
              @click="showNewSessionModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Session Modal -->
    <div v-if="selectedSession" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Session Details</h2>
            <p class="text-gray-600">{{ selectedSession.student.name }}</p>
          </div>
          <button 
            @click="selectedSession = null"
            class="text-gray-500 hover:text-gray-700"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Session Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-1">Status</h3>
              <span :class="{
                'px-2 py-1 text-sm font-medium rounded-full': true,
                'bg-blue-100 text-blue-800': selectedSession.status === 'SCHEDULED',
                'bg-yellow-100 text-yellow-800': selectedSession.status === 'IN_PROGRESS',
                'bg-green-100 text-green-800': selectedSession.status === 'COMPLETED',
                'bg-red-100 text-red-800': selectedSession.status === 'CANCELLED'
              }">
                {{ formatStatus(selectedSession.status) }}
              </span>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-1">Type</h3>
              <p class="text-gray-800">{{ selectedSession.type }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-1">Scheduled At</h3>
              <p class="text-gray-800">
                {{ new Date(selectedSession.scheduledAt).toLocaleString() }}
              </p>
            </div>
            <div v-if="selectedSession.completedAt">
              <h3 class="text-sm font-medium text-gray-600 mb-1">Completed At</h3>
              <p class="text-gray-800">
                {{ new Date(selectedSession.completedAt).toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Session Notes -->
          <div>
            <h3 class="text-sm font-medium text-gray-600 mb-2">Session Notes</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div v-if="selectedSession.notes" class="prose prose-sm max-w-none">
                {{ selectedSession.notes }}
              </div>
              <p v-else class="text-gray-500 italic">No notes available</p>
            </div>
          </div>

          <!-- Action History -->
          <div>
            <h3 class="text-sm font-medium text-gray-600 mb-2">Session History</h3>
            <div class="space-y-3">
              <div v-for="(action, index) in selectedSession.history" 
                   :key="index"
                   class="flex items-start gap-3"
              >
                <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span class="material-icons text-gray-600 text-sm">
                    {{ getActionIcon(action.type) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-800">{{ action.description }}</p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(action.timestamp).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end gap-4">
          <button 
            v-if="selectedSession.status === 'SCHEDULED'"
            @click="startSession(selectedSession)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Start Session
          </button>
          <button 
            v-if="selectedSession.status === 'IN_PROGRESS'"
            @click="completeSession(selectedSession)"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Complete Session
          </button>
          <button 
            v-if="selectedSession.status === 'SCHEDULED'"
            @click="cancelSession(selectedSession)"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancel Session
          </button>
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

interface Student {
  id: string
  name: string
  class: string
}

interface SessionHistory {
  type: string
  description: string
  timestamp: string
}

interface CounselingSession {
  id: string
  studentId: string
  student: Student
  type: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string
  completedAt?: string
  notes?: string
  history: SessionHistory[]
}

// State
const sessions = ref<CounselingSession[]>([])
const students = ref<Student[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const showNewSessionModal = ref(false)
const selectedSession = ref<CounselingSession | null>(null)
const newSession = ref({
  studentId: '',
  type: '',
  scheduledAt: '',
  notes: ''
})

// Computed
const filteredSessions = computed(() => {
  return sessions.value.filter(session => {
    const matchesSearch = 
      session.student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      session.type.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !filterStatus.value || session.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

// Methods
const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

const getActionIcon = (type: string) => {
  const icons: Record<string, string> = {
    CREATE: 'add_circle',
    START: 'play_circle',
    COMPLETE: 'check_circle',
    CANCEL: 'cancel',
    UPDATE: 'edit',
    NOTE: 'note'
  }
  return icons[type] || 'info'
}

const openNewSessionModal = () => {
  showNewSessionModal.value = true
}

const viewSession = (session: CounselingSession) => {
  selectedSession.value = session
}

const createSession = async () => {
  try {
    const response = await axios.post('/api/counselor/sessions', newSession.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    
    sessions.value.push(response.data)
    showNewSessionModal.value = false
    
    // Reset form
    newSession.value = {
      studentId: '',
      type: '',
      scheduledAt: '',
      notes: ''
    }
  } catch (error) {
    console.error('Error creating session:', error)
  }
}

const startSession = async (session: CounselingSession) => {
  try {
    const response = await axios.post(`/api/counselor/sessions/${session.id}/start`, {}, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    
    const index = sessions.value.findIndex(s => s.id === session.id)
    if (index !== -1) {
      sessions.value[index] = response.data
    }
    
    if (selectedSession.value?.id === session.id) {
      selectedSession.value = response.data
    }
  } catch (error) {
    console.error('Error starting session:', error)
  }
}

const completeSession = async (session: CounselingSession) => {
  try {
    const response = await axios.post(`/api/counselor/sessions/${session.id}/complete`, {}, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    
    const index = sessions.value.findIndex(s => s.id === session.id)
    if (index !== -1) {
      sessions.value[index] = response.data
    }
    
    if (selectedSession.value?.id === session.id) {
      selectedSession.value = response.data
    }
  } catch (error) {
    console.error('Error completing session:', error)
  }
}

const cancelSession = async (session: CounselingSession) => {
  try {
    const response = await axios.post(`/api/counselor/sessions/${session.id}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    
    const index = sessions.value.findIndex(s => s.id === session.id)
    if (index !== -1) {
      sessions.value[index] = response.data
    }
    
    if (selectedSession.value?.id === session.id) {
      selectedSession.value = response.data
    }
  } catch (error) {
    console.error('Error cancelling session:', error)
  }
}

// Fetch data
const fetchSessions = async () => {
  try {
    const response = await axios.get('/api/counselor/sessions', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    sessions.value = response.data
  } catch (error) {
    console.error('Error fetching sessions:', error)
  }
}

const fetchStudents = async () => {
  try {
    const response = await axios.get('/api/counselor/students', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    students.value = response.data
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

// Initialize
onMounted(() => {
  fetchSessions()
  fetchStudents()
})
</script>
