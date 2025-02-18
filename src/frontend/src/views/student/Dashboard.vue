<template>
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard Siswa</h1>
      <div class="user-info">
        <span>{{ auth.user?.name }}</span>
        <span class="separator">|</span>
        <span>{{ auth.user?.class }}</span>
        <button @click="auth.logout" class="logout-button">Logout</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="attendance-card">
        <h2>Absensi Hari Ini</h2>
        <div v-if="todayAttendance.length > 0">
          <div v-for="attendance in todayAttendance" :key="attendance.id" class="attendance-item">
            <div class="attendance-info">
              <span class="attendance-type">{{ attendance.type === 'CHECK_IN' ? 'Masuk' : 'Pulang' }}</span>
              <span class="attendance-time">{{ formatTime(attendance.createdAt) }}</span>
              <span :class="['attendance-status', attendance.status.toLowerCase()]">
                {{ formatStatus(attendance.status) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="no-attendance">
          Belum ada absensi hari ini
        </div>

        <div class="attendance-actions">
          <button 
            @click="showAttendanceModal = true" 
            :disabled="loading"
            class="action-button"
          >
            Absen Sekarang
          </button>
        </div>
      </div>

      <div class="quick-actions">
        <router-link to="/leaves/new" class="action-card">
          <h3>Pengajuan Izin</h3>
          <p>Ajukan izin atau sakit</p>
        </router-link>

        <router-link to="/documents" class="action-card">
          <h3>Dokumen</h3>
          <p>Lihat dan unggah dokumen</p>
        </router-link>

        <router-link to="/attendance/history" class="action-card">
          <h3>Riwayat Absensi</h3>
          <p>Lihat riwayat kehadiran</p>
        </router-link>
      </div>
    </div>

    <!-- Modal Absensi -->
    <div v-if="showAttendanceModal" class="modal">
      <div class="modal-content">
        <h2>Absensi</h2>
        <div class="attendance-methods">
          <button @click="startFaceRecognition" :disabled="loading">
            Absen dengan Wajah
          </button>
          <button @click="startQRScanner" :disabled="loading">
            Absen dengan QR Code
          </button>
          <button @click="startPhotoCapture" :disabled="loading">
            Absen dengan Foto
          </button>
        </div>

        <div v-if="showWebcam" class="webcam-container">
          <video ref="webcamVideo" autoplay muted></video>
          <button @click="capturePhoto" :disabled="loading">
            Ambil Foto
          </button>
        </div>

        <button @click="closeModal" class="close-button">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

interface Attendance {
  id: string
  type: 'CHECK_IN' | 'CHECK_OUT'
  createdAt: string
  status: 'ON_TIME' | 'LATE' | 'EARLY' | 'ABSENT'
}

const auth = useAuthStore()
const loading = ref(false)
const todayAttendance = ref<Attendance[]>([])
const showAttendanceModal = ref(false)
const showWebcam = ref(false)
const webcamStream = ref<MediaStream | null>(null)
const webcamVideo = ref<HTMLVideoElement | null>(null)

// Fetch today's attendance
const fetchTodayAttendance = async () => {
  try {
    const response = await axios.get('/attendance/today')
    todayAttendance.value = response.data
  } catch (error) {
    console.error('Error fetching attendance:', error)
  }
}

// Format time
const formatTime = (date: string) => {
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

// Webcam functions
const startWebcam = async () => {
  try {
    webcamStream.value = await navigator.mediaDevices.getUserMedia({ video: true })
    if (webcamVideo.value) {
      webcamVideo.value.srcObject = webcamStream.value
    }
  } catch (error) {
    console.error('Error accessing webcam:', error)
  }
}

const stopWebcam = () => {
  if (webcamStream.value) {
    webcamStream.value.getTracks().forEach(track => track.stop())
    webcamStream.value = null
  }
}

const startFaceRecognition = async () => {
  showWebcam.value = true
  await startWebcam()
  // TODO: Implement face recognition
}

const startQRScanner = () => {
  showWebcam.value = true
  // TODO: Implement QR scanner
}

const startPhotoCapture = async () => {
  showWebcam.value = true
  await startWebcam()
}

const capturePhoto = async () => {
  // TODO: Implement photo capture and send to server
}

const closeModal = () => {
  showAttendanceModal.value = false
  showWebcam.value = false
  stopWebcam()
}

onMounted(() => {
  fetchTodayAttendance()
})

onUnmounted(() => {
  stopWebcam()
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

.attendance-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.attendance-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.attendance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attendance-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}

.attendance-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.attendance-status.approved {
  background-color: #d4edda;
  color: #155724;
}

.attendance-status.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.no-attendance {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.attendance-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.action-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.attendance-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.webcam-container {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.webcam-container video {
  width: 100%;
  max-width: 400px;
  border-radius: 4px;
}

.close-button {
  background-color: #ddd;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
}
</style>
