<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">Daftar sebagai Siswa</h2>
      
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="name">Nama Lengkap</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div class="form-group">
          <label for="nis">NIS</label>
          <input
            id="nis"
            v-model="form.nis"
            type="text"
            required
            placeholder="Masukkan NIS"
          />
        </div>

        <div class="form-group">
          <label for="class">Kelas</label>
          <input
            id="class"
            v-model="form.class"
            type="text"
            required
            placeholder="Contoh: XII IPA 1"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Masukkan email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Masukkan password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Konfirmasi Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            placeholder="Masukkan ulang password"
          />
        </div>

        <button type="submit" :disabled="loading || !isFormValid" class="submit-button">
          {{ loading ? 'Mendaftar...' : 'Daftar' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="login-link">
        Sudah punya akun? <router-link to="/login">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  name: '',
  nis: '',
  class: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const loading = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.nis &&
    form.value.class &&
    form.value.email &&
    form.value.password &&
    form.value.password === form.value.confirmPassword
  )
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Mohon lengkapi semua field dan pastikan password cocok'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const { confirmPassword, ...registerData } = form.value
    await auth.registerStudent(registerData)
    
    router.push('/login')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Terjadi kesalahan saat mendaftar'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 2rem;
}

.register-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #666;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.submit-button:hover {
  background-color: #45a049;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  text-align: center;
  margin-top: 1rem;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
