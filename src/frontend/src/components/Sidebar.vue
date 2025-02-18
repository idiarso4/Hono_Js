<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <button @click="toggleSidebar" class="collapse-btn">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <!-- Menu untuk semua user -->
      <div class="nav-section">
        <router-link to="/dashboard" class="nav-item">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/profile" class="nav-item">
          <i class="fas fa-user"></i>
          <span>Profil Saya</span>
        </router-link>
      </div>

      <!-- Menu untuk Siswa -->
      <div v-if="userRole === 'STUDENT'" class="nav-section">
        <router-link to="/attendance" class="nav-item">
          <i class="fas fa-clock"></i>
          <span>Presensi</span>
        </router-link>

        <router-link to="/pkl-journal" class="nav-item">
          <i class="fas fa-book"></i>
          <span>Jurnal PKL</span>
        </router-link>

        <router-link to="/extracurricular" class="nav-item">
          <i class="fas fa-running"></i>
          <span>Ekstrakurikuler</span>
        </router-link>

        <router-link to="/prayer" class="nav-item">
          <i class="fas fa-pray"></i>
          <span>Ibadah</span>
        </router-link>

        <router-link to="/permissions" class="nav-item">
          <i class="fas fa-door-open"></i>
          <span>Perizinan</span>
        </router-link>
      </div>

      <!-- Menu untuk Guru -->
      <div v-if="userRole === 'TEACHER'" class="nav-section">
        <router-link to="/teacher-journal" class="nav-item">
          <i class="fas fa-journal-whills"></i>
          <span>Jurnal Mengajar</span>
        </router-link>

        <router-link to="/attendance-approval" class="nav-item">
          <i class="fas fa-user-check"></i>
          <span>Approval Presensi</span>
        </router-link>

        <router-link to="/class-management" class="nav-item">
          <i class="fas fa-chalkboard-teacher"></i>
          <span>Manajemen Kelas</span>
        </router-link>
      </div>

      <!-- Menu untuk BK -->
      <div v-if="userRole === 'COUNSELOR'" class="nav-section">
        <router-link to="/counseling" class="nav-item">
          <i class="fas fa-hands-helping"></i>
          <span>Konseling</span>
        </router-link>

        <router-link to="/home-visits" class="nav-item">
          <i class="fas fa-home"></i>
          <span>Home Visit</span>
        </router-link>

        <router-link to="/student-cases" class="nav-item">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Kasus Siswa</span>
        </router-link>
      </div>

      <!-- Menu untuk Admin -->
      <div v-if="userRole === 'ADMIN'" class="nav-section">
        <router-link to="/user-management" class="nav-item">
          <i class="fas fa-users-cog"></i>
          <span>Manajemen User</span>
        </router-link>

        <router-link to="/inventory" class="nav-item">
          <i class="fas fa-boxes"></i>
          <span>Inventaris</span>
        </router-link>

        <router-link to="/reports" class="nav-item">
          <i class="fas fa-chart-bar"></i>
          <span>Laporan</span>
        </router-link>

        <router-link to="/backup" class="nav-item">
          <i class="fas fa-database"></i>
          <span>Backup & Restore</span>
        </router-link>
      </div>

      <!-- Menu untuk semua user -->
      <div class="nav-section">
        <router-link to="/settings" class="nav-item">
          <i class="fas fa-cog"></i>
          <span>Pengaturan</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isCollapsed = ref(false)
const userRole = computed(() => auth.user?.role)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #4051B5;
  color: white;
  transition: all 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
}

.logo {
  height: 40px;
}

.collapse-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-section {
  margin-bottom: 1rem;
}

.nav-section:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item i {
  width: 24px;
  margin-right: 1rem;
}

.sidebar-collapsed .nav-item span {
  display: none;
}

.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
