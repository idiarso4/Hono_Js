<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="text-xl font-bold">School System</h2>
    </div>

    <!-- Admin Menu -->
    <div v-if="isAdmin" class="nav-section">
      <h3 class="nav-title">Admin</h3>
      <nav>
        <router-link to="/admin/dashboard">Dashboard</router-link>
        <router-link to="/admin/users">User Management</router-link>
        <router-link to="/admin/backup">Backup & Restore</router-link>
      </nav>
    </div>

    <!-- Teacher Menu -->
    <div v-if="isTeacher" class="nav-section">
      <h3 class="nav-title">Teacher</h3>
      <nav>
        <router-link to="/teacher/dashboard">Dashboard</router-link>
        <router-link to="/teacher/attendance">Attendance</router-link>
        <router-link to="/teacher/journal">Teaching Journal</router-link>
        <router-link to="/teacher/students">Student Management</router-link>
      </nav>
    </div>

    <!-- Student Menu -->
    <div v-if="isStudent" class="nav-section">
      <h3 class="nav-title">Student</h3>
      <nav>
        <router-link to="/student/dashboard">Dashboard</router-link>
        <router-link to="/student/attendance">My Attendance</router-link>
        <router-link to="/student/journal">PKL Journal</router-link>
        <router-link to="/student/extracurricular">Extracurricular</router-link>
      </nav>
    </div>

    <!-- Counselor Menu -->
    <div v-if="isCounselor" class="nav-section">
      <h3 class="nav-title">Counselor</h3>
      <nav>
        <router-link to="/counselor/dashboard">Dashboard</router-link>
        <router-link to="/counselor/home-visits">Home Visits</router-link>
        <router-link to="/counselor/counseling">Counseling</router-link>
        <router-link to="/counselor/reports">Reports</router-link>
      </nav>
    </div>

    <!-- Common Menu -->
    <div class="nav-section">
      <h3 class="nav-title">Common</h3>
      <nav>
        <router-link to="/profile">My Profile</router-link>
        <router-link to="/prayer">Prayer Times</router-link>
        <router-link to="/inventory/report">Report Damage</router-link>
        <a href="#" @click.prevent="handleLogout">Logout</a>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const userRole = computed(() => authStore.user?.role)
const isAdmin = computed(() => userRole.value === 'ADMIN')
const isTeacher = computed(() => userRole.value === 'TEACHER')
const isStudent = computed(() => userRole.value === 'STUDENT')
const isCounselor = computed(() => userRole.value === 'COUNSELOR')

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  @apply w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto;
}

.sidebar-header {
  @apply p-4 border-b border-gray-200;
}

.nav-section {
  @apply py-4;
}

.nav-title {
  @apply px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider;
}

nav {
  @apply mt-2;
}

nav a {
  @apply block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}

nav a.router-link-active {
  @apply bg-primary-50 text-primary-600 font-medium;
}
</style>
