<template>
  <div class="extracurricular-page">
    <header class="page-header">
      <h1>Ekstrakurikuler</h1>
    </header>

    <!-- My Extracurriculars -->
    <section class="my-extracurriculars">
      <h2>Ekstrakurikuler Saya</h2>
      <div class="extracurricular-grid" v-if="!loading && myMemberships.length > 0">
        <div 
          v-for="membership in myMemberships" 
          :key="membership.id" 
          class="extracurricular-card"
        >
          <div class="card-header">
            <h3>{{ membership.extracurricular.name }}</h3>
            <span :class="['status', membership.status.toLowerCase()]">
              {{ getStatusLabel(membership.status) }}
            </span>
          </div>

          <div class="card-content">
            <p>{{ membership.extracurricular.description }}</p>
            <div class="schedule">
              <i class="fas fa-calendar"></i>
              <span>{{ membership.extracurricular.schedule }}</span>
            </div>
            <div class="location">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ membership.extracurricular.location }}</span>
            </div>
          </div>

          <div class="achievements" v-if="membership.achievements">
            <h4>Prestasi</h4>
            <ul>
              <li v-for="(achievement, index) in parseAchievements(membership.achievements)" 
                  :key="index">
                {{ achievement }}
              </li>
            </ul>
          </div>

          <div class="card-actions">
            <button 
              @click="addAchievement(membership)" 
              class="btn-secondary"
            >
              <i class="fas fa-trophy"></i> Tambah Prestasi
            </button>
            <button 
              @click="leaveExtracurricular(membership.id)"
              class="btn-danger"
            >
              <i class="fas fa-sign-out-alt"></i> Keluar
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-running"></i>
        <p>Anda belum bergabung dengan ekstrakurikuler apapun</p>
        <button @click="showAvailableExtracurriculars = true" class="btn-primary">
          Jelajahi Ekstrakurikuler
        </button>
      </div>
    </section>

    <!-- Available Extracurriculars -->
    <section class="available-extracurriculars" v-if="showAvailableExtracurriculars">
      <h2>Ekstrakurikuler Tersedia</h2>
      <div class="extracurricular-grid">
        <div 
          v-for="extracurricular in availableExtracurriculars" 
          :key="extracurricular.id"
          class="extracurricular-card"
        >
          <div class="card-header">
            <h3>{{ extracurricular.name }}</h3>
          </div>

          <div class="card-content">
            <p>{{ extracurricular.description }}</p>
            <div class="schedule">
              <i class="fas fa-calendar"></i>
              <span>{{ extracurricular.schedule }}</span>
            </div>
            <div class="location">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ extracurricular.location }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button 
              @click="joinExtracurricular(extracurricular.id)"
              class="btn-primary"
              :disabled="isAlreadyJoined(extracurricular.id)"
            >
              <i class="fas fa-plus"></i> 
              {{ isAlreadyJoined(extracurricular.id) ? 'Sudah Bergabung' : 'Gabung' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievement Modal -->
    <modal v-if="showAchievementModal" @close="showAchievementModal = false">
      <template #header>
        <h2>Tambah Prestasi</h2>
      </template>

      <template #body>
        <form @submit.prevent="submitAchievement" class="achievement-form">
          <div class="form-group">
            <label for="achievement">Prestasi</label>
            <input
              id="achievement"
              v-model="achievementForm.achievement"
              type="text"
              required
              placeholder="Contoh: Juara 1 Lomba Basket Antar Sekolah"
            >
          </div>

          <div class="form-actions">
            <button type="button" @click="showAchievementModal = false" class="btn-secondary">
              Batal
            </button>
            <button type="submit" class="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useExtracurricularStore } from '@/stores/extracurricular'
import Modal from '@/components/Modal.vue'

const extracurricularStore = useExtracurricularStore()
const showAvailableExtracurriculars = ref(false)
const showAchievementModal = ref(false)
const selectedMembership = ref(null)
const loading = ref(false)

const achievementForm = ref({
  achievement: ''
})

// Load data on mount
onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([
      extracurricularStore.getExtracurriculars(),
      extracurricularStore.getUserMemberships()
    ])
  } catch (error) {
    console.error('Failed to load extracurriculars:', error)
  } finally {
    loading.value = false
  }
})

// Computed properties
const myMemberships = computed(() => extracurricularStore.memberships)
const availableExtracurriculars = computed(() => 
  extracurricularStore.extracurriculars.filter(
    extracurricular => !isAlreadyJoined(extracurricular.id)
  )
)

// Helper functions
const isAlreadyJoined = (extracurricularId: string) => {
  return myMemberships.value.some(
    membership => membership.extracurricularId === extracurricularId
  )
}

const getStatusLabel = (status: string) => {
  const labels = {
    'ACTIVE': 'Aktif',
    'INACTIVE': 'Tidak Aktif'
  }
  return labels[status] || status
}

const parseAchievements = (achievements: string) => {
  try {
    return achievements.split('|').filter(Boolean)
  } catch {
    return []
  }
}

// Actions
const joinExtracurricular = async (extracurricularId: string) => {
  try {
    await extracurricularStore.joinExtracurricular(extracurricularId)
    showAvailableExtracurriculars.value = false
  } catch (error) {
    console.error('Failed to join extracurricular:', error)
  }
}

const leaveExtracurricular = async (membershipId: string) => {
  if (confirm('Apakah Anda yakin ingin keluar dari ekstrakurikuler ini?')) {
    try {
      await extracurricularStore.leaveExtracurricular(membershipId)
    } catch (error) {
      console.error('Failed to leave extracurricular:', error)
    }
  }
}

const addAchievement = (membership) => {
  selectedMembership.value = membership
  showAchievementModal.value = true
}

const submitAchievement = async () => {
  if (!selectedMembership.value) return

  try {
    await extracurricularStore.addAchievement(
      selectedMembership.value.id,
      achievementForm.value.achievement
    )
    showAchievementModal.value = false
    achievementForm.value.achievement = ''
    selectedMembership.value = null
  } catch (error) {
    console.error('Failed to add achievement:', error)
  }
}
</script>

<style scoped>
.extracurricular-page {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.extracurricular-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.extracurricular-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
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

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.card-content {
  margin-bottom: 1rem;
}

.schedule,
.location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  margin-top: 0.5rem;
}

.achievements {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.achievements h4 {
  margin: 0 0 0.5rem 0;
}

.achievements ul {
  margin: 0;
  padding-left: 1.5rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.achievement-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group input {
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
</style>
