<template>
  <div class="p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Counselor Dashboard</h1>
      <p class="text-gray-600">Welcome back, {{ stats.counselor?.name }}</p>
    </div>

    <!-- Today's Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Today's Sessions</h3>
        <div class="text-3xl font-bold text-blue-600">{{ stats.todayStats?.totalSessions || 0 }}</div>
        <div class="mt-2 text-sm text-gray-600">
          <span class="mr-4">Completed: {{ stats.todayStats?.completedSessions || 0 }}</span>
          <span>Pending: {{ stats.todayStats?.pendingSessions || 0 }}</span>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Monthly Sessions</h3>
        <div class="text-3xl font-bold text-green-600">
          {{ stats.monthlyStats?.sessions?.reduce((acc, curr) => acc + curr._count, 0) || 0 }}
        </div>
        <div class="mt-2 text-sm text-gray-600">
          Home Visits: {{ stats.monthlyStats?.totalHomeVisits || 0 }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Pending Home Visits</h3>
        <div class="text-3xl font-bold text-purple-600">
          {{ stats.pendingHomeVisits?.length || 0 }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upcoming Sessions -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Upcoming Sessions</h3>
        <div class="space-y-4">
          <div v-for="session in stats.upcomingSessions" :key="session.id" 
               class="border-b border-gray-200 pb-3 last:border-0">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-gray-700">{{ session.student.name }}</h4>
                <p class="text-sm text-gray-600">
                  {{ new Date(session.scheduledAt).toLocaleString() }}
                </p>
              </div>
              <router-link 
                :to="'/counselor/sessions/' + session.id"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200"
              >
                View Details
              </router-link>
            </div>
          </div>
          <p v-if="!stats.upcomingSessions?.length" class="text-gray-500">
            No upcoming sessions
          </p>
        </div>
      </div>

      <!-- Students Needing Attention -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Students Needing Attention</h3>
        <div class="space-y-4">
          <div v-for="student in stats.studentsNeedingAttention" :key="student.id" 
               class="border-b border-gray-200 pb-3 last:border-0">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-gray-700">{{ student.name }}</h4>
                <p class="text-sm text-gray-600">Class: {{ student.class.name }}</p>
                <div class="mt-1 space-x-2">
                  <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    {{ student._count.attendances }} absences
                  </span>
                  <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    {{ student._count.assignmentSubmissions }} low grades
                  </span>
                </div>
              </div>
              <router-link 
                :to="'/counselor/students/' + student.id"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200"
              >
                View Profile
              </router-link>
            </div>
          </div>
          <p v-if="!stats.studentsNeedingAttention?.length" class="text-gray-500">
            No students currently need attention
          </p>
        </div>
      </div>

      <!-- Pending Home Visits -->
      <div class="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">Pending Home Visits</h3>
          <router-link 
            to="/counselor/home-visits"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            View All
          </router-link>
        </div>
        <div class="space-y-4">
          <div v-for="visit in stats.pendingHomeVisits" :key="visit.id" 
               class="border-b border-gray-200 pb-3 last:border-0">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-gray-700">{{ visit.student.name }}</h4>
                <p class="text-sm text-gray-600">
                  Requested: {{ new Date(visit.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <router-link 
                :to="'/counselor/home-visits/' + visit.id"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200"
              >
                View Details
              </router-link>
            </div>
          </div>
          <p v-if="!stats.pendingHomeVisits?.length" class="text-gray-500">
            No pending home visits
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
    const response = await axios.get('/api/counselor/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching counselor dashboard stats:', error)
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped>
/* Add your styles here */
</style>
