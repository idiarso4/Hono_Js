<template>
  <div class="prayer-page">
    <header class="page-header">
      <h1>Presensi Sholat</h1>
      <div class="date-selector">
        <button @click="previousDay">
          <i class="fas fa-chevron-left"></i>
        </button>
        <input type="date" v-model="selectedDate">
        <button @click="nextDay">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </header>

    <div class="prayer-schedule" v-if="!loading">
      <div 
        v-for="prayer in prayers" 
        :key="prayer.prayerTime"
        class="prayer-card"
        :class="getPrayerStatus(prayer)"
      >
        <div class="prayer-info">
          <h3>{{ getPrayerLabel(prayer.prayerTime) }}</h3>
          <p>{{ prayer.time }}</p>
        </div>

        <div class="prayer-status">
          <span v-if="isPrayerTime(prayer)" class="active-prayer">
            Waktu Sholat
          </span>
          <span v-else-if="isPrayerPassed(prayer)" class="passed-prayer">
            Waktu Telah Lewat
          </span>
          <span v-else class="upcoming-prayer">
            {{ getTimeUntilPrayer(prayer) }}
          </span>
        </div>

        <div class="prayer-actions">
          <button 
            @click="recordPrayer(prayer, 'PRESENT')"
            class="btn-primary"
            :disabled="!isPrayerTime(prayer) || prayer.status"
          >
            <i class="fas fa-check"></i> Hadir
          </button>
          <button 
            @click="recordPrayer(prayer, 'ABSENT')"
            class="btn-danger"
            :disabled="!isPrayerTime(prayer) || prayer.status"
          >
            <i class="fas fa-times"></i> Tidak Hadir
          </button>
        </div>

        <div class="prayer-location" v-if="prayer.status === 'PRESENT'">
          <i class="fas fa-mosque"></i>
          <span>{{ prayer.location || 'Lokasi tidak tercatat' }}</span>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat jadwal sholat...</p>
    </div>

    <!-- Prayer Statistics -->
    <div class="prayer-stats">
      <h2>Statistik Bulan Ini</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalPresent }}</div>
          <div class="stat-label">Kehadiran</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalAbsent }}</div>
          <div class="stat-label">Ketidakhadiran</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.attendancePercentage }}%</div>
          <div class="stat-label">Persentase</div>
        </div>
      </div>
    </div>

    <!-- Prayer History -->
    <div class="prayer-history">
      <h2>Riwayat Kehadiran</h2>
      <div class="history-calendar">
        <!-- Calendar implementation here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePrayerStore } from '@/stores/prayer'
import dayjs from 'dayjs'

const prayerStore = usePrayerStore()
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const loading = ref(false)
const prayers = ref([])
const stats = ref({
  totalPresent: 0,
  totalAbsent: 0,
  attendancePercentage: 0
})

// Prayer times for the day
const loadPrayerSchedule = async () => {
  try {
    loading.value = true
    const schedule = await prayerStore.getPrayerSchedule(selectedDate.value)
    prayers.value = schedule
  } catch (error) {
    console.error('Failed to load prayer schedule:', error)
  } finally {
    loading.value = false
  }
}

// Load statistics
const loadStats = async () => {
  try {
    const currentMonth = dayjs().month() + 1
    const currentYear = dayjs().year()
    const monthStats = await prayerStore.getPrayerStats(currentMonth, currentYear)
    stats.value = monthStats
  } catch (error) {
    console.error('Failed to load prayer stats:', error)
  }
}

// Navigation
const previousDay = () => {
  selectedDate.value = dayjs(selectedDate.value).subtract(1, 'day').format('YYYY-MM-DD')
  loadPrayerSchedule()
}

const nextDay = () => {
  selectedDate.value = dayjs(selectedDate.value).add(1, 'day').format('YYYY-MM-DD')
  loadPrayerSchedule()
}

// Prayer status helpers
const isPrayerTime = (prayer) => {
  const now = dayjs()
  const prayerTime = dayjs(prayer.time)
  const nextPrayer = getNextPrayerTime(prayer.prayerTime)
  return now.isAfter(prayerTime) && now.isBefore(nextPrayer)
}

const isPrayerPassed = (prayer) => {
  return dayjs().isAfter(dayjs(prayer.time))
}

const getTimeUntilPrayer = (prayer) => {
  const now = dayjs()
  const prayerTime = dayjs(prayer.time)
  const duration = dayjs.duration(prayerTime.diff(now))
  
  if (duration.asHours() >= 1) {
    return `${Math.floor(duration.asHours())} jam ${duration.minutes()} menit`
  }
  return `${duration.minutes()} menit`
}

const getNextPrayerTime = (currentPrayer) => {
  const prayerTimes = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA']
  const currentIndex = prayerTimes.indexOf(currentPrayer)
  const nextPrayer = prayers.value[currentIndex + 1]
  return nextPrayer ? dayjs(nextPrayer.time) : dayjs().add(1, 'day')
}

// Record prayer attendance
const recordPrayer = async (prayer, status) => {
  try {
    await prayerStore.recordPrayer({
      date: selectedDate.value,
      prayerTime: prayer.prayerTime,
      status,
      location: 'Masjid Sekolah' // This could be dynamic based on geolocation
    })
    loadPrayerSchedule()
    loadStats()
  } catch (error) {
    console.error('Failed to record prayer:', error)
  }
}

// Prayer label mapping
const getPrayerLabel = (prayerTime: string) => {
  const labels = {
    'FAJR': 'Subuh',
    'DHUHR': 'Dzuhur',
    'ASR': 'Ashar',
    'MAGHRIB': 'Maghrib',
    'ISHA': 'Isya'
  }
  return labels[prayerTime] || prayerTime
}

// Prayer status class
const getPrayerStatus = (prayer) => {
  if (prayer.status === 'PRESENT') return 'prayer-present'
  if (prayer.status === 'ABSENT') return 'prayer-absent'
  if (isPrayerTime(prayer)) return 'prayer-active'
  if (isPrayerPassed(prayer)) return 'prayer-passed'
  return 'prayer-upcoming'
}

onMounted(() => {
  loadPrayerSchedule()
  loadStats()
})
</script>

<style scoped>
.prayer-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-selector button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
}

.prayer-schedule {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.prayer-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.prayer-info {
  margin-bottom: 1rem;
}

.prayer-info h3 {
  margin: 0;
  color: #333;
}

.prayer-info p {
  margin: 0.5rem 0 0;
  color: #666;
}

.prayer-status {
  margin-bottom: 1rem;
}

.active-prayer {
  color: #4CAF50;
  font-weight: 500;
}

.passed-prayer {
  color: #999;
}

.upcoming-prayer {
  color: #2196F3;
}

.prayer-actions {
  display: flex;
  gap: 1rem;
}

.prayer-location {
  margin-top: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prayer-stats {
  margin-top: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
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

.prayer-history {
  margin-top: 3rem;
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

.btn-danger {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

/* Prayer card status styles */
.prayer-present {
  border-left: 4px solid #4CAF50;
}

.prayer-absent {
  border-left: 4px solid #dc3545;
}

.prayer-active {
  border-left: 4px solid #2196F3;
}

.prayer-passed {
  border-left: 4px solid #999;
}

.prayer-upcoming {
  border-left: 4px solid #FFC107;
}
</style>
