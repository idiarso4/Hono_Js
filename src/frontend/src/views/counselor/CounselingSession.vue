<template>
  <div class="counseling-session">
    <header class="page-header">
      <h1>Manajemen Konseling</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        <i class="fas fa-plus"></i> Sesi Baru
      </button>
    </header>

    <!-- Filters -->
    <div class="filter-section">
      <div class="date-range">
        <div class="form-group">
          <label>Dari Tanggal</label>
          <input 
            type="date" 
            v-model="filters.startDate"
            @change="loadSessions"
          >
        </div>
        <div class="form-group">
          <label>Sampai Tanggal</label>
          <input 
            type="date" 
            v-model="filters.endDate"
            @change="loadSessions"
          >
        </div>
      </div>
      
      <div class="filter-group">
        <div class="form-group">
          <label>Tipe Konseling</label>
          <select v-model="filters.type" @change="loadSessions">
            <option value="">Semua Tipe</option>
            <option value="ACADEMIC">Akademik</option>
            <option value="BEHAVIORAL">Perilaku</option>
            <option value="CAREER">Karir</option>
            <option value="PERSONAL">Pribadi</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="filters.status" @change="loadSessions">
            <option value="">Semua Status</option>
            <option value="SCHEDULED">Terjadwal</option>
            <option value="IN_PROGRESS">Sedang Berlangsung</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section" v-if="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalSessions }}</div>
        <div class="stat-label">Total Sesi</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.completedSessions }}</div>
        <div class="stat-label">Sesi Selesai</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.uniqueStudents }}</div>
        <div class="stat-label">Siswa Terlayani</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.followUpsNeeded }}</div>
        <div class="stat-label">Perlu Tindak Lanjut</div>
      </div>
    </div>

    <!-- Session List -->
    <div class="session-list" v-if="!loading">
      <div v-for="session in sessions" :key="session.id" class="session-card">
        <div class="session-header">
          <div class="session-meta">
            <span class="date">{{ formatDate(session.date) }}</span>
            <span :class="['status', session.status.toLowerCase()]">
              {{ getStatusLabel(session.status) }}
            </span>
          </div>
          <div class="session-actions">
            <button @click="editSession(session)" class="btn-icon">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteSession(session.id)" class="btn-icon btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="student-info">
          <h3>{{ session.student.name }}</h3>
          <span class="class">{{ session.student.class }}</span>
        </div>

        <div class="session-content">
          <div class="session-type">
            <span class="label">Tipe:</span>
            <span class="value">{{ getTypeLabel(session.type) }}</span>
          </div>
          
          <div class="session-issue">
            <h4>Permasalahan:</h4>
            <p>{{ session.issue }}</p>
          </div>

          <div class="session-notes" v-if="session.notes">
            <h4>Catatan:</h4>
            <p>{{ session.notes }}</p>
          </div>

          <div class="session-recommendations" v-if="session.recommendations">
            <h4>Rekomendasi:</h4>
            <p>{{ session.recommendations }}</p>
          </div>

          <div class="follow-up" v-if="session.followUpDate">
            <h4>Tindak Lanjut:</h4>
            <p>{{ formatDate(session.followUpDate) }}</p>
          </div>

          <div class="attachments" v-if="session.attachments">
            <h4>Lampiran:</h4>
            <div class="attachment-list">
              <a 
                v-for="(attachment, index) in parseAttachments(session.attachments)"
                :key="index"
                :href="attachment.url"
                target="_blank"
                class="attachment-item"
              >
                <i class="fas fa-paperclip"></i>
                {{ attachment.name }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="sessions.length === 0" class="empty-state">
        <i class="fas fa-user-friends"></i>
        <p>Belum ada sesi konseling</p>
      </div>
    </div>

    <div v-else class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat sesi konseling...</p>
    </div>

    <!-- Create/Edit Modal -->
    <modal v-if="showCreateModal" @close="closeModal">
      <template #header>
        <h2>{{ editingSession ? 'Edit Sesi Konseling' : 'Sesi Konseling Baru' }}</h2>
      </template>

      <template #body>
        <form @submit.prevent="saveSession" class="session-form">
          <div class="form-group">
            <label for="student">Siswa</label>
            <div class="student-search">
              <input
                type="text"
                v-model="studentSearch"
                @input="searchStudents"
                placeholder="Cari siswa..."
                :disabled="!!editingSession"
              >
              <div v-if="searchResults.length > 0" class="search-results">
                <div
                  v-for="student in searchResults"
                  :key="student.id"
                  @click="selectStudent(student)"
                  class="search-result-item"
                >
                  {{ student.name }} - {{ student.class }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="date">Tanggal</label>
            <input
              id="date"
              v-model="sessionForm.date"
              type="datetime-local"
              required
              :max="maxDateTime"
            >
          </div>

          <div class="form-group">
            <label for="type">Tipe Konseling</label>
            <select
              id="type"
              v-model="sessionForm.type"
              required
            >
              <option value="">Pilih Tipe</option>
              <option value="ACADEMIC">Akademik</option>
              <option value="BEHAVIORAL">Perilaku</option>
              <option value="CAREER">Karir</option>
              <option value="PERSONAL">Pribadi</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div class="form-group">
            <label for="issue">Permasalahan</label>
            <textarea
              id="issue"
              v-model="sessionForm.issue"
              required
              placeholder="Jelaskan permasalahan yang dihadapi"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Catatan</label>
            <textarea
              id="notes"
              v-model="sessionForm.notes"
              placeholder="Catatan selama sesi konseling"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="recommendations">Rekomendasi</label>
            <textarea
              id="recommendations"
              v-model="sessionForm.recommendations"
              placeholder="Rekomendasi untuk mengatasi permasalahan"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="followUpDate">Tanggal Tindak Lanjut</label>
            <input
              id="followUpDate"
              v-model="sessionForm.followUpDate"
              type="date"
              :min="sessionForm.date?.split('T')[0]"
            >
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select
              id="status"
              v-model="sessionForm.status"
              required
            >
              <option value="SCHEDULED">Terjadwal</option>
              <option value="IN_PROGRESS">Sedang Berlangsung</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div class="form-group">
            <label>Lampiran</label>
            <div class="file-upload">
              <input
                type="file"
                ref="fileInput"
                multiple
                @change="handleFileSelect"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              >
              <p class="file-help">Format yang didukung: PDF, Word, JPG, PNG</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Batal
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ editingSession ? 'Simpan Perubahan' : 'Buat Sesi' }}
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCounselingStore } from '@/stores/counseling'
import Modal from '@/components/Modal.vue'
import { formatDate } from '@/utils/date'
import debounce from 'lodash/debounce'

const counselingStore = useCounselingStore()
const showCreateModal = ref(false)
const editingSession = ref(null)
const selectedFiles = ref<File[]>([])
const studentSearch = ref('')
const searchResults = ref([])

const filters = ref({
  startDate: '',
  endDate: '',
  type: '',
  status: ''
})

const sessionForm = ref({
  studentId: '',
  date: '',
  type: '',
  issue: '',
  notes: '',
  recommendations: '',
  followUpDate: '',
  status: 'SCHEDULED'
})

const stats = ref(null)
const maxDateTime = new Date().toISOString().slice(0, 16)

// Load data
const loadSessions = async () => {
  await counselingStore.fetchSessions(filters.value)
}

const loadStats = async () => {
  const currentDate = new Date()
  stats.value = await counselingStore.getCounselingStats(
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  )
}

onMounted(async () => {
  await Promise.all([
    loadSessions(),
    loadStats()
  ])
})

// Computed
const sessions = computed(() => counselingStore.sessions)
const loading = computed(() => counselingStore.loading)

// Methods
const searchStudents = debounce(async () => {
  if (studentSearch.value.length >= 3) {
    searchResults.value = await counselingStore.searchStudents(studentSearch.value)
  } else {
    searchResults.value = []
  }
}, 300)

const selectStudent = (student) => {
  sessionForm.value.studentId = student.id
  studentSearch.value = student.name
  searchResults.value = []
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    selectedFiles.value = Array.from(files)
  }
}

const parseAttachments = (attachments: string) => {
  try {
    return JSON.parse(attachments)
  } catch {
    return []
  }
}

const getStatusLabel = (status: string) => {
  const labels = {
    SCHEDULED: 'Terjadwal',
    IN_PROGRESS: 'Sedang Berlangsung',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan'
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels = {
    ACADEMIC: 'Akademik',
    BEHAVIORAL: 'Perilaku',
    CAREER: 'Karir',
    PERSONAL: 'Pribadi',
    OTHER: 'Lainnya'
  }
  return labels[type] || type
}

const saveSession = async () => {
  try {
    let response
    if (editingSession.value) {
      response = await counselingStore.updateSession(
        editingSession.value.id,
        sessionForm.value
      )
    } else {
      response = await counselingStore.createSession(sessionForm.value)
    }

    if (selectedFiles.value.length > 0) {
      await counselingStore.uploadAttachments(response.id, selectedFiles.value)
    }

    closeModal()
    await loadSessions()
  } catch (error) {
    console.error('Failed to save session:', error)
  }
}

const editSession = (session) => {
  editingSession.value = session
  sessionForm.value = {
    studentId: session.studentId,
    date: session.date,
    type: session.type,
    issue: session.issue,
    notes: session.notes || '',
    recommendations: session.recommendations || '',
    followUpDate: session.followUpDate || '',
    status: session.status
  }
  studentSearch.value = session.student.name
  showCreateModal.value = true
}

const deleteSession = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus sesi konseling ini?')) {
    try {
      await counselingStore.deleteSession(id)
      await loadSessions()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSession.value = null
  selectedFiles.value = []
  studentSearch.value = ''
  sessionForm.value = {
    studentId: '',
    date: '',
    type: '',
    issue: '',
    notes: '',
    recommendations: '',
    followUpDate: '',
    status: 'SCHEDULED'
  }
}
</script>

<style scoped>
.counseling-session {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filter-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date-range {
  display: flex;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: #4CAF50;
}

.stat-label {
  color: #666;
  margin-top: 0.5rem;
}

.session-list {
  display: grid;
  gap: 1.5rem;
}

.session-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status.scheduled {
  background: #e3f2fd;
  color: #1976d2;
}

.status.in_progress {
  background: #fff3e0;
  color: #f57c00;
}

.status.completed {
  background: #e8f5e9;
  color: #388e3c;
}

.status.cancelled {
  background: #ffebee;
  color: #d32f2f;
}

.student-info {
  margin-bottom: 1rem;
}

.student-info h3 {
  margin: 0;
  color: #333;
}

.class {
  color: #666;
  font-size: 0.875rem;
}

.session-content {
  display: grid;
  gap: 1rem;
}

.session-type {
  display: flex;
  gap: 0.5rem;
}

.label {
  color: #666;
}

.value {
  font-weight: 500;
}

.session-issue h4,
.session-notes h4,
.session-recommendations h4,
.follow-up h4,
.attachments h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
}

.attachment-item:hover {
  background: #e9ecef;
}

.student-search {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.search-result-item {
  padding: 0.5rem;
  cursor: pointer;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.file-upload {
  border: 2px dashed #ddd;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.file-help {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-icon {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
}

.btn-icon.btn-danger {
  color: #dc3545;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>
