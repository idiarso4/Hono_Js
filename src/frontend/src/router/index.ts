import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import Login from '@/views/auth/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: { requiresAuth: true }
        },
        // Admin routes
        {
          path: 'admin',
          meta: { requiresAuth: true, role: 'ADMIN' },
          children: [
            {
              path: 'dashboard',
              name: 'admin-dashboard',
              component: () => import('@/views/admin/Dashboard.vue')
            },
            {
              path: 'users',
              name: 'userManagement',
              component: () => import('@/views/admin/UserManagement.vue'),
              meta: { requiresAuth: true, role: 'ADMIN' }
            },
            {
              path: 'backup',
              name: 'backup',
              component: () => import('@/views/admin/Backup.vue'),
              meta: { requiresAuth: true, role: 'ADMIN' }
            }
          ]
        },
        // Teacher routes
        {
          path: 'teacher',
          meta: { requiresAuth: true, role: 'TEACHER' },
          children: [
            {
              path: 'dashboard',
              name: 'teacher-dashboard',
              component: () => import('@/views/teacher/Dashboard.vue')
            },
            {
              path: 'attendance',
              name: 'teacherAttendance',
              component: () => import('@/views/teacher/Attendance.vue'),
              meta: { requiresAuth: true, role: 'TEACHER' }
            },
            {
              path: 'journal',
              name: 'teacherJournal',
              component: () => import('@/views/teacher/TeacherJournal.vue'),
              meta: { requiresAuth: true, role: 'TEACHER' }
            },
            {
              path: 'students',
              name: 'studentManagement',
              component: () => import('@/views/teacher/StudentManagement.vue'),
              meta: { requiresAuth: true, role: 'TEACHER' }
            }
          ]
        },
        // Student routes
        {
          path: 'student',
          meta: { requiresAuth: true, role: 'STUDENT' },
          children: [
            {
              path: 'dashboard',
              name: 'student-dashboard',
              component: () => import('@/views/student/Dashboard.vue')
            },
            {
              path: 'attendance',
              name: 'studentAttendance',
              component: () => import('@/views/student/Attendance.vue'),
              meta: { requiresAuth: true, role: 'STUDENT' }
            },
            {
              path: 'journal',
              name: 'pklJournal',
              component: () => import('@/views/student/PKLJournal.vue'),
              meta: { requiresAuth: true, role: 'STUDENT' }
            },
            {
              path: 'extracurricular',
              name: 'extracurricular',
              component: () => import('@/views/student/Extracurricular.vue'),
              meta: { requiresAuth: true, role: 'STUDENT' }
            }
          ]
        },
        // Counselor routes
        {
          path: 'counselor',
          meta: { requiresAuth: true, role: 'COUNSELOR' },
          children: [
            {
              path: 'dashboard',
              name: 'counselor-dashboard',
              component: () => import('@/views/counselor/Dashboard.vue')
            },
            {
              path: 'home-visits',
              name: 'homeVisits',
              component: () => import('@/views/counselor/HomeVisit.vue'),
              meta: { requiresAuth: true, role: 'COUNSELOR' }
            },
            {
              path: 'counseling',
              name: 'counseling',
              component: () => import('@/views/counselor/Counseling.vue'),
              meta: { requiresAuth: true, role: 'COUNSELOR' }
            },
            {
              path: 'reports',
              name: 'counselorReports',
              component: () => import('@/views/counselor/Reports.vue'),
              meta: { requiresAuth: true, role: 'COUNSELOR' }
            }
          ]
        },
        // Common routes
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/Profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'prayer',
          name: 'prayer',
          component: () => import('@/views/prayer/PrayerTimes.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'inventory/report',
          name: 'damageReport',
          component: () => import('@/views/inventory/DamageReport.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.matched.find(record => record.meta.role)?.meta.role

  if (requiresAuth) {
    const isAuthenticated = await authStore.checkAuth()
    if (!isAuthenticated) {
      next({ name: 'login' })
      return
    }

    if (requiredRole && !authStore.hasRole(requiredRole)) {
      next({ name: 'home' })
      return
    }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
