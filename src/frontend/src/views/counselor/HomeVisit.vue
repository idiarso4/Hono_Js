<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Home Visit Management</h1>
      <p class="text-gray-600">Manage and track home visits for students</p>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Search Student</label>
          <input
            v-model="searchQuery"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter student name or ID"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Date Range</label>
          <input
            v-model="dateRange.start"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select
            v-model="filterStatus"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6">
      <button
        @click="openNewVisitModal"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Schedule New Visit
      </button>
    </div>

    <!-- Visits Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="visit in filteredVisits" :key="visit.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ visit.student.name }}</div>
                  <div class="text-sm text-gray-500">{{ visit.studentId }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(visit.date) }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ visit.purpose }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': visit.status === 'COMPLETED',
                  'bg-yellow-100 text-yellow-800': visit.status === 'PLANNED',
                  'bg-red-100 text-red-800': visit.status === 'CANCELLED',
                  'bg-blue-100 text-blue-800': visit.status === 'RESCHEDULED'
                }"
              >
                {{ visit.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editVisit(visit)"
                class="text-indigo-600 hover:text-indigo-900 mr-2"
              >Edit</button>
              <button
                @click="viewDetails(visit)"
                class="text-green-600 hover:text-green-900"
              >View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New/Edit Visit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            {{ editingVisit ? 'Edit Home Visit' : 'Schedule New Home Visit' }}
          </h3>
          <div class="mt-2">
            <form @submit.prevent="saveVisit">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Student</label>
                <input
                  v-model="currentVisit.studentId"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Date</label>
                <input
                  v-model="currentVisit.date"
                  type="date"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Purpose</label>
                <textarea
                  v-model="currentVisit.purpose"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Parent Name</label>
                <input
                  v-model="currentVisit.parentName"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  v-model="currentVisit.address"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Findings</label>
                <textarea
                  v-model="currentVisit.findings"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Recommendations</label>
                <textarea
                  v-model="currentVisit.recommendations"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                ></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Follow-up Actions</label>
                <textarea
                  v-model="currentVisit.followUpActions"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                ></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="currentVisit.status"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="PLANNED">Planned</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHomeVisitStore } from '@/stores/homeVisit'
import { storeToRefs } from 'pinia'
import type { HomeVisit } from '@/stores/homeVisit'
import dayjs from 'dayjs'

interface VisitFormData {
  studentId: string
  date: string
  purpose: string
  parentName: string
  address: string
  findings: string
  recommendations: string
  followUpActions: string
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
}

const homeVisitStore = useHomeVisitStore()
const { visits } = storeToRefs(homeVisitStore)

const currentVisit = ref<VisitFormData>({
  studentId: '',
  date: '',
  purpose: '',
  parentName: '',
  address: '',
  findings: '',
  recommendations: '',
  followUpActions: '',
  status: 'PLANNED'
})

const selectedPhotos = ref<Array<{ file: File; preview: string }>>([])
const selectedDocuments = ref<Array<File>>([])

const showModal = ref(false)
const editingVisit = ref<HomeVisit | null>(null)

const searchQuery = ref('')
const dateRange = ref({ start: '' })
const filterStatus = ref<HomeVisit['status'] | ''>('')

const filteredVisits = computed(() => {
  return visits.value.filter((visit: HomeVisit) => {
    const matchesSearch = searchQuery.value
      ? visit.student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        visit.studentId.includes(searchQuery.value)
      : true

    const matchesStatus = filterStatus.value
      ? visit.status === filterStatus.value
      : true

    const matchesDate = dateRange.value.start
      ? dayjs(visit.date).isAfter(dateRange.value.start)
      : true

    return matchesSearch && matchesStatus && matchesDate
  })
})

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const openNewVisitModal = () => {
  editingVisit.value = null
  currentVisit.value = {
    studentId: '',
    date: '',
    purpose: '',
    parentName: '',
    address: '',
    findings: '',
    recommendations: '',
    followUpActions: '',
    status: 'PLANNED'
  }
  showModal.value = true
}

const editVisit = (visit: HomeVisit) => {
  editingVisit.value = visit
  currentVisit.value = {
    studentId: visit.studentId,
    date: visit.date,
    purpose: visit.purpose,
    parentName: visit.parentName,
    address: visit.address,
    findings: visit.findings,
    recommendations: visit.recommendations || '',
    followUpActions: visit.followUpActions || '',
    status: visit.status
  }
  showModal.value = true
}

const viewDetails = (visit: HomeVisit) => {
  console.log('Viewing details for visit:', visit)
}

const closeModal = () => {
  showModal.value = false
  editingVisit.value = null
  selectedPhotos.value = []
  selectedDocuments.value = []
}

const saveVisit = async () => {
  const formData = new FormData()
  
  formData.append('visitData', JSON.stringify(currentVisit.value))
  
  selectedPhotos.value.forEach((photo, index) => {
    formData.append(`photos[${index}]`, photo.file)
  })
  
  selectedDocuments.value.forEach((doc, index) => {
    formData.append(`documents[${index}]`, doc)
  })
  
  try {
    if (editingVisit.value) {
      await homeVisitStore.updateVisit(editingVisit.value.id, formData)
    } else {
      await homeVisitStore.createVisit(formData)
    }
    
    closeModal()
  } catch (error) {
    console.error('Failed to save visit:', error)
  }
}
</script>
