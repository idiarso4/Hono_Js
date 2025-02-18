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
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
                  <div class="text-sm font-medium text-gray-900">{{ visit.studentName }}</div>
                  <div class="text-sm text-gray-500">{{ visit.studentId }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(visit.scheduledDate) }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ visit.purpose }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': visit.status === 'completed',
                  'bg-yellow-100 text-yellow-800': visit.status === 'planned',
                  'bg-red-100 text-red-800': visit.status === 'cancelled'
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
                  v-model="visitForm.studentName"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Date</label>
                <input
                  v-model="visitForm.scheduledDate"
                  type="date"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Purpose</label>
                <textarea
                  v-model="visitForm.purpose"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="visitForm.status"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
import dayjs from 'dayjs'

const homeVisitStore = useHomeVisitStore()
const { visits } = storeToRefs(homeVisitStore)

// Search and filter states
const searchQuery = ref('')
const dateRange = ref({
  start: '',
  end: ''
})
const filterStatus = ref('')

// Modal states
const showModal = ref(false)
const editingVisit = ref(null)
const visitForm = ref({
  studentName: '',
  studentId: '',
  scheduledDate: '',
  purpose: '',
  status: 'planned'
})

// Computed properties
const filteredVisits = computed(() => {
  return visits.value.filter(visit => {
    const matchesSearch = searchQuery.value
      ? visit.studentName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        visit.studentId.includes(searchQuery.value)
      : true

    const matchesStatus = filterStatus.value
      ? visit.status === filterStatus.value
      : true

    const matchesDate = dateRange.value.start
      ? dayjs(visit.scheduledDate).isAfter(dateRange.value.start)
      : true

    return matchesSearch && matchesStatus && matchesDate
  })
})

// Methods
const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY')
}

const openNewVisitModal = () => {
  editingVisit.value = null
  visitForm.value = {
    studentName: '',
    studentId: '',
    scheduledDate: '',
    purpose: '',
    status: 'planned'
  }
  showModal.value = true
}

const editVisit = (visit: any) => {
  editingVisit.value = visit
  visitForm.value = { ...visit }
  showModal.value = true
}

const viewDetails = (visit: any) => {
  // Implement view details logic
  console.log('Viewing details for visit:', visit)
}

const closeModal = () => {
  showModal.value = false
  editingVisit.value = null
}

const saveVisit = async () => {
  try {
    if (editingVisit.value) {
      await homeVisitStore.updateVisit({
        ...visitForm.value,
        id: editingVisit.value.id
      })
    } else {
      await homeVisitStore.createVisit(visitForm.value)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving visit:', error)
    // Implement error handling
  }
}
</script>
