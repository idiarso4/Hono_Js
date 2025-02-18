import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/counselor/home-visits',
      name: 'homeVisits',
      component: () => import('../views/counselor/HomeVisit.vue'),
      meta: { requiresAuth: true, role: 'counselor' }
    },
    {
      path: '/inventory/damage-reports',
      name: 'damageReports',
      component: () => import('../views/inventory/DamageReport.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'adminDashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    }
  ],
})

export default router
