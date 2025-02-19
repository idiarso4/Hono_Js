<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MainLayout from '@/layouts/MainLayout.vue'

const authStore = useAuthStore()
const router = useRouter()

// Setup axios defaults
axios.defaults.baseURL = 'http://localhost:3000'

onMounted(async () => {
  // Check authentication status
  const isAuthenticated = await authStore.checkAuth()
  if (!isAuthenticated && !router.currentRoute.value.path.startsWith('/auth')) {
    router.push('/login')
  }
})
</script>

<template>
  <MainLayout>
    <RouterView />
  </MainLayout>
</template>

<style>
@import '@/assets/base.css';

#app {
  @apply min-h-screen bg-gray-50;
}

.btn {
  @apply px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.table {
  @apply min-w-full divide-y divide-gray-200;
}

.table th {
  @apply px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.table td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}

.table tr {
  @apply hover:bg-gray-50;
}

.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge-success {
  @apply bg-green-100 text-green-800;
}

.badge-warning {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-danger {
  @apply bg-red-100 text-red-800;
}

.badge-info {
  @apply bg-blue-100 text-blue-800;
}
</style>
