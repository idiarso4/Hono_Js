<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">My Attendance</h1>
      <p class="text-gray-600">View and track your attendance records</p>
    </div>

    <!-- Attendance Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Attendance Rate</h3>
          <span class="material-icons text-blue-600">show_chart</span>
        </div>
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ attendanceSummary.rate }}%</div>
        <p class="text-sm text-gray-600">Overall attendance this semester</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Present Days</h3>
          <span class="material-icons text-green-600">check_circle</span>
        </div>
        <div class="text-3xl font-bold text-green-600 mb-2">{{ attendanceSummary.presentDays }}</div>
        <p class="text-sm text-gray-600">Total days present</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Absences</h3>
          <span class="material-icons text-red-600">warning</span>
        </div>
        <div class="text-3xl font-bold text-red-600 mb-2">{{ attendanceSummary.absences }}</div>
        <p class="text-sm text-gray-600">Total days absent</p>
      </div>
    </div>

    <!-- Monthly Calendar -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Monthly Overview</h2>
        <div class="flex gap-4 items-center">
          <button 
            @click="previousMonth"
            class="p-2 hover:bg-gray-100 rounded-full"
          >
            <span class="material-icons">chevron_left</span>
          </button>
          <span class="text-lg font-medium">{{ currentMonthYear }}</span>
          <button 
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-full"
          >
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-2">
        <!-- Day Labels -->
        <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
             :key="day"
             class="text-center text-sm font-medium text-gray-600 py-2"
        >
          {{ day }}
        </div>

        <!-- Calendar Days -->
        <div v-for="(day, index) in calendarDays" 
             :key="index"
             :class="{
               'p-2 rounded-lg text-center relative': true,
               'bg-gray-100': !day.isCurrentMonth,
               'hover:bg-gray-50 cursor-pointer': day.isCurrentMonth && day.attendance,
             }"
             @click="day.isCurrentMonth && day.attendance && showDayDetails(day)"
        >
          <span :class="{
            'inline-block w-8 h-8 leading-8 rounded-full': true,
            'bg-green-100 text-green-800': day.attendance?.status === 'PRESENT',
            'bg-red-100 text-red-800': day.attendance?.status === 'ABSENT',
            'bg-yellow-100 text-yellow-800': day.attendance?.status === 'LATE',
            'text-gray-400': !day.isCurrentMonth,
            'text-gray-800': day.isCurrentMonth && !day.attendance
          }">
            {{ day.date.getDate() }}
          </span>
          
          <div v-if="day.attendance?.status === 'LATE'" 
               class="absolute bottom-1 right-1">
            <span class="material-icons text-yellow-500 text-sm">schedule</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Attendance Records -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-6">Recent Records</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4">Date</th>
              <th class="text-left py-3 px-4">Status</th>
              <th class="text-left py-3 px-4">Time</th>
              <th class="text-left py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in recentRecords" 
                :key="record.id"
                class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                {{ new Date(record.date).toLocaleDateString() }}
              </td>
              <td class="py-3 px-4">
                <span :class="{
                  'px-2 py-1 text-xs font-medium rounded-full': true,
                  'bg-green-100 text-green-800': record.status === 'PRESENT',
                  'bg-red-100 text-red-800': record.status === 'ABSENT',
                  'bg-yellow-100 text-yellow-800': record.status === 'LATE'
                }">
                  {{ record.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                {{ record.time || '-' }}
              </td>
              <td class="py-3 px-4 text-gray-600">
                {{ record.notes || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Day Details Modal -->
    <div v-if="selectedDay" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">
            {{ new Date(selectedDay.date).toLocaleDateString() }}
          </h2>
          <button 
            @click="selectedDay = null"
            class="text-gray-500 hover:text-gray-700"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Status</span>
            <span :class="{
              'px-2 py-1 text-sm font-medium rounded-full': true,
              'bg-green-100 text-green-800': selectedDay?.attendance?.status === 'PRESENT',
              'bg-red-100 text-red-800': selectedDay?.attendance?.status === 'ABSENT',
              'bg-yellow-100 text-yellow-800': selectedDay?.attendance?.status === 'LATE'
            }">
              {{ selectedDay?.attendance?.status }}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Check-in Time</span>
            <span class="font-medium">{{ selectedDay?.attendance?.time || '-' }}</span>
          </div>
          
          <div v-if="selectedDay?.attendance?.notes">
            <span class="text-gray-600 block mb-2">Notes</span>
            <p class="text-gray-800 bg-gray-50 p-3 rounded-lg">
              {{ selectedDay?.attendance?.notes }}
            </p>
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

interface AttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  time?: string
  notes?: string
}

interface AttendanceSummary {
  rate: number
  presentDays: number
  absences: number
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  attendance?: AttendanceRecord
}

const currentMonth = ref(new Date())
const selectedDay = ref<CalendarDay | null>(null)
const attendanceSummary = ref<AttendanceSummary>({
  rate: 0,
  presentDays: 0,
  absences: 0
})
const recentRecords = ref<AttendanceRecord[]>([])

// Format current month and year
const currentMonthYear = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

// Generate calendar days
const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
  const lastDay = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0)
  
  // Add previous month's days
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(firstDay)
    date.setDate(date.getDate() - i - 1)
    days.push({
      date,
      isCurrentMonth: false
    })
  }
  
  // Add current month's days
  for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
    days.push({
      date: new Date(date),
      isCurrentMonth: true
    })
  }
  
  // Add next month's days
  const remainingDays = 42 - days.length // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(lastDay)
    date.setDate(date.getDate() + i)
    days.push({
      date,
      isCurrentMonth: false
    })
  }
  
  return days
})

// Navigation methods
const previousMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1
  )
  fetchMonthlyAttendance()
}

const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1
  )
  fetchMonthlyAttendance()
}

// Show day details
const showDayDetails = (day: CalendarDay) => {
  selectedDay.value = day
}

// Fetch attendance data
const fetchAttendanceSummary = async () => {
  try {
    const response = await axios.get('/api/student/attendance/summary', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    attendanceSummary.value = response.data
  } catch (error) {
    console.error('Error fetching attendance summary:', error)
  }
}

const fetchMonthlyAttendance = async () => {
  try {
    const response = await axios.get('/api/student/attendance/monthly', {
      params: {
        year: currentMonth.value.getFullYear(),
        month: currentMonth.value.getMonth() + 1
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    
    // Map attendance records to calendar days
    calendarDays.value.forEach(day => {
      const record = response.data.find((r: AttendanceRecord) => 
        new Date(r.date).toDateString() === day.date.toDateString()
      )
      if (record) {
        day.attendance = record
      }
    })
  } catch (error) {
    console.error('Error fetching monthly attendance:', error)
  }
}

const fetchRecentRecords = async () => {
  try {
    const response = await axios.get('/api/student/attendance/recent', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    recentRecords.value = response.data
  } catch (error) {
    console.error('Error fetching recent records:', error)
  }
}

// Initialize data
onMounted(() => {
  fetchAttendanceSummary()
  fetchMonthlyAttendance()
  fetchRecentRecords()
})
</script>
