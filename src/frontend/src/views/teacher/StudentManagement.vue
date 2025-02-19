<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Student Management</h1>
      <p class="text-gray-600">Manage and monitor students in your class</p>
    </div>

    <!-- Action Bar -->
    <div class="mb-6 flex flex-wrap gap-4 justify-between items-center">
      <div class="flex gap-4">
        <div class="relative">
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Search students..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <span class="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
        </div>
        <select 
          v-model="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="AT_RISK">At Risk</option>
          <option value="NEED_ATTENTION">Needs Attention</option>
        </select>
      </div>
      <button 
        @click="exportData"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <span class="material-icons text-xl">download</span>
        Export Data
      </button>
    </div>

    <!-- Students Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="student in filteredStudents" :key="student.id" 
           class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ student.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ student.studentId }}</p>
            </div>
            <span :class="{
              'px-2 py-1 text-xs font-medium rounded-full': true,
              'bg-green-100 text-green-800': student.status === 'ACTIVE',
              'bg-red-100 text-red-800': student.status === 'AT_RISK',
              'bg-yellow-100 text-yellow-800': student.status === 'NEED_ATTENTION'
            }">
              {{ formatStatus(student.status) }}
            </span>
          </div>

          <!-- Performance Metrics -->
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Attendance Rate</span>
                <span class="font-medium">{{ student.metrics.attendanceRate }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  :style="{ width: `${student.metrics.attendanceRate}%` }"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Assignment Completion</span>
                <span class="font-medium">{{ student.metrics.assignmentCompletion }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full" 
                  :style="{ width: `${student.metrics.assignmentCompletion}%` }"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Average Grade</span>
                <span class="font-medium">{{ student.metrics.averageGrade }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  :class="{
                    'h-2 rounded-full': true,
                    'bg-green-600': student.metrics.averageGrade >= 80,
                    'bg-yellow-600': student.metrics.averageGrade >= 60 && student.metrics.averageGrade < 80,
                    'bg-red-600': student.metrics.averageGrade < 60
                  }"
                  :style="{ width: `${student.metrics.averageGrade}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
            <div class="space-y-2">
              <div v-for="activity in student.recentActivities" :key="activity.id" 
                   class="text-sm">
                <div class="flex items-start gap-2">
                  <span class="material-icons text-gray-400 text-base">
                    {{ getActivityIcon(activity.type) }}
                  </span>
                  <div>
                    <p class="text-gray-800">{{ activity.description }}</p>
                    <p class="text-gray-500 text-xs">
                      {{ new Date(activity.date).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex gap-2">
            <button 
              @click="viewDetails(student)"
              class="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
            >
              View Details
            </button>
            <button 
              @click="addNote(student)"
              class="flex-1 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Note Modal -->
    <div v-if="showNoteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Add Note for {{ selectedStudent?.name }}</h2>
        <form @submit.prevent="submitNote" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
            <select 
              v-model="noteForm.type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACADEMIC">Academic</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
            <textarea 
              v-model="noteForm.content"
              required
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div class="flex justify-end gap-4">
            <button 
              type="button"
              @click="showNoteModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

interface StudentMetrics {
  attendanceRate: number
  assignmentCompletion: number
  averageGrade: number
}

interface Activity {
  id: string
  type: 'ATTENDANCE' | 'ASSIGNMENT' | 'GRADE' | 'NOTE'
  description: string
  date: string
}

interface Student {
  id: string
  name: string
  studentId: string
  status: 'ACTIVE' | 'AT_RISK' | 'NEED_ATTENTION'
  metrics: StudentMetrics
  recentActivities: Activity[]
}

const students = ref<Student[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const showNoteModal = ref(false)
const selectedStudent = ref<Student | null>(null)
const noteForm = ref({
  type: 'ACADEMIC',
  content: ''
})

// Fetch students data
const fetchStudents = async () => {
  try {
    const response = await axios.get('/api/teacher/students', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    students.value = response.data
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

// Filter students based on search and status
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !filterStatus.value || student.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

// Format status for display
const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

// Get icon for activity type
const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    ATTENDANCE: 'event_available',
    ASSIGNMENT: 'assignment',
    GRADE: 'grade',
    NOTE: 'note'
  }
  return icons[type]
}

// View student details
const viewDetails = (student: Student) => {
  router.push(`/teacher/students/${student.id}`)
}

// Add note
const addNote = (student: Student) => {
  selectedStudent.value = student
  showNoteModal.value = true
}

// Submit note
const submitNote = async () => {
  try {
    if (!selectedStudent.value) return

    await axios.post(`/api/teacher/students/${selectedStudent.value.id}/notes`, noteForm.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // Reset form and close modal
    noteForm.value = {
      type: 'ACADEMIC',
      content: ''
    }
    showNoteModal.value = false

    // Refresh student data
    await fetchStudents()
  } catch (error) {
    console.error('Error submitting note:', error)
  }
}

// Export student data
const exportData = async () => {
  try {
    const response = await axios.get('/api/teacher/students/export', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Error exporting data:', error)
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchStudents()
})
</script>
