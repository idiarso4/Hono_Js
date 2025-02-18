<template>
  <div class="pkl-journal">
    <header class="page-header">
      <h1>Jurnal PKL</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        <i class="fas fa-plus"></i> Tambah Jurnal
      </button>
    </header>

    <!-- Filter and Search -->
    <div class="filter-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari jurnal..."
          @input="filterJournals"
        >
      </div>
      <div class="date-filter">
        <input 
          v-model="dateFilter" 
          type="date" 
          @change="filterJournals"
        >
      </div>
      <div class="status-filter">
        <select v-model="statusFilter" @change="filterJournals">
          <option value="">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED">Disetujui</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>
    </div>

    <!-- Journal List -->
    <div class="journal-list" v-if="!loading">
      <div v-for="journal in filteredJournals" :key="journal.id" class="journal-card">
        <div class="journal-header">
          <span class="date">{{ formatDate(journal.date) }}</span>
          <span :class="['status', journal.status.toLowerCase()]">
            {{ getStatusLabel(journal.status) }}
          </span>
        </div>
        
        <div class="journal-content">
          <h3>{{ journal.activity }}</h3>
          <p>{{ journal.description }}</p>
        </div>

        <div class="journal-media" v-if="journal.documentation">
          <img :src="journal.documentation" alt="Dokumentasi kegiatan">
        </div>

        <div class="journal-feedback" v-if="journal.feedback">
          <p><strong>Feedback:</strong> {{ journal.feedback }}</p>
        </div>

        <div class="journal-actions">
          <button @click="editJournal(journal)" class="btn-secondary">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button 
            v-if="!journal.documentation" 
            @click="uploadImage(journal)" 
            class="btn-secondary"
          >
            <i class="fas fa-image"></i> Upload Foto
          </button>
          <button 
            @click="deleteJournal(journal.id)" 
            class="btn-danger"
            v-if="journal.status === 'PENDING'"
          >
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>

      <div v-if="filteredJournals.length === 0" class="empty-state">
        <i class="fas fa-book"></i>
        <p>Belum ada jurnal PKL</p>
      </div>
    </div>

    <div v-else class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat jurnal...</p>
    </div>

    <!-- Create/Edit Modal -->
    <modal v-if="showCreateModal" @close="showCreateModal = false">
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
            <label for="activity">Kegiatan</label>
            <input
              id="activity"
              v-model="journalForm.activity"
              type="text"
              required
              placeholder="Nama kegiatan"
            >
          </div>

          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea
              id="description"
              v-model="journalForm.description"
              required
              placeholder="Jelaskan kegiatan yang dilakukan"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              Batal
            </button>
            <button type="submit" class="btn-primary">
              {{ editingJournal ? 'Simpan Perubahan' : 'Tambah Jurnal' }}
            </button>
          </div>
        </form>
      </template>
    </modal>

    <!-- Image Upload Modal -->
    <modal v-if="showUploadModal" @close="showUploadModal = false">
      <template #header>
        <h2>Upload Dokumentasi</h2>
      </template>

      <template #body>
        <div class="upload-form">
          <div class="preview" v-if="imagePreview">
            <img :src="imagePreview" alt="Preview">
          </div>

          <div class="upload-actions">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              class="hidden"
            >
            <button @click="$refs.fileInput.click()" class="btn-secondary">
              Pilih Foto
            </button>
            <button 
              @click="uploadDocumentation" 
              class="btn-primary"
              :disabled="!selectedFile"
            >
              Upload
            </button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePklStore } from '@/stores/pkl'
import Modal from '@/components/Modal.vue'
import { formatDate } from '@/utils/date'

const pklStore = usePklStore()
const showCreateModal = ref(false)
const showUploadModal = ref(false)
const editingJournal = ref(null)
const selectedFile = ref(null)
const imagePreview = ref('')
const searchQuery = ref('')
const dateFilter = ref('')
const statusFilter = ref('')

const journalForm = ref({
  date: '',
  activity: '',
  description: ''
})

const today = new Date().toISOString().split('T')[0]

// Load journals on component mount
onMounted(async () => {
  await pklStore.fetchJournals()
})

// Computed property for filtered journals
const filteredJournals = computed(() => {
  let filtered = [...pklStore.journals]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(journal => 
      journal.activity.toLowerCase().includes(query) ||
      journal.description.toLowerCase().includes(query)
    )
  }

  if (dateFilter.value) {
    filtered = filtered.filter(journal => 
      journal.date.startsWith(dateFilter.value)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(journal => 
      journal.status === statusFilter.value
    )
  }

  return filtered.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

// Handle file selection
const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = e => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Save journal
const saveJournal = async () => {
  try {
    if (editingJournal.value) {
      await pklStore.updateJournal(editingJournal.value.id, journalForm.value)
    } else {
      await pklStore.createJournal(journalForm.value)
    }
    showCreateModal.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to save journal:', error)
  }
}

// Upload documentation
const uploadDocumentation = async () => {
  if (!selectedFile.value) return

  try {
    await pklStore.uploadDocumentation(editingJournal.value.id, selectedFile.value)
    showUploadModal.value = false
    selectedFile.value = null
    imagePreview.value = ''
  } catch (error) {
    console.error('Failed to upload documentation:', error)
  }
}

// Edit journal
const editJournal = (journal) => {
  editingJournal.value = journal
  journalForm.value = {
    date: journal.date,
    activity: journal.activity,
    description: journal.description
  }
  showCreateModal.value = true
}

// Delete journal
const deleteJournal = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
    try {
      await pklStore.deleteJournal(id)
    } catch (error) {
      console.error('Failed to delete journal:', error)
    }
  }
}

// Upload image
const uploadImage = (journal) => {
  editingJournal.value = journal
  showUploadModal.value = true
}

// Reset form
const resetForm = () => {
  journalForm.value = {
    date: '',
    activity: '',
    description: ''
  }
  editingJournal.value = null
}

// Get status label
const getStatusLabel = (status: string) => {
  const labels = {
    'PENDING': 'Menunggu',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak'
  }
  return labels[status] || status
}
</script>

<style scoped>
.pkl-journal {
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
  gap: 1rem;
  margin-bottom: 2rem;
}

.journal-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  align-items: center;
  margin-bottom: 1rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.approved {
  background: #d4edda;
  color: #155724;
}

.status.rejected {
  background: #f8d7da;
  color: #721c24;
}

.journal-content {
  margin-bottom: 1rem;
}

.journal-media img {
  width: 100%;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.journal-actions {
  display: flex;
  gap: 0.5rem;
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

.btn-danger {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.journal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview img {
  max-width: 100%;
  border-radius: 4px;
}

.hidden {
  display: none;
}
</style>
