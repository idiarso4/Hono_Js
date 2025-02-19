<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Attendance Management</h1>
      <p class="text-gray-600">Manage student attendance for your class</p>
    </div>

    <!-- Date Selection and Actions -->
    <div class="flex flex-wrap gap-4 mb-8">
      <div class="flex-1 min-w-[200px]">
        <input 
          type="date"
          v-model="selectedDate"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :max="today"
        >
      </div>
      <button 
        @click="saveAttendance"
        :disabled="!hasChanges || isSaving"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
      >
        <span class="material-icons text-xl" v-if="isSaving">sync</span>
        <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
      </button>
    </div>

    <!-- Attendance Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Class Attendance</h2>
            <p class="text-gray-600">{{ selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select a date' }}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span class="text-sm text-gray-600">Present</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="text-sm text-gray-600">Absent</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span class="text-sm text-gray-600">Late</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-500"></span>
              <span class="text-sm text-gray-600">Leave</span>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in students" :key="student.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                    <div class="text-sm text-gray-500">{{ student.studentId }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select 
                  v-model="attendance[student.id].status"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @change="markAsChanged(student.id)"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <input 
                  type="time"
                  v-model="attendance[student.id].checkInTime"
                  :disabled="attendance[student.id].status === 'ABSENT'"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @change="markAsChanged(student.id)"
                >
              </td>
              <td class="px-6 py-4">
                <input 
                  type="text"
                  v-model="attendance[student.id].notes"
                  placeholder="Add notes..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @input="markAsChanged(student.id)"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly Summary</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Students</span>
            <span class="font-medium">{{ students.length }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Average Attendance</span>
            <span class="font-medium">{{ monthlyStats.averageAttendance }}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Late Incidents</span>
            <span class="font-medium">{{ monthlyStats.lateCount }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Today's Statistics</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Present</span>
            <span class="font-medium text-green-600">{{ todayStats.presentCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Absent</span>
            <span class="font-medium text-red-600">{{ todayStats.absentCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Late</span>
            <span class="font-medium text-yellow-600">{{ todayStats.lateCount }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Frequent Absences</h3>
        <div class="space-y-4">
          <div v-for="student in frequentAbsences" :key="student.id" class="flex justify-between items-center">
            <span class="text-gray-600">{{ student.name }}</span>
            <span class="font-medium text-red-600">{{ student.absences }} days</span>
          </div>
          <div v-if="frequentAbsences.length === 0" class="text-gray-500 text-center">
            No frequent absences
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

interface Student {
  id: string
  name: string
  studentId: string
}

interface AttendanceRecord {
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'
  checkInTime: string
  notes: string
  changed?: boolean
}

interface MonthlyStats {
  averageAttendance: number
  lateCount: number
}

interface TodayStats {
  presentCount: number
  absentCount: number
  lateCount: number
}

const students = ref<Student[]>([])
const attendance = ref<Record<string, AttendanceRecord>>({})
const selectedDate = ref(new Date().toISOString().split('T')[0])
const isSaving = ref(false)
const monthlyStats = ref<MonthlyStats>({
  averageAttendance: 0,
  lateCount: 0
})
const todayStats = ref<TodayStats>({
  presentCount: 0,
  absentCount: 0,
  lateCount: 0
})
const frequentAbsences = ref<{ id: string; name: string; absences: number }[]>([])

const today = new Date().toISOString().split('T')[0]

// Check if there are any unsaved changes
const hasChanges = computed(() => {
  return Object.values(attendance.value).some(record => record.changed)
})

// Fetch students and attendance data
const fetchData = async () => {
  try {
    // Fetch students in the class
    const studentsResponse = await axios.get('/api/teacher/students', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    students.value = studentsResponse.data

    // Initialize attendance records
    students.value.forEach(student => {
      if (!attendance.value[student.id]) {
        attendance.value[student.id] = {
          status: 'PRESENT',
          checkInTime: '',
          notes: ''
        }
      }
    })

    // Fetch attendance for selected date
    if (selectedDate.value) {
      const attendanceResponse = await axios.get(`/api/teacher/attendance/${selectedDate.value}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      
      // Update attendance records
      attendanceResponse.data.forEach((record: any) => {
        attendance.value[record.studentId] = {
          status: record.status,
          checkInTime: record.checkInTime,
          notes: record.notes
        }
      })
    }

    // Fetch monthly stats
    const statsResponse = await axios.get('/api/teacher/attendance/stats', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    monthlyStats.value = statsResponse.data.monthly
    todayStats.value = statsResponse.data.today
    frequentAbsences.value = statsResponse.data.frequentAbsences
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Mark attendance record as changed
const markAsChanged = (studentId: string) => {
  attendance.value[studentId].changed = true
}

// Save attendance changes
const saveAttendance = async () => {
  try {
    isSaving.value = true
    const changedRecords = Object.entries(attendance.value)
      .filter(([_, record]) => record.changed)
      .map(([studentId, record]) => ({
        studentId,
        date: selectedDate.value,
        ...record
      }))

    await axios.post('/api/teacher/attendance', changedRecords, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // Reset changed flags
    Object.values(attendance.value).forEach(record => {
      record.changed = false
    })

    // Refresh stats
    await fetchData()
  } catch (error) {
    console.error('Error saving attendance:', error)
  } finally {
    isSaving.value = false
  }
}

// Watch for date changes
watch(selectedDate, () => {
  fetchData()
})

// Initialize data on component mount
onMounted(() => {
  fetchData()
})
</script>
