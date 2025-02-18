<template>
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard Guru</h1>
      <div class="user-info">
        <span>{{ auth.user?.name }}</span>
        <span class="separator">|</span>
        <span>NIP: {{ auth.user?.nip }}</span>
        <button @click="auth.logout" class="logout-button">Logout</button>
      </div>
    </header>

    <div class="dashboard-content">
      <!-- Attendance Summary -->
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Total Siswa Hadir</h3>
          <div class="summary-value">{{ todayStats.present }}</div>
        </div>
        <div class="summary-card">
          <h3>Total Siswa Izin</h3>
          <div class="summary-value">{{ todayStats.leaves }}</div>
        </div>
        <div class="summary-card">
          <h3>Belum Absen</h3>
          <div class="summary-value">{{ todayStats.absent }}</div>
        </div>
      </div>

      <!-- Class Selection -->
      <div class="class-filter">
        <label for="classSelect">Pilih Kelas:</label>
        <select v-model="selectedClass" id="classSelect">
          <option value="">Semua Kelas</option>
          <option v-for="class_ in classes" :key="class_" :value="class_">
            {{ class_ }}
          </option>
        </select>
      </div>

      <!-- Today's Attendance List -->
      <div class="attendance-list">
        <h2>Daftar Kehadiran Hari Ini</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIS</th>
                <th>Kelas</th>
                <th>Status</th>
                <th>Waktu Masuk</th>
                <th>Waktu Pulang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in filteredAttendance" :key="student.id">
                <td>{{ student.user.name }}</td>
                <td>{{ student.user.nis }}</td>
                <td>{{ student.user.class }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(student.status)]">
                    {{ formatStatus(student.status) }}
                  </span>
                </td>
                <td>{{ formatTime(student.checkIn?.createdAt) || '-' }}</td>
                <td>{{ formatTime(student.checkOut?.createdAt) || '-' }}</td>
                <td>
                  <button 
                    v-if="student.status === 'PENDING'"
                    @click="approveAttendance(student.id)"
                    class="approve-button"
                  >
                    Setujui
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <router-link to="/leaves/approval" class="action-card">
          <h3>Persetujuan Izin</h3>
          <p>{{ pendingLeaves }} permintaan menunggu</p>
        </router-link>

        <router-link to="/attendance/report" class="action-card">
          <h3>Laporan Kehadiran</h3>
          <p>Lihat dan unduh laporan</p>
        </router-link>

        <router-link to="/documents/students" class="action-card">
          <h3>Dokumen Siswa</h3>
          <p>Kelola dokumen siswa</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

const auth = useAuthStore()
const selectedClass = ref('')
const classes = ref<string[]>([])
const todayAttendance = ref([])
const pendingLeaves = ref(0)

const todayStats = ref({
  present: 0,
  leaves: 0,
  absent: 0
})

// Computed property for filtered attendance
const filteredAttendance = computed(() => {
  if (!selectedClass.value) return todayAttendance.value
  return todayAttendance.value.filter((item: any) => 
    item.user.class === selectedClass.value
  )
})

// Format time
const formatTime = (date: string | undefined) => {
  if (!date) return '-'
  return dayjs(date).format('HH:mm')
}

// Format status
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Menunggu',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak'
  }
  return statusMap[status] || status
}

// Get status class for styling
const getStatusClass = (status: string) => {
  return status.toLowerCase()
}

// Fetch today's attendance
const fetchTodayAttendance = async () => {
  try {
    const response = await axios.get('/attendance/students', {
      params: { date: dayjs().format('YYYY-MM-DD') }
    })
    todayAttendance.value = response.data

    // Update stats
    const stats = {
      present: 0,
      leaves: 0,
      absent: 0
    }

    response.data.forEach((attendance: any) => {
      if (attendance.status === 'APPROVED') stats.present++
      else if (attendance.status === 'LEAVE') stats.leaves++
      else stats.absent++
    })

    todayStats.value = stats
  } catch (error) {
    console.error('Error fetching attendance:', error)
  }
}

// Fetch classes
const fetchClasses = async () => {
  try {
    const response = await axios.get('/users/students/classes')
    classes.value = response.data
  } catch (error) {
    console.error('Error fetching classes:', error)
  }
}

// Fetch pending leaves count
const fetchPendingLeaves = async () => {
  try {
    const response = await axios.get('/leaves/pending/count')
    pendingLeaves.value = response.data.count
  } catch (error) {
    console.error('Error fetching pending leaves:', error)
  }
}

// Approve attendance
const approveAttendance = async (id: string) => {
  try {
    await axios.patch(`/attendance/${id}/status`, {
      status: 'APPROVED'
    })
    await fetchTodayAttendance()
  } catch (error) {
    console.error('Error approving attendance:', error)
  }
}

onMounted(() => {
  fetchTodayAttendance()
  fetchClasses()
  fetchPendingLeaves()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.separator {
  color: #ddd;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 0.5rem;
}

.class-filter {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.class-filter select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 200px;
}

.attendance-list {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.approve-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-card h3 {
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #666;
}
</style>
