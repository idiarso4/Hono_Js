<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div class="flex space-x-4">
            <button
              @click="triggerBackup"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <i class="fas fa-database mr-2"></i>
              Backup System
            </button>
            <button
              @click="refreshData"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- System Health Card -->
      <div v-if="systemHealth" class="mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="flex items-center">
                <div :class="{
                  'w-4 h-4 rounded-full mr-2': true,
                  'bg-green-500': systemHealth.status === 'healthy',
                  'bg-yellow-500': systemHealth.status === 'degraded',
                  'bg-red-500': systemHealth.status === 'down'
                }"></div>
                <span class="text-sm font-medium text-gray-500">System Status:</span>
                <span class="ml-2 text-sm font-semibold">{{ systemHealth.status }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Uptime:</span>
                <span class="ml-2 text-sm font-semibold">{{ formatUptime(systemHealth.uptime) }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Storage:</span>
                <span class="ml-2 text-sm font-semibold">
                  {{ formatStorage(systemHealth.storageUsed) }} / {{ formatStorage(systemHealth.totalStorage) }}
                </span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Active Users:</span>
                <span class="ml-2 text-sm font-semibold">{{ systemHealth.activeUsers }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div v-if="stats" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Users Stats -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-users text-2xl text-indigo-600"></i>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ stats.users.total }}</div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <i class="fas fa-arrow-up"></i>
                        <span class="ml-1">{{ stats.users.newThisMonth }} this month</span>
                      </div>
                    </dd>
                  </dl>
                  <div class="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span class="text-gray-500">Students:</span>
                      <span class="font-medium">{{ stats.users.students }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Teachers:</span>
                      <span class="font-medium">{{ stats.users.teachers }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Staff:</span>
                      <span class="font-medium">{{ stats.users.staff }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Stats -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-clock text-2xl text-blue-600"></i>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Today's Attendance</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        {{ stats.attendance.presentToday }}
                      </div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <span>{{ Math.round(stats.attendance.averageAttendance * 100) }}% avg</span>
                      </div>
                    </dd>
                  </dl>
                  <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-gray-500">Absent:</span>
                      <span class="font-medium">{{ stats.attendance.absentToday }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Late:</span>
                      <span class="font-medium">{{ stats.attendance.lateToday }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory Stats -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-box text-2xl text-yellow-600"></i>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Inventory Status</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        {{ stats.inventory.totalItems }}
                      </div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <span>{{ stats.inventory.damagedItems }} damaged</span>
                      </div>
                    </dd>
                  </dl>
                  <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-gray-500">Pending Repairs:</span>
                      <span class="font-medium">{{ stats.inventory.pendingRepairs }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Repair Costs:</span>
                      <span class="font-medium">${{ stats.inventory.repairCosts }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Logs -->
      <div class="mb-8">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="log in activityLogs" :key="log.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(log.timestamp) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ log.userName }}</div>
                      <div class="text-sm text-gray-500">{{ log.ipAddress }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getActionClass(log.action)">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {{ log.details }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white shadow rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">System Load</h3>
          <canvas ref="systemLoadChart"></canvas>
        </div>
        <div class="bg-white shadow rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
          <canvas ref="userActivityChart"></canvas>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import Chart from 'chart.js/auto'

const adminDashboardStore = useAdminDashboardStore()
const { stats, activityLogs, systemHealth } = storeToRefs(adminDashboardStore)

const systemLoadChart = ref<HTMLCanvasElement | null>(null)
const userActivityChart = ref<HTMLCanvasElement | null>(null)
let systemLoadChartInstance: Chart | null = null
let userActivityChartInstance: Chart | null = null

// Methods
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

const formatStorage = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return dayjs(date).format('MMM D, YYYY HH:mm')
}

const getActionClass = (action: string) => {
  const classes = {
    'LOGIN': 'bg-green-100 text-green-800',
    'LOGOUT': 'bg-gray-100 text-gray-800',
    'CREATE': 'bg-blue-100 text-blue-800',
    'UPDATE': 'bg-yellow-100 text-yellow-800',
    'DELETE': 'bg-red-100 text-red-800'
  }
  return classes[action] || 'bg-gray-100 text-gray-800'
}

const initCharts = async () => {
  const metrics = await adminDashboardStore.getPerformanceMetrics('day')
  
  if (systemLoadChart.value) {
    systemLoadChartInstance?.destroy()
    systemLoadChartInstance = new Chart(systemLoadChart.value, {
      type: 'line',
      data: {
        labels: metrics.systemLoad.map(d => dayjs(d.timestamp).format('HH:mm')),
        datasets: [{
          label: 'System Load',
          data: metrics.systemLoad.map(d => d.value),
          borderColor: 'rgb(99, 102, 241)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  if (userActivityChart.value) {
    userActivityChartInstance?.destroy()
    userActivityChartInstance = new Chart(userActivityChart.value, {
      type: 'bar',
      data: {
        labels: metrics.userActivity.map(d => dayjs(d.timestamp).format('HH:mm')),
        datasets: [{
          label: 'Active Users',
          data: metrics.userActivity.map(d => d.value),
          backgroundColor: 'rgb(59, 130, 246)',
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

const refreshData = async () => {
  await Promise.all([
    adminDashboardStore.fetchStats(),
    adminDashboardStore.fetchActivityLogs({ limit: 10 }),
    adminDashboardStore.fetchSystemHealth()
  ])
  await initCharts()
}

const triggerBackup = async () => {
  try {
    await adminDashboardStore.triggerBackup()
    // Add notification of success
  } catch (error) {
    // Add error handling
    console.error('Backup failed:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await refreshData()
  // Refresh data every 5 minutes
  setInterval(refreshData, 300000)
})
</script>
