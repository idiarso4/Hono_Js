<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Damage Report Management</h1>
      <p class="text-gray-600">Track and manage equipment and facility damage reports</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div v-for="stat in stats" :key="stat.label" 
           class="bg-white rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500">{{ stat.label }}</div>
        <div class="mt-1 text-2xl font-semibold" :class="stat.colorClass">
          {{ stat.value }}
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Search Item</label>
          <input
            v-model="filters.search"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search by item name or code"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Priority</label>
          <select
            v-model="filters.priority"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select
            v-model="filters.status"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="REPORTED">Reported</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Location</label>
          <input
            v-model="filters.location"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Filter by location"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6">
      <button
        @click="openNewReportModal"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Report New Damage
      </button>
    </div>

    <!-- Reports Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="report in filteredReports" :key="report.id">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ report.itemName }}</div>
              <div class="text-sm text-gray-500">{{ report.itemCode }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ report.location }}
            </td>
            <td class="px-6 py-4">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': report.priority === 'LOW',
                  'bg-yellow-100 text-yellow-800': report.priority === 'MEDIUM',
                  'bg-orange-100 text-orange-800': report.priority === 'HIGH',
                  'bg-red-100 text-red-800': report.priority === 'CRITICAL'
                }"
              >
                {{ report.priority }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getStatusClass(report.status)"
              >
                {{ formatStatus(report.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ report.reportedBy.name }}
            </td>
            <td class="px-6 py-4 text-sm font-medium">
              <button
                @click="viewDetails(report)"
                class="text-indigo-600 hover:text-indigo-900 mr-2"
              >
                View
              </button>
              <button
                v-if="canEdit(report)"
                @click="editReport(report)"
                class="text-green-600 hover:text-green-900"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New/Edit Report Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            {{ editingReport ? 'Edit Damage Report' : 'Report New Damage' }}
          </h3>
          <div class="mt-2">
            <form @submit.prevent="saveReport" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    v-model="reportForm.itemName"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Item Code</label>
                  <input
                    v-model="reportForm.itemCode"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Location</label>
                <input
                  v-model="reportForm.location"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="reportForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    v-model="reportForm.priority"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div v-if="editingReport">
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    v-model="reportForm.status"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Photos</label>
                <input
                  type="file"
                  @change="handleFileUpload"
                  multiple
                  accept="image/*"
                  class="mt-1 block w-full"
                />
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- View Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Damage Report Details
          </h3>
          <div class="mt-2 space-y-4">
            <div v-if="selectedReport" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm font-medium text-gray-500">Item Name</div>
                  <div class="mt-1">{{ selectedReport.itemName }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500">Item Code</div>
                  <div class="mt-1">{{ selectedReport.itemCode || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500">Location</div>
                  <div class="mt-1">{{ selectedReport.location }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500">Status</div>
                  <div class="mt-1">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusClass(selectedReport.status)"
                    >
                      {{ formatStatus(selectedReport.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div class="text-sm font-medium text-gray-500">Description</div>
                <div class="mt-1">{{ selectedReport.description }}</div>
              </div>

              <div v-if="selectedReport.repairNotes">
                <div class="text-sm font-medium text-gray-500">Repair Notes</div>
                <div class="mt-1">{{ selectedReport.repairNotes }}</div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div v-if="selectedReport.estimatedCost">
                  <div class="text-sm font-medium text-gray-500">Estimated Cost</div>
                  <div class="mt-1">${{ selectedReport.estimatedCost.toFixed(2) }}</div>
                </div>
                <div v-if="selectedReport.actualCost">
                  <div class="text-sm font-medium text-gray-500">Actual Cost</div>
                  <div class="mt-1">${{ selectedReport.actualCost.toFixed(2) }}</div>
                </div>
              </div>

              <div v-if="selectedReport.photos && selectedReport.photos.length > 0">
                <div class="text-sm font-medium text-gray-500 mb-2">Photos</div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div v-for="(photo, index) in selectedReport.photos" :key="index" class="relative">
                    <img :src="photo" alt="Damage photo" class="rounded-lg object-cover h-32 w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeDetailsModal"
                class="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDamageReportStore } from '@/stores/damageReport'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const damageReportStore = useDamageReportStore()
const { reports, loading } = storeToRefs(damageReportStore)

// State
const showModal = ref(false)
const showDetailsModal = ref(false)
const editingReport = ref(null)
const selectedReport = ref(null)
const filters = ref({
  search: '',
  priority: '',
  status: '',
  location: ''
})
const stats = ref([
  { label: 'Total Reports', value: 0, colorClass: 'text-blue-600' },
  { label: 'Critical Issues', value: 0, colorClass: 'text-red-600' },
  { label: 'In Progress', value: 0, colorClass: 'text-yellow-600' },
  { label: 'Completed', value: 0, colorClass: 'text-green-600' }
])

const reportForm = ref({
  itemName: '',
  itemCode: '',
  location: '',
  description: '',
  priority: 'LOW',
  status: 'REPORTED',
  photos: [] as File[]
})

// Computed
const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchesSearch = !filters.value.search || 
      report.itemName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (report.itemCode && report.itemCode.toLowerCase().includes(filters.value.search.toLowerCase()))
    
    const matchesPriority = !filters.value.priority || report.priority === filters.value.priority
    const matchesStatus = !filters.value.status || report.status === filters.value.status
    const matchesLocation = !filters.value.location || 
      report.location.toLowerCase().includes(filters.value.location.toLowerCase())

    return matchesSearch && matchesPriority && matchesStatus && matchesLocation
  })
})

// Methods
const updateStats = () => {
  stats.value[0].value = reports.value.length
  stats.value[1].value = reports.value.filter(r => r.priority === 'CRITICAL').length
  stats.value[2].value = reports.value.filter(r => r.status === 'IN_PROGRESS').length
  stats.value[3].value = reports.value.filter(r => r.status === 'COMPLETED').length
}

const getStatusClass = (status: string) => {
  const classes = {
    'REPORTED': 'bg-gray-100 text-gray-800',
    'UNDER_REVIEW': 'bg-blue-100 text-blue-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase())
}

const openNewReportModal = () => {
  editingReport.value = null
  reportForm.value = {
    itemName: '',
    itemCode: '',
    location: '',
    description: '',
    priority: 'LOW',
    status: 'REPORTED',
    photos: []
  }
  showModal.value = true
}

const editReport = (report: any) => {
  editingReport.value = report
  reportForm.value = {
    ...report,
    photos: []
  }
  showModal.value = true
}

const viewDetails = (report: any) => {
  selectedReport.value = report
  showDetailsModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingReport.value = null
  reportForm.value.photos = []
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedReport.value = null
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    reportForm.value.photos = Array.from(input.files)
  }
}

const canEdit = (report: any) => {
  // Add your permission logic here
  return true
}

const saveReport = async () => {
  try {
    if (editingReport.value) {
      await damageReportStore.updateReport(editingReport.value.id, reportForm.value)
    } else {
      await damageReportStore.createReport(reportForm.value)
    }
    closeModal()
    await fetchReports()
  } catch (error) {
    console.error('Error saving report:', error)
  }
}

const fetchReports = async () => {
  try {
    await damageReportStore.fetchReports()
    updateStats()
  } catch (error) {
    console.error('Error fetching reports:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchReports()
})
</script>
