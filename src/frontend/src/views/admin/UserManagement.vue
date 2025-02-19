<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">User Management</h1>
      <p class="text-gray-600">Manage all users in the system</p>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4">
        <button 
          @click="showAddUserModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span class="material-icons text-xl">add</span>
          Add User
        </button>
        <div class="relative">
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Search users..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <span class="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
        </div>
        <select 
          v-model="roleFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
          <option value="COUNSELOR">Counselor</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-blue-100 text-blue-800': user.role === 'ADMIN',
                'bg-green-100 text-green-800': user.role === 'TEACHER',
                'bg-yellow-100 text-yellow-800': user.role === 'STUDENT',
                'bg-purple-100 text-purple-800': user.role === 'COUNSELOR'
              }">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-green-100 text-green-800': user.status === 'ACTIVE',
                'bg-red-100 text-red-800': user.status === 'INACTIVE'
              }">
                {{ user.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex gap-2">
                <button 
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button 
                  @click="toggleUserStatus(user)"
                  :class="{
                    'hover:text-red-900': user.status === 'ACTIVE',
                    'hover:text-green-900': user.status === 'INACTIVE',
                    'text-red-600': user.status === 'ACTIVE',
                    'text-green-600': user.status === 'INACTIVE'
                  }"
                >
                  {{ user.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddUserModal || editingUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
        <form @submit.prevent="handleUserSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text"
              v-model="userForm.name"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email"
              v-model="userForm.email"
              required
              :disabled="!!editingUser"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <select 
              v-model="userForm.role"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="COUNSELOR">Counselor</option>
            </select>
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password"
              v-model="userForm.password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button 
              type="button"
              @click="closeUserModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {{ editingUser ? 'Update' : 'Add' }} User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'COUNSELOR'
  status: 'ACTIVE' | 'INACTIVE'
}

const users = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref('')
const showAddUserModal = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({
  name: '',
  email: '',
  role: 'STUDENT' as User['role'],
  password: ''
})

// Fetch users
const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/admin/users', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

// Filter users based on search and role
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

// Edit user
const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    password: ''
  }
}

// Toggle user status
const toggleUserStatus = async (user: User) => {
  try {
    await axios.patch(`/api/admin/users/${user.id}/status`, {
      status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    }, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    await fetchUsers()
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

// Handle user form submission
const handleUserSubmit = async () => {
  try {
    if (editingUser.value) {
      await axios.put(`/api/admin/users/${editingUser.value.id}`, {
        name: userForm.value.name,
        role: userForm.value.role
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    } else {
      await axios.post('/api/admin/users', userForm.value, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    }
    await fetchUsers()
    closeUserModal()
  } catch (error) {
    console.error('Error submitting user form:', error)
  }
}

// Close user modal
const closeUserModal = () => {
  showAddUserModal.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    role: 'STUDENT',
    password: ''
  }
}

// Fetch users on component mount
fetchUsers()
</script>
