<template>
  <div class="p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Student Dashboard</h1>
      <p class="text-gray-600">Welcome back, {{ stats.student?.name }}</p>
    </div>

    <!-- Quick Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Class Info -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Class Information</h3>
        <p class="text-gray-600">Class: {{ stats.student?.class }}</p>
        <p class="text-gray-600">Teacher: {{ stats.student?.teacher }}</p>
      </div>

      <!-- Today's Attendance -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Today's Attendance</h3>
        <div class="flex items-center">
          <div :class="{
            'px-3 py-1 rounded-full text-sm font-medium': true,
            'bg-green-100 text-green-800': stats.attendance?.today === 'PRESENT',
            'bg-red-100 text-red-800': stats.attendance?.today === 'ABSENT',
            'bg-yellow-100 text-yellow-800': stats.attendance?.today === 'NOT_MARKED'
          }">
            {{ stats.attendance?.today }}
          </div>
        </div>
      </div>

      <!-- Monthly Attendance -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Monthly Attendance</h3>
        <div class="flex items-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ Math.round(stats.attendance?.monthPercentage || 0) }}%
          </div>
        </div>
      </div>

      <!-- Active Leaves -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Active Leaves</h3>
        <div class="text-2xl font-bold text-purple-600">
          {{ stats.activeLeaves?.length || 0 }}
        </div>
      </div>
    </div>

    <!-- Assignments and Grades Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upcoming Assignments -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Upcoming Assignments</h3>
        <div class="space-y-4">
          <div v-for="assignment in stats.upcomingAssignments" :key="assignment.id" 
               class="border-b border-gray-200 pb-3 last:border-0">
            <h4 class="font-medium text-gray-700">{{ assignment.title }}</h4>
            <p class="text-sm text-gray-600">Due: {{ new Date(assignment.dueDate).toLocaleDateString() }}</p>
          </div>
          <p v-if="!stats.upcomingAssignments?.length" class="text-gray-500">
            No upcoming assignments
          </p>
        </div>
      </div>

      <!-- Recent Grades -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Recent Grades</h3>
        <div class="space-y-4">
          <div v-for="grade in stats.recentGrades" :key="grade.id" 
               class="border-b border-gray-200 pb-3 last:border-0">
            <h4 class="font-medium text-gray-700">{{ grade.assignment.title }}</h4>
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-600">
                Submitted: {{ new Date(grade.submittedAt).toLocaleDateString() }}
              </p>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Grade: {{ grade.score }}/100
              </span>
            </div>
          </div>
          <p v-if="!stats.recentGrades?.length" class="text-gray-500">
            No recent grades
          </p>
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
const stats = ref<any>({})

const fetchDashboardStats = async () => {
  try {
    const response = await axios.get('/api/student/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error)
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped>
/* Add your styles here */
</style>
