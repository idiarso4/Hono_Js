<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="layout" v-if="isAuthenticated">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
  <router-view v-else />
</template>

<style scoped>
.layout {
  @apply min-h-screen bg-gray-50;
}

.main-content {
  @apply ml-64 p-8;
}
</style>
