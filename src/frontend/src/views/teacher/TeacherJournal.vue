<template>
  <div class="teacher-journal">
    <header class="page-header">
      <h1>Jurnal Mengajar</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        <i class="fas fa-plus"></i> Tambah Jurnal
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
            @change="loadJournals"
          >
        </div>
        <div class="form-group">
          <label>Sampai Tanggal</label>
          <input 
            type="date" 
            v-model="filters.endDate"
            @change="loadJournals"
          >
        </div>
      </div>
      <div class="subject-filter">
        <label>Mata Pelajaran</label>
        <select v-model="filters.subjectId" @change="loadJournals">
          <option value="">Semua Mata Pelajaran</option>
          <option 
            v-for="subject in subjects" 
            :key="subject.id" 
            :value="subject.id"
          >
            {{ subject.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section" v-if="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalClasses }}</div>
        <div class="stat-label">Total Kelas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalHours }}</div>
        <div class="stat-label">Total Jam</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalStudents }}</div>
        <div class="stat-label">Total Siswa</div>
      </div>
    </div>

    <!-- Journal List -->
    <div class="journal-list" v-if="!loading">
      <div v-for="journal in journals" :key="journal.id" class="journal-card">
        <div class="journal-header">
          <div class="journal-meta">
            <span class="date">{{ formatDate(journal.date) }}</span>
            <span class="subject">{{ journal.subject.name }}</span>
          </div>
          <div class="journal-actions">
            <button @click="editJournal(journal)" class="btn-icon">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteJournal(journal.id)" class="btn-icon btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="journal-content">
          <h3>{{ journal.topic }}</h3>
          <p>{{ journal.description }}</p>
        </div>

        <div class="journal-materials" v-if="journal.materials">
          <h4>Materi Pembelajaran</h4>
          <div class="material-list">
            <a 
              v-for="(material, index) in parseMaterials(journal.materials)"
              :key="index"
              :href="material.url"
              target="_blank"
              class="material-item"
            >
              <i class="fas fa-file"></i>
              {{ material.name }}
            </a>
          </div>
        </div>

        <div class="journal-notes" v-if="journal.notes">
          <h4>Catatan</h4>
          <p>{{ journal.notes }}</p>
        </div>
      </div>

      <div v-if="journals.length === 0" class="empty-state">
        <i class="fas fa-book"></i>
        <p>Belum ada jurnal mengajar</p>
      </div>
    </div>

    <div v-else class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat jurnal...</p>
    </div>

    <!-- Create/Edit Modal -->
    <modal v-if="showCreateModal" @close="closeModal">
      <template #header>
        <h2>{{ editingJournal ? 'Edit Jurnal' : 'Tambah Jurnal' }}</h2>
      </template>

      <template #body>
        <form @submit.prevent="saveJournal" class="journal-form">
          <div class="form-group">
            <label for="date">Tanggal</label>
            <input
              id="date"
              v-model="journalForm.date"
              type="date"
              required
              :max="today"
            >
          </div>

          <div class="form-group">
            <label for="subject">Mata Pelajaran</label>
            <select
              id="subject"
              v-model="journalForm.subjectId"
              required
            >
              <option value="">Pilih Mata Pelajaran</option>
              <option 
                v-for="subject in subjects" 
                :key="subject.id" 
                :value="subject.id"
              >
                {{ subject.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="topic">Topik</label>
            <input
              id="topic"
              v-model="journalForm.topic"
              type="text"
              required
              placeholder="Topik pembelajaran"
            >
          </div>

          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea
              id="description"
              v-model="journalForm.description"
              required
              placeholder="Jelaskan kegiatan pembelajaran"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Catatan (Opsional)</label>
            <textarea
              id="notes"
              v-model="journalForm.notes"
              placeholder="Catatan tambahan"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Materi Pembelajaran</label>
            <div class="file-upload">
              <input
                type="file"
                ref="fileInput"
                multiple
                @change="handleFileSelect"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              >
              <p class="file-help">Format yang didukung: PDF, Word, PowerPoint</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Batal
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ editingJournal ? 'Simpan Perubahan' : 'Tambah Jurnal' }}
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTeacherJournalStore } from '@/stores/teacherJournal'
import Modal from '@/components/Modal.vue'
import { formatDate } from '@/utils/date'

const teacherJournalStore = useTeacherJournalStore()
const showCreateModal = ref(false)
const editingJournal = ref(null)
const selectedFiles = ref<File[]>([])

const filters = ref({
  startDate: '',
  endDate: '',
  subjectId: ''
})

const journalForm = ref({
  date: '',
  subjectId: '',
  topic: '',
  description: '',
  notes: ''
})

const subjects = ref([
  { id: '1', name: 'Matematika' },
  { id: '2', name: 'Bahasa Indonesia' },
  { id: '3', name: 'Bahasa Inggris' },
  // Add more subjects as needed
])

const stats = ref(null)
const today = new Date().toISOString().split('T')[0]

// Load data
const loadJournals = async () => {
  await teacherJournalStore.fetchJournals(filters.value)
}

const loadStats = async () => {
  const currentDate = new Date()
  stats.value = await teacherJournalStore.getJournalStats(
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  )
}

onMounted(async () => {
  await Promise.all([
    loadJournals(),
    loadStats()
  ])
})

// Computed
const journals = computed(() => teacherJournalStore.journals)
const loading = computed(() => teacherJournalStore.loading)

// Methods
const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    selectedFiles.value = Array.from(files)
  }
}

const parseMaterials = (materials: string) => {
  try {
    return JSON.parse(materials)
  } catch {
    return []
  }
}

const saveJournal = async () => {
  try {
    let response
    if (editingJournal.value) {
      response = await teacherJournalStore.updateJournal(
        editingJournal.value.id,
        journalForm.value
      )
    } else {
      response = await teacherJournalStore.createJournal(journalForm.value)
    }

    if (selectedFiles.value.length > 0) {
      await teacherJournalStore.uploadMaterials(response.id, selectedFiles.value)
    }

    closeModal()
    await loadJournals()
  } catch (error) {
    console.error('Failed to save journal:', error)
  }
}

const editJournal = (journal) => {
  editingJournal.value = journal
  journalForm.value = {
    date: journal.date,
    subjectId: journal.subjectId,
    topic: journal.topic,
    description: journal.description,
    notes: journal.notes || ''
  }
  showCreateModal.value = true
}

const deleteJournal = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
    try {
      await teacherJournalStore.deleteJournal(id)
      await loadJournals()
    } catch (error) {
      console.error('Failed to delete journal:', error)
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingJournal.value = null
  selectedFiles.value = []
  journalForm.value = {
    date: '',
    subjectId: '',
    topic: '',
    description: '',
    notes: ''
  }
}
</script>

<style scoped>
.teacher-journal {
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

.journal-list {
  display: grid;
  gap: 1.5rem;
}

.journal-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.journal-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date {
  color: #666;
  font-size: 0.875rem;
}

.subject {
  font-weight: 500;
  color: #4CAF50;
}

.journal-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.journal-materials,
.journal-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.material-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
}

.material-item:hover {
  background: #e9ecef;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
