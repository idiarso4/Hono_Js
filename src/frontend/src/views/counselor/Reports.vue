<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Counseling Reports</h1>
      <p class="text-gray-600">Generate and view counseling session reports and analytics</p>
    </div>

    <!-- Report Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Report Filters</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select 
            v-model="filters.dateRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="THIS_SEMESTER">This Semester</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>

        <div v-if="filters.dateRange === 'CUSTOM'" class="md:col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date"
              v-model="filters.startDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date"
              v-model="filters.endDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
          <select 
            v-model="filters.sessionType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="ACADEMIC">Academic</option>
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="CAREER">Career</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Class/Grade</label>
          <select 
            v-model="filters.grade"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            <option v-for="grade in grades" 
                    :key="grade"
                    :value="grade"
            >
              {{ grade }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button 
          @click="generateReport"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span class="material-icons">analytics</span>
          Generate Report
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Total Sessions</h3>
          <span class="material-icons text-blue-600">groups</span>
        </div>
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalSessions }}</div>
        <p class="text-sm text-gray-600">Sessions conducted</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Students Counseled</h3>
          <span class="material-icons text-green-600">person</span>
        </div>
        <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.uniqueStudents }}</div>
        <p class="text-sm text-gray-600">Unique students</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Avg. Duration</h3>
          <span class="material-icons text-purple-600">schedule</span>
        </div>
        <div class="text-3xl font-bold text-purple-600 mb-2">{{ stats.avgDuration }}m</div>
        <p class="text-sm text-gray-600">Per session</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Completion Rate</h3>
          <span class="material-icons text-yellow-600">trending_up</span>
        </div>
        <div class="text-3xl font-bold text-yellow-600 mb-2">{{ stats.completionRate }}%</div>
        <p class="text-sm text-gray-600">Sessions completed</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Sessions by Type -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Sessions by Type</h3>
        <div class="h-64">
          <canvas ref="sessionsByTypeChart"></canvas>
        </div>
      </div>

      <!-- Sessions Timeline -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Sessions Timeline</h3>
        <div class="h-64">
          <canvas ref="sessionsTimelineChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Report Table -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Detailed Report</h3>
        <button 
          @click="exportReport"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <span class="material-icons">download</span>
          Export Report
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4">Date</th>
              <th class="text-left py-3 px-4">Student</th>
              <th class="text-left py-3 px-4">Class</th>
              <th class="text-left py-3 px-4">Type</th>
              <th class="text-left py-3 px-4">Duration</th>
              <th class="text-left py-3 px-4">Status</th>
              <th class="text-left py-3 px-4">Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in reportData" 
                :key="session.id"
                class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                {{ new Date(session.date).toLocaleDateString() }}
              </td>
              <td class="py-3 px-4">{{ session.student.name }}</td>
              <td class="py-3 px-4">{{ session.student.class }}</td>
              <td class="py-3 px-4">{{ session.type }}</td>
              <td class="py-3 px-4">{{ session.duration }} mins</td>
              <td class="py-3 px-4">
                <span :class="{
                  'px-2 py-1 text-xs font-medium rounded-full': true,
                  'bg-green-100 text-green-800': session.status === 'COMPLETED',
                  'bg-yellow-100 text-yellow-800': session.status === 'IN_PROGRESS',
                  'bg-red-100 text-red-800': session.status === 'CANCELLED'
                }">
                  {{ formatStatus(session.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 line-clamp-2">{{ session.outcome }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import Chart from 'chart.js/auto'

const auth = useAuthStore()

interface Student {
  id: string
  name: string
  class: string
}

interface Session {
  id: string
  date: string
  student: Student
  type: string
  duration: number
  status: string
  outcome: string
}

interface Statistics {
  totalSessions: number
  uniqueStudents: number
  avgDuration: number
  completionRate: number
}

// State
const filters = ref({
  dateRange: 'THIS_MONTH',
  startDate: '',
  endDate: '',
  sessionType: '',
  grade: ''
})

const grades = ref<string[]>([])
const stats = ref<Statistics>({
  totalSessions: 0,
  uniqueStudents: 0,
  avgDuration: 0,
  completionRate: 0
})
const reportData = ref<Session[]>([])

// Chart references
const sessionsByTypeChart = ref<HTMLCanvasElement | null>(null)
const sessionsTimelineChart = ref<HTMLCanvasElement | null>(null)
let typeChart: Chart | null = null
let timelineChart: Chart | null = null

// Methods
const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

const generateReport = async () => {
  try {
    const response = await axios.get('/api/counselor/reports', {
      params: filters.value,
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    
    const { statistics, sessions, chartData } = response.data
    stats.value = statistics
    reportData.value = sessions
    
    updateCharts(chartData)
  } catch (error) {
    console.error('Error generating report:', error)
  }
}

const updateCharts = (chartData: any) => {
  // Update Sessions by Type chart
  if (typeChart) {
    typeChart.destroy()
  }
  
  if (sessionsByTypeChart.value) {
    typeChart = new Chart(sessionsByTypeChart.value, {
      type: 'doughnut',
      data: {
        labels: chartData.sessionTypes.labels,
        datasets: [{
          data: chartData.sessionTypes.data,
          backgroundColor: [
            '#3B82F6', // blue
            '#10B981', // green
            '#F59E0B', // yellow
            '#EF4444'  // red
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }
  
  // Update Sessions Timeline chart
  if (timelineChart) {
    timelineChart.destroy()
  }
  
  if (sessionsTimelineChart.value) {
    timelineChart = new Chart(sessionsTimelineChart.value, {
      type: 'line',
      data: {
        labels: chartData.timeline.labels,
        datasets: [{
          label: 'Sessions',
          data: chartData.timeline.data,
          borderColor: '#3B82F6',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })
  }
}

const exportReport = async () => {
  try {
    const response = await axios.get('/api/counselor/reports/export', {
      params: filters.value,
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `counseling_report_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Error exporting report:', error)
  }
}

// Fetch initial data
const fetchGrades = async () => {
  try {
    const response = await axios.get('/api/counselor/grades', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    grades.value = response.data
  } catch (error) {
    console.error('Error fetching grades:', error)
  }
}

// Watch for filter changes
watch(filters, () => {
  if (filters.value.dateRange !== 'CUSTOM') {
    filters.value.startDate = ''
    filters.value.endDate = ''
  }
  generateReport()
}, { deep: true })

// Initialize
onMounted(async () => {
  await fetchGrades()
  generateReport()
})
</script>
